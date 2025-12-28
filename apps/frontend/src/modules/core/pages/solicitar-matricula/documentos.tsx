import {
  Field,
  FieldContent,
  FieldLabel,
} from "@/components/ui/field";

type DocumentosProps = {
  selectedFiles: {
    comprovanteResidencia: File | null;
    historicoEscolar: File | null;
    documentoResponsavel: File | null;
    documentoAluno: File | null;
  };
  fileErrors: {
    comprovanteResidencia?: string;
    historicoEscolar?: string;
    documentoResponsavel?: string;
    documentoAluno?: string;
  };
  onFileChange: (
    fieldName: "comprovanteResidencia" | "historicoEscolar" | "documentoResponsavel" | "documentoAluno",
    files: FileList | null
  ) => void;
};

export function Documentos({
  selectedFiles,
  fileErrors,
  onFileChange,
}: DocumentosProps) {
  return (
    <div className="space-y-4 pt-6">
      <h2 className="text-lg font-semibold text-foreground">Documentos</h2>

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
              onFileChange("comprovanteResidencia", e.target.files)
            }
            aria-invalid={!!fileErrors.comprovanteResidencia}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          />
          {selectedFiles.comprovanteResidencia && (
            <p className="text-sm text-muted-foreground mt-2">
              Arquivo selecionado: {selectedFiles.comprovanteResidencia.name}
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
            onChange={(e) => onFileChange("historicoEscolar", e.target.files)}
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

      <Field data-invalid={!!fileErrors.documentoResponsavel}>
        <FieldLabel htmlFor="documentoResponsavel">
          Documento do Responsável (RG ou CPF)
        </FieldLabel>
        <FieldContent>
          <input
            id="documentoResponsavel"
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={(e) => onFileChange("documentoResponsavel", e.target.files)}
            aria-invalid={!!fileErrors.documentoResponsavel}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          />
          {selectedFiles.documentoResponsavel && (
            <p className="text-sm text-muted-foreground mt-2">
              Arquivo selecionado: {selectedFiles.documentoResponsavel.name}
            </p>
          )}
          {fileErrors.documentoResponsavel && (
            <p className="text-sm text-destructive mt-1">
              {fileErrors.documentoResponsavel}
            </p>
          )}
        </FieldContent>
      </Field>

      <Field data-invalid={!!fileErrors.documentoAluno}>
        <FieldLabel htmlFor="documentoAluno">
          Documento do Aluno (RG ou CPF)
        </FieldLabel>
        <FieldContent>
          <input
            id="documentoAluno"
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={(e) => onFileChange("documentoAluno", e.target.files)}
            aria-invalid={!!fileErrors.documentoAluno}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          />
          {selectedFiles.documentoAluno && (
            <p className="text-sm text-muted-foreground mt-2">
              Arquivo selecionado: {selectedFiles.documentoAluno.name}
            </p>
          )}
          {fileErrors.documentoAluno && (
            <p className="text-sm text-destructive mt-1">
              {fileErrors.documentoAluno}
            </p>
          )}
        </FieldContent>
      </Field>
    </div>
  );
}
