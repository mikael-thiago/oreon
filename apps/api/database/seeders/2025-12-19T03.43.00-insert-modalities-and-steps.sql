-- UP
-- Insert modalities
INSERT INTO modalities (id, name)
VALUES
  (1, 'Ensino Infantil'),
  (2, 'Ensino Fundamental'),
  (3, 'Ensino Médio')
ON CONFLICT (id) DO NOTHING;

-- Insert Ensino Infantil steps
INSERT INTO steps (sort_order, name, modality_id)
VALUES
  (1, '1º Ano', 1),
  (2, '2º Ano', 1),
  (3, '3º Ano', 1)
ON CONFLICT DO NOTHING;

-- Insert Ensino Fundamental steps
INSERT INTO steps (sort_order, name, modality_id)
VALUES
  (1, '1º Ano', 2),
  (2, '2º Ano', 2),
  (3, '3º Ano', 2),
  (4, '4º Ano', 2),
  (5, '5º Ano', 2),
  (6, '6º Ano', 2),
  (7, '7º Ano', 2),
  (8, '8º Ano', 2),
  (9, '9º Ano', 2)
ON CONFLICT DO NOTHING;

-- Insert Ensino Médio steps
INSERT INTO steps (sort_order, name, modality_id)
VALUES
  (1, '1ª Série', 3),
  (2, '2ª Série', 3),
  (3, '3ª Série', 3)
ON CONFLICT DO NOTHING;

-- DOWN
-- Delete in reverse order due to foreign key constraints
DELETE FROM steps WHERE modality_id IN (1, 2, 3);
DELETE FROM modalities WHERE id IN (1, 2, 3);
