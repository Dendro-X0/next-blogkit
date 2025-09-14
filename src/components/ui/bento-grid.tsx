import { cn } from "@/lib/utils/utils";
import { ArrowRightIcon } from "@radix-ui/react-icons";
import type { ReactNode } from "react";
import type { IconType } from "react-icons";

const BentoGrid = ({ children, className }: { children: ReactNode; className?: string }) => {
  return (
    <div
      className={cn(
        "grid w-full auto-rows-[16rem] grid-cols-1 gap-4 md:auto-rows-[22rem] md:grid-cols-3",
        className,
      )}
    >
      {children}
    </div>
  );
};

const BentoCard = ({
  name,
  className,
  background,
  Icon,
  description,
  href,
  cta,
}: {
  name: string;
  className: string;
  background: ReactNode;
  Icon: IconType;
  description: string;
  href: string;
  cta: string;
}) => {
  return (
    <div
      key={name}
      className={cn(
        "group relative col-span-3 flex flex-col justify-between overflow-hidden rounded-xl border",
        // Tokenized border color
        "border-border",
        // Subtle shadow on hover
        "transition-all duration-300 hover:shadow-lg",
        // Smooth hover outline
        "hover:[box-shadow:0_0_0_1px_rgba(0,0,0,.03),0_2px_4px_rgba(0,0,0,.05),0_12px_24px_rgba(0,0,0,.05)]",
        "dark:hover:[box-shadow:0_0_0_1px_rgba(255,255,255,.1),0_2px_4px_rgba(255,255,255,.05),0_12px_24px_rgba(255,255,255,.05)]",
        className,
      )}
    >
      {/* Base minimalist gradient responsive to theme */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-[hsl(var(--background))] to-[hsl(var(--muted))]" />
      {/* Optional per-card accent background overlay from props */}
      <div className="absolute inset-0 -z-10 mix-blend-overlay opacity-60">{background}</div>
      <div className="pointer-events-none z-10 flex transform-gpu flex-col gap-1 p-6 transition-all duration-300 group-hover:-translate-y-4">
        <Icon className="h-12 w-12 origin-left transform-gpu text-foreground/80 transition-all duration-300 ease-in-out group-hover:scale-75" />
        <h3 className="text-xl font-semibold text-foreground">{name}</h3>
        <p className="max-w-lg text-muted-foreground">{description}</p>
      </div>

      <div
        className={cn(
          "pointer-events-none absolute bottom-0 flex w-full translate-y-10 transform-gpu flex-row items-center p-4 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100",
        )}
      >
        <button type="button" className="pointer-events-auto">
          <a
            href={href}
            className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            {cta}
            <ArrowRightIcon />
          </a>
        </button>
      </div>
    </div>
  );
};

export { BentoCard, BentoGrid };
