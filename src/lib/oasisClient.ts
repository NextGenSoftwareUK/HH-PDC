/**
 * OASIS API Client
 * ─────────────────────────────────────────────────────────────────
 * Thin wrapper around the OASIS Web4 REST API.
 * Pattern mirrors: MCP/src/tools/starTools.ts (STARClient) and
 *                  Docs/Holonic Businesses/frontend/src/api/client.ts
 *
 * Endpoints used:
 *   POST /api/avatar/authenticate          → get JWT
 *   POST /api/data/save-holon              → create / update a holon
 *   GET  /api/data/load-holon/{id}         → fetch one holon
 *   GET  /api/data/load-holons-by-metadata → query by metaData key/value
 *   GET  /api/data/load-all-holons/{type}  → fetch all of a holonType
 *
 * All responses use the OASIS wrapper:
 *   { result: { result: <payload> }, isError: boolean, message: string | null }
 */

const BASE_URL =
  (import.meta as any).env?.VITE_OASIS_API_URL ?? 'https://api.oasisweb4.com'

// ── Types ────────────────────────────────────────────────────────────────────

/** Subset of the OASIS Holon object that matters for save/load */
export interface OASISHolon {
  /** 00000000-0000-0000-0000-000000000000 for a new holon */
  id: string
  name: string
  description?: string
  /** String name from HolonType enum, e.g. "GeoHotSpot", "Holon", "Quest" */
  holonType: string
  parentHolonId?: string
  metadata?: Record<string, unknown>
  isActive?: boolean
  /** Returned by the API after save */
  createdDate?: string
  modifiedDate?: string
  version?: number
}

export interface SaveHolonRequest {
  holon: OASISHolon
  saveChildren?: boolean
  recursive?: boolean
  continueOnError?: boolean
}

interface OASISWrapper<T> {
  result: { result: T } | null
  isError: boolean
  message: string | null
}

// ── Internal request helper ───────────────────────────────────────────────────

let _jwt: string | null = null

function authHeaders(): HeadersInit {
  const h: Record<string, string> = { 'Content-Type': 'application/json' }
  if (_jwt) h['Authorization'] = `Bearer ${_jwt}`
  return h
}

async function request<T>(
  method: 'GET' | 'POST' | 'DELETE',
  path: string,
  body?: unknown
): Promise<T> {
  const url = `${BASE_URL}${path}`
  const res = await fetch(url, {
    method,
    headers: authHeaders(),
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  const data: OASISWrapper<T> = await res.json().catch(() => ({
    result: null,
    isError: true,
    message: res.statusText,
  }))

  if (!res.ok || data.isError) {
    throw new Error(
      data.message ?? `OASIS API error ${res.status} on ${method} ${path}`
    )
  }

  // OASIS wraps responses in result.result — unwrap both layers
  return (data.result as any)?.result ?? (data.result as any) ?? data
}

// ── Auth ──────────────────────────────────────────────────────────────────────

/**
 * Authenticate an OASIS Avatar and store the JWT for subsequent requests.
 * Returns the JWT string.
 */
export async function authenticate(
  username: string,
  password: string
): Promise<string> {
  const res = await fetch(`${BASE_URL}/api/avatar/authenticate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  })
  const data = await res.json()
  if (!res.ok || data.isError) {
    throw new Error(data.message ?? 'OASIS authentication failed')
  }
  // JWT can be at result.result.jwtToken or result.jwtToken — find it
  const jwt = findJwt(data)
  if (!jwt) throw new Error('OASIS: JWT not found in authenticate response')
  _jwt = jwt
  return jwt
}

function findJwt(obj: unknown): string | null {
  if (!obj || typeof obj !== 'object') return null
  for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
    if (
      typeof v === 'string' &&
      v.length > 30 &&
      (k.toLowerCase().includes('jwt') || k.toLowerCase() === 'token')
    )
      return v
    const nested = findJwt(v)
    if (nested) return nested
  }
  return null
}

export function setToken(jwt: string) {
  _jwt = jwt
}

export function clearToken() {
  _jwt = null
}

// ── Holon CRUD ────────────────────────────────────────────────────────────────

/**
 * Create a new holon.  Pass a holon object with id = NULL_GUID.
 * Returns the saved holon with its server-assigned id.
 */
export async function saveHolon(req: SaveHolonRequest): Promise<OASISHolon> {
  return request<OASISHolon>('POST', '/api/data/save-holon', req)
}

/** Load a single holon by its GUID */
export async function loadHolon(id: string): Promise<OASISHolon> {
  return request<OASISHolon>('GET', `/api/data/load-holon/${id}`)
}

/** Load all holons of a given HolonType string (e.g. "GeoHotSpot") */
export async function loadAllHolons(holonType = 'GeoHotSpot'): Promise<OASISHolon[]> {
  return request<OASISHolon[]>('GET', `/api/data/load-all-holons/${holonType}`)
}

/**
 * Query holons by a metaData key/value pair.
 * Used to look up "does a holon already exist for this map place?"
 */
export async function loadHolonsByMetadata(
  metaKey: string,
  metaValue: string,
  holonType = 'GeoHotSpot'
): Promise<OASISHolon[]> {
  const params = new URLSearchParams({ metaKey, metaValue, holonType })
  return request<OASISHolon[]>(
    'GET',
    `/api/data/load-holons-by-metadata?${params}`
  )
}

// ── Convenience: upsert ───────────────────────────────────────────────────────

export const NULL_GUID = '00000000-0000-0000-0000-000000000000'

/**
 * Upsert a holon:
 *   1. Try to find existing holon with metaKey="hitchhikerMapId" = mapId
 *   2. If found, update (reuse existing id)
 *   3. If not, create new
 * Returns { holon, created: boolean }
 */
export async function upsertMapHolon(
  mapId: string,
  holonDef: Omit<OASISHolon, 'id'>
): Promise<{ holon: OASISHolon; created: boolean }> {
  // 1. Check for existing
  let existingId = NULL_GUID
  let created = true
  try {
    const existing = await loadHolonsByMetadata(
      'hitchhikerMapId',
      mapId,
      holonDef.holonType
    )
    if (existing.length > 0) {
      existingId = existing[0].id
      created = false
    }
  } catch {
    // Not found — create fresh
  }

  const holon = await saveHolon({
    holon: {
      id: existingId,
      ...holonDef,
      metadata: {
        ...holonDef.metadata,
        hitchhikerMapId: mapId, // stable lookup key
      },
      isActive: true,
    },
    saveChildren: false,
  })

  return { holon, created }
}
