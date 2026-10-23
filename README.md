## v1.5.5 — Navegação com comportamento de app

- As abas Produtos, Parceiros, Afiliados e Seguro agora trocam a tela sem rolar entre seções longas.
- Transição suave entre telas, retorno ao topo e estado ativo na tabbar/nav desktop.
- Carrinho permanece como painel deslizante e mantém os itens durante a navegação.

# King Shape — protótipo Angular de e-commerce

Protótipo responsivo para testar o catálogo em duas colunas no celular e uma experiência de compra inicial.

## O que já funciona
- Layout responsivo: 2 colunas no celular, 3 em telas médias e 4 em desktop.
- Busca por produto/marca.
- Filtros por categoria, disponibilidade e tipo.
- Ordenação por destaque, preço e nome.
- Cards com disponibilidade, preço e botão de adicionar.
- Favoritos visuais.
- Carrinho lateral com quantidade, remoção, subtotal e persistência no `localStorage`.
- Estados vazios e mensagens de feedback.

## Rodar localmente
Requer Node.js compatível com Angular 20. O alvo `serve` está configurado no `angular.json`.

```bash
npm install
npm start
```
Abra `http://localhost:4200`.

## Importante antes de produção
Este é um protótipo de front-end. Os produtos, preços, imagens e disponibilidade são ilustrativos e não estão sincronizados com o King Shape real. Não há checkout, estoque, frete, autenticação, pagamentos ou integração real com WhatsApp/API. Antes de publicar, substituir os dados de demonstração pela API/serviço de catálogo e implementar validação de preço/estoque no servidor, checkout seguro, políticas de privacidade e acessibilidade.

### Correção de imagens
Os arquivos em `src/assets` agora são publicados pelo Angular em `/assets`. Se uma imagem externa de produto não carregar, o card usa automaticamente `product-placeholder.svg` como fallback.


## Integração inicial v1.4.0
- O botão final do carrinho abre o WhatsApp comercial `+55 11 94174-9894` com mensagem pré-preenchida.
- A mensagem inclui produtos, quantidades, preços demonstrativos, subtotais e total estimado.
- O texto informa que disponibilidade, valores e entrega precisam ser confirmados pelo atendimento.
- **Ainda não há sincronização com o catálogo WordPress.** O catálogo e os preços continuam demonstrativos até confirmarmos o tipo de loja, os endpoints disponíveis e o formato real dos produtos.

## Próximo passo da integração WordPress
1. Abrir `https://kingshape.fit/wp-json/` no navegador e verificar se aparece um documento JSON.
2. Verificar se o endpoint público de produtos do WooCommerce está disponível em `https://kingshape.fit/wp-json/wc/store/v1/products`.
3. Se os endpoints não estiverem disponíveis, confirmar no painel WordPress se WooCommerce está instalado e ativo e se existe outro plugin que gerencia o catálogo.
4. Só então implementar o serviço Angular de catálogo e mapear os campos reais de produto, preço, imagem, categoria e disponibilidade.

## Histórico de versões

### v1.1.0
- Mantido o layout atual e a identidade visual King Shape.
- Adicionado filtro por marca (opções derivadas dos produtos).
- Adicionado filtro por tipo de envio (Transportadora, Sedex e PAC; valores demonstrativos).
- Adicionado alternador entre visualização em cards e lista.
- Contagem de filtros ativos e limpeza atualizadas para incluir os novos filtros.

### v1.0.0
- Base com cabeçalho King Shape, catálogo responsivo e carrinho de demonstração.


## v1.2.0
- Preços destacados nos cards de produto, itens do carrinho e subtotal.
- Regras de CSS reforçadas para manter os preços visíveis em celular e desktop.


## v1.2.1
- Corrigida a renderização dos preços com prefixo explícito `R$` e formatação numérica pt-BR.
- Estilos de visibilidade reforçados para preço do card, preço unitário, subtotal e total do carrinho.

## v1.2.2
- Registrado locale `pt-BR` para corrigir a formatação numérica Angular; preços agora devem mostrar centavos e valor completo.
- Removido `?? 0` redundante dos preços para eliminar os avisos NG8102.
- Imagens do catálogo carregam sem lazy loading para evitar que só apareçam após interação.
- Analytics do Angular desativado no `angular.json` para não perguntar sobre compartilhamento de dados ao iniciar.


## v1.3.0 — imagens locais da marca
- Substituídas as imagens externas de demonstração por 11 imagens fornecidas para o projeto.
- Imagens armazenadas em `src/assets/products/` e carregadas localmente, sem depender de servidores externos.
- Catálogo de demonstração atualizado para corresponder às imagens fornecidas.
- Os preços exibidos continuam sendo valores ilustrativos e devem ser confirmados antes de qualquer integração comercial.


### v1.4.0 — pedido pelo WhatsApp
- Conectado o CTA do carrinho ao WhatsApp comercial informado.
- Gerada mensagem dinâmica a partir dos itens e quantidades do carrinho.
- Mantido o catálogo demonstrativo enquanto a API real do WordPress não for confirmada.


## v1.5.0 — preparação PWA
- Adicionado `manifest.webmanifest` com nome, cores, modo standalone e ícones de 192×192 e 512×512.
- Adicionados metadados para instalação em navegadores móveis e ícone Apple Touch.
- Configurado o Angular Service Worker para builds de produção, com cache dos arquivos da aplicação e dos assets locais.
- O service worker fica desativado em desenvolvimento (`ng serve`) e é ativado no build de produção.

### Testar a PWA localmente
1. Execute `npm install`.
2. Execute `npm run build`.
3. Sirva a pasta `dist/kingshape/browser` por HTTPS (ou use `localhost`) com um servidor estático.
4. Abra a aplicação no Chrome/Edge, vá a **Instalar King Shape** ou **Adicionar à tela inicial**, conforme o navegador.
5. Para validar atualizações e cache, teste com DevTools → Application → Manifest/Service Workers.

**Limitações atuais:** não está publicada na internet e não foi possível validar o build nesta execução porque a instalação das dependências excedeu o tempo disponível. A instalação da PWA exige que a versão de produção seja servida por HTTPS, exceto em `localhost`. O catálogo continua demonstrativo; não armazene preços/estoque como definitivos no cache offline.
