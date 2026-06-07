import { motion } from 'framer-motion'

const RANK_COLORS = ['#ffd700', '#c0c0c0', '#cd7f32']
const RANK_LABELS = ['01', '02', '03', '04', '05']

export default function Leaderboard({ leaderboard, onReset }) {
  if (leaderboard.length === 0) {
    return (
      <div className="panel-border-cyan rounded-lg p-4 bg-panel/60">
        <div className="flex items-center gap-2 mb-3">
          <div className="status-light" style={{ background: '#00f5ff', boxShadow: '0 0 6px #00f5ff' }} />
          <h3 className="font-display text-xs tracking-widest text-cyan-neon/80">SELECTION HISTORY</h3>
        </div>
        <p className="font-mono text-xs text-white/30 text-center py-4">
          — NO DATA RECORDED —
        </p>
      </div>
    )
  }

  return (
    <div className="panel-border-cyan rounded-lg p-4 bg-panel/60">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="status-light" style={{ background: '#ffd700', boxShadow: '0 0 6px #ffd700' }} />
          <h3 className="font-display text-xs tracking-widest text-gold-neon/90">LEADERBOARD</h3>
        </div>
        <button
          onClick={onReset}
          className="font-mono text-[10px] text-red-neon/60 hover:text-red-neon transition-colors tracking-wider border border-red-neon/20 hover:border-red-neon/50 px-2 py-0.5 rounded"
        >
          RESET
        </button>
      </div>

      <div className="space-y-2">
        {leaderboard.slice(0, 8).map((entry, i) => (
          <motion.div
            key={entry.name}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="flex items-center gap-3"
          >
            <span
              className="font-display text-xs w-5 text-right shrink-0"
              style={{ color: RANK_COLORS[i] || 'rgba(255,255,255,0.4)' }}
            >
              {RANK_LABELS[i] || `0${i + 1}`}
            </span>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-body font-semibold text-sm text-white/90 truncate">
                  {entry.name}
                </span>
                {i === 0 && entry.wins > 0 && (
                  <span className="text-[10px] text-gold-neon font-mono shrink-0">TOP</span>
                )}
              </div>
              {/* Win bar */}
              <div className="flex items-center gap-2 mt-0.5">
                <div className="flex-1 h-0.5 bg-white/5 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, (entry.wins / (leaderboard[0]?.wins || 1)) * 100)}%` }}
                    transition={{ delay: i * 0.05 + 0.2, duration: 0.6, ease: 'easeOut' }}
                    style={{
                      background: RANK_COLORS[i]
                        ? `linear-gradient(90deg, ${RANK_COLORS[i]}, ${RANK_COLORS[i]}88)`
                        : 'linear-gradient(90deg, rgba(0,245,255,0.6), rgba(0,245,255,0.3))',
                    }}
                  />
                </div>
                <span className="font-mono text-[10px] text-white/50 shrink-0">
                  {entry.wins}×
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
