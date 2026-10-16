"use client"

import * as React from "react"

/**
 * Breath Bloom — six luminous petals orbiting a shared centre, breathing in,
 * holding, and breathing out on a slow eased loop.
 *
 * Each petal is a circle filled with a radial gradient that runs dark → deep →
 * bright from its top edge, turned so the dark side faces outward. Stacked with
 * `mix-blend-mode: lighten`, the overlaps keep only the brightest of each pair,
 * so the bloom reads as one glowing flower rather than six discs.
 *
 * Every frame the petals are placed from two numbers — how far from the centre
 * (amplitude) and how big (scale) — both in multiples of the petal size. Left
 * alone, a keyframe timeline drives them; under the pointer, x sets amplitude
 * and y sets scale. The two are blended with exponential damping, so handing
 * control back and forth never jumps. Click (or Enter) pins the shape you made.
 *
 * Self-contained: React is the only import. No CSS file, no registered custom properties, no
 * assets — just absolutely-positioned divs whose transforms are written from a
 * single rAF loop that pauses off-screen.
 */

export type BloomKey = {
  /** Position on the timeline, 0..1. */
  at: number
  /** Distance of each petal from the centre, in petal sizes. */
  amplitude: number
  /** Petal scale, 1 = `size`. */
  scale: number
}

export type BloomPose = { amplitude: number; scale: number }

type Ease = (x: number) => number
type Range = [number, number]

export type BloomParams = {
  // the flower
  /** How many petals. */
  petals: number
  /** Petal diameter in px, or "auto" to size from the box (≈13% of its short side). */
  size: number | "auto"
  /** Rotation of the whole ring, degrees. */
  offset: number
  /** Extra turn on each petal, degrees — where the gradient's dark edge points. */
  tilt: number
  /** Slow orbit of the ring, degrees per second. 0 holds still. */
  spin: number
  // the breath
  /** Seconds for one pass through the keyframes. The loop runs it there and back. */
  duration: number
  /** cubic-bezier control points, applied per keyframe segment like CSS does. */
  easing: [number, number, number, number]
  keyframes: BloomKey[]
  // the pointer
  /** Amplitude at the left / right edge of the box. */
  pointerAmplitude: Range
  /** Scale at the top / bottom edge of the box. */
  pointerScale: Range
  /** How quickly the bloom chases its target, per second. */
  follow: number
  // the paint
  /** Gradient stops from the petal's top edge inward. */
  stops: [string, string, string]
  /** Where the gradient starts inside each petal. */
  focus: string
  blend: React.CSSProperties["mixBlendMode"]
  background: string
  /** Soft halo behind the bloom, 0..1. */
  glow: number
  glowColor: string
  /** Text colour for the guide and hint. */
  ink: string
}

export const BLOOM_DEFAULTS: BloomParams = {
  petals: 6,
  size: "auto",
  offset: 30,
  tilt: 17,
  spin: 0,

  duration: 4.01,
  easing: [0.8, 0, 0.2, 1],
  keyframes: [
    { at: 0, amplitude: 1.5, scale: 1 },
    { at: 0.5, amplitude: 1, scale: 3 },
    { at: 1, amplitude: 1.5, scale: 3 },
  ],

  pointerAmplitude: [0, 5],
  pointerScale: [0.15, 8],
  follow: 7,

  stops: ["oklch(0.1186 0.0248 260.66)", "oklch(0.3133 0.1419 260.73)", "oklch(0.6061 0.2122 260.66)"],
  focus: "50% 0%",
  blend: "lighten",
  background: "#0d0f1e",
  glow: 0.35,
  glowColor: "oklch(0.6061 0.2122 260.66 / 0.35)",
  ink: "rgba(226, 232, 255, 0.86)",
}

