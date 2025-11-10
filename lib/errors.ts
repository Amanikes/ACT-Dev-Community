export type AppErrorOptions = {
  status?: number;
  code?: string;
  cause?: unknown;
  details?: unknown;
};

export class AppError extends Error {
  status: number;
  code?: string;
  details?: unknown;
  constructor(message: string, opts: AppErrorOptions = {}) {
    super(message);
    this.name = "AppError";
    this.status = opts.status ?? 500;
    this.code = opts.code;
    this.details = opts.details;
    if (opts.cause) {
      // @ts-ignore
      this.cause = opts.cause;
    }
  }
}

export function isAppError(err: unknown): err is AppError {
  return err instanceof Error && (err as any).name === "AppError";
}

export async function errorFromResponse(res: Response): Promise<AppError> {
  let message = `Request failed with ${res.status}`;
  let code: string | undefined;
  let details: unknown;
  try {
    const text = await res.text();
    if (text) {
      try {
        const data = JSON.parse(text);
        message = data?.error || data?.message || message;
        code = data?.code;
        details = data;
      } catch {
        message = text;
      }
    }
  } catch {}
  return new AppError(message, { status: res.status, code, details });
}
