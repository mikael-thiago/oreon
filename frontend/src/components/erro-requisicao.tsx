import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "./ui/button";

type ErroRequisicaoProps = {
  /**
   * Título do erro. Se não fornecido, usa "Erro ao carregar dados"
   */
  readonly titulo?: string;
  /**
   * Mensagem de erro. Se não fornecida, usa uma mensagem genérica
   */
  readonly mensagem?: string;
  /**
   * Callback para tentar novamente
   */
  readonly onTentarNovamente?: () => void;
  /**
   * Texto do botão de tentar novamente. Padrão: "Tentar Novamente"
   */
  readonly textoBotao?: string;
};

export function ErroRequisicao({
  titulo = "Erro ao carregar dados",
  mensagem = "Ocorreu um erro ao carregar os dados. Tente novamente mais tarde.",
  onTentarNovamente,
  textoBotao = "Tentar Novamente",
}: ErroRequisicaoProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] h-full w-full p-6 text-center">
      <div className="p-4 rounded-full bg-destructive/10 text-destructive mb-6">
        <AlertCircle className="size-12" />
      </div>
      <h1 className="text-xl font-bold mb-3">{titulo}</h1>
      <p className="text-muted-foreground max-w-md mb-6">{mensagem}</p>
      {onTentarNovamente && (
        <Button onClick={onTentarNovamente} variant="outline">
          <RefreshCw className="size-3 mr-2" />
          {textoBotao}
        </Button>
      )}
    </div>
  );
}
