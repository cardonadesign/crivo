"use client";

import { aplicarPreferencia, EVENTO_TEMA, lerPreferencia, type PreferenciaTema } from "@/lib/tema";
import { DesktopIcon, MoonIcon, SunIcon } from "@phosphor-icons/react";
import { useSyncExternalStore } from "react";

function assinar(avisar: () => void) {
  window.addEventListener(EVENTO_TEMA, avisar);
  window.addEventListener("storage", avisar);
  return () => {
    window.removeEventListener(EVENTO_TEMA, avisar);
    window.removeEventListener("storage", avisar);
  };
}

const OPCOES: { valor: PreferenciaTema; rotulo: string; Icone: typeof SunIcon }[] = [
  { valor: "sistema", rotulo: "Tema do sistema", Icone: DesktopIcon },
  { valor: "claro", rotulo: "Tema claro", Icone: SunIcon },
  { valor: "escuro", rotulo: "Tema escuro", Icone: MoonIcon },
];

/** Controle segmentado Sistema / Claro / Escuro. A escolha fica salva neste navegador. */
export function SeletorTema() {
  const pref = useSyncExternalStore<PreferenciaTema>(assinar, lerPreferencia, () => "sistema");

  return (
    <div role="radiogroup" aria-label="Tema" className="inline-flex items-center rounded-controle bg-superficie-2 p-0.5">
      {OPCOES.map(({ valor, rotulo, Icone }) => {
        const on = pref === valor;
        return (
          <button
            key={valor}
            type="button"
            role="radio"
            aria-checked={on}
            aria-label={rotulo}
            title={rotulo}
            onClick={() => aplicarPreferencia(valor)}
            className={`grid h-7 w-7 place-items-center rounded-[5px] transition-colors ${
              on ? "bg-superficie text-tinta shadow-painel" : "text-tinta-3 hover:text-tinta"
            }`}
          >
            <Icone size={15} weight={on ? "fill" : "regular"} aria-hidden />
          </button>
        );
      })}
    </div>
  );
}
