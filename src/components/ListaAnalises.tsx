"use client";

import type { AnaliseLocal } from "@/lib/historico";
import { EXEMPLOS, type Exemplo } from "@/lib/site";
import { TrashIcon } from "@phosphor-icons/react";
import type { Atual } from "./tipos";

function Item(props: {
  ativo: boolean;
  thumb: string;
  titulo: string;
  sub: string;
  onClick: () => void;
  onRemover?: () => void;
}) {
  return (
    <li className="group relative">
      <button
        type="button"
        onClick={props.onClick}
        aria-current={props.ativo ? "true" : undefined}
        className={`flex w-full items-center gap-3 rounded-controle px-2 py-2 text-left transition-colors ${
          props.ativo ? "bg-superficie-2 text-tinta" : "text-tinta-2 hover:bg-superficie-2 hover:text-tinta"
        }`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={props.thumb}
          alt=""
          className="h-9 w-9 shrink-0 rounded-badge border border-linha bg-superficie object-cover object-top"
        />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[13px] font-medium">{props.titulo}</span>
          <span className="block truncate text-[12px] text-tinta-3">{props.sub}</span>
        </span>
      </button>
      {props.onRemover && (
        <button
          type="button"
          onClick={props.onRemover}
          aria-label={`Remover ${props.titulo} do histórico`}
          className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-badge p-1.5 text-tinta-3 opacity-0 transition-opacity hover:bg-superficie hover:text-erro focus-visible:opacity-100 group-hover:opacity-100"
        >
          <TrashIcon size={14} aria-hidden />
        </button>
      )}
    </li>
  );
}

export function ListaAnalises(props: {
  atual: Atual;
  historico: AnaliseLocal[];
  onExemplo: (e: Exemplo) => void;
  onLocal: (a: AnaliseLocal) => void;
  onRemover: (id: string) => void;
}) {
  const { atual } = props;
  return (
    <nav aria-label="Análises" className="space-y-6 p-3">
      <div>
        <h2 className="px-2 pb-1.5 text-[12px] font-medium text-tinta-3">Suas análises</h2>
        {props.historico.length === 0 ? (
          <p className="px-2 text-[12px] leading-relaxed text-tinta-3">
            As telas que você analisar ficam aqui, salvas só neste navegador.
          </p>
        ) : (
          <ul className="space-y-0.5">
            {props.historico.map((a) => (
              <Item
                key={a.id}
                ativo={atual.tipo === "local" && atual.id === a.id}
                thumb={a.imagem.src}
                titulo={a.nome}
                sub={new Date(a.criadoEm).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })}
                onClick={() => props.onLocal(a)}
                onRemover={() => props.onRemover(a.id)}
              />
            ))}
          </ul>
        )}
      </div>

      <div>
        <h2 className="px-2 pb-1.5 text-[12px] font-medium text-tinta-3">Exemplos</h2>
        <ul className="space-y-0.5">
          {EXEMPLOS.map((ex) => (
            <Item
              key={ex.id}
              ativo={atual.tipo === "exemplo" && atual.exemplo.id === ex.id}
              thumb={`/samples/${ex.id}.png`}
              titulo={ex.nome}
              sub={ex.tipo}
              onClick={() => props.onExemplo(ex)}
            />
          ))}
        </ul>
      </div>
    </nav>
  );
}
