import { useEffect, useRef } from 'react';

const VERTEX_SHADER = `
precision highp float;
attribute vec2 a_position;
varying vec2 v_uv;
void main() {
  v_uv = a_position * 0.5 + 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}`;

const FRAGMENT_SHADER = `
precision highp float;

uniform float u_time;
uniform vec2 u_resolution;

varying vec2 v_uv;

// --- Simplex 3D Noise (Ashima Arts, public domain) ---
vec4 mod289v4(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec3 mod289v3(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289v4(((x * 34.0) + 10.0) * x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

float snoise(vec3 v) {
  vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
  vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

  vec3 i = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);

  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);

  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;

  i = mod289v3(i);
  vec4 p = permute(permute(permute(
    i.z + vec4(0.0, i1.z, i2.z, 1.0))
    + i.y + vec4(0.0, i1.y, i2.y, 1.0))
    + i.x + vec4(0.0, i1.x, i2.x, 1.0));

  float n_ = 0.142857142857;
  vec3 ns = n_ * D.wyz - D.xzx;

  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);

  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);

  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);

  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);

  vec4 s0 = floor(b0) * 2.0 + 1.0;
  vec4 s1 = floor(b1) * 2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));

  vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;

  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);

  vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
  p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;

  vec4 m = max(0.5 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
  m = m * m;
  return 105.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
}

// --- fBM with rotation per octave ---
float fbm(vec3 pos) {
  float value = 0.0;
  float amplitude = 0.5;
  float frequency = 1.0;

  for (int i = 0; i < 5; i++) {
    value += amplitude * snoise(pos * frequency);
    vec2 rotXY = vec2(pos.x * 0.8 - pos.y * 0.6, pos.x * 0.6 + pos.y * 0.8);
    vec2 rotYZ = vec2(pos.y * 0.8 - pos.z * 0.6, pos.y * 0.6 + pos.z * 0.8);
    pos = vec3(rotXY.x, rotYZ.x, rotYZ.y);
    amplitude *= 0.5;
    frequency *= 2.0;
  }
  return value;
}

// --- Curl noise for vorticity distortion ---
vec2 curlNoise(vec3 pos) {
  float eps = 0.01;
  float n1 = fbm(pos + vec3(eps, 0.0, 0.0));
  float n2 = fbm(pos - vec3(eps, 0.0, 0.0));
  float n3 = fbm(pos + vec3(0.0, eps, 0.0));
  float n4 = fbm(pos - vec3(0.0, eps, 0.0));
  return vec2((n3 - n4), -(n1 - n2)) / (2.0 * eps);
}

void main() {
  vec2 uv = v_uv;
  float aspect = u_resolution.x / u_resolution.y;
  vec2 coord = vec2((uv.x - 0.5) * aspect, uv.y - 0.5);

  float loopPeriod = 30.0;
  float fadeWindow = 3.0;
  vec2 lightPos = vec2(0.5, 0.15);

  // Seamless time loop with crossfade
  float t = mod(u_time, loopPeriod);
  float blend = smoothstep(loopPeriod - fadeWindow, loopPeriod, t);

  // Buoyancy: slow upward drift
  float drift = t * 0.015;
  float drift2 = (t - loopPeriod) * 0.015;

  // Base smoke coordinates (lower frequency = wider spread)
  vec3 pos1 = vec3(coord * 1.2, t * 0.04 + drift);
  vec3 pos2 = vec3(coord * 1.2, (t - loopPeriod) * 0.04 + drift2);

  // Apply curl noise for vorticity
  vec2 curl1 = curlNoise(pos1 * 0.5) * 0.08;
  vec2 curl2 = curlNoise(pos2 * 0.5) * 0.08;
  pos1.xy += curl1;
  pos2.xy += curl2;

  // Add vertical buoyancy offset
  pos1.y += drift;
  pos2.y += drift2;

  // Compute density via fBM (crossfaded for seamless loop)
  float density1 = fbm(pos1) * 0.5 + 0.5;
  float density2 = fbm(pos2) * 0.5 + 0.5;
  float density = mix(density1, density2, blend);

  // Vertical gradient: more density at bottom, fading upward
  float vertGrad = smoothstep(0.0, 0.7, 1.0 - uv.y);
  density *= mix(0.3, 1.0, vertGrad);

  // No edge fade — smoke fills the entire viewport


  // --- Volumetric light scattering (chiaroscuro) ---
  vec2 lightDir = lightPos - uv;
  float lightDist = length(lightDir);
  vec2 rayStep = lightDir / 8.0;

  float illumination = 1.0;
  vec2 sampleUV = uv;

  for (int i = 0; i < 8; i++) {
    sampleUV += rayStep;
    vec2 sCoord = vec2((sampleUV.x - 0.5) * aspect, sampleUV.y - 0.5);
    vec3 sp = vec3(sCoord * 2.0, t * 0.04 + t * 0.015);
    sp.y += t * 0.015;
    float sDensity = fbm(sp) * 0.5 + 0.5;

    illumination *= 1.0 - sDensity * 0.12;
  }

  // Light falloff from source
  float lightFalloff = 1.0 - smoothstep(0.0, 1.2, lightDist);
  illumination *= lightFalloff;

  // Final luminance
  float luminance = density * (0.3 + 0.7 * illumination);
  luminance = pow(luminance, 1.2);

  // Warm monochrome matching the background illustrations
  // (cream/parchment tones like the inverted bg images)
  vec3 colorDark = vec3(0.06, 0.055, 0.04);
  vec3 colorLight = vec3(0.85, 0.78, 0.65);
  vec3 color = mix(colorDark, colorLight, luminance);

  float alpha = smoothstep(0.05, 0.5, density) * 0.6;
  gl_FragColor = vec4(color, alpha);
}`;

