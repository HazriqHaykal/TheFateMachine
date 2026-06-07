import { useEffect, useRef } from 'react'

const COLORS = ['#ffd700', '#00f5ff', '#ff003c', '#9b5de5', '#f15bb5', '#ffffff', '#00ff88']
const SHAPES = ['rect', 'circle', 'star', 'diamond']

function drawStar(ctx, r) {
  const inner = r * 0.4
  ctx.beginPath()
  for (let i = 0; i < 10; i++) {
    const angle = (i * Math.PI) / 5 - Math.PI / 2
    const radius = i % 2 === 0 ? r : inner
    if (i === 0) ctx.moveTo(Math.cos(angle) * radius, Math.sin(angle) * radius)
    else ctx.lineTo(Math.cos(angle) * radius, Math.sin(angle) * radius)
  }
  ctx.closePath()
  ctx.fill()
}

function createParticle(canvasWidth) {
  return {
    x: Math.random() * canvasWidth,
    y: -Math.random() * 200 - 20,
    vx: (Math.random() - 0.5) * 4,
    vy: Math.random() * 3 + 1.5,
    rotation: Math.random() * Math.PI * 2,
    rotationSpeed: (Math.random() - 0.5) * 0.15,
    size: Math.random() * 10 + 5,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    shape: SHAPES[Math.floor(Math.random() * SHAPES.length)],
    opacity: 1,
    gravity: 0.04 + Math.random() * 0.03,
    wobble: Math.random() * Math.PI * 2,
    wobbleSpeed: 0.05 + Math.random() * 0.05,
  }
}

export default function Confetti({ isActive }) {
  const canvasRef = useRef(null)
  const animRef = useRef(null)
  const particlesRef = useRef([])

  useEffect(() => {
    if (!isActive) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    // Spawn 200 particles in waves
    particlesRef.current = Array.from({ length: 200 }, () =>
      createParticle(canvas.width)
    )

    let frameCount = 0

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      frameCount++

      // Spawn new particles periodically to keep it going
      if (frameCount % 8 === 0 && particlesRef.current.length < 300) {
        particlesRef.current.push(createParticle(canvas.width))
      }

      particlesRef.current = particlesRef.current.filter(p => p.opacity > 0.05)

      particlesRef.current.forEach(p => {
        p.wobble += p.wobbleSpeed
        p.x += p.vx + Math.sin(p.wobble) * 0.5
        p.y += p.vy
        p.vy += p.gravity
        p.rotation += p.rotationSpeed

        // Fade out near bottom
        if (p.y > canvas.height * 0.75) {
          p.opacity -= 0.02
        }

        // Recycle if off-screen
        if (p.y > canvas.height + 30) {
          p.y = -20
          p.x = Math.random() * canvas.width
          p.vy = Math.random() * 2 + 1
          p.opacity = 1
        }

        ctx.save()
        ctx.translate(p.x, p.y)
        ctx.rotate(p.rotation)
        ctx.globalAlpha = Math.max(0, p.opacity)
        ctx.fillStyle = p.color

        // Add glow for gold and cyan
        if (p.color === '#ffd700' || p.color === '#00f5ff') {
          ctx.shadowBlur = 8
          ctx.shadowColor = p.color
        } else {
          ctx.shadowBlur = 0
        }

        const s = p.size
        if (p.shape === 'rect') {
          ctx.fillRect(-s / 2, -s / 4, s, s / 2)
        } else if (p.shape === 'circle') {
          ctx.beginPath()
          ctx.arc(0, 0, s / 2, 0, Math.PI * 2)
          ctx.fill()
        } else if (p.shape === 'star') {
          drawStar(ctx, s / 2)
        } else {
          // diamond
          ctx.beginPath()
          ctx.moveTo(0, -s / 2)
          ctx.lineTo(s / 3, 0)
          ctx.lineTo(0, s / 2)
          ctx.lineTo(-s / 3, 0)
          ctx.closePath()
          ctx.fill()
        }

        ctx.restore()
      })

      animRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      cancelAnimationFrame(animRef.current)
      window.removeEventListener('resize', resize)
    }
  }, [isActive])

  if (!isActive) return null

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-40"
    />
  )
}
