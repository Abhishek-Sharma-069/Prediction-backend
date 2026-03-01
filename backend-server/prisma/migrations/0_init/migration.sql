-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "alert_levels" (
    "id" BIGSERIAL NOT NULL,
    "level_name" VARCHAR(100),
    "severity_rank" INTEGER,

    CONSTRAINT "alert_levels_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "alerts" (
    "id" BIGSERIAL NOT NULL,
    "region_id" BIGINT,
    "prediction_id" BIGINT,
    "alert_level_id" BIGINT,
    "message" TEXT,
    "issued_at" TIMESTAMP(6),
    "expires_at" TIMESTAMP(6),
    "status" VARCHAR(50),

    CONSTRAINT "alerts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "disaster_types" (
    "id" BIGSERIAL NOT NULL,
    "name" VARCHAR(100),
    "category" VARCHAR(100),
    "severity_scale_definition" TEXT,

    CONSTRAINT "disaster_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "models" (
    "id" BIGSERIAL NOT NULL,
    "name" VARCHAR(150),
    "algorithm" VARCHAR(150),
    "version" VARCHAR(100),
    "training_accuracy" DOUBLE PRECISION,
    "training_date" DATE,
    "artifact_path" TEXT,

    CONSTRAINT "models_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "predictions" (
    "id" BIGSERIAL NOT NULL,
    "region_id" BIGINT,
    "disaster_type_id" BIGINT,
    "model_id" BIGINT,
    "predicted_probability" DOUBLE PRECISION,
    "predicted_severity" DOUBLE PRECISION,
    "risk_score" DOUBLE PRECISION,
    "generated_at" TIMESTAMP(6),
    "input_snapshot" JSONB,

    CONSTRAINT "predictions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "regions" (
    "id" BIGSERIAL NOT NULL,
    "name" VARCHAR(150),
    "type" VARCHAR(100),
    "population" BIGINT,
    "risk_zone_level" INTEGER,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "regions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roles" (
    "id" BIGSERIAL NOT NULL,
    "role_name" VARCHAR(100),
    "description" TEXT,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sensor_readings" (
    "id" BIGSERIAL NOT NULL,
    "sensor_id" BIGINT,
    "reading_value" DOUBLE PRECISION,
    "unit" VARCHAR(50),
    "recorded_at" TIMESTAMP(6),
    "quality_score" INTEGER,
    "raw_payload" JSONB,

    CONSTRAINT "sensor_readings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sensor_types" (
    "id" BIGSERIAL NOT NULL,
    "name" VARCHAR(100),
    "description" TEXT,

    CONSTRAINT "sensor_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sensors" (
    "id" BIGSERIAL NOT NULL,
    "sensor_code" VARCHAR(100),
    "sensor_type_id" BIGINT,
    "region_id" BIGINT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "installation_date" DATE,
    "status" VARCHAR(50),
    "last_maintenance" DATE,

    CONSTRAINT "sensors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_roles" (
    "user_id" BIGINT NOT NULL,
    "role_id" BIGINT NOT NULL,

    CONSTRAINT "user_roles_pkey" PRIMARY KEY ("user_id","role_id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" BIGSERIAL NOT NULL,
    "name" VARCHAR(150),
    "email" VARCHAR(150),
    "mobile" VARCHAR(20),
    "otp" VARCHAR(20),
    "region_id" BIGINT,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "status" VARCHAR(50),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "alerts" ADD CONSTRAINT "alerts_level_fk" FOREIGN KEY ("alert_level_id") REFERENCES "alert_levels"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "alerts" ADD CONSTRAINT "alerts_prediction_fk" FOREIGN KEY ("prediction_id") REFERENCES "predictions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "alerts" ADD CONSTRAINT "alerts_region_fk" FOREIGN KEY ("region_id") REFERENCES "regions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "predictions" ADD CONSTRAINT "predictions_disaster_type_fk" FOREIGN KEY ("disaster_type_id") REFERENCES "disaster_types"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "predictions" ADD CONSTRAINT "predictions_model_fk" FOREIGN KEY ("model_id") REFERENCES "models"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "predictions" ADD CONSTRAINT "predictions_region_fk" FOREIGN KEY ("region_id") REFERENCES "regions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "sensor_readings" ADD CONSTRAINT "sensor_readings_sensor_fk" FOREIGN KEY ("sensor_id") REFERENCES "sensors"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "sensors" ADD CONSTRAINT "sensors_region_fk" FOREIGN KEY ("region_id") REFERENCES "regions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "sensors" ADD CONSTRAINT "sensors_sensor_type_fk" FOREIGN KEY ("sensor_type_id") REFERENCES "sensor_types"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_role_fk" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_user_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_region_fk" FOREIGN KEY ("region_id") REFERENCES "regions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

