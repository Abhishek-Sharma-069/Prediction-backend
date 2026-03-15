import config from '../config/config.js';
import * as automationService from '../services/automation.service.js';
import * as automationRulesService from '../services/automation-rules.service.js';

/** GET /api/automation/config - Public config for automation (alert channels from env). */
export async function getConfig(req, res, next) {
  try {
    res.json({
      automationAlertSms: config.automationAlertSms,
      automationAlertEmail: config.automationAlertEmail,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/automation/run - Run one automation cycle manually (weather → ML → rules → alerts/SMS).
 */
export async function runJob(req, res, next) {
  try {
    const result = await automationService.runAutomationJob();
    res.json({
      message: 'Automation run completed',
      ...result,
    });
  } catch (err) {
    next(err);
  }
}

/** GET /api/automation/rules - List automation rules (query active_only=false for all). */
export async function getRules(req, res, next) {
  try {
    const activeOnly = req.query.active_only !== 'false';
    const data = await automationRulesService.findAll(activeOnly);
    res.json({ data });
  } catch (err) {
    next(err);
  }
}

/** GET /api/automation/rules/:id */
export async function getRuleById(req, res, next) {
  try {
    const data = await automationRulesService.findById(req.params.id);
    if (!data) return res.status(404).json({ error: 'Rule not found' });
    res.json({ data });
  } catch (err) {
    next(err);
  }
}

/** POST /api/automation/rules */
export async function createRule(req, res, next) {
  try {
    const data = await automationRulesService.create(req.body);
    res.status(201).json({ data });
  } catch (err) {
    next(err);
  }
}

/** PUT /api/automation/rules/:id */
export async function updateRule(req, res, next) {
  try {
    const data = await automationRulesService.update(req.params.id, req.body);
    res.json({ data });
  } catch (err) {
    next(err);
  }
}

/** DELETE /api/automation/rules/:id */
export async function deleteRule(req, res, next) {
  try {
    await automationRulesService.remove(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
