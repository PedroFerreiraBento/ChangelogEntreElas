"use client";

import { useEffect, useState } from "react";

type AdminOption = {
  id?: number;
  label: string;
  image_url?: string | null;
  sort_order?: number;
};

type AdminDecision = {
  id: number;
  title: string;
  description: string | null;
  status: string;
  created_at: string;
  options: AdminOption[];
};

export default function AdminPage() {
  const [decisions, setDecisions] = useState<AdminDecision[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [creating, setCreating] = useState(false);

  // formulário de criação
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newOptions, setNewOptions] = useState<AdminOption[]>([
    { label: "Layout 1", image_url: "" },
  ]);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/admin/decisions");
        if (res.status === 403 || res.status === 401) {
          window.location.href = "/login";
          return;
        }
        if (!res.ok) {
          setErrorMsg("Erro ao carregar decisões.");
          return;
        }
        const data: AdminDecision[] = await res.json();
        setDecisions(data);
      } catch (e) {
        setErrorMsg("Erro ao carregar decisões.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function handleCreate() {
    setErrorMsg("");
    if (!newTitle.trim()) {
      setErrorMsg("Título obrigatório.");
      return;
    }
    if (!newOptions.some((o) => o.label.trim())) {
      setErrorMsg("Crie pelo menos uma opção com rótulo.");
      return;
    }

    setCreating(true);
    try {
      const res = await fetch("/api/admin/decisions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTitle,
          description: newDescription,
          options: newOptions.map((o, idx) => ({
            label: o.label,
            image_url: o.image_url || null,
            sort_order: idx,
          })),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setErrorMsg(data.error || "Erro ao criar decisão.");
        return;
      }

      // reload simples
      const refreshed = await fetch("/api/admin/decisions").then((r) =>
        r.json()
      );
      setDecisions(refreshed);
      setNewTitle("");
      setNewDescription("");
      setNewOptions([{ label: "Layout 1", image_url: "" }]);
    } catch (e) {
      setErrorMsg("Erro inesperado ao criar decisão.");
    } finally {
      setCreating(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Tem certeza que deseja excluir esta decisão?")) return;
    await fetch(`/api/admin/decisions/${id}`, { method: "DELETE" });
    setDecisions((prev) => prev.filter((d) => d.id !== id));
  }

  async function handleUpdate(decision: AdminDecision) {
    const res = await fetch(`/api/admin/decisions/${decision.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: decision.title,
        description: decision.description,
        status: decision.status,
        options: decision.options.map((o, idx) => ({
          label: o.label,
          image_url: o.image_url || null,
          sort_order: o.sort_order ?? idx,
        })),
      }),
    });

    if (!res.ok) {
      alert("Erro ao salvar edição.");
    } else {
      alert("Decisão atualizada.");
    }
  }

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-xl font-semibold tracking-tight">
          Área do desenvolvedor
        </h1>
        <p className="mt-1 text-sm text-slate-600 max-w-2xl">
          Aqui você cria, edita e exclui decisões que vão aparecer para o seu
          sócio aprovar. Somente contas com perfil de desenvolvedor têm acesso a
          esta página.
        </p>
      </header>

      {/* Formulário de criação */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4 shadow-sm shadow-slate-200">
        <h2 className="text-sm font-semibold text-slate-900">
          Criar nova decisão
        </h2>

        {errorMsg && (
          <p className="text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-xl px-3 py-2">
            {errorMsg}
          </p>
        )}

        <div className="space-y-2">
          <label className="text-xs font-medium text-slate-700">Título</label>
          <input
            className="w-full rounded-2xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500/70"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Ex.: Formulário de Autenticação"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-medium text-slate-700">
            Descrição (opcional)
          </label>
          <textarea
            className="w-full rounded-2xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500/70"
            rows={2}
            value={newDescription}
            onChange={(e) => setNewDescription(e.target.value)}
            placeholder="Contexto rápido sobre o que está sendo decidido..."
          />
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-300">
              Opções de layout
            </span>
            <button
              type="button"
              onClick={() =>
                setNewOptions((prev) => [
                  ...prev,
                  { label: `Layout ${prev.length + 1}`, image_url: "" },
                ])
              }
              className="text-xs text-brand-300 hover:text-brand-200"
            >
              + adicionar opção
            </button>
          </div>

          <div className="space-y-3">
            {newOptions.map((opt, idx) => (
              <div
                key={idx}
                className="flex flex-col gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-3 md:flex-row md:items-center"
              >
                <div className="flex-1 space-y-1">
                  <input
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500/70"
                    value={opt.label}
                    onChange={(e) => {
                      const v = e.target.value;
                      setNewOptions((prev) =>
                        prev.map((o, i) => (i === idx ? { ...o, label: v } : o))
                      );
                    }}
                    placeholder={`Rótulo (ex.: Layout ${idx + 1})`}
                  />
                  <input
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500/70"
                    value={opt.image_url || ""}
                    onChange={(e) => {
                      const v = e.target.value;
                      setNewOptions((prev) =>
                        prev.map((o, i) =>
                          i === idx ? { ...o, image_url: v } : o
                        )
                      );
                    }}
                    placeholder="URL da imagem do layout (print do Figma, por exemplo)"
                  />
                </div>
                {newOptions.length > 1 && (
                  <button
                    type="button"
                    onClick={() =>
                      setNewOptions((prev) => prev.filter((_, i) => i !== idx))
                    }
                    className="mt-2 text-xs text-slate-500 hover:text-rose-500 md:mt-0"
                  >
                    Remover
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="pt-2">
          <button
            type="button"
            disabled={creating}
            onClick={handleCreate}
            className="inline-flex items-center gap-2 rounded-2xl bg-brand-500 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-brand-500/40 transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {creating ? "Criando..." : "Criar decisão"}
          </button>
        </div>
      </section>

      {/* Lista de decisões existentes */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-slate-900">
          Decisões existentes
        </h2>

        {loading ? (
          <p className="text-sm text-slate-600">Carregando...</p>
        ) : decisions.length === 0 ? (
          <p className="text-sm text-slate-500">
            Nenhuma decisão criada ainda.
          </p>
        ) : (
          decisions.map((d, index) => (
            <EditableDecisionCard
              key={d.id}
              decision={d}
              onChange={(updated) =>
                setDecisions((prev) =>
                  prev.map((dec) => (dec.id === updated.id ? updated : dec))
                )
              }
              onSave={handleUpdate}
              onDelete={handleDelete}
              index={index + 1}
            />
          ))
        )}
      </section>
    </div>
  );
}

type CardProps = {
  decision: AdminDecision;
  onChange: (d: AdminDecision) => void;
  onSave: (d: AdminDecision) => void;
  onDelete: (id: number) => void;
  index: number;
};

function EditableDecisionCard({
  decision,
  onChange,
  onSave,
  onDelete,
  index,
}: CardProps) {
  return (
    <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-200">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-2 flex-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-xs text-slate-600 ring-1 ring-slate-200">
              {index}
            </span>
            <input
              className="flex-1 rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500/70"
              value={decision.title}
              onChange={(e) => onChange({ ...decision, title: e.target.value })}
            />
          </div>
          <textarea
            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500/70"
            value={decision.description || ""}
            onChange={(e) =>
              onChange({ ...decision, description: e.target.value })
            }
            placeholder="Descrição (opcional)"
          />
        </div>

        <select
          className="rounded-full border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-800 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500/70"
          value={decision.status}
          onChange={(e) => onChange({ ...decision, status: e.target.value })}
        >
          <option value="pending">Pendente</option>
          <option value="decided">Decidido</option>
          <option value="implemented">Implementado</option>
        </select>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-700">
            Opções de layout
          </span>
          <button
            type="button"
            onClick={() =>
              onChange({
                ...decision,
                options: [
                  ...decision.options,
                  {
                    label: `Layout ${decision.options.length + 1}`,
                    image_url: "",
                  },
                ],
              })
            }
            className="text-xs text-brand-300 hover:text-brand-200"
          >
            + adicionar opção
          </button>
        </div>
        <div className="space-y-2">
          {decision.options.map((opt, idx) => (
            <div
              key={idx}
              className="flex flex-col gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-3 md:flex-row md:items-center"
            >
              <div className="flex-1 space-y-1">
                <input
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500/70"
                  value={opt.label}
                  onChange={(e) => {
                    const v = e.target.value;
                    onChange({
                      ...decision,
                      options: decision.options.map((o, i) =>
                        i === idx ? { ...o, label: v } : o
                      ),
                    });
                  }}
                  placeholder={`Rótulo (ex.: Layout ${idx + 1})`}
                />
                <input
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500/70"
                  value={opt.image_url || ""}
                  onChange={(e) => {
                    const v = e.target.value;
                    onChange({
                      ...decision,
                      options: decision.options.map((o, i) =>
                        i === idx ? { ...o, image_url: v } : o
                      ),
                    });
                  }}
                  placeholder="URL da imagem"
                />
              </div>
              {decision.options.length > 1 && (
                <button
                  type="button"
                  onClick={() =>
                    onChange({
                      ...decision,
                      options: decision.options.filter((_, i) => i !== idx),
                    })
                  }
                  className="mt-2 text-xs text-slate-500 hover:text-rose-300 md:mt-0"
                >
                  Remover
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between pt-2">
        <button
          type="button"
          onClick={() => onDelete(decision.id)}
          className="text-xs text-rose-600 hover:text-rose-500"
        >
          Excluir decisão
        </button>
        <button
          type="button"
          onClick={() => onSave(decision)}
          className="inline-flex items-center rounded-full bg-slate-800 px-4 py-1.5 text-xs font-semibold text-white hover:bg-slate-900"
        >
          Salvar alterações
        </button>
      </div>
    </div>
  );
}
