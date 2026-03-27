/**
 * Map Holon Definitions & Seeder
 * ─────────────────────────────────────────────────────────────────
 * This file translates every object in the Hitchhiker's Guide map
 * (playa-map.html PLACES array) into a proper OASIS GeoHotSpot Holon.
 *
 * The HolonType used is "GeoHotSpot" — this is the OASIS type built for
 * GPS-anchored physical location entities.  All domain-specific data
 * (tier, karma, descriptions, hotel GM, etc.) lives in metaData.
 *
 * USAGE (seed once to register all map objects as Holons):
 *   import { seedAllMapHolons } from './mapHolons'
 *   const result = await seedAllMapHolons(username, password)
 *   console.log(result)  // { placeId → holonId }
 *
 * USAGE (load live data for a single place):
 *   import { loadHolonForPlace } from './mapHolons'
 *   const holon = await loadHolonForPlace('grandhyatt')
 *
 * USAGE (update live stats after a quest completion):
 *   import { updatePlaceStats } from './mapHolons'
 *   await updatePlaceStats('grandhyatt', { karma: 13200, avatars: 58 })
 */

import {
  authenticate,
  upsertMapHolon,
  loadHolonsByMetadata,
  saveHolon,
  loadHolon,
  type OASISHolon,
} from './oasisClient'

// ── Map Place → Holon definition ──────────────────────────────────────────────

/**
 * Each entry mirrors a PLACES record in playa-map.html.
 * All geographic, descriptive, and stats data is stored in metaData
 * so it can be updated independently without re-seeding.
 */
export const MAP_HOLON_DEFINITIONS: Record<
  string,
  Omit<OASISHolon, 'id'>
