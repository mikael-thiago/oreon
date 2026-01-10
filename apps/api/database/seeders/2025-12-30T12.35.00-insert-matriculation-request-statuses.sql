INSERT INTO "matriculation_request_statuses" ("name", "slug") VALUES
	('Em Andamento', 'em-andamento'),
	('Aprovada', 'aprovada'),
	('Cancelada', 'cancelada'),
	('Aguardando Pagamento', 'aguardando-pagamento');

-- DOWN

DELETE FROM matriculation_request_statuses;