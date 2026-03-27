export type ChapterNumber = 1 | 2 | 3 | 4 | 5 | 6

export interface Chapter {
  number: ChapterNumber
  name: string
  subtitle: string
  microseason: string
  months: string
  narrative: string
  mayaElement: string
  hook: string
  priceAdult: number
  priceChild: number
  available: boolean
  locked: boolean
  color: string
}

export interface FamilyMember {
  id: string
  firstName: string
  lastName: string
  email: string
  type: 'adult' | 'child'
  age?: number
  language: 'en' | 'es'
  isGroupLead?: boolean
}

export interface BookingState {
  chapter: Chapter | null
  date: string | null
  timeSlot: string | null
  members: FamilyMember[]
  audioConsent: boolean
  termsAccepted: boolean
  whatsapp: string
  step: 'chapter' | 'date' | 'register' | 'pay' | 'confirmation'
}

export interface TreeHolon {
  id: string
  name: string
  species: string
  commonName: string
  mayanName?: string
  estimatedAge: number
  health: 'good' | 'fair' | 'poor' | 'critical'
  canopyRadius: number
  gpsLat: number
  gpsLong: number
  co2Annual: number
  threatLevel: 'low' | 'medium' | 'high'
  observationCount: number
  firstRegistered: string
  lastObserved: string
  photo?: string
  sponsorName?: string
  latestObservation?: string
  registeredBy: string
}

export interface NFT {
  id: string
  name: string
  chapter: string
  rarity: 'common' | 'uncommon' | 'rare' | 'legendary'
  soulbound: boolean
  mintDate: string
  imageEmoji: string
  description: string
}

export interface PassportData {
  forestId: string
  avatarId: string
  firstName: string
  lastName: string
  karma: number
  tier: 'seed' | 'root' | 'flower' | 'storm' | 'guardian' | 'custodian'
  chaptersCompleted: number
  treesRegistered: number
  speciesDocumented: number
  volunteerHours: number
  co2Annual: number
  trees: TreeHolon[]
  nfts: NFT[]
  family: FamilyMemberSummary[]
}

export interface FamilyMemberSummary {
  name: string
  type: 'adult' | 'child'
  karma: number
  nftsEarned: number
  highlight: string
  emoji: string
}

export interface GuestActivity {
  date: string
  guestName: string
  chapter: string
  status: 'complete' | 'in-progress' | 'booked'
  karmaEarned: number
  optedInPublic: boolean
}

export interface HotelData {
  name: string
  tier: 'starter' | 'partner' | 'champion' | 'enterprise'
  karma: number
  rank: number
  totalHotels: number
  guestsThisMonth: number
  guestsDelta: number
  karmaThisMonth: number
  treesSponsored: number
  co2Attributed: number
  guestActivity: GuestActivity[]
  leaderboard: LeaderboardEntry[]
  notifications: HotelNotification[]
}

export interface LeaderboardEntry {
  rank: number
  name: string
  karma: number
  guests: number
  trees: number
  co2: number
  isCurrentHotel: boolean
}

export interface HotelNotification {
  id: string
  message: string
  time: string
  type: 'karma' | 'tree' | 'report' | 'season' | 'rank'
}

export interface ConversationSegment {
  time: string
  speaker: string
  speakerType: 'guide' | 'adult' | 'child'
  text: string
  treeName?: string
  treeSpecies?: string
}
