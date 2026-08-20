# Áurea Imóveis — Hero desktop

Hero independente para uma imobiliária de luxo, construído em HTML, CSS e JavaScript puro.

## Abrir localmente

1. Mantenha a pasta `assets` ao lado dos demais arquivos.
2. Abra `index.html` no navegador.
3. Para evitar restrições locais de vídeo, você também pode iniciar um servidor simples na pasta:

```bash
python3 -m http.server 8080
```

Depois, acesse `http://localhost:8080`.

## Arquivos

- `index.html`: conteúdo, navegação e estrutura semântica.
- `styles.css`: layout, tipografia, cores e animações.
- `script.js`: cursor, parallax, botões magnéticos e contadores.
- `assets/residencia-aurea.mp4`: vídeo cinematográfico do hero.

## Personalização rápida

- Textos e links: edite diretamente no `index.html`.
- Paleta: altere as variáveis no início de `styles.css`.
- Velocidade das animações: ajuste os tempos nas regras `animation`.
- Vídeo: substitua `assets/residencia-aurea.mp4` mantendo o mesmo nome ou atualize o caminho no HTML.

## Escopo

A composição foi desenhada exclusivamente para desktop, conforme solicitado. O `min-width` atual é de 1100px e não inclui uma adaptação específica para celular.
