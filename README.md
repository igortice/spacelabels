# SpaceLabels

Repositório público de distribuição do SpaceLabels para macOS.

Este repositório publica somente conteúdo destinado ao público:

- site do GitHub Pages;
- Releases públicas, quando a automação de distribuição estiver pronta;
- downloads e checksums públicos;
- informações de instalação, privacidade e suporte;
- futuro `appcast.xml` usado pelas atualizações do aplicativo.

O código-fonte Swift, os testes do aplicativo e a documentação interna
permanecem em um repositório privado e não são publicados aqui.

## Estado atual

O site apresenta o produto com capturas reais, explica seus principais fluxos
e oferece a Release pública mais recente para download e instalação.

A página consulta a API pública do GitHub e aceita a Release publicada pelo
workflow de distribuição validado no repositório privado. Antes de habilitar
qualquer download, ainda confere tag, estado da Release, nomes dos dois
artefatos, origem dos links, tamanhos e digests SHA-256. Se a API estiver
indisponível, usa
`assets/release-fallback.json`, submetido às mesmas validações. Se nenhuma fonte
for válida, o download permanece desabilitado.

## Site

O conteúdo estático do GitHub Pages vive na raiz da branch `main`:

- `index.html`
- `assets/styles.css`
- `assets/site.js`
- `assets/release.js`
- `assets/release-fallback.json`

O site não utiliza frameworks, analytics ou cookies.

Para executar localmente:

```bash
python3 -m http.server 4173
```

Para validar o contrato da Release e a estrutura da página:

```bash
npm test
```
