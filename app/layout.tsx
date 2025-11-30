import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";
import LogoutButton from "@/components/LogoutButton";
import { requireUser } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Painel de Aprovação",
  description: "Centro de decisões para o app.",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();
  const isDeveloper = user?.role === "developer";
  return (
    <html lang="pt-BR">
      <body>
        <div className="min-h-screen bg-gradient-to-b from-white via-slate-50 to-slate-100 text-slate-900">
          <header className="border-b border-slate-200 bg-white/90 backdrop-blur">
            <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-500/10 ring-1 ring-brand-500/40">
                  <span className="text-xs font-semibold text-brand-200">
                    AP
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold tracking-tight">
                    Painel de Aprovação
                  </span>
                  <span className="text-xs text-slate-400">
                    Decisões rápidas, tudo em um lugar.
                  </span>
                </div>
              </div>

              {user && (
                <div className="flex items-center gap-3">
                  <nav className="flex gap-3 text-sm">
                    <Link
                      href="/"
                      className="rounded-full px-3 py-1 font-medium text-brand-700 ring-1 ring-brand-200 bg-brand-50 hover:bg-brand-100"
                    >
                      Pendentes
                    </Link>
                    <Link
                      href="/history"
                      className="rounded-full px-3 py-1 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition"
                    >
                      Histórico
                    </Link>
                    {isDeveloper && (
                      <Link
                        href="/admin"
                        className="rounded-full px-3 py-1 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition"
                      >
                        Admin
                      </Link>
                    )}
                  </nav>
                  <LogoutButton />
                </div>
              )}
            </div>
          </header>

          <main className="mx-auto max-w-5xl px-4 py-6">{children}</main>

          <footer className="border-t border-slate-200 py-3 text-center text-xs text-slate-500 bg-white/80">
            Painel interno · uso entre você e seu sócio
          </footer>
        </div>
      </body>
    </html>
  );
}
