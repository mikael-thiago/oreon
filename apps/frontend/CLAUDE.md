# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Visão Geral do Projeto

Frontend de um sistema de gestão escolar (Oreon) construído com React, TypeScript e ferramentas modernas. A aplicação gerencia instituições de ensino com múltiplas unidades, bases curriculares, anos letivos e turmas.

## Comandos

### Desenvolvimento
```bash
npm run dev          # Iniciar servidor de desenvolvimento com Vite
npm run build        # Compilação TypeScript + build Vite
npm run lint         # Executar ESLint
npm run preview      # Visualizar build de produção
```

### API Backend
O frontend conecta a uma API backend em `http://localhost:4000`. O backend está localizado no diretório `../api`.

## Arquitetura

### Stack Tecnológica
- **React 19.2** com TypeScript 5.9
- **TanStack Router 1.139** - Roteamento com navegação type-safe
- **TanStack Query 5.90** - Gerenciamento de estado do servidor e cache
- **React Hook Form 7.67 + Zod 4.1** - Manipulação de formulários e validação
- **Tailwind CSS 4.1 + Radix UI** - Estilização e componentes acessíveis
- **Zustand 5.0** - Gerenciamento de estado do cliente
- **Vite** (rolldown-vite) - Ferramenta de build

### Estrutura de Módulos

```
src/
├── modules/
│   ├── auth/           # Módulo de autenticação
│   │   ├── context/    # AuthContext para estado de auth
│   │   ├── guards/     # Guards de rota (logged/unlogged)
│   │   ├── pages/      # Página de login
│   │   └── services/   # Chamadas de API de autenticação
│   ├── core/           # Lógica de negócio principal
│   │   ├── pages/      # Páginas de funcionalidades
│   │   ├── queries/    # Opções do TanStack Query
│   │   ├── schemas/    # Schemas de validação Zod
│   │   └── services/   # Abstrações de serviços de API
│   └── shared/         # Utilitários compartilhados
│       ├── context/    # SessionContext para estado da aplicação
│       ├── types/      # Tipos TypeScript
│       └── utils/      # Funções auxiliares
├── components/ui/      # Componentes Radix UI (shadcn/ui)
├── layouts/           # Componentes de layout
└── routes.tsx         # Configuração de rotas
```

### Padrões Arquiteturais Chave

#### 1. Gerenciamento de Estado Baseado em Contexto

**AuthContext** (`modules/auth/context/auth-context.tsx`):
- Gerencia estado de autenticação: `"checking" | "logado" | "deslogado"`
- Provê métodos `login()` e `logout()`
- Envolvido no nível raiz da aplicação

**SessionContext** (`modules/shared/context/session-context.tsx`):
- Gerencia dados de sessão do usuário: `unidadeId`, `anoLetivoId`
- Persistido no localStorage com chave "session-state"
- Usado em toda aplicação para filtrar dados por unidade escolar e ano letivo

#### 2. Padrão de Camada de Serviço

Toda integração com backend possui uma interface de serviço tipada:

```typescript
// Exemplo: src/modules/core/services/ano-letivo-service.ts
export interface IAnoLetivoService {
  obterAnosLetivos(): Promise<AnoLetivoResponse[]>;
  cadastrar(data: CadastrarAnoLetivoRequest): Promise<void>;
}

export class AnoLetivoService implements IAnoLetivoService {
  // Implementação com chamadas fetch
}

export const anoLetivoService: IAnoLetivoService = new AnoLetivoService();
```

- Todos os serviços usam a API `fetch` com `credentials: "include"` para cookies
- Serviços lançam erros JSON parseados em caso de falha para tratamento consistente de erros

#### 3. Padrão de Query Options

TanStack Query usa opções de query centralizadas:

```typescript
// Exemplo: src/modules/core/queries/listar-turmas-query-options.ts
export const listarTurmasQueryOptions = (
  unidadeId: number | null,
  anoLetivoId: number | null
) =>
  queryOptions({
    queryKey: ["turmas", unidadeId, anoLetivoId],
    queryFn: () => turmaService.listarTurmas(unidadeId, anoLetivoId),
    enabled: !!unidadeId && !!anoLetivoId,
  });
```