> = {

  // ── Region Anchors ─────────────────────────────────────────────────────────

  pdc: {
    name: 'Playa del Carmen',
    description:
      'Gateway to the Riviera Maya and host city for the Pulmón Verde conservation-hospitality ecosystem. All hotel and conservation partners mapped at real GPS coordinates.',
    holonType: 'GeoHotSpot',
    metadata: {
      hitchhikerMapId: 'pdc',
      subType: 'RegionAnchor',
      gpsLat: 20.622,
      gpsLng: -87.079,
      region: 'Riviera Maya',
      sector: 'Playa del Carmen Centro',
      country: 'Mexico',
      state: 'Quintana Roo',
    },
  },

  riviera: {
    name: 'Riviera Maya',
    description: 'Coastal corridor spanning Playa del Carmen to Tulum.',
    holonType: 'GeoHotSpot',
    metadata: {
      hitchhikerMapId: 'riviera',
      subType: 'RegionAnchor',
      gpsLat: 20.752,
      gpsLng: -87.020,
      region: 'Riviera Maya',
      sector: 'Coastal Corridor',
    },
  },

  // ── Conservation Area ──────────────────────────────────────────────────────

  pv: {
    name: 'Pulmón Verde',
    description:
      '4.5-hectare last coastal jungle in Playa del Carmen. GPS-bounded conservation area in the Federal Maritime Zone. OASIS STAR OAPP anchor — every tree, animal, and volunteer interaction is a Holon.',
    holonType: 'GeoHotSpot',
    metadata: {
      hitchhikerMapId: 'pv',
      subType: 'ConservationArea',
      gpsLat: 20.642099,
      gpsLng: -87.058506,
      // GeoPolygon corners (user-confirmed 2026-03-27)
      geoPolygon: [
        [-87.061386, 20.639753], // SW
        [-87.059440, 20.638142], // SE
        [-87.055837, 20.644415], // NE
        [-87.057362, 20.646084], // NW
      ],
      areaHectares: 4.5,
      region: 'Playa del Carmen Norte',
      sector: 'Federal Maritime Zone · PDC Beach Norte',
      // Live stats — updated by quest completions and volunteer sessions
      treesRegistered: 0,
      species: 0,
      co2AnnualTons: 0,
      volunteerHours: 0,
      karma: 0,
      visitors: 0,
      features: 'Coastal jungle, nesting turtles, endemic orchids, cenote pools, Mayan medicinal plants',
      oappType: 'PulmonVerdeEcosystem',
    },
  },

  // ── Champion Hotels ─────────────────────────────────────────────────────────

  thompson: {
    name: 'Hyatt Centric Playa del Carmen',
    description:
      'Rebranded from Thompson Beach House in 2025. Two concepts: Downtown House (92 adults-only rooms on 5th Avenue) and Beach House (27 family suites beachfront). Mid-century modern decor, UMI rooftop dining, Alessia Dayclub.',
    holonType: 'GeoHotSpot',
    metadata: {
      hitchhikerMapId: 'thompson',
      subType: 'Hotel',
      tier: 'champion',
      gpsLat: 20.633,
      gpsLng: -87.064,
      region: 'Playa del Carmen Centro',
      sector: 'Calle 8 Norte · Beachfront',
      generalManager: 'Ankara Angulo',
      googleMaps: 'https://maps.google.com/?q=Hyatt+Centric+Playa+del+Carmen',
      // Live stats — updated by karma engine
      karma: 0,
      avatarsSent: 0,
      treesSponsored: 0,
      co2Attributed: 0,
      leaderboardRank: 0,
    },
  },

  elements: {
    name: 'The Elements',
    description:
      "PDC's only private beach resort, directly adjacent to Pulmón Verde. 70 oceanfront condo suites (1–3 bed). Private beach club 10am–6pm. One of Playa's largest pools. 8.8 Excellent (990+ reviews).",
    holonType: 'GeoHotSpot',
    metadata: {
      hitchhikerMapId: 'elements',
      subType: 'Hotel',
      tier: 'champion',
      pvNeighbour: true,
      gpsLat: 20.636,
      gpsLng: -87.061,
      region: 'Playa del Carmen Norte',
      sector: 'Av. Flamingo · Calle 46 · Las Brisas',
      googleMaps: 'https://maps.google.com/?q=The+Elements+Playa+del+Carmen+Calle+46',
      bookingRating: 8.8,
      rooms: 70,
      karma: 0,
      avatarsSent: 0,
      treesSponsored: 0,
      co2Attributed: 0,
      leaderboardRank: 0,
    },
  },

  grandhyatt: {
    name: 'Grand Hyatt Playa del Carmen',
    description:
      'Luxury resort at 1a Avenida & Calle 26, designed by Sordo Madaleno. 314 rooms, infinity pools, Cenote Spa, 200+ art pieces by César López Negrete.',
    holonType: 'GeoHotSpot',
    metadata: {
      hitchhikerMapId: 'grandhyatt',
      subType: 'Hotel',
      tier: 'champion',
      gpsLat: 20.6316,
      gpsLng: -87.0679,
      region: 'Playa del Carmen',
      sector: '1a Avenida · Calle 26',
      generalManager: 'Paul Wood',
      googleMaps: 'https://maps.google.com/?q=Grand+Hyatt+Playa+del+Carmen',
      karma: 0,
      avatarsSent: 0,
      treesSponsored: 0,
      co2Attributed: 0,
      leaderboardRank: 0,
    },
  },

  viceroy: {
    name: 'Viceroy Riviera Maya',
    description:
      'Five-star adults-only villa resort at Playa Xcalacoco, 10km north of PDC. GPS-confirmed at 20.665°N, -87.033°W.',
    holonType: 'GeoHotSpot',
    metadata: {
      hitchhikerMapId: 'viceroy',
      subType: 'Hotel',
      tier: 'champion',
      gpsLat: 20.665064,
      gpsLng: -87.033280,
      region: 'Riviera Maya Norte',
      sector: 'Playa Xcalacoco · 10km North of PDC',
      googleMaps: 'https://maps.google.com/?q=Viceroy+Riviera+Maya+Xcalacoco',
      karma: 0,
      avatarsSent: 0,
      treesSponsored: 0,
      co2Attributed: 0,
      leaderboardRank: 0,
    },
  },

  // ── Partner Hotels ──────────────────────────────────────────────────────────

  fairmont: {
    name: 'Fairmont Mayakoba',
    description:
      'Family-friendly luxury in the 620-acre Mayakoba complex. Home to El Camaleón golf course (first PGA Tour venue in Latin America).',
    holonType: 'GeoHotSpot',
    metadata: {
      hitchhikerMapId: 'fairmont',
      subType: 'Hotel',
      tier: 'partner',
      gpsLat: 20.688,
      gpsLng: -87.027,
      region: 'Playa del Carmen Norte',
      sector: 'Mayakoba Lagoon · KM 298',
      generalManager: 'Jacco Van Teeffelen',
      gmAward: 'Best GM in Mexico 2023',
      googleMaps: 'https://maps.google.com/?q=Fairmont+Mayakoba',
      karma: 0,
      avatarsSent: 0,
      treesSponsored: 0,
      co2Attributed: 0,
      leaderboardRank: 0,
    },
  },

  banyan: {
    name: 'Banyan Tree Mayakoba',
    description: 'Award-winning spa and wellness resort in the Mayakoba lagoon system.',
    holonType: 'GeoHotSpot',
    metadata: {
      hitchhikerMapId: 'banyan',
      subType: 'Hotel',
      tier: 'partner',
      gpsLat: 20.691,
      gpsLng: -87.026,
      region: 'Playa del Carmen Norte',
      sector: 'Mayakoba Lagoon',
      googleMaps: 'https://maps.google.com/?q=Banyan+Tree+Mayakoba',
      karma: 0,
      avatarsSent: 0,
      treesSponsored: 0,
      co2Attributed: 0,
      leaderboardRank: 0,
    },
  },

  rosewood: {
    name: 'Rosewood Mayakoba',
    description:
      'Ultra-luxury resort built along winding lagoons and a mile-long white sand beach. 129 suites with plunge pools and butler service. Best Hotel in Mexico (US News 2025) · 2 Michelin Keys 2024.',
    holonType: 'GeoHotSpot',
    metadata: {
      hitchhikerMapId: 'rosewood',
      subType: 'Hotel',
      tier: 'partner',
      gpsLat: 20.694,
      gpsLng: -87.025,
      region: 'Playa del Carmen Norte',
      sector: 'Mayakoba Lagoon',
      generalManager: 'Edouard Grosmangin',
      gmTitle: 'Managing Director · Regional VP Mexico & South America',
      awards: ['Best Hotel in Mexico – US News 2025', '2 Michelin Keys 2024'],
      googleMaps: 'https://maps.google.com/?q=Rosewood+Mayakoba',
      karma: 0,
      avatarsSent: 0,
      treesSponsored: 0,
      co2Attributed: 0,
      leaderboardRank: 0,
    },
  },

  xcaret: {
    name: 'Xcaret Hotel',
    description: 'Part of the Xcaret eco-tourism empire. Natural partnership — guests primed for nature-based experiences.',
    holonType: 'GeoHotSpot',
    metadata: {
      hitchhikerMapId: 'xcaret',
      subType: 'Hotel',
      tier: 'partner',
      gpsLat: 20.578,
      gpsLng: -87.110,
      region: 'Playa del Carmen Sur',
      sector: 'Xcaret Eco-Park · KM 282',
      googleMaps: 'https://maps.google.com/?q=Xcaret+Hotel+Playa+del+Carmen',
      karma: 0,
      avatarsSent: 0,
      treesSponsored: 0,
      co2Attributed: 0,
      leaderboardRank: 0,
    },
  },

  kore: {
    name: 'Kore Tulum',
    description: 'Design-forward eco-resort in Tulum hotel zone (~65km south). Highest trees-per-guest ratio in the network.',
    holonType: 'GeoHotSpot',
    metadata: {
      hitchhikerMapId: 'kore',
      subType: 'Hotel',
      tier: 'partner',
      gpsLat: 20.178,
      gpsLng: -87.447,
      region: 'Tulum',
      sector: 'Tulum Hotel Zone · Boca Paila KM 3.8',
      googleMaps: 'https://maps.google.com/?q=Kore+Tulum',
      karma: 0,
      avatarsSent: 0,
      treesSponsored: 0,
      co2Attributed: 0,
      leaderboardRank: 0,
    },
  },

  // ── Starter Hotels ──────────────────────────────────────────────────────────

  mamitas: {
    name: 'Mamitas Beach Club',
    description: "Iconic beach club hotel at the heart of PDC's social scene.",
    holonType: 'GeoHotSpot',
    metadata: {
      hitchhikerMapId: 'mamitas',
      subType: 'Hotel',
      tier: 'starter',
      gpsLat: 20.644,
      gpsLng: -87.064,
      region: 'Playa del Carmen',
      sector: 'Calle 28 Norte · Beachfront',
      googleMaps: 'https://maps.google.com/?q=Mamitas+Beach+Club+Playa+del+Carmen',
      karma: 0,
      avatarsSent: 0,
      treesSponsored: 0,
      co2Attributed: 0,
      leaderboardRank: 0,
    },
  },

  hotelb: {
    name: 'Hotel B Playa',
    description: 'Boutique design hotel on 5th Avenue.',
    holonType: 'GeoHotSpot',
    metadata: {
      hitchhikerMapId: 'hotelb',
      subType: 'Hotel',
      tier: 'starter',
      gpsLat: 20.641,
      gpsLng: -87.074,
      region: 'Playa del Carmen',
      sector: '5th Avenue Boutique Zone',
      googleMaps: 'https://maps.google.com/?q=Hotel+B+Playa+del+Carmen',
      karma: 0,
      avatarsSent: 0,
      treesSponsored: 0,
      co2Attributed: 0,
      leaderboardRank: 0,
    },
  },

  aldea: {
    name: 'Aldea Thai',
    description: "Thai-inspired boutique hotel steps from Mamita's Beach Club at Calle 28 Norte, PDC centro. GPS: 20.632°N, -87.067°W.",
    holonType: 'GeoHotSpot',
    metadata: {
      hitchhikerMapId: 'aldea',
      subType: 'Hotel',
      tier: 'starter',
      gpsLat: 20.631588,
      gpsLng: -87.066743,
      region: 'Playa del Carmen Centro',
      sector: "Calle 28 Norte · 0.3mi from Mamita's",
      googleMaps: 'https://maps.google.com/?q=Aldea+Thai+Playa+del+Carmen',
      karma: 0,
      avatarsSent: 0,
      treesSponsored: 0,
      co2Attributed: 0,
      leaderboardRank: 0,
    },
  },

  // ── Gyms & Fight Sports ─────────────────────────────────────────────────────

  union: {
    name: 'The Union Muay Thai',
    description:
      "Old-school Muay Thai and boxing gym run by owner-instructor Big Mike, with nearly two decades of experience. Disciplines include Muay Thai, boxing, MMA and Jiu Jitsu. Gym mascot Pepe the dog presides over 'Pepe's Fighting Team.'",
    holonType: 'GeoHotSpot',
    metadata: {
      hitchhikerMapId: 'union',
      subType: 'Gym',
      gpsLat: 20.638,
      gpsLng: -87.077,
      region: 'Playa del Carmen',
      sector: 'Zazil-ha · Av. 10 Norte',
      address: 'Av. 10 Manzana 144 Lote 12, Zazil-ha, PDC',
      phone: '984-147-4454',
      website: 'https://www.theunionmuaythaiboxing.com',
      headInstructor: 'Big Mike',
      disciplines: ['Muay Thai', 'Boxing', 'MMA', 'Jiu Jitsu'],
      classesPerDay: 6,
      instructorExperienceYears: 18,
      tripadvisorRank: 10,
      tripadvisorTotal: 62,
      tripadvisorRating: 5.0,
      tripadvisorReviewCount: 36,
      tripadvisorUrl:
        'https://www.tripadvisor.com/Attraction_Review-g150812-d10394285-Reviews-The_Union-Playa_del_Carmen_Yucatan_Peninsula.html',
    },
  },
}

