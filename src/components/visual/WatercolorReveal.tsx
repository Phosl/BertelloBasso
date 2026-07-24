"use client";

import {useEffect, useRef, useState} from "react";

const vertexShader = `
  attribute vec2 aPosition;
  varying vec2 vUv;

  void main() {
    vUv = aPosition * 0.5 + 0.5;
    gl_Position = vec4(aPosition, 0.0, 1.0);
  }
`;

const fragmentShader = `
  precision highp float;

  varying vec2 vUv;
  uniform sampler2D uImage;
  uniform vec2 uCanvasSize;
  uniform vec2 uImageSize;
  uniform float uProgress;
  uniform float uTime;
  uniform float uSeed;
  uniform float uIntensity;

  float hash21(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
  }

  float valueNoise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(hash21(i), hash21(i + vec2(1.0, 0.0)), f.x),
      mix(hash21(i + vec2(0.0, 1.0)), hash21(i + vec2(1.0)), f.x),
      f.y
    );
  }

  float fbm(vec2 p) {
    float value = 0.0;
    float amplitude = 0.5;
    mat2 rotation = mat2(0.82, -0.57, 0.57, 0.82);
    for (int i = 0; i < 5; i++) {
      value += amplitude * valueNoise(p);
      p = rotation * p * 2.03 + 13.7;
      amplitude *= 0.5;
    }
    return value;
  }

  vec2 coverUv(vec2 uv) {
    float canvasAspect = uCanvasSize.x / uCanvasSize.y;
    float imageAspect = uImageSize.x / uImageSize.y;
    vec2 scale = vec2(1.0);
    if (canvasAspect > imageAspect) {
      scale.y = imageAspect / canvasAspect;
    } else {
      scale.x = canvasAspect / imageAspect;
    }
    return (uv - 0.5) * scale + 0.5;
  }

  void main() {
    vec2 uv = vUv;
    vec2 p = vec2((uv.x - 0.5) * 1.05, (uv.y - 0.5) * 1.52);
    float drift = uTime * 0.018;
    vec2 noiseP = p * 4.6 + vec2(uSeed * 3.1, -uSeed * 2.2);
    float broad = fbm(noiseP + vec2(drift, -drift * 0.7));
    float fine = fbm(noiseP * 2.45 - vec2(drift * 0.55, drift));
    float ripple = sin(atan(p.y, p.x) * 9.0 + broad * 5.0) * 0.008;
    float organicDistance =
      length(p * vec2(1.0 + (broad - 0.5) * 0.08, 1.0)) -
      (broad - 0.45) * 0.115 * uIntensity -
      (fine - 0.5) * 0.034 * uIntensity +
      ripple;

    float eased = 1.0 - pow(1.0 - clamp(uProgress, 0.0, 1.0), 3.0);
    float radius = mix(-0.055, 0.72, eased);
    float softness = mix(0.025, 0.07, smoothstep(0.0, 0.65, eased));
    float mainMask = smoothstep(radius + softness, radius - softness, organicDistance);

    float droplets = 0.0;
    for (int i = 0; i < 8; i++) {
      float fi = float(i);
      float angle = hash21(vec2(fi + uSeed, 3.7)) * 6.2831853;
      float orbit = 0.22 + hash21(vec2(fi * 1.71, uSeed + 7.0)) * 0.46;
      vec2 center = vec2(cos(angle), sin(angle)) * orbit;
      center.y *= 0.72;
      float size = 0.012 + hash21(vec2(fi * 4.2, uSeed)) * 0.026;
      float birth = 0.18 + fi * 0.057;
      float visible = smoothstep(birth, birth + 0.12, eased);
      float wobble = valueNoise(center * 22.0 + uTime * 0.025) * 0.008;
      droplets = max(
        droplets,
        smoothstep(size + 0.012, size - 0.006, length(p - center) + wobble) * visible
      );
    }

    float mask = max(mainMask, droplets * 0.82);
    float wetEdge = smoothstep(0.09, 0.0, abs(organicDistance - radius));
    mask = clamp(mask + wetEdge * 0.055 * step(organicDistance, radius + 0.045), 0.0, 1.0);

    vec4 photo = texture2D(uImage, coverUv(uv));
    gl_FragColor = vec4(photo.rgb, photo.a * mask);
  }
`;

function createShader(
  gl: WebGLRenderingContext,
  type: number,
  source: string,
) {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

function easeInOutCubic(value: number) {
  return value < 0.5
    ? 4 * value * value * value
    : 1 - Math.pow(-2 * value + 2, 3) / 2;
}

export function WatercolorReveal({
  alt,
  src,
}: {
  alt: string;
  src: string;
}) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [fallback, setFallback] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrapper = wrapperRef.current;
    if (!canvas || !wrapper) return;

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const navigatorWithMemory = navigator as Navigator & {
      deviceMemory?: number;
    };
    const lowPower =
      (navigator.hardwareConcurrency > 0 &&
        navigator.hardwareConcurrency <= 2) ||
      (navigatorWithMemory.deviceMemory ?? 8) <= 2;
    const showFallback = () => queueMicrotask(() => setFallback(true));

    if (reduced || lowPower) {
      showFallback();
      return;
    }

    const gl = canvas.getContext("webgl", {
      alpha: true,
      antialias: false,
      premultipliedAlpha: true,
      powerPreference: "low-power",
    });
    if (!gl) {
      showFallback();
      return;
    }

    const vertex = createShader(gl, gl.VERTEX_SHADER, vertexShader);
    const fragment = createShader(gl, gl.FRAGMENT_SHADER, fragmentShader);
    if (!vertex || !fragment) {
      showFallback();
      return;
    }

    const program = gl.createProgram();
    if (!program) {
      showFallback();
      return;
    }
    gl.attachShader(program, vertex);
    gl.attachShader(program, fragment);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      showFallback();
      return;
    }

    gl.useProgram(program);
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW,
    );
    const position = gl.getAttribLocation(program, "aPosition");
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

    const image = new Image();
    image.decoding = "async";
    image.src = src;

    let frame = 0;
    let visible = false;
    let pageVisible = !document.hidden;
    let start = 0;
    let loaded = false;
    let finalTimer = 0;
    const seed = Math.random();
    const duration = 2800;

    const canvasSize = gl.getUniformLocation(program, "uCanvasSize");
    const imageSize = gl.getUniformLocation(program, "uImageSize");
    const progress = gl.getUniformLocation(program, "uProgress");
    const time = gl.getUniformLocation(program, "uTime");
    const seedLocation = gl.getUniformLocation(program, "uSeed");
    const intensity = gl.getUniformLocation(program, "uIntensity");

    const resize = () => {
      const bounds = wrapper.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const width = Math.max(1, Math.round(bounds.width * dpr));
      const height = Math.max(1, Math.round(bounds.height * dpr));
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
        gl.viewport(0, 0, width, height);
      }
    };

    const draw = (now: number) => {
      if (!loaded || !visible || !pageVisible) return;
      if (!start) start = now;
      const elapsed = now - start;
      const reveal = easeInOutCubic(Math.min(elapsed / duration, 1));
      const finished = elapsed >= duration;

      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.uniform2f(canvasSize, canvas.width, canvas.height);
      gl.uniform2f(imageSize, image.naturalWidth, image.naturalHeight);
      gl.uniform1f(progress, reveal);
      gl.uniform1f(time, now / 1000);
      gl.uniform1f(seedLocation, seed);
      gl.uniform1f(intensity, 0.74);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      canvas.dataset.ready = "true";

      if (!finished) {
        frame = window.requestAnimationFrame(draw);
      } else {
        finalTimer = window.setTimeout(() => {
          frame = window.requestAnimationFrame(draw);
        }, 1000 / 12);
      }
    };

    image.onload = () => {
      loaded = true;
      resize();
      const texture = gl.createTexture();
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.RGBA,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        image,
      );
      gl.uniform1i(gl.getUniformLocation(program, "uImage"), 0);
      frame = window.requestAnimationFrame(draw);
    };
    image.onerror = () => setFallback(true);

    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (visible && loaded) {
          frame = window.requestAnimationFrame(draw);
        } else {
          window.cancelAnimationFrame(frame);
        }
      },
      {rootMargin: "120px"},
    );
    observer.observe(wrapper);

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(wrapper);

    const onVisibility = () => {
      pageVisible = !document.hidden;
      if (pageVisible && visible && loaded) {
        frame = window.requestAnimationFrame(draw);
      } else {
        window.cancelAnimationFrame(frame);
      }
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      observer.disconnect();
      resizeObserver.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      window.cancelAnimationFrame(frame);
      window.clearTimeout(finalTimer);
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
      gl.deleteShader(vertex);
      gl.deleteShader(fragment);
    };
  }, [src]);

  return (
    <div className="watercolor-reveal" ref={wrapperRef}>
      {fallback ? (
        // The irregular CSS mask keeps the real image bounds hidden without animation.
        // eslint-disable-next-line @next/next/no-img-element
        <img alt={alt} className="watercolor-reveal__fallback" src={src} />
      ) : (
        <>
          <canvas aria-hidden="true" ref={canvasRef} />
          <span className="sr-only">{alt}</span>
        </>
      )}
    </div>
  );
}
