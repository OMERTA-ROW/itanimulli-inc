import type { ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

export function FormField({ id, label, children, hint }: { id: string; label: string; children: ReactNode; hint?: string }) {
  return (
    <div className="grid gap-3">
      <Label htmlFor={id} className="document-label text-xs text-primary">{label}</Label>
      {children}
      {hint ? <p className="text-xs text-primary/65">{hint}</p> : null}
    </div>
  );
}

export function StatusLine({ tone = "info", children }: { tone?: "info" | "error"; children: ReactNode }) {
  return (
    <p role={tone === "error" ? "alert" : "status"} className={tone === "error" ? "border border-destructive px-4 py-3 text-sm text-destructive" : "border border-primary/55 px-4 py-3 text-sm text-primary"}>
      {children}
    </p>
  );
}

export function Panel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="border border-primary/45 p-6 sm:p-8">
      <h2 className="document-title text-xl">{title}</h2>
      <div className="mt-6 grid gap-6">{children}</div>
    </section>
  );
}

export function SignOutButton() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  return (
    <Button
      type="button"
      variant="outline"
      onClick={async () => {
        await queryClient.cancelQueries();
        queryClient.clear();
        await supabase.auth.signOut();
        navigate({ to: "/auth", replace: true });
      }}
    >
      Sign Out
    </Button>
  );
}
