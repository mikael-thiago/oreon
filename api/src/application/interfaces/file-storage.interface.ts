export type UploadFileRequest = {
  readonly fileName: string;
  readonly content: Buffer;
  readonly mimeType?: string;
};

export type UploadFileResponse = {
  readonly url: string;
  readonly path: string;
};

export abstract class FileStorageService {
  abstract uploadFile(request: UploadFileRequest): Promise<UploadFileResponse>;
  abstract deleteFile(path: string): Promise<void>;
}
