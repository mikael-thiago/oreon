-- Enums
CREATE TYPE "public"."shifts" AS ENUM('day', 'afternoom', 'night');
CREATE TYPE "public"."status_contract" AS ENUM('active', 'unactive');
CREATE TYPE "public"."sex_enum" AS ENUM('male', 'female');

-- DOWN
DROP TYPE IF EXISTS "public"."sex_enum";
DROP TYPE IF EXISTS "public"."status_contract";
DROP TYPE IF EXISTS "public"."shifts";
