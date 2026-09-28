// Preparação da imagem no navegador. A mesma imagem (mesmas dimensões) é enviada ao modelo
// e usada para medir contraste, para que as coordenadas batam.

const MAX_LADO = 1568;
const MAX_PIXELS = 1_150_000;

export type ImagemPreparada = {
  src: string; // data URL para exibição
  base64: string; // sem prefixo, para a API
  mediaType: "image/png" | "image/jpeg";
  largura: number;
  altura: number;
  canvas: HTMLCanvasElement;
};

export function carregarImagem(src: string): Promise<HTMLImageElement> {
  return new Promise((ok, erro) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => ok(img);
    img.onerror = () => erro(new Error("Não consegui abrir essa imagem."));
    img.src = src;
  });
}

export function arquivoParaDataUrl(arquivo: File): Promise<string> {
  return new Promise((ok, erro) => {
    const leitor = new FileReader();
    leitor.onload = () => ok(leitor.result as string);
    leitor.onerror = () => erro(new Error("Falha ao ler o arquivo."));
    leitor.readAsDataURL(arquivo);
  });
}

export async function prepararImagem(src: string): Promise<ImagemPreparada> {
  const img = await carregarImagem(src);
  let escala = Math.min(1, MAX_LADO / Math.max(img.naturalWidth, img.naturalHeight));
  const px = img.naturalWidth * img.naturalHeight * escala * escala;
  if (px > MAX_PIXELS) escala *= Math.sqrt(MAX_PIXELS / px);
  const largura = Math.round(img.naturalWidth * escala);
  const altura = Math.round(img.naturalHeight * escala);

  const canvas = document.createElement("canvas");
  canvas.width = largura;
  canvas.height = altura;
  const ctx = canvas.getContext("2d", { willReadFrequently: true })!;
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, largura, altura);
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(img, 0, 0, largura, altura);

  // JPEG de alta qualidade mantém o payload pequeno; a medição de contraste usa o canvas sem compressão.
  const dataUrl = canvas.toDataURL("image/jpeg", 0.92);
  return {
    src: canvas.toDataURL("image/png"),
    base64: dataUrl.split(",")[1],
    mediaType: "image/jpeg",
    largura,
    altura,
    canvas,
  };
}
