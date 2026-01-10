import { CriptografiaService } from "../../application/interfaces/criptografia.service.js";
import { JwtService } from "../../application/interfaces/jwt.service.js";
import { UnitOfWork } from "../../application/interfaces/unit-of-work.interface.js";
import {
	FileStorageService,
	type UploadFileRequest,
	type UploadFileResponse,
	type SignedUrl,
	type VerifyTokenResponse,
} from "../../application/interfaces/file-storage.interface.js";

/**
 * Mock implementation of CriptografiaService for testing
 * Returns predictable hashes and always verifies successfully
 */
export class MockCriptografiaService extends CriptografiaService {
	/**
	 * Creates a predictable hash for testing
	 * @param plainValue - The value to hash
	 * @returns A predictable hash prefixed with "hashed_"
	 */
	async hashear(plainValue: string): Promise<string> {
		return `hashed_${plainValue}`;
	}

	/**
	 * Verifies a hash against a plain value
	 * @param hash - The hash to verify
	 * @param plainValue - The plain value to check
	 * @returns true if hash matches the expected format
	 */
	async verificar(hash: string, plainValue: string): Promise<boolean> {
		return hash === `hashed_${plainValue}`;
	}
}

/**
 * Mock implementation of FileStorageService for testing
 * Returns success without actual file operations
 */
export class MockFileStorageService extends FileStorageService {
	private storedFiles: Map<string, { fileName: string; content: Buffer; mimeType?: string }> = new Map();
	private tokens: Map<string, { documentId: number; expiresAt: number }> = new Map();

	/**
	 * Mock file upload that stores file info in memory
	 * @param request - Upload file request
	 * @returns Mock upload response with predictable paths
	 */
	async uploadFile(request: UploadFileRequest): Promise<UploadFileResponse> {
		const timestamp = Date.now();
		const path = `uploads/${timestamp}_${request.fileName}`;
		const url = `http://localhost:3000/files/${path}`;

		this.storedFiles.set(path, {
			fileName: request.fileName,
			content: request.content,
			...(request.mimeType ? { mimeType: request.mimeType } : {}),
		});

		return { url, path };
	}

	/**
	 * Mock file deletion
	 * @param path - File path to delete
	 */
	async deleteFile(path: string): Promise<void> {
		this.storedFiles.delete(path);
	}

	/**
	 * Mock URL signing for a single document
	 * @param request - Sign URL request
	 * @returns Signed URL token
	 */
	async signUrl(request: { documentId: number }): Promise<string> {
		const token = `token_${request.documentId}_${Date.now()}`;
		const expiresAt = Date.now() + 3600000; // 1 hour from now

		this.tokens.set(token, {
			documentId: request.documentId,
			expiresAt,
		});

		return token;
	}

	/**
	 * Mock batch URL signing
	 * @param documentIds - Array of document IDs
	 * @returns Array of signed URLs
	 */
	async signUrlsBatch(documentIds: number[]): Promise<SignedUrl[]> {
		const results: SignedUrl[] = [];

		for (const documentId of documentIds) {
			const url = await this.signUrl({ documentId });
			results.push({ documentId, url });
		}

		return results;
	}

	/**
	 * Mock token verification
	 * @param token - Token to verify
	 * @returns Verification response or null if invalid
	 */
	async verifyToken(token: string): Promise<VerifyTokenResponse | null> {
		const tokenData = this.tokens.get(token);

		if (!tokenData) {
			return null;
		}

		if (tokenData.expiresAt < Date.now()) {
			return null;
		}

		return {
			documentId: tokenData.documentId,
			expiresAt: tokenData.expiresAt,
		};
	}

	/**
	 * Test helper: Check if file exists
	 * @param path - File path to check
	 * @returns true if file exists
	 */
	hasFile(path: string): boolean {
		return this.storedFiles.has(path);
	}

	/**
	 * Test helper: Get file content
	 * @param path - File path
	 * @returns File data or undefined
	 */
	getFile(path: string) {
		return this.storedFiles.get(path);
	}

	/**
	 * Test helper: Clear all stored files
	 */
	clear(): void {
		this.storedFiles.clear();
		this.tokens.clear();
	}
}

/**
 * Mock JWT Service for testing
 * Returns predictable tokens without actual JWT operations
 */
export class MockJWTService extends JwtService {
	private tokens: Map<string, any> = new Map();

	/**
	 * Creates a mock JWT token
	 * @param payload - Token payload
	 * @returns Mock token string
	 */
	async gerarToken(payload: Record<string, any>): Promise<string> {
		const token = `mock_token_${Date.now()}_${JSON.stringify(payload)}`;
		this.tokens.set(token, payload);
		return token;
	}

	/**
	 * Verifies a mock JWT token
	 * @param token - Token to verify
	 * @returns Decoded payload or null if invalid
	 */
	verify(token: string): any | null {
		return this.tokens.get(token) ?? null;
	}

	/**
	 * Decodes a mock JWT token without verification
	 * @param token - Token to decode
	 * @returns Decoded payload or null
	 */
	decode(token: string): any | null {
		return this.tokens.get(token) ?? null;
	}

	/**
	 * Test helper: Clear all tokens
	 */
	clear(): void {
		this.tokens.clear();
	}
}

/**
 * Mock Unit of Work for testing
 * Executes transactions synchronously in memory
 */
export class MockUnitOfWork extends UnitOfWork {
	/**
	 * Executes a function within a mock transaction
	 * In testing, this simply executes the function directly
	 * @param fn - Function to execute
	 * @returns Result of the function
	 */
	async transact<T = unknown>(fn: () => Promise<T>): Promise<T> {
		return fn();
	}
}
