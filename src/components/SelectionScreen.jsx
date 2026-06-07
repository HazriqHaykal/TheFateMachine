import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ParticipantCard from './ParticipantCard'
import CountdownTimer from './CountdownTimer'
import { soundEngine } from '../utils/soundEngine'

// Phases: countdown → cycling → eliminating → finalShowdown → revealing
const PHASE_LABELS = {
  countdown: 'INITIALIZING...',
  cycling: 'SCANNING TARGETS',
  eliminating: 'ELIMINATION IN PROGRESS',
  finalShowdown: 'FINAL SHOWDOWN',
  revealing: 'FATE HAS SPOKEN',
}

export default function SelectionScreen({ participants, noMercyMode, isMuted, onWinner, onCancel }) {
  // Pre-determine the elimination outcome at mount time
  const outcome = useMemo(() => {
    const shuffled = [...participants].sort(() => Math.random() - 0.5)
    // Last in shuffled = winner; rest = elimination order (first eliminated first)
    return {
      winnerId: shuffled[shuffled.length - 1].id,
      eliminationOrder: shuffled.slice(0, -1).map(p => p.id),
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // All card ids that are currently "alive" on screen
  const [activeIds, setActiveIds] = useState(participants.map(p => p.id))
  const activeIdsRef = useRef(participants.map(p => p.id))

  const [phase, setPhase] = useState('countdown')
  const [countdown, setCountdown] = useState(3)
  const [flashingId, setFlashingId] = useState(null) // currently lit-up card in cycling
  const [eliminatingIds, setEliminatingIds] = useState([]) // cards mid-elimination (batch)
  const [screenShaking, setScreenShaking] = useState(false)
  const [remainingCount, setRemainingCount] = useState(participants.length)
  const [luckyId, setLuckyId] = useState(null) // card that got a fake-out

  // How many to eliminate at once — tapers as the pool shrinks
  const getBatchSize = (remaining) => {
    if (noMercyMode) {
      if (remaining > 10) return 3
      if (remaining > 4) return 2
      return 1
    }
    if (remaining > 12) return 3
    if (remaining > 6) return 2
    return 1
  }

  // Keep activeIdsRef in sync
  useEffect(() => {
    activeIdsRef.current = activeIds
    setRemainingCount(activeIds.length)
  }, [activeIds])

  const participantMap = useMemo(() => {
    const m = {}
    participants.forEach(p => { m[p.id] = p })
    return m
  }, [participants])

  // Build status for each active card
  const getCardStatus = useCallback((id) => {
    if (eliminatingIds.includes(id)) return 'eliminating'
    if (id === luckyId) return 'flashing'
    if (id === flashingId) return 'flashing'
    if (phase === 'finalShowdown' || phase === 'revealing') return 'survivor'
    if (phase === 'revealing' && id === outcome.winnerId) return 'winner'
    return 'idle'
  }, [eliminatingIds, flashingId, luckyId, phase, outcome.winnerId])

  // Main sequencer
  useEffect(() => {
    soundEngine.setMuted(isMuted)
    soundEngine.setNoMercy(noMercyMode)

    const ac = new AbortController()
    const { signal } = ac

    const sleep = (ms) => new Promise((resolve, reject) => {
      const t = setTimeout(resolve, ms)
      signal.addEventListener('abort', () => { clearTimeout(t); reject(new DOMException('Aborted', 'AbortError')) }, { once: true })
    })

    const safeSet = (fn) => { if (!signal.aborted) fn() }

    async function run() {
      // ─── PHASE 1: COUNTDOWN ───────────────────────────────────────────────
      for (let i = 3; i >= 1; i--) {
        safeSet(() => setCountdown(i))
        soundEngine.playCountdownBeep(i === 1)
        await sleep(1000)
      }
      safeSet(() => setCountdown(0))
      await sleep(400)

      // ─── PHASE 2: CYCLING ─────────────────────────────────────────────────
      safeSet(() => setPhase('cycling'))
      const cycleDuration = noMercyMode ? 1800 : 2600
      const cycleEnd = Date.now() + cycleDuration

      while (Date.now() < cycleEnd) {
        const ids = activeIdsRef.current
        const rnd = ids[Math.floor(Math.random() * ids.length)]
        safeSet(() => setFlashingId(rnd))
        soundEngine.playTick()
        await sleep(noMercyMode ? 75 : 130)
      }
      safeSet(() => setFlashingId(null))
      await sleep(300)

      // ─── PHASE 3: ELIMINATION ─────────────────────────────────────────────
      safeSet(() => setPhase('eliminating'))

      // Eliminate everyone except winner & runner-up using adaptive batches
      const mainElimCount = outcome.eliminationOrder.length - 1
      let elimIdx = 0

      while (elimIdx < mainElimCount) {
        const remaining = activeIdsRef.current.length
        const isSlowPhase = remaining <= 6

        // Determine how many to cut this round (clamp to what's left)
        const batch = Math.min(getBatchSize(remaining), mainElimCount - elimIdx)
        const batchIds = outcome.eliminationOrder.slice(elimIdx, elimIdx + batch)

        // Flash buildup — shorter for large batches, fuller for slow phase
        const numFlashes = isSlowPhase ? 12 : (batch >= 3 ? 3 : 5)
        const flashInterval = noMercyMode
          ? (isSlowPhase ? 55 : 25)
          : (isSlowPhase ? 95 : 40)

        for (let j = 0; j < numFlashes; j++) {
          const ids = activeIdsRef.current.filter(id => !batchIds.includes(id))
          if (ids.length > 0) {
            safeSet(() => setFlashingId(ids[Math.floor(Math.random() * ids.length)]))
            soundEngine.playTick()
          }
          await sleep(flashInterval)
        }
        safeSet(() => setFlashingId(null))
        await sleep(60)

        // Lucky escape fake-out (slow phase, single eliminations only)
        if (isSlowPhase && !noMercyMode && batch === 1 && Math.random() < 0.35) {
          const ids = activeIdsRef.current.filter(id => !batchIds.includes(id))
          if (ids.length > 0) {
            const luckyTarget = ids[Math.floor(Math.random() * ids.length)]
            safeSet(() => setLuckyId(luckyTarget))
            soundEngine.playLuckyEscape()
            await sleep(600)
            safeSet(() => setLuckyId(null))
            await sleep(200)
          }
        }

        // Eliminate the batch simultaneously
        safeSet(() => setEliminatingIds(batchIds))
        soundEngine.playElimination()
        // Stagger a second sound for batches of 2+
        if (batch >= 2) {
          await sleep(80)
          soundEngine.playElimination()
        }

        // Screen shake on slow phase or no mercy
        if (isSlowPhase || noMercyMode) {
          safeSet(() => setScreenShaking(true))
          await sleep(noMercyMode ? 200 : 280)
          safeSet(() => setScreenShaking(false))
        }

        const animDuration = isSlowPhase
          ? (noMercyMode ? 600 : 800)
          : (noMercyMode ? 480 : 620)
        await sleep(animDuration)

        safeSet(() => {
          setActiveIds(prev => {
            const next = prev.filter(id => !batchIds.includes(id))
            activeIdsRef.current = next
            return next
          })
          setEliminatingIds([])
        })

        const pauseMs = isSlowPhase
          ? (noMercyMode ? 350 : 600)
          : (noMercyMode ? 100 : 200)
        await sleep(pauseMs)

        elimIdx += batch
      }

      // ─── PHASE 4: FINAL SHOWDOWN ──────────────────────────────────────────
      safeSet(() => setPhase('finalShowdown'))

      // Heartbeat pulses
      const beats = noMercyMode ? 7 : 5
      for (let i = 0; i < beats; i++) {
        soundEngine.playHeartbeat()
        safeSet(() => setScreenShaking(true))
        await sleep(140)
        safeSet(() => setScreenShaking(false))
        await sleep(noMercyMode ? 400 : 560)
      }

      // Suspense rise
      soundEngine.playSuspenseRise()
      await sleep(2200)

      // Final dramatic shake
      safeSet(() => setScreenShaking(true))
      await sleep(500)
      safeSet(() => setScreenShaking(false))
      await sleep(250)

      // ─── PHASE 5: ELIMINATE RUNNER-UP ────────────────────────────────────
      const runnerUpId = outcome.eliminationOrder[outcome.eliminationOrder.length - 1]
      safeSet(() => setEliminatingIds([runnerUpId]))
      soundEngine.playElimination()

      safeSet(() => setScreenShaking(true))
      await sleep(300)
      safeSet(() => setScreenShaking(false))

      await sleep(900)

      safeSet(() => {
        setActiveIds(prev => {
          const next = prev.filter(id => id !== runnerUpId)
          activeIdsRef.current = next
          return next
        })
        setEliminatingIds([])
      })

      // ─── PHASE 6: REVEAL WINNER ───────────────────────────────────────────
      safeSet(() => setPhase('revealing'))
      await sleep(400)

      soundEngine.playReveal()
      await sleep(300)
      soundEngine.playVictory()

      await sleep(1800)

      // Navigate to result screen
      const winnerName = participantMap[outcome.winnerId]?.name
      if (winnerName) safeSet(() => onWinner(winnerName))
    }

    run().catch(e => { if (e.name !== 'AbortError') console.error(e) })

    return () => ac.abort()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Grid columns based on remaining count
  const gridCols = useMemo(() => {
    const n = activeIds.length
    if (n <= 2) return 'grid-cols-2'
    if (n <= 4) return 'grid-cols-2 sm:grid-cols-2'
    if (n <= 6) return 'grid-cols-2 sm:grid-cols-3'
    if (n <= 9) return 'grid-cols-3'
    if (n <= 12) return 'grid-cols-3 sm:grid-cols-4'
    return 'grid-cols-4 sm:grid-cols-5'
  }, [activeIds.length])

  const phaseLabel = PHASE_LABELS[phase] || ''
  const isFinalPhase = phase === 'finalShowdown' || phase === 'revealing'

  return (
    <div
      className={`min-h-screen flex flex-col relative ${screenShaking ? 'screen-shake' : ''}`}
    >
      {/* Phase: countdown overlay */}
      {phase === 'countdown' && countdown > 0 && (
        <>
          {/* Dim cards behind countdown */}
          <div className="fixed inset-0 bg-void/70 z-20" />
          <CountdownTimer value={countdown} />
        </>
      )}

      {/* Top HUD bar */}
      <div className="sticky top-0 z-10 flex items-center justify-between px-4 py-3"
        style={{ background: 'rgba(5,5,9,0.9)', borderBottom: '1px solid rgba(0,245,255,0.1)', backdropFilter: 'blur(8px)' }}
      >
        <button
          onClick={onCancel}
          className="font-mono text-xs text-white/30 hover:text-red-neon transition-colors tracking-wider"
        >
          ← ABORT
        </button>

        <motion.div
          key={phaseLabel}
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-display text-xs tracking-widest text-center"
          style={{
            color: isFinalPhase ? '#ffd700'
              : phase === 'eliminating' ? '#ff003c'
              : '#00f5ff',
            textShadow: isFinalPhase ? '0 0 15px #ffd700' : 'none',
          }}
        >
          {phaseLabel}
        </motion.div>

        <div className="font-mono text-xs text-right">
          <span className="text-white/30">REMAINING </span>
          <motion.span
            key={remainingCount}
            initial={{ scale: 1.5, color: '#ff003c' }}
            animate={{ scale: 1, color: '#00f5ff' }}
            className="font-bold"
          >
            {remainingCount.toString().padStart(2, '0')}
          </motion.span>
        </div>
      </div>

      {/* Final showdown overlay text */}
      <AnimatePresence>
        {phase === 'finalShowdown' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 flex items-start justify-center pt-24 pointer-events-none z-10"
          >
            <motion.div
              animate={{ scale: [1, 1.04, 1], opacity: [0.8, 1, 0.8] }}
              transition={{ duration: 1.2, repeat: Infinity }}
              className="font-display font-black tracking-[0.2em] text-center"
              style={{
                fontSize: 'clamp(1.2rem, 4vw, 2.5rem)',
                color: '#ffd700',
                textShadow: '0 0 20px rgba(255,215,0,0.8), 0 0 60px rgba(255,215,0,0.4)',
              }}
            >
              TWO REMAIN
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Revealing overlay */}
      <AnimatePresence>
        {phase === 'revealing' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 flex items-start justify-center pt-20 pointer-events-none z-10"
          >
            <motion.div
              animate={{ scale: [0.9, 1.02, 1], opacity: [0, 1] }}
              transition={{ duration: 0.5 }}
              className="font-display font-black tracking-[0.25em] text-center"
              style={{
                fontSize: 'clamp(1rem, 3.5vw, 2rem)',
                color: '#ffd700',
                textShadow: '0 0 30px rgba(255,215,0,1), 0 0 80px rgba(255,215,0,0.5)',
              }}
            >
              FATE HAS CHOSEN
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Card grid */}
      <div className="flex-1 flex items-center justify-center p-4 pt-8">
        <motion.div
          layout
          className={`grid ${gridCols} gap-3 w-full`}
          style={{
            maxWidth: isFinalPhase ? '500px' : '900px',
            transition: 'max-width 0.8s ease',
          }}
        >
          <AnimatePresence>
            {activeIds.map((id, index) => (
              <ParticipantCard
                key={id}
                participant={participantMap[id]}
                status={getCardStatus(id)}
                noMercyMode={noMercyMode}
                index={index}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* No Mercy watermark */}
      {noMercyMode && (
        <div
          className="fixed bottom-4 right-4 font-mono text-[10px] tracking-widest text-red-neon/30 pointer-events-none"
          style={{ textShadow: '0 0 8px rgba(255,0,60,0.3)' }}
        >
          NO MERCY ACTIVE
        </div>
      )}
    </div>
  )
}