// ── ID registry ───────────────────────────────────────────────────────────────

/**
 * In-memory registry of { mapId → OASIS holon GUID }.
 * Populated by seedAllMapHolons() or loadHolonRegistry().
 * In production this should be persisted (localStorage, backend, env).
 */
export const HOLON_REGISTRY: Record<string, string> = {}

// ── Seeder ────────────────────────────────────────────────────────────────────

export interface SeedResult {
  total: number
  created: number
  updated: number
  failed: string[]
  registry: Record<string, string>
}

/**
 * Seed all map objects as OASIS GeoHotSpot Holons.
 * Safe to re-run — uses upsertMapHolon which checks for existing holons first.
 *
 * @param username  OASIS Avatar username (admin)
 * @param password  OASIS Avatar password
 * @param ids       Optional subset of mapIds to seed (default: all)
 */
export async function seedAllMapHolons(
  username: string,
  password: string,
  ids?: string[]
): Promise<SeedResult> {
  await authenticate(username, password)

  const targets = ids
    ? ids.filter((id) => MAP_HOLON_DEFINITIONS[id])
    : Object.keys(MAP_HOLON_DEFINITIONS)

  const result: SeedResult = {
    total: targets.length,
    created: 0,
    updated: 0,
    failed: [],
    registry: {},
  }

  for (const mapId of targets) {
    try {
      const def = MAP_HOLON_DEFINITIONS[mapId]
      const { holon, created } = await upsertMapHolon(mapId, def)
      HOLON_REGISTRY[mapId] = holon.id
      result.registry[mapId] = holon.id
      if (created) result.created++
      else result.updated++
      console.log(`[OASIS] ${created ? 'Created' : 'Updated'} holon for "${mapId}" → ${holon.id}`)
    } catch (err: any) {
      console.error(`[OASIS] Failed to seed "${mapId}":`, err.message)
      result.failed.push(mapId)
    }
  }

  return result
}

