import { motion } from 'framer-motion'
import { soundEngine } from '../utils/soundEngine'

function GlitchTitle({ text }) {
  return (
    <h1
      className="font-display font-black text-neon-cyan select-none glitch-text"
      style={{ fontSize: 'clamp(1.8rem, 5vw, 3rem)', letterSpacing: '0.05em' }}
      data-text={text}
    >
      {text}
    </h1>
  )
}

export default function HomeScreen({
  participants, question, questionIndex, totalQuestions,
  onStart, noMercyMode, setNoMercyMode,
  isMuted, setIsMuted, allDone, onReset, onRemoveParticipant,
}) {
  return (
    <div className="min-h-screen flex flex-col">

      {/* Top bar */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-cyan-neon" style={{ boxShadow: '0 0 8px #00f5ff' }} />
          <span className="font-mono text-[10px] tracking-widest text-cyan-neon/60">SYSTEM ONLINE</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="font-mono text-[10px] text-white/30">v2.0.77</span>
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="font-mono text-[10px] text-white/40 hover:text-cyan-neon transition-colors px-2 py-1 rounded border border-white/10 hover:border-cyan-neon/40"
          >
            {isMuted ? 'SFX OFF' : 'SFX ON'}
          </button>
        </div>
      </div>

      {/* Hero */}
      <div className="text-center py-6 px-4 relative">
        <div className="absolute left-0 right-0 top-1/2 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(0,245,255,0.1), transparent)' }} />
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="font-mono text-[10px] tracking-[0.4em] text-cyan-neon/50 mb-2">[ CLASSIFIED PROTOCOL ]</div>
          <GlitchTitle text="THE FATE MACHINE" />
          <p className="font-body text-white/40 tracking-widest text-sm mt-2 font-light">
            NO ONE IS SAFE — FATE DECIDES
          </p>
        </motion.div>
      </div>

      {/* ── All done state ── */}
      {allDone ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-6 px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="panel-border-cyan rounded-xl p-10 bg-panel/80 text-center max-w-lg w-full"
          >
            <div className="font-mono text-xs tracking-widest text-gold-neon/70 mb-3">SESSION COMPLETE</div>
            <h2 className="font-display font-bold text-2xl text-white mb-3">All questions have been asked.</h2>
            <p className="font-mono text-sm text-white/30">
              {totalQuestions} rounds completed — {totalQuestions} participants selected and removed.
            </p>
          </motion.div>
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            whileTap={{ scale: 0.96 }}
            onClick={onReset}
            className="px-10 py-4 rounded-xl font-display text-sm tracking-widest"
            style={{
              border: '1px solid rgba(0,245,255,0.4)',
              color: '#00f5ff',
              background: 'rgba(0,245,255,0.06)',
            }}
          >
            RESET SESSION
          </motion.button>
        </div>
      ) : (
        <div className="flex-1 px-4 pb-4 grid grid-cols-1 lg:grid-cols-5 gap-4 max-w-6xl mx-auto w-full">

          {/* Left: Current question + controls */}
          <div className="lg:col-span-2 flex flex-col gap-4">

            {/* Current question panel */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="panel-border-cyan rounded-lg p-4 bg-panel/80"
            >
              <div className="flex items-center gap-2 mb-3">
                <div className="status-light" style={{ background: '#ffd700', boxShadow: '0 0 6px #ffd700' }} />
                <span className="font-display text-xs tracking-widest text-gold-neon/80">
                  {question.round.toUpperCase()} OF {totalQuestions}
                </span>
              </div>

              <div
                className="font-display font-bold text-sm mb-2"
                style={{ color: '#00f5ff' }}
              >
                {question.title}
              </div>

              <p className="font-body text-white/60 text-sm leading-relaxed">
                {question.question}
              </p>

              <div className="mt-3 space-y-1">
                {question.options.map(opt => (
                  <div
                    key={opt.letter}
                    className="font-mono text-xs text-white/35 flex items-start gap-2"
                  >
                    <span className="text-cyan-neon/50 shrink-0">{opt.letter}.</span>
                    <span>{opt.text}</span>
                  </div>
                ))}
              </div>

              <div className="mt-3 pt-3 border-t border-white/5 font-mono text-[10px] text-white/20 tracking-wider">
                ANSWER WILL BE REVEALED AFTER SELECTION
              </div>
            </motion.div>

            {/* No Mercy toggle */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className={`rounded-lg p-4 transition-all ${noMercyMode ? 'no-mercy-badge' : 'panel-border-cyan bg-panel/60'}`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3
                    className="font-display text-xs tracking-widest"
                    style={{ color: noMercyMode ? '#ff003c' : 'rgba(255,255,255,0.7)' }}
                  >
                    NO MERCY MODE
                  </h3>
                  <p className="font-mono text-[10px] text-white/30 mt-1">
                    {noMercyMode ? 'MAXIMUM INTENSITY ENGAGED' : 'Amplified chaos & faster eliminations'}
                  </p>
                </div>
                <button
                  onClick={() => setNoMercyMode(n => !n)}
                  className="relative w-12 h-6 rounded-full transition-all duration-300 shrink-0"
                  style={{
                    background: noMercyMode ? 'linear-gradient(135deg, #ff003c, #aa0028)' : 'rgba(255,255,255,0.1)',
                    border: `1px solid ${noMercyMode ? '#ff003c' : 'rgba(255,255,255,0.15)'}`,
                    boxShadow: noMercyMode ? '0 0 12px rgba(255,0,60,0.5)' : 'none',
                  }}
                >
                  <motion.div
                    animate={{ x: noMercyMode ? 24 : 2 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    className="absolute top-0.5 bottom-0.5 w-4 rounded-full bg-white"
                  />
                </button>
              </div>
            </motion.div>

            {/* Status */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.25 }}
              className="panel-border-cyan rounded-lg p-3 bg-panel/60 font-mono text-xs"
            >
              <div className="flex justify-between items-center">
                <span className="text-white/40">PARTICIPANTS REMAINING</span>
                <span className="font-bold text-neon-cyan">{participants.length.toString().padStart(2, '0')}</span>
              </div>
              <div className="flex justify-between items-center mt-1">
                <span className="text-white/40">ROUND</span>
                <span className="text-white/70">{questionIndex + 1} / {totalQuestions}</span>
              </div>
              {noMercyMode && (
                <div className="flex justify-between items-center mt-1">
                  <span className="text-white/40">PROTOCOL</span>
                  <span className="text-red-neon animate-pulse">NO MERCY</span>
                </div>
              )}
            </motion.div>
          </div>

          {/* Right: Participant pool */}
          <div className="lg:col-span-3 flex flex-col gap-4">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 }}
              className="panel-border-cyan rounded-lg p-4 bg-panel/80 flex-1"
            >
              <div className="flex items-center gap-2 mb-4">
                <div className="status-light" style={{ background: '#ff003c', boxShadow: '0 0 6px #ff003c' }} />
                <h2 className="font-display text-xs tracking-widest text-white/60">
                  REMAINING TARGETS — {participants.length}
                </h2>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-80 overflow-y-auto pr-1">
                {participants.map((p, i) => (
                  <motion.div
                    key={p.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.02 }}
                    className="rounded px-2 py-1.5 font-body text-sm text-white/75 flex items-center justify-between group"
                    style={{
                      background: 'rgba(0,245,255,0.04)',
                      border: '1px solid rgba(0,245,255,0.10)',
                    }}
                  >
                    <span className="truncate">{p.name}</span>
                    <button
                      onClick={() => onRemoveParticipant(p.id)}
                      className="ml-1 shrink-0 text-white/20 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 leading-none"
                      title="Remove"
                    >
                      ×
                    </button>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      )}

      {/* Start button */}
      {!allDone && (
        <div className="px-4 pb-6 max-w-6xl mx-auto w-full">
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={onStart}
            className="w-full py-5 rounded-xl font-display font-bold tracking-[0.3em] text-lg relative overflow-hidden"
            style={noMercyMode ? {
              background: 'linear-gradient(135deg, rgba(255,0,60,0.3), rgba(120,0,30,0.3))',
              border: '2px solid #ff003c',
              color: '#ff003c',
              boxShadow: '0 0 30px rgba(255,0,60,0.3)',
            } : {
              background: 'linear-gradient(135deg, rgba(0,245,255,0.2), rgba(0,130,150,0.2))',
              border: '2px solid #00f5ff',
              color: '#00f5ff',
              boxShadow: '0 0 30px rgba(0,245,255,0.3)',
            }}
          >
            <motion.div
              className="absolute inset-0"
              animate={{ x: ['-100%', '200%'] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'linear' }}
              style={{
                background: `linear-gradient(90deg, transparent, ${noMercyMode ? 'rgba(255,0,60,0.15)' : 'rgba(0,245,255,0.12)'}, transparent)`,
                width: '30%',
              }}
            />
            <span className="relative z-10">
              {noMercyMode ? 'INITIATE NO MERCY' : 'INITIATE FATE'}
            </span>
          </motion.button>
        </div>
      )}
    </div>
  )
}
