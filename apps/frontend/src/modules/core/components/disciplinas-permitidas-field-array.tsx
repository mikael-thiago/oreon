import { Button } from "@/components/ui/button";
import {
  Field,
  FieldContent,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, X } from "lucide-react";
import {
  useFieldArray,
  Controller,
  type Control,
  type FieldErrors,
  type UseFormRegister,
} from "react-hook-form";
import type { CadastrarColaboradorFormData } from "../schemas/cadastrar-colaborador-schema";
import type { DisciplinaListItem } from "../services/disciplina.service";
import type { EtapaResponse } from "../services/etapa-service";

type Props = {
  control: Control<CadastrarColaboradorFormData>;
  register: UseFormRegister<CadastrarColaboradorFormData>;
  errors: FieldErrors<CadastrarColaboradorFormData>;
  disciplinas: DisciplinaListItem[];
  etapas: EtapaResponse[];
  isPendingDisciplinas: boolean;
  isPendingEtapas: boolean;
};

export function DisciplinasPermitidasFieldArray({
  control,
  register,
  errors,
  disciplinas,
  etapas,
  isPendingDisciplinas,
  isPendingEtapas,
}: Props) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "contrato.disciplinasPermitidas",
  });

  console.log(errors);

  return (
    <div className="space-y-4 pt-4 border-t">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Disciplinas Permitidas</h3>
          <p className="text-sm text-muted-foreground">
            Adicione as disciplinas que este professor pode lecionar
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => append({ disciplinaId: 0, etapasIds: [] })}
          disabled={isPendingDisciplinas || isPendingEtapas}
        >
          <Plus className="size-4 mr-2" />
          Adicionar Disciplina
        </Button>
      </div>

      {errors.contrato?.disciplinasPermitidas?.root && (
        <p className="text-sm text-destructive">
          {errors.contrato.disciplinasPermitidas.root.message}
        </p>
      )}

      <div className="space-y-4">
        {fields.length === 0 && (
          <p className="text-sm text-muted-foreground">
            Nenhuma disciplina adicionada. Clique em "Adicionar Disciplina" para
            começar.
          </p>
        )}

        {fields.length > 0 &&
          fields.map((field, index) => (
            <div
              key={field.id}
              className="p-4 border rounded-lg bg-card space-y-3"
            >
              <div className="flex gap-3 items-start">
                <div className="flex-1 grid grid-cols-2 gap-3">
                  <Field
                    data-invalid={
                      !!errors.contrato?.disciplinasPermitidas?.[index]
                        ?.disciplinaId
                    }
                  >
                    <FieldLabel
                      htmlFor={`contrato.disciplinasPermitidas.${index}.disciplinaId`}
                    >
                      Disciplina
                    </FieldLabel>
                    <FieldContent>
                      <select
                        id={`contrato.disciplinasPermitidas.${index}.disciplinaId`}
                        {...register(
                          `contrato.disciplinasPermitidas.${index}.disciplinaId`,
                          {
                            valueAsNumber: true,
                          }
                        )}
                        aria-invalid={
                          !!errors.contrato?.disciplinasPermitidas?.[index]
                            ?.disciplinaId
                        }
                        disabled={isPendingDisciplinas}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <option value={0}>Selecione uma disciplina</option>
                        {disciplinas.map((disciplina) => (
                          <option key={disciplina.id} value={disciplina.id}>
                            {disciplina.nome}
                          </option>
                        ))}
                      </select>
                      <FieldError
                        errors={[
                          errors.contrato?.disciplinasPermitidas?.[index]
                            ?.disciplinaId,
                        ]}
                      />
                    </FieldContent>
                  </Field>

                  <Controller
                    name={`contrato.disciplinasPermitidas.${index}.etapasIds`}
                    control={control}
                    render={({ field }) => {
                      const selectedEtapas = field.value || [];
                      const availableEtapas = etapas.filter(
                        (etapa) => !selectedEtapas.includes(etapa.id)
                      );

                      const handleAddEtapa = (etapaId: string) => {
                        if (etapaId && etapaId !== "0") {
                          const newValue = [...selectedEtapas, Number(etapaId)];
                          field.onChange(newValue);
                        }
                      };

                      const handleRemoveEtapa = (etapaId: number) => {
                        const newValue = selectedEtapas.filter(
                          (id) => id !== etapaId
                        );
                        field.onChange(newValue);
                      };

                      return (
                        <Field
                          data-invalid={
                            !!errors.contrato?.disciplinasPermitidas?.[index]
                              ?.etapasIds
                          }
                        >
                          <FieldLabel>Etapas</FieldLabel>
                          <FieldContent>
                            <div className="space-y-3">
                              {isPendingEtapas ? (
                                <p className="text-sm text-muted-foreground">
                                  Carregando etapas...
                                </p>
                              ) : availableEtapas.length === 0 &&
                                selectedEtapas.length === 0 ? (
                                <p className="text-sm text-muted-foreground">
                                  Nenhuma etapa disponível
                                </p>
                              ) : availableEtapas.length > 0 ? (
                                <select
                                  onChange={(e) => {
                                    handleAddEtapa(e.target.value);
                                    e.target.value = "0";
                                  }}
                                  disabled={isPendingEtapas}
                                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                  <option value="0">Adicionar etapa...</option>
                                  {availableEtapas.map((etapa) => (
                                    <option key={etapa.id} value={etapa.id}>
                                      {etapa.nome}
                                    </option>
                                  ))}
                                </select>
                              ) : (
                                <p className="text-sm text-muted-foreground">
                                  Todas as etapas foram adicionadas
                                </p>
                              )}

                              {selectedEtapas.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                  {selectedEtapas.map((etapaId) => {
                                    const etapa = etapas.find(
                                      (e) => e.id === etapaId
                                    );
                                    return etapa ? (
                                      <Badge
                                        key={etapaId}
                                        variant="secondary"
                                        className="cursor-pointer hover:bg-secondary/70"
                                        onClick={() =>
                                          handleRemoveEtapa(etapaId)
                                        }
                                      >
                                        {etapa.nome}
                                        <X className="size-3 ml-1" />
                                      </Badge>
                                    ) : null;
                                  })}
                                </div>
                              )}
                            </div>
                            <FieldError
                              errors={[
                                errors.contrato?.disciplinasPermitidas?.[index]
                                  ?.etapasIds,
                              ]}
                            />
                          </FieldContent>
                        </Field>
                      );
                    }}
                  />
                </div>

                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => remove(index)}
                  className="mt-8 text-destructive hover:text-destructive"
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
