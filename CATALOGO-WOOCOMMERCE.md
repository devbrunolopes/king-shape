# Catálogo ao vivo do WooCommerce

A loja Angular agora tenta carregar automaticamente os produtos publicados em:

- Produção: `https://kingshape.fit/wp-json/wc/store/v1/products?per_page=100`
- WordPress Studio local: `http://localhost:8881/wp-json/wc/store/v1/products?per_page=100`

O WooCommerce é a fonte oficial para nome, ID, preço, preço promocional, imagens, categorias e disponibilidade. O Angular não deve manter um cadastro paralelo de produtos.

## Teste

1. Abra o endpoint da Store API no navegador e confirme que ele retorna uma lista JSON de produtos publicados.
2. Inicie o Angular com `npm install` e `npm start`.
3. Confirme que a mensagem no topo do catálogo indica quantos produtos foram carregados do WooCommerce.
4. Adicione um produto ao carrinho e confira se o preço exibido corresponde ao WooCommerce.
5. Faça um pedido de teste e confirme que o pedido aparece em WooCommerce → Pedidos.

Se a Store API não estiver acessível, a interface mostra um aviso e recorre ao catálogo de demonstração. **Não use o modo de demonstração para receber pedidos reais.**

## Checkout

O plugin `wordpress-plugin/king-shape-checkout/king-shape-checkout.php` aceita o ID real do produto WooCommerce enviado pelo catálogo e valida preço, compra permitida e estoque no servidor. O valor/total enviado pelo navegador não é usado para calcular o pedido.

## Observações

- A Store API retorna até 100 produtos por chamada nesta configuração. Se a loja ultrapassar 100 produtos, será necessário implementar paginação.
- A marca é inferida de um atributo de produto cujo nome contenha “Marca” ou “Brand”; se não existir, usa o SKU ou a categoria como fallback. Para exibir a marca corretamente, cadastre um atributo global de marca no WooCommerce.
- O WordPress deve permitir CORS entre o domínio publicado da PWA e a API. Se o navegador bloquear a chamada, confira o console e a configuração de CORS/segurança do WordPress.
