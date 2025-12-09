import { Button } from "@/components/ui/button";
import {
  Field,
  FieldContent,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useSessionContext } from "@/modules/shared/context/session-context";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { basesCurricularesQueryOptions } from "../queries/obter-bases-curriculares-query-options";
import { obterEtapasQueryOptions } from "../queries/obter-etapas-query-options";
import { obterModalidadesQueryOptions } from "../queries/obter-modalidades-query-options";
import { obterTodasBasesQueryOptions } from "../queries/obter-todas-bases-query-options";
import {
  cadastrarBaseCurricularSchema,
  type CadastrarBaseCurricularFormData,
} from "../schemas/cadastrar-base-curricular-schema";
import { baseCurricularService } from "../services/base-curricular.service";

export function CadastrarBaseCurricular() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { unidadeId } = useSessionContext();
  const [modalidadeId, setModalidadeId] = useState<number | null>(null);

  const { data: modalidades = [], isPending: isPendingModalidades } = useQuery(
    obterModalidadesQueryOptions
  );

  const { data: etapas = [], isPending: isPendingEtapas } = useQuery(
    obterEtapasQueryOptions(modalidadeId)
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    resetField,
  } = useForm<CadastrarBaseCurricularFormData>({
    resolver: zodResolver(cadastrarBaseCurricularSchema),
    defaultValues: {
      disciplinas: [{ nome: "", codigo: "", cargaHorariaAnual: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "disciplinas",
  });

  const { mutate: cadastrarBase, isPending } = useMutation({
    mutationFn: (data: CadastrarBaseCurricularFormData) =>
      baseCurricularService.cadastrar({ ...data, unidadeId: unidadeId! }),
    onSuccess: () => {
      queryClient.invalidateQueries(basesCurricularesQueryOptions(unidadeId));
      queryClient.invalidateQueries(obterTodasBasesQueryOptions);
      navigate({ to: "/bases" });
    },
  });

  const onSubmit = (data: CadastrarBaseCurricularFormData) => {
    cadastrarBase(data);
  };

  const handleModalidadeChange = (value: string) => {
    const newModalidadeId = value ? Number(value) : null;
    setModalidadeId(newModalidadeId);
    resetField("etapaId");
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Cadastrar Base Curricular</h1>
        <p className="text-muted-foreground mt-1">
          Preencha os dados abaixo para cadastrar uma nova base curricular
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="max-w-4xl">
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="modalidadeId">Modalidade</FieldLabel>
            <FieldContent>
              <select
                id="modalidadeId"
                value={String(modalidadeId ?? "")}
                onChange={(e) => handleModalidadeChange(e.target.value)}
                disabled={isPendingModalidades}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">Selecione uma modalidade</option>
                {modalidades.map((modalidade) => (
                  <option key={modalidade.id} value={modalidade.id}>
                    {modalidade.nome}
                  </option>
                ))}
              </select>
            </FieldContent>
          </Field>

          <Field data-invalid={!!errors.etapaId}>
            <FieldLabel htmlFor="etapaId">Etapa</FieldLabel>
            <FieldContent>
              <select
                id="etapaId"
                {...register("etapaId", { valueAsNumber: true })}
                aria-invalid={!!errors.etapaId}
                disabled={isPendingEtapas || !modalidadeId}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">
                  {!modalidadeId
                    ? "Selecione uma modalidade primeiro"
                    : "Selecione uma etapa"}
                </option>
                {etapas.map((etapa) => (
                  <option key={etapa.id} value={etapa.id}>
                    {etapa.nome}
                  </option>
                ))}
              </select>
              <FieldError errors={[errors.etapaId]} />
            </FieldContent>
          </Field>

          <div className="space-y-4 pt-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Disciplinas</h3>
                <p className="text-sm text-muted-foreground">
                  Adicione as disciplinas da base curricular
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  append({ nome: "", codigo: "", cargaHorariaAnual: 0 })
                }
              >
                <Plus className="size-4 mr-2" />
                Adicionar Disciplina
              </Button>
            </div>

            {errors.disciplinas?.root && (
              <p className="text-sm text-destructive">
                {errors.disciplinas.root.message}
              </p>
            )}

            <div className="space-y-4">
              {fields.map((field, index) => (
                <div
                  key={field.id}
                  className="flex gap-3 items-start p-4 border rounded-lg bg-card"
                >
                  <div className="flex-1 grid grid-cols-3 gap-3">
                    <Field data-invalid={!!errors.disciplinas?.[index]?.nome}>
                      <FieldLabel htmlFor={`disciplinas.${index}.nome`}>
                        Nome
                      </FieldLabel>
                      <FieldContent>
                        <Input
                          id={`disciplinas.${index}.nome`}
                          {...register(`disciplinas.${index}.nome`)}
                          aria-invalid={!!errors.disciplinas?.[index]?.nome}
                          placeholder="Ex: Matemática"
                        />
                        <FieldError
                          errors={[errors.disciplinas?.[index]?.nome]}
                        />
                      </FieldContent>
                    </Field>

                    <Field data-invalid={!!errors.disciplinas?.[index]?.codigo}>
                      <FieldLabel htmlFor={`disciplinas.${index}.codigo`}>
                        Código
                      </FieldLabel>
                      <FieldContent>
                        <Input
                          id={`disciplinas.${index}.codigo`}
                          {...register(`disciplinas.${index}.codigo`)}
                          aria-invalid={!!errors.disciplinas?.[index]?.codigo}
                          placeholder="Ex: MAT01"
                        />
                        <FieldError
                          errors={[errors.disciplinas?.[index]?.codigo]}
                        />
                      </FieldContent>
                    </Field>

                    <Field
                      data-invalid={
                        !!errors.disciplinas?.[index]?.cargaHorariaAnual
                      }
                    >
                      <FieldLabel
                        htmlFor={`disciplinas.${index}.cargaHorariaAnual`}
                      >
                        Carga Horária Anual
                      </FieldLabel>
                      <FieldContent>
                        <Input
                          id={`disciplinas.${index}.cargaHorariaAnual`}
                          type="number"
                          {...register(
                            `disciplinas.${index}.cargaHorariaAnual`,
                            { valueAsNumber: true }
                          )}
                          aria-invalid={
                            !!errors.disciplinas?.[index]?.cargaHorariaAnual
                          }
                          placeholder="Ex: 120"
                        />
                        <FieldError
                          errors={[
                            errors.disciplinas?.[index]?.cargaHorariaAnual,
                          ]}
                        />
                      </FieldContent>
                    </Field>
                  </div>

                  {fields.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => remove(index)}
                      className="mt-8 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" disabled={isPending} className="min-w-32">
              {isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin mr-2" />
                  Cadastrando...
                </>
              ) : (
                "Cadastrar"
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate({ to: "/bases" })}
              disabled={isPending}
            >
              Cancelar
            </Button>
          </div>
        </FieldGroup>
      </form>
    </div>
  );
}
