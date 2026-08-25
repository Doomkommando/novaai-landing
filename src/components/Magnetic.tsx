import type { ReactNode, ElementType, ComponentPropsWithoutRef } from "react";
import { useMagnetic } from "../hooks/useMagnetic";

interface MagneticProps {
  children: ReactNode;
  className?: string;
  strength?: number;
  as?: ElementType;
  [key: string]: unknown;
}

/**
 * Wraps interactive elements (buttons, links) with a magnetic hover pull.
 */
export function Magnetic({
  children,
  className = "",
  strength = 0.3,
  as: Tag = "a",
  ...rest
}: MagneticProps & ComponentPropsWithoutRef<"a">) {
  const ref = useMagnetic<HTMLElement>(strength);

  return (
    <Tag ref={ref} className={className} {...rest}>
      {children}
    </Tag>
  );
}
