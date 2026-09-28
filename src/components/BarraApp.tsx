"use client";

import { SITE } from "@/lib/site";
import { BookOpenTextIcon, GithubLogoIcon, ListIcon, PlusIcon, XIcon } from "@phosphor-icons/react";
import Link from "next/link";
import { Logo } from "./Marca";
import { SeletorTema } from "./SeletorTema";

export function BarraApp(props: {
  onNova: () => void;
  menuAberto: boolean;
  onMenu: (aberto: boolean) => void;
}) {
  const icone =
    "inline-flex h-8 items-center gap-1.5 rounded-controle px-2 text-[13px] text-tinta-2 transition-colors hover:bg-superficie-2 hover:text-tinta";
  return (
    <header className="flex h-12 shrink-0 items-center justify-between gap-3 border-b border-linha bg-superficie px-3">
      <div className="flex items-center gap-1">
        <button
          type="button"
          className={`${icone} lg:hidden`}
          onClick={() => props.onMenu(!props.menuAberto)}
          aria-expanded={props.menuAberto}
          aria-label={props.menuAberto ? "Fechar lista de análises" : "Abrir lista de análises"}
        >
          {props.menuAberto ? <XIcon size={18} aria-hidden /> : <ListIcon size={18} aria-hidden />}
        </button>
        <span className="flex items-center px-1.5">
          <Logo altura={20} />
        </span>
        <span className="mx-2 hidden h-5 w-px bg-linha sm:block" aria-hidden />
        <button
          type="button"
          onClick={props.onNova}
          className={`${icone} whitespace-nowrap font-medium text-tinta`}
          aria-label="Nova análise"
        >
          <PlusIcon size={16} aria-hidden />
          <span className="hidden sm:inline">Nova análise</span>
        </button>
      </div>
      <nav className="flex items-center gap-0.5">
        <span className="mr-1.5">
          <SeletorTema />
        </span>
        <Link href="/como-funciona" className={icone}>
          <BookOpenTextIcon size={16} aria-hidden />
          <span className="hidden sm:inline">Como funciona</span>
        </Link>
        <a href={SITE.repo} target="_blank" rel="noreferrer" className={icone} aria-label="Código no GitHub">
          <GithubLogoIcon size={16} aria-hidden />
          <span className="hidden sm:inline">Código</span>
        </a>
      </nav>
    </header>
  );
}
