"use client";

import * as React from "react";
import { useTheme } from "../../context/ThemeContext";

/**
 * FlashlightBackground — A full-page, fixed WebGL flashlight effect.
 *
 * Renders behind the entire landing page.
 * Tracks global pointer movement across the entire viewport.
 * When idle or off-screen, the flashlight smoothly roams across the page.
 *
 * Designed with a refined, luxurious aesthetic:
 * - Subtle, atmospheric ambient lighting (not harsh, overblown, or blinding).
 * - Smooth velvety drift on dark graphite/obsidian gym texture.
 * - Soft reactive spotlight aura that enhances cards and typography seamlessly.
 */

const SPOTLIGHT = 4;

const VERT = `
attribute vec2 a_position;
void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

const FRAG = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif

uniform vec3 u_colors[8];
uniform vec4 u_scene;      // resolution.xy, time, colour count
uniform vec4 u_shape;      // scale, intensity, paramA, warp
uniform vec4 u_surface;    // detail, contrast, brightness, saturation
uniform vec4 u_finish;     // hue, vignette, blur, grain
uniform vec4 u_transform;  // seed, rotation, drift, OKLab toggle
uniform vec4 u_space;      // offset.xy, pointer.xy
uniform vec4 u_cursor;

#define u_resolution u_scene.xy
#define u_time u_scene.z
#define u_colorCount u_scene.w
#define u_scale u_shape.x
#define u_intensity u_shape.y
#define u_paramA u_shape.z
#define u_warp u_shape.w
#define u_detail u_surface.x
#define u_contrast u_surface.y
#define u_brightness u_surface.z
#define u_saturation u_surface.w
#define u_hue u_finish.x
#define u_vignette u_finish.y
#define u_blur u_finish.z
#define u_grain u_finish.w
#ifdef GL_FRAGMENT_PRECISION_HIGH
#define u_seed u_transform.x
#else
#define u_seed mod(u_transform.x, 31.0)
#endif
#define u_rotate u_transform.y
#define u_drift u_transform.z
#define u_oklab u_transform.w
#define u_offset u_space.xy
#define u_mouse u_space.zw
#define u_cursorPresence u_cursor.x
#define u_cursorEffect u_cursor.y
#define u_cursorStrength u_cursor.z
#define u_cursorRadius u_cursor.w

float hash21(vec2 p) {
#ifndef GL_FRAGMENT_PRECISION_HIGH
  p = mod(p, 31.0);
#endif
  p = fract(p * vec2(234.34, 435.345));
  p += dot(p, p + 34.23);
  return fract(p.x * p.y);
}

float grainHash(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

vec2 hash22(vec2 p) {
#ifndef GL_FRAGMENT_PRECISION_HIGH
  p = mod(p, 31.0);
#endif
  float n = sin(dot(p, vec2(41.0, 289.0)));
  return fract(vec2(15731.743, 7892.321) * n);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash21(i), hash21(i + vec2(1.0, 0.0)), u.x),
    mix(hash21(i + vec2(0.0, 1.0)), hash21(i + vec2(1.0, 1.0)), u.x),
    u.y);
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 5; i++) {
    v += a * noise(p);
    p = p * 2.03 + vec2(17.0, 9.2);
    a *= 0.5;
  }
  return v;
}

vec3 shade(vec2 uv, vec2 p, float t) {
  vec3 acc = u_colors[0] * 0.15;
  float total = 0.15;
  for (int i = 0; i < 8; i++) {
    if (float(i) >= u_colorCount) break;
    float fi = float(i);
    vec2 c = vec2(
      sin(t * (0.21 + fi * 0.071) + fi * 2.4 + u_seed),
      cos(t * (0.17 + fi * 0.093) + fi * 1.7)) * (0.45 + u_intensity * 0.35);
    float w = exp(-dot(p - c, p - c) * 6.0);
    acc += u_colors[i] * w;
    total += w;
  }
  return acc / total;
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution.xy;
  vec2 screenUv = uv;
  vec2 p = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / min(u_resolution.x, u_resolution.y);
  float cursorMask = 0.0;

  if (u_cursorPresence > 0.001) {
    vec2 cursor = (0.5 * u_mouse * u_resolution.xy) / min(u_resolution.x, u_resolution.y);
    vec2 cursorDelta = p - cursor;
    float cursorDistance = length(cursorDelta);
    cursorMask = u_cursorPresence * (1.0 - smoothstep(0.0, u_cursorRadius, cursorDistance));
  }

  uv = p * min(u_resolution.x, u_resolution.y) / u_resolution.xy + 0.5;
  p *= u_scale;
  if (abs(u_rotate) > 0.0001) {
    float cr = cos(u_rotate), sr = sin(u_rotate);
    p = mat2(cr, -sr, sr, cr) * p;
  }
  p += u_offset;
  if (u_drift > 0.0001)
    p += u_drift * vec2(sin(u_time * 0.31), cos(u_time * 0.23));

  if (u_warp > 0.0) {
    p += u_warp * (vec2(
      fbm(p * u_detail + u_seed),
      fbm(p * u_detail + vec2(5.2, 1.3))) - 0.5);
  }

  vec3 col;
  if (u_blur > 0.0) {
    float e = u_blur;
    float pe = e * u_scale;
    vec2 uvE = vec2(e) * min(u_resolution.x, u_resolution.y) / u_resolution.xy;
    col  = shade(uv, p, u_time) * 0.36;
    col += shade(uv + vec2(uvE.x, 0.0), p + vec2(pe, 0.0), u_time) * 0.16;
    col += shade(uv - vec2(uvE.x, 0.0), p - vec2(pe, 0.0), u_time) * 0.16;
    col += shade(uv + vec2(0.0, uvE.y), p + vec2(pe, 0.0), u_time) * 0.16;
    col += shade(uv - vec2(0.0, uvE.y), p - vec2(pe, 0.0), u_time) * 0.16;
  } else {
    col = shade(uv, p, u_time);
  }

  if (abs(u_contrast - 1.0) > 0.0001)
    col = (col - 0.5) * u_contrast + 0.5;
  if (abs(u_saturation - 1.0) > 0.0001) {
    float luma = dot(col, vec3(0.299, 0.587, 0.114));
    col = mix(vec3(luma), col, u_saturation);
  }
  if (abs(u_brightness) > 0.0001)
    col += u_brightness;
  if (u_vignette > 0.0001) {
    float vd = length(screenUv - 0.5) * 1.41421356;
    col *= 1.0 - u_vignette * smoothstep(0.35, 1.0, vd);
  }

  // Refined, natural flashlight spotlight (smooth organic illumination)
  if (u_cursorPresence > 0.001) {
    vec3 beamGlow = vec3(0.20, 0.25, 0.30) + col * 0.14;
    float core = pow(cursorMask, 2.2) * 0.20;
    col += (beamGlow * cursorMask + core) * u_cursorStrength;
  }

  if (u_grain > 0.0001)
    col += (grainHash(gl_FragCoord.xy + vec2(u_seed * 17.0, u_seed * 31.0)) - 0.5) * u_grain;

  gl_FragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
}
`;

