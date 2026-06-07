import { motion } from 'framer-motion'

// Generate a consistent color from a name string
function nameToColor(name) {
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  const colors = [
    '#00f5ff', '#9b5de5', '#f15bb5', '#00ff88', '#ff6b35',
    '#4cc9f0', '#f72585', '#7209b7', '#3a86ff', '#fb5607',
  ]
  return colors[Math.abs(hash) % colors.length]
}

// Get initials from name
function getInitials(name) {
  return name
    .split(' ')
    .map(w => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

// Card state variants:
// 'idle'        — waiting, subtle pulse
// 'flashing'    — highlighted during cycling (cyan glow)
// 'eliminating' — being eliminated (red flash + shake)
// 'survivor'    — survived to final 2 (gold pulse)
// 'winner'      — the chosen one

export default function ParticipantCard({ participant, status, noMercyMode, index }) {
  const color = nameToColor(participant.name)
  const initials = getInitials(participant.name)

  const isEliminating = status === 'eliminating'
  const isFlashing = status === 'flashing'
  const isSurvivor = status === 'survivor'
  const isWinner = status === 'winner'

  // Card container animation
  const cardVariants = {
    hidden: { scale: 0, opacity: 0, rotate: -10 },
    visible: {
      scale: 1,
      opacity: 1,
      rotate: 0,
      transition: { type: 'spring', stiffness: 300, damping: 25, delay: index * 0.04 },
    },
  }

  // Dynamic inline styles based on status
  const getCardStyle = () => {
    if (isEliminating) return {
      borderColor: '#ff003c',
      boxShadow: '0 0 30px rgba(255,0,60,0.8), 0 0 60px rgba(255,0,60,0.4), inset 0 0 20px rgba(255,0,60,0.1)',
      background: 'rgba(255,0,60,0.15)',
    }
    if (isFlashing) return {
      borderColor: '#00f5ff',
      boxShadow: `0 0 25px rgba(0,245,255,0.9), 0 0 60px rgba(0,245,255,0.4)`,
      background: 'rgba(0,245,255,0.08)',
    }
    if (isSurvivor) return {
      borderColor: '#ffd700',
      boxShadow: '0 0 20px rgba(255,215,0,0.6), 0 0 50px rgba(255,215,0,0.3)',
      background: 'rgba(255,215,0,0.05)',
    }
    if (isWinner) return {
      borderColor: '#ffd700',
      boxShadow: '0 0 40px rgba(255,215,0,1), 0 0 100px rgba(255,215,0,0.5)',
      background: 'rgba(255,215,0,0.1)',
    }
    return {
      borderColor: 'rgba(0,245,255,0.15)',
      boxShadow: '0 0 8px rgba(0,245,255,0.05)',
      background: 'rgba(13,13,26,0.95)',
    }
  }

  const elimShake = isEliminating && noMercyMode
    ? { x: [-6, 6, -8, 8, -10, 10, 0] }
    : isEliminating
      ? { x: [-4, 4, -6, 6, -4, 4, 0] }
      : {}

  return (
    <motion.div
      layout
      variants={cardVariants}
      initial="hidden"
      animate={isEliminating ? {
        ...elimShake,
        scale: [1, 1.15, 1.2, 0],
        opacity: [1, 1, 0.8, 0],
        rotate: [0, -3, 3, 0, 15],
        transition: {
          duration: noMercyMode ? 0.55 : 0.75,
          ease: 'easeInOut',
        },
      } : isWinner ? {
        scale: [1, 1.05, 1.02],
        transition: { duration: 0.5, ease: 'easeOut' },
      } : 'visible'}
      exit={{
        scale: 0,
        opacity: 0,
        transition: { duration: 0.3 },
      }}
      className="relative rounded-xl overflow-hidden cursor-default select-none"
      style={{
        border: '1px solid',
        transition: 'border-color 0.15s, box-shadow 0.15s, background 0.15s',
        ...getCardStyle(),
      }}
    >
      {/* Top corner accent lines */}
      <div className="absolute top-0 left-0 w-3 h-px" style={{ background: color, opacity: 0.8 }} />
      <div className="absolute top-0 left-0 w-px h-3" style={{ background: color, opacity: 0.8 }} />
      <div className="absolute top-0 right-0 w-3 h-px" style={{ background: color, opacity: 0.8 }} />
      <div className="absolute top-0 right-0 w-px h-3" style={{ background: color, opacity: 0.8 }} />

      {/* Eliminating flash overlay */}
      {isEliminating && (
        <motion.div
          className="absolute inset-0 z-10"
          animate={{ opacity: [0, 1, 0, 1, 0] }}
          transition={{ duration: 0.5, times: [0, 0.2, 0.4, 0.6, 1] }}
          style={{ background: 'rgba(255,0,60,0.4)' }}
        />
      )}

      {/* Flashing highlight overlay */}
      {isFlashing && (
        <motion.div
          className="absolute inset-0 z-10"
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 0.25, repeat: Infinity }}
          style={{ background: 'rgba(0,245,255,0.12)' }}
        />
      )}

      {/* Winner glow ring */}
      {isWinner && (
        <motion.div
          className="absolute inset-0 rounded-xl z-10"
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1, repeat: Infinity }}
          style={{
            border: '2px solid #ffd700',
            boxShadow: 'inset 0 0 20px rgba(255,215,0,0.3)',
          }}
        />
      )}

      <div className="relative z-20 p-3 flex flex-col items-center gap-2">
        {/* Avatar circle */}
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center font-display font-bold text-sm relative"
          style={{
            background: `linear-gradient(135deg, ${color}22, ${color}44)`,
            border: `2px solid ${color}66`,
            color: color,
            boxShadow: isFlashing || isSurvivor || isWinner
              ? `0 0 15px ${color}66`
              : 'none',
          }}
        >
          {initials}
          {/* Survivor / winner badge */}
          {isSurvivor && (
            <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-gold-neon" style={{ boxShadow: '0 0 6px #ffd700' }} />
          )}
        </div>

        {/* Name */}
        <div className="text-center w-full">
          <p
            className="font-body font-semibold text-sm leading-tight truncate px-1"
            style={{
              color: isEliminating ? '#ff003c'
                : isFlashing ? '#00f5ff'
                : isSurvivor || isWinner ? '#ffd700'
                : 'rgba(255,255,255,0.9)',
            }}
          >
            {participant.name}
          </p>
        </div>

        {/* Status label */}
        {isEliminating && (
          <motion.div
            animate={{ opacity: [1, 0, 1] }}
            transition={{ duration: 0.2, repeat: 3 }}
            className="font-mono text-[9px] tracking-widest text-red-neon font-bold"
          >
            ELIMINATED
          </motion.div>
        )}
        {isSurvivor && (
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 0.8, repeat: Infinity }}
            className="font-mono text-[9px] tracking-widest text-gold-neon"
          >
            FINALIST
          </motion.div>
        )}
        {isWinner && (
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 0.6, repeat: Infinity }}
            className="font-mono text-[10px] tracking-widest font-bold"
            style={{ color: '#ffd700', textShadow: '0 0 10px #ffd700' }}
          >
            CHOSEN
          </motion.div>
        )}
      </div>

      {/* Bottom scan line decoration */}
      <div className="absolute bottom-0 left-0 right-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${color}66, transparent)` }} />
    </motion.div>
  )
}
