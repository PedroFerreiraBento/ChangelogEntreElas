"use client";

import { useEffect, useState } from "react";

type HistoryItem = {
  id: number;
  title: string;
  description: string | null;
  status: string;
  created_at: string;
  decided_at: string | null;
  comment: string | null;
  author: string | null;
  selected_option_label: string;
  selected_option_image: string | null;
};

export default function HistoryPage() {
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/decisions/history");

        if (res.status === 401) {
          window.location.href = "/login";
          return;
        }

        if (!res.ok) {
          console.error("Erro ao carregar histórico de decisões", res.status);
          return;
        }

        const data: HistoryItem[] = await res.json();
        setItems(data);
      } catch (error) {
        console.error("Erro ao buscar histórico de decisões", error);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        <SkeletonHistoryCard />
        <SkeletonHistoryCard />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-16">
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-8 text-center shadow-sm shadow-slate-200">
          <p className="text-lg font-semibold text-slate-900">
            Ainda não há decisões registradas
          </p>
          <p className="mt-2 text-sm text-slate-600 max-w-md">
            Assim que você começar a aprovar layouts e fluxos, o histórico
            completo das decisões vai aparecer aqui.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <header className="mb-2">
        <h1 className="text-xl font-semibold tracking-tight">
          Histórico de decisões
        </h1>
        <p className="mt-1 text-sm text-slate-600 max-w-xl">
          Veja o que já foi aprovado, qual layout foi escolhido e os comentários
          feitos em cada decisão.
        </p>
      </header>

      {items.map((item) => {
        const decidedAt = item.decided_at ? new Date(item.decided_at) : null;

        const createdAt = new Date(item.created_at);

        return (
          <section
            key={item.id}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-md shadow-slate-200 space-y-4"
          >
            {/* Cabeçalho */}
            <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
              <div>
                <h2 className="text-base font-semibold text-slate-900">
                  {item.title}
                </h2>
                {item.description && (
                  <p className="mt-1 text-sm text-slate-600 max-w-xl">
                    {item.description}
                  </p>
                )}
              </div>

              <div className="flex flex-col items-end gap-1 text-xs">
                <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-[11px] text-slate-700 ring-1 ring-slate-200">
                  Criado em{" "}
                  {createdAt.toLocaleDateString("pt-BR", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  })}
                </span>
                {decidedAt && (
                  <span className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-[11px] text-emerald-700 ring-1 ring-emerald-200">
                    Decidido em{" "}
                    {decidedAt.toLocaleDateString("pt-BR", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    })}{" "}
                    às{" "}
                    {decidedAt.toLocaleTimeString("pt-BR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                )}
              </div>
            </div>

            {/* Layout escolhido */}
            <div className="grid gap-4 md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
              <div className="space-y-2">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Layout escolhido
                </p>

                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                  {item.selected_option_image ? (
                    <img
                      src={item.selected_option_image}
                      alt={item.selected_option_label}
                      className="h-48 w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-48 items-center justify-center text-xs text-slate-500">
                      Sem imagem cadastrada para essa opção
                    </div>
                  )}
                  <div className="flex items-center justify-between px-4 py-2">
                    <span className="text-sm font-medium text-slate-900">
                      {item.selected_option_label}
                    </span>
                    <span className="text-[11px] uppercase tracking-wide text-slate-500">
                      Opção aprovada
                    </span>
                  </div>
                </div>
              </div>

              {/* Comentário */}
              <div className="space-y-2">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Comentário da decisão
                </p>
                {item.comment ? (
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800">
                    {item.comment}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500">
                    Nenhum comentário foi registrado para essa decisão.
                  </p>
                )}
                <p className="mt-2 text-[11px] text-slate-500">
                  {item.author
                    ? `Decisão registrada por ${item.author}.`
                    : "Decisão registrada pelo painel."}
                </p>
              </div>
            </div>

            {/* Status */}
            <div className="flex items-center justify-end gap-2 pt-2">
              <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-[11px] uppercase tracking-wide text-slate-600 ring-1 ring-slate-200">
                Status:{" "}
                {item.status === "implemented"
                  ? "Implementado no app"
                  : item.status === "decided"
                  ? "Aprovado, aguardando implementação"
                  : item.status}
              </span>
            </div>
          </section>
        );
      })}
    </div>
  );
}

function SkeletonHistoryCard() {
  return (
    <div className="animate-pulse rounded-2xl border border-slate-200 bg-white p-5 space-y-4">
      <div className="flex justify-between gap-3">
        <div className="h-4 w-40 rounded bg-slate-200" />
        <div className="h-4 w-36 rounded-full bg-slate-200" />
      </div>
      <div className="h-3 w-64 rounded bg-slate-200" />
      <div className="grid gap-4 md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
        <div className="h-40 rounded-2xl bg-slate-100" />
        <div className="space-y-2">
          <div className="h-4 w-32 rounded bg-slate-100" />
          <div className="h-16 rounded-2xl bg-slate-100" />
        </div>
      </div>
    </div>
  );
}
