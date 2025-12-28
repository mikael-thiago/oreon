export type UploadFileRequest = {
  readonly fileName: string;
  readonly content: Buffer;
  readonly mimeType?: string;
};

export type UploadFileResponse = {
  readonly url: string;
  readonly path: string;
};

export type SignUrlRequest = {
  readonly documentId: number;
};

export type VerifyTokenResponse = {
  readonly documentId: number;
  readonly expiresAt: number;
};

export abstract class FileStorageService {
  abstract uploadFile(request: UploadFileRequest): Promise<UploadFileResponse>;
  abstract deleteFile(path: string): Promise<void>;
  abstract signUrl(request: SignUrlRequest): Promise<string>;
  abstract verifyToken(token: string): Promise<VerifyTokenResponse | null>;
}
