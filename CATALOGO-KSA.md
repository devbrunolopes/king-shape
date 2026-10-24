# King Shape Angular v1.5.17 — Catálogo KSA

## Fonte oficial do catálogo
A PWA consulta a API existente do WordPress:
`https://kingshape.fit/wp-json/ksa/v1/products?page=1&per_page=100`

A resposta esperada é um objeto com `products`, `page`, `total` e `pages`. A aplicação percorre todas as páginas e mapeia os campos do catálogo personalizado: `id`, `name`, `brand`, `category`, `type`, `delivery`, `price`, `status`, `image`, `featured`, `pinned`, `hidden`, `card_label`, `schedule`, `display_start` e `display_end`.

- Produtos `hidden: true` são omitidos.
- `status` só é considerado disponível quando o valor é `Disponível`.
- Imagem vazia usa `assets/product-placeholder.svg`.
- Ofertas usa produtos em destaque/etiquetados e disponíveis. O catálogo KSA mostrado até agora não contém `oldPrice`, então não exibimos desconto percentual/preço riscado inventado.
- Se a API falhar, a interface mostra um aviso de catálogo de demonstração.

## Checkout — ainda não integrado ao catálogo KSA
O endpoint existente `/wp-json/ksa/v1/checkout` foi encontrado no índice REST, mas o contrato de entrada/saída ainda não foi verificado. O checkout fica bloqueado nesta versão para evitar enviar IDs `ksa_product` ao endpoint antigo do WooCommerce e criar pedidos incorretos. Antes de ativar, precisamos confirmar o contrato da API KSA e validar o seu comportamento no WordPress.

## Executar localmente
1. Instale Node.js compatível com Angular 20.
2. Execute `npm install`.
3. Execute `npm start`.

A compilação não foi validada neste ambiente porque o executável Angular CLI não estava instalado em `node_modules`.