/** Overlays on the defaults. Named for the mood, not the numbers. */
export const BLOOM_PRESETS = {
  abyss: {},
  ember: {
    stops: ["oklch(0.14 0.035 30)", "oklch(0.43 0.17 32)", "oklch(0.74 0.19 52)"],
    background: "#150a07",
    glowColor: "oklch(0.7 0.19 45 / 0.35)",
    ink: "rgba(255, 228, 206, 0.88)",
  },
  aurora: {
    stops: ["oklch(0.13 0.03 190)", "oklch(0.4 0.11 175)", "oklch(0.84 0.17 158)"],
    background: "#05110f",
    glowColor: "oklch(0.8 0.16 160 / 0.3)",
    ink: "rgba(214, 255, 238, 0.86)",
    spin: 4,
  },
  orchid: {
    stops: ["oklch(0.13 0.035 320)", "oklch(0.4 0.17 325)", "oklch(0.74 0.2 340)"],
    background: "#12071a",
    glowColor: "oklch(0.7 0.2 335 / 0.32)",
    ink: "rgba(255, 222, 246, 0.88)",
    petals: 8,
    offset: 0,
  },
  solstice: {
    // Light paper: multiply darkens where petals overlap, so the bright stop
    // goes first and the deepest colour sits in the middle of each petal.
    stops: ["oklch(0.99 0.01 85)", "oklch(0.86 0.09 70)", "oklch(0.64 0.17 42)"],
    blend: "multiply",
    background: "#f5efe4",
    glowColor: "oklch(0.85 0.1 70 / 0.45)",
    ink: "rgba(74, 40, 20, 0.82)",
  },
  graphite: {
    stops: ["oklch(0.12 0 0)", "oklch(0.36 0 0)", "oklch(0.86 0 0)"],
    background: "#0a0a0a",
    glowColor: "oklch(0.9 0 0 / 0.16)",
    ink: "rgba(240, 240, 240, 0.82)",
    petals: 5,
    offset: 90,
  },
} satisfies Record<string, Partial<BloomParams>>

export type BloomPreset = keyof typeof BLOOM_PRESETS

const STAGE_HIDDEN = -1
const STAGE_PINNED = 3

// #region bloom
/** CSS cubic-bezier(x1, y1, x2, y2) as a function of progress. */
export function cubicBezier(x1: number, y1: number, x2: number, y2: number): Ease {
  const cl = (v: number) => Math.min(1, Math.max(0, v))
  const ax1 = cl(x1)
  const ax2 = cl(x2)
  const curve = (a: number, b: number, t: number) => {
    const u = 1 - t
    return 3 * u * u * t * a + 3 * u * t * t * b + t * t * t
  }
  return (x: number) => {
    if (x <= 0) return 0
    if (x >= 1) return 1
    // x(t) is monotonic once the control x's are clamped to 0..1, so bisection
    // always lands; 32 halvings is far past a pixel.
    let lo = 0
    let hi = 1
    let t = x
    for (let i = 0; i < 32; i++) {
      if (curve(ax1, ax2, t) < x) lo = t
      else hi = t
      t = (lo + hi) / 2
    }
    return curve(y1, y2, t)
  }
}

/** Pose at linear position x (0..1) along the keyframes, eased per segment. */
export function sampleKeys(keys: BloomKey[], x: number, ease: Ease) {
  if (!keys.length) return { amplitude: 0, scale: 1 }
  const first = keys[0]
  const last = keys[keys.length - 1]
  if (x <= first.at) return { amplitude: first.amplitude, scale: first.scale }
  if (x >= last.at) return { amplitude: last.amplitude, scale: last.scale }
  let i = 0
  while (i < keys.length - 2 && x > keys[i + 1].at) i++
  const a = keys[i]
  const b = keys[i + 1]
  const span = b.at - a.at
  const e = span > 0 ? ease((x - a.at) / span) : 1
  return {
    amplitude: a.amplitude + (b.amplitude - a.amplitude) * e,
    scale: a.scale + (b.scale - a.scale) * e,
  }
}

/**
 * Where the breath is at time t: the timeline runs forward then back
 * (`alternate`), so one full breath is two durations. Stage 0 is breathing in
 * (forward, first half of the keys), 1 is the hold at the far end, 2 is
 * breathing out (backward, first half).
 */
export function breathAt(t: number, duration: number) {
  const d = duration > 0 ? duration : 1
  const u = (((t / d) % 2) + 2) % 2
  const forward = u < 1
  const x = forward ? u : 2 - u
  const stage = x >= 0.5 ? 1 : forward ? 0 : 2
  return { x: x, stage: stage }
}

/** Pointer position (0..1 in the box) to a pose. */
export function pointerPose(px: number, py: number, amp: Range, scale: Range) {
  const cx = Math.min(1, Math.max(0, px))
  const cy = Math.min(1, Math.max(0, py))
  return {
    amplitude: amp[0] + (amp[1] - amp[0]) * cx,
    scale: scale[0] + (scale[1] - scale[0]) * cy,
  }
}

/** Frame-rate independent ease toward a target. */
export function damp(current: number, target: number, rate: number, dt: number) {
  if (!(rate > 0)) return target
  return target + (current - target) * Math.exp(-rate * dt)
}

/** Petal i of n on a ring: pushed out along its angle, scaled, then turned. */
export function petalTransform(i: number, n: number, ring: number, tilt: number, pose: BloomPose, size: number) {
  const deg = (360 / Math.max(1, n)) * i + ring
  const rad = (deg * Math.PI) / 180
  const r = pose.amplitude * size
  const x = Math.cos(rad) * r
  const y = -Math.sin(rad) * r
  const s = Math.max(0, pose.scale)
  return (
    "translate(" + x.toFixed(2) + "px, " + y.toFixed(2) + "px) scale(" + s.toFixed(4) + ") rotate(" +
    (tilt - deg).toFixed(2) + "deg)"
  )
}

/** "auto" sizes the petal from the box's short side, within sane bounds. */
export function petalSize(size: number | "auto", width: number, height: number) {
  if (typeof size === "number") return Math.max(1, size)
  const short = Math.min(width, height)
  if (!(short > 0)) return 100
  return Math.min(140, Math.max(36, short * 0.13))
}
// #endregion

export type BreathBloomProps = {
  /** Root height. **Must be a definite length** — the bloom centres in this box. */
  height?: string
  /** A named look. `params` is layered on top. */
  preset?: BloomPreset
  /** Any parameter, live. Changing these never restarts the loop. */
  params?: Partial<BloomParams>
  /** Pointer shaping, click-to-pin and keyboard control. */
  interactive?: boolean
  /** `scroll` keeps touch scrolling the page (a tap pins); `draw` lets a drag shape the bloom. */
  touch?: "scroll" | "draw"
  /** Breathing cue in the centre. `true` for the defaults, or your own three words. */
  guide?: boolean | [string, string, string]
  /** The small instruction line at the bottom. */
  hint?: boolean | string
  /** Called when a shape is pinned (with it) or released (with null). */
  onPinChange?: (pose: BloomPose | null) => void
  /** Accessible name for the bloom. */
  label?: string
  children?: React.ReactNode
  className?: string
}

const DEFAULT_GUIDE: [string, string, string] = ["Breathe in", "Hold", "Breathe out"]
const CONTROLS = "a,button,input,select,textarea,label,summary,[role=button]"

export default function BreathBloom({
  height = "100svh",
  preset = "abyss",
  params,
  interactive = true,
  touch = "scroll",
  guide = true,
  hint = true,
  onPinChange,
  label = "Breathing bloom",
  children,
  className = "",
}: BreathBloomProps) {
  const p = React.useMemo<BloomParams>(
    () => ({ ...BLOOM_DEFAULTS, ...BLOOM_PRESETS[preset], ...params }),
    [preset, params],
  )
  const count = Math.max(1, Math.min(24, Math.round(p.petals)))

  const rootRef = React.useRef<HTMLElement>(null)
  const stageRef = React.useRef<HTMLDivElement>(null)
  const glowRef = React.useRef<HTMLDivElement>(null)
  const petalRefs = React.useRef<(HTMLDivElement | null)[]>([])

  // Everything the loop reads lives in refs, so new props never restart it.
  const live = React.useRef({ p, interactive, onPinChange })
  live.current = { p, interactive, onPinChange }
  const pointer = React.useRef({ px: 0.5, py: 0.5, active: false })
  const pinned = React.useRef<BloomPose | null>(null)
  const pose = React.useRef<BloomPose>({ ...p.keyframes[0] })

  const [stage, setStage] = React.useState(0)
  const [isPinned, setIsPinned] = React.useState(false)
  const stageNow = React.useRef(0)

  const setPin = React.useCallback((next: BloomPose | null) => {
    pinned.current = next
    setIsPinned(next !== null)
    live.current.onPinChange?.(next)
  }, [])

  React.useEffect(() => {
    const root = rootRef.current
    const stageEl = stageRef.current
    if (!root || !stageEl) return

    let size = 100
    let raf = 0
    let last = 0
    let clock = 0
    let ring = 0
    let onScreen = true
    let reduced = false
    let ease = cubicBezier(...live.current.p.easing)
    let easeKey = live.current.p.easing.join()

    const measure = () => {
      size = petalSize(live.current.p.size, root.clientWidth, root.clientHeight)
      stageEl.style.setProperty("--bloom-size", size + "px")
    }
    measure()
    const observer = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(measure) : null
    if (observer) observer.observe(root)

    const frame = (now: number) => {
      raf = 0
      const dt = last ? Math.min(0.1, (now - last) / 1000) : 0
      last = now
      const q = live.current.p
      const k = q.easing.join()
      if (k !== easeKey) {
        easeKey = k
        ease = cubicBezier(...q.easing)
      }
      if (typeof q.size === "number") measure()

      if (!reduced) {
        clock += dt
        ring += q.spin * dt
      }
      const breath = reduced ? { x: 0.5, stage: STAGE_HIDDEN } : breathAt(clock, q.duration)
      const ptr = pointer.current
      const steering = live.current.interactive && ptr.active
      const target =
        pinned.current ??
        (steering
          ? pointerPose(ptr.px, ptr.py, q.pointerAmplitude, q.pointerScale)
          : sampleKeys(q.keyframes, breath.x, ease))

      const cur = pose.current
      cur.amplitude = damp(cur.amplitude, target.amplitude, q.follow, dt)
      cur.scale = damp(cur.scale, target.scale, q.follow, dt)

      const n = petalRefs.current.length
      for (let i = 0; i < n; i++) {
        const el = petalRefs.current[i]
        if (el) el.style.transform = petalTransform(i, n, q.offset + ring, q.tilt, cur, size)
      }
      const glow = glowRef.current
      if (glow) {
        const reach = cur.amplitude + cur.scale * 0.5 + 0.5
        glow.style.transform = "translate(-50%, -50%) scale(" + (reach / 3).toFixed(4) + ")"
        glow.style.opacity = String(q.glow * Math.min(1, 0.35 + cur.scale / 4))
      }

      const nextStage = pinned.current ? STAGE_PINNED : steering ? STAGE_HIDDEN : breath.stage
      if (nextStage !== stageNow.current) {
        stageNow.current = nextStage
        setStage(nextStage)
      }

      if (onScreen && !document.hidden) raf = requestAnimationFrame(frame)
    }

    const wake = () => {
      if (!raf && onScreen && typeof document !== "undefined" && !document.hidden) {
        last = 0
        raf = requestAnimationFrame(frame)
      }
    }

    const io = typeof IntersectionObserver !== 'undefined' ? new IntersectionObserver((entries) => {
      onScreen = entries[entries.length - 1].isIntersecting
      wake()
    }) : null
    if (io) io.observe(root)

    const mq = typeof window !== "undefined" && window.matchMedia ? window.matchMedia("(prefers-reduced-motion: reduce)") : null
    const onMotion = () => {
      reduced = mq ? mq.matches : false
      wake()
    }
    onMotion()
    if (mq?.addEventListener) mq.addEventListener("change", onMotion)
    if (typeof document !== "undefined") document.addEventListener("visibilitychange", wake)
    wake()

    return () => {
      cancelAnimationFrame(raf)
      if (observer) observer.disconnect()
      if (io) io.disconnect()
      if (mq?.removeEventListener) mq.removeEventListener("change", onMotion)
      if (typeof document !== "undefined") document.removeEventListener("visibilitychange", wake)
    }
  }, [])

  const locate = (e: React.PointerEvent) => {
    const r = rootRef.current?.getBoundingClientRect()
    if (!r || !r.width || !r.height) return null
    return { px: (e.clientX - r.left) / r.width, py: (e.clientY - r.top) / r.height }
  }

  const onPointerMove = (e: React.PointerEvent) => {
    if (!interactive) return
    if (e.pointerType === "touch" && touch === "scroll") return
    const at = locate(e)
    if (!at) return
    pointer.current = { ...at, active: true }
  }

  const onPointerDown = (e: React.PointerEvent) => {
    if (!interactive || e.button > 0) return
    if ((e.target as Element).closest?.(CONTROLS)) return
    const at = locate(e)
    if (!at) return
    if (pinned.current) {
      setPin(null)
    } else {
      const q = live.current.p
      setPin(pointerPose(at.px, at.py, q.pointerAmplitude, q.pointerScale))
    }
    if (e.pointerType !== "touch" || touch === "draw") pointer.current = { ...at, active: true }
  }

  const release = (e: React.PointerEvent) => {
    if (e.type === "pointerup" && e.pointerType !== "touch") return
    pointer.current = { ...pointer.current, active: false }
  }

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (!interactive || e.target !== e.currentTarget) return
    const q = p
    const from = pinned.current ?? { ...pose.current }
    const da = (q.pointerAmplitude[1] - q.pointerAmplitude[0]) / 20
    const ds = (q.pointerScale[1] - q.pointerScale[0]) / 20
    const clampTo = (v: number, r: Range) => Math.min(Math.max(r[0], r[1]), Math.max(Math.min(r[0], r[1]), v))
    let next: BloomPose | null = null
    if (e.key === "ArrowRight") next = { ...from, amplitude: clampTo(from.amplitude + da, q.pointerAmplitude) }
    else if (e.key === "ArrowLeft") next = { ...from, amplitude: clampTo(from.amplitude - da, q.pointerAmplitude) }
    else if (e.key === "ArrowUp") next = { ...from, scale: clampTo(from.scale + ds, q.pointerScale) }
    else if (e.key === "ArrowDown") next = { ...from, scale: clampTo(from.scale - ds, q.pointerScale) }
    else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault()
      setPin(pinned.current ? null : { ...pose.current })
      return
    } else if (e.key === "Escape") {
      if (pinned.current) setPin(null)
      return
    }
    if (next) {
      e.preventDefault()
      setPin(next)
    }
  }

  const words = Array.isArray(guide) ? guide : DEFAULT_GUIDE
  const hintText =
    typeof hint === "string" ? (
      hint
    ) : (
      <>
        {touch === "draw" ? "drag to shape · tap to pin" : "move to shape · click to pin"}
        <span className="hidden sm:inline"> · arrows to tune</span>
      </>
    )
  const gradient = "radial-gradient(circle at " + p.focus + ", " + p.stops.join(", ") + ")"
  const initial = sampleKeys(p.keyframes, 0, (x) => x)

  return (
    <section
      ref={rootRef}
      aria-label={label}
      aria-roledescription="interactive animation"
      tabIndex={interactive ? 0 : undefined}
      onPointerMove={onPointerMove}
      onPointerDown={onPointerDown}
      onPointerUp={release}
      onPointerLeave={release}
      onPointerCancel={release}
      onKeyDown={onKeyDown}
      className={
        "relative isolate w-full overflow-hidden outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--bloom-ink)] " +
        (interactive ? "cursor-crosshair " : "") +
        className
      }
      style={
        {
          height,
          background: p.background,
          touchAction: interactive && touch === "draw" ? "none" : "auto",
          "--bloom-ink": p.ink,
        } as React.CSSProperties
      }
    >
      <div ref={stageRef} aria-hidden className="pointer-events-none absolute inset-0">
        <div
          ref={glowRef}
          className="absolute left-1/2 top-1/2 rounded-full"
          style={{
            width: "calc(var(--bloom-size, 100px) * 6)",
            height: "calc(var(--bloom-size, 100px) * 6)",
            background: "radial-gradient(circle, " + p.glowColor + ", transparent 62%)",
            opacity: p.glow,
            transform: "translate(-50%, -50%)",
            willChange: "transform, opacity",
          }}
        />
        {Array.from({ length: count }, (_, i) => (
          <div
            key={i}
            ref={(el) => {
              petalRefs.current[i] = el
              petalRefs.current.length = count
            }}
            data-petal={i}
            className="absolute left-1/2 top-1/2 rounded-full"
            style={{
              width: "calc(var(--bloom-size, 100px) * 1)",
              height: "calc(var(--bloom-size, 100px) * 1)",
              margin: "calc(var(--bloom-size, 100px) * -0.5) 0 0 calc(var(--bloom-size, 100px) * -0.5)",
              background: gradient,
              mixBlendMode: p.blend,
              transformOrigin: "center",
              // No will-change: a promoted layer is rasterised once at 1x and
              // then magnified, which frays the edge of a petal scaled to 8x.
              transform: petalTransform(i, count, p.offset, p.tilt, initial, 100),
            }}
          />
        ))}
      </div>

      {guide !== false && (
        <div aria-live="polite" className="pointer-events-none absolute inset-0 grid place-items-center">
          {[...words, "Pinned"].map((word, i) => (
            <span
              key={i}
              className="col-start-1 row-start-1 select-none font-mono text-[11px] uppercase tracking-[0.42em] transition-[opacity,letter-spacing] duration-700 ease-out motion-reduce:transition-none"
              style={{
                color: p.ink,
                opacity: stage === i ? 1 : 0,
                letterSpacing: stage === i ? "0.42em" : "0.2em",
                textShadow: "0 1px 12px " + p.background,
              }}
              aria-hidden={stage !== i}
            >
              {word}
            </span>
          ))}
        </div>
      )}

      {children !== undefined && <div className="pointer-events-none relative z-10 h-full w-full">{children}</div>}

      {hint !== false && interactive && (
        <p
          className="pointer-events-none absolute inset-x-0 bottom-5 z-10 select-none px-4 text-center font-mono text-[10px] uppercase tracking-[0.3em] transition-opacity duration-500"
          style={{ color: p.ink, opacity: isPinned ? 0.85 : 0.45 }}
        >
          {isPinned ? "pinned · click or esc to let it breathe" : hintText}
        </p>
      )}
    </section>
  )
}

export { BreathBloom }

