"use client";

import { PencilSimpleIcon } from "@phosphor-icons/react";
import { useRef, useState } from "react";

/**
 * Texto que vira campo ao clicar. Enter ou sair do campo salva, Esc cancela,
 * e salvar vazio mantém o valor anterior.
 */
export function CampoEditavel(props: {
  valor: string;
  onSalvar: (novo: string) => void;
  rotulo: string;
  placeholder?: string;
  className?: string;
  maximo?: number;
}) {
  const [editando, setEditando] = useState(false);
  const [rascunho, setRascunho] = useState(props.valor);
  const fechado = useRef(true);

  const abrir = () => {
    setRascunho(props.valor);
    fechado.current = false;
    setEditando(true);
  };

  // Enter e sair do campo salvam; Esc descarta. O guarda evita salvar duas vezes (Enter seguido de blur).
  const fechar = (salvar: boolean, texto = rascunho) => {
    if (fechado.current) return;
    fechado.current = true;
    setEditando(false);
    if (!salvar) return;
    const limpo = texto.trim().slice(0, props.maximo ?? 60);
    if (limpo && limpo !== props.valor) props.onSalvar(limpo);
  };

  if (editando) {
    return (
      <input
        autoFocus
        value={rascunho}
        aria-label={props.rotulo}
        maxLength={props.maximo ?? 60}
        onChange={(e) => setRascunho(e.target.value)}
        onFocus={(e) => e.currentTarget.select()}
        onBlur={(e) => fechar(true, e.currentTarget.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") fechar(true, e.currentTarget.value);
          if (e.key === "Escape") fechar(false);
        }}
        className={`-mx-1.5 w-[calc(100%+0.75rem)] rounded-badge border border-acento bg-superficie px-1.5 outline-none ${props.className ?? ""}`}
      />
    );
  }

  return (
    <button
      type="button"
      onClick={abrir}
      aria-label={`${props.rotulo}: ${props.valor || "vazio"}. Editar`}
      className={`group -mx-1.5 flex w-[calc(100%+0.75rem)] min-w-0 items-center gap-1.5 rounded-badge px-1.5 text-left transition-colors hover:bg-superficie-2 ${props.className ?? ""}`}
    >
      <span className={`truncate ${props.valor ? "" : "text-tinta-3"}`}>{props.valor || props.placeholder}</span>
      <PencilSimpleIcon size={13} className="shrink-0 text-tinta-3 opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100" aria-hidden />
    </button>
  );
}
