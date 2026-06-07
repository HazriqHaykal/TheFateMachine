import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Confetti from './Confetti'

function nameToColor(name) {
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  const colors = ['#00f5ff', '#9b5de5', '#f15bb5', '#00ff88', '#ff6b35', '#4cc9f0', '#f72585', '#3a86ff']
  return colors[Math.abs(hash) % colors.length]
}

function getInitials(name) {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
}

export default function ResultScreen({ winner, question, questionIndex, totalQuestions, onNextRound, onReset }) {
  const [showConfetti, setShowConfetti] = useState(false)
  const [revealed, setRevealed] = useState(false)
  const [answerShown, setAnswerShown] = useState(false)

  const color = nameToColor(winner || '')
  const initials = getInitials(winner || '??')
  const isLastQuestion = questionIndex >= totalQuestions - 1

  useEffect(() => {
    const t1 = setTimeout(() => setRevealed(true), 300)
    const t2 = setTimeout(() => setShowConfetti(true), 900)
    // Stop confetti after a few seconds
    const t3 = setTimeout(() => setShowConfetti(false), 5000)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
  }, [])

  const handleNextRound = () => {
    setShowConfetti(false)
    setTimeout(onNextRound, 200)
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-start relative overflow-hidden px-4 py-6 gap-6">
      <Confetti isActive={showConfetti} />

      {/* Background glow */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{ background: `radial-gradient(ellipse at 50% 30%, ${color}08 0%, transparent 65%)` }}
      />

      {/* Round indicator */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 font-mono text-[10px] tracking-[0.4em] text-white/30"
      >
        {question.round.toUpperCase()} OF {totalQuestions} — {question.title.toUpperCase()}
      </motion.div>

      {/* Winner card */}
      {revealed && (
        <motion.div
          initial={{ scale: 0.15, opacity: 0, rotate: -12 }}
          animate={{ scale: 1, opacity: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 190, damping: 22 }}
          className="relative z-10"
        >
          {/* Pulse rings */}
          {[1, 2].map(i => (
            <motion.div
              key={i}
              className="absolute inset-0 rounded-2xl pointer-events-none"
              animate={{ scale: [1, 1.4 + i * 0.15], opacity: [0.5, 0] }}
              transition={{ duration: 1.6, repeat: Infinity, delay: i * 0.35, ease: 'easeOut' }}
              style={{ border: `1px solid ${i === 1 ? '#ffd700' : color}` }}
            />
          ))}

          <div
            className="relative rounded-2xl px-8 py-6 text-center"
            style={{
              background: `linear-gradient(135deg, ${color}10, rgba(13,13,26,0.98), ${color}06)`,
              border: '2px solid #ffd700',
              boxShadow: '0 0 35px rgba(255,215,0,0.45), 0 0 80px rgba(255,215,0,0.15)',
              minWidth: 'clamp(220px, 40vw, 340px)',
            }}
          >
            {/* Corner accents */}
            {[
              { top: 0, left: 0 }, { top: 0, right: 0 },
              { bottom: 0, left: 0 }, { bottom: 0, right: 0 },
            ].map((pos, i) => (
              <div key={i} className="absolute" style={pos}>
                <div style={{ width: 16, height: 2, background: '#ffd700', boxShadow: '0 0 6px #ffd700', position: 'absolute', ...pos }} />
                <div style={{ width: 2, height: 16, background: '#ffd700', boxShadow: '0 0 6px #ffd700', position: 'absolute', ...pos }} />
              </div>
            ))}

            {/* Avatar */}
            <motion.div
              animate={{ scale: [1, 1.04, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center font-display font-black text-2xl relative"
              style={{
                background: `radial-gradient(circle, ${color}30, ${color}10)`,
                border: `2px solid ${color}`,
                color,
                boxShadow: `0 0 25px ${color}55`,
              }}
            >
              {initials}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-0 rounded-full"
                style={{ border: '1px solid transparent', borderTopColor: '#ffd700', borderRightColor: '#ffd70055' }}
              />
            </motion.div>

            <div className="font-mono text-[10px] tracking-widest text-white/35 mb-1">SELECTED BY FATE</div>
            <h2
              className="font-display font-black text-neon-gold"
              style={{ fontSize: 'clamp(1.6rem, 5vw, 2.8rem)', wordBreak: 'break-word' }}
            >
              {winner}
            </h2>
          </div>
        </motion.div>
      )}

      {/* Question section */}
      {revealed && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="relative z-10 w-full max-w-2xl panel-border-cyan rounded-xl p-5 bg-panel/90"
        >
          <div className="font-mono text-[10px] tracking-widest text-cyan-neon/60 mb-2">YOUR QUESTION</div>

          <p className="font-body text-white/90 text-base leading-relaxed mb-4">
            {question.question}
          </p>

          {/* Options */}
          <div className="space-y-2 mb-5">
            {question.options.map(opt => {
              const isCorrect = opt.letter === question.answer
              const showCorrect = answerShown && isCorrect
              const showWrong = answerShown && !isCorrect

              return (
                <motion.div
                  key={opt.letter}
                  animate={showCorrect ? {
                    borderColor: '#00ff88',
                    backgroundColor: 'rgba(0,255,136,0.1)',
                    boxShadow: '0 0 20px rgba(0,255,136,0.4)',
                  } : showWrong ? {
                    opacity: 0.3,
                  } : {}}
                  transition={{ duration: 0.4 }}
                  className="flex items-start gap-3 rounded-lg px-4 py-2.5"
                  style={{
                    border: '1px solid rgba(0,245,255,0.15)',
                    background: 'rgba(0,0,0,0.3)',
                  }}
                >
                  <span
                    className="font-display font-bold text-sm shrink-0 mt-0.5"
                    style={{ color: showCorrect ? '#00ff88' : 'rgba(0,245,255,0.6)' }}
                  >
                    {opt.letter}.
                  </span>
                  <span
                    className="font-body text-sm"
                    style={{ color: showCorrect ? '#00ff88' : 'rgba(255,255,255,0.75)' }}
                  >
                    {opt.text}
                  </span>
                  {showCorrect && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="font-mono text-xs text-green-400 ml-auto shrink-0 font-bold"
                    >
                      CORRECT
                    </motion.span>
                  )}
                </motion.div>
              )
            })}
          </div>

          {/* Reveal / Next buttons */}
          <div className="flex gap-3">
            <AnimatePresence mode="wait">
              {!answerShown ? (
                <motion.button
                  key="reveal"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => setAnswerShown(true)}
                  className="flex-1 py-3 rounded-lg font-display text-sm tracking-widest"
                  style={{
                    border: '1px solid rgba(255,215,0,0.5)',
                    color: '#ffd700',
                    background: 'rgba(255,215,0,0.07)',
                    boxShadow: '0 0 15px rgba(255,215,0,0.15)',
                  }}
                >
                  REVEAL ANSWER
                </motion.button>
              ) : (
                <motion.button
                  key="next"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={handleNextRound}
                  className="flex-1 py-3 rounded-lg font-display text-sm tracking-widest relative overflow-hidden"
                  style={{
                    border: '1px solid rgba(0,245,255,0.5)',
                    color: '#00f5ff',
                    background: 'rgba(0,245,255,0.08)',
                    boxShadow: '0 0 15px rgba(0,245,255,0.15)',
                  }}
                >
                  <motion.div
                    animate={{ x: ['-100%', '200%'] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                    className="absolute inset-0"
                    style={{ background: 'linear-gradient(90deg, transparent, rgba(0,245,255,0.1), transparent)', width: '30%' }}
                  />
                  <span className="relative z-10">
                    {isLastQuestion ? 'FINISH SESSION' : 'NEXT ROUND'}
                  </span>
                </motion.button>
              )}
            </AnimatePresence>

            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              whileTap={{ scale: 0.96 }}
              onClick={onReset}
              className="px-5 py-3 rounded-lg font-display text-xs tracking-widest"
              style={{
                border: '1px solid rgba(255,255,255,0.1)',
                color: 'rgba(255,255,255,0.35)',
                background: 'transparent',
              }}
            >
              RESET
            </motion.button>
          </div>
        </motion.div>
      )}

      <div className="relative z-10 font-mono text-[10px] tracking-[0.3em] text-white/15 pb-2">
        THE FATE MACHINE NEVER LIES
      </div>
    </div>
  )
}
