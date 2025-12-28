import { DateFormatEnum, type DateFormat } from "./date-format.enum.js";

/**
 * Converte uma string de data no formato especificado em um objeto Date
 * ignorando o fuso horário do servidor. Isso garante que a data seja interpretada
 * exatamente como fornecida, sem ajustes de fuso horário.
 *
 * @param value - A string da data a ser convertida (ex: "2024-12-27")
 * @param format - O formato da string de data
 * @returns Um objeto Date representando a data de entrada às 00:00:00 UTC
 *
 * @example
 * // Servidor no fuso horário GMT-3
 * // Sem correção de fuso: "2024-12-27" -> 2024-12-26T21:00:00.000Z (subtrai 3 horas)
 * // Com correção de fuso: "2024-12-27" -> 2024-12-27T00:00:00.000Z (correto)
 * const date = parseDate("2024-12-27", "YYYY-MM-DD");
 */
export function parseDateIgnoringTimezone(value: string, format: DateFormat): Date {
  switch (format) {
    case DateFormatEnum.ISO_DATE: {
      const [year, month, day] = value.split("-").map(Number);

      if (!year || !month || !day || month < 1 || month > 12 || day < 1 || day > 31) {
        throw new Error(`[parseDateIgnoringTimezone] Invalid date string: ${value}. Expected format: ${format}`);
      }

      const date = new Date(year, month - 1, day, 0, 0, 0, 0);

      if (isNaN(date.getTime())) {
        throw new Error(`[parseDateIgnoringTimezone] Data inválida: ${value}`);
      }

      return date;
    }
    default: {
      throw new Error(`[parseDateIgnoringTimezone] Formato inválido: ${format}`);
    }
  }
}
