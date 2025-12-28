import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldContent,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import type { useForm } from "react-hook-form";
import { DisciplinasPermitidasFieldArray } from "../../components/disciplinas-permitidas-field-array";
import { obterCargosQueryOptions } from "../../queries/obter-cargos-query-options";
import { obterDisciplinasQueryOptions } from "../../queries/obter-disciplinas-query-options";
import { obterTodasEtapasQueryOptions } from "../../queries/obter-todas-etapas-query-options";
import type { CadastrarColaboradorFormData } from "../../schemas/cadastrar-colaborador-schema";

export type DadosContratacaoProps = Pick<
  ReturnType<typeof useForm<CadastrarColaboradorFormData>>,
  "register" | "formState" | "watch" | "control"
> & {
  readonly unidadeId: number;
};

export function DadosContratacao({
  formState: { errors },
  register,
  watch,
  control,
  unidadeId,
}: DadosContratacaoProps) {
  const { data: cargos = [], isPending: isPendingCargos } = useQuery(
    obterCargosQueryOptions
  );

  const { data: disciplinas = [], isPending: isPendingDisciplinas } = useQuery(
    obterDisciplinasQueryOptions(unidadeId)
  );

  const { data: etapas = [], isPending: isPendingEtapas } = useQuery(
    obterTodasEtapasQueryOptions
  );

  const cargoId = watch("contrato.cargoId");

  const cargoSelecionado = useMemo(
    () => cargos.find((cargo) => cargo.id === cargoId),
    [cargos, cargoId]
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Dados de Contratação</CardTitle>
        <CardDescription>
          Informações sobre o vínculo trabalhista do colaborador
        </CardDescription>
      </CardHeader>
      <CardContent>
        <FieldGroup>
          <Field data-invalid={!!errors.contrato?.cargoId}>
            <FieldLabel htmlFor="cargoId">Cargo</FieldLabel>
            <FieldContent>
              <select
                id="cargoId"
                {...register("contrato.cargoId", { valueAsNumber: true })}
                aria-invalid={!!errors.contrato?.cargoId}
                disabled={isPendingCargos}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">Selecione um cargo</option>
                {cargos.map((cargo) => (
                  <option key={cargo.id} value={cargo.id}>
                    {cargo.nome}
                  </option>
                ))}
              </select>
              <FieldError errors={[errors.contrato?.cargoId]} />
            </FieldContent>
          </Field>

          <Field data-invalid={!!errors.contrato?.salario}>
            <FieldLabel htmlFor="salario">Salário</FieldLabel>
            <FieldContent>
              <Input
                id="salario"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                {...register("contrato.salario", { valueAsNumber: true })}
                aria-invalid={!!errors.contrato?.salario}
              />
              <FieldError errors={[errors.contrato?.salario]} />
            </FieldContent>
          </Field>

          <Field data-invalid={!!errors.contrato?.dataInicio}>
            <FieldLabel htmlFor="dataInicio">
              Data de Início do Contrato
            </FieldLabel>
            <FieldContent>
              <Input
                id="dataInicio"
                type="date"
                {...register("contrato.dataInicio")}
                aria-invalid={!!errors.contrato?.dataInicio}
              />
              <FieldError errors={[errors.contrato?.dataInicio]} />
            </FieldContent>
          </Field>

          <Field data-invalid={!!errors.contrato?.dataFim}>
            <FieldLabel htmlFor="dataFim">
              Data de Fim do Contrato (Opcional)
            </FieldLabel>
            <FieldContent>
              <Input
                id="dataFim"
                type="date"
                {...register("contrato.dataFim")}
                aria-invalid={!!errors.contrato?.dataFim}
              />
              <FieldError errors={[errors.contrato?.dataFim]} />
            </FieldContent>
          </Field>

          {cargoSelecionado && cargoSelecionado.podeEnsinar && (
            <DisciplinasPermitidasFieldArray
              control={control}
              register={register}
              errors={errors}
              disciplinas={disciplinas}
              etapas={etapas}
              isPendingDisciplinas={isPendingDisciplinas}
              isPendingEtapas={isPendingEtapas}
            />
          )}
        </FieldGroup>
      </CardContent>
    </Card>
  );
}
