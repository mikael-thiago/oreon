export type MultipartFields = Record<string, string | undefined>;

export type UploadedFile = {
  fileName: string;
  content: Buffer;
};
