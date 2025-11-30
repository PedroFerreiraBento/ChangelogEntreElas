"use client";

import { useEffect, useState } from "react";

type Option = {
  id: number;
  label: string;
  image_url: string | null;
};

type Decision = {
  id: number;
  title: string;
  description: string | null;
  created_at: string;
  options: Option[];
};

export default function PendingDecisionsPage() {
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Record<number, number | null>>({});
  const [comments, setComments] = useState<Record<number, string>>({});
  const [submittingId, setSubmittingId] = useState<number | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/decisions/pending");

        if (res.status === 401) {
          window.location.href = "/login";
          return;
        }

        if (!res.ok) {
          console.error("Erro ao carregar decisões pendentes", res.status);
          return;
        }

        const data: Decision[] = await res.json();
        setDecisions(data);
      } catch (error) {
        console.error("Erro ao buscar decisões pendentes", error);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function handleApprove(decision: Decision) {
    const optionId = selected[decision.id];
    if (!optionId) {
      alert("Escolha um dos layouts antes de confirmar.");
      return;
    }

    setSubmittingId(decision.id);
    try {
      await fetch(`/api/decisions/${decision.id}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          selectedOptionId: optionId,
          comment: comments[decision.id] || "",
        }),
      });

      // remove da lista de pendentes
      setDecisions((prev) => prev.filter((d) => d.id !== decision.id));
    } catch (e) {
      console.error(e);
      alert("Erro ao salvar. Tente novamente.");
    } finally {
      setSubmittingId(null);
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <SkeletonCard />
        <SkeletonCard />
      </div>
    );
  }

  if (decisions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-16">
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-8 text-center shadow-sm shadow-slate-200">
          <p className="text-lg font-semibold text-slate-900">
            Nenhuma decisão pendente 🎉
          </p>
          <p className="mt-2 text-sm text-slate-600 max-w-md">
            Quando você criar novos layouts ou fluxos para aprovação, eles vão
            aparecer aqui automaticamente.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="mb-2">
        <h1 className="text-xl font-semibold tracking-tight">
          Decisões pendentes
        </h1>
        <p className="mt-1 text-sm text-slate-600 max-w-xl">
          Escolha o layout que você prefere em cada card abaixo e, se quiser,
          deixe um comentário rápido. Depois de confirmar, a decisão vai para o
          histórico.
        </p>
      </header>

      {decisions.map((d) => (
        <section
          key={d.id}
          className="rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 shadow-md shadow-slate-200 p-5 space-y-4"
        >
          {/* Cabeçalho do card */}
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold text-slate-900">
                {d.title}
              </h2>
              {d.description && (
                <p className="mt-1 text-sm text-slate-600 max-w-xl">
                  {d.description}
                </p>
              )}
            </div>
            <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-700 ring-1 ring-slate-200">
              Criado em{" "}
              {new Date(d.created_at).toLocaleDateString("pt-BR", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              })}
            </span>
          </div>

          {/* Grid de opções (layouts) */}
          <div className="grid gap-4 md:grid-cols-3">
            {d.options.map((opt) => {
              const isSelected = selected[d.id] === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() =>
                    setSelected((prev) => ({ ...prev, [d.id]: opt.id }))
                  }
                  className={`group flex flex-col overflow-hidden rounded-2xl border bg-white text-left transition
                    ${
                      isSelected
                        ? "border-brand-500/80 shadow-[0_0_0_1px_rgba(244,63,94,0.4)]"
                        : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                    }`}
                >
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100">
                    {opt.image_url ? (
                      // aqui você pode trocar por <Image> do next se quiser
                      <img
                        src={opt.image_url}
                        alt={opt.label}
                        className="h-full w-full object-cover transition duration-200 group-hover:scale-[1.02]"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xs text-slate-500">
                        Sem imagem
                      </div>
                    )}
                    {isSelected && (
                      <div className="pointer-events-none absolute inset-0 border-2 border-brand-500/80 ring-2 ring-brand-500/40" />
                    )}
                  </div>
                  <div className="flex items-center justify-between px-3 py-2">
                    <div className="flex items-center gap-2 text-sm">
                      <span
                        className={`flex h-4 w-4 items-center justify-center rounded-full border text-[10px] ${
                          isSelected
                            ? "border-brand-500 bg-brand-500 text-white"
                            : "border-slate-300 text-transparent"
                        }`}
                      >
                        ✓
                      </span>
                      <span
                        className={
                          isSelected
                            ? "font-medium text-slate-900"
                            : "text-slate-700"
                        }
                      >
                        {opt.label}
                      </span>
                    </div>
                    <span className="text-[11px] uppercase tracking-wide text-slate-500">
                      Layout
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Comentário */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-700">
              Comentário rápido (opcional)
            </label>
            <textarea
              className="w-full rounded-2xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500/70"
              placeholder="Ex.: Prefiro esse porque deixa a tela mais limpa, ou quero mudar a posição do botão de entrar..."
              value={comments[d.id] || ""}
              onChange={(e) =>
                setComments((prev) => ({ ...prev, [d.id]: e.target.value }))
              }
            />
          </div>

          {/* Botão de confirmar */}
          <div className="flex items-center justify-between gap-3 pt-2">
            <p className="text-xs text-slate-500">
              Assim que você confirmar, essa decisão sai desta lista e vai para
              o histórico.
            </p>
            <button
              onClick={() => handleApprove(d)}
              disabled={submittingId === d.id}
              className="inline-flex items-center gap-2 rounded-full bg-brand-500 px-4 py-2 text-sm font-semibold text-slate-50 shadow-lg shadow-brand-500/40 transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {submittingId === d.id ? "Salvando..." : "Confirmar decisão"}
            </button>
          </div>
        </section>
      ))}
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-2xl border border-slate-200 bg-white p-5 space-y-4">
      <div className="flex justify-between gap-3">
        <div className="h-4 w-40 rounded bg-slate-200" />
        <div className="h-4 w-28 rounded-full bg-slate-200" />
      </div>
      <div className="h-3 w-64 rounded bg-slate-200" />
      <div className="grid gap-3 md:grid-cols-3">
        <div className="h-32 rounded-2xl bg-slate-100" />
        <div className="h-32 rounded-2xl bg-slate-100" />
        <div className="h-32 rounded-2xl bg-slate-100" />
      </div>
      <div className="h-10 rounded-2xl bg-slate-100" />
    </div>
  );
}
