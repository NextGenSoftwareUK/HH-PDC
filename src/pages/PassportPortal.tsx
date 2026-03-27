import { useState } from 'react'
import { Routes, Route, Link } from 'react-router-dom'
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet'
import { MOCK_PASSPORT, MOCK_TRANSCRIPT } from '../lib/mock-data'
import type { TreeHolon, NFT } from '../lib/types'
import { Award, BookOpen, BarChart2, ExternalLink, Download, Share2, ChevronRight } from 'lucide-react'
import 'leaflet/dist/leaflet.css'

const TIER_CONFIG: Record<string, { label: string; color: string; next?: string }> = {
  seed: { label: 'Seed 🌱', color: '#4A9B4A', next: 'Root' },
  root: { label: 'Root 🪨', color: '#8B6914', next: 'Flower' },
  flower: { label: 'Flower 🌸', color: '#B85C8A', next: 'Storm' },
  storm: { label: 'Storm ⛈️', color: '#5A5AA0', next: 'Guardian' },
  guardian: { label: 'Guardian 🦅', color: '#1A7A7A', next: 'Custodian' },
  custodian: { label: 'Custodian ✨', color: '#C9A84C' },
}

const RARITY_COLORS: Record<string, string> = {
  common: 'text-jungle-300 bg-jungle-700',
  uncommon: 'text-blue-300 bg-blue-900/40',
  rare: 'text-purple-300 bg-purple-900/40',
  legendary: 'text-gold-400 bg-yellow-900/40',
}

const CHAPTER_PROGRESS = [
  { n: 1, name: 'La Semilla', done: true },
  { n: 2, name: 'La Raíz', done: false, season: 'Available Mar–May' },
  { n: 3, name: 'La Flor', done: false, locked: true },
  { n: 4, name: 'La Tormenta', done: false, locked: true },
  { n: 5, name: 'El Retorno', done: false, locked: true },
  { n: 6, name: 'El Círculo', done: false, locked: true },
]

const ACTIVITY = [
  { icon: '✅', text: 'Chapter 1 complete (2h 18min)', date: 'Jan 15' },
  { icon: '🌳', text: '10 trees registered', date: 'Jan 15' },
  { icon: '🦎', text: 'Zaphod the iguana spotted', date: 'Jan 15' },
  { icon: '🏅', text: 'NFT: "Sembrador — The Sower" minted', date: 'Jan 15' },
  { icon: '🏅', text: 'NFT: "Wildlife Witness — Zaphod" minted', date: 'Jan 15' },
  { icon: '🌱', text: 'Conservation Passport activated · Tier: Seed', date: 'Jan 15' },
  { icon: '⏱️', text: '2.3 PGT hours earned', date: 'Jan 15' },
]

export function PassportPortal() {
  return (
    <div className="min-h-screen bg-jungle-900">
      <Routes>
        <Route path="/" element={<PassportHome />} />
        <Route path="/trees" element={<MyTrees />} />
        <Route path="/nfts" element={<MyNFTs />} />
        <Route path="/story" element={<MyStory />} />
        <Route path="/impact" element={<ImpactDashboard />} />
        <Route path="/family" element={<FamilyView />} />
      </Routes>
    </div>
  )
}

