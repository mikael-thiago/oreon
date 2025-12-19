## Contexto

Esse é o frontend de um projeto de gestão escolar.
Até o momento, essas são as principais entidades.

- Escola: Uma escola é uma instituição de Ensino
- Unidade: Uma unidade é uma unidade da escola, uma escola pode ter várias unidades
- Modalidades: Refere-se as modalidades de ensino, atualmente utilizamos: Ensino Infantil, Ensino Fundamental e Ensino Médio
- Etapas: São as etapas de uma modalidade, exemplo: 1º Ano do Ensino Médio, 7º Ano do Ensino Fundamental, etc
- Base Curricular: Uma base curricular é um conjunto de disciplinas que definem o que uma turma deve cumprir

## Padrões

- Bibliotecas
    - Esse projeto utiliza tanstack router como biblioteca de roteamento
    - Utiliza zod como biblioteca de validação
    - Utiliza react-hook-form como biblioteca de gerenciamento de formulários
    - Utiliza tanstack query como biblioteca para lidar com http state
    - Utiliza shadcn-ui como biblioteca de componentes
- Padrões
    - Para todo conjunto de chamadas HTTP é criada uma interface de serviço, para abstrair as chamadas HTTP
- Decisões
    - O estado de autenticação fica localizado no auth-context
    - O estado das variáveis de sessão fica localizado no session-context.tsx