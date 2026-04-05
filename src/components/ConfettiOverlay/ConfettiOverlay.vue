<script setup lang="ts">
import { onMounted, ref } from 'vue'

const emit = defineEmits<{ done: [] }>()

const canvasRef = ref<HTMLCanvasElement | null>(null)
const isVisible = ref(true)

const colors = ['#ff6b6b', '#ffd93d', '#6bcb77', '#4d96ff', '#ff922b', '#cc5de8', '#20c997', '#339af0']

interface Particle {
  x: number; y: number; vx: number; vy: number
  size: number; color: string; alpha: number
  rotation: number; rv: number; shape: number
}

function createParticles(w: number, h: number, count: number): Particle[] {
  const particles: Particle[] = []
  for (let i = 0; i < count; i++) {
    const angle = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 0.7
    const speed = 6 + Math.random() * 10
    particles.push({
      x: w / 2 + (Math.random() - 0.5) * w * 0.1,
      y: h * 0.95,
      vx: Math.cos(angle) * speed * (Math.random() > 0.5 ? 1 : -1),
      vy: Math.sin(angle) * speed - 3 - Math.random() * 3,
      size: 5 + Math.random() * 6,
      color: colors[Math.floor(Math.random() * colors.length)],
      alpha: 1,
      rotation: Math.random() * 360,
      rv: (Math.random() - 0.5) * 12,
      shape: Math.floor(Math.random() * 3)
    })
  }
  return particles
}

onMounted(() => {
  const canvas = canvasRef.value
  if (!canvas) return

  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const dpr = window.devicePixelRatio || 1
  const w = window.innerWidth
  const h = window.innerHeight
  canvas.width = w * dpr
  canvas.height = h * dpr
  ctx.scale(dpr, dpr)

  const particles = createParticles(w, h, 150)

  let frame = 0
  const maxFrames = 120

  function animate(): void {
    if (frame >= maxFrames) {
      isVisible.value = false
      emit('done')
      return
    }
    ctx!.clearRect(0, 0, w, h)

    const progress = frame / maxFrames

    for (const p of particles) {
      p.x += p.vx
      p.vx *= 0.99
      p.vy += 0.12
      p.y += p.vy
      p.alpha = Math.max(0, 1 - progress * progress)
      p.rotation += p.rv

      ctx!.save()
      ctx!.translate(p.x, p.y)
      ctx!.rotate((p.rotation * Math.PI) / 180)
      ctx!.globalAlpha = p.alpha
      ctx!.fillStyle = p.color

      if (p.shape === 0) {
        ctx!.fillRect(-p.size / 2, -p.size / 2, p.size, p.size)
      } else if (p.shape === 1) {
        ctx!.beginPath()
        ctx!.arc(0, 0, p.size / 2, 0, Math.PI * 2)
        ctx!.fill()
      } else {
        ctx!.fillRect(-p.size / 2, -p.size / 6, p.size, p.size / 3)
      }
      ctx!.restore()
    }

    frame++
    requestAnimationFrame(animate)
  }
  requestAnimationFrame(animate)
})
</script>

<template>
  <Teleport to="body">
    <canvas v-if="isVisible" ref="canvasRef" class="confetti-overlay" />
  </Teleport>
</template>

<style scoped>
.confetti-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  width: 100vw;
  height: 100vh;
  pointer-events: none;
}
</style>
