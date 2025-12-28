import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldContent,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { useSessionContext } from "@/modules/shared/context/session-context";
import type { ApiError } from "@/modules/shared/types/backend-error";
import {
  isValidationError,
  setFormValidationErrors,
} from "@/modules/shared/utils/api-error";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import { AlertCircle } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { basesCurricularesQueryOptions } from "../queries/obter-bases-curriculares-query-options";
import { obterEtapasQueryOptions } from "../queries/obter-etapas-query-options";
import {
  cadastrarTurmaSchema,
  type CadastrarTurmaFormData,
} from "../schemas/cadastrar-turma-schema";
import { modalidadeService } from "../services/modalidade-service";
import { turmaService } from "../services/turma-service";

export function CadastrarTurma() {
  const { unidadeId, anoLetivoId } = useSessionContext();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [modalidadeId, setModalidadeId] = useState<number | null>(null);
  const [etapaId, setEtapaId] = useState<number | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    resetField,
    setError,
  } = useForm<CadastrarTurmaFormData>({
    resolver: zodResolver(cadastrarTurmaSchema),
    defaultValues: {
      unidadeId: unidadeId ?? undefined,
      anoLetivoId: anoLetivoId ?? undefined,
    },
  });

  const { data: modalidades = [], isPending: isPendingModalidades } = useQuery({
    queryKey: ["modalidades"],
    queryFn: () => modalidadeService.obterModalidades(),
  });

  const { data: etapas = [], isPending: isPendingEtapas } = useQuery(
    obterEtapasQueryOptions(modalidadeId)
  );

  const { data: bases = [], isPending: isPendingBases } = useQuery(
    basesCurricularesQueryOptions(unidadeId, etapaId)
  );

  const {
    mutate: cadastrarTurma,
    isPending,
    error: apiError,
  } = useMutation<void, ApiError, CadastrarTurmaFormData>({
    mutationFn: (data: CadastrarTurmaFormData) => turmaService.cadastrar(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["turmas"] });
      navigate({ to: "/turmas" });
    },
    onError: (error) => {
      setFormValidationErrors(error, setError);
    },
  });

  const onSubmit = (data: CadastrarTurmaFormData) => {
    cadastrarTurma(data);
  };

  const handleModalidadeChange = (value: string) => {
    const newModalidadeId = value ? Number(value) : null;
    setModalidadeId(newModalidadeId);
    setEtapaId(null);
    resetField("etapaId");
    resetField("baseId");
  };

  const handleEtapaChange = (value: string) => {
    const newEtapaId = value ? Number(value) : null;
    setEtapaId(newEtapaId);
    resetField("baseId");
  };

  if (!unidadeId || !anoLetivoId) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Cadastrar Turma</h1>
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <AlertCircle className="size-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground text-lg">
            Selecione uma unidade e um ano letivo para cadastrar uma turma
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Cadastrar Turma</h1>
        <p className="text-muted-foreground mt-1">
          Preencha os dados abaixo para cadastrar uma nova turma
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl">
        <FieldGroup>
          {apiError && !isValidationError(apiError) && (
            <Alert variant="destructive">
              <AlertCircle className="size-4" />
              <AlertTitle>Erro ao cadastrar turma</AlertTitle>
              <AlertDescription>{apiError.mensagem}</AlertDescription>
            </Alert>
          )}

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
                onChange={(e) => handleEtapaChange(e.target.value)}
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

          <Field data-invalid={!!errors.baseId}>
            <FieldLabel htmlFor="baseId">Base Curricular</FieldLabel>
            <FieldContent>
              <select
                id="baseId"
                {...register("baseId", { valueAsNumber: true })}
                aria-invalid={!!errors.baseId}
                disabled={isPendingBases || !etapaId}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">
                  {!etapaId
                    ? "Selecione uma etapa primeiro"
                    : "Selecione uma base curricular"}
                </option>
                {bases.map((base) => (
                  <option key={base.id} value={base.id}>
                    {base.codigo} - {base.etapa}
                  </option>
                ))}
              </select>
              <FieldError errors={[errors.baseId]} />
            </FieldContent>
          </Field>

          <Field data-invalid={!!errors.letra}>
            <FieldLabel htmlFor="letra">Letra da Turma</FieldLabel>
            <FieldContent>
              <Input
                id="letra"
                type="text"
                maxLength={1}
                placeholder="Digite a letra da turma (A, B, C...)"
                {...register("letra")}
                aria-invalid={!!errors.letra}
                className="uppercase"
              />
              <FieldError errors={[errors.letra]} />
            </FieldContent>
          </Field>

          <Field data-invalid={!!errors.limiteDeAlunos}>
            <FieldLabel htmlFor="letra">Limite de Alunos</FieldLabel>
            <FieldContent>
              <Input
                id="letra"
                type="text"
                max={99}
                placeholder="Digite o limite de alunos"
                {...register("limiteDeAlunos", { valueAsNumber: true })}
                aria-invalid={!!errors.limiteDeAlunos}
                // className="uppercase"
              />
              <FieldError errors={[errors.limiteDeAlunos]} />
            </FieldContent>
          </Field>

          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              disabled={isPending}
              className="min-w-32 cursor-pointer"
            >
              {isPending ? (
                <>
                  <Spinner className="size-4 animate-spin mr-2" />
                  Cadastrando...
                </>
              ) : (
                "Cadastrar"
              )}
            </Button>
            <Button
              asChild
              type="button"
              variant="outline"
              disabled={isPending}
            >
              <Link to="/turmas">Cancelar</Link>
            </Button>
          </div>
        </FieldGroup>
      </form>
    </div>
  );
}
