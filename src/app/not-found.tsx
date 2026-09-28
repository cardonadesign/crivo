import { Cabecalho, Rodape } from "@/components/Cabecalho";
import { ArrowLeftIcon } from "@phosphor-icons/react/ssr";
import Link from "next/link";

export default function NaoEncontrado() {
  return (
    <>
      <Cabecalho />
      <main id="conteudo" className="mx-auto flex w-full max-w-4xl flex-1 flex-col justify-center px-4 py-24 sm:px-6">
        <p className="num text-[14px] text-tinta-3">404</p>
        <h1 className="mt-2 text-[36px] font-semibold tracking-tight">Essa página não passou pelo crivo.</h1>
        <p className="mt-3 max-w-[48ch] text-[16px] leading-relaxed text-tinta-2">
          O endereço não existe ou mudou. A análise continua na página inicial.
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex w-fit items-center gap-2 rounded-controle bg-acento px-4 py-2.5 text-[14px] font-medium text-sobre-acento transition-colors hover:bg-acento-hover"
        >
          <ArrowLeftIcon size={16} aria-hidden />
          Voltar ao início
        </Link>
      </main>
      <Rodape />
    </>
  );
}
