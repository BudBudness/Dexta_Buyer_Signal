type PublicSearchRow = {
  title?: unknown
  url?: unknown
  snippet?: unknown
  source?: unknown
}

type PublicSearchResponse = {
  search_results?: PublicSearchRow[]
}

/**
 * Calls an explicitly configured public-search provider.
 * The endpoint is deployment configuration, never user input. Do not point it
 * at private/internal services. Provider responses must expose search_results.
 */
export async function callPublicSearch(query: string): Promise<PublicSearchResponse> {
  const configuredEndpoint = process.env.DEXTA_PUBLIC_SEARCH_ENDPOINT?.trim()
  if (!configuredEndpoint) {
    throw new Error(
      "Public search is not configured. Set DEXTA_PUBLIC_SEARCH_ENDPOINT in Convex to an authorized HTTPS search-provider endpoint."
    )
  }

  let endpoint: URL
  try {
    endpoint = new URL(configuredEndpoint)
  } catch {
    throw new Error("DEXTA_PUBLIC_SEARCH_ENDPOINT must be a valid HTTPS URL")
  }
  if (endpoint.protocol !== "https:" || endpoint.username || endpoint.password) {
    throw new Error("DEXTA_PUBLIC_SEARCH_ENDPOINT must use HTTPS and contain no embedded credentials")
  }

  const headers: Record<string, string> = {
    "content-type": "application/json",
    "accept": "application/json",
  }
  const token = process.env.DEXTA_PUBLIC_SEARCH_TOKEN?.trim()
  if (token) headers.authorization = `Bearer ${token}`

  const response = await fetch(endpoint.toString(), {
    method: "POST",
    headers,
    body: JSON.stringify({ query }),
    signal: AbortSignal.timeout(15_000),
  })

  if (!response.ok) {
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
  if (!data || typeof data !== "object" || !Array.isArray((data as PublicSearchResponse).search_results)) {
    throw new Error("Public search provider response must contain a search_results array")
  }

  return data as PublicSearchResponse
}
