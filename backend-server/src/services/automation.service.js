import config from '../config/config.js';
import { prisma } from '../lib/db.js';
import * as regionService from './region.service.js';
import * as automationRulesService from './automation-rules.service.js';
import * as weatherService from './weather.service.js';
import * as modelService from './model.service.js';
import * as predictionService from './prediction.service.js';
import * as alertService from './alert.service.js';

/**
 * Build alert message from template. Placeholders: {region_name}, {value}, {probability_field}.
 */
function formatMessage(template, { region_name, value, probability_field }) {
  if (!template || typeof template !== 'string') return `Alert: probability ${value} for ${probability_field} in ${region_name}.`;
  return template
    .replace(/\{region_name\}/g, String(region_name ?? ''))
    .replace(/\{value\}/g, String(value ?? ''))
    .replace(/\{probability_field\}/g, String(probability_field ?? ''));
}

/**
 * Run one automation cycle: for each auto-predict region, fetch weather → ML prediction → evaluate rules → create predictions and alerts (and send SMS when rule says so).
 * @returns {{ regionsProcessed: number, predictionsCreated: number, alertsCreated: number, errors: string[] }}
 */
export async function runAutomationJob() {
  const result = { regionsProcessed: 0, predictionsCreated: 0, alertsCreated: 0, errors: [] };

  const regions = await regionService.findAutoPredictRegions();
  const rules = await automationRulesService.findActiveRules();
  if (regions.length === 0) return result;
  if (rules.length === 0) {
    result.errors.push('No active alert automation rules');
    return result;
  }

  for (const region of regions) {
    const lat = region.latitude != null ? Number(region.latitude) : null;
    const lon = region.longitude != null ? Number(region.longitude) : null;
    if (lat == null || lon == null) continue;

    try {
      const weather = await weatherService.fetchCurrentWeather({
        latitude: lat,
        longitude: lon,
        timezone: region.timezone || 'auto',
      });
      const features = weatherService.weatherToMlFeatures(weather);
      const mlResponse = await modelService.predictWithMlServiceByValues({ rows: [features], probabilities: true });
      const rows = mlResponse?.rows ?? [];
      if (rows.length === 0) continue;

      result.regionsProcessed += 1;
      const mlRow = rows[0];
      const regionId = region.id;
      const regionName = region.name ?? 'Unknown';

      // Store prediction
      const prediction = await predictionService.create({
        region_id: regionId,
        predicted_probability:
          mlRow.Flood_Probability != null || mlRow.Cyclone_Probability != null
            ? Math.max(Number(mlRow.Flood_Probability) || 0, Number(mlRow.Cyclone_Probability) || 0)
            : null,
        generated_at: new Date().toISOString(),
        input_snapshot: mlRow,
      });
      result.predictionsCreated += 1;
      const predictionId = prediction.id;

      // Avoid duplicate alerts: skip if this region already had an alert in the last N ms
      const dedupeMs = config.automationDedupeMs || 30 * 60 * 1000;
      const since = new Date(Date.now() - dedupeMs);
      const recentAlert = await prisma.alerts.findFirst({
        where: { region_id: BigInt(regionId), issued_at: { gte: since } },
      });
      if (recentAlert) continue;

      // Evaluate rules and create alerts
      for (const rule of rules) {
        const rawValue = mlRow[rule.probability_field];
        const value = rawValue != null ? Number(rawValue) : null;
        if (value == null || value < Number(rule.threshold_min)) continue;

        const message = formatMessage(rule.message_template, {
          region_name: regionName,
          value,
          probability_field: rule.probability_field,
        });
        await alertService.create(
          {
            region_id: regionId,
            prediction_id: predictionId,
            alert_level_id: rule.alert_level_id,
            message,
            issued_at: new Date().toISOString(),
            status: 'active',
          },
          { skipNotify: true },
        );
        result.alertsCreated += 1;

        // Notify users in the affected region (channels from env: AUTOMATION_ALERT_SMS, AUTOMATION_ALERT_EMAIL)
        if (rule.send_sms) {
          try {
            await alertService.notifyUsersInRegion(regionId, message, {
              sendSms: config.automationAlertSms,
              sendEmail: config.automationAlertEmail,
            });
          } catch (err) {
            result.errors.push(`Notify region ${regionId}: ${err.message}`);
          }
        }
      }
    } catch (err) {
      result.errors.push(`Region ${region.id} (${region.name}): ${err.message}`);
    }
  }

  return result;
}
