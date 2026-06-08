import { useState, useCallback } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import HomeScreen from './components/HomeScreen'
import SelectionScreen from './components/SelectionScreen'
import ResultScreen from './components/ResultScreen'
import { soundEngine } from './utils/soundEngine'

// ─── Hard-coded participant list ───────────────────────────────────────────────
const ALL_NAMES = [
  'Jia Qi', 'Su Bohao', 'TianYi', 'Zhafir', 'Luqman',
  'Arif', 'Zuzu', 'Anna', 'Nisa', 'Yee Han',
  'Aina', 'Iman', 'Erisya', 'Yasmin', 'Ammar',
  'Fatimah', 'Naim', 'Fathul', 'Irsyad', 'Sabrina',
  'Ain', 'Samantha',
]

// ─── Hard-coded questions ──────────────────────────────────────────────────────
export const QUESTIONS = [
  {
    id: 1,
    round: 'Question 1',
    title: 'STAR Method',
    question: 'Which component of the STAR Method explains the actions you personally took to handle a situation?',
    options: [
      { letter: 'A', text: 'Situation' },
      { letter: 'B', text: 'Task' },
      { letter: 'C', text: 'Action' },
      { letter: 'D', text: 'Result' },
    ],
    answer: 'C',
  },
  {
    id: 2,
    round: 'Question 2',
    title: 'Subject-Verb Agreement',
    question: 'Which sentence is grammatically correct?',
    options: [
      { letter: 'A', text: 'My experience help me solve problems.' },
      { letter: 'B', text: 'My experience helps me solve problems.' },
      { letter: 'C', text: 'My experience helping me solve problems.' },
      { letter: 'D', text: 'My experience have helped me solve problems.' },
    ],
    answer: 'B',
  },
  {
    id: 3,
    round: 'Question 3',
    title: 'Combined Challenge (STAR + Grammar)',
    question:
      'A candidate answers: "Last semester, my team was assigned a project with a tight deadline. I manage the testing process and solved several technical issues. As a result, the project was completed successfully." — Which statement is TRUE?',
    options: [
      { letter: 'A', text: 'The answer has correct grammar and includes all STAR components.' },
      { letter: 'B', text: 'The answer contains a verb tense error and is missing the Task component.' },
      { letter: 'C', text: 'The answer contains a subject-verb agreement error and is missing the Result component.' },
      { letter: 'D', text: 'The answer contains no errors but is missing the Situation component.' },
    ],
    answer: 'B',
  },
]

function makeParticipants(names) {
  return names.map((name, i) => ({ id: `p-${i}`, name }))
}

const PAGE_TRANSITION = {
  initial: { opacity: 0, scale: 0.97 },
  animate: { opacity: 1, scale: 1, transition: { duration: 0.4, ease: 'easeOut' } },
  exit: { opacity: 0, scale: 1.03, transition: { duration: 0.3, ease: 'easeIn' } },
}

export default function App() {
  const [screen, setScreen] = useState('home')
  const [participants, setParticipants] = useState(makeParticipants(ALL_NAMES))
  const [questionIndex, setQuestionIndex] = useState(0)
  const [winner, setWinner] = useState(null)
  const [noMercyMode, setNoMercyMode] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [allDone, setAllDone] = useState(false)

  const handleRemoveParticipant = useCallback((id) => {
    setParticipants(prev => prev.filter(p => p.id !== id))
  }, [])

  const currentQuestion = QUESTIONS[questionIndex]

  const handleWinner = useCallback((winnerName) => {
    setWinner(winnerName)
    // Remove the selected person from the pool
    setParticipants(prev => {
      const idx = prev.findIndex(p => p.name === winnerName)
      if (idx === -1) return prev
      return [...prev.slice(0, idx), ...prev.slice(idx + 1)]
    })
    setScreen('result')
  }, [])

  const handleNextRound = useCallback(() => {
    setWinner(null)
    const next = questionIndex + 1
    if (next >= QUESTIONS.length) {
      setAllDone(true)
      setScreen('home')
    } else {
      setQuestionIndex(next)
      setScreen('home')
    }
  }, [questionIndex])

  const handleReset = useCallback(() => {
    setParticipants(makeParticipants(ALL_NAMES))
    setQuestionIndex(0)
    setWinner(null)
    setAllDone(false)
    setScreen('home')
  }, [])

  return (
    <div className="min-h-screen bg-void overflow-hidden relative font-body">
      <div className="grid-bg fixed inset-0 pointer-events-none z-0" />
      <div className="scanlines fixed inset-0 pointer-events-none z-50" />

      <AnimatePresence mode="wait">
        {screen === 'home' && (
          <motion.div key={`home-${questionIndex}`} {...PAGE_TRANSITION} className="relative z-10">
            <HomeScreen
              participants={participants}
              question={currentQuestion}
              questionIndex={questionIndex}
              totalQuestions={QUESTIONS.length}
              onRemoveParticipant={handleRemoveParticipant}
              onStart={() => {
                soundEngine.init()
                soundEngine.resume()
                soundEngine.setNoMercy(noMercyMode)
                soundEngine.setMuted(isMuted)
                setScreen('selection')
              }}
              noMercyMode={noMercyMode}
              setNoMercyMode={setNoMercyMode}
              isMuted={isMuted}
              setIsMuted={(val) => {
                setIsMuted(val)
                soundEngine.setMuted(val)
              }}
              allDone={allDone}
              onReset={handleReset}
            />
          </motion.div>
        )}

        {screen === 'selection' && (
          <motion.div key="selection" {...PAGE_TRANSITION} className="relative z-10">
            <SelectionScreen
              participants={participants}
              noMercyMode={noMercyMode}
              isMuted={isMuted}
              onWinner={handleWinner}
              onCancel={() => setScreen('home')}
            />
          </motion.div>
        )}

        {screen === 'result' && (
          <motion.div key={`result-${questionIndex}`} {...PAGE_TRANSITION} className="relative z-10">
            <ResultScreen
              winner={winner}
              question={currentQuestion}
              questionIndex={questionIndex}
              totalQuestions={QUESTIONS.length}
              onNextRound={handleNextRound}
              onReset={handleReset}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
