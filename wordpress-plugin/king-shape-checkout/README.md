# King Shape Checkout WooCommerce (1.0.0)

## O que faz
- Recebe os itens e dados do checkout Angular via REST API.
- Busca produtos reais pelo mapeamento configurado no WordPress; não aceita preços enviados pelo navegador.
- Valida se os produtos podem ser comprados e se há estoque suficiente.
- Valida cupom WooCommerce no servidor e aplica-o ao pedido.
- Cria um pedido WooCommerce com status **Pendente de pagamento** e devolve o número e totais ao Angular.
- O Angular então abre o WhatsApp com o número do pedido e os totais calculados pelo WooCommerce.

## Instalação
1. Faça backup do WordPress.
2. No WordPress, vá a **Plugins > Adicionar novo > Enviar plugin** e envie um ZIP da pasta `king-shape-checkout` (compacte a pasta, não os arquivos soltos). Ou copie a pasta para `wp-content/plugins/`.
3. Ative **King Shape Checkout WooCommerce**. WooCommerce deve estar ativo.
4. Acesse **WooCommerce > King Shape Checkout**.
5. Para cada ID Angular (1–11), informe o ID real do produto WooCommerce correspondente. Para achar o ID, abra **Produtos** no painel e passe o mouse sobre o produto ou abra sua edição: o endereço contém `post=123`.
6. Salve e confirme que os nomes mostrados correspondem aos produtos certos.
7. Teste primeiro com um produto de teste e cupom de teste. Verifique o pedido em **WooCommerce > Pedidos**.

## Endpoints
`POST /wp-json/ks-checkout/v1/orders`

O endpoint público possui validação básica e limite por IP. Como é público, antes de produção recomendamos adicionar CAPTCHA/antibot, monitoramento e política de retenção de dados. A configuração CORS permite `kingshape.fit`, `www.kingshape.fit` e desenvolvimento local em `localhost:4200`.

## Observações importantes
- O pedido fica pendente; este plugin não processa pagamento nem confirma frete.
- O estoque pode não ser reservado imediatamente dependendo das configurações de retenção de estoque do WooCommerce. Configure e teste esse comportamento no WooCommerce.
- A aplicação de um cupom WooCommerce pode descontar o pedido, mas não garante que o plugin de afiliados atual registre automaticamente comissão. Isso precisa ser integrado e testado com o plugin de afiliados já instalado.
- O mapeamento de produtos é obrigatório: não presuma que os IDs do catálogo Angular são os IDs WooCommerce.
- Confirme o número de WhatsApp do atendimento no arquivo `src/app/app.component.ts` antes de publicar.
