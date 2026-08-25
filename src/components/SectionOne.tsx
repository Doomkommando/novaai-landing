import { ChevronRight } from "lucide-react";
import { Reveal } from "./Reveal";
import { Magnetic } from "./Magnetic";
import { useEffect, useRef, useState } from "react";
import { gsap, prefersReducedMotion } from "../lib/gsap";

const SERVICES = ["/ AUTOMATISATION IA", "/ INTÉGRATION IA", "/ DÉVELOPPEMENT D'AGENTS IA"];

const PORTRAIT_URL =
  "https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260728_050334_5b076e26-0ce7-4898-b432-d764190e448f.png&w=1280&q=85";

export function SectionOne() {
  const [portraitLoaded, setPortraitLoaded] = useState(false);
  const sectionRef = useRef<HTMLElement | null>(null);
  const servicesRef = useRef<HTMLDivElement | null>(null);
  const headlineRef = useRef<HTMLDivElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);

  // Scroll parallax: the service list drifts slightly faster than the
  // headline, and the whole hero gently recedes (fades + scales down)
  // as it scrolls out from under the fixed video, reinforcing depth.
  useEffect(() => {
    if (prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      gsap.to(servicesRef.current, {
        yPercent: -30,
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });

      gsap.to(headlineRef.current, {
        yPercent: -12,
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });

      gsap.to(contentRef.current, {
        opacity: 0,
        scale: 0.97,
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "bottom 95%",
          end: "bottom 10%",
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
      <div ref={contentRef} className="flex flex-1 flex-col justify-between">
        {/* Top row */}
        <div className="flex flex-col gap-8 sm:flex-row sm:justify-between">
          <div ref={servicesRef} className="flex flex-col gap-2">
            {SERVICES.map((service, i) => (
              <Reveal delay={150 + i * 120} key={service}>
                <span className="font-mono text-xs uppercase tracking-[0.15em] text-white/90 drop-shadow-md">
                  {service}
                </span>
              </Reveal>
            ))}
          </div>

          <Reveal delay={300} className="max-w-xs sm:text-right">
            <p className="text-lg leading-relaxed text-white drop-shadow-md sm:text-xl">
              Nous concevons des automatisations qui apportent clarté, précision et efficacité à la
              façon dont votre entreprise fonctionne.
            </p>
          </Reveal>
        </div>

        {/* Bottom row */}
        <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <div ref={headlineRef}>
            <Reveal delay={150}>
              <div className="mb-5 inline-block border-l-2 border-white bg-white/15 px-3 py-1.5 backdrop-blur-md">
                <span className="font-mono text-[11px] uppercase tracking-[0.15em]">
                  Plus de 100 entreprises automatisées
                </span>
              </div>
            </Reveal>
            <Reveal delay={280}>
              <h1 className="text-5xl font-normal leading-[1.05] tracking-tight text-white drop-shadow-lg sm:text-6xl lg:text-7xl">
                Clair. Précis.
                <br />
                Automatisé.
              </h1>
            </Reveal>
          </div>

          <Reveal delay={420}>
            <div className="idle-float flex items-center gap-4 rounded-xl bg-white/15 p-3 backdrop-blur-md">
              <img
                src={PORTRAIT_URL}
                alt="Camille, cofondatrice de Lucide"
                width={80}
                height={96}
                loading="eager"
                fetchPriority="high"
                decoding="async"
                onLoad={() => setPortraitLoaded(true)}
                className={`h-24 w-20 rounded-lg bg-white/10 object-cover transition-opacity duration-300 ${
                  portraitLoaded ? "opacity-100" : "opacity-0"
                }`}
              />
              <div className="flex flex-col gap-1.5 pr-2">
                <span className="text-sm font-medium text-white">Parler avec Camille</span>
                <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-white/60">
                  Cofondatrice de Lucide
                </span>
                <Magnetic
                  href="#"
                  strength={0.35}
                  className="mt-1.5 inline-flex w-fit items-center gap-1 rounded-full bg-white px-4 py-2 text-xs font-medium text-black transition-colors duration-300 hover:bg-white/85"
                >
                  Réserver un appel de 15 min
                  <ChevronRight size={14} />
                </Magnetic>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
