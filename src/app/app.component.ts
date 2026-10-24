import { CommonModule } from '@angular/common';
import { Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

type Product = { id: number; brand: string; name: string; category: string; type: string; shipping: string[]; price: number; oldPrice?: number; available: boolean; premium?: boolean; image: string; badge?: string; sku?: string; };
type KingShapeApiProduct = { id: number; name: string; sku?: string; brand?: string; category?: string; type?: string; note?: string; card_label?: string; featured?: boolean; pinned?: boolean; hidden?: boolean; schedule?: boolean; display_start?: string; display_end?: string; price?: number | string; status?: string; delivery?: string[]; image?: string; };
type KingShapeApiResponse = { products?: KingShapeApiProduct[]; page?: number; total?: number; pages?: number };
type WooStoreProduct = { id: number; name: string; slug?: string; sku?: string; prices?: { price?: string; regular_price?: string; sale_price?: string; currency_minor_unit?: number }; images?: { src?: string; alt?: string }[]; categories?: { name?: string }[]; attributes?: { name?: string; terms?: { name?: string }[] }[]; is_in_stock?: boolean; is_purchasable?: boolean; on_sale?: boolean; };
type CartItem = { product: Product; qty: number };
type WordPressPartner = { name: string; label: string; description: string; image: string; url: string };
type WordPressInsuranceCard = { title: string; html: string };
type WordPressAffiliateContent = { eyebrow: string; title: string; description: string; cta: string; url: string; items: { title: string; description: string; url: string; image: string }[]; steps: { number: string; title: string; description: string; tags: string[] }[] };
type WordPressPage = { id: number; slug: string; link: string; title?: { rendered?: string }; content?: { rendered?: string } };


@Component({
  selector: 'ks-root', standalone: true, imports: [CommonModule, FormsModule],
  template: `
    <header class="topbar" id="top">
      <button class="icon-button menu-button" aria-label="Abrir menu" (click)="menuOpen.set(!menuOpen())">☰</button>
      <a class="brand" href="javascript:void(0)" (click)="navigateTo('catalogo')" aria-label="King Shape início"><img class="brand-logo" src="assets/king-shape-logo.jpg" alt="Símbolo King Shape"><img class="brand-wordmark-image" src="assets/king-shape-wordmark.png" alt="KINGSHAPE"></a>
      <nav class="desktop-nav" aria-label="Navegação principal"><button [class.active]="activePage() === 'catalogo'" (click)="navigateTo('catalogo')">Produtos</button><button [class.active]="activePage() === 'ofertas'" (click)="navigateTo('ofertas')">Ofertas</button><button [class.active]="activePage() === 'parceiros'" (click)="navigateTo('parceiros')">Parceiros e Afiliados</button><button [class.active]="activePage() === 'seguro'" (click)="navigateTo('seguro')">Seguro</button></nav>
      <div class="header-actions"><button class="header-action search-action" aria-label="Buscar produtos" (click)="focusSearch()"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.8" cy="10.8" r="6.8"></circle><path d="m16 16 5 5"></path></svg></button><button class="header-action account-action" aria-label="Minha conta" title="Minha conta" (click)="showAccountMessage()"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="7.5" r="4"></circle><path d="M4 21v-2a8 8 0 0 1 16 0v2z"></path></svg></button><button class="header-action cart-head" aria-label="Abrir carrinho" (click)="cartOpen.set(true)"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 3h2l2.4 12.2a2 2 0 0 0 2 1.6h9.8a2 2 0 0 0 1.9-1.4L22 8H5"></path><circle cx="9" cy="21" r="1"></circle><circle cx="18" cy="21" r="1"></circle></svg><b>{{ cartCount() }}</b></button></div>
    </header>
    <div class="menu-panel" *ngIf="menuOpen()"><button (click)="navigateTo('catalogo')">Produtos</button><button (click)="navigateTo('ofertas')">Ofertas</button><button (click)="navigateTo('parceiros')">Parceiros e Afiliados</button><button (click)="cartOpen.set(true); menuOpen.set(false)">Meu carrinho</button><button (click)="navigateTo('seguro')">Seguro</button></div>
    <nav class="mobile-tabbar" aria-label="Navegação do aplicativo">
      <button class="tab-item" [class.active]="activePage() === 'catalogo'" (click)="navigateTo('catalogo')"><span class="tab-icon">⌂</span><span>Produtos</span></button>
      <button class="tab-item" [class.active]="activePage() === 'ofertas'" (click)="navigateTo('ofertas')"><span class="tab-icon">％</span><span>Ofertas</span></button>
      <button class="tab-item tab-cart" [class.active]="cartOpen()" (click)="cartOpen.set(true)" aria-label="Abrir carrinho"><span class="tab-icon tab-cart-icon"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 3h2l2.4 12.2a2 2 0 0 0 2 1.6h9.8a2 2 0 0 0 1.9-1.4L22 8H5"></path><circle cx="9" cy="21" r="1"></circle><circle cx="18" cy="21" r="1"></circle></svg><i>{{ cartCount() }}</i></span><span>Carrinho</span></button>
      <button class="tab-item" [class.active]="activePage() === 'parceiros'" (click)="navigateTo('parceiros')"><span class="tab-icon">♧</span><span>Parceiros</span></button>
      <button class="tab-item" [class.active]="activePage() === 'seguro'" (click)="navigateTo('seguro')"><span class="tab-icon">◇</span><span>Seguro</span></button>
    </nav>

    <main id="top" class="page-shell">


      <div class="app-page" [class.page-enter]="pageTransition()" *ngIf="activePage() === 'catalogo'" aria-label="Página de produtos">
      <section class="catalog-head" id="catalogo">
        <div><p class="section-kicker">EXPLORE A LOJA</p><h2>Catálogo <span>de produtos</span></h2><p class="muted">{{ filteredProducts().length }} produtos encontrados</p><p class="catalog-connection-note" [class.catalog-connection-warning]="catalogSource() === 'fallback'">{{ catalogMessage() }}</p></div>
        <button class="filter-toggle" (click)="filtersOpen.set(!filtersOpen())">☷ <span>Filtrar</span><span class="filter-count" *ngIf="activeFilterCount()">{{ activeFilterCount() }}</span></button>
      </section>

      <section class="toolbar">
        <label class="search-box"><span>⌕</span><input [(ngModel)]="search" placeholder="Buscar produto ou marca..." aria-label="Buscar produto ou marca"></label>
        <label class="sort-box"><span>Ordenar</span><select [(ngModel)]="sortBy" aria-label="Ordenar produtos"><option value="featured">Destaques</option><option value="price-asc">Menor preço</option><option value="price-desc">Maior preço</option><option value="name">Nome A–Z</option></select></label>
      </section>

      <section class="filters" *ngIf="filtersOpen()">
        <label>Categoria<select [(ngModel)]="category"><option value="all">Todas as categorias</option><option *ngFor="let categoryName of categories()" [value]="categoryName">{{ categoryName }}</option></select></label>
        <label>Disponibilidade<select [(ngModel)]="availability"><option value="all">Todos</option><option value="available">Disponíveis</option><option value="unavailable">Indisponíveis</option></select></label>
        <label>Tipo<select [(ngModel)]="typeFilter"><option value="all">Todos os tipos</option><option value="Injetáveis">Injetáveis</option><option value="Oral">Oral</option><option value="Acessório">Acessório</option></select></label>
        <label>Marca<select [(ngModel)]="brandFilter"><option value="all">Todas as marcas</option><option *ngFor="let brand of brands()" [value]="brand">{{ brand }}</option></select></label>
        <label>Tipo de envio<select [(ngModel)]="shippingFilter"><option value="all">Todos os envios</option><option value="Transportadora">Transportadora</option><option value="Sedex">Sedex</option><option value="PAC">PAC</option></select></label>
        <button class="clear-filters" (click)="clearFilters()">Limpar filtros</button>
      </section>

      <div class="results-row"><span>Mostrando <b>{{ filteredProducts().length }}</b> itens</span><div class="view-switch"><span class="view-label">Visualização</span><button class="view-button" [class.active]="viewMode() === 'grid'" aria-label="Visualizar em cards" (click)="viewMode.set('grid')">▦ <span>Cards</span></button><button class="view-button" [class.active]="viewMode() === 'list'" aria-label="Visualizar em lista" (click)="viewMode.set('list')">☰ <span>Lista</span></button></div></div>

      <section class="product-grid" [class.list-view]="viewMode() === 'list'" *ngIf="filteredProducts().length; else emptyState">
        <article class="product-card" *ngFor="let product of filteredProducts(); trackBy: trackProduct">
          <div class="product-image-wrap">
            <span class="product-badge" *ngIf="product.badge">{{ product.badge }}</span>
            <button class="favorite" aria-label="Favoritar produto" (click)="toggleFavorite(product.id)" [class.favorited]="favorites().includes(product.id)">{{ favorites().includes(product.id) ? '♥' : '♡' }}</button>
            <img [src]="product.image" [alt]="product.name" loading="eager" decoding="async" (error)="onImageError($event)">
          </div>
          <div class="product-info">
            <div class="product-brand">{{ product.brand }}</div>
            <h3>{{ product.name }}</h3>
            <div class="tags"><span class="tag" [class.tag-premium]="product.premium">{{ product.premium ? 'Premium' : product.category }}</span><span class="tag tag-muted">{{ product.type }}</span></div>
            <div class="availability" [class.unavailable]="!product.available"><i></i>{{ product.available ? 'Disponível' : 'Indisponível' }}</div>
            <div class="product-price" aria-label="Preço do produto">
              <strong>R$ {{ product.price | number:'1.2-2':'pt-BR' }}</strong>
              <del *ngIf="product.oldPrice">R$ {{ product.oldPrice | number:'1.2-2':'pt-BR' }}</del>
            </div>
            <div class="product-purchase-row"><div class="product-qty-control" role="group" [attr.aria-label]="'Quantidade de ' + product.name"><button type="button" (click)="changeProductQty(product.id,-1)" [disabled]="selectedProductQty(product.id) <= 1" [attr.aria-label]="'Diminuir quantidade de ' + product.name">−</button><span>{{ selectedProductQty(product.id) }}</span><button type="button" (click)="changeProductQty(product.id,1)" [disabled]="!product.available" [attr.aria-label]="'Aumentar quantidade de ' + product.name">+</button></div><button class="add-button" [disabled]="!product.available" (click)="addToCart(product, selectedProductQty(product.id))"><span>Adicionar</span><span class="add-plus">+</span></button></div>
          </div>
        </article>
      </section>
      <ng-template #emptyState><div class="empty-state catalog-loading-state" *ngIf="catalogSource() === 'loading'; else noProducts"><span class="loading-spinner" aria-hidden="true"></span><h3>Carregando catálogo</h3><p>Estamos buscando os produtos atualizados da King Shape…</p></div><ng-template #noProducts><div class="empty-state"><span *ngIf="catalogSource() !== 'fallback'">⌕</span><h3>{{ catalogSource() === 'fallback' ? 'Não foi possível carregar os produtos' : 'Nenhum produto encontrado' }}</h3><p>{{ catalogSource() === 'fallback' ? 'Confira sua conexão e atualize a página para tentar novamente.' : 'Tente mudar a busca ou remover os filtros.' }}</p><button class="clear-filters" *ngIf="catalogSource() !== 'fallback'" (click)="clearFilters()">Limpar busca e filtros</button></div></ng-template></ng-template>

      </div>
      <div class="app-page" [class.page-enter]="pageTransition()" *ngIf="activePage() === 'ofertas'" aria-label="Página de ofertas">
        <section class="catalog-head" id="ofertas">
          <div><p class="section-kicker">OFERTAS KING SHAPE</p><h2>Ofertas <span>especiais</span></h2><p class="muted">{{ offerProducts().length }} produtos promocionais encontrados</p><p class="catalog-connection-note" [class.catalog-connection-warning]="catalogSource() === 'fallback'">{{ catalogMessage() }}</p></div>
          <span class="offers-heading-mark" aria-hidden="true">％</span>
        </section>
        <section class="toolbar">
          <label class="search-box"><span>⌕</span><input [(ngModel)]="search" placeholder="Buscar oferta ou marca..." aria-label="Buscar oferta ou marca"></label>
          <label class="sort-box"><span>Ordenar</span><select [(ngModel)]="sortBy" aria-label="Ordenar ofertas"><option value="featured">Destaques</option><option value="price-asc">Menor preço</option><option value="price-desc">Maior preço</option><option value="name">Nome A–Z</option></select></label>
        </section>
        <div class="results-row"><span>Mostrando <b>{{ offerProducts().length }}</b> ofertas</span><div class="view-switch"><span class="view-label">Visualização</span><button class="view-button" [class.active]="viewMode() === 'grid'" aria-label="Visualizar ofertas em cards" (click)="viewMode.set('grid')">▦ <span>Cards</span></button><button class="view-button" [class.active]="viewMode() === 'list'" aria-label="Visualizar ofertas em lista" (click)="viewMode.set('list')">☰ <span>Lista</span></button></div></div>
        <section class="product-grid" [class.list-view]="viewMode() === 'list'" *ngIf="offerProducts().length; else noOffers">
          <article class="product-card offer-product-card" *ngFor="let product of offerProducts(); trackBy: trackProduct">
            <div class="product-image-wrap">
              <span class="product-badge">{{ product.badge || 'OFERTA' }}</span>
              <button class="favorite" aria-label="Favoritar oferta" (click)="toggleFavorite(product.id)" [class.favorited]="favorites().includes(product.id)">{{ favorites().includes(product.id) ? '♥' : '♡' }}</button>
              <img [src]="product.image" [alt]="product.name" loading="eager" decoding="async" (error)="onImageError($event)">
            </div>
            <div class="product-info">
              <div class="product-brand">{{ product.brand }}</div>
              <h3>{{ product.name }}</h3>
              <div class="tags"><span class="tag tag-premium">Oferta</span><span class="tag tag-muted">{{ product.type }}</span></div>
              <div class="availability" [class.unavailable]="!product.available"><i></i>{{ product.available ? 'Disponível' : 'Indisponível' }}</div>
              <div class="product-price"><strong>R$ {{ product.price | number:'1.2-2':'pt-BR' }}</strong><del>R$ {{ product.oldPrice | number:'1.2-2':'pt-BR' }}</del></div>
              <div class="product-purchase-row"><div class="product-qty-control" role="group" [attr.aria-label]="'Quantidade de ' + product.name"><button type="button" (click)="changeProductQty(product.id,-1)" [disabled]="selectedProductQty(product.id) <= 1" [attr.aria-label]="'Diminuir quantidade de ' + product.name">−</button><span>{{ selectedProductQty(product.id) }}</span><button type="button" (click)="changeProductQty(product.id,1)" [disabled]="!product.available" [attr.aria-label]="'Aumentar quantidade de ' + product.name">+</button></div><button class="add-button" [disabled]="!product.available" (click)="addToCart(product, selectedProductQty(product.id))"><span>Adicionar</span><span class="add-plus">+</span></button></div>
            </div>
          </article>
        </section>
        <ng-template #noOffers><div class="empty-state catalog-loading-state" *ngIf="catalogSource() === 'loading'; else noOffersLoaded"><span class="loading-spinner" aria-hidden="true"></span><h3>Carregando catálogo</h3><p>Estamos buscando as ofertas atualizadas…</p></div><ng-template #noOffersLoaded><div class="empty-state"><h3>{{ catalogSource() === 'fallback' ? 'Não foi possível carregar as ofertas' : 'Nenhuma oferta encontrada' }}</h3><p>{{ catalogSource() === 'fallback' ? 'Confira sua conexão e atualize a página.' : 'Confira novamente em breve ou veja todos os produtos.' }}</p><button class="clear-filters" (click)="search=''; navigateTo('catalogo')">Ver produtos</button></div></ng-template></ng-template>
      </div>

      <div class="app-page" [class.page-enter]="pageTransition()" *ngIf="activePage() === 'parceiros'" aria-label="Página de parceiros">
      <section class="content-section partners-section" id="parceiros">
        <div class="content-heading"><p class="section-kicker">PARCEIROS</p><h2>Recomendamos</h2><p>Conheça profissionais e conteúdos que fazem parte da comunidade King Shape.</p></div>
        <p class="catalog-connection-note" *ngIf="wordpressContentLoading()">Carregando conteúdo atualizado do WordPress…</p>
        <p class="catalog-connection-note catalog-connection-warning" *ngIf="wordpressContentError()">{{ wordpressContentError() }}</p>
        <div class="partner-grid" *ngIf="wordpressPartners().length">
          <article class="partner-card" *ngFor="let partner of wordpressPartners()">
            <div class="partner-art" [style.backgroundImage]="partner.image ? 'linear-gradient(180deg, transparent, #000b), url(' + partner.image + ')' : 'linear-gradient(135deg,#252525,#111)'">
              <span>{{ partner.label }}</span><small>{{ partner.name }}</small>
            </div>
            <h3>{{ partner.name }}</h3><p>{{ partner.description }}</p>
            <a class="outline-cta" [href]="partner.url" target="_blank" rel="noopener noreferrer">SAIBA MAIS <span>↗</span></a>
          </article>
        </div>
      </section>

      <section class="content-section affiliate-section" id="afiliados">
        <div class="affiliate-hero">
          <p class="section-kicker">{{ affiliateContent().eyebrow || 'INDIQUE & GANHE' }}</p>
          <h2>{{ affiliateContent().title || 'Seja Nosso Parceiro' }}</h2>
          <p>{{ affiliateContent().description || 'Conheça o programa de afiliados da King Shape.' }}</p>
          <a class="gold-cta" [href]="affiliateContent().url || 'https://kingshape.fit/seja-nosso-afiliado/'" target="_blank" rel="noopener noreferrer">{{ affiliateContent().cta || 'SAIBA MAIS' }} <span>↗</span></a>
        </div>
        <div class="affiliate-benefits" *ngIf="affiliateContent().items.length">
          <article class="benefit-card" *ngFor="let item of affiliateContent().items; let i = index">
            <div class="benefit-art" [class.has-image]="item.image" [style.backgroundImage]="item.image ? 'linear-gradient(180deg,transparent 30%,#000d),url(' + item.image + ')' : null"><span>{{ ('0' + (i + 1)).slice(-2) }}</span><b>✦</b></div>
            <h3>{{ item.title }}</h3><p>{{ item.description }}</p>
            <a [href]="item.url || affiliateContent().url || 'https://kingshape.fit/seja-nosso-afiliado/'" target="_blank" rel="noopener noreferrer">SAIBA MAIS ↗</a>
          </article>
        </div>
        <section class="affiliate-how" aria-labelledby="affiliate-how-title">
          <div class="content-heading"><p class="section-kicker">SIMPLES E TRANSPARENTE</p><h2 id="affiliate-how-title">Como Funciona?</h2><p>Do cadastro ao acompanhamento das suas indicações, tudo em etapas claras.</p></div>
          <div class="affiliate-steps">
            <article class="affiliate-step" *ngFor="let step of affiliateContent().steps">
              <span class="step-number">{{ step.number }}</span><div><h3>{{ step.title }}</h3><p>{{ step.description }}</p><div class="step-tags"><span *ngFor="let tag of step.tags">{{ tag }}</span></div></div>
            </article>
            <article class="affiliate-step affiliate-transparency"><span class="step-number">✓</span><div><h3>TRANSPARÊNCIA</h3><p>Você tem acesso a tudo que acontece do começo ao fim.</p><div class="step-tags"><span>Vendas</span><span>Comissões</span></div></div></article>
          </div>
        </section>
        <p class="catalog-connection-note" *ngIf="wordpressContentLoading()">Carregando conteúdo de afiliados do WordPress…</p>
      </section>
      </div>

      <div class="app-page" [class.page-enter]="pageTransition()" *ngIf="activePage() === 'seguro'" aria-label="Página de seguro">
      <section class="content-section insurance-section" id="seguro">
        <div class="insurance-heading">
          <span class="insurance-pill">{{ insuranceContent().badge || '🛡️ Proteção Premium' }}</span>
          <h2>{{ insuranceContent().title || 'Seguro de Entrega King Shape' }}</h2>
          <p>{{ insuranceContent().subtitle || 'Mais segurança, mais tranquilidade e cobertura para imprevistos no envio do seu pedido.' }}</p>
        </div>
        <article class="insurance-card" *ngFor="let card of insuranceContent().cards">
          <h3>{{ card.title }}</h3>
          <div class="wp-content-text" [innerHTML]="card.html"></div>
        </article>
        <div class="insurance-card" *ngIf="!insuranceContent().cards.length && wordpressContentLoading()">Carregando os termos oficiais do WordPress…</div>
        <p class="insurance-disclaimer" *ngIf="insuranceContent().summary">{{ insuranceContent().summary }}</p>
        <p class="catalog-connection-note catalog-connection-warning" *ngIf="wordpressContentError()">{{ wordpressContentError() }}</p>
      </section>

      </div>
      <footer class="footer"><a class="brand footer-brand" href="javascript:void(0)" (click)="navigateTo('catalogo')"><img class="brand-logo" src="assets/king-shape-logo.jpg" alt=""><span class="brand-wordmark"><b>KING</b>SHAPE</span></a><p>Performance começa com informação clara.</p><small>Confirme valores, disponibilidade e condições pelo WhatsApp.</small></footer>
    </main>

    <button class="floating-cart" (click)="cartOpen.set(true)"><span class="cart-icon">♧</span><span>Meu carrinho</span><b>{{ cartCount() }}</b><strong>R$ {{ cartTotal() | number:'1.2-2':'pt-BR' }}</strong></button>

    <div class="overlay" *ngIf="cartOpen()" (click)="cartOpen.set(false)"></div>
    <aside class="cart-drawer" [class.open]="cartOpen()" aria-label="Carrinho de compras">
      <div class="drawer-head"><div><p class="section-kicker">SEU PEDIDO</p><h2>Meu carrinho <span>({{ cartCount() }})</span></h2></div><button class="close-button" aria-label="Fechar carrinho" (click)="cartOpen.set(false)">×</button></div>
      <div class="cart-empty" *ngIf="cartItems().length === 0"><div class="empty-bag">♧</div><h3>Seu carrinho está vazio</h3><p>Explore o catálogo e adicione seus produtos favoritos.</p><button class="add-button" (click)="navigateTo('catalogo')">Ver produtos</button></div>
      <div class="cart-items" *ngIf="cartItems().length">
        <div class="cart-item" *ngFor="let item of cartItems()"><img [src]="item.product.image" [alt]="item.product.name" loading="eager" decoding="async" (error)="onImageError($event)"><div class="cart-item-info"><h3>{{ item.product.name }}</h3><strong class="cart-item-price">R$ {{ item.product.price | number:'1.2-2':'pt-BR' }}</strong><div class="qty-control"><button (click)="changeQty(item.product.id,-1)" aria-label="Diminuir quantidade">−</button><span>{{ item.qty }}</span><button (click)="changeQty(item.product.id,1)" aria-label="Aumentar quantidade">+</button></div></div><button class="remove-item" (click)="removeFromCart(item.product.id)" aria-label="Remover produto">×</button></div>
        <div class="cart-summary">
          <div class="subtotal-line"><span>Produtos</span><strong>R$ {{ cartTotal() | number:'1.2-2':'pt-BR' }}</strong></div>
          <section class="cart-option-card">
            <label for="cart-coupon">Cupom de desconto</label>
            <div class="cart-coupon-row"><input id="cart-coupon" name="cartCoupon" [(ngModel)]="affiliateCoupon" (ngModelChange)="couponFeedback.set('')" placeholder="Digite seu cupom" autocapitalize="characters"><button type="button" (click)="checkCouponFormat()">Aplicar</button></div>
            <p class="cart-option-note" *ngIf="!couponFeedback()">O cupom será validado pela loja ao registrar o pedido.</p><p class="cart-option-note" *ngIf="couponFeedback()">{{ couponFeedback() }}</p>
          </section>
          <section class="cart-option-card">
            <label for="cart-state">Estado para entrega</label>
            <select id="cart-state" name="shippingState" [(ngModel)]="shippingState"><option value="">Selecione seu estado</option><option *ngFor="let state of brazilStates" [value]="state.code">{{ state.name }}</option></select>
            <p class="cart-option-note">O frete será confirmado pelo atendimento conforme o destino e os produtos.</p>
            <div class="cart-insurance-box"><label class="cart-insurance-label"><input type="checkbox" [(ngModel)]="shippingInsurance" name="shippingInsurance"> Quero incluir seguro da encomenda (15%)</label><p>O seguro é opcional. Consulte as condições na página Seguro.</p><div class="subtotal-line"><span>Total sem seguro</span><strong>R$ {{ cartTotal() | number:'1.2-2':'pt-BR' }}</strong></div><div class="subtotal-line"><span>Total com seguro (15%)</span><strong>R$ {{ cartTotal() * 1.15 | number:'1.2-2':'pt-BR' }}</strong></div><small>Valores estimados, sem frete. O cupom e o seguro serão confirmados na finalização.</small></div>
          </section>
          <div class="subtotal-line cart-final-total"><span>Total estimado {{ shippingInsurance ? 'com seguro' : 'sem seguro' }}</span><strong>R$ {{ estimatedCartTotal() | number:'1.2-2':'pt-BR' }}</strong></div>
          <p>Frete e disponibilidade serão confirmados pelo atendimento.</p><button class="checkout-button" (click)="checkout()">Pedir pelo WhatsApp <span>→</span></button><small>O pedido será registrado como pendente e enviado ao WhatsApp para confirmação comercial.</small>
        </div>
      </div>
    </aside>
    <div class="checkout-overlay" *ngIf="checkoutOpen()" (click)="checkoutOpen.set(false)"></div>
    <section class="checkout-modal" *ngIf="checkoutOpen()" role="dialog" aria-modal="true" aria-labelledby="checkout-title">
      <div class="drawer-head">
        <div><p class="section-kicker">FINALIZAR PEDIDO</p><h2 id="checkout-title">Seus dados</h2></div>
        <button type="button" class="close-button" aria-label="Fechar checkout" (click)="checkoutOpen.set(false)">×</button>
      </div>
      <p class="checkout-intro">Preencha seus dados para registrar o pedido na loja. O atendimento confirmará frete e pagamento pelo WhatsApp.</p>
      <form class="checkout-form" (ngSubmit)="confirmCheckout()">
        <label>Nome completo<input name="customerName" [(ngModel)]="customerName" required minlength="3" autocomplete="name" placeholder="Seu nome completo"></label>
        <div class="checkout-form-row">
          <label>WhatsApp<input name="customerPhone" [(ngModel)]="customerPhone" required minlength="10" inputmode="tel" autocomplete="tel" placeholder="(11) 99999-9999"></label>
          <label>E-mail <span class="optional-label">opcional</span><input name="customerEmail" [(ngModel)]="customerEmail" type="email" autocomplete="email" placeholder="voce@email.com"></label>
        </div>
        <div class="checkout-form-row">
          <label>CEP <span class="optional-label">opcional</span><input name="customerCep" [(ngModel)]="customerCep" inputmode="numeric" autocomplete="postal-code" placeholder="00000-000"></label>
          <label>Número <span class="optional-label">opcional</span><input name="addressNumber" [(ngModel)]="addressNumber" autocomplete="address-line2" placeholder="Nº"></label>
        </div>
        <label>Endereço para entrega <span class="optional-label">opcional</span><input name="customerAddress" [(ngModel)]="customerAddress" autocomplete="street-address" placeholder="Rua, bairro e cidade"></label>
        <label>Cupom de afiliado ou desconto <span class="optional-label">opcional</span><input name="affiliateCoupon" [(ngModel)]="affiliateCoupon" autocapitalize="characters" placeholder="Ex.: BRUNO5"></label>
        <p class="checkout-note">O pedido será registrado como pendente. Preços, estoque e cupom serão conferidos no WooCommerce antes de abrir o WhatsApp.</p>
        <div class="checkout-modal-total"><span>Total estimado dos produtos</span><strong>{{ cartTotal() | number:'1.2-2':'pt-BR' }}</strong></div>
        <p class="checkout-error" *ngIf="checkoutError()">{{ checkoutError() }}</p>
        <button class="checkout-button" type="submit" [disabled]="checkoutSubmitting()">{{ checkoutSubmitting() ? 'Registrando pedido…' : 'Registrar pedido e continuar' }} <span>→</span></button>
      </form>
    </section>
    <div class="toast" *ngIf="toast()">{{ toast() }}</div>
  `
})
export class AppComponent {
  activePage = signal<'catalogo' | 'ofertas' | 'parceiros' | 'seguro'>('catalogo');
  pageTransition = signal(false);
  private transitionTimer: ReturnType<typeof setTimeout> | undefined;
  navigateTo(page: 'catalogo' | 'ofertas' | 'parceiros' | 'seguro') {
    if (this.activePage() === page) { this.menuOpen.set(false); window.scrollTo({ top: 0, behavior: 'smooth' }); return; }
    this.activePage.set(page);
    this.menuOpen.set(false);
    this.cartOpen.set(false);
    this.pageTransition.set(false);
    if (this.transitionTimer) clearTimeout(this.transitionTimer);
    requestAnimationFrame(() => { this.pageTransition.set(true); window.scrollTo({ top: 0, behavior: 'smooth' }); });
    this.transitionTimer = setTimeout(() => this.pageTransition.set(false), 320);
  }
  search = ''; sortBy = 'featured'; category = 'all'; availability = 'all'; typeFilter = 'all'; brandFilter = 'all'; shippingFilter = 'all';
  viewMode = signal<'grid' | 'list'>('grid');
  filtersOpen = signal(false); cartOpen = signal(false); menuOpen = signal(false); toast = signal('');
  checkoutOpen = signal(false);
  checkoutSubmitting = signal(false);
  checkoutError = signal('');
  customerName = ''; customerPhone = ''; customerEmail = ''; customerCep = ''; addressNumber = ''; customerAddress = ''; affiliateCoupon = ''; shippingState = ''; shippingInsurance = false;
  couponFeedback = signal('');
  brazilStates = [{code:'AC',name:'Acre'},{code:'AL',name:'Alagoas'},{code:'AP',name:'Amapá'},{code:'AM',name:'Amazonas'},{code:'BA',name:'Bahia'},{code:'CE',name:'Ceará'},{code:'DF',name:'Distrito Federal'},{code:'ES',name:'Espírito Santo'},{code:'GO',name:'Goiás'},{code:'MA',name:'Maranhão'},{code:'MT',name:'Mato Grosso'},{code:'MS',name:'Mato Grosso do Sul'},{code:'MG',name:'Minas Gerais'},{code:'PA',name:'Pará'},{code:'PB',name:'Paraíba'},{code:'PR',name:'Paraná'},{code:'PE',name:'Pernambuco'},{code:'PI',name:'Piauí'},{code:'RJ',name:'Rio de Janeiro'},{code:'RN',name:'Rio Grande do Norte'},{code:'RS',name:'Rio Grande do Sul'},{code:'RO',name:'Rondônia'},{code:'RR',name:'Roraima'},{code:'SC',name:'Santa Catarina'},{code:'SP',name:'São Paulo'},{code:'SE',name:'Sergipe'},{code:'TO',name:'Tocantins'}];
  favorites = signal<number[]>([]);
  productQuantities = signal<Record<number, number>>({});
  products = signal<Product[]>([]);
  catalogSource = signal<'loading' | 'king-shape' | 'woocommerce' | 'fallback'>('loading');
  catalogMessage = signal('Conectando ao catálogo da loja…');
  cartItems = signal<CartItem[]>(this.restoreCart());
  wordpressPartners = signal<WordPressPartner[]>([]);
  insuranceContent = signal<{ badge: string; title: string; subtitle: string; cards: WordPressInsuranceCard[]; summary: string }>({ badge: '', title: '', subtitle: '', cards: [], summary: '' });
  affiliateContent = signal<WordPressAffiliateContent>({ eyebrow: '', title: '', description: '', cta: '', url: '', items: [], steps: [] });
  wordpressContentLoading = signal(true);
  wordpressContentError = signal('');

  constructor() { void this.loadWooCommerceCatalog(); void this.loadWordPressContent(); }

  private async loadWordPressContent() {
    const api = 'https://kingshape.fit/wp-json/wp/v2';
    const headers = { Accept: 'application/json' };
    const loadPage = async (url: string): Promise<WordPressPage | null> => {
      try {
        const response = await fetch(url, { headers });
        if (!response.ok) {
          console.warn(`King Shape: WordPress respondeu ${response.status} para ${url}`);
          return null;
        }
        const data = await response.json();
        if (Array.isArray(data)) return (data[0] as WordPressPage) || null;
        return data as WordPressPage;
      } catch (error) {
        console.warn(`King Shape: falha ao consultar ${url}`, error);
        return null;
      }
    };

    try {
      // Carrega cada conteúdo de forma independente: uma página indisponível não bloqueia as outras.
      const [partnersPage, insurancePage, affiliatePage] = await Promise.all([
        loadPage(`${api}/pages/209`),
        loadPage(`${api}/pages/789`),
        loadPage(`${api}/pages?slug=seja-nosso-afiliado`)
      ]);

      if (partnersPage?.content?.rendered) this.parsePartners(partnersPage.content.rendered);
      if (insurancePage?.content?.rendered) this.parseInsurance(insurancePage.content.rendered);

      if (affiliatePage?.content?.rendered) {
        this.parseAffiliate(affiliatePage);
      } else {
        const affiliateSearch = await loadPage(`${api}/pages?search=afiliado&per_page=100`);
        if (affiliateSearch) this.parseAffiliate(affiliateSearch);
        else {
          try {
            const response = await fetch(`${api}/pages?search=afiliado&per_page=100`, { headers });
            if (response.ok) {
              const pages = await response.json() as WordPressPage[];
              const page = pages.find(p => /seja-nosso-afiliado|cadastro-afiliado/i.test(p.slug)) || pages.find(p => /afiliado/i.test(p.title?.rendered || ''));
              if (page) this.parseAffiliate(page);
            }
          } catch (error) {
            console.warn('King Shape: não foi possível localizar a página de afiliados.', error);
          }
        }
      }

      if (!partnersPage && !insurancePage) {
        this.wordpressContentError.set('Não foi possível carregar as páginas de parceiros e seguro do WordPress. Verifique a API e tente novamente.');
      } else if (!partnersPage || !insurancePage) {
        this.wordpressContentError.set('Parte do conteúdo do WordPress não carregou. Confira a conexão e tente novamente.');
      }
    } finally {
      this.wordpressContentLoading.set(false);
    }
  }

  private parsePartners(html: string) {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const cards = Array.from(doc.querySelectorAll('.partners .partner-card, .partner-card'));
    const parsed = cards.map((card, index) => {
      const name = card.querySelector('h1, h2, h3, h4, strong, b, .elementor-heading-title, .partner-name')?.textContent?.trim() || card.querySelector('a[href]')?.textContent?.trim() || `Parceiro ${index + 1}`;
      const description = Array.from(card.querySelectorAll('p')).map(p => p.textContent?.trim()).filter(Boolean).join(' ');
      const imageEl = card.querySelector('img');
      const image = imageEl?.getAttribute('src') || imageEl?.getAttribute('data-src') || imageEl?.getAttribute('data-lazy-src') || imageEl?.getAttribute('srcset')?.split(',')[0]?.trim().split(/\s+/)[0] || ''; 
      const url = card.querySelector('a[href]')?.getAttribute('href') || 'https://kingshape.fit/parceiros/';
      const label = card.querySelector('span, small')?.textContent?.trim() || name.split(/\s+/)[0].toUpperCase();
      return { name, description, image, url, label };
    }).filter(p => p.name && p.name !== 'Parceiro');
    this.wordpressPartners.set(parsed);
  }

  private parseInsurance(html: string) {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const section = doc.querySelector('.ks-insurance, .insurance-section, #seguro, [class*="insurance"]') || doc.body;
    const title = section.querySelector('h2')?.textContent?.trim() || 'Seguro de Entrega King Shape';
    const subtitle = section.querySelector('.ks-subtitle')?.textContent?.trim() || '';
    const badge = section.querySelector('.ks-badge')?.textContent?.trim() || '';
    const cardNodes = Array.from(section.querySelectorAll('.ks-card, .insurance-card, .elementor-icon-box-wrapper, .elementor-widget-container'));
    const cards = cardNodes.map(card => ({
      title: card.querySelector('h3, h4, h5, strong, .elementor-icon-box-title')?.textContent?.trim() || '',
      html: Array.from(card.children).filter(child => !['H3', 'H4', 'H5', 'STRONG'].includes(child.tagName)).map(child => child.outerHTML).join('')
    })).filter(card => card.title);
    if (!cards.length) {
      const headings = Array.from(section.querySelectorAll('h3, h4, h5')).filter(h => h.textContent?.trim());
      for (const heading of headings) {
        const parent = heading.parentElement;
        if (parent) cards.push({ title: heading.textContent?.trim() || '', html: Array.from(parent.children).filter(child => child !== heading).map(child => child.outerHTML).join('') });
      }
    }
    const summary = section.querySelector('.ks-highlight')?.textContent?.trim() || '';
    this.insuranceContent.set({ badge, title, subtitle, cards, summary });
  }

  private parseAffiliate(page: WordPressPage) {
    const doc = new DOMParser().parseFromString(page.content?.rendered || '', 'text/html');
    const whatsapp = 'https://wa.me/5511912355630?text=Ol%C3%A1%2C%20desejo%20ser%20um%20Parceiro%20da%20King%20Shape.';

    // A página do Elementor usa blocos HTML personalizados, então a busca genérica por
    // article/elementor-icon-box não encontrava todos os benefícios. Mantemos o conteúdo
    // completo confirmado pelo WordPress como estrutura de renderização nativa Angular.
    const mediaUrls = (() => { const found: string[] = []; doc.querySelectorAll('img[src], img[data-src], [style], [data-settings], style').forEach((el: Element) => { const img = el as HTMLImageElement; const direct = img.getAttribute('src') || img.getAttribute('data-src') || ''; if (/^https?:\/\//i.test(direct)) found.push(direct); const raw = [el.getAttribute('style') || '', el.getAttribute('data-settings') || '', el.tagName.toLowerCase() === 'style' ? el.textContent || '' : ''].join(' '); const re = /https?:\/\/[^\s\"'()]+?\.(?:webp|png|jpe?g|avif)(?:\?[^\s\"'()]*)?/ig; let match: RegExpExecArray | null; while ((match = re.exec(raw))) found.push(match[0]); }); return found.filter((url, index, all) => all.indexOf(url) === index); })();
    const items = [
      { title: 'PAINEL DE INDICAÇÃO', description: 'Tenha acesso a tudo.', url: whatsapp, image: mediaUrls[0] || '' },
      { title: 'COMISSÃO ATRATIVA', image: mediaUrls[1] || '', description: 'Comissão em tudo.', url: whatsapp },
      { title: 'PAGAMENTO SEMANAL', image: mediaUrls[2] || '', description: 'Receba toda sexta-feira.', url: whatsapp },
      { title: 'MATERIAIS DE MARKETING', image: mediaUrls[3] || '', description: 'Materiais bem estruturados.', url: whatsapp },
      { title: 'PRODUTOS ORIGINAIS', image: mediaUrls[4] || '', description: 'Qualidade em primeiro lugar.', url: whatsapp },
      { title: 'ATENDIMENTO PERSONALIZADO', image: mediaUrls[5] || '', description: 'Todos os clientes bem atendidos.', url: whatsapp },
      { title: 'Linha Premium', image: mediaUrls[6] || '', description: 'King Shape Cooper Pharma, ZPHCD, Eminence, Pharmacom, Alpha Pharma, Royal Pharmaceuthical e Canadá Labs.', url: whatsapp },
      { title: 'Tradicionais', image: mediaUrls[7] || '', description: 'King Shape Landerlan, Lander Gold, Muscle Pharma, King Pharma, American Plus e Roid Company.', url: whatsapp },
      { title: 'Peptídeos', image: mediaUrls[8] || '', description: 'King Shape: um oceano de possibilidades com a Neuroceptix, Bletter e outros laboratórios conceituados.', url: whatsapp },
      { title: 'Emagrecedores', image: mediaUrls[9] || '', description: 'King Shape TG, Lipoless, Lipoland, Tirzec e Retatrutida dos melhores laboratórios do mundo.', url: whatsapp }
    ];

    const mainLink = doc.querySelector('a[href^="https://wa.me/"]') as HTMLAnchorElement | null;
    const headingText = doc.querySelector('h1, h2, h3')?.textContent?.trim() || '';
    const paragraphText = Array.from(doc.querySelectorAll('p'))
      .map(p => p.textContent?.replace(/\s+/g, ' ').trim())
      .find(p => !!p && /transparência do início ao fim/i.test(p)) ||
      'Transparência do início ao fim, aqui você não fica no boca a boca, você enxerga seus indicados e tudo que está acontecendo no processo de vendas.';

    this.affiliateContent.set({
      eyebrow: 'INDIQUE & GANHE',
      title: /seja nosso parceiro/i.test(headingText) ? headingText : 'Indique & Ganhe Seja Nosso Parceiro',
      description: paragraphText,
      cta: mainLink?.textContent?.replace(/↗/g, '').trim() || 'QUERO SER PARCEIRO',
      url: mainLink?.href || whatsapp,
      items,
      steps: [
        { number: '01', title: 'ENVIE INFORMAÇÕES', description: 'Nos conte sobre o trabalho que você desenvolve e como pretende divulgar.', tags: ['Perfil + canais', 'Público-alvo'] },
        { number: '02', title: 'CADASTRO APROVADO', description: 'Após análise, seu cadastro é criado e seu acesso é liberado.', tags: ['Aprovação rápida', 'Acesso painel'] },
        { number: '03', title: 'DIVULGUE SEU LINK', description: 'Você recebe um link exclusivo para rastrear indicações com segurança.', tags: ['Link único', 'Rastreamento'] },
        { number: '04', title: 'RECEBA COMISSÕES', description: 'Receba por cada venda realizada através do seu link.', tags: ['Transparência total', 'Histórico ganhos'] },
        { number: '05', title: 'PAINEL DE CONTROLE', description: 'Controle cliques, cadastros, vendas e comissões em tempo real.', tags: ['Métricas real', 'Tudo centralizado'] }
      ]
    });
  }
  private async loadWooCommerceCatalog() {
    // O catálogo oficial da King Shape é o CPT ksa_product, servido pela API própria.
    // Em desenvolvimento local, consulta o WordPress de produção para evitar depender de uma instalação local.
    const apiBase = 'https://kingshape.fit/wp-json/ksa/v1/products';
    try {
      const firstResponse = await fetch(`${apiBase}?page=1&per_page=100`, { headers: { Accept: 'application/json' } });
      if (!firstResponse.ok) throw new Error(`A API do catálogo respondeu ${firstResponse.status}.`);
      const firstData = await firstResponse.json() as KingShapeApiResponse;
      if (!Array.isArray(firstData.products)) throw new Error('A API não retornou a lista de produtos esperada.');
      const allItems = [...firstData.products];
      const pages = Math.max(1, Number(firstData.pages || 1));
      for (let page = 2; page <= pages; page++) {
        const response = await fetch(`${apiBase}?page=${page}&per_page=100`, { headers: { Accept: 'application/json' } });
        if (!response.ok) throw new Error(`Falha ao carregar a página ${page} do catálogo (${response.status}).`);
        const data = await response.json() as KingShapeApiResponse;
        if (Array.isArray(data.products)) allItems.push(...data.products);
      }

      const today = new Date();
      const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
      const liveProducts = allItems
        .filter(item => item && Number(item.id) > 0 && !!item.name && item.hidden !== true)
        .map((item): Product => {
          const price = Number(item.price ?? 0);
          const available = String(item.status || '').trim().toLocaleLowerCase('pt-BR') === 'disponível';
          const starts = String(item.display_start || '').slice(0, 10);
          const ends = String(item.display_end || '').slice(0, 10);
          const withinSchedule = (!starts || starts <= todayKey) && (!ends || ends >= todayKey);
          const isFeatured = (!!item.featured || !!item.pinned) && withinSchedule;
          const badge = withinSchedule ? (String(item.card_label || '').trim() || (isFeatured ? 'DESTAQUE' : undefined)) : undefined;
          const category = String(item.category || item.type || 'Produtos');
          return {
            id: Number(item.id),
            brand: String(item.brand || category),
            name: String(item.name),
            category,
            type: String(item.type || category),
            shipping: Array.isArray(item.delivery) ? item.delivery : [],
            price: Number.isFinite(price) ? price : 0,
            available,
            premium: isFeatured,
            image: String(item.image || '').trim() || 'assets/product-placeholder.svg',
            ...(badge ? { badge } : {}),
            sku: String(item.sku || '').trim() || undefined
          };
        })
        .filter(p => p.id > 0 && p.name);

      if (!liveProducts.length) throw new Error('Nenhum produto visível foi encontrado no catálogo.');
      this.products.set(liveProducts);
      this.catalogSource.set('king-shape');
      this.catalogMessage.set(`${liveProducts.length} produtos carregados do catálogo King Shape.`);
      // Atualiza os itens persistidos com os dados atuais do catálogo.
      const byId = new Map(liveProducts.map(p => [p.id, p]));
      this.cartItems.update(items => {
        const next = items.filter(item => byId.has(item.product.id)).map(item => ({ ...item, product: byId.get(item.product.id)! }));
        this.saveCart(next);
        return next;
      });
    } catch (error) {
      this.products.set([]);
      this.catalogSource.set('fallback');
      this.catalogMessage.set('Não foi possível carregar o catálogo King Shape. Verifique sua conexão e tente novamente.');
      console.warn('King Shape: falha ao carregar catálogo personalizado.', error);
    }
  }

  brands() { return [...new Set(this.products().map(p => p.brand))].sort((a,b) => a.localeCompare(b, 'pt-BR')); }
  categories() { return [...new Set(this.products().map(p => p.category))].sort((a,b) => a.localeCompare(b, 'pt-BR')); }
  offerProducts() { const query = this.search.trim().toLocaleLowerCase('pt-BR'); let list = this.products().filter(p => (!!p.oldPrice && p.price < p.oldPrice || !!p.premium || !!p.badge) && p.available && (!query || `${p.name} ${p.brand} ${p.category}`.toLocaleLowerCase('pt-BR').includes(query))); if (this.sortBy === 'price-asc') list = [...list].sort((a,b)=>a.price-b.price); if (this.sortBy === 'price-desc') list = [...list].sort((a,b)=>b.price-a.price); if (this.sortBy === 'name') list = [...list].sort((a,b)=>a.name.localeCompare(b.name,'pt-BR')); return list; }
  filteredProducts() {
    const query = this.search.trim().toLocaleLowerCase('pt-BR');
    let list = this.products().filter(p => (!query || `${p.name} ${p.brand} ${p.category}`.toLocaleLowerCase('pt-BR').includes(query)) && (this.category === 'all' || p.category === this.category) && (this.typeFilter === 'all' || p.type === this.typeFilter) && (this.brandFilter === 'all' || p.brand === this.brandFilter) && (this.shippingFilter === 'all' || p.shipping.includes(this.shippingFilter)) && (this.availability === 'all' || (this.availability === 'available' ? p.available : !p.available)));
    if (this.sortBy === 'price-asc') list = [...list].sort((a,b)=>a.price-b.price);
    if (this.sortBy === 'price-desc') list = [...list].sort((a,b)=>b.price-a.price);
    if (this.sortBy === 'name') list = [...list].sort((a,b)=>a.name.localeCompare(b.name,'pt-BR'));
    return list;
  }
  cartCount = computed(() => this.cartItems().reduce((sum,item)=>sum+item.qty,0));
  cartTotal = computed(() => this.cartItems().reduce((sum,item)=>sum+item.qty*(Number(item.product.price) || 0),0));
  activeFilterCount() { return Number(this.category !== 'all')+Number(this.availability !== 'all')+Number(this.typeFilter !== 'all')+Number(this.brandFilter !== 'all')+Number(this.shippingFilter !== 'all'); }
  trackProduct(_: number, product: Product) { return product.id; }
  selectedProductQty(id: number) { return this.productQuantities()[id] ?? 1; }
  changeProductQty(id: number, delta: number) { this.productQuantities.update(qtys => ({ ...qtys, [id]: Math.max(1, Math.min(99, (qtys[id] ?? 1) + delta)) })); }
  addToCart(product: Product, quantity = 1) { if (!product.available) return; const qty = Math.max(1, Math.min(99, Math.floor(quantity))); this.cartItems.update(items => { const found=items.find(i=>i.product.id===product.id); const next=found?items.map(i=>i.product.id===product.id?{...i,qty:i.qty+qty}:i):[...items,{product,qty}]; this.saveCart(next); return next; }); this.productQuantities.update(qtys => ({ ...qtys, [product.id]: 1 })); this.showToast(`${qty} ${qty === 1 ? 'unidade adicionada' : 'unidades adicionadas'} ao carrinho`); }
  changeQty(id:number,delta:number) { this.cartItems.update(items=>{const next=items.map(i=>i.product.id===id?{...i,qty:i.qty+delta}:i).filter(i=>i.qty>0);this.saveCart(next);return next;}); }
  removeFromCart(id:number) { this.cartItems.update(items=>{const next=items.filter(i=>i.product.id!==id);this.saveCart(next);return next;}); }
  toggleFavorite(id:number) { this.favorites.update(ids=>ids.includes(id)?ids.filter(x=>x!==id):[...ids,id]); }
  clearFilters() { this.search='';this.category='all';this.availability='all';this.typeFilter='all';this.brandFilter='all';this.shippingFilter='all';this.sortBy='featured'; }
  onImageError(event: Event) { const image = event.target as HTMLImageElement; if (image && !image.src.endsWith('/assets/product-placeholder.svg')) image.src = '/assets/product-placeholder.svg'; }
  focusSearch() { if (this.activePage() !== 'catalogo') this.navigateTo('catalogo'); setTimeout(() => { document.querySelector<HTMLInputElement>('.search-box input')?.focus(); document.querySelector('.toolbar')?.scrollIntoView({ behavior: 'smooth', block: 'center' }); }, 80); }
  showAccountMessage() { this.showToast('Área do cliente será conectada em uma próxima etapa'); }

  estimatedCartTotal() { return this.cartTotal() * (this.shippingInsurance ? 1.15 : 1); }
  checkCouponFormat() { this.couponFeedback.set(this.affiliateCoupon.trim() ? 'Cupom informado. A validade e o desconto serão confirmados pela loja ao finalizar o pedido.' : 'Digite um cupom para continuar.'); }

  checkout() {
    if (this.catalogSource() !== 'woocommerce') { this.showToast('Catálogo conectado. O checkout precisa ser integrado à API KSA antes de registrar pedidos.'); return; }
    if (!this.cartItems().length) {
      this.showToast('Adicione pelo menos um produto ao carrinho');
      return;
    }
    this.checkoutOpen.set(true);
  }

  async confirmCheckout() {
    if (this.catalogSource() !== 'woocommerce') { this.checkoutError.set('O catálogo King Shape está conectado, mas o checkout ainda precisa usar a API KSA. Nenhum pedido foi enviado.'); return; }
    const items = this.cartItems();
    if (!items.length) { this.checkoutOpen.set(false); this.showToast('Seu carrinho está vazio'); return; }
    if (this.customerName.trim().length < 3 || this.customerPhone.replace(/\D/g, '').length < 10) {
      this.checkoutError.set('Informe seu nome completo e um WhatsApp válido.');
      return;
    }
    if (this.checkoutSubmitting()) return;
    this.checkoutSubmitting.set(true);
    this.checkoutError.set('');
    // Abre uma janela durante o gesto do usuário para evitar bloqueio de popup após a chamada à API.
    const whatsappWindow = window.open('about:blank', '_blank');
    try {
      const apiBase = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
        ? 'http://localhost:8881/wp-json/ks-checkout/v1'
        : `${window.location.origin}/wp-json/ks-checkout/v1`;
      const response = await fetch(`${apiBase}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer: {
            name: this.customerName.trim(), phone: this.customerPhone.trim(), email: this.customerEmail.trim(),
            postcode: this.customerCep.trim(), address: this.customerAddress.trim(), address_number: this.addressNumber.trim(), state: this.shippingState
          },
          coupon_code: this.affiliateCoupon.trim().toUpperCase(),
          shipping_state: this.shippingState,
          shipping_insurance: this.shippingInsurance,
          items: items.map(({ product, qty }) => ({ woocommerce_product_id: product.id, product_id: product.id, quantity: qty }))
        })
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || !result.success || !result.order) {
        throw new Error(result.message || 'Não foi possível registrar o pedido. Confira a configuração da loja e tente novamente.');
      }
      const order = result.order;
      const lines = (order.items || []).map((item: any) => `• ${item.name} x${item.quantity} = ${this.formatBRL(Number(item.total) || 0)}`);
      const message = [
        `Olá! Registrei um pedido na King Shape.`,
        `Pedido WooCommerce: #${order.number}`,
        `Status: pendente de confirmação`, '',
        'DADOS DO CLIENTE',
        `Nome: ${this.customerName.trim()}`,
        `WhatsApp: ${this.customerPhone.trim()}`,
        ...(this.customerEmail.trim() ? [`E-mail: ${this.customerEmail.trim()}`] : []),
        ...(this.customerCep.trim() ? [`CEP: ${this.customerCep.trim()}`] : []),
        ...(this.shippingState ? [`Estado de entrega: ${this.shippingState}`] : []),
        `Seguro da encomenda: ${this.shippingInsurance ? 'Sim (15%)' : 'Não'}`, 
        ...(this.customerAddress.trim() ? [`Endereço: ${this.customerAddress.trim()}`] : []),
        ...(this.addressNumber.trim() ? [`Número: ${this.addressNumber.trim()}`] : []),
        ...(order.coupon ? [`Cupom aplicado: ${order.coupon}`] : []), '',
        'ITENS DO PEDIDO', ...lines, '',
        `Subtotal: ${this.formatBRL(Number(order.subtotal) || 0)}`,
        `Desconto: ${this.formatBRL(Number(order.discount) || 0)}`,
        `Total registrado: ${this.formatBRL(Number(order.total) || 0)}`,
        '', 'Por favor, confirmem frete, disponibilidade e instruções de pagamento.'
      ].join('\n');
      const whatsappUrl = `https://wa.me/5511941749894?text=${encodeURIComponent(message)}`;
      if (whatsappWindow) { whatsappWindow.opener = null; whatsappWindow.location.href = whatsappUrl; }
      else { this.checkoutError.set('O navegador bloqueou a abertura do WhatsApp. Permita pop-ups e tente novamente.'); return; }
      this.checkoutOpen.set(false);
      this.showToast(`Pedido #${order.number} registrado como pendente`);
    } catch (error) {
      if (whatsappWindow && !whatsappWindow.closed) whatsappWindow.close();
      this.checkoutError.set(error instanceof Error ? error.message : 'Erro inesperado ao registrar o pedido.');
    } finally {
      this.checkoutSubmitting.set(false);
    }
  }

  private formatBRL(value: number): string {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  }
  private showToast(message:string) { this.toast.set(message); setTimeout(()=>this.toast.set(''),2400); }
  private saveCart(items:CartItem[]) { try { localStorage.setItem('ks-prototype-cart',JSON.stringify(items.map(i=>({id:i.product.id,qty:i.qty})))); } catch {} }
  private restoreCart():CartItem[] { try { const saved=JSON.parse(localStorage.getItem('ks-prototype-cart')||'[]') as {id:number;qty:number}[]; return saved.flatMap(s=>{const product=this.products()?.find(p=>p.id===s.id);return product&&s.qty>0?[{product,qty:s.qty}]:[];}); } catch { return []; } }
}
