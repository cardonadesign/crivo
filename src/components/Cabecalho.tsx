import { SITE } from "@/lib/site";
import Link from "next/link";

export function Cabecalho() {
  return (
    <header className="sticky top-0 z-30 border-b border-linha bg-papel/85 backdrop-blur">
      <div className="mx-auto flex h-14 w-full max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-baseline gap-2">
          <span className="titulo-serif text-[26px] leading-none">Crivo</span>
          <span className="hidden text-[12px] text-tinta-3 sm:inline">crítica de interface com prova</span>
        </Link>
        <nav className="flex items-center gap-1 text-[14px]">
          <Link href="/como-funciona" className="rounded-full px-3 py-1.5 text-tinta-2 hover:bg-cartao hover:text-tinta">
            Como funciona
          </Link>
          <a
            href={SITE.repo}
            target="_blank"
            rel="noreferrer"
            className="rounded-full px-3 py-1.5 text-tinta-2 hover:bg-cartao hover:text-tinta"
          >
            Código
          </a>
        </nav>
      </div>
    </header>
  );
}

export function Rodape() {
  return (
    <footer className="mt-auto border-t border-linha">
      <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-2 px-4 py-6 text-[13px] text-tinta-3 sm:px-6">
        <span>
          Desenhado e construído por <span className="text-tinta-2">{SITE.autor}</span>, com Claude Code.
        </span>
        <span>As imagens enviadas não são armazenadas.</span>
      </div>
    </footer>
  );
}
