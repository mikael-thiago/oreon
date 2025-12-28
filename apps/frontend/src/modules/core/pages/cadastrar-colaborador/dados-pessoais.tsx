import {
  Field,
  FieldContent,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { formatCpf, unformatCPF } from "@/modules/shared/utils/cpf";
import { Controller, type useForm } from "react-hook-form";
import type { CadastrarColaboradorFormData } from "../../schemas/cadastrar-colaborador-schema";

export type DadosPessoaisProps = Pick<
  ReturnType<typeof useForm<CadastrarColaboradorFormData>>,
  "formState" | "register" | "control"
>;

export function DadosPessoais({
  formState: { errors },
  register,
  control,
}: DadosPessoaisProps) {
  return (
    <>
      <Field data-invalid={!!errors.nome}>
        <FieldLabel htmlFor="nome">Nome Completo</FieldLabel>
        <FieldContent>
          <Input
            id="nome"
            type="text"
            placeholder="Digite o nome completo do colaborador"
            {...register("nome")}
            aria-invalid={!!errors.nome}
          />
          <FieldError errors={[errors.nome]} />
        </FieldContent>
      </Field>
      <Controller
        name="cpf"
        control={control}
        render={({ field }) => (
          <Field data-invalid={!!errors.cpf}>
            <FieldLabel htmlFor="cpf">CPF</FieldLabel>
            <FieldContent>
              <Input
                id="cpf"
                type="text"
                placeholder="000.000.000-00"
                value={formatCpf(field.value ?? "")}
                onChange={(e) => {
                  const unformatted = unformatCPF(e.target.value);
                  field.onChange(unformatted);
                }}
                onBlur={field.onBlur}
                aria-invalid={!!errors.cpf}
              />
              <FieldError errors={[errors.cpf]} />
            </FieldContent>
          </Field>
        )}
      />
      <Field data-invalid={!!errors.email}>
        <FieldLabel htmlFor="email">Email</FieldLabel>
        <FieldContent>
          <Input
            id="email"
            type="email"
            placeholder="exemplo@email.com"
            {...register("email")}
            aria-invalid={!!errors.email}
          />
          <FieldError errors={[errors.email]} />
        </FieldContent>
      </Field>
      <Field data-invalid={!!errors.telefone}>
        <FieldLabel htmlFor="telefone">Telefone</FieldLabel>
        <FieldContent>
          <Input
            id="telefone"
            type="text"
            placeholder="Digite o telefone"
            {...register("telefone")}
            aria-invalid={!!errors.telefone}
          />
          <FieldError errors={[errors.telefone]} />
        </FieldContent>
      </Field>
    </>
  );
}
