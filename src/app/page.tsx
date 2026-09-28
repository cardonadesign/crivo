import { Cabecalho, Rodape } from "@/components/Cabecalho";
import { Crivo } from "@/components/Crivo";

export default function Home() {
  return (
    <>
      <Cabecalho />
      <main className="flex w-full flex-1 flex-col">
        <Crivo />
      </main>
      <Rodape />
    </>
  );
}
