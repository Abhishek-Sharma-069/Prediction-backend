-- AlterTable
ALTER TABLE "regions" ADD COLUMN     "auto_predict_enabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "latitude" DOUBLE PRECISION,
ADD COLUMN     "longitude" DOUBLE PRECISION,
ADD COLUMN     "timezone" VARCHAR(100);

-- CreateTable
CREATE TABLE "alert_automation_rules" (
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

-- AddForeignKey
ALTER TABLE "alert_automation_rules" ADD CONSTRAINT "alert_automation_rules_alert_level_fk" FOREIGN KEY ("alert_level_id") REFERENCES "alert_levels"("id") ON DELETE SET NULL ON UPDATE NO ACTION;
