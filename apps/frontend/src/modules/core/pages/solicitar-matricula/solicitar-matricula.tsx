import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { FieldGroup } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { useSessionContext } from "@/modules/shared/context/session-context";
import type { ApiError } from "@/modules/shared/types/backend-error";
import { isValidationError, setFormValidationErrors } from "@/modules/shared/utils/api-error";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import { AlertCircle, ArrowLeft, ArrowRight } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { solicitarMatriculaSchema, type SolicitarMatriculaFormData } from "../../schemas/solicitar-matricula-schema";
import { matriculaService } from "../../services/matricula-service";
import { Documentos } from "./documentos";
import { InformacoesAluno } from "./informacoes-aluno";
import { InformacoesResponsavel } from "./informacoes-responsavel";
import { WizardSteps } from "./wizard-steps";

const WIZARD_STEPS = [
  { id: 1, title: "Aluno", description: "Dados do estudante" },
  { id: 2, title: "Responsável", description: "Dados do responsável" },
  { id: 3, title: "Documentos", description: "Anexos necessários" },
];

export function SolicitarMatricula() {
  const { unidadeId, anoLetivoId } = useSessionContext();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [currentStep, setCurrentStep] = useState(1);

  const [modalidadeId, setModalidadeId] = useState<number | null>(null);

  const [selectedFiles, setSelectedFiles] = useState<{
    comprovanteResidencia: File | null;
    historicoEscolar: File | null;
    documentoResponsavel: File | null;
    documentoAluno: File | null;
  }>({
    comprovanteResidencia: null,
    historicoEscolar: null,
    documentoResponsavel: null,
    documentoAluno: null,
  });

  const [fileErrors, setFileErrors] = useState<{
    comprovanteResidencia?: string;
    historicoEscolar?: string;
    documentoResponsavel?: string;
    documentoAluno?: string;
  }>({});

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    resetField,
    trigger,
  } = useForm<SolicitarMatriculaFormData>({
    resolver: zodResolver(solicitarMatriculaSchema),
    defaultValues: {
      periodoLetivoId: anoLetivoId ?? undefined,
    },
    mode: "onBlur",
  });

  const handleModalidadeChange = (value: string) => {
    const newModalidadeId = value ? Number(value) : null;
    setModalidadeId(newModalidadeId);
    resetField("etapaId");
  };

  const {
    mutate: solicitarMatricula,
    isPending,
    error: apiError,
  } = useMutation<void, ApiError, SolicitarMatriculaFormData>({
    mutationFn: async (data: SolicitarMatriculaFormData) => {
      const newFileErrors: typeof fileErrors = {};

      if (!selectedFiles.comprovanteResidencia) {
        newFileErrors.comprovanteResidencia = "O comprovante de residência é obrigatório";
      }

      if (!selectedFiles.historicoEscolar) {
        newFileErrors.historicoEscolar = "O histórico escolar é obrigatório";
      }

      if (!selectedFiles.documentoResponsavel) {
        newFileErrors.documentoResponsavel = "O documento do responsável é obrigatório";
      }

      if (!selectedFiles.documentoAluno) {
        newFileErrors.documentoAluno = "O documento do aluno é obrigatório";
      }

      if (Object.keys(newFileErrors).length > 0) {
        setFileErrors(newFileErrors);
        throw new Error("Arquivos obrigatórios não foram selecionados");
      }

      setFileErrors({});

      await matriculaService.solicitar({
        ...data,
        unidadeId: unidadeId!,
        comprovanteResidencia: selectedFiles.comprovanteResidencia!,
        historicoEscolar: selectedFiles.historicoEscolar!,
        documentoResponsavel: selectedFiles.documentoResponsavel!,
        documentoAluno: selectedFiles.documentoAluno!,
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

  const onSubmit = (data: SolicitarMatriculaFormData) => {
    solicitarMatricula(data);
  };

  const handleFileChange = (
    fieldName: "comprovanteResidencia" | "historicoEscolar" | "documentoResponsavel" | "documentoAluno",
    files: FileList | null
  ) => {
    const file = files?.[0] ?? null;
    setSelectedFiles((prev) => ({
      ...prev,
      [fieldName]: file,
    }));

    if (file) {
      setFileErrors((prev) => ({
        ...prev,
        [fieldName]: undefined,
      }));
    }
  };

  const validateStep = async (step: number): Promise<boolean> => {
    if (step === 1) {
      const isValid = await trigger(["nome", "cpf", "dataDeNascimento", "sexo", "modalidadeId", "etapaId"]);
      return isValid;
    } else if (step === 2) {
      const isValid = await trigger([
        "responsavelNome",
        "responsavelCpf",
        "responsavelTelefone",
        "responsavelEmail",
        "responsavelDataDeNascimento",
        "relacaoResponsabilidade",
      ]);
      return isValid;
    }
    return true;
  };

  const handleNext = async () => {
    const isValid = await validateStep(currentStep);
    if (isValid && currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  if (!unidadeId || !anoLetivoId) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Solicitar Matrícula</h1>
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <AlertCircle className="size-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground text-lg">
            Selecione uma unidade e um ano letivo para solicitar uma matrícula
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Solicitar Matrícula</h1>
        <p className="text-muted-foreground mt-1">
          Preencha os dados do aluno e do responsável para solicitar uma matrícula
        </p>
      </div>

      <div className="max-w-4xl">
        <WizardSteps steps={WIZARD_STEPS} currentStep={currentStep} />

        <form onSubmit={handleSubmit(onSubmit)}>
          <FieldGroup>
            {apiError && !isValidationError(apiError) && (
              <Alert variant="destructive">
                <AlertCircle className="size-4" />
                <AlertTitle>Erro ao solicitar matrícula</AlertTitle>
                <AlertDescription>{apiError.mensagem}</AlertDescription>
              </Alert>
            )}

            {currentStep === 1 && (
              <InformacoesAluno
                register={register}
                errors={errors}
                modalidadeId={modalidadeId}
                onModalidadeChange={handleModalidadeChange}
              />
            )}

            {currentStep === 2 && <InformacoesResponsavel register={register} errors={errors} />}

            {currentStep === 3 && (
              <Documentos selectedFiles={selectedFiles} fileErrors={fileErrors} onFileChange={handleFileChange} />
            )}

            <div className="flex justify-between pt-6">
              <div>
                {currentStep > 1 && (
                  <Button type="button" variant="outline" onClick={handlePrevious} disabled={isPending}>
                    <ArrowLeft className="size-4 mr-2" />
                    Anterior
                  </Button>
                )}
              </div>

              <div className="flex gap-3">
                <Button asChild type="button" variant="ghost" disabled={isPending}>
                  <Link to="/matriculas">Cancelar</Link>
                </Button>

                {currentStep < 3 && (
                  <Button type="button" onClick={handleNext} className="min-w-32">
                    Próximo
                    <ArrowRight className="size-4 ml-2" />
                  </Button>
                )}

                {currentStep === 3 && (
                  <Button type="submit" disabled={isPending} className="min-w-32 cursor-pointer">
                    {isPending && (
                      <>
                        <Spinner className="size-4 animate-spin mr-2" />
                        Enviando...
                      </>
                    )}

                    {!isPending && "Enviar Solicitação"}
                  </Button>
                )}
              </div>
            </div>
          </FieldGroup>
        </form>
      </div>
    </div>
  );
}
