import { Construction } from "lucide-react";

export function EmBreve() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] h-full w-full p-6 text-center">
      <div className="p-4 rounded-full bg-primary/10 text-primary mb-6">
        <Construction className="size-16" />
      </div>
      <h1 className="text-3xl font-bold mb-3">Em Breve</h1>
      <p className="text-muted-foreground text-lg max-w-md">
        Esta funcionalidade está em desenvolvimento e estará disponível em
        breve.
      </p>
    </div>
  );
}
