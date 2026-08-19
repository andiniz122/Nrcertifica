/**
 * Injeta um bloco <script type="application/ld+json">.
 *
 * `<` e escapado para \u003c para que nenhum conteudo dinamico consiga fechar
 * a tag <script> e injetar HTML na pagina.
 */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  const json = JSON.stringify(data).replace(/</g, '\\u003c')

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />
}
