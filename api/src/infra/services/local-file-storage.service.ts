import * as fs from "node:fs/promises";
import * as path from "node:path";
import { randomUUID } from "node:crypto";
import type {
  FileStorageService,
  UploadFileRequest,
  UploadFileResponse,
} from "../../application/interfaces/file-storage.interface.js";

export class LocalFileStorageService implements FileStorageService {
  private readonly uploadDir: string;

  constructor(uploadDir: string = "./uploads") {
    this.uploadDir = uploadDir;
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
}
