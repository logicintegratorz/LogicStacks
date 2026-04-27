-- 014_issue_person_name.sql
-- Add person_name to issue_details and make department_id nullable

ALTER TABLE issue_details ADD COLUMN person_name VARCHAR(150);

ALTER TABLE issue_details ALTER COLUMN department_id DROP NOT NULL;