- Query keys incluem todos os parâmetros para invalidação adequada do cache
- Use `enabled` para executar queries condicionalmente baseado no contexto necessário

#### 4. Padrão de Validação de Formulários

Formulários usam React Hook Form + Zod com tratamento padronizado de erros:

```typescript
// 1. Criar schema Zod em schemas/
export const cadastrarTurmaSchema = z.object({
  letra: z.string().length(1),
  // ...
});

// 2. Usar no componente com zodResolver
const { register, handleSubmit, formState: { errors } } = useForm({
  resolver: zodResolver(cadastrarTurmaSchema),
});

// 3. Tratar erros de validação da API
useMutation({
  onError: (error) => {
    setFormValidationErrors(error, setError);
  }
});
```

O utilitário `setFormValidationErrors` (`modules/shared/utils/api-error.ts`) mapeia automaticamente erros de validação do backend para campos do formulário.

#### 5. Configuração de Rotas

Rotas são definidas em `routes.tsx` usando TanStack Router:

```typescript
const mainLayoutRoute = createRoute({
  id: "main",
  getParentRoute: () => rootRoute,
  component: MainLayout,
  beforeLoad: loggedGuard,  // Proteger rotas autenticadas
});

const featureRoute = createRoute({
  getParentRoute: () => mainLayoutRoute,
  path: "/feature",
  component: FeatureComponent,
});
```

- `loggedGuard`: Requer autenticação, redireciona para `/login`
- `unloggedGuard`: Impede usuários autenticados de acessar (ex: página de login)
- Todas as rotas autenticadas são filhas de `mainLayoutRoute`

#### 6. Padrão de Componente de Página

A maioria das páginas CRUD seguem esta estrutura:

```typescript
export function ListarEntidade() {
  // 1. Obter dados do contexto
  const { unidadeId, anoLetivoId } = useSessionContext();

  // 2. Buscar dados com query
  const { data, isPending } = useQuery(queryOptions(unidadeId));

  // 3. Guard: Verificar contexto necessário
  if (!unidadeId) {
    return <AlertMessage />;
  }

  // 4. Estado de carregamento
  if (isPending) {
    return <Skeleton />;
  }

  // 5. Estado vazio ou exibição de dados
  return data.length === 0 ? <EmptyState /> : <DataList />;
}
```

Páginas de Criar/Editar:
```typescript
export function CadastrarEntidade() {
  const { unidadeId } = useSessionContext();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Configuração do formulário
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  });

  // Configuração da mutation
  const { mutate, isPending, error } = useMutation({
    mutationFn: (data) => service.cadastrar(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["entity"] });
      navigate({ to: "/entity" });
    },
    onError: (error) => {
      setFormValidationErrors(error, setError);
    },
  });

  // Guard, depois UI do formulário
}
```

### Convenções de Componentes UI

#### Componentes Field

Use a família de componentes `Field` customizados para formulários:

```typescript
<FieldGroup>
  <Field data-invalid={!!errors.fieldName}>
    <FieldLabel htmlFor="fieldName">Label</FieldLabel>
    <FieldContent>
      <Input
        id="fieldName"
        {...register("fieldName")}
        aria-invalid={!!errors.fieldName}
      />
      <FieldError errors={[errors.fieldName]} />
    </FieldContent>
  </Field>
</FieldGroup>
```

- `FieldGroup`: Container para múltiplos campos com espaçamento consistente
- `Field`: Wrapper para label + input + erro
- `FieldError`: Automaticamente deduplica e exibe mensagens de erro
- Suporte para múltiplos erros por campo

#### Manipulação de Datas

Inputs de data em formulários:
- Schema: Use `z.string()` para inputs de data (inputs HTML date fornecem strings)
- Service: Converter para string ISO antes de enviar: `new Date(dateString).toISOString()`
- Exibição: Formatar com `new Date(isoString).toLocaleDateString('pt-BR')`

### Entidades do Domínio

