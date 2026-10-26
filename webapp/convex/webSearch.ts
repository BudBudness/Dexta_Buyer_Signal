type PublicSearchRow = {
  title?: unknown
  url?: unknown
  snippet?: unknown
  source?: unknown
}

type PublicSearchResponse = {
  search_results: PublicSearchRow[]
}

type SearxngResponse = {
  results?: Array<{
    title?: unknown
    url?: unknown
    content?: unknown
    engine?: unknown
  }>
}

function configuredHttpsUrl(raw: string): URL {
  let endpoint: URL
  try {
    endpoint = new URL(raw)
  } catch {
    throw new Error("DEXTA_PUBLIC_SEARCH_ENDPOINT must be a valid HTTPS URL")
  }
  if (endpoint.protocol !== "https:" || endpoint.username || endpoint.password) {
    throw new Error("DEXTA_PUBLIC_SEARCH_ENDPOINT must use HTTPS and contain no embedded credentials")
  }
  return endpoint
}

function isPublicWebUrl(value: unknown): value is string {
  if (typeof value !== "string" || value.length > 4096) return false
  try {
    const url = new URL(value)
    return (url.protocol === "https:" || url.protocol === "http:") && !url.username && !url.password
  } catch {
    return false
  }
}

/**
 * Calls a configured public-search provider. Set DEXTA_PUBLIC_SEARCH_PROVIDER
 * to "searxng" for a SearXNG instance, otherwise the generic POST adapter is
 * used. The endpoint is deployment configuration, never user input.
 *
 * SearXNG instances must have JSON output enabled. Many public instances
 * disable it, so configure an instance that explicitly supports format=json.
 */
export async function callPublicSearch(query: string): Promise<PublicSearchResponse> {
  const configuredEndpoint = process.env.DEXTA_PUBLIC_SEARCH_ENDPOINT?.trim()
  if (!configuredEndpoint) {
    throw new Error(
      "Public search is not configured. Set DEXTA_PUBLIC_SEARCH_ENDPOINT in Convex to an authorized HTTPS search-provider endpoint."
    )
  }

  const endpoint = configuredHttpsUrl(configuredEndpoint)
  const provider = (process.env.DEXTA_PUBLIC_SEARCH_PROVIDER?.trim().toLowerCase() || "generic")
  const headers: Record<string, string> = { accept: "application/json" }
  let requestUrl = endpoint.toString()
  const request: RequestInit = {
    method: "POST",
    headers: { ...headers, "content-type": "application/json" },
    body: JSON.stringify({ query }),
    signal: AbortSignal.timeout(15_000),
  }

  if (provider === "searxng") {
    endpoint.searchParams.set("q", query)
    endpoint.searchParams.set("format", "json")
    requestUrl = endpoint.toString()
    request.method = "GET"
    request.headers = headers
    delete request.body
  } else if (provider !== "generic") {
    throw new Error("DEXTA_PUBLIC_SEARCH_PROVIDER must be generic or searxng")
  } else {
    const token = process.env.DEXTA_PUBLIC_SEARCH_TOKEN?.trim()
    if (token) (request.headers as Record<string, string>).authorization = `Bearer ${token}`
  }

  const response = await fetch(requestUrl, request)
  if (!response.ok) {
    if (provider === "searxng" && response.status === 403) {
      throw new Error("SearXNG returned HTTP 403. This instance may have JSON output disabled; choose an instance with format=json enabled.")
    }
    throw new Error(`Public search provider returned HTTP ${response.status}`)
  }
  const contentType = response.headers.get("content-type") ?? ""
  if (!contentType.toLowerCase().includes("application/json")) {
    throw new Error("Public search provider must return application/json")
  }

  const body = await response.text()
  if (body.length > 2_000_000) {
    throw new Error("Public search provider response exceeded 2 MB")
  }

  let data: unknown
  try {
    data = JSON.parse(body)
  } catch {
    throw new Error("Public search provider returned invalid JSON")
  }

  let rows: PublicSearchRow[]
  if (provider === "searxng") {
    const results = (data as SearxngResponse | null)?.results
    if (!Array.isArray(results)) {
      throw new Error("SearXNG response must contain a results array")
    }
    rows = results.map((result) => ({
      title: result.title,
      url: result.url,
      snippet: result.content,
      source: result.engine ?? "SearXNG",
    }))
  } else {
    const searchResults = (data as PublicSearchResponse | null)?.search_results
    if (!Array.isArray(searchResults)) {
      throw new Error("Public search provider response must contain a search_results array")
    }
    rows = searchResults
  }

  // Reject malformed/non-web destinations before they can become stored evidence.
  return {
    search_results: rows
      .filter((row) => row && typeof row === "object" && isPublicWebUrl(row.url))
      .slice(0, 50),
  }
}