function compileShader(
  gl: WebGLRenderingContext,
  type: number,
  source: string,
): WebGLShader | null {
  const shader = gl.createShader(type);
  if (!shader) {
    console.error('SmokeSimulation: createShader returned null');
    return null;
  }
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error(
      'SmokeSimulation shader error:',
      gl.getShaderInfoLog(shader),
    );
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

function createProgram(
  gl: WebGLRenderingContext,
  vertSrc: string,
  fragSrc: string,
): WebGLProgram | null {
  const vs = compileShader(gl, gl.VERTEX_SHADER, vertSrc);
  if (!vs) return null;
  const fs = compileShader(gl, gl.FRAGMENT_SHADER, fragSrc);
  if (!fs) {
    gl.deleteShader(vs);
    return null;
  }
  const program = gl.createProgram();
  if (!program) return null;
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error(
      'SmokeSimulation link error:',
      gl.getProgramInfoLog(program),
    );
    gl.deleteProgram(program);
    gl.deleteShader(vs);
    gl.deleteShader(fs);
    return null;
  }
  gl.deleteShader(vs);
  gl.deleteShader(fs);
  return program;
}

const QUAD_VERTS = new Float32Array([
  -1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1,
]);

export function SmokeSimulation() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const glRef = useRef<{
    gl: WebGLRenderingContext;
    program: WebGLProgram;
    vbo: WebGLBuffer;
    aPosition: number;
    uTime: WebGLUniformLocation | null;
    uResolution: WebGLUniformLocation | null;
  } | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Reuse existing GL context if available (survives StrictMode remount)
    let state = glRef.current;

    if (!state) {
      const gl = canvas.getContext('webgl', {
        alpha: true,
        premultipliedAlpha: false,
        antialias: false,
        powerPreference: 'low-power',
      }) as WebGLRenderingContext | null;
      if (!gl) return;

      // Check if context is usable (not lost)
      if (gl.isContextLost()) return;

      const program = createProgram(gl, VERTEX_SHADER, FRAGMENT_SHADER);
      if (!program) return;

      const vbo = gl.createBuffer();
      if (!vbo) return;
      gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
      gl.bufferData(gl.ARRAY_BUFFER, QUAD_VERTS, gl.STATIC_DRAW);

      state = {
        gl,
        program,
        vbo,
        aPosition: gl.getAttribLocation(program, 'a_position'),
        uTime: gl.getUniformLocation(program, 'u_time'),
        uResolution: gl.getUniformLocation(program, 'u_resolution'),
      };
      glRef.current = state;

      gl.enable(gl.BLEND);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    }

    const { gl, program, vbo, aPosition, uTime, uResolution } = state;

    let rafId = 0;
    let startTime = performance.now();
    let pausedAt = 0;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const scale = dpr >= 2 ? 0.25 : 0.5;
      canvas.width = Math.floor(window.innerWidth * dpr * scale);
      canvas.height = Math.floor(window.innerHeight * dpr * scale);
      gl.viewport(0, 0, canvas.width, canvas.height);
    };

    const render = () => {
      if (gl.isContextLost()) return;
      const elapsed = (performance.now() - startTime) / 1000;
      gl.useProgram(program);
      gl.uniform1f(uTime, elapsed);
      gl.uniform2f(uResolution, canvas.width, canvas.height);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
      gl.enableVertexAttribArray(aPosition);
      gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      rafId = requestAnimationFrame(render);
    };

    const onVisibility = () => {
      if (document.hidden) {
        pausedAt = performance.now();
        cancelAnimationFrame(rafId);
      } else {
        if (pausedAt > 0) {
          startTime += performance.now() - pausedAt;
          pausedAt = 0;
        }
        rafId = requestAnimationFrame(render);
      }
    };

    resize();
    window.addEventListener('resize', resize);
    document.addEventListener('visibilitychange', onVisibility);
    rafId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', onVisibility);
      // Don't destroy GL resources — they survive StrictMode remount.
      // Browser GCs them when canvas is removed from DOM.
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="smoke-simulation"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: -1,
        pointerEvents: 'none',
        opacity: 0.35,
        mixBlendMode: 'screen',
        transition: 'opacity 1s ease-in-out',
      }}
    />
  );
}
