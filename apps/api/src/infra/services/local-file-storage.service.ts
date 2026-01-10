import * as fs from "node:fs/promises";
import * as path from "node:path";
import { randomUUID } from "node:crypto";
import { createSigner, createVerifier } from "fast-jwt";
import type {
  FileStorageService,
  SignUrlRequest,
  SignedUrl,
  UploadFileRequest,
  UploadFileResponse,
  VerifyTokenResponse,
} from "../../application/interfaces/file-storage.interface.js";

export class LocalFileStorageService implements FileStorageService {
  private readonly uploadDir: string;
  private readonly signer: ReturnType<typeof createSigner>;
  private readonly verifier: ReturnType<typeof createVerifier>;
  private readonly baseUrl: string;

  constructor(uploadDir: string, downloadTokenSecret: string, baseUrl: string) {
    this.uploadDir = uploadDir;
    this.baseUrl = baseUrl;
    const secret = downloadTokenSecret;

    this.signer = createSigner({
      key: async () => secret,
      expiresIn: 1000 * 60 * 5, // 5 minutes
    });

    this.verifier = createVerifier({
      key: async () => secret,
    });
  }

  async uploadFile(request: UploadFileRequest): Promise<UploadFileResponse> {
    await fs.mkdir(this.uploadDir, { recursive: true });

    const fileExtension = path.extname(request.fileName);
    const uniqueFileName = `${randomUUID()}${fileExtension}`;
    const filePath = path.join(this.uploadDir, uniqueFileName);

    await fs.writeFile(filePath, request.content);

    return {
      url: `/uploads/${uniqueFileName}`,
      path: filePath,
    };
  }

  async deleteFile(filePath: string): Promise<void> {
    try {
      await fs.unlink(filePath);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
        throw error;
      }
    }
  }

  async signUrl(request: SignUrlRequest): Promise<string> {
    const token = await this.signer({
      documentId: request.documentId,
      type: "download",
    });
    return `${this.baseUrl}/documents/${request.documentId}/download?token=${token}`;
  }

  async signUrlsBatch(documentIds: number[]): Promise<SignedUrl[]> {
    const signedUrls = await Promise.all(
      documentIds.map(async (documentId) => {
        const url = await this.signUrl({ documentId });
        return { documentId, url };
      })
    );

    return signedUrls;
  }

  async verifyToken(token: string): Promise<VerifyTokenResponse | null> {
    try {
      const payload = await this.verifier(token);

      if (payload.type !== "download" || !payload.documentId) {
        return null;
      }

      return {
        documentId: payload.documentId,
        expiresAt: payload.exp,
      };
    } catch (error) {
      // Token expired, invalid signature, or malformed
      return null;
    }
  }
}
