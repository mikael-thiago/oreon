export type DateFormat =
  | "DD/MM/YYYY"
  | "DD/MM/YYYY HH:mm:ss"
  | "DD/MM/YY"
  | "YYYY-MM-DD"
  | "YYYY-MM-DD HH:mm:ss"
  | "MM/DD/YYYY"
  | "HH:mm:ss"
  | "HH:mm"
  | "DD de MMMM de YYYY"
  | "MMMM de YYYY"
  | "weekday"
  | "short-weekday"
  | "relative"
  | "iso"
  | "database";

export class DateFormatter {
  private static readonly MONTHS_PT = [
    "janeiro",
    "fevereiro",
    "março",
    "abril",
    "maio",
    "junho",
    "julho",
    "agosto",
    "setembro",
    "outubro",
    "novembro",
    "dezembro",
  ];

  private static readonly WEEKDAYS_PT = [
    "domingo",
    "segunda-feira",
    "terça-feira",
    "quarta-feira",
    "quinta-feira",
    "sexta-feira",
    "sábado",
  ];

  private static readonly SHORT_WEEKDAYS_PT = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"];

  /**
   * Formats a date according to the specified format
   * @param date - The date to format
   * @param format - The desired format
   * @returns Formatted date string
   */
  static format(date: Date, format: DateFormat): string {
    switch (format) {
      case "DD/MM/YYYY":
        return this.formatBrazilianDate(date);

      case "DD/MM/YYYY HH:mm:ss":
        return this.formatBrazilianDateTime(date);

      case "DD/MM/YY":
        return this.formatShortBrazilianDate(date);

      case "YYYY-MM-DD":
        return this.formatISODate(date);

      case "YYYY-MM-DD HH:mm:ss":
      case "database":
        return this.formatISODateTime(date);

      case "MM/DD/YYYY":
        return this.formatAmericanDate(date);

      case "HH:mm:ss":
        return this.formatTime(date);

      case "HH:mm":
        return this.formatShortTime(date);

      case "DD de MMMM de YYYY":
        return this.formatLongBrazilianDate(date);

      case "MMMM de YYYY":
        return this.formatBrazilianMonthYear(date);

      case "weekday":
        return this.formatWeekday(date);

      case "short-weekday":
        return this.formatShortWeekday(date);

      case "relative":
        return this.formatRelativeTime(date);

      case "iso":
        return date.toISOString();

      default:
        const _exhaustiveCheck: never = format;
        throw new Error(`Formato de data não suportado: ${_exhaustiveCheck}`);
    }
  }

  private static formatBrazilianDate(date: Date): string {
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }

  private static formatBrazilianDateTime(date: Date): string {
    const dateStr = this.formatBrazilianDate(date);
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");
    return `${dateStr} ${hours}:${minutes}:${seconds}`;
  }

  private static formatShortBrazilianDate(date: Date): string {
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = String(date.getFullYear()).substring(2);
    return `${day}/${month}/${year}`;
  }

  private static formatISODate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  private static formatISODateTime(date: Date): string {
    return date.toISOString().replace("T", " ").substring(0, 19);
  }

  private static formatAmericanDate(date: Date): string {
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
  }

  private static formatTime(date: Date): string {
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");
    return `${hours}:${minutes}:${seconds}`;
  }

  private static formatShortTime(date: Date): string {
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${hours}:${minutes}`;
  }

  private static formatLongBrazilianDate(date: Date): string {
    const day = date.getDate();
    const month = this.MONTHS_PT[date.getMonth()];
    const year = date.getFullYear();
    return `${day} de ${month} de ${year}`;
  }

  private static formatBrazilianMonthYear(date: Date): string {
    const month = this.MONTHS_PT[date.getMonth()];
    const year = date.getFullYear();
    return `${month} de ${year}`;
  }

  private static formatWeekday(date: Date): string {
    return this.WEEKDAYS_PT[date.getDay()]!;
  }

  private static formatShortWeekday(date: Date): string {
    return this.SHORT_WEEKDAYS_PT[date.getDay()]!;
  }

  private static formatRelativeTime(date: Date): string {
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInSeconds = Math.floor(diffInMs / 1000);
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);
    const diffInMonths = Math.floor(diffInDays / 30);
    const diffInYears = Math.floor(diffInDays / 365);

    if (diffInSeconds < 60) {
      return "agora mesmo";
    } else if (diffInMinutes < 60) {
      return `há ${diffInMinutes} ${diffInMinutes === 1 ? "minuto" : "minutos"}`;
    } else if (diffInHours < 24) {
      return `há ${diffInHours} ${diffInHours === 1 ? "hora" : "horas"}`;
    } else if (diffInDays < 30) {
      return `há ${diffInDays} ${diffInDays === 1 ? "dia" : "dias"}`;
    } else if (diffInMonths < 12) {
      return `há ${diffInMonths} ${diffInMonths === 1 ? "mês" : "meses"}`;
    } else {
      return `há ${diffInYears} ${diffInYears === 1 ? "ano" : "anos"}`;
    }
  }
}
