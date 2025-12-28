import { Field, FieldContent, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";
import type { FieldErrors, UseFormRegister } from "react-hook-form";
import { useHookFormMask } from "use-mask-input";
import { obterEtapasPorModalidadeQueryOptions } from "../../queries/obter-etapas-por-modalidade-query-options";
import { obterModalidadesQueryOptions } from "../../queries/obter-modalidades-query-options";
import type { SolicitarMatriculaFormData } from "../../schemas/solicitar-matricula-schema";

type InformacoesAlunoProps = {
  register: UseFormRegister<SolicitarMatriculaFormData>;
  errors: FieldErrors<SolicitarMatriculaFormData>;
  modalidadeId: number | null;
  onModalidadeChange: (value: string) => void;
};

export function InformacoesAluno({ register, errors, modalidadeId, onModalidadeChange }: InformacoesAlunoProps) {
  const registerWithMask = useHookFormMask(register);

  const { data: modalidades = [], isPending: isPendingModalidades } = useQuery(obterModalidadesQueryOptions);

  const { data: etapas = [], isPending: isPendingEtapas } = useQuery(
    obterEtapasPorModalidadeQueryOptions(modalidadeId)
  );

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-foreground">Informações do Aluno</h2>

      <Field data-invalid={!!errors.nome}>
        <FieldLabel htmlFor="nome">Nome do Aluno</FieldLabel>
        <FieldContent>
          <Input
            id="nome"
            type="text"
            placeholder="Nome completo do aluno"
            {...register("nome")}
            aria-invalid={!!errors.nome}
          />
          <FieldError errors={[errors.nome]} />
        </FieldContent>
      </Field>

      <Field data-invalid={!!errors.cpf}>
        <FieldLabel htmlFor="cpf">CPF do Aluno</FieldLabel>
        <FieldContent>
          <Input
            id="cpf"
            type="text"
            placeholder="000.000.000-00"
            maxLength={14}
            {...registerWithMask("cpf", "cpf", { autoUnmask: true })}
            aria-invalid={!!errors.cpf}
          />
          <FieldError errors={[errors.cpf]} />
        </FieldContent>
      </Field>

      <Field data-invalid={!!errors.dataDeNascimento}>
        <FieldLabel htmlFor="dataDeNascimento">Data de Nascimento do Aluno</FieldLabel>
        <FieldContent>
          <Input
            id="dataDeNascimento"
            type="date"
            {...register("dataDeNascimento")}
            aria-invalid={!!errors.dataDeNascimento}
          />
          <FieldError errors={[errors.dataDeNascimento]} />
        </FieldContent>
      </Field>

      <Field data-invalid={!!errors.sexo}>
        <FieldLabel htmlFor="sexo">Sexo</FieldLabel>
        <FieldContent>
          <select
            id="sexo"
            {...register("sexo")}
            aria-invalid={!!errors.sexo}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="">Selecione o sexo</option>
            <option value="masculino">Masculino</option>
            <option value="feminino">Feminino</option>
          </select>
          <FieldError errors={[errors.sexo]} />
        </FieldContent>
      </Field>

      <Field data-invalid={!!errors.modalidadeId}>
        <FieldLabel htmlFor="modalidadeId">Modalidade</FieldLabel>
        <FieldContent>
          <select
            id="modalidadeId"
            {...register("modalidadeId", { valueAsNumber: true })}
            onChange={(e) => onModalidadeChange(e.target.value)}
            disabled={isPendingModalidades}
            aria-invalid={!!errors.modalidadeId}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="">Selecione uma modalidade</option>
            {modalidades.map((modalidade) => (
              <option key={modalidade.id} value={modalidade.id}>
                {modalidade.nome}
              </option>
            ))}
          </select>
          <FieldError errors={[errors.modalidadeId]} />
        </FieldContent>
      </Field>

      <Field data-invalid={!!errors.etapaId}>
        <FieldLabel htmlFor="etapaId">Etapa</FieldLabel>
        <FieldContent>
          <select
            id="etapaId"
            {...register("etapaId", { valueAsNumber: true })}
            disabled={isPendingEtapas || !modalidadeId}
            aria-invalid={!!errors.etapaId}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="">{!modalidadeId ? "Selecione uma modalidade primeiro" : "Selecione uma etapa"}</option>
            {etapas.map((etapa) => (
              <option key={etapa.id} value={etapa.id}>
                {etapa.nome}
              </option>
            ))}
          </select>
          <FieldError errors={[errors.etapaId]} />
        </FieldContent>
      </Field>
    </div>
  );
}
