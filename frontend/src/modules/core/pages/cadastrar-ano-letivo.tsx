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
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import { AlertCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import {
  cadastrarAnoLetivoSchema,
  type CadastrarAnoLetivoFormData,
} from "../schemas/cadastrar-ano-letivo-schema";
import { anoLetivoService } from "../services/ano-letivo-service";

export function CadastrarAnoLetivo() {
  const { unidadeId } = useSessionContext();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<CadastrarAnoLetivoFormData>({
    resolver: zodResolver(cadastrarAnoLetivoSchema),
  });

  const {
    mutate: cadastrarAnoLetivo,
    isPending,
    error: apiError,
  } = useMutation<void, ApiError, CadastrarAnoLetivoFormData>({
    mutationFn: (data: CadastrarAnoLetivoFormData) =>
      anoLetivoService.cadastrar(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["anos-letivos"] });
      navigate({ to: "/anos-letivos" });
    },
    onError: (error) => {
      setFormValidationErrors(error, setError);
    },
  });

  const onSubmit = (data: CadastrarAnoLetivoFormData) => {
    cadastrarAnoLetivo(data);
  };

  if (!unidadeId) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Cadastrar Ano Letivo</h1>
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <AlertCircle className="size-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground text-lg">
            Selecione uma unidade para cadastrar um ano letivo
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Cadastrar Ano Letivo</h1>
        <p className="text-muted-foreground mt-1">
          Preencha os dados abaixo para cadastrar um novo ano letivo
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl">
        <FieldGroup>
          {apiError && !isValidationError(apiError) && (
            <Alert variant="destructive">
              <AlertCircle className="size-4" />
              <AlertTitle>Erro ao cadastrar ano letivo</AlertTitle>
              <AlertDescription>{apiError.mensagem}</AlertDescription>
            </Alert>
          )}

          <Field data-invalid={!!errors.anoReferencia}>
            <FieldLabel htmlFor="anoReferencia">Ano de Referência</FieldLabel>
            <FieldContent>
              <Input
                id="anoReferencia"
                type="number"
                placeholder="Ex: 2024"
                {...register("anoReferencia", { valueAsNumber: true })}
                aria-invalid={!!errors.anoReferencia}
              />
              <FieldError errors={[errors.anoReferencia]} />
            </FieldContent>
          </Field>

          <Field data-invalid={!!errors.dataInicio}>
            <FieldLabel htmlFor="dataInicio">Data de Início</FieldLabel>
            <FieldContent>
              <Input
                id="dataInicio"
                type="date"
                {...register("dataInicio")}
                aria-invalid={!!errors.dataInicio}
              />
              <FieldError errors={[errors.dataInicio]} />
            </FieldContent>
          </Field>

          <Field data-invalid={!!errors.dataFim}>
            <FieldLabel htmlFor="dataFim">Data de Fim</FieldLabel>
            <FieldContent>
              <Input
                id="dataFim"
                type="date"
                {...register("dataFim")}
                aria-invalid={!!errors.dataFim}
              />
              <FieldError errors={[errors.dataFim]} />
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
              <Link to="/anos-letivos">Cancelar</Link>
            </Button>
          </div>
        </FieldGroup>
      </form>
    </div>
  );
}
