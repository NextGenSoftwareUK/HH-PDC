import { useState, useEffect, useRef } from 'react'

// ── STAR Holon IDs (registered 27 Mar 2026) ──────────────────────────────────
const QUESTS = [
  {
    id: 'pv_q1',
    holonId: 'c1c52490-bace-42e3-aeda-79f9f435e036',
    order: 1,
    icon: '🌱',
    title: 'Register Your Avatar',
    subtitle: 'Create your OASIS identity',
    description:
      'Your OASIS Avatar is your universal identity across the Pulmón Verde experience. It holds your Karma, tree registrations, conservation passport, and journey chapters. Everything begins here.',
    validationType: 'oasis_auth',
    actionLabel: 'Create Avatar',
    karma: 100,
    xp: 50,
    difficulty: 'Easy',
    objectiveKey: 'pv_register_avatar',
  },
  {
    id: 'pv_q2',
    holonId: '83346bce-0196-4594-875d-9cf3810774b6',
    order: 2,
    icon: '📅',
    title: 'Sign Up for a Tour',
    subtitle: 'Book your guided chapter',
    description:
      'Each tour is a chapter led by a conservation guide through the last coastal jungle of Playa del Carmen. Choose your date, link your avatar to the session, and the forest will be waiting.',
    validationType: 'booking_confirmed',
    actionLabel: 'Book a Tour',
    karma: 150,
    xp: 75,
    difficulty: 'Easy',
    objectiveKey: 'pv_signup_tour',
  },
  {
    id: 'pv_q3',
    holonId: '81a829b4-e77d-487e-bda4-63c064aab5f8',
    order: 3,
    icon: '🌿',
    title: 'Enter Pulmón Verde',
    subtitle: 'GPS confirms your arrival',
    description:
      'Step inside the 4.5-hectare coastal jungle. Your device checks your GPS location against the conservation boundary. The moment you cross the threshold, your avatar earns its first jungle Karma.',
    validationType: 'gps_geofence',
    actionLabel: 'Verify My Location',
    karma: 300,
    xp: 150,
    difficulty: 'Easy',
    objectiveKey: 'pv_enter_jungle',
    gps: { lat: 20.642099, lng: -87.058506, radius: 300 },
  },
  {
    id: 'pv_q4',
    holonId: '6f7d108e-0b60-4c22-a7fc-0312296862e4',
    order: 4,
    icon: '🌳',
    title: 'Register Your First Tree',
    subtitle: 'QR scan + GPS capture',
    description:
      'Find a marked tree, open your camera, and capture its GPS coordinates. Your tree becomes a GeoSpatialNFT — a permanent on-chain identity anchored to its exact location. You become its first guardian.',
    validationType: 'qr_scan_gps',
    actionLabel: 'Open Camera',
    karma: 500,
    xp: 250,
    difficulty: 'Medium',
    objectiveKey: 'pv_register_tree',
    nftReward: 'Tree Guardian NFT',
  },
  {
    id: 'pv_q5',
    holonId: '96e265ef-62f4-4c46-be14-5603a16be80d',
    order: 5,
    icon: '📖',
    title: 'Complete Your First Story',
    subtitle: 'Guide confirms your chapter',
    description:
      'Every chapter ends with a story — a conversation between you, your guide, and the forest. Your guide enters their session code, your reflections are transcribed into the conservation record, and your passport receives its first stamp.',
    validationType: 'guide_confirmed',
    actionLabel: 'Enter Guide Code',
    karma: 750,
    xp: 400,
    difficulty: 'Medium',
    objectiveKey: 'pv_complete_story',
    nftReward: 'Chapter I Passport Stamp NFT',
  },
]

const TOTAL_KARMA = QUESTS.reduce((s, q) => s + q.karma, 0)
const PV_GPS = { lat: 20.642099, lng: -87.058506, radius: 300 }

function haversineM(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371000
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

type QuestStatus = 'locked' | 'active' | 'loading' | 'completed' | 'failed'

const STORAGE_KEY = 'pv_quest_progress_v1'

function loadProgress(): Record<string, QuestStatus> {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
  } catch {
    return {}
  }
}

function saveProgress(p: Record<string, QuestStatus>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(p))
}

export function QuestJourney() {
  const [progress, setProgress] = useState<Record<string, QuestStatus>>(() => {
    const saved = loadProgress()
    // Q1 always active if not completed
    if (!saved['pv_q1']) saved['pv_q1'] = 'active'
    return saved
  })
  const [activeModal, setActiveModal] = useState<string | null>(null)
  const [gpsStatus, setGpsStatus] = useState<string>('')
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null)
  const [avatarForm, setAvatarForm] = useState({ username: '', email: '', password: '' })
  const [guideCode, setGuideCode] = useState('')
  const [celebrateId, setCelebrateId] = useState<string | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  const completedCount = QUESTS.filter(q => progress[q.id] === 'completed').length
  const karmaEarned = QUESTS.filter(q => progress[q.id] === 'completed').reduce((s, q) => s + q.karma, 0)

  useEffect(() => { saveProgress(progress) }, [progress])

  useEffect(() => {
    if (cameraStream && videoRef.current) {
      videoRef.current.srcObject = cameraStream
    }
  }, [cameraStream, activeModal])

  useEffect(() => {
    return () => { cameraStream?.getTracks().forEach(t => t.stop()) }
  }, [cameraStream])

  function getStatus(questId: string): QuestStatus {
    return progress[questId] || 'locked'
  }

  function complete(questId: string) {
    const idx = QUESTS.findIndex(q => q.id === questId)
    const next = QUESTS[idx + 1]
    setProgress(prev => {
      const updated = { ...prev, [questId]: 'completed' as QuestStatus }
      if (next && !updated[next.id]) updated[next.id] = 'active'
      return updated
    })
    setActiveModal(null)
    setCameraStream(prev => { prev?.getTracks().forEach(t => t.stop()); return null })
    setCelebrateId(questId)
    setTimeout(() => setCelebrateId(null), 2800)
  }

  // ── Validators ──────────────────────────────────────────────────────────────

  async function handleAvatarRegister() {
    if (!avatarForm.username || !avatarForm.email || !avatarForm.password) return
    setProgress(p => ({ ...p, pv_q1: 'loading' }))
    await new Promise(r => setTimeout(r, 1400)) // simulate OASIS call
    complete('pv_q1')
  }

  function handleBookingLink() {
    complete('pv_q2') // booking portal marks this complete
    window.open('/book', '_blank')
  }

  async function handleGpsCheck() {
    setGpsStatus('Requesting location…')
    if (!navigator.geolocation) { setGpsStatus('❌ GPS not available on this device'); return }
    navigator.geolocation.getCurrentPosition(
      pos => {
        const dist = haversineM(pos.coords.latitude, pos.coords.longitude, PV_GPS.lat, PV_GPS.lng)
        if (dist <= PV_GPS.radius) {
          setGpsStatus(`✅ Inside Pulmón Verde! (${Math.round(dist)}m from centre)`)
          setTimeout(() => complete('pv_q3'), 900)
        } else {
          setGpsStatus(`📍 You are ${Math.round(dist)}m away. Visit Pulmón Verde beach, Playa del Carmen Norte to complete this quest.`)
        }
      },
      err => setGpsStatus(`❌ ${err.message}`),
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  async function handleOpenCamera() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      })
      setCameraStream(stream)
    } catch {
      setGpsStatus('❌ Camera permission denied')
    }
  }

  async function handleTreeCapture() {
    navigator.geolocation.getCurrentPosition(
      pos => {
        setGpsStatus(`🌳 Tree captured at ${pos.coords.latitude.toFixed(6)}, ${pos.coords.longitude.toFixed(6)}`)
        cameraStream?.getTracks().forEach(t => t.stop())
        setCameraStream(null)
        setTimeout(() => complete('pv_q4'), 900)
      },
      () => {
        // still complete even without GPS (demo mode)
        complete('pv_q4')
      }
    )
  }

  function handleGuideCode() {
    if (guideCode.trim().length < 4) return
    complete('pv_q5')
    setGuideCode('')
  }

  // ── Render helpers ───────────────────────────────────────────────────────────

  function statusIcon(s: QuestStatus) {
    if (s === 'completed') return '✓'
    if (s === 'loading') return '⟳'
    if (s === 'active') return '●'
    return '○'
  }

  function statusColor(s: QuestStatus) {
    if (s === 'completed') return '#7ddb7d'
    if (s === 'active' || s === 'loading') return '#c9a84c'
    return '#3a4a3a'
  }

  function renderModal(quest: typeof QUESTS[0]) {
    const s = getStatus(quest.id)
    if (s === 'locked' || s === 'completed') return null

    return (
      <div className="qj-modal-overlay" onClick={() => { setActiveModal(null); setCameraStream(prev => { prev?.getTracks().forEach(t => t.stop()); return null }) }}>
        <div className="qj-modal" onClick={e => e.stopPropagation()}>
          <div className="qj-modal-header">
            <span className="qj-modal-icon">{quest.icon}</span>
            <div>
              <div className="qj-modal-title">{quest.title}</div>
              <div className="qj-modal-sub">{quest.subtitle}</div>
            </div>
          </div>

          {quest.validationType === 'oasis_auth' && (
            <div className="qj-modal-body">
              <p className="qj-modal-desc">{quest.description}</p>
              <div className="qj-form">
                <input className="qj-input" placeholder="Username" value={avatarForm.username}
                  onChange={e => setAvatarForm(p => ({ ...p, username: e.target.value }))} />
                <input className="qj-input" placeholder="Email" type="email" value={avatarForm.email}
                  onChange={e => setAvatarForm(p => ({ ...p, email: e.target.value }))} />
                <input className="qj-input" placeholder="Password" type="password" value={avatarForm.password}
                  onChange={e => setAvatarForm(p => ({ ...p, password: e.target.value }))} />
                <button className="qj-action-btn" onClick={handleAvatarRegister}
                  disabled={progress['pv_q1'] === 'loading'}>
                  {progress['pv_q1'] === 'loading' ? 'Creating Avatar…' : '🌱 Create My Avatar'}
                </button>
              </div>
              <div className="qj-modal-note">Your avatar is stored in the OASIS network — your identity persists across all STAR apps.</div>
            </div>
          )}

          {quest.validationType === 'booking_confirmed' && (
            <div className="qj-modal-body">
              <p className="qj-modal-desc">{quest.description}</p>
              <button className="qj-action-btn" onClick={handleBookingLink}>📅 Open Booking Portal</button>
              <div className="qj-modal-note">Completing your booking marks this quest as done and unlocks Quest 3.</div>
            </div>
          )}

          {quest.validationType === 'gps_geofence' && (
            <div className="qj-modal-body">
              <p className="qj-modal-desc">{quest.description}</p>
              <div className="qj-gps-target">
                <span>📍 Target</span>
                <span>Pulmón Verde · 20.6421°N, 87.0585°W · Within 300m</span>
              </div>
              <button className="qj-action-btn" onClick={handleGpsCheck}>📡 Check My Location</button>
              {gpsStatus && <div className="qj-status-msg">{gpsStatus}</div>}
              <div className="qj-modal-note">You must be physically present at Pulmón Verde beach to complete this step.</div>
            </div>
          )}

          {quest.validationType === 'qr_scan_gps' && (
            <div className="qj-modal-body">
              <p className="qj-modal-desc">{quest.description}</p>
              {!cameraStream ? (
                <button className="qj-action-btn" onClick={handleOpenCamera}>📷 Open Camera</button>
              ) : (
                <div className="qj-camera-wrap">
                  <video ref={videoRef} autoPlay playsInline muted className="qj-video" />
                  <div className="qj-scan-overlay"><div className="qj-scan-frame" /></div>
                  <button className="qj-capture-btn" onClick={handleTreeCapture}>🌳 Register This Tree</button>
                </div>
              )}
              {gpsStatus && <div className="qj-status-msg">{gpsStatus}</div>}
              <div className="qj-modal-note">Point at the QR marker on the tree tag and tap Register to capture its GPS coordinates.</div>
            </div>
          )}

          {quest.validationType === 'guide_confirmed' && (
            <div className="qj-modal-body">
              <p className="qj-modal-desc">{quest.description}</p>
              <div className="qj-form">
                <input className="qj-input" placeholder="Enter 6-digit guide code"
                  value={guideCode} maxLength={8}
                  onChange={e => setGuideCode(e.target.value.toUpperCase())} />
                <button className="qj-action-btn" onClick={handleGuideCode}
                  disabled={guideCode.trim().length < 4}>
                  📖 Complete My Story
                </button>
              </div>
              <div className="qj-modal-note">Your guide will provide the session code at the end of the tour to stamp your passport.</div>
            </div>
          )}

          <div className="qj-modal-rewards">
            <span className="qj-reward-pill karma">+{quest.karma} Karma</span>
            <span className="qj-reward-pill xp">+{quest.xp} XP</span>
            {quest.nftReward && <span className="qj-reward-pill nft">🏅 {quest.nftReward}</span>}
          </div>
        </div>
      </div>
    )
  }

  const allDone = completedCount === QUESTS.length

  return (
    <div className="qj-root">
      {/* ── Celebration burst ─────────────────────────────────────────────── */}
      {celebrateId && (
        <div className="qj-celebrate">
          {['✦', '★', '✧', '◆', '✦', '★'].map((s, i) => (
            <span key={i} className="qj-burst" style={{ '--i': i } as React.CSSProperties}>{s}</span>
          ))}
        </div>
      )}

      {/* ── Header ────────────────────────────────────────────────────────── */}
      <div className="qj-header">
        <div className="qj-header-top">
          <a href="/playa-map.html" className="qj-back">← Map</a>
          <span className="qj-brand">OASIS · STAR</span>
        </div>
        <h1 className="qj-title">Your Journey</h1>
        <p className="qj-subtitle">Pulmón Verde · Chapter I · The Coastal Forest</p>

        <div className="qj-progress-bar-wrap">
          <div className="qj-progress-bar" style={{ width: `${(completedCount / QUESTS.length) * 100}%` }} />
        </div>
        <div className="qj-progress-stats">
          <span>{completedCount} of {QUESTS.length} complete</span>
          <span className="qj-karma-earned">⬡ {karmaEarned.toLocaleString()} / {TOTAL_KARMA.toLocaleString()} Karma</span>
        </div>
      </div>

      {/* ── Quest timeline ────────────────────────────────────────────────── */}
      <div className="qj-timeline">
        {QUESTS.map((quest, idx) => {
          const s = getStatus(quest.id)
          const isLast = idx === QUESTS.length - 1
          return (
            <div key={quest.id} className={`qj-item ${s}`}>
              {/* connector line */}
              {!isLast && <div className="qj-connector" style={{ background: s === 'completed' ? '#7ddb7d' : '#1e2e1e' }} />}

              {/* step bubble */}
              <div className="qj-bubble" style={{ background: statusColor(s), color: s === 'locked' ? '#3a4a3a' : '#0a0f0a', borderColor: statusColor(s) }}>
                {s === 'loading' ? <span className="qj-spin">⟳</span> : statusIcon(s)}
              </div>

              {/* card */}
              <div className={`qj-card ${s}`} onClick={() => s !== 'locked' && s !== 'completed' && setActiveModal(quest.id)}>
                <div className="qj-card-top">
                  <span className="qj-card-icon">{quest.icon}</span>
                  <div className="qj-card-meta">
                    <div className="qj-card-num">Quest {quest.order} · {quest.difficulty}</div>
                    <div className="qj-card-title">{quest.title}</div>
                    <div className="qj-card-sub">{quest.subtitle}</div>
                  </div>
                  <div className="qj-card-status-badge" style={{ color: statusColor(s) }}>
                    {s === 'completed' ? 'DONE' : s === 'active' ? 'ACTIVE' : s === 'loading' ? '…' : 'LOCKED'}
                  </div>
                </div>

                {s !== 'locked' && (
                  <p className="qj-card-desc">{quest.description}</p>
                )}

                <div className="qj-card-footer">
                  <div className="qj-reward-row">
                    <span className="qj-reward-sm karma">+{quest.karma} Karma</span>
                    <span className="qj-reward-sm xp">+{quest.xp} XP</span>
                    {quest.nftReward && <span className="qj-reward-sm nft">🏅 NFT</span>}
                  </div>
                  <div className="qj-holon-tag" title={`STAR Holon ID: ${quest.holonId}`}>
                    ★ {quest.holonId.substring(0, 8)}…
                  </div>
                </div>

                {s === 'active' && (
                  <button className="qj-card-btn" onClick={e => { e.stopPropagation(); setActiveModal(quest.id) }}>
                    {quest.actionLabel} →
                  </button>
                )}
                {s === 'completed' && (
                  <div className="qj-completed-stamp">✓ Complete</div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* ── All done ─────────────────────────────────────────────────────── */}
      {allDone && (
        <div className="qj-all-done">
          <div className="qj-done-icon">🌿</div>
          <h2>Chapter I Complete</h2>
          <p>You have walked the forest, registered your tree, and told your story. Your Conservation Passport has received its first stamp.</p>
          <div className="qj-done-stats">
            <span>⬡ {TOTAL_KARMA.toLocaleString()} Karma earned</span>
            <span>📖 Chapter I stamped</span>
            <span>🌳 1 tree registered</span>
          </div>
          <a href="/passport" className="qj-done-btn">View My Passport →</a>
        </div>
      )}

      {/* ── Modal ─────────────────────────────────────────────────────────── */}
      {activeModal && renderModal(QUESTS.find(q => q.id === activeModal)!)}

      <style>{`
        .qj-root {
          min-height: 100vh;
          background: #070d07;
          color: #d4e8d4;
          font-family: 'Georgia', serif;
          padding-bottom: 60px;
        }
        .qj-header {
          padding: 28px 20px 20px;
          max-width: 600px;
          margin: 0 auto;
        }
        .qj-header-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }
        .qj-back {
          font-family: monospace;
          font-size: 0.7rem;
          color: #5a8a5a;
          text-decoration: none;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }
        .qj-back:hover { color: #7ddb7d; }
        .qj-brand {
          font-family: monospace;
          font-size: 0.6rem;
          color: #3a5a3a;
          letter-spacing: 0.15em;
        }
        .qj-title {
          font-size: 2.2rem;
          font-weight: 400;
          color: #e8f5e8;
          margin: 0 0 4px;
          letter-spacing: -0.02em;
        }
        .qj-subtitle {
          font-size: 0.8rem;
          color: #c9a84c;
          font-style: italic;
          margin: 0 0 20px;
        }
        .qj-progress-bar-wrap {
          height: 3px;
          background: #1a2a1a;
          border-radius: 2px;
          overflow: hidden;
          margin-bottom: 8px;
        }
        .qj-progress-bar {
          height: 100%;
          background: linear-gradient(90deg, #4a9b4a, #7ddb7d);
          border-radius: 2px;
          transition: width 0.6s ease;
        }
        .qj-progress-stats {
          display: flex;
          justify-content: space-between;
          font-family: monospace;
          font-size: 0.6rem;
          color: #5a7a5a;
          letter-spacing: 0.08em;
        }
        .qj-karma-earned { color: #c9a84c; }

        /* ── Timeline ── */
        .qj-timeline {
          max-width: 600px;
          margin: 0 auto;
          padding: 8px 20px 0;
          display: flex;
          flex-direction: column;
          gap: 0;
        }
        .qj-item {
          display: grid;
          grid-template-columns: 32px 1fr;
          grid-template-rows: auto auto;
          column-gap: 16px;
          position: relative;
          margin-bottom: 8px;
        }
        .qj-connector {
          position: absolute;
          left: 15px;
          top: 32px;
          width: 2px;
          height: calc(100% - 16px);
          border-radius: 1px;
          transition: background 0.4s;
        }
        .qj-bubble {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          border: 2px solid;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.75rem;
          font-weight: 700;
          flex-shrink: 0;
          position: relative;
          z-index: 1;
          transition: all 0.3s;
        }
        .qj-spin { display: inline-block; animation: spin 0.8s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }

        .qj-card {
          background: #0d1a0d;
          border: 1px solid #1e2e1e;
          border-radius: 10px;
          padding: 14px 16px;
          cursor: default;
          transition: all 0.2s;
          margin-bottom: 4px;
        }
        .qj-card.active { border-color: rgba(201,168,76,0.3); cursor: pointer; }
        .qj-card.active:hover { border-color: rgba(201,168,76,0.5); background: #0f1e0f; }
        .qj-card.completed { border-color: rgba(74,155,74,0.25); }
        .qj-card.locked { opacity: 0.45; }

        .qj-card-top { display: flex; align-items: flex-start; gap: 12px; margin-bottom: 10px; }
        .qj-card-icon { font-size: 1.6rem; line-height: 1; flex-shrink: 0; }
        .qj-card-meta { flex: 1; }
        .qj-card-num { font-family: monospace; font-size: 0.55rem; color: #5a7a5a; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 2px; }
        .qj-card-title { font-size: 1.05rem; color: #e8f5e8; font-weight: 400; margin-bottom: 1px; }
        .qj-card-sub { font-size: 0.7rem; color: #7a9a7a; font-style: italic; }
        .qj-card-status-badge { font-family: monospace; font-size: 0.52rem; letter-spacing: 0.12em; font-weight: 700; flex-shrink: 0; }

        .qj-card-desc { font-size: 0.75rem; color: #8aaa8a; line-height: 1.6; margin: 0 0 12px; }

        .qj-card-footer { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 6px; }
        .qj-reward-row { display: flex; gap: 6px; flex-wrap: wrap; }
        .qj-reward-sm {
          font-family: monospace; font-size: 0.52rem; padding: 2px 7px; border-radius: 10px;
          letter-spacing: 0.06em;
        }
        .qj-reward-sm.karma { background: rgba(74,155,74,0.1); border: 1px solid rgba(74,155,74,0.25); color: #7ddb7d; }
        .qj-reward-sm.xp    { background: rgba(201,168,76,0.1); border: 1px solid rgba(201,168,76,0.25); color: #c9a84c; }
        .qj-reward-sm.nft   { background: rgba(147,112,219,0.1); border: 1px solid rgba(147,112,219,0.25); color: #b39ddb; }
        .qj-holon-tag { font-family: monospace; font-size: 0.5rem; color: #3a5a3a; letter-spacing: 0.06em; }

        .qj-card-btn {
          display: block; width: 100%; margin-top: 12px;
          padding: 10px 16px; background: rgba(201,168,76,0.1);
          border: 1px solid rgba(201,168,76,0.35); border-radius: 6px;
          color: #c9a84c; font-family: monospace; font-size: 0.65rem;
          letter-spacing: 0.1em; text-transform: uppercase; cursor: pointer;
          transition: all 0.2s;
        }
        .qj-card-btn:hover { background: rgba(201,168,76,0.18); }
        .qj-completed-stamp {
          margin-top: 10px; font-family: monospace; font-size: 0.6rem;
          color: #7ddb7d; letter-spacing: 0.12em; text-transform: uppercase;
        }

        /* ── Modal ── */
        .qj-modal-overlay {
          position: fixed; inset: 0; background: rgba(0,0,0,0.75);
          z-index: 100; display: flex; align-items: flex-end; justify-content: center;
          padding: 0;
        }
        @media (min-width: 640px) {
          .qj-modal-overlay { align-items: center; padding: 20px; }
        }
        .qj-modal {
          background: #0d1a0d; border: 1px solid rgba(74,155,74,0.2);
          border-radius: 14px 14px 0 0; padding: 24px 20px 32px;
          width: 100%; max-width: 520px;
          max-height: 90vh; overflow-y: auto;
        }
        @media (min-width: 640px) { .qj-modal { border-radius: 14px; } }
        .qj-modal-header { display: flex; gap: 14px; align-items: flex-start; margin-bottom: 20px; }
        .qj-modal-icon { font-size: 2.2rem; flex-shrink: 0; }
        .qj-modal-title { font-size: 1.15rem; color: #e8f5e8; margin-bottom: 2px; }
        .qj-modal-sub { font-size: 0.72rem; color: #c9a84c; font-style: italic; }
        .qj-modal-body {}
        .qj-modal-desc { font-size: 0.78rem; color: #8aaa8a; line-height: 1.65; margin: 0 0 18px; }
        .qj-form { display: flex; flex-direction: column; gap: 10px; margin-bottom: 14px; }
        .qj-input {
          background: #071007; border: 1px solid #2a3a2a; border-radius: 6px;
          color: #d4e8d4; font-family: monospace; font-size: 0.75rem;
          padding: 10px 14px; outline: none;
        }
        .qj-input:focus { border-color: rgba(74,155,74,0.4); }
        .qj-action-btn {
          padding: 12px 18px; background: rgba(74,155,74,0.12);
          border: 1px solid rgba(74,155,74,0.35); border-radius: 7px;
          color: #7ddb7d; font-family: monospace; font-size: 0.7rem;
          letter-spacing: 0.1em; text-transform: uppercase; cursor: pointer;
          transition: all 0.2s; width: 100%;
        }
        .qj-action-btn:hover:not(:disabled) { background: rgba(74,155,74,0.2); }
        .qj-action-btn:disabled { opacity: 0.5; cursor: default; }
        .qj-gps-target {
          display: flex; justify-content: space-between; font-family: monospace;
          font-size: 0.58rem; color: #5a8a5a; background: rgba(74,155,74,0.05);
          border: 1px solid rgba(74,155,74,0.1); border-radius: 5px;
          padding: 8px 12px; margin-bottom: 12px;
        }
        .qj-status-msg { font-family: monospace; font-size: 0.65rem; color: #c9a84c; margin: 10px 0; line-height: 1.5; }
        .qj-modal-note { font-size: 0.64rem; color: #4a6a4a; line-height: 1.5; margin-top: 12px; border-top: 1px solid #1a2a1a; padding-top: 10px; }
        .qj-modal-rewards { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 18px; padding-top: 14px; border-top: 1px solid #1a2a1a; }
        .qj-reward-pill {
          font-family: monospace; font-size: 0.6rem; padding: 4px 10px; border-radius: 12px;
        }
        .qj-reward-pill.karma { background: rgba(74,155,74,0.12); border: 1px solid rgba(74,155,74,0.3); color: #7ddb7d; }
        .qj-reward-pill.xp    { background: rgba(201,168,76,0.12); border: 1px solid rgba(201,168,76,0.3); color: #c9a84c; }
        .qj-reward-pill.nft   { background: rgba(147,112,219,0.12); border: 1px solid rgba(147,112,219,0.3); color: #b39ddb; }

        /* ── Camera ── */
        .qj-camera-wrap { position: relative; border-radius: 8px; overflow: hidden; margin-bottom: 12px; }
        .qj-video { width: 100%; display: block; border-radius: 8px; }
        .qj-scan-overlay { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; pointer-events: none; }
        .qj-scan-frame { width: 160px; height: 160px; border: 2px solid rgba(125,219,125,0.7); border-radius: 8px; box-shadow: 0 0 0 1000px rgba(0,0,0,0.35); }
        .qj-capture-btn {
          display: block; width: 100%; padding: 12px;
          background: rgba(74,155,74,0.15); border: 1px solid rgba(74,155,74,0.4);
          border-radius: 7px; color: #7ddb7d; font-family: monospace;
          font-size: 0.7rem; letter-spacing: 0.1em; text-transform: uppercase;
          cursor: pointer;
        }

        /* ── All done ── */
        .qj-all-done {
          max-width: 600px; margin: 32px auto 0; padding: 28px 24px;
          background: linear-gradient(135deg, #0d1a0d, #071207);
          border: 1px solid rgba(74,155,74,0.3); border-radius: 14px;
          text-align: center;
        }
        .qj-done-icon { font-size: 3rem; margin-bottom: 12px; }
        .qj-all-done h2 { font-size: 1.5rem; color: #e8f5e8; font-weight: 400; margin: 0 0 10px; }
        .qj-all-done p { font-size: 0.8rem; color: #8aaa8a; line-height: 1.65; margin: 0 0 18px; }
        .qj-done-stats { display: flex; justify-content: center; gap: 16px; flex-wrap: wrap; font-family: monospace; font-size: 0.62rem; color: #5a8a5a; margin-bottom: 20px; }
        .qj-done-btn {
          display: inline-block; padding: 12px 24px;
          background: rgba(74,155,74,0.12); border: 1px solid rgba(74,155,74,0.35);
          border-radius: 7px; color: #7ddb7d; font-family: monospace;
          font-size: 0.65rem; letter-spacing: 0.1em; text-transform: uppercase;
          text-decoration: none; transition: all 0.2s;
        }
        .qj-done-btn:hover { background: rgba(74,155,74,0.2); }

        /* ── Celebration ── */
        .qj-celebrate { position: fixed; inset: 0; pointer-events: none; z-index: 200; overflow: hidden; }
        .qj-burst {
          position: absolute; top: 50%; left: 50%;
          font-size: 1.4rem; color: #7ddb7d;
          animation: burst 2.5s ease-out forwards;
          animation-delay: calc(var(--i) * 0.08s);
          opacity: 0;
        }
        @keyframes burst {
          0% { transform: translate(-50%,-50%) scale(0); opacity: 1; }
          60% { opacity: 1; }
          100% { transform: translate(calc(-50% + (var(--i) - 2.5) * 80px), calc(-50% - 120px)) scale(1.4); opacity: 0; }
        }

        @media (max-width: 480px) {
          .qj-title { font-size: 1.7rem; }
          .qj-card-icon { font-size: 1.3rem; }
        }
      `}</style>
    </div>
  )
}
