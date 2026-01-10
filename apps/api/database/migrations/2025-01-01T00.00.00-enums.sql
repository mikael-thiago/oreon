-- Enums
CREATE TYPE "public"."gender_enum" AS ENUM('male', 'female');
CREATE TYPE "public"."shifts" AS ENUM('day', 'afternoom', 'night');
CREATE TYPE "public"."status_contract" AS ENUM('active', 'unactive');

-- DOWN
DROP TYPE IF EXISTS "public"."status_contract";
DROP TYPE IF EXISTS "public"."shifts";
DROP TYPE IF EXISTS "public"."gender_enum";
