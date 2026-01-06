CREATE SEQUENCE "public"."onboarding_request_id" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1;--> statement-breakpoint
CREATE TABLE "command_outbox" (
	"id" serial PRIMARY KEY NOT NULL,
	"type" text NOT NULL,
	"destination_bounded_context" text NOT NULL,
	"payload" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"processed_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "eventstore" (
	"id" serial PRIMARY KEY NOT NULL,
	"aggregate_id" bigint NOT NULL,
	"type" text NOT NULL,
	"payload" jsonb NOT NULL,
	"occurred_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "event_outbox" (
	"id" serial PRIMARY KEY NOT NULL,
	"aggregate_id" bigint NOT NULL,
	"type" text NOT NULL,
	"payload" jsonb NOT NULL,
	"occurred_at" timestamp with time zone DEFAULT now() NOT NULL,
	"processed_at" timestamp with time zone
);
--> statement-breakpoint
CREATE INDEX "idx_onboarding_manager_events_aggregate_id" ON "eventstore" USING btree ("aggregate_id");