function hexToRgb(hex) {
  let h = hex.trim().replace(/^#/, "");
  if (h.length === 3) h = h.replace(/./g, "$&$&");
  const n = /^[0-9a-f]{6}$/i.test(h) ? parseInt(h, 16) : 0;
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

function wanderAt(t) {
  return [0.62 * Math.sin(t * 0.35), 0.48 * Math.sin(t * 0.48 + 1.2)];
}

function compile(gl, vert, frag) {
  const program = gl.createProgram();
  if (!program) return null;
  for (const [type, source] of [
    [gl.VERTEX_SHADER, vert],
    [gl.FRAGMENT_SHADER, frag],
  ]) {
    const shader = gl.createShader(type);
    if (!shader) return null;
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.warn("Shader compile error:", gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
      gl.deleteProgram(program);
      return null;
    }
    gl.attachShader(program, shader);
    gl.deleteShader(shader);
  }
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.warn("Program link error:", gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
    return null;
  }
  return program;
}

export default function FlashlightBackground({ isDark: isDarkProp, className = "" }) {
  let themeContext;
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    themeContext = useTheme();
  } catch {
    themeContext = null;
  }

  const isDark = isDarkProp !== undefined ? isDarkProp : (themeContext ? themeContext.isDark : true);

  const canvasRef = React.useRef(null);
  // Track cursor and light coordinates in screen pixels
  const [lightPos, setLightPos] = React.useState({
    x: typeof window !== "undefined" ? window.innerWidth * 0.5 : 500,
    y: typeof window !== "undefined" ? window.innerHeight * 0.4 : 350,
    presence: 1,
  });

  // Dark Mode vs Light Mode configuration: subtle, luxurious, organic
  const config = React.useMemo(() => {
    if (isDark) {
      return {
        // Deep obsidian & charcoal gym wall with subtle cyan undertones
        colors: ["#0b0d13", "#111723", "#162032", "#101927", "#1d293d"],
        radius: 0.44,
        strength: 1.35,
        contrast: 0.98,
        brightness: -0.04,
        saturation: 1.05,
        grain: 0.12,
        blur: 0.016,
        speed: 0.75,
        scale: 2.5,
        intensity: 0.55,
        warp: 0.0,
        drift: 0.025,
      };
    } else {
      // Soft athletic mist & cool silver-slate
      return {
        colors: ["#f8fafc", "#f1f5f9", "#e2e8f0", "#cbd5e1", "#bae6fd"],
        radius: 0.46,
        strength: 1.35,
        contrast: 1.12,
        brightness: -0.05,
        saturation: 1.1,
        grain: 0.04,
        blur: 0.016,
        speed: 0.75,
        scale: 2.3,
        intensity: 0.58,
        warp: 0.0,
        drift: 0.025,
      };
    }
  }, [isDark]);

  const configRef = React.useRef(config);
  configRef.current = config;
  const kickRef = React.useRef(() => {});

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl", {
      alpha: false,
      antialias: false,
      depth: false,
      stencil: false,
      powerPreference: "high-performance",
    });
    if (!gl) return;

    const program = compile(gl, VERT, FRAG);
    if (!program) return;

    gl.useProgram(program);

    const triangleBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, triangleBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 3, -1, -1, 3]),
      gl.STATIC_DRAW,
    );
    const a_position = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(a_position);
    gl.vertexAttribPointer(a_position, 2, gl.FLOAT, false, 0, 0);

    const u_colors = gl.getUniformLocation(program, "u_colors");
    const u_scene = gl.getUniformLocation(program, "u_scene");
    const u_shape = gl.getUniformLocation(program, "u_shape");
    const u_surface = gl.getUniformLocation(program, "u_surface");
    const u_finish = gl.getUniformLocation(program, "u_finish");
    const u_transform = gl.getUniformLocation(program, "u_transform");
    const u_space = gl.getUniformLocation(program, "u_space");
    const u_cursor = gl.getUniformLocation(program, "u_cursor");

    let dpr = 1;
    let width = 0;
    let height = 0;

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      const bw = Math.max(1, Math.floor(width * dpr));
      const bh = Math.max(1, Math.floor(height * dpr));
      if (canvas.width !== bw || canvas.height !== bh) {
        canvas.width = bw;
        canvas.height = bh;
        gl.viewport(0, 0, bw, bh);
      }
    };
    resize();
    window.addEventListener("resize", resize, { passive: true });

    let pointer = { x: 0, y: 0, inside: false };
    let state = { x: 0, y: 0, presence: 1 };
    let simTime = 0;
    let last = 0;
    let raf = 0;

    const render = (now) => {
      raf = requestAnimationFrame(render);
      if (!last) last = now;
      const dt = Math.min((now - last) / 1000, 0.1);
      last = now;

      const c = configRef.current;
      simTime += dt * c.speed;

      if (pointer.inside) {
        state.x += (pointer.x - state.x) * 0.16;
        state.y += (pointer.y - state.y) * 0.16;
        state.presence += (1 - state.presence) * 0.15;
      } else {
        const w = wanderAt(simTime);
        state.x += (w[0] - state.x) * 0.04;
        state.y += (w[1] - state.y) * 0.04;
        state.presence += (1 - state.presence) * 0.04;
      }

      // Sync screen pixel coordinate for subtle ambient spotlight
      const curW = window.innerWidth || 1000;
      const curH = window.innerHeight || 800;
      setLightPos({
        x: ((state.x + 1) / 2) * curW,
        y: ((1 - state.y) / 2) * curH,
        presence: state.presence,
      });

      gl.useProgram(program);

      const rgb = (c.colors || []).flatMap(hexToRgb);
      while (rgb.length < 24) rgb.push(0, 0, 0);
      gl.uniform3fv(u_colors, new Float32Array(rgb));

      gl.uniform4f(u_scene, canvas.width, canvas.height, simTime, c.colors.length);
      gl.uniform4f(u_shape, c.scale, c.intensity, 0, c.warp);
      gl.uniform4f(u_surface, 2.4, c.contrast, c.brightness, c.saturation);
      gl.uniform4f(u_finish, 6.28, 0, c.blur, c.grain);
      gl.uniform4f(u_transform, 1, 0, c.drift, 0);
      gl.uniform4f(u_space, 0, 0, state.x, state.y);
      gl.uniform4f(u_cursor, state.presence, SPOTLIGHT, c.strength, c.radius);

      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };

    raf = requestAnimationFrame(render);

    const kick = () => {
      if (!raf) raf = requestAnimationFrame(render);
    };
    kickRef.current = kick;

    const onMove = (e) => {
      pointer.inside = true;
      pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.y = 1 - (e.clientY / window.innerHeight) * 2;
      kick();
    };

    const onLeave = () => {
      pointer.inside = false;
      kick();
    };

    const onVisibility = () => {
      if (document.hidden) {
        cancelAnimationFrame(raf);
        raf = 0;
      } else {
        last = 0;
        kick();
      }
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      document.removeEventListener("visibilitychange", onVisibility);
      gl.deleteBuffer(triangleBuffer);
      gl.deleteProgram(program);
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className={`fixed inset-0 pointer-events-none z-0 overflow-hidden ${className}`}
      style={{
        backgroundColor: isDark ? "#090b10" : "#f8fafc",
        transition: "background-color 0.4s ease",
      }}
    >
      {/* ── WebGL Canvas (drifting dark textured wall + smooth spotlight) ── */}
      <canvas
        ref={canvasRef}
        className="w-full h-full block"
        style={{
          width: "100vw",
          height: "100vh",
          position: "fixed",
          top: 0,
          left: 0,
          display: "block",
        }}
      />

      {/* ── Soft, Atmospheric Ambient Glow (delicate, elegant, not blinding) ── */}
      <div
        className="fixed inset-0 pointer-events-none transition-opacity duration-300"
        style={{
          background: isDark
            ? `radial-gradient(480px circle at ${lightPos.x}px ${lightPos.y}px, rgba(34, 211, 238, 0.08) 0%, rgba(14, 116, 144, 0.03) 45%, transparent 75%)`
            : `radial-gradient(480px circle at ${lightPos.x}px ${lightPos.y}px, rgba(2, 132, 199, 0.06) 0%, rgba(56, 189, 248, 0.02) 45%, transparent 75%)`,
          opacity: lightPos.presence,
        }}
      />
    </div>
  );
}
