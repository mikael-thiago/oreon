import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { FieldGroup } from "@/components/ui/field";
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
  cadastrarColaboradorSchema,
  type CadastrarColaboradorFormData,
} from "../../schemas/cadastrar-colaborador-schema";
import { colaboradorService } from "../../services/colaborador-service";
import { DadosContratacao } from "./dados-contratacao";
import { DadosPessoais } from "./dados-pessoais";

export function CadastrarColaborador() {
  const { unidadeId } = useSessionContext();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { register, watch, handleSubmit, formState, setError, control } =
    useForm<CadastrarColaboradorFormData>({
      resolver: zodResolver(cadastrarColaboradorSchema),
      defaultValues: {
        unidadeId: unidadeId ?? undefined,
      },
    });

  const {
    mutate: cadastrarColaborador,
    isPending,
    error: apiError,
  } = useMutation<void, ApiError, CadastrarColaboradorFormData>({
    mutationFn: (data: CadastrarColaboradorFormData) => {
      return colaboradorService.cadastrar({
        ...data,
        contrato: {
          cargoId: data.contrato.cargoId,
          salario: data.contrato.salario,
          dataInicio: new Date(data.contrato.dataInicio),
          dataFim: data.contrato.dataFim
            ? new Date(data.contrato.dataFim)
            : undefined,
          disciplinasPermitidas: data.contrato.disciplinasPermitidas,
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["colaboradores"] });
      navigate({ to: "/rh/colaboradores" });
    },
    onError: (error) => {
      setFormValidationErrors(error, setError);
    },
  });

  const onSubmit = (data: CadastrarColaboradorFormData) => {
    cadastrarColaborador(data);
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Cadastrar Colaborador</h1>
        <p className="text-muted-foreground mt-1">
          Preencha os dados abaixo para cadastrar um novo colaborador
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="max-w-4xl">
        <FieldGroup>
          {apiError && !isValidationError(apiError) && (
            <Alert variant="destructive">
              <AlertCircle className="size-4" />
              <AlertTitle>Erro ao cadastrar colaborador</AlertTitle>
              <AlertDescription>{apiError.mensagem}</AlertDescription>
            </Alert>
          )}

          <DadosPessoais formState={formState} register={register} control={control} />

          <DadosContratacao
            control={control}
            watch={watch}
            formState={formState}
            register={register}
            unidadeId={unidadeId!}
          />

          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              disabled={isPending}
              className="min-w-32 cursor-pointer"
            >
              {isPending && (
                <>
                  <Spinner className="size-4 animate-spin mr-2" />
                  Cadastrando...
                </>
              )}

              {!isPending && "Cadastrar"}
            </Button>
            <Button
              asChild
              type="button"
              variant="outline"
              disabled={isPending}
            >
              <Link to="/rh/colaboradores">Cancelar</Link>
            </Button>
          </div>
        </FieldGroup>
      </form>
    </div>
  );
}
