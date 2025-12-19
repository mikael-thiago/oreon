import { migrator } from "./umzug.js";

const command = process.argv[2];

(async () => {
  try {
    switch (command) {
      case "up":
        await migrator.up();
        console.log("✓ Todas as migrações executadas com sucesso");
        break;
      case "down":
        await migrator.down();
        console.log("✓ Última migração revertida com sucesso");
        break;
      case "pending":
        const pending = await migrator.pending();
        console.log("Migrações pendentes:", pending.map((m) => m.name));
        break;
      case "executed":
        const executed = await migrator.executed();
        console.log("Migrações executadas:", executed.map((m) => m.name));
        break;
      default:
        console.log("Comandos disponíveis: up, down, pending, executed");
    }
    process.exit(0);
  } catch (error) {
    console.error("Erro na migração:", error);
    process.exit(1);
  }
})();
