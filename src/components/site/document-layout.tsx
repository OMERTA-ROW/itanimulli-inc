import { Link, useRouterState } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { useState, type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navigation = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/levels", label: "The Three Levels" },
  { to: "/donations", label: "Donations" },
  { to: "/join", label: "Membership" },
  { to: "/contact", label: "Contact" },
] as const;

export function Seal({ compact = false }: { compact?: boolean }) {
  return (
    <div
      className={cn(
        "grid shrink-0 place-items-center border border-primary/60 bg-background",
        compact ? "size-14 p-1.5" : "size-20 p-2 sm:size-24",
      )}
      aria-label="Itanimulli Inc. seal"
      role="img"
    >
      <div className="grid size-full place-items-center rounded-full bg-primary text-primary-foreground">
        <span className={cn("font-seal leading-none not-italic", compact ? "text-4xl" : "text-6xl")}>
          I
        </span>
      </div>
    </div>
  );
}

function SiteNavigation() {
  const [open, setOpen] = useState(false);
  const pathname = useRouterState({ select: (state) => state.location.pathname });

  return (
    <nav className="border-y border-primary/35" aria-label="Main navigation">
      <div className="flex items-center justify-between px-1 py-2 lg:hidden">
        <span className="document-label text-xs">Navigation</span>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => setOpen((current) => !current)}
          aria-expanded={open}
          aria-controls="mobile-navigation"
          aria-label={open ? "Close navigation" : "Open navigation"}
        >
          {open ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
        </Button>
      </div>
      <div
        id="mobile-navigation"
        className={cn(
          "flex-col border-t border-primary/25 px-1 py-2 lg:flex lg:flex-row lg:items-center lg:justify-center lg:gap-1 lg:border-0",
          open ? "flex" : "hidden",
        )}
      >
        {navigation.map((item) => {
          const active = pathname === item.to;
          return (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setOpen(false)}
              aria-current={active ? "page" : undefined}
              className={cn(
                "document-label px-4 py-3 text-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
                active ? "bg-primary text-primary-foreground" : "text-primary hover:bg-accent",
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export function DocumentPage({
  children,
  page,
  className,
}: {
  children: ReactNode;
  page: string;
  className?: string;
}) {
  return (
    <div className="min-h-screen bg-background p-2 text-primary sm:p-4">
      <div className="document-frame mx-auto min-h-[calc(100vh-1rem)] max-w-[96rem] sm:min-h-[calc(100vh-2rem)]">
        <div className="document-frame-inner flex min-h-[calc(100vh-1.75rem)] flex-col px-4 py-5 sm:min-h-[calc(100vh-2.75rem)] sm:px-8 sm:py-8 lg:px-14">
          <header>
            <div className="flex items-start justify-between gap-5 pb-7 sm:gap-8 sm:pb-9">
              <div className="min-w-0 pt-1">
                <Link to="/" className="document-label block text-base font-semibold text-primary sm:text-xl">
                  Itanimulli Inc.
                </Link>
                <p className="document-label mt-2 break-words text-[0.65rem] text-primary/75 sm:text-xs">
                  [Email Address Pending]
                </p>
              </div>
              <Seal />
            </div>
            <SiteNavigation />
          </header>

          <main className={cn("flex-1 py-12 sm:py-16 lg:py-20", className)}>{children}</main>

          <footer className="mt-8 border-t border-primary/35 pt-7 text-center">
            <p className="document-label text-[0.65rem] text-primary/70">Page {page}</p>
            <p className="document-label mx-auto mt-4 max-w-4xl text-[0.58rem] leading-5 text-primary/70 sm:text-[0.65rem]">
              [Address Pending] · [Phone Pending] · [Web Address Pending]
            </p>
            <p className="document-label mt-4 text-[0.58rem] text-primary/50">
              © Itanimulli Inc. · Conley, Georgia
            </p>
          </footer>
        </div>
      </div>
    </div>
  );
}

export function PageHeading({ eyebrow, title, children }: { eyebrow: string; title: string; children?: ReactNode }) {
  return (
    <header className="mx-auto max-w-5xl text-center">
      <p className="document-label text-xs text-primary/65">{eyebrow}</p>
      <h1 className="document-title mt-5 text-3xl font-medium text-primary sm:text-5xl lg:text-6xl">{title}</h1>
      {children ? <div className="document-copy mx-auto mt-8 max-w-4xl text-base sm:text-lg">{children}</div> : null}
    </header>
  );
}

export function DocumentSection({
  number,
  title,
  children,
}: {
  number?: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="border-t border-primary/45 py-12 sm:py-16">
      {number ? <p className="document-label text-xs text-primary/60">{number}</p> : null}
      <h2 className="document-title mt-3 text-2xl font-medium text-primary sm:text-4xl">{title}</h2>
      <div className="document-copy mt-8 max-w-5xl text-base sm:text-lg">{children}</div>
    </section>
  );
}

export function AsteriskList({ items }: { items: string[] }) {
  return (
    <ul className="my-8 grid gap-3" role="list">
      {items.map((item) => (
        <li key={item} className="flex gap-4">
          <span aria-hidden="true" className="shrink-0">*</span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export function PlaceholderNotice({ children }: { children: ReactNode }) {
  return (
    <p className="document-label border border-dashed border-primary/55 px-4 py-3 text-xs text-primary/70">
      {children}
    </p>
  );
}
