export interface PlanoPublico {
  codigo: string;
  nome: string;
  precoMensal: number;
  precoAnual: number;
}

export function reais(valor: number) {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function urlApi(caminho: string) {
  const base = (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/$/, "");
  if (!base) return "";
  return `${base}${caminho.startsWith("/") ? caminho : `/${caminho}`}`;
}

export function linkDoSistema(caminho = "/login") {
  const base = (process.env.NEXT_PUBLIC_APP_URL ?? "").replace(/\/$/, "");
  if (!base) return "";
  return `${base}${caminho.startsWith("/") ? caminho : `/${caminho}`}`;
}

export interface AdicionaisPrimeiraCobranca {
  implantacao: number;
  importacao: number;
}

export interface CatalogoPublico {
  planos: PlanoPublico[];
  /** Preço de cada serviço no Essencial e no Profissional. Vazio quando a API não informa. */
  adicionais: Partial<Record<"essencial" | "profissional", AdicionaisPrimeiraCobranca>>;
}

function lerAdicionais(valor: unknown): AdicionaisPrimeiraCobranca | null {
  if (!valor || typeof valor !== "object") return null;
  const item = valor as { implantacao?: unknown; importacao?: unknown };
  if (typeof item.implantacao !== "number" || typeof item.importacao !== "number") return null;
  if (item.implantacao <= 0 || item.importacao <= 0) return null;
  return { implantacao: item.implantacao, importacao: item.importacao };
}

export async function listarPlanosPublicos(): Promise<CatalogoPublico | null> {
  const url = urlApi("/planos");
  if (!url) return null;

  try {
    const resposta = await fetch(url, { cache: "no-store" });
    if (!resposta.ok) return null;
    const corpo = (await resposta.json()) as {
      planos?: PlanoPublico[];
      adicionais?: { essencial?: unknown; profissional?: unknown };
    };
    if (!corpo.planos) return null;
    const adicionais: CatalogoPublico["adicionais"] = {};
    const essencial = lerAdicionais(corpo.adicionais?.essencial);
    const profissional = lerAdicionais(corpo.adicionais?.profissional);
    if (essencial) adicionais.essencial = essencial;
    if (profissional) adicionais.profissional = profissional;
    return { planos: corpo.planos, adicionais };
  } catch {
    return null;
  }
}
