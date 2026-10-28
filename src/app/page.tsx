import { HomeClient } from "@/components/HomeClient";
import { listarPlanosPublicos } from "@/lib/planos-publicos";

export const dynamic = "force-dynamic";

// ..

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ teste?: string; nome?: string; email?: string; telefone?: string }>;
}) {
  const params = await searchParams;
  const catalogo = await listarPlanosPublicos();
  const planos = catalogo?.planos ?? null;
  const precos = planos
    ? Object.fromEntries(planos.map((plano) => [plano.codigo, plano.precoMensal]))
    : null;
  const precosAnuais = planos
    ? Object.fromEntries(planos.map((plano) => [plano.codigo, plano.precoAnual]))
    : null;

  return (
    <HomeClient
      precos={precos}
      precosAnuais={precosAnuais}
      implementacao={catalogo?.implementacao ?? null}
      testeInicial={params.teste}
      nomeInicial={params.nome}
      emailInicial={params.email}
      telefoneInicial={params.telefone}
    />
  );
}
