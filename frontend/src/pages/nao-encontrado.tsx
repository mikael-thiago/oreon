import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { FileQuestion, Home, ArrowLeft } from "lucide-react";

export function NaoEncontrado() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background">
      <div className="max-w-md w-full text-center">
        <div className="mb-8 flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
            <FileQuestion className="relative size-24 text-primary" />
          </div>
        </div>

        <h1 className="text-6xl font-bold text-foreground mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-foreground mb-3">
          Página não encontrada
        </h2>
        <p className="text-muted-foreground mb-8 leading-relaxed">
          A página que você está procurando não existe ou foi movida. Verifique
          o endereço digitado ou retorne à página inicial.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild className="cursor-pointer">
            <Link to="/home">
              <Home className="size-4 mr-2" />
              Ir para a Página Inicial
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="cursor-pointer"
            onClick={() => window.history.back()}
          >
            <a>
              <ArrowLeft className="size-4 mr-2" />
              Voltar
            </a>
          </Button>
        </div>

        <div className="mt-12 pt-8 border-t border-border">
          <p className="text-sm text-muted-foreground">
            Precisa de ajuda?{" "}
            <a
              href="mailto:suporte@oreon.com"
              className="text-primary hover:underline"
            >
              Entre em contato
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
