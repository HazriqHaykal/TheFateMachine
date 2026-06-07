import { AnimatePresence, motion } from 'framer-motion'

export default function CountdownTimer({ value }) {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-30 pointer-events-none">
      <AnimatePresence mode="wait">
        {value > 0 && (
          // Entry/exit animation on the whole group — centering is done by the flex parent,
          // NOT by transform:translate, so Framer Motion's scale has nothing to conflict with.
          <motion.div
            key={value}
            initial={{ opacity: 0, scale: 2.2, filter: 'blur(18px)' }}
            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, scale: 0.5, filter: 'blur(10px)' }}
            transition={{ duration: 0.32, ease: [0.23, 1, 0.32, 1] }}
            className="flex flex-col items-center gap-4"
          >
            {/* Shared center box — ring and number both anchor to this */}
            <div
              className="relative flex items-center justify-center"
              style={{ width: 'clamp(100px, 18vw, 180px)', height: 'clamp(100px, 18vw, 180px)' }}
            >
              {/* Pulse ring: inset-0 fills the box exactly, scales outward from its center */}
              <motion.div
                className="absolute inset-0 rounded-full"
                animate={{ scale: [1, 2.5], opacity: [0.85, 0] }}
                transition={{ duration: 0.85, ease: 'easeOut' }}
                style={{
                  border: '2px solid #00f5ff',
                  boxShadow: '0 0 25px rgba(0,245,255,0.7)',
                }}
              />

              {/* Number — same center as the ring */}
              <span
                className="relative z-10 font-display font-black text-neon-cyan select-none"
                style={{ fontSize: 'clamp(5.5rem, 18vw, 11rem)', lineHeight: 1 }}
              >
                {value}
              </span>
            </div>

            <div className="font-mono text-cyan-neon/60 tracking-[0.5em] text-xs">
              INITIATING
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
