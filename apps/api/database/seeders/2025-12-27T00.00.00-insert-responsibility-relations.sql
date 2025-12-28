-- UP
-- Insert responsibility relations
INSERT INTO responsibility_relations (name, slug)
VALUES
  ('Mãe', 'mae'),
  ('Pai', 'pai'),
  ('Avó', 'ava'),
  ('Avô', 'avo'),
  ('Tio', 'tio'),
  ('Tia', 'tia'),
  ('Irmão', 'irmao'),
  ('Irmã', 'irma'),
  ('Outro', 'outro')
ON CONFLICT (slug) DO NOTHING;

-- DOWN
-- Delete all responsibility relations
DELETE FROM responsibility_relations WHERE slug IN ('mae', 'pai', 'ava', 'avo', 'tio', 'tia', 'irmao', 'irma', 'outro');
