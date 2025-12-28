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
import { useState } from "react";
import { useForm } from "react-hook-form";
import {
  cadastrarMatriculaSchema,
  type CadastrarMatriculaFormData,
} from "../schemas/cadastrar-matricula-schema";
import { matriculaService } from "../services/matricula-service";

export function CriarMatricula() {
  const { unidadeId, anoLetivoId } = useSessionContext();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // File state managed separately from react-hook-form
  const [selectedFiles, setSelectedFiles] = useState<{
    comprovanteResidencia: File | null;
    historicoEscolar: File | null;
  }>({
    comprovanteResidencia: null,
    historicoEscolar: null,
  });

  const [fileErrors, setFileErrors] = useState<{
    comprovanteResidencia?: string;
    historicoEscolar?: string;
  }>({});

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<CadastrarMatriculaFormData>({
    resolver: zodResolver(cadastrarMatriculaSchema),
    defaultValues: {
      unidadeId: unidadeId ?? undefined,
      periodoLetivoId: anoLetivoId ?? undefined,
    },
  });

  const {
    mutate: cadastrarMatricula,
    isPending,
    error: apiError,
  } = useMutation<void, ApiError, CadastrarMatriculaFormData>({
    mutationFn: async (data: CadastrarMatriculaFormData) => {
      // Validate files exist
      const newFileErrors: typeof fileErrors = {};

      if (!selectedFiles.comprovanteResidencia) {
        newFileErrors.comprovanteResidencia =
          "O comprovante de residência é obrigatório";
      }

      if (!selectedFiles.historicoEscolar) {
        newFileErrors.historicoEscolar = "O histórico escolar é obrigatório";
      }

      if (Object.keys(newFileErrors).length > 0) {
        setFileErrors(newFileErrors);
        throw new Error("Arquivos obrigatórios não foram selecionados");
      }

      // Clear file errors
      setFileErrors({});

      // Call service with form data and files
      await matriculaService.criar({
        ...data,
        comprovanteResidencia: selectedFiles.comprovanteResidencia!,
        historicoEscolar: selectedFiles.historicoEscolar!,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["matriculas"] });
      navigate({ to: "/matriculas" });
    },
    onError: (error) => {
      setFormValidationErrors(error, setError);
    },
  });

  const onSubmit = (data: CadastrarMatriculaFormData) => {
    cadastrarMatricula(data);
  };

  const handleFileChange = (
    fieldName: "comprovanteResidencia" | "historicoEscolar",
    files: FileList | null
  ) => {
    const file = files?.[0] ?? null;
    setSelectedFiles((prev) => ({
      ...prev,
      [fieldName]: file,
    }));

    // Clear error when file is selected
    if (file) {
      setFileErrors((prev) => ({
        ...prev,
        [fieldName]: undefined,
      }));
    }
  };

  if (!unidadeId || !anoLetivoId) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Cadastrar Matrícula</h1>
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <AlertCircle className="size-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground text-lg">
            Selecione uma unidade e um ano letivo para cadastrar uma matrícula
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Cadastrar Matrícula</h1>
        <p className="text-muted-foreground mt-1">
          Preencha os dados abaixo para cadastrar uma nova matrícula
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl">
        <FieldGroup>
          {apiError && !isValidationError(apiError) && (
            <Alert variant="destructive">
              <AlertCircle className="size-4" />
              <AlertTitle>Erro ao cadastrar matrícula</AlertTitle>
              <AlertDescription>{apiError.mensagem}</AlertDescription>
            </Alert>
          )}

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
            <FieldLabel htmlFor="cpf">CPF</FieldLabel>
            <FieldContent>
              <Input
                id="cpf"
                type="text"
                placeholder="000.000.000-00"
                {...register("cpf")}
                aria-invalid={!!errors.cpf}
              />
              <FieldError errors={[errors.cpf]} />
            </FieldContent>
          </Field>

          <Field data-invalid={!!errors.dataDeNascimento}>
            <FieldLabel htmlFor="dataDeNascimento">
              Data de Nascimento
            </FieldLabel>
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

          <Field data-invalid={!!fileErrors.comprovanteResidencia}>
            <FieldLabel htmlFor="comprovanteResidencia">
              Comprovante de Residência
            </FieldLabel>
            <FieldContent>
              <input
                id="comprovanteResidencia"
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) =>
                  handleFileChange("comprovanteResidencia", e.target.files)
                }
                aria-invalid={!!fileErrors.comprovanteResidencia}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
              {selectedFiles.comprovanteResidencia && (
                <p className="text-sm text-muted-foreground mt-2">
                  Arquivo selecionado:{" "}
                  {selectedFiles.comprovanteResidencia.name}
                </p>
              )}
              {fileErrors.comprovanteResidencia && (
                <p className="text-sm text-destructive mt-1">
                  {fileErrors.comprovanteResidencia}
                </p>
              )}
            </FieldContent>
          </Field>

          <Field data-invalid={!!fileErrors.historicoEscolar}>
            <FieldLabel htmlFor="historicoEscolar">
              Histórico Escolar
            </FieldLabel>
            <FieldContent>
              <input
                id="historicoEscolar"
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) =>
                  handleFileChange("historicoEscolar", e.target.files)
                }
                aria-invalid={!!fileErrors.historicoEscolar}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
              {selectedFiles.historicoEscolar && (
                <p className="text-sm text-muted-foreground mt-2">
                  Arquivo selecionado: {selectedFiles.historicoEscolar.name}
                </p>
              )}
              {fileErrors.historicoEscolar && (
                <p className="text-sm text-destructive mt-1">
                  {fileErrors.historicoEscolar}
                </p>
              )}
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
              <Link to="/matriculas">Cancelar</Link>
            </Button>
          </div>
        </FieldGroup>
      </form>
    </div>
  );
}
