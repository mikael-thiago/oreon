export const DateFormatEnum = {
  ISO_DATE: "yyyy-MM-dd",
  BRAZIL_DATE_ONLY: "dd/MM/yyyy",
} as const;

export type DateFormat = (typeof DateFormatEnum)[keyof typeof DateFormatEnum];
