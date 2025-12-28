import { Field, FieldContent, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import type { FieldErrors, UseFormRegister } from "react-hook-form";
import { useHookFormMask } from "use-mask-input";
import type { SolicitarMatriculaFormData } from "../../schemas/solicitar-matricula-schema";

type InformacoesResponsavelProps = {
  register: UseFormRegister<SolicitarMatriculaFormData>;
  errors: FieldErrors<SolicitarMatriculaFormData>;
};

export function InformacoesResponsavel({ register, errors }: InformacoesResponsavelProps) {
  const registerWithMask = useHookFormMask(register);

  return (
    <div className="space-y-4 pt-6">
      <h2 className="text-lg font-semibold text-foreground">Informações do Responsável</h2>

      <Field data-invalid={!!errors.responsavelNome}>
        <FieldLabel htmlFor="responsavelNome">Nome do Responsável</FieldLabel>
        <FieldContent>
          <Input
            id="responsavelNome"
            type="text"
            placeholder="Nome completo do responsável"
            {...register("responsavelNome")}
            aria-invalid={!!errors.responsavelNome}
          />
          <FieldError errors={[errors.responsavelNome]} />
        </FieldContent>
      </Field>

      <Field data-invalid={!!errors.responsavelCpf}>
        <FieldLabel htmlFor="responsavelCpf">CPF do Responsável</FieldLabel>
        <FieldContent>
          <Input
            id="responsavelCpf"
            type="text"
            placeholder="000.000.000-00"
            maxLength={14}
            {...registerWithMask("responsavelCpf", "cpf", { autoUnmask: true })}
            aria-invalid={!!errors.responsavelCpf}
          />
          <FieldError errors={[errors.responsavelCpf]} />
        </FieldContent>
      </Field>

      <Field data-invalid={!!errors.responsavelTelefone}>
        <FieldLabel htmlFor="responsavelTelefone">Telefone do Responsável</FieldLabel>
        <FieldContent>
          <Input
            id="responsavelTelefone"
            type="tel"
            placeholder="(00) 00000-0000"
            maxLength={15}
            {...registerWithMask("responsavelTelefone", ["(99) 9999-9999", "(99) 99999-9999"], { autoUnmask: true })}
            aria-invalid={!!errors.responsavelTelefone}
          />
          <FieldError errors={[errors.responsavelTelefone]} />
        </FieldContent>
      </Field>

      <Field data-invalid={!!errors.responsavelEmail}>
        <FieldLabel htmlFor="responsavelEmail">E-mail do Responsável</FieldLabel>
        <FieldContent>
          <Input
            id="responsavelEmail"
            type="email"
            placeholder="email@exemplo.com"
            {...register("responsavelEmail")}
            aria-invalid={!!errors.responsavelEmail}
          />
          <FieldError errors={[errors.responsavelEmail]} />
        </FieldContent>
      </Field>

      <Field data-invalid={!!errors.responsavelDataDeNascimento}>
        <FieldLabel htmlFor="responsavelDataDeNascimento">Data de Nascimento do Responsável</FieldLabel>
        <FieldContent>
          <Input
            id="responsavelDataDeNascimento"
            type="date"
            {...register("responsavelDataDeNascimento")}
            aria-invalid={!!errors.responsavelDataDeNascimento}
          />
          <FieldError errors={[errors.responsavelDataDeNascimento]} />
        </FieldContent>
      </Field>

      <Field data-invalid={!!errors.relacaoResponsabilidade}>
        <FieldLabel htmlFor="relacaoResponsabilidade">Relação com o Aluno</FieldLabel>
        <FieldContent>
          <select
            id="relacaoResponsabilidade"
            {...register("relacaoResponsabilidade")}
            aria-invalid={!!errors.relacaoResponsabilidade}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="">Selecione a relação</option>
            <option value="mae">Mãe</option>
            <option value="pai">Pai</option>
            <option value="avo">Avô/Avó</option>
            <option value="tio">Tio</option>
            <option value="tia">Tia</option>
            <option value="irmao">Irmão</option>
            <option value="irma">Irmã</option>
            <option value="outro">Outro</option>
          </select>
          <FieldError errors={[errors.relacaoResponsabilidade]} />
        </FieldContent>
      </Field>
    </div>
  );
}
