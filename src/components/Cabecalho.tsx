"use client";

import { SITE } from "@/lib/site";
import { BookOpenTextIcon, GithubLogoIcon, MapTrifoldIcon } from "@phosphor-icons/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "./Marca";
import { SeletorTema } from "./SeletorTema";

export function Cabecalho() {
  const rota = usePathname();
  const link = (ativo: boolean) =>
    `inline-flex items-center gap-1.5 rounded-controle px-2 py-1.5 transition-colors sm:px-3 ${
      ativo ? "font-medium text-tinta" : "text-tinta-2 hover:text-tinta"
    }`;
  const paginas = [
    { href: "/roadmap", rotulo: "Roadmap", Icone: MapTrifoldIcon },
    { href: "/como-funciona", rotulo: "Como funciona", Icone: BookOpenTextIcon },
  ];

  return (
    <header className="sticky top-0 z-30 border-b border-linha bg-fundo/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center" aria-label="Crivo, abrir o espaço de trabalho">
          <Logo altura={22} />
        </Link>
        <nav className="flex items-center gap-1 text-[14px]">
          <span className="mr-1">
            <SeletorTema />
          </span>
          {paginas.map(({ href, rotulo, Icone }) => (
            <Link
              key={href}
              href={href}
              className={link(rota === href)}
              aria-current={rota === href ? "page" : undefined}
              aria-label={rotulo}
            >
              <Icone size={16} aria-hidden />
              <span className="hidden sm:inline">{rotulo}</span>
            </Link>
          ))}
          <a href={SITE.repo} target="_blank" rel="noreferrer" className={link(false)} aria-label="Código no GitHub">
            <GithubLogoIcon size={16} aria-hidden />
            <span className="hidden sm:inline">Código</span>
          </a>
        </nav>
      </div>
    </header>
  );
}

export function Rodape() {
  return (
    <footer className="mt-auto border-t border-linha">
      <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-x-6 gap-y-2 px-4 py-6 text-[13px] text-tinta-3 sm:px-6">
        <p>
          Desenhado e construído por <span className="text-tinta-2">{SITE.autor}</span>, com Claude Code.
        </p>
        <p>As imagens enviadas não são armazenadas.</p>
      </div>
    </footer>
  );
}