function PassportHome() {
  const p = MOCK_PASSPORT
  const tier = TIER_CONFIG[p.tier]

  return (
    <div className="pt-20 pb-20 px-6">
      <div className="max-w-5xl mx-auto">
        {/* Chapter 2 banner */}
        <div className="card border-jungle-500 bg-jungle-700/60 mb-8 flex items-center justify-between gap-4">
          <div>
            <p className="text-jungle-300 text-xs uppercase tracking-wider mb-1">Chapter 2 opens March–May</p>
            <p className="text-jungle-100 font-display text-lg">La Raíz — The Root.</p>
            <p className="text-jungle-400 text-sm">Your 10 trees need a check-up. Come back and see what changed.</p>
          </div>
          <Link to="/book" className="btn-primary text-sm whitespace-nowrap flex items-center gap-1">
            Book Ch. 2 <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Left — Forest Record */}
          <div>
            <div className="card mb-4">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="label mb-1">Conservation Passport</p>
                  <h2 className="font-display text-2xl text-jungle-100">{p.firstName} {p.lastName}</h2>
                  <p className="text-jungle-400 text-sm font-mono">Forest ID: {p.forestId}</p>
                </div>
                <div
                  className="px-3 py-1.5 rounded-full text-xs font-medium"
                  style={{ backgroundColor: tier.color + '30', color: tier.color }}
                >
                  {tier.label}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="text-center">
                  <p className="text-2xl font-display text-jungle-100">{p.karma}</p>
                  <p className="text-xs text-jungle-400">Karma</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-display text-jungle-100">{p.treesRegistered}</p>
                  <p className="text-xs text-jungle-400">Trees</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-display text-jungle-100">{p.speciesDocumented}</p>
                  <p className="text-xs text-jungle-400">Species</p>
                </div>
              </div>
            </div>

            <div className="card">
              <p className="label mb-3">Chapter Progress</p>
              <div className="space-y-2">
                {CHAPTER_PROGRESS.map(ch => (
                  <div key={ch.n} className={`flex items-center gap-3 py-2 px-3 rounded-lg ${ch.done ? 'bg-jungle-600/50' : ch.locked ? 'opacity-35' : 'bg-jungle-800/50'}`}>
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs flex-shrink-0 ${ch.done ? 'bg-jungle-400 text-jungle-900' : 'border border-jungle-500 text-jungle-500'}`}>
                      {ch.done ? '✓' : ch.n}
                    </div>
                    <span className={`text-sm flex-1 ${ch.done ? 'text-jungle-200' : 'text-jungle-400'}`}>Ch.{ch.n} — {ch.name}</span>
                    {ch.done && <span className="text-xs text-jungle-400">Complete</span>}
                    {!ch.done && ch.season && <span className="text-xs text-jungle-500">{ch.season}</span>}
                    {ch.locked && <span className="text-xs text-jungle-600">Locked</span>}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right — Activity Feed */}
          <div>
            <div className="card">
              <p className="label mb-4">Recent Activity</p>
              <div className="space-y-3">
                {ACTIVITY.map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <span className="text-base flex-shrink-0">{item.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-jungle-200 leading-snug">{item.text}</p>
                      <p className="text-xs text-jungle-500 mt-0.5">{item.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick links */}
            <div className="grid grid-cols-2 gap-3 mt-4">
              {[
                { to: '/passport/trees', icon: <span className="text-base">🌳</span>, label: 'My Trees', sub: `${MOCK_PASSPORT.treesRegistered} registered` },
                { to: '/passport/nfts', icon: <Award className="w-4 h-4" />, label: 'NFT Collection', sub: `${MOCK_PASSPORT.nfts.length} NFTs` },
                { to: '/passport/story', icon: <BookOpen className="w-4 h-4" />, label: 'My Story', sub: 'Ch. 1 transcript' },
                { to: '/passport/impact', icon: <BarChart2 className="w-4 h-4" />, label: 'Impact', sub: `${MOCK_PASSPORT.co2Annual}t CO₂/year` },
              ].map(({ to, icon, label, sub }) => (
                <Link key={to} to={to} className="card hover:border-jungle-400 hover:bg-jungle-600 transition-all flex items-center gap-3">
                  <div className="text-jungle-400">{icon}</div>
                  <div>
                    <p className="text-sm text-jungle-200 font-medium">{label}</p>
                    <p className="text-xs text-jungle-400">{sub}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function MyTrees() {
  const [selected, setSelected] = useState<TreeHolon | null>(null)
  const trees = MOCK_PASSPORT.trees

  return (
    <div className="pt-20 pb-20 px-6">
      <div className="max-w-5xl mx-auto">
        <h2 className="font-display text-3xl text-jungle-100 mb-1">My Trees</h2>
        <p className="text-jungle-400 mb-6">10 trees registered · {MOCK_PASSPORT.co2Annual}t CO₂ sequestered per year</p>

        {/* Map */}
        <div className="h-80 rounded-xl overflow-hidden mb-8 border border-jungle-600">
          <MapContainer
            center={[20.6310, -87.0735]}
            zoom={17}
            style={{ height: '100%', width: '100%' }}
            attributionControl={false}
          >
            <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" />
            {trees.map(t => (
              <CircleMarker
                key={t.id}
                center={[t.gpsLat, t.gpsLong]}
                radius={10}
                pathOptions={{ color: '#4A9B4A', fillColor: '#4A9B4A', fillOpacity: 0.8, weight: 2 }}
                eventHandlers={{ click: () => setSelected(t) }}
              >
                <Popup>{t.commonName}</Popup>
              </CircleMarker>
            ))}
          </MapContainer>
        </div>

        {selected && (
          <div className="card mb-6 border-jungle-400">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-display text-xl text-jungle-100">{selected.commonName}</h3>
                <p className="text-jungle-400 text-sm italic">{selected.species}</p>
                {selected.mayanName && <p className="text-jungle-500 text-xs">Maya: {selected.mayanName}</p>}
              </div>
              <button onClick={() => setSelected(null)} className="text-jungle-500 hover:text-jungle-300 text-sm">✕</button>
            </div>
            <div className="grid grid-cols-3 gap-4 text-center mb-3">
              <div><p className="text-lg text-jungle-100">{selected.estimatedAge}yr</p><p className="text-xs text-jungle-500">Est. age</p></div>
              <div><p className="text-lg text-jungle-100">{selected.co2Annual}t</p><p className="text-xs text-jungle-500">CO₂/year</p></div>
              <div><p className="text-lg text-jungle-100">{selected.observationCount}</p><p className="text-xs text-jungle-500">Observations</p></div>
            </div>
            {selected.latestObservation && (
              <p className="text-jungle-400 text-sm italic border-t border-jungle-600 pt-3 mt-3">{selected.latestObservation}</p>
            )}
            <p className="text-xs text-jungle-500 mt-2">Registered by {selected.registeredBy} · {selected.firstRegistered}</p>
          </div>
        )}

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {trees.map((tree, i) => (
            <button
              key={tree.id}
              onClick={() => setSelected(tree)}
              className="card text-left hover:border-jungle-400 transition-all"
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="text-jungle-100 font-medium">{tree.commonName}</p>
                  <p className="text-xs italic text-jungle-400">{tree.species}</p>
                </div>
                <span className={`w-2 h-2 rounded-full mt-1 flex-shrink-0 ${tree.health === 'good' ? 'bg-green-400' : tree.health === 'fair' ? 'bg-yellow-400' : 'bg-red-400'}`} />
              </div>
              <div className="flex gap-3 text-xs text-jungle-400">
                <span>~{tree.estimatedAge}yr</span>
                <span>{tree.co2Annual}t CO₂/yr</span>
              </div>
              <p className="text-xs text-jungle-500 mt-1 font-mono">Tree #{(i + 1).toString().padStart(2, '0')}</p>
            </button>
          ))}
        </div>

        <div className="card mt-6 text-center">
          <p className="text-jungle-400 text-sm">Total CO₂ sequestration across your 10 trees:</p>
          <p className="font-display text-3xl text-jungle-100 mt-1">~{MOCK_PASSPORT.co2Annual} tonnes per year</p>
          <p className="text-jungle-500 text-xs mt-1">Equivalent to approximately 8 return flights London → Mexico City</p>
        </div>
      </div>
    </div>
  )
}

function MyNFTs() {
  const nfts = MOCK_PASSPORT.nfts

  return (
    <div className="pt-20 pb-20 px-6">
      <div className="max-w-5xl mx-auto">
        <h2 className="font-display text-3xl text-jungle-100 mb-1">NFT Collection</h2>
        <p className="text-jungle-400 mb-8">{nfts.length} NFTs earned · Chapter 1 complete</p>

        {/* Passport NFT hero */}
        {nfts.filter(n => n.soulbound).map(nft => (
          <div key={nft.id} className="card border-gold-500/50 bg-gradient-to-br from-jungle-700 to-jungle-800 mb-8">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-xl bg-gold-500/20 border border-gold-500/40 flex items-center justify-center text-3xl flex-shrink-0">
                {nft.imageEmoji}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-display text-xl text-jungle-100">{nft.name}</h3>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-gold-500/20 text-gold-400">Soulbound</span>
                </div>
                <p className="text-jungle-400 text-sm">{nft.chapter}</p>
                <p className="text-jungle-300 text-sm mt-2 leading-relaxed">{nft.description}</p>
                <div className="flex gap-3 mt-3">
                  <button className="flex items-center gap-1.5 text-xs text-jungle-400 hover:text-jungle-200 transition-colors">
                    <Share2 className="w-3 h-3" /> Share
                  </button>
                  <button className="flex items-center gap-1.5 text-xs text-jungle-400 hover:text-jungle-200 transition-colors">
                    <Download className="w-3 h-3" /> Download
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {nfts.filter(n => !n.soulbound).map(nft => (
            <NFTCard key={nft.id} nft={nft} />
          ))}
        </div>

        <div className="card mt-8 text-center border-dashed border-jungle-600">
          <p className="text-jungle-400 text-sm mb-1">Complete Chapter 2 to unlock more NFTs</p>
          <p className="text-jungle-500 text-xs">La Raíz opens March–May 2026</p>
          <Link to="/book" className="inline-block mt-3 btn-secondary text-sm">Book Chapter 2</Link>
        </div>
      </div>
    </div>
  )
}

function NFTCard({ nft }: { nft: NFT }) {
  return (
    <div className="card hover:border-jungle-400 transition-all">
      <div className="w-12 h-12 rounded-xl bg-jungle-600 flex items-center justify-center text-2xl mb-3">
        {nft.imageEmoji}
      </div>
      <h3 className="text-jungle-100 font-medium text-sm mb-0.5">{nft.name}</h3>
      <p className="text-jungle-500 text-xs mb-2">{nft.chapter}</p>
      <p className="text-jungle-400 text-xs leading-relaxed mb-3">{nft.description}</p>
      <div className="flex items-center justify-between">
        <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${RARITY_COLORS[nft.rarity]}`}>{nft.rarity}</span>
        <button className="text-jungle-500 hover:text-jungle-300 transition-colors">
          <ExternalLink className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  )
}

function MyStory() {
  const segments = MOCK_TRANSCRIPT

  return (
    <div className="pt-20 pb-20 px-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-10 text-center">
          <p className="label mb-2">Your Chapter 1 Story</p>
          <h2 className="font-display text-4xl text-jungle-100 mb-1">La Semilla</h2>
          <p className="font-display italic text-jungle-300 text-lg">The Seed</p>
          <div className="flex items-center justify-center gap-4 mt-4 text-sm text-jungle-400">
            <span>15 January 2026</span>
            <span>·</span>
            <span>Guide: Rosa Canché</span>
            <span>·</span>
            <span>2h 18min</span>
          </div>
        </div>

        {/* Transcript segments */}
        <div className="space-y-0">
          {segments.map((seg, i) => {
            const isNewTree = seg.treeName && (i === 0 || seg.treeName !== segments[i - 1]?.treeName)
            return (
              <div key={i}>
                {isNewTree && (
                  <div className="flex items-center gap-3 my-6">
                    <div className="flex-1 h-px bg-jungle-700" />
                    <div className="text-center">
                      <p className="text-jungle-300 text-xs font-medium">{seg.treeName}</p>
                      {seg.treeSpecies && <p className="text-jungle-500 text-xs italic">{seg.treeSpecies}</p>}
                    </div>
                    <div className="flex-1 h-px bg-jungle-700" />
                  </div>
                )}
                <div className={`py-3 border-l-2 pl-4 ${seg.speakerType === 'guide' ? 'border-jungle-500' : seg.speakerType === 'child' ? 'border-blue-600' : 'border-jungle-700'}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs font-medium ${seg.speakerType === 'guide' ? 'text-jungle-400' : seg.speakerType === 'child' ? 'text-blue-400' : 'text-purple-400'}`}>
                      {seg.speaker}
                    </span>
                    <span className="text-jungle-600 text-xs">{seg.time}</span>
                  </div>
                  <p className={`text-sm leading-relaxed ${seg.speakerType === 'guide' ? 'text-jungle-200' : 'text-jungle-300'}`}>
                    {seg.speakerType === 'guide' ? <em>"{seg.text}"</em> : `"${seg.text}"`}
                  </p>
                </div>
              </div>
            )
          })}
        </div>

        {/* Footer */}
        <div className="mt-12 card text-center">
          <p className="text-jungle-400 text-sm mb-3">This story is permanently stored in the Pulmón Verde archive.</p>
          <div className="flex justify-center gap-3">
            <button className="btn-secondary text-sm flex items-center gap-2"><Download className="w-3.5 h-3.5" /> Download PDF</button>
            <button className="btn-secondary text-sm flex items-center gap-2"><Share2 className="w-3.5 h-3.5" /> Share</button>
          </div>
        </div>
      </div>
    </div>
  )
}

function ImpactDashboard() {
  const p = MOCK_PASSPORT

  return (
    <div className="pt-20 pb-20 px-6">
      <div className="max-w-3xl mx-auto">
        <h2 className="font-display text-3xl text-jungle-100 mb-1">Your Impact</h2>
        <p className="text-jungle-400 mb-8">Chapter 1 · 15 January 2026</p>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          {[
            { value: p.treesRegistered, unit: 'trees registered', icon: '🌳' },
            { value: p.speciesDocumented, unit: 'species documented', icon: '🔭' },
            { value: `${p.co2Annual}t`, unit: 'CO₂ per year', icon: '🌿' },
            { value: `${p.volunteerHours}h`, unit: 'forest hours', icon: '⏱️' },
            { value: p.karma, unit: 'Karma earned', icon: '✨' },
            { value: `1 / 6`, unit: 'chapters complete', icon: '📖' },
          ].map(({ value, unit, icon }) => (
            <div key={unit} className="stat-card">
              <span className="text-2xl">{icon}</span>
              <p className="font-display text-3xl text-jungle-100">{value}</p>
              <p className="text-xs text-jungle-400">{unit}</p>
            </div>
          ))}
        </div>

        <div className="card mb-6">
          <p className="text-jungle-300 font-medium mb-1">CO₂ in context</p>
          <p className="text-jungle-400 text-sm mb-3">Your 10 trees sequester an estimated {p.co2Annual} tonnes of CO₂ per year.</p>
          <div className="space-y-2 text-sm">
            {[
              { label: '≈ 8 return flights London → Mexico City', pct: 85 },
              { label: '≈ 1.4 years of average UK car use', pct: 60 },
              { label: '≈ 420 hours of streaming video', pct: 15 },
            ].map(({ label, pct }) => (
              <div key={label}>
                <div className="flex justify-between text-xs text-jungle-400 mb-1"><span>{label}</span></div>
                <div className="h-1.5 bg-jungle-700 rounded-full"><div className="h-1.5 bg-jungle-400 rounded-full" style={{ width: `${pct}%` }} /></div>
              </div>
            ))}
          </div>
        </div>

        <div className="card mb-6">
          <p className="text-jungle-300 font-medium mb-3">Sponsor a tree</p>
          <p className="text-jungle-400 text-sm mb-3">Give a tree a name. Dedicate it to someone. For $150/year, your sponsored tree carries your dedication forever in the forest record.</p>
          <button className="btn-secondary text-sm">Sponsor a Tree → </button>
        </div>
      </div>
    </div>
  )
}

function FamilyView() {
  const family = MOCK_PASSPORT.family

  return (
    <div className="pt-20 pb-20 px-6">
      <div className="max-w-3xl mx-auto">
        <h2 className="font-display text-3xl text-jungle-100 mb-1">The Reyes-Miller Family</h2>
        <p className="text-jungle-400 mb-8">Chapter 1 · Pulmón Verde · 15 January 2026</p>

        <div className="card mb-6 text-center">
          <p className="label mb-2">Combined Family Impact</p>
          <div className="grid grid-cols-3 gap-4 mt-2">
            <div><p className="font-display text-3xl text-jungle-100">10</p><p className="text-xs text-jungle-400">Trees</p></div>
            <div><p className="font-display text-3xl text-jungle-100">2,025</p><p className="text-xs text-jungle-400">Total Karma</p></div>
            <div><p className="font-display text-3xl text-jungle-100">4</p><p className="text-xs text-jungle-400">Species</p></div>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          {family.map(member => (
            <div key={member.name} className="card">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl">{member.emoji}</span>
                <div>
                  <p className="text-jungle-100 font-medium">{member.name}</p>
                  <p className="text-xs text-jungle-400 capitalize">{member.type}</p>
                </div>
              </div>
              <p className="text-jungle-300 text-sm italic mb-3">"{member.highlight}"</p>
              <div className="flex gap-4 text-xs text-jungle-400">
                <span>{member.karma} Karma</span>
                <span>·</span>
                <span>{member.nftsEarned} NFTs</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
