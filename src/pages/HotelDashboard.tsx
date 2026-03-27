import { useState } from 'react'
import { Routes, Route, Link } from 'react-router-dom'
import { MOCK_HOTEL } from '../lib/mock-data'
import type { HotelNotification } from '../lib/types'
import { TrendingUp, Bell, Copy, Download, ExternalLink, Users, TreeDeciduous, Leaf, Send } from 'lucide-react'

const NOTIFICATION_ICONS: Record<HotelNotification['type'], string> = {
  karma: '✨',
  tree: '🌳',
  report: '📄',
  season: '🍃',
  rank: '🏆',
}

export function HotelDashboard() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        <Route path="/" element={<Overview />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/trees" element={<HotelTrees />} />
        <Route path="/send" element={<SendGuest />} />
        <Route path="/impact" element={<ImpactReport />} />
      </Routes>
    </div>
  )
}

function Overview() {
  const h = MOCK_HOTEL
  const [showNotifs, setShowNotifs] = useState(false)

  return (
    <div className="pt-16 pb-20 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-start justify-between mb-8 pt-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-medium uppercase tracking-widest text-green-600 bg-green-100 px-2 py-0.5 rounded-full">Partner</span>
            </div>
            <h1 className="text-2xl font-semibold text-gray-900">{h.name}</h1>
            <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
              <span className="flex items-center gap-1.5"><TrendingUp className="w-3.5 h-3.5 text-amber-500" /> <strong className="text-amber-600">{h.karma.toLocaleString()}</strong> Karma</span>
              <span>·</span>
              <span>Rank <strong className="text-gray-700">#{h.rank}</strong> of {h.totalHotels}</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <button
                onClick={() => setShowNotifs(v => !v)}
                className="relative w-9 h-9 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
              >
                <Bell className="w-4 h-4 text-gray-500" />
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-white text-xs flex items-center justify-center">{h.notifications.length}</span>
              </button>
              {showNotifs && (
                <div className="absolute right-0 top-12 w-80 bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden">
                  <div className="p-3 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-700">Notifications</p>
                  </div>
                  {h.notifications.map(n => (
                    <div key={n.id} className="flex items-start gap-3 p-3 hover:bg-gray-50 border-b border-gray-50 last:border-0">
                      <span className="text-lg flex-shrink-0">{NOTIFICATION_ICONS[n.type]}</span>
                      <div>
                        <p className="text-sm text-gray-700 leading-snug">{n.message}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{n.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* KPI strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            {
              label: 'Guests this month',
              value: h.guestsThisMonth,
              delta: `+${h.guestsDelta} vs last month`,
              positive: true,
              icon: <Users className="w-4 h-4 text-green-600" />,
            },
            {
              label: 'Karma this month',
              value: `+${h.karmaThisMonth.toLocaleString()}`,
              delta: 'Total: ' + h.karma.toLocaleString(),
              positive: true,
              icon: <TrendingUp className="w-4 h-4 text-amber-500" />,
            },
            {
              label: 'Trees sponsored',
              value: h.treesSponsored,
              delta: 'View your trees →',
              positive: true,
              icon: <TreeDeciduous className="w-4 h-4 text-green-700" />,
            },
            {
              label: 'CO₂ attributed',
              value: `${h.co2Attributed}t`,
              delta: 'From guest visits',
              positive: true,
              icon: <Leaf className="w-4 h-4 text-green-600" />,
            },
          ].map(({ label, value, delta, icon }) => (
            <div key={label} className="card-light">
              <div className="flex items-center justify-between mb-3">
                <span className="label-dark">{label}</span>
                {icon}
              </div>
              <p className="text-2xl font-semibold text-gray-900">{value}</p>
              <p className="text-xs text-gray-400 mt-1">{delta}</p>
            </div>
          ))}
        </div>

        {/* Rank callout */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-amber-800">You are 1,360 Karma from #2.</p>
            <p className="text-sm text-amber-600">Send 14 more guests this month to overtake Viceroy Riviera Maya.</p>
          </div>
          <Link to="/hotel/send" className="bg-amber-600 hover:bg-amber-700 text-white text-sm px-4 py-2 rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5">
            <Send className="w-3.5 h-3.5" /> Send a Guest
          </Link>
        </div>

        {/* Guest activity table */}
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <p className="font-medium text-gray-800">Recent Guest Activity</p>
            <Link to="/hotel/leaderboard" className="text-sm text-green-600 hover:text-green-700 flex items-center gap-1">
              View leaderboard <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left py-2.5 px-5 label-dark font-medium">Date</th>
                <th className="text-left py-2.5 px-5 label-dark font-medium">Guest</th>
                <th className="text-left py-2.5 px-5 label-dark font-medium">Chapter</th>
                <th className="text-left py-2.5 px-5 label-dark font-medium">Status</th>
                <th className="text-right py-2.5 px-5 label-dark font-medium">Karma</th>
              </tr>
            </thead>
            <tbody>
              {h.guestActivity.map((g, i) => (
                <tr key={i} className="border-b border-gray-50 hover:bg-gray-50 last:border-0">
                  <td className="py-3 px-5 text-gray-500">{g.date}</td>
                  <td className="py-3 px-5 text-gray-800">{g.optedInPublic ? g.guestName : '— (private)'}</td>
                  <td className="py-3 px-5 text-gray-500">{g.chapter}</td>
                  <td className="py-3 px-5">
                    <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${
                      g.status === 'complete' ? 'bg-green-100 text-green-700' :
                      g.status === 'in-progress' ? 'bg-blue-100 text-blue-700' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {g.status === 'complete' ? '✓ Complete' : g.status === 'in-progress' ? '⟳ In progress' : '◎ Booked'}
                    </span>
                  </td>
                  <td className="py-3 px-5 text-right font-mono text-sm text-amber-600">
                    {g.karmaEarned > 0 ? `+${g.karmaEarned}` : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function Leaderboard() {
  const h = MOCK_HOTEL

  return (
    <div className="pt-16 pb-20 px-6">
      <div className="max-w-4xl mx-auto pt-6">
        <h2 className="text-2xl font-semibold text-gray-900 mb-1">Hotel Leaderboard</h2>
        <p className="text-gray-500 mb-8">All hotels ranked by total OASIS Karma · Playa del Carmen & Riviera Maya</p>

        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden mb-6">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left py-3 px-5 label-dark font-medium">Rank</th>
                <th className="text-left py-3 px-5 label-dark font-medium">Hotel</th>
                <th className="text-right py-3 px-5 label-dark font-medium">Karma</th>
                <th className="text-right py-3 px-5 label-dark font-medium">Guests</th>
                <th className="text-right py-3 px-5 label-dark font-medium">Trees</th>
                <th className="text-right py-3 px-5 label-dark font-medium">CO₂</th>
              </tr>
            </thead>
            <tbody>
              {h.leaderboard.map(entry => (
                <tr
                  key={entry.rank}
                  className={`border-b border-gray-100 last:border-0 ${entry.isCurrentHotel ? 'bg-green-50' : 'hover:bg-gray-50'}`}
                >
                  <td className="py-3.5 px-5">
                    <div className="flex items-center gap-1.5">
                      {entry.rank === 1 && <span className="text-base">🥇</span>}
                      {entry.rank === 2 && <span className="text-base">🥈</span>}
                      {entry.rank === 3 && <span className="text-base">🥉</span>}
                      {entry.rank > 3 && <span className="text-gray-400 font-mono">#{entry.rank}</span>}
                    </div>
                  </td>
                  <td className="py-3.5 px-5">
                    <div className="flex items-center gap-2">
                      <span className={`font-medium ${entry.isCurrentHotel ? 'text-green-700' : 'text-gray-800'}`}>{entry.name}</span>
                      {entry.isCurrentHotel && <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full">You</span>}
                    </div>
                  </td>
                  <td className="py-3.5 px-5 text-right font-mono font-medium text-amber-600">{entry.karma.toLocaleString()}</td>
                  <td className="py-3.5 px-5 text-right text-gray-600">{entry.guests}</td>
                  <td className="py-3.5 px-5 text-right text-gray-600">{entry.trees}</td>
                  <td className="py-3.5 px-5 text-right text-gray-600">{entry.co2}t</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-xl p-5">
          <div className="flex items-start gap-3">
            <TrendingUp className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-green-800 mb-1">How Karma is calculated</p>
              <div className="grid sm:grid-cols-2 gap-x-8 gap-y-1 text-sm text-green-700">
                <span>Guest completes a quest → +100 Karma</span>
                <span>Sponsor a tree → +500 Karma / tree</span>
                <span>Guest retires carbon credits → +200 Karma / tCO₂</span>
                <span>Champion annual tier → +5,000 Karma</span>
              </div>
              <p className="text-xs text-green-600 mt-2">Partner tier guests earn 1.5× Karma · Champion 2×</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function HotelTrees() {
  const trees = [
    { id: 12, species: 'Ceiba pentandra', common: 'Ceiba (World Tree)', health: 'good', co2: 0.28, observations: 7, dedication: '"In memory of the forests we all depend on." — The Grand Hyatt team', lastObs: '"Strong root buttresses, crown expanding. The most photographed tree in the forest." — Rosa' },
    { id: 28, species: 'Manilkara zapota', common: 'Sapodilla (Chicozapote)', health: 'good', co2: 0.35, observations: 4, dedication: null, lastObs: '"Excellent health. Gecko family still resident in the lower hollow." — Rosa' },
    { id: 31, species: 'Bursera simaruba', common: 'Gumbo Limbo', health: 'good', co2: 0.22, observations: 3, dedication: null, lastObs: '"New aerial roots forming." — Rosa' },
    { id: 44, species: 'Swietenia macrophylla', common: 'Mahogany', health: 'fair', co2: 0.48, observations: 2, dedication: '"For our sustainability team." — Grand Hyatt', lastObs: '"Fungal growth on lower trunk. Monitoring closely." — Rosa' },
  ]

  return (
    <div className="pt-16 pb-20 px-6">
      <div className="max-w-4xl mx-auto pt-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-1">My Trees</h2>
            <p className="text-gray-500">4 trees sponsored · Grand Hyatt Playa del Carmen</p>
          </div>
          <button className="bg-green-700 hover:bg-green-800 text-white text-sm px-4 py-2 rounded-lg transition-colors flex items-center gap-1.5">
            <TreeDeciduous className="w-3.5 h-3.5" /> Sponsor Another
          </button>
        </div>

        <div className="space-y-4 mb-8">
          {trees.map(tree => (
            <div key={tree.id} className="card-light">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium text-gray-900">{tree.common}</h3>
                    <span className="text-xs text-gray-400 font-mono">Tree #{tree.id}</span>
                    <span className={`w-2 h-2 rounded-full flex-shrink-0 ${tree.health === 'good' ? 'bg-green-500' : 'bg-yellow-500'}`} />
                  </div>
                  <p className="text-sm italic text-gray-400 mb-2">{tree.species}</p>
                  {tree.dedication && (
                    <p className="text-sm text-green-700 bg-green-50 px-3 py-2 rounded-lg mb-2 italic">{tree.dedication}</p>
                  )}
                  <p className="text-sm text-gray-500 italic">{tree.lastObs}</p>
                </div>
                <div className="text-right text-sm flex-shrink-0">
                  <p className="font-semibold text-gray-900">{tree.co2}t CO₂/yr</p>
                  <p className="text-gray-400">{tree.observations} obs.</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-green-50 border border-dashed border-green-300 rounded-xl p-6 text-center">
          <p className="font-medium text-green-800 mb-1">Sponsor more trees</p>
          <p className="text-sm text-green-600 mb-4">$150/year per tree. Each sponsored tree earns 500 Karma and carries your hotel's name in the permanent forest record.</p>
          <button className="bg-green-700 hover:bg-green-800 text-white text-sm px-5 py-2.5 rounded-lg transition-colors">
            Sponsor a Tree
          </button>
        </div>
      </div>
    </div>
  )
}

function SendGuest() {
  const [copied, setCopied] = useState(false)
  const refLink = 'https://pulmonverde.mx/book?ref=grand-hyatt-plc'

  const copyLink = () => {
    navigator.clipboard.writeText(refLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="pt-16 pb-20 px-6">
      <div className="max-w-3xl mx-auto pt-6">
        <h2 className="text-2xl font-semibold text-gray-900 mb-1">Send a Guest</h2>
        <p className="text-gray-500 mb-8">Share the experience with your guests. Every booking earns your hotel Karma.</p>

        <div className="card-light mb-6">
          <p className="label-dark mb-2">Your booking link</p>
          <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5">
            <span className="text-sm text-gray-700 font-mono flex-1 truncate">{refLink}</span>
            <button
              onClick={copyLink}
              className="flex items-center gap-1.5 text-sm text-green-600 hover:text-green-700 transition-colors flex-shrink-0"
            >
              <Copy className="w-3.5 h-3.5" /> {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-2">Guests who book via this link earn your hotel +100 Karma per quest completed.</p>
        </div>

        <div className="grid sm:grid-cols-2 gap-4 mb-8">
          <h3 className="sm:col-span-2 font-medium text-gray-700">Downloadable materials</h3>
          {[
            { icon: '📄', title: 'A4 Flyer (PDF)', desc: 'Designed for the concierge desk or room drop', action: 'Download' },
            { icon: '🖼️', title: 'Digital Postcard (JPG)', desc: 'For hotel app or in-room TV', action: 'Download' },
            { icon: '⬛', title: 'QR Code (SVG)', desc: 'Scannable at the concierge desk', action: 'Download' },
            { icon: '💬', title: 'WhatsApp Template', desc: 'Pre-written message for concierge to share', action: 'Copy' },
          ].map(({ icon, title, desc, action }) => (
            <div key={title} className="card-light flex items-start gap-3">
              <span className="text-2xl flex-shrink-0">{icon}</span>
              <div className="flex-1">
                <p className="font-medium text-gray-800 text-sm">{title}</p>
                <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
              </div>
              <button className="flex items-center gap-1 text-xs text-green-600 hover:text-green-700 transition-colors flex-shrink-0">
                <Download className="w-3 h-3" /> {action}
              </button>
            </div>
          ))}
        </div>

        <div className="card-light">
          <p className="label-dark mb-2">Generate vouchers</p>
          <p className="text-sm text-gray-600 mb-4">Pre-paid voucher codes your concierge can give to guests directly. Billed to your monthly invoice.</p>
          <div className="flex items-center gap-3">
            <select className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:border-green-400">
              <option>5 vouchers · $425 (adults)</option>
              <option>10 vouchers · $850 (adults)</option>
              <option>5 family packs · $650</option>
            </select>
            <button className="bg-green-700 hover:bg-green-800 text-white text-sm px-4 py-2 rounded-lg transition-colors">
              Generate
            </button>
            <button className="border border-gray-200 text-gray-600 text-sm px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-1.5">
              <Download className="w-3.5 h-3.5" /> Download PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function ImpactReport() {
  const h = MOCK_HOTEL

  return (
    <div className="pt-16 pb-20 px-6">
      <div className="max-w-3xl mx-auto pt-6">
        <div className="flex items-start justify-between mb-8">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-1">Impact Report</h2>
            <p className="text-gray-500">Grand Hyatt Playa del Carmen · All time</p>
          </div>
          <button className="flex items-center gap-1.5 border border-gray-200 text-gray-600 text-sm px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors">
            <Download className="w-3.5 h-3.5" /> Download PDF
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          {[
            { value: '54', label: 'Total guests sent', icon: '👥' },
            { value: '40', label: 'Trees registered via guests', icon: '🌳' },
            { value: `${h.co2Attributed}t`, label: 'CO₂ attributed to hotel', icon: '🌿' },
            { value: '124h', label: 'Volunteer hours donated', icon: '⏱️' },
            { value: h.karma.toLocaleString(), label: 'Total Karma earned', icon: '✨' },
            { value: h.treesSponsored.toString(), label: 'Trees directly sponsored', icon: '💚' },
          ].map(({ value, label, icon }) => (
            <div key={label} className="card-light">
              <span className="text-2xl">{icon}</span>
              <p className="text-2xl font-semibold text-gray-900 mt-2">{value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        <div className="card-light mb-6">
          <p className="font-medium text-gray-800 mb-3">Embeddable badge for your website</p>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-3">
            <div className="flex items-center gap-3">
              <Leaf className="w-8 h-8 text-green-600 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-green-800">Grand Hyatt Playa del Carmen is a Pulmón Verde Partner.</p>
                <p className="text-xs text-green-600">Our guests have registered 40 trees and offset {h.co2Attributed} tonnes of CO₂.</p>
              </div>
            </div>
          </div>
          <button className="flex items-center gap-1.5 text-sm text-green-600 hover:text-green-700 transition-colors">
            <Copy className="w-3.5 h-3.5" /> Copy embed code
          </button>
        </div>

        <div className="card-light">
          <p className="font-medium text-gray-800 mb-1">Public partner profile</p>
          <p className="text-sm text-gray-500 mb-3">Your hotel's public page on pulmonverde.mx showing your contribution and sponsored trees.</p>
          <button className="flex items-center gap-1.5 text-sm text-green-600 hover:text-green-700 transition-colors">
            <ExternalLink className="w-3.5 h-3.5" /> pulmonverde.mx/partner/grand-hyatt
          </button>
        </div>
      </div>
    </div>
  )
}
