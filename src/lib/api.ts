export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
  ) {
    super(`helmi-api ${status}: ${code}`);
    this.name = "ApiError";
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const base = process.env.NEXT_PUBLIC_API_URL;
  // A deploy without the env var must show widgets as offline, not call "undefined/...".
  if (!base) throw new ApiError(0, "no_api_url");

  let res: Response;
  try {
    res = await fetch(`${base}${path}`, init);
  } catch {
    throw new ApiError(0, "network");
  }
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { error?: string } | null;
    throw new ApiError(res.status, body?.error ?? "upstream_error");
  }
  return res.json() as Promise<T>;
}

export function apiGet<T>(path: string): Promise<T> {
  return request<T>(path);
}

export function apiPost<T>(path: string, body: unknown): Promise<T> {
  return request<T>(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}
