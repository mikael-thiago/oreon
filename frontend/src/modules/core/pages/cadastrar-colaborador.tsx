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
import { useForm } from "react-hook-form";
import { obterCargosQueryOptions } from "../queries/obter-cargos-query-options";
import {
  cadastrarColaboradorSchema,
  type CadastrarColaboradorFormData,
} from "../schemas/cadastrar-colaborador-schema";
import { colaboradorService } from "../services/colaborador-service";

export function CadastrarColaborador() {
  const { unidadeId } = useSessionContext();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<CadastrarColaboradorFormData>({
    resolver: zodResolver(cadastrarColaboradorSchema),
    defaultValues: {
      unidadeId: unidadeId ?? undefined,
    },
  });

  const { data: cargos = [], isPending: isPendingCargos } = useQuery(
    obterCargosQueryOptions
  );

  const {
    mutate: cadastrarColaborador,
    isPending,
    error: apiError,
  } = useMutation<void, ApiError, CadastrarColaboradorFormData>({
    mutationFn: (data: CadastrarColaboradorFormData) =>
      colaboradorService.cadastrar({
        ...data,
        contrato: {
          cargoId: data.contrato.cargoId,
          dataInicio: new Date(data.contrato.dataInicio),
          dataFim: data.contrato.dataFim ? new Date(data.contrato.dataFim) : undefined
        }
      }),
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

  if (!unidadeId) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Cadastrar Colaborador</h1>
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <AlertCircle className="size-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground text-lg">
            Selecione uma unidade para cadastrar um colaborador
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Cadastrar Colaborador</h1>
        <p className="text-muted-foreground mt-1">
          Preencha os dados abaixo para cadastrar um novo colaborador
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl">
        <FieldGroup>
          {apiError && !isValidationError(apiError) && (
            <Alert variant="destructive">
              <AlertCircle className="size-4" />
              <AlertTitle>Erro ao cadastrar colaborador</AlertTitle>
              <AlertDescription>{apiError.mensagem}</AlertDescription>
            </Alert>
          )}

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

          <Field data-invalid={!!errors.cpf}>
            <FieldLabel htmlFor="cpf">CPF</FieldLabel>
            <FieldContent>
              <Input
                id="cpf"
                type="text"
                maxLength={11}
                placeholder="Digite apenas os 11 dígitos"
                {...register("cpf")}
                aria-invalid={!!errors.cpf}
              />
              <FieldError errors={[errors.cpf]} />
            </FieldContent>
          </Field>

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
              <Link to="/rh/colaboradores">Cancelar</Link>
            </Button>
          </div>
        </FieldGroup>
      </form>
    </div>
  );
}
