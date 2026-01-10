CREATE INDEX "matriculations_unit_id_school_period_id_idx" ON "matriculations" USING btree ("unit_id","school_period_id");--> statement-breakpoint
CREATE INDEX "matriculations_student_id_idx" ON "matriculations" USING btree ("student_id");--> statement-breakpoint
CREATE INDEX "matriculation_requests_unit_id_school_period_id_idx" ON "matriculation_requests" USING btree ("unit_id","school_period_id");--> statement-breakpoint
CREATE INDEX "matriculation_requests_status_id_idx" ON "matriculation_requests" USING btree ("status_id");--> statement-breakpoint
CREATE INDEX "matriculation_requests_student_id_idx" ON "matriculation_requests" USING btree ("student_id");--> statement-breakpoint
CREATE INDEX "matriculation_requests_step_id_idx" ON "matriculation_requests" USING btree ("step_id");--> statement-breakpoint
ALTER TABLE "responsibility_relations" ADD CONSTRAINT "responsibility_relations_slug_unique" UNIQUE("slug");