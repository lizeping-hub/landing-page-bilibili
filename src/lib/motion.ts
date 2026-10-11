import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function initPageMotion(root: HTMLElement, mountedAt: number) {
  const mm = gsap.matchMedia();
  mm.add(
    {
      desktop: '(min-width: 768px)',
      short: '(max-height: 639px)',
      reduced: '(prefers-reduced-motion: reduce)',
      all: 'all',
    },
    (context) => {
      const cards = Array.from(root.querySelectorAll<HTMLElement>('.interest-card'));
      const section = root.querySelector<HTMLElement>('#interests')!;
      const conditions = context.conditions!;
      root.dataset.motion = 'flow';
      const restore = () =>
        cards.forEach((card) => {
          card.inert = false;
          card.removeAttribute('aria-hidden');
        });
      restore();
      if (!conditions.desktop || conditions.short || conditions.reduced) {
        root.dataset.scrollTriggers = String(
          ScrollTrigger.getAll().filter((trigger) => trigger.vars.id === 'interest-deck').length,
        );
        return restore;
      }

      root.dataset.motion = 'deck';
      section.style.setProperty('--deck-height', `${(cards.length + 1) * 50}svh`);
      const counter = root.querySelector<HTMLElement>('[data-deck-count]')!;
      let current = -1;
      const setCurrent = (index: number) => {
        if (current === index) return;
        current = index;
        counter.textContent = `${String(index + 1).padStart(2, '0')} / 06`;
        cards.forEach((card, i) => {
          card.inert = i !== index;
          card.setAttribute('aria-hidden', String(i !== index));
        });
      };
      gsap.set(cards, { y: 180, z: -700, rotationX: 16, autoAlpha: 0, transformOrigin: '50% 60%' });
      gsap.set(cards[0], { y: 0, z: 0, rotationX: 0, autoAlpha: 1 });
      setCurrent(0);
      const deck = gsap.timeline({
        defaults: { ease: 'power2.out' },
        onUpdate: () => setCurrent(Math.min(cards.length - 1, Math.floor(deck.time() + 0.45))),
      });
      cards.forEach((card, index) => {
        if (!index) return;
        const position = index - 1;
        deck.to(card, { y: 0, z: 0, rotationX: 0, autoAlpha: 1, duration: 1 }, position);
        cards.slice(0, index).forEach((previous, i) => {
          const depth = index - i;
          deck.to(
            previous,
            {
              y: -20 * depth,
              z: -100 * depth,
              scale: Math.max(0.8, 1 - depth * 0.035),
              autoAlpha: Math.max(0.16, 0.65 - depth * 0.1),
              duration: 1,
            },
            position,
          );
        });
      });
      ScrollTrigger.create({
        id: 'interest-deck',
        trigger: section,
        start: 'top 72px',
        end: 'bottom bottom',
        animation: deck,
        scrub: 0.6,
        invalidateOnRefresh: true,
      });
      root.dataset.scrollTriggers = String(
        ScrollTrigger.getAll().filter((trigger) => trigger.vars.id === 'interest-deck').length,
      );

      // The overlay's CSS fallback also ends at 1.5s, even before this chunk arrives.
      const elapsed = (performance.now() - mountedAt) / 1000;
      const boot = root.querySelector<HTMLElement>('.boot-overlay');
      if (boot && elapsed < 1.5 && window.scrollY < 100) {
        const logs = boot.querySelectorAll('.boot-log');
        const intro = gsap.timeline();
        intro.fromTo(
          logs,
          { opacity: 0, y: 8 },
          { opacity: 1, y: 0, stagger: 0.15, duration: 0.15 },
          0,
        );
        intro.to(
          logs,
          {
            x: (index: number) => (index - 1) * 90,
            y: (index: number) => (index - 1) * 45,
            z: 240,
            opacity: 0,
            duration: 0.3,
          },
          1.05,
        );
        intro.to(boot, { opacity: 0, duration: 0.2 }, 1.3).set(boot, { display: 'none' }, 1.5);
        intro.seek(elapsed);
        gsap.fromTo(
          '.hero-art',
          { y: 26, opacity: 0.4 },
          { y: 0, opacity: 1, duration: Math.max(0.2, 1.5 - elapsed), ease: 'power3.out' },
        );
      }

      const hero = root.querySelector<HTMLElement>('.hero-visual')!;
      const target = hero.querySelector<HTMLElement>('.hero-parallax')!;
      const xTo = gsap.quickTo(target, 'x', { duration: 0.6, ease: 'power2.out' });
      const yTo = gsap.quickTo(target, 'y', { duration: 0.6, ease: 'power2.out' });
      const pointer = (event: PointerEvent) => {
        if (event.pointerType !== 'mouse') return;
        const rect = hero.getBoundingClientRect();
        xTo(((event.clientX - rect.left) / rect.width - 0.5) * 12);
        yTo(((event.clientY - rect.top) / rect.height - 0.5) * 12);
      };
      const leave = () => {
        xTo(0);
        yTo(0);
      };
      hero.addEventListener('pointermove', pointer);
      hero.addEventListener('pointerleave', leave);
      return () => {
        hero.removeEventListener('pointermove', pointer);
        hero.removeEventListener('pointerleave', leave);
        root.dataset.motion = 'flow';
        root.dataset.scrollTriggers = String(
          ScrollTrigger.getAll().filter((trigger) => trigger.vars.id === 'interest-deck').length,
        );
        section.style.removeProperty('--deck-height');
        restore();
      };
    },
    root,
  );
  return () => {
    mm.revert();
    root.dataset.motion = 'flow';
  };
}
