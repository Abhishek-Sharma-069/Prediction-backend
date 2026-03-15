-- CreateTable (idempotent: only if table is missing)
CREATE TABLE IF NOT EXISTS "alert_automation_rules" (
    "id" BIGSERIAL NOT NULL,
    "name" VARCHAR(200),
    "probability_field" VARCHAR(100) NOT NULL,
    "threshold_min" DECIMAL(5,4) NOT NULL,
    "alert_level_id" BIGINT,
    "send_sms" BOOLEAN NOT NULL DEFAULT true,
    "message_template" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "alert_automation_rules_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey (only if constraint does not exist)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'alert_automation_rules_alert_level_fk'
  ) THEN
    ALTER TABLE "alert_automation_rules" ADD CONSTRAINT "alert_automation_rules_alert_level_fk" FOREIGN KEY ("alert_level_id") REFERENCES "alert_levels"("id") ON DELETE SET NULL ON UPDATE NO ACTION;
  END IF;
END $$;
