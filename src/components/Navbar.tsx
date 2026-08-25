import { Hexagon } from "lucide-react";
import { Reveal } from "./Reveal";

const LINKS = [
  { label: "Projects", sup: "6" },
  { label: "About" },
  { label: "Blog" },
  { label: "Contact" },
];

export function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/15">
      <div className="flex items-center justify-between px-5 py-4 sm:px-8 md:px-12">
        <Reveal delay={0}>
          <div className="flex items-center gap-2">
            <Hexagon size={24} strokeWidth={1.5} className="text-white" />
            <span className="text-lg sm:text-xl font-medium tracking-tight text-white">
              novaai
            </span>
          </div>
        </Reveal>

        <div className="hidden md:flex items-center gap-8 lg:gap-10">
          {LINKS.map((link, i) => (
            <Reveal delay={100 + i * 100} key={link.label}>
              <a
                href="#"
                className="flex items-center gap-1 text-sm text-white/85 transition-colors duration-300 hover:text-white"
              >
                {link.label}
                {link.sup && (
                  <sup className="font-mono text-[10px] text-white/60">{link.sup}</sup>
                )}
              </a>
            </Reveal>
          ))}
        </div>

        <Reveal delay={500}>
          <a
            href="#"
            className="rounded-md border border-white/20 bg-white/15 px-4 py-2 text-xs backdrop-blur-md transition-colors duration-300 hover:bg-white/25 sm:px-5 sm:text-sm"
          >
            Get Free Consultation
          </a>
        </Reveal>
      </div>
    </nav>
  );
}
