import { ChevronRight } from "lucide-react";
import { Reveal } from "./Reveal";
import { Magnetic } from "./Magnetic";
import { useEffect, useRef } from "react";
import { gsap, prefersReducedMotion } from "../lib/gsap";

const CAPABILITIES = [
  {
    index: "01",
    title: "Vision en temps réel",
    body: "Lit le contexte au fil de l'eau et fait remonter l'essentiel avant même que vous demandiez.",
  },
  {
    index: "02",
    title: "Analyse en couches",
    body: "Passe d'une ébauche brute à un résultat précis sans jamais perdre le fil.",
  },
  {
    index: "03",
    title: "Vitesse adaptative",
    body: "Apprend votre rythme et affine chaque passage au fil du travail.",
  },
];

export function SectionTwo() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const headlineColRef = useRef<HTMLDivElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);

  // Subtle parallax depth between the headline column and the capability
  // panel as the section crosses the viewport.
  useEffect(() => {
    if (prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      gsap.to(headlineColRef.current, {
        yPercent: -8,
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        },
      });

      gsap.to(panelRef.current, {
        yPercent: -18,
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="flex min-h-screen supports-[height:100svh]:min-h-[100svh] flex-col justify-between px-5 pt-24 pb-12 sm:px-8 sm:pt-28 md:px-12 md:pb-16"
    >
      {/* Top row */}
      <div className="flex flex-col gap-8 sm:flex-row sm:justify-between">
        <Reveal delay={120}>
          <div className="inline-block border-l-2 border-white bg-white/15 px-3 py-1.5 backdrop-blur-md">
            <span className="font-mono text-[11px] uppercase tracking-[0.15em]">
              L'analyse à la demande
            </span>
          </div>
        </Reveal>

        <Reveal delay={220} className="max-w-sm sm:text-right">
          <p className="text-lg leading-relaxed text-white drop-shadow-md sm:text-xl">
            Notre IA ne se contente pas de répondre — elle interprète, affine et livre le signal
            dont vous avez besoin.
          </p>
        </Reveal>
      </div>

      {/* Bottom area */}
      <div className="flex flex-1 flex-col justify-end gap-12 md:flex-row md:items-end md:justify-between md:gap-16">
        <div ref={headlineColRef} className="max-w-xl">
          <Reveal delay={180}>
            <h2 className="text-5xl font-normal leading-[1.05] tracking-tight text-white drop-shadow-lg sm:text-6xl lg:text-7xl">
              Apprendre à voir
              <br />
              brillamment.
            </h2>
          </Reveal>
          <Reveal delay={320}>
            <p className="mt-6 max-w-md text-sm leading-relaxed text-white/80 drop-shadow-md sm:text-base">
              De la première esquisse au rendu final, Lucide transforme l'intention brute en
              décisions que votre équipe peut exploiter — discrètement, précisément, à la vitesse
              qu'il faut.
            </p>
          </Reveal>
          <Reveal delay={420}>
            <div className="mt-8 flex flex-wrap gap-3">
              <Magnetic
                href="#"
                strength={0.3}
                className="inline-flex items-center gap-1 rounded-full bg-white px-5 py-2.5 text-xs font-medium text-black transition-colors duration-300 hover:bg-white/85 sm:text-sm"
              >
                Lancer la démo
                <ChevronRight size={14} />
              </Magnetic>
              <Magnetic
                href="#"
                strength={0.3}
                className="inline-flex items-center gap-1 rounded-full border border-white/25 bg-white/10 px-5 py-2.5 text-xs backdrop-blur-md transition-colors duration-300 hover:bg-white/20 sm:text-sm"
              >
                Consultation gratuite
              </Magnetic>
            </div>
          </Reveal>
        </div>

        <div
          ref={panelRef}
          className="w-full max-w-md rounded-2xl border border-white/15 bg-white/10 px-5 backdrop-blur-md sm:px-6"
        >
          {CAPABILITIES.map((cap, i) => (
            <Reveal delay={300 + i * 110} key={cap.index}>
              <div
                className={`group flex gap-5 py-5 ${
                  i < CAPABILITIES.length - 1 ? "border-b border-white/15" : ""
                }`}
              >
                <span className="font-mono text-[11px] tracking-[0.15em] text-white/55">
                  {cap.index}
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-medium text-white sm:text-lg">{cap.title}</h3>
                    <ChevronRight
                      size={16}
                      className="text-white/40 transition-all duration-300 group-hover:translate-x-0.5 group-hover:text-white"
                    />
                  </div>
                  <p className="mt-1.5 text-sm leading-relaxed text-white/70">{cap.body}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
