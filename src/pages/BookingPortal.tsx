import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronRight, Plus, Minus, CheckCircle, Lock, Calendar, Users, CreditCard, Leaf } from 'lucide-react'
import { CHAPTERS } from '../lib/mock-data'
import type { Chapter, FamilyMember, BookingState } from '../lib/types'

const TIME_SLOTS = ['8:00 am', '9:00 am', '10:00 am']

const AVAILABLE_DATES = ['Jan 16', 'Jan 17', 'Jan 19', 'Jan 20', 'Jan 22', 'Jan 23', 'Jan 24', 'Jan 26', 'Jan 27', 'Jan 29', 'Jan 30', 'Feb 2', 'Feb 3', 'Feb 5', 'Feb 6']

function newMember(type: 'adult' | 'child', isLead = false): FamilyMember {
  return {
    id: Math.random().toString(36).slice(2),
    firstName: '',
    lastName: '',
    email: '',
    type,
    language: 'en',
    isGroupLead: isLead,
  }
}

export function BookingPortal() {
  const navigate = useNavigate()
  const [state, setState] = useState<BookingState>({
    chapter: null,
    date: null,
    timeSlot: null,
    members: [newMember('adult', true)],
    audioConsent: true,
    termsAccepted: false,
    whatsapp: '',
    step: 'chapter',
  })

  const adults = state.members.filter(m => m.type === 'adult')
  const children = state.members.filter(m => m.type === 'child')
  const total = adults.length * (state.chapter?.priceAdult ?? 85) + children.length * (state.chapter?.priceChild ?? 45)

  const setStep = (step: BookingState['step']) => setState(s => ({ ...s, step }))

  if (state.step === 'confirmation') return <ConfirmationScreen state={state} onNavigate={() => navigate('/passport')} />

  return (
    <div className="min-h-screen bg-jungle-900">
      {state.step === 'chapter' && <ChapterSelection state={state} setState={setState} />}
      {state.step === 'date' && (
        <DateSelection
          state={state}
          setState={setState}
          onBack={() => setStep('chapter')}
          onNext={() => setStep('register')}
        />
      )}
      {state.step === 'register' && (
        <Registration
          state={state}
          setState={setState}
          onBack={() => setStep('date')}
          onNext={() => setStep('pay')}
          total={total}
        />
      )}
      {state.step === 'pay' && (
        <Payment
          state={state}
          total={total}
          onBack={() => setStep('register')}
          onComplete={() => setStep('confirmation')}
        />
      )}
    </div>
  )
}

