import { seeder } from "./umzug.js";

const command = process.argv[2];

(async () => {
  try {
    switch (command) {
      case "up":
        await seeder.up();
        console.log("✓ Todos os seeders executados com sucesso");
        break;
      case "down":
        await seeder.down();
        console.log("✓ Último seeder revertido com sucesso");
        break;
      case "pending":
        const pending = await seeder.pending();
        console.log("Seeders pendentes:", pending.map((s) => s.name));
        break;
      case "executed":
        const executed = await seeder.executed();
        console.log("Seeders executados:", executed.map((s) => s.name));
        break;
      default:
        console.log("Comandos disponíveis: up, down, pending, executed");
    }
    process.exit(0);
  } catch (error) {
    console.error("Erro no seeder:", error);
    process.exit(1);
  }
})();
