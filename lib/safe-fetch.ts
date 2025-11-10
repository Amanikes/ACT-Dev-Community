import { AppError, errorFromResponse } from "./errors";

export type JsonFetchInit = RequestInit & {
  // When true, returns undefined if body is empty; else throws
  allowEmpty?: boolean;
};

export async function jsonFetch<T = unknown>(input: RequestInfo | URL, init: JsonFetchInit = {}): Promise<T> {
  const res = await fetch(input, {
    headers: {
      Accept: "application/json, text/plain",
      ...(init.headers || {}),
    },
    ...init,
  });

  if (!res.ok) {
    throw await errorFromResponse(res);
  }

  // Try JSON first, fallback to text
  const text = await res.text();
  if (!text) {
    if (init.allowEmpty) return undefined as unknown as T;
    return {} as T;
  }
  try {
    return JSON.parse(text) as T;
  } catch {
    // Wrap non-JSON as message
    return { message: text } as T;
  }
}

export async function textFetch(input: RequestInfo | URL, init?: RequestInit): Promise<string> {
  const res = await fetch(input, init);
  if (!res.ok) throw await errorFromResponse(res);
  return res.text();
}

export function assert(condition: unknown, message = "Assertion failed"): asserts condition {
  if (!condition) throw new AppError(message, { status: 500 });
}