- **Escola**: Instituição de ensino (inferida do token de autenticação)
- **Unidade**: Unidade escolar (múltiplas por escola)
- **Modalidade**: Modalidade de ensino (Infantil, Fundamental, Médio)
- **Etapa**: Nível de série dentro da modalidade (ex: "1º Ano do Ensino Médio")
- **Base Curricular**: Base curricular - conjunto de disciplinas para uma turma
- **Ano Letivo**: Ano letivo com datas de início/fim
- **Turma**: Classe de estudantes (ex: "1º Ano A")

### Convenções Importantes

1. **Aliases de Caminho**: Use prefixo `@/` para imports de `src/`
   ```typescript
   import { Button } from "@/components/ui/button";
   import { useSessionContext } from "@/modules/shared/context/session-context";
   ```

2. **Métodos de Serviço**: Nomeie métodos em português seguindo convenções do backend
   - `obter` (get), `listar` (list), `cadastrar` (create), `atualizar` (update), `deletar` (delete)

3. **Tipos de Erro**: Backend retorna erros tipados
   - `validation-error`: Erros de validação a nível de campo
   - `unauthorized`: Autenticação necessária
   - `forbidden`: Permissões insuficientes
   - `illegal-argument`: Violação de lógica de negócio
   - `conflict`: Conflito de recurso

4. **Padrões de Query Key**:
   - Incluir todos os parâmetros de filtro: `["turmas", unidadeId, anoLetivoId]`
   - Invalidar amplamente em mutations: `queryClient.invalidateQueries({ queryKey: ["turmas"] })`

5. **Config TypeScript**: Alias de caminho `@/*` mapeia para `./src/*` (configurado em `tsconfig.json` e `vite.config.ts`)

6. **Tipagem Typescript**: Sempre usar `type` para tipos de dados e `interface` para representar um contrato que pode ser implementado por uma classe

## Padrões Comuns

### Adicionando uma Nova Funcionalidade CRUD

1. **Criar Serviço** (`modules/core/services/entity-service.ts`):
   - Definir interfaces de request/response
   - Criar interface de serviço
   - Implementar classe de serviço com chamadas fetch

2. **Criar Schema Zod** (`modules/core/schemas/cadastrar-entity-schema.ts`):
   - Definir regras de validação
   - Exportar schema e tipo inferido

3. **Criar Query Options** (`modules/core/queries/entity-query-options.ts`):
   - Exportar função de query options com keys adequadas e condições enabled

4. **Criar Componentes de Página** (`modules/core/pages/`):
   - `listar-entities.tsx`: Página de listagem com guard, carregamento, estados vazios
   - `cadastrar-entity.tsx`: Formulário de criação com validação

5. **Atualizar Rotas** (`routes.tsx`):
   - Importar componentes
   - Criar definições de rota
   - Adicionar à árvore de rotas

### Dropdowns Dependentes

Para selects em cascata (ex: Modalidade → Etapa → Base):

```typescript
const [modalidadeId, setModalidadeId] = useState<number | null>(null);
const [etapaId, setEtapaId] = useState<number | null>(null);

// Queries com condições enabled
const { data: etapas = [] } = useQuery(
  obterEtapasQueryOptions(modalidadeId)
);
const { data: bases = [] } = useQuery(
  basesCurricularesQueryOptions(unidadeId, etapaId)
);

// Resetar campos dependentes quando o pai muda
const handleModalidadeChange = (value: string) => {
  setModalidadeId(value ? Number(value) : null);
  setEtapaId(null);
  resetField("etapaId");
  resetField("baseId");
};
```

### Uso do Session Context

A maioria das páginas requer `unidadeId` para filtragem:

```typescript
const { unidadeId, anoLetivoId } = useSessionContext();

// Verificação de guard
if (!unidadeId) {
  return (
    <div className="p-6">
      <h1>Título da Página</h1>
      <AlertCircle />
      <p>Selecione uma unidade para visualizar...</p>
    </div>
  );
}

// Usar na query
const { data } = useQuery({
  ...queryOptions(unidadeId),
  enabled: !!unidadeId,
});
```

Usuários selecionam `unidadeId` e `anoLetivoId` através de switchers no cabeçalho da sidebar.
