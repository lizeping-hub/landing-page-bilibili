const active = new WeakMap<HTMLCanvasElement, () => void>();
export function clearBling(canvas: HTMLCanvasElement) {
  active.get(canvas)?.();
}

export function burstBling(canvas: HTMLCanvasElement) {
  clearBling(canvas);
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  if (reduced.matches || document.hidden) return;
  const context = canvas.getContext('2d');
  if (!context) return;
  const { width, height } = canvas.getBoundingClientRect();
  if (!width || !height) return;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.round(width * dpr);
  canvas.height = Math.round(height * dpr);
  context.setTransform(dpr, 0, 0, dpr, 0, 0);
  const style = getComputedStyle(document.documentElement);
  const colors = [
    style.getPropertyValue('--primary-color').trim(),
    style.getPropertyValue('--secondary-color').trim(),
    '#F4F7FF',
  ];
  const particles = Array.from({ length: innerWidth < 768 ? 14 : 24 }, (_, index) => {
    const angle = -Math.PI * (0.1 + Math.random() * 0.8);
    const speed = 100 + Math.random() * 120;
    return {
      x: width / 2,
      y: height - 10,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      size: 2 + Math.random() * 3,
      color: colors[index % colors.length],
    };
  });
  let frame = 0;
  let previous = performance.now();
  const start = previous;
  let cleaned = false;
  const cleanup = () => {
    if (cleaned) return;
    cleaned = true;
    cancelAnimationFrame(frame);
    context.clearRect(0, 0, width, height);
    window.removeEventListener('resize', cleanup);
    document.removeEventListener('visibilitychange', visibility);
    reduced.removeEventListener('change', cleanup);
    if (active.get(canvas) === cleanup) active.delete(canvas);
  };
  const visibility = () => {
    if (document.hidden) cleanup();
  };
  const draw = (now: number) => {
    if (now - start >= 550 || !canvas.isConnected || document.hidden) {
      cleanup();
      return;
    }
    const dt = Math.min((now - previous) / 1000, 0.032);
    previous = now;
    context.clearRect(0, 0, width, height);
    context.globalAlpha = 1 - (now - start) / 550;
    particles.forEach((particle) => {
      particle.x += particle.vx * dt;
      particle.y += particle.vy * dt;
      particle.vy += 480 * dt;
      context.fillStyle = particle.color;
      context.fillRect(particle.x, particle.y, particle.size, particle.size);
    });
    context.globalAlpha = 1;
    frame = requestAnimationFrame(draw);
  };
  active.set(canvas, cleanup);
  window.addEventListener('resize', cleanup, { once: true });
  document.addEventListener('visibilitychange', visibility);
  reduced.addEventListener('change', cleanup, { once: true });
  frame = requestAnimationFrame(draw);
}
