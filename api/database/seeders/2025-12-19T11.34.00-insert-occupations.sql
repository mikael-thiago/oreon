INSERT INTO occupations (name, can_teach)
    VALUES ('Diretor', false),
        ('Coordenador', false),
        ('Secretário', false),
        ('Serviços Gerais', false),
        ('Porteiro', false),
        ('Professor', true);

-- DOWN
TRUNCATE TABLE occupations;