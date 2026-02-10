import { useEffect, useRef, useCallback } from "react";

export default function ParticleBackground() {
  const canvasRef = useRef(null);
  const animFrameRef = useRef(null);
  const particlesRef = useRef([]);
  const mouseRef = useRef({ x: -1000, y: -1000 });

  const initParticles = useCallback((canvas) => {
    const particles = [];
    const count = Math.min(120, Math.floor((canvas.width * canvas.height) / 12000));

    for (let i = 0; i < count; i++) {
      const isOrange = Math.random() < 0.08;
      const isCyan = !isOrange && Math.random() < 0.25;

      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 2.2 + 1,
        speedX: (Math.random() - 0.5) * 0.35,
        speedY: (Math.random() - 0.5) * 0.35,
        opacity: Math.random() * 0.35 + 0.25,
        baseOpacity: 0,
        pulseSpeed: Math.random() * 0.008 + 0.003,
        pulseOffset: Math.random() * Math.PI * 2,
        r: isOrange ? 255 : isCyan ? 140 : 255,
        g: isOrange ? 122 : isCyan ? 210 : 255,
        b: isOrange ? 42 : isCyan ? 255 : 255,
        glowSize: isOrange ? 12 : isCyan ? 8 : 6,
      });
    }

    // Set base opacity after creation
    particles.forEach((p) => {
      p.baseOpacity = p.opacity;
    });

    return particles;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    let running = true;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      particlesRef.current = initParticles(canvas);
    };

    resize();
    window.addEventListener("resize", resize);

    // Mouse interaction (subtle attraction)
    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };
    const handleMouseLeave = () => {
      mouseRef.current = { x: -1000, y: -1000 };
    };
    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseleave", handleMouseLeave);

    // Check reduced motion
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let time = 0;

    const draw = () => {
      if (!running) return;

      const particles = particlesRef.current;
      const w = canvas.getBoundingClientRect().width;
      const h = canvas.getBoundingClientRect().height;
      time += 0.016;

      // Clear
      ctx.clearRect(0, 0, w, h);

      // Draw connections first
      const connectionDistance = 130;
      ctx.lineWidth = 0.5;

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < connectionDistance) {
            const alpha = (1 - dist / connectionDistance) * 0.12;
            ctx.strokeStyle = `rgba(180, 210, 240, ${alpha})`;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      // Update and draw particles
      for (const p of particles) {
        if (!prefersReduced) {
          p.x += p.speedX;
          p.y += p.speedY;

          // Subtle pulse
          p.opacity = p.baseOpacity + Math.sin(time * p.pulseSpeed * 60 + p.pulseOffset) * 0.1;
          p.opacity = Math.max(0.15, Math.min(0.7, p.opacity));

          // Wrap around edges with margin
          if (p.x > w + 10) p.x = -10;
          if (p.x < -10) p.x = w + 10;
          if (p.y > h + 10) p.y = -10;
          if (p.y < -10) p.y = h + 10;

          // Mouse interaction - subtle push
          const mdx = p.x - mouseRef.current.x;
          const mdy = p.y - mouseRef.current.y;
          const mDist = Math.sqrt(mdx * mdx + mdy * mdy);
          if (mDist < 150 && mDist > 0) {
            const force = (150 - mDist) / 150 * 0.15;
            p.x += (mdx / mDist) * force;
            p.y += (mdy / mDist) * force;
          }
        }

        // Draw glow
        const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.glowSize);
        gradient.addColorStop(0, `rgba(${p.r}, ${p.g}, ${p.b}, ${p.opacity * 0.6})`);
        gradient.addColorStop(1, `rgba(${p.r}, ${p.g}, ${p.b}, 0)`);
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.glowSize, 0, Math.PI * 2);
        ctx.fill();

        // Draw core dot
        ctx.fillStyle = `rgba(${p.r}, ${p.g}, ${p.b}, ${p.opacity})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }

      animFrameRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      running = false;
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mouseleave", handleMouseLeave);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [initParticles]);

  return (
    <canvas
      ref={canvasRef}
      data-testid="particle-canvas"
      className="absolute inset-0 w-full h-full"
      style={{ pointerEvents: "auto", zIndex: 1 }}
    />
  );
}