function ChapterSelection({ setState }: { state: BookingState; setState: React.Dispatch<React.SetStateAction<BookingState>> }) {
  return (
    <div>
      {/* Hero */}
      <div className="relative min-h-[70vh] flex flex-col items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `linear-gradient(to bottom, rgba(6,15,6,0.3) 0%, rgba(6,15,6,0.7) 60%, rgba(13,31,13,1) 100%), url('https://images.unsplash.com/photo-1448375240586-882707db888b?w=1600&q=80')`,
          }}
        />
        <div className="relative text-center px-4 pt-24">
          <div className="flex items-center justify-center gap-2 mb-6">
            <Leaf className="text-jungle-400 w-5 h-5" />
            <span className="label text-jungle-300">Playa del Carmen, Mexico</span>
          </div>
          <h1 className="font-display text-5xl md:text-7xl text-jungle-100 mb-4 leading-tight">
            Pulmón Verde
          </h1>
          <p className="font-display italic text-2xl text-jungle-300 mb-8">
            The last coastal jungle of Playa del Carmen.
          </p>
          <p className="text-jungle-200 text-lg max-w-md mx-auto leading-relaxed">
            Register a tree. It will know your name forever.
          </p>
        </div>
      </div>

      {/* Chapters */}
      <div className="px-6 pb-20 max-w-4xl mx-auto">
        <h2 className="font-display text-3xl text-jungle-100 mb-2 text-center">Choose Your Chapter</h2>
        <p className="text-jungle-400 text-center mb-10">Each chapter is a different season, a different story, a different forest.</p>

        <div className="grid gap-4">
          {CHAPTERS.map(chapter => (
            <ChapterCard
              key={chapter.number}
              chapter={chapter}
              onSelect={() => setState(s => ({ ...s, chapter, step: 'date' }))}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

function ChapterCard({ chapter, onSelect }: { chapter: Chapter; onSelect: () => void }) {
  return (
    <div
      className={`card flex items-start gap-5 cursor-pointer transition-all duration-200 ${chapter.locked ? 'chapter-locked' : 'hover:border-jungle-400 hover:bg-jungle-600'}`}
      onClick={chapter.locked ? undefined : onSelect}
    >
      <div
        className="w-12 h-12 rounded-full flex items-center justify-center text-jungle-900 font-display font-bold text-lg flex-shrink-0 mt-0.5"
        style={{ backgroundColor: chapter.color }}
      >
        {chapter.number}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="font-display text-xl text-jungle-100">
              {chapter.name} <span className="text-jungle-400 font-normal">— {chapter.subtitle}</span>
            </h3>
            <p className="text-sm text-jungle-400 mt-0.5">{chapter.microseason} · {chapter.months}</p>
          </div>
          {chapter.locked ? (
            <span className="flex items-center gap-1 text-xs text-jungle-500 bg-jungle-800 px-2 py-1 rounded-full flex-shrink-0">
              <Lock className="w-3 h-3" /> Requires Ch.{(chapter.number - 1) as number}
            </span>
          ) : (
            <span className="flex items-center gap-1 text-xs text-jungle-300 bg-jungle-600 px-2 py-1 rounded-full flex-shrink-0">
              Available now
            </span>
          )}
        </div>
        <p className="text-jungle-300 text-sm mt-2 leading-relaxed line-clamp-2">{chapter.narrative}</p>
        {!chapter.locked && (
          <div className="flex items-center gap-4 mt-3 text-sm text-jungle-400">
            <span>~2 hours</span>
            <span>·</span>
            <span>Guided</span>
            <span>·</span>
            <span className="text-jungle-300">${chapter.priceAdult}/adult · ${chapter.priceChild}/child</span>
          </div>
        )}
      </div>
      {!chapter.locked && <ChevronRight className="text-jungle-400 w-5 h-5 flex-shrink-0 mt-3" />}
    </div>
  )
}

function DateSelection({
  state, setState, onBack, onNext
}: {
  state: BookingState
  setState: React.Dispatch<React.SetStateAction<BookingState>>
  onBack: () => void
  onNext: () => void
}) {
  const ch = state.chapter!

  return (
    <div className="min-h-screen pt-24 pb-20 px-6">
      <div className="max-w-5xl mx-auto">
        <button onClick={onBack} className="text-jungle-400 hover:text-jungle-200 text-sm mb-6 flex items-center gap-1 transition-colors">
          ← Back
        </button>

        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-full flex items-center justify-center text-jungle-900 font-bold text-sm" style={{ backgroundColor: ch.color }}>{ch.number}</div>
          <div>
            <h2 className="font-display text-2xl text-jungle-100">{ch.name} <span className="text-jungle-400 font-normal">— {ch.subtitle}</span></h2>
            <p className="text-sm text-jungle-400">{ch.months}</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Calendar */}
          <div>
            <div className="label mb-4 flex items-center gap-2"><Calendar className="w-3.5 h-3.5" /> Select a date</div>
            <div className="card">
              <p className="text-jungle-400 text-xs italic mb-4">"{ch.hook.split('.')[0]}."</p>
              <div className="grid grid-cols-4 gap-2">
                {AVAILABLE_DATES.map(d => (
                  <button
                    key={d}
                    onClick={() => setState(s => ({ ...s, date: d }))}
                    className={`py-2 px-1 rounded-lg text-xs text-center transition-all ${state.date === d ? 'bg-jungle-400 text-jungle-900 font-medium' : 'bg-jungle-800 text-jungle-300 hover:bg-jungle-600'}`}
                  >
                    {d}
                  </button>
                ))}
              </div>
              {state.date && (
                <div className="mt-4 pt-4 border-t border-jungle-600">
                  <div className="label mb-2">Time slot</div>
                  <div className="flex gap-2">
                    {TIME_SLOTS.map(t => (
                      <button
                        key={t}
                        onClick={() => setState(s => ({ ...s, timeSlot: t }))}
                        className={`flex-1 py-2 rounded-lg text-sm transition-all ${state.timeSlot === t ? 'bg-jungle-400 text-jungle-900 font-medium' : 'bg-jungle-800 text-jungle-300 hover:bg-jungle-600'}`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Group builder */}
          <div>
            <div className="label mb-4 flex items-center gap-2"><Users className="w-3.5 h-3.5" /> Who is coming?</div>
            <div className="card">
              <p className="text-jungle-400 text-xs mb-4">Each person gets their own forest identity.</p>

              <GroupBuilder state={state} setState={setState} />

              {(() => {
                const adultMembers = state.members.filter(m => m.type === 'adult')
                const childMembers = state.members.filter(m => m.type === 'child')
                return (
                  <div className="mt-4 pt-4 border-t border-jungle-600">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-jungle-400">{adultMembers.length} adult{adultMembers.length !== 1 ? 's' : ''} × ${ch.priceAdult}</span>
                      <span className="text-jungle-200">${adultMembers.length * ch.priceAdult}</span>
                    </div>
                    {childMembers.length > 0 && (
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-jungle-400">{childMembers.length} child{childMembers.length !== 1 ? 'ren' : ''} × ${ch.priceChild}</span>
                        <span className="text-jungle-200">${childMembers.length * ch.priceChild}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-medium mt-2 pt-2 border-t border-jungle-600">
                      <span className="text-jungle-200">Total</span>
                      <span className="text-jungle-100">${adultMembers.length * ch.priceAdult + childMembers.length * ch.priceChild}</span>
                    </div>
                  </div>
                )
              })()}
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-end">
          <button
            onClick={onNext}
            disabled={!state.date || !state.timeSlot}
            className="btn-primary disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
          >
            Continue to Registration <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

function GroupBuilder({ state, setState }: { state: BookingState; setState: React.Dispatch<React.SetStateAction<BookingState>> }) {
  const adults = state.members.filter(m => m.type === 'adult')
  const children = state.members.filter(m => m.type === 'child')

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-jungle-200 text-sm">Adults</span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setState(s => ({ ...s, members: s.members.filter(m => m.type !== 'adult' || s.members.filter(mm => mm.type === 'adult').indexOf(m) !== s.members.filter(mm => mm.type === 'adult').length - 1) }))}
            disabled={adults.length <= 1}
            className="w-7 h-7 rounded-full bg-jungle-600 hover:bg-jungle-500 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
          >
            <Minus className="w-3 h-3" />
          </button>
          <span className="text-jungle-100 w-4 text-center">{adults.length}</span>
          <button
            onClick={() => setState(s => ({ ...s, members: [...s.members, newMember('adult')] }))}
            disabled={adults.length >= 6}
            className="w-7 h-7 rounded-full bg-jungle-600 hover:bg-jungle-500 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
          >
            <Plus className="w-3 h-3" />
          </button>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-jungle-200 text-sm">Children <span className="text-jungle-400 text-xs">(under 12)</span></span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setState(s => ({ ...s, members: s.members.filter(m => m.type !== 'child' || s.members.filter(mm => mm.type === 'child').indexOf(m) !== s.members.filter(mm => mm.type === 'child').length - 1) }))}
            disabled={children.length === 0}
            className="w-7 h-7 rounded-full bg-jungle-600 hover:bg-jungle-500 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
          >
            <Minus className="w-3 h-3" />
          </button>
          <span className="text-jungle-100 w-4 text-center">{children.length}</span>
          <button
            onClick={() => setState(s => ({ ...s, members: [...s.members, newMember('child')] }))}
            disabled={children.length >= 4}
            className="w-7 h-7 rounded-full bg-jungle-600 hover:bg-jungle-500 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
          >
            <Plus className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  )
}

function Registration({
  state, setState, onBack, onNext, total
}: {
  state: BookingState
  setState: React.Dispatch<React.SetStateAction<BookingState>>
  onBack: () => void
  onNext: () => void
  total: number
}) {
  const updateMember = (id: string, field: keyof FamilyMember, value: string) => {
    setState(s => ({ ...s, members: s.members.map(m => m.id === id ? { ...m, [field]: value } : m) }))
  }

  const leadValid = (() => {
    const lead = state.members.find(m => m.isGroupLead)
    return lead && lead.firstName && lead.lastName && lead.email
  })()

  return (
    <div className="min-h-screen pt-24 pb-20 px-6">
      <div className="max-w-2xl mx-auto">
        <button onClick={onBack} className="text-jungle-400 hover:text-jungle-200 text-sm mb-6 flex items-center gap-1 transition-colors">← Back</button>

        <h2 className="font-display text-3xl text-jungle-100 mb-2">Let's set up your forest identities.</h2>
        <p className="text-jungle-400 mb-8 leading-relaxed">
          Before you arrive, we create a personal record for each person in your group — so the forest knows who you are the moment you step in.
        </p>

        <div className="space-y-4 mb-8">
          {state.members.map((member, i) => (
            <div key={member.id} className="card">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 rounded-full bg-jungle-500 flex items-center justify-center text-xs text-jungle-900 font-medium">{i + 1}</div>
                <span className="text-sm text-jungle-200 font-medium">
                  {member.type === 'adult' ? 'Adult' : 'Child'}{member.isGroupLead ? ' · Group Lead' : ''}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="First name"
                  value={member.firstName}
                  onChange={e => updateMember(member.id, 'firstName', e.target.value)}
                  className="bg-jungle-800 border border-jungle-600 rounded-lg px-3 py-2 text-sm text-jungle-100 placeholder-jungle-500 focus:outline-none focus:border-jungle-400"
                />
                <input
                  type="text"
                  placeholder={member.type === 'child' ? 'Age' : 'Last name'}
                  value={member.type === 'child' ? (member.age?.toString() ?? '') : member.lastName}
                  onChange={e => updateMember(member.id, member.type === 'child' ? 'age' : 'lastName', e.target.value)}
                  className="bg-jungle-800 border border-jungle-600 rounded-lg px-3 py-2 text-sm text-jungle-100 placeholder-jungle-500 focus:outline-none focus:border-jungle-400"
                />
                {member.type === 'adult' && (
                  <>
                    <input
                      type="email"
                      placeholder="Email address"
                      value={member.email}
                      onChange={e => updateMember(member.id, 'email', e.target.value)}
                      className="col-span-2 bg-jungle-800 border border-jungle-600 rounded-lg px-3 py-2 text-sm text-jungle-100 placeholder-jungle-500 focus:outline-none focus:border-jungle-400"
                    />
                    <select
                      value={member.language}
                      onChange={e => updateMember(member.id, 'language', e.target.value)}
                      className="bg-jungle-800 border border-jungle-600 rounded-lg px-3 py-2 text-sm text-jungle-300 focus:outline-none focus:border-jungle-400"
                    >
                      <option value="en">English</option>
                      <option value="es">Español</option>
                    </select>
                  </>
                )}
                {member.type === 'child' && (
                  <p className="col-span-2 text-xs text-jungle-500 italic">Linked to the group lead. No email required.</p>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="card mb-6">
          <p className="text-jungle-300 text-sm mb-1 font-medium">WhatsApp (optional)</p>
          <p className="text-jungle-500 text-xs mb-3">We'll send your forest story here after the visit.</p>
          <input
            type="tel"
            placeholder="+52 984 000 0000"
            value={state.whatsapp}
            onChange={e => setState(s => ({ ...s, whatsapp: e.target.value }))}
            className="w-full bg-jungle-800 border border-jungle-600 rounded-lg px-3 py-2 text-sm text-jungle-100 placeholder-jungle-500 focus:outline-none focus:border-jungle-400"
          />
        </div>

        <div className="card mb-8 space-y-3">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={state.audioConsent}
              onChange={e => setState(s => ({ ...s, audioConsent: e.target.checked }))}
              className="mt-0.5 accent-jungle-400"
            />
            <span className="text-sm text-jungle-300 leading-relaxed">
              We record and transcribe guided tours to build a permanent scientific and cultural record of Pulmón Verde. Your transcript belongs to you — access it any time, request deletion, or contribute it to the shared knowledge archive.
            </span>
          </label>
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={state.termsAccepted}
              onChange={e => setState(s => ({ ...s, termsAccepted: e.target.checked }))}
              className="mt-0.5 accent-jungle-400"
            />
            <span className="text-sm text-jungle-300">I agree to the conservation experience terms and conditions.</span>
          </label>
        </div>

        <div className="flex items-center justify-between">
          <div className="text-sm text-jungle-400">Total: <span className="text-jungle-100 font-medium">${total}</span></div>
          <button
            onClick={onNext}
            disabled={!leadValid || !state.termsAccepted}
            className="btn-primary disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
          >
            Continue to Payment <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

function Payment({
  state, total, onBack, onComplete
}: {
  state: BookingState
  total: number
  onBack: () => void
  onComplete: () => void
}) {
  const [method, setMethod] = useState<'card' | 'hotel'>('card')
  const [processing, setProcessing] = useState(false)
  const ch = state.chapter!

  const handlePay = () => {
    setProcessing(true)
    setTimeout(() => { setProcessing(false); onComplete() }, 1800)
  }

  return (
    <div className="min-h-screen pt-24 pb-20 px-6">
      <div className="max-w-4xl mx-auto">
        <button onClick={onBack} className="text-jungle-400 hover:text-jungle-200 text-sm mb-6 flex items-center gap-1 transition-colors">← Back</button>

        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <div className="label mb-4 flex items-center gap-2"><CreditCard className="w-3.5 h-3.5" /> Payment</div>
            <div className="card mb-4">
              <div className="flex gap-2 mb-6">
                <button
                  onClick={() => setMethod('card')}
                  className={`flex-1 py-2 rounded-lg text-sm transition-all ${method === 'card' ? 'bg-jungle-400 text-jungle-900 font-medium' : 'bg-jungle-800 text-jungle-300 hover:bg-jungle-600'}`}
                >
                  Pay with Card
                </button>
                <button
                  onClick={() => setMethod('hotel')}
                  className={`flex-1 py-2 rounded-lg text-sm transition-all ${method === 'hotel' ? 'bg-jungle-400 text-jungle-900 font-medium' : 'bg-jungle-800 text-jungle-300 hover:bg-jungle-600'}`}
                >
                  Hotel Concierge
                </button>
              </div>

              {method === 'card' ? (
                <div className="space-y-3">
                  <input type="text" placeholder="Card number" className="w-full bg-jungle-800 border border-jungle-600 rounded-lg px-3 py-2.5 text-sm text-jungle-100 placeholder-jungle-500 focus:outline-none focus:border-jungle-400" />
                  <div className="grid grid-cols-2 gap-3">
                    <input type="text" placeholder="MM / YY" className="bg-jungle-800 border border-jungle-600 rounded-lg px-3 py-2.5 text-sm text-jungle-100 placeholder-jungle-500 focus:outline-none focus:border-jungle-400" />
                    <input type="text" placeholder="CVC" className="bg-jungle-800 border border-jungle-600 rounded-lg px-3 py-2.5 text-sm text-jungle-100 placeholder-jungle-500 focus:outline-none focus:border-jungle-400" />
                  </div>
                  <input type="text" placeholder="Name on card" className="w-full bg-jungle-800 border border-jungle-600 rounded-lg px-3 py-2.5 text-sm text-jungle-100 placeholder-jungle-500 focus:outline-none focus:border-jungle-400" />
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-jungle-300 text-sm mb-1">A voucher code will be generated for you.</p>
                  <p className="text-jungle-500 text-xs">Take it to the hotel concierge desk. They will process the payment through your hotel invoice.</p>
                </div>
              )}
            </div>
            <button
              onClick={handlePay}
              disabled={processing}
              className="btn-gold w-full flex items-center justify-center gap-2 text-sm font-medium"
            >
              {processing ? (
                <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-jungle-900/30 border-t-jungle-900 rounded-full animate-spin" /> Processing…</span>
              ) : (
                `${method === 'hotel' ? 'Generate Voucher' : `Pay $${total}`}`
              )}
            </button>
          </div>

          {/* Summary */}
          <div>
            <div className="label mb-4">Summary</div>
            <div className="card">
              <div className="flex items-center gap-3 mb-4 pb-4 border-b border-jungle-600">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-jungle-900 font-bold text-sm flex-shrink-0" style={{ backgroundColor: ch.color }}>{ch.number}</div>
                <div>
                  <p className="text-jungle-100 font-medium">{ch.name} — {ch.subtitle}</p>
                  <p className="text-jungle-400 text-xs">Guide: Rosa Canché · ~2 hours</p>
                </div>
              </div>
              <div className="space-y-1 text-sm mb-4">
                <div className="flex justify-between">
                  <span className="text-jungle-400">{state.date}</span>
                  <span className="text-jungle-200">{state.timeSlot}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-jungle-400">Group</span>
                  <span className="text-jungle-200">{state.members.filter(m => m.type === 'adult').length} adults, {state.members.filter(m => m.type === 'child').length} children</span>
                </div>
              </div>
              <div className="border-t border-jungle-600 pt-3 space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-jungle-400">{state.members.filter(m => m.type === 'adult').length} adults × ${ch.priceAdult}</span>
                  <span className="text-jungle-200">${state.members.filter(m => m.type === 'adult').length * ch.priceAdult}</span>
                </div>
                {state.members.filter(m => m.type === 'child').length > 0 && (
                  <div className="flex justify-between">
                    <span className="text-jungle-400">{state.members.filter(m => m.type === 'child').length} children × ${ch.priceChild}</span>
                    <span className="text-jungle-200">${state.members.filter(m => m.type === 'child').length * ch.priceChild}</span>
                  </div>
                )}
                <div className="flex justify-between font-medium pt-1">
                  <span className="text-jungle-200">Total</span>
                  <span className="text-jungle-100 text-base">${total}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function ConfirmationScreen({ state, onNavigate }: { state: BookingState; onNavigate: () => void }) {
  const ch = state.chapter!
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
      <CheckCircle className="w-16 h-16 text-jungle-400 mb-6" />
      <h1 className="font-display text-4xl text-jungle-100 mb-2">You're going to the forest.</h1>
      <p className="font-display italic text-xl text-jungle-300 mb-8">{ch.name} — {ch.subtitle}</p>

      <div className="card max-w-sm w-full text-left mb-8">
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-jungle-400">Date</span>
            <span className="text-jungle-200">{state.date}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-jungle-400">Time</span>
            <span className="text-jungle-200">{state.timeSlot}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-jungle-400">Guide</span>
            <span className="text-jungle-200">Rosa Canché</span>
          </div>
          <div className="flex justify-between">
            <span className="text-jungle-400">Group</span>
            <span className="text-jungle-200">{state.members.length} people</span>
          </div>
        </div>
      </div>

      <p className="text-jungle-400 text-sm mb-6 max-w-sm">
        Your forest identities have been created. Check your email to claim them before you arrive.
      </p>

      <div className="flex flex-col gap-3 w-full max-w-xs">
        <button onClick={onNavigate} className="btn-primary flex items-center justify-center gap-2">
          Claim Your Avatar <ChevronRight className="w-4 h-4" />
        </button>
        <button onClick={() => window.location.href = '/book'} className="btn-secondary text-sm">
          Book another chapter
        </button>
      </div>
    </div>
  )
}