// ── Live data helpers ─────────────────────────────────────────────────────────

/** Load the current live holon for a map place by its mapId */
export async function loadHolonForPlace(mapId: string): Promise<OASISHolon | null> {
  // 1. Try registry (fast)
  if (HOLON_REGISTRY[mapId]) {
    return loadHolon(HOLON_REGISTRY[mapId])
  }
  // 2. Fall back to metadata query
  const def = MAP_HOLON_DEFINITIONS[mapId]
  if (!def) return null
  const results = await loadHolonsByMetadata(
    'hitchhikerMapId',
    mapId,
    def.holonType
  )
  if (results.length > 0) {
    HOLON_REGISTRY[mapId] = results[0].id
    return results[0]
  }
  return null
}

/**
 * Update live stats for a map place (karma, avatarsSent, treesSponsored, etc.)
 * Merges with existing metadata — partial updates only.
 */
export async function updatePlaceStats(
  mapId: string,
  stats: Record<string, unknown>,
  username?: string,
  password?: string
): Promise<OASISHolon> {
  if (username && password) await authenticate(username, password)

  const existing = await loadHolonForPlace(mapId)
  if (!existing) throw new Error(`No holon found for mapId "${mapId}"`)

  return saveHolon({
    holon: {
      ...existing,
      metadata: {
        ...(existing.metadata ?? {}),
        ...stats,
        hitchhikerMapId: mapId,
      },
    },
    saveChildren: false,
  })
}

/**
 * Load the full registry from OASIS (all GeoHotSpot holons tagged
 * with hitchhikerMapId).  Useful on app startup to hydrate HOLON_REGISTRY.
 */
export async function loadHolonRegistry(): Promise<Record<string, string>> {
  const mapIds = Object.keys(MAP_HOLON_DEFINITIONS)
  // Batch-load: query each mapId in parallel (cap at 5 concurrent)
  const chunks = []
  for (let i = 0; i < mapIds.length; i += 5) {
    chunks.push(mapIds.slice(i, i + 5))
  }
  for (const chunk of chunks) {
    await Promise.all(
      chunk.map(async (mapId) => {
        try {
          const results = await loadHolonsByMetadata('hitchhikerMapId', mapId, 'GeoHotSpot')
          if (results.length > 0) HOLON_REGISTRY[mapId] = results[0].id
        } catch {
          // Not yet seeded — ok
        }
      })
    )
  }
  return { ...HOLON_REGISTRY }
}
