import { CommonModule } from '@angular/common';
import { Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

type Product = { id: number; brand: string; name: string; category: string; type: string; shipping: string[]; price: number; oldPrice?: number; available: boolean; premium?: boolean; image: string; badge?: string; };
type CartItem = { product: Product; qty: number };

@Component({
  selector: 'ks-root', standalone: true, imports: [CommonModule, FormsModule],
  template: `
    <header class="topbar" id="top">
      <button class="icon-button menu-button" aria-label="Abrir menu" (click)="menuOpen.set(!menuOpen())">☰</button>
      <a class="brand" href="javascript:void(0)" (click)="navigateTo('catalogo')" aria-label="King Shape início"><img class="brand-logo" src="assets/king-shape-logo.jpg" alt="Símbolo King Shape"><img class="brand-wordmark-image" src="assets/king-shape-wordmark.png" alt="KINGSHAPE"></a>
      <nav class="desktop-nav" aria-label="Navegação principal"><button [class.active]="activePage() === 'catalogo'" (click)="navigateTo('catalogo')">Produtos</button><button [class.active]="activePage() === 'parceiros'" (click)="navigateTo('parceiros')">Parceiros</button><button [class.active]="activePage() === 'afiliados'" (click)="navigateTo('afiliados')">Seja Nosso Afiliado</button><button [class.active]="activePage() === 'seguro'" (click)="navigateTo('seguro')">Seguro</button></nav>
      <div class="header-actions"><button class="header-action search-action" aria-label="Buscar produtos" (click)="focusSearch()"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.8" cy="10.8" r="6.8"></circle><path d="m16 16 5 5"></path></svg></button><button class="header-action account-action" aria-label="Minha conta" title="Minha conta" (click)="showAccountMessage()"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="7.5" r="4"></circle><path d="M4 21v-2a8 8 0 0 1 16 0v2z"></path></svg></button><button class="header-action cart-head" aria-label="Abrir carrinho" (click)="cartOpen.set(true)"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 3h2l2.4 12.2a2 2 0 0 0 2 1.6h9.8a2 2 0 0 0 1.9-1.4L22 8H5"></path><circle cx="9" cy="21" r="1"></circle><circle cx="18" cy="21" r="1"></circle></svg><b>{{ cartCount() }}</b></button></div>
    </header>
    <div class="menu-panel" *ngIf="menuOpen()"><button (click)="navigateTo('catalogo')">Produtos</button><button (click)="navigateTo('parceiros')">Parceiros</button><button (click)="navigateTo('afiliados')">Seja Nosso Afiliado</button><button (click)="navigateTo('seguro')">Seguro</button><button (click)="cartOpen.set(true); menuOpen.set(false)">Meu carrinho</button></div>
    <nav class="mobile-tabbar" aria-label="Navegação do aplicativo">
      <button class="tab-item" [class.active]="activePage() === 'catalogo'" (click)="navigateTo('catalogo')"><span class="tab-icon">⌂</span><span>Produtos</span></button>
      <button class="tab-item" [class.active]="activePage() === 'parceiros'" (click)="navigateTo('parceiros')"><span class="tab-icon">♧</span><span>Parceiros</span></button>
      <button class="tab-item tab-cart" [class.active]="cartOpen()" (click)="cartOpen.set(true)" aria-label="Abrir carrinho"><span class="tab-icon tab-cart-icon"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 3h2l2.4 12.2a2 2 0 0 0 2 1.6h9.8a2 2 0 0 0 1.9-1.4L22 8H5"></path><circle cx="9" cy="21" r="1"></circle><circle cx="18" cy="21" r="1"></circle></svg><i>{{ cartCount() }}</i></span><span>Carrinho</span></button>
      <button class="tab-item" [class.active]="activePage() === 'afiliados'" (click)="navigateTo('afiliados')"><span class="tab-icon">✦</span><span>Afiliados</span></button>
      <button class="tab-item" [class.active]="activePage() === 'seguro'" (click)="navigateTo('seguro')"><span class="tab-icon">◇</span><span>Seguro</span></button>
    </nav>

    <main id="top" class="page-shell">


      <div class="app-page" [class.page-enter]="pageTransition()" *ngIf="activePage() === 'catalogo'" aria-label="Página de produtos">
      <section class="catalog-head" id="catalogo">
        <div><p class="section-kicker">EXPLORE A LOJA</p><h2>Catálogo <span>de produtos</span></h2><p class="muted">{{ filteredProducts().length }} produtos encontrados</p></div>
        <button class="filter-toggle" (click)="filtersOpen.set(!filtersOpen())">☷ <span>Filtrar</span><span class="filter-count" *ngIf="activeFilterCount()">{{ activeFilterCount() }}</span></button>
      </section>

      <section class="toolbar">
        <label class="search-box"><span>⌕</span><input [(ngModel)]="search" placeholder="Buscar produto ou marca..." aria-label="Buscar produto ou marca"></label>
        <label class="sort-box"><span>Ordenar</span><select [(ngModel)]="sortBy" aria-label="Ordenar produtos"><option value="featured">Destaques</option><option value="price-asc">Menor preço</option><option value="price-desc">Maior preço</option><option value="name">Nome A–Z</option></select></label>
      </section>

      <section class="filters" *ngIf="filtersOpen()">
        <label>Categoria<select [(ngModel)]="category"><option value="all">Todas as categorias</option><option value="Injetáveis">Injetáveis</option><option value="Suplementos">Suplementos</option><option value="Acessórios">Acessórios</option></select></label>
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
            <button class="add-button" [disabled]="!product.available" (click)="addToCart(product)"><span>Adicionar</span><span class="add-plus">+</span></button>
          </div>
        </article>
      </section>
      <ng-template #emptyState><div class="empty-state"><span>⌕</span><h3>Nenhum produto encontrado</h3><p>Tente mudar a busca ou remover os filtros.</p><button class="clear-filters" (click)="clearFilters()">Limpar busca e filtros</button></div></ng-template>

      </div>
      <div class="app-page" [class.page-enter]="pageTransition()" *ngIf="activePage() === 'parceiros'" aria-label="Página de parceiros">
      <section class="content-section partners-section" id="parceiros">
        <div class="content-heading"><p class="section-kicker">PARCEIROS</p><h2>Recomendamos</h2><p>Conheça profissionais e conteúdos que fazem parte da comunidade King Shape.</p></div>
        <div class="partner-grid">
          <article class="partner-card"><div class="partner-art partner-art-ander"><span>ANDER</span><small>Transforma Mente 365</small></div><h3>Transforma Mente 365</h3><p>Protocolos de treinos, dieta e hormonais.</p><a class="outline-cta" href="https://kingshape.fit/" target="_blank" rel="noopener">SAIBA MAIS <span>↗</span></a></article>
          <article class="partner-card"><div class="partner-art partner-art-william"><span>WILLIAM</span><small>William Giudicce</small></div><h3>William Giudicce</h3><p>Protocolos de treino e hormonais.</p><a class="outline-cta" href="https://kingshape.fit/" target="_blank" rel="noopener">SAIBA MAIS <span>↗</span></a></article>
          <article class="partner-card"><div class="partner-art partner-art-rafael"><span>RAFAEL</span><small>Rafael Jeffery</small></div><h3>Rafael Jeffery</h3><p>Protocolos de treinos, dieta e hormonais.</p><a class="outline-cta" href="https://kingshape.fit/" target="_blank" rel="noopener">SAIBA MAIS <span>↗</span></a></article>
        </div>
      </section>

      </div>
      <div class="app-page" [class.page-enter]="pageTransition()" *ngIf="activePage() === 'afiliados'" aria-label="Página de afiliados">
      <section class="content-section affiliate-section" id="afiliados">
        <div class="affiliate-hero"><p class="section-kicker">INDIQUE &amp; GANHE</p><h2>Seja Nosso <span>Parceiro</span></h2><p>Transparência do início ao fim: acompanhe seus indicados e tenha mais clareza sobre o processo de vendas.</p><a class="gold-cta" href="https://wa.me/5511941749894?text=Ol%C3%A1%21%20Quero%20saber%20como%20ser%20parceiro%20da%20King%20Shape." target="_blank" rel="noopener">QUERO SER PARCEIRO <span>↗</span></a></div>
        <div class="affiliate-benefits">
          <article class="benefit-card"><div class="benefit-art"><span>01</span><b>💸</b></div><h3>Pagamento semanal</h3><p>Consulte as regras e acompanhe os pagamentos do programa de parceiros.</p><a href="https://wa.me/5511941749894?text=Ol%C3%A1%21%20Gostaria%20de%20saber%20sobre%20pagamentos%20do%20programa%20de%20parceiros." target="_blank" rel="noopener">SEJA PARCEIRO ↗</a></article>
          <article class="benefit-card"><div class="benefit-art"><span>02</span><b>✦</b></div><h3>Materiais de marketing</h3><p>Materiais para ajudar você a divulgar a loja e apresentar os produtos.</p><a href="https://wa.me/5511941749894?text=Ol%C3%A1%21%20Quero%20conhecer%20os%20materiais%20de%20marketing%20para%20parceiros." target="_blank" rel="noopener">SEJA PARCEIRO ↗</a></article>
          <article class="benefit-card"><div class="benefit-art"><span>03</span><b>♛</b></div><h3>Produtos originais</h3><p>Conheça o catálogo e as informações disponíveis para divulgação.</p><a href="https://wa.me/5511941749894?text=Ol%C3%A1%21%20Quero%20saber%20mais%20sobre%20os%20produtos%20da%20King%20Shape." target="_blank" rel="noopener">SEJA PARCEIRO ↗</a></article>
        </div>
      </section>

      </div>
      <div class="app-page" [class.page-enter]="pageTransition()" *ngIf="activePage() === 'seguro'" aria-label="Página de seguro">
      <section class="content-section insurance-section" id="seguro">
        <div class="insurance-heading"><span class="insurance-pill">🛡️ Proteção Premium</span><h2>Seguro de Entrega King Shape</h2><p>Mais segurança, mais tranquilidade e cobertura para imprevistos no envio do seu pedido.</p></div>
        <article class="insurance-card"><h3>1. Finalidade do Seguro</h3><p>O <strong>Seguro de Entrega King Shape</strong> foi criado para oferecer proteção adicional à sua compra em situações excepcionais durante o processo de envio.</p><p>A cobertura proposta inclui:</p><ul><li><strong>Extravio da encomenda</strong> durante o transporte por Correios ou transportadora;</li><li><strong>Retenção ou apreensão</strong> por órgãos fiscalizadores, como Receita Federal ou ANVISA.</li></ul><p>Em qualquer uma dessas situações, a King Shape informa que realizará o <strong>reenvio integral dos produtos</strong>, sem custo adicional ao cliente, conforme as condições aplicáveis.</p></article>
        <article class="insurance-card"><h3>2. Valor do Seguro</h3><p>O Seguro de Entrega possui custo correspondente a <strong>15% do valor total da compra</strong>.</p><p>A contratação é <strong>opcional</strong> e pode ser adicionada pelo cliente no momento da finalização do pedido.</p><p class="insurance-note">💡 Recomendado para quem busca uma camada adicional de proteção no envio.</p></article>
        <article class="insurance-card"><h3>3. Como contratar</h3><p>Antes de concluir o pedido, fale com o atendimento para confirmar a disponibilidade do seguro, o valor calculado e todas as condições de cobertura.</p><a class="gold-cta" href="https://wa.me/5511941749894?text=Ol%C3%A1%21%20Quero%20confirmar%20as%20condi%C3%A7%C3%B5es%20do%20Seguro%20de%20Entrega." target="_blank" rel="noopener">CONSULTAR CONDIÇÕES <span>↗</span></a></article>
        <p class="insurance-disclaimer">As informações desta página são ilustrativas e devem ser confirmadas com a King Shape antes da contratação. Solicite os termos completos, as exclusões e as condições aplicáveis ao seu pedido.</p>
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
        <div class="cart-summary"><div class="subtotal-line"><span>Subtotal</span><strong>R$ {{ cartTotal() | number:'1.2-2':'pt-BR' }}</strong></div><p>Frete e disponibilidade serão confirmados pelo atendimento.</p><button class="checkout-button" (click)="checkout()">Pedir pelo WhatsApp <span>→</span></button><small>O pedido será enviado ao WhatsApp para confirmação comercial.</small></div>
      </div>
    </aside>
    <div class="toast" *ngIf="toast()">{{ toast() }}</div>
  `
})
export class AppComponent {
  activePage = signal<'catalogo' | 'parceiros' | 'afiliados' | 'seguro'>('catalogo');
  pageTransition = signal(false);
  private transitionTimer: ReturnType<typeof setTimeout> | undefined;
  navigateTo(page: 'catalogo' | 'parceiros' | 'afiliados' | 'seguro') {
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
  favorites = signal<number[]>([]);
  private readonly products: Product[] = [
    {id:1,brand:'LANDERLAN',name:'Cipionato de Testosterona 200mg/2ml',category:'Injetáveis',type:'Injetáveis',shipping:['Transportadora','Sedex','PAC'],price:135,available:true,image:'assets/products/cipionato-lander-gold.webp'},
    {id:2,brand:'LANDERLAN',name:'Decaland Depot 200mg/ml',category:'Injetáveis',type:'Injetáveis',shipping:['Transportadora','Sedex','PAC'],price:135,available:true,image:'assets/products/decaland-lander-gold-deca.webp'},
    {id:3,brand:'COOPER PHARMA',name:'Testosterone Mix Injection 250mg/ml',category:'Injetáveis',type:'Injetáveis',shipping:['Transportadora','Sedex','PAC'],price:59,available:true,image:'assets/products/durateston-cooper-pharma-susobolic.webp'},
    {id:4,brand:'LANDERLAN',name:'Durateston Plus Gold 250mg/ml',category:'Injetáveis',type:'Injetáveis',shipping:['Transportadora','Sedex','PAC'],price:49,available:true,premium:true,image:'assets/products/durateston-lander-gold.png'},
    {id:5,brand:'LANDERLAN',name:'Testoland Depot 200mg/2ml',category:'Injetáveis',type:'Injetáveis',shipping:['Transportadora','Sedex','PAC'],price:139,available:true,premium:true,image:'assets/products/testoland-lander-diamond-cipionato.webp'},
    {id:6,brand:'COOPER PHARMA',name:'Testosterone Enanthate 250mg/ml',category:'Injetáveis',type:'Injetáveis',shipping:['Transportadora','Sedex','PAC'],price:59,available:true,image:'assets/products/testosterona-enantato-cooper-pharma-enanboli.webp'},
    {id:7,brand:'ZPHC',name:'Enantato de Testosterona 250mg/ml',category:'Injetáveis',type:'Injetáveis',shipping:['Transportadora','Sedex','PAC'],price:299,available:true,premium:true,image:'assets/products/enantato-de-testosterona-zphc-de-250mg.webp'},
    {id:8,brand:'ZPHC',name:'Enantato de Testosterona ZPHC 250mg/ml — frasco',category:'Injetáveis',type:'Injetáveis',shipping:['Transportadora','Sedex','PAC'],price:299,available:true,premium:true,image:'assets/products/enantato-zphc-vial.webp'},
    {id:9,brand:'KING PHARMA',name:'King Masteron Drostanolona Propionato 100mg/ml',category:'Injetáveis',type:'Injetáveis',shipping:['Transportadora','Sedex','PAC'],price:199,available:true,premium:true,image:'assets/products/king-masteron.webp'},
    {id:10,brand:'MUSCLE LABS',name:'Testoviron 250mg/ml',category:'Injetáveis',type:'Injetáveis',shipping:['Transportadora','Sedex','PAC'],price:249,available:true,image:'assets/products/testosterona-enantato-mucle-labs-testoviron.webp'},
    {id:11,brand:'ZPHC',name:'Retatrutida 120mg (5 vial de 24mg)',category:'Injetáveis',type:'Injetáveis',shipping:['Transportadora','Sedex','PAC'],price:2997,oldPrice:3297,available:true,premium:true,badge:'OFERTA LIMITADA',image:'assets/products/zphc-reta-120.jpeg'}
  ];
  cartItems = signal<CartItem[]>(this.restoreCart());
  brands() { return [...new Set(this.products.map(p => p.brand))].sort((a,b) => a.localeCompare(b, 'pt-BR')); }
  filteredProducts() {
    const query = this.search.trim().toLocaleLowerCase('pt-BR');
    let list = this.products.filter(p => (!query || `${p.name} ${p.brand} ${p.category}`.toLocaleLowerCase('pt-BR').includes(query)) && (this.category === 'all' || p.category === this.category) && (this.typeFilter === 'all' || p.type === this.typeFilter) && (this.brandFilter === 'all' || p.brand === this.brandFilter) && (this.shippingFilter === 'all' || p.shipping.includes(this.shippingFilter)) && (this.availability === 'all' || (this.availability === 'available' ? p.available : !p.available)));
    if (this.sortBy === 'price-asc') list = [...list].sort((a,b)=>a.price-b.price);
    if (this.sortBy === 'price-desc') list = [...list].sort((a,b)=>b.price-a.price);
    if (this.sortBy === 'name') list = [...list].sort((a,b)=>a.name.localeCompare(b.name,'pt-BR'));
    return list;
  }
  cartCount = computed(() => this.cartItems().reduce((sum,item)=>sum+item.qty,0));
  cartTotal = computed(() => this.cartItems().reduce((sum,item)=>sum+item.qty*(Number(item.product.price) || 0),0));
  activeFilterCount() { return Number(this.category !== 'all')+Number(this.availability !== 'all')+Number(this.typeFilter !== 'all')+Number(this.brandFilter !== 'all')+Number(this.shippingFilter !== 'all'); }
  trackProduct(_: number, product: Product) { return product.id; }
  addToCart(product: Product) { if (!product.available) return; this.cartItems.update(items => { const found=items.find(i=>i.product.id===product.id); const next=found?items.map(i=>i.product.id===product.id?{...i,qty:i.qty+1}:i):[...items,{product,qty:1}]; this.saveCart(next); return next; }); this.showToast('Produto adicionado ao carrinho'); }
  changeQty(id:number,delta:number) { this.cartItems.update(items=>{const next=items.map(i=>i.product.id===id?{...i,qty:i.qty+delta}:i).filter(i=>i.qty>0);this.saveCart(next);return next;}); }
  removeFromCart(id:number) { this.cartItems.update(items=>{const next=items.filter(i=>i.product.id!==id);this.saveCart(next);return next;}); }
  toggleFavorite(id:number) { this.favorites.update(ids=>ids.includes(id)?ids.filter(x=>x!==id):[...ids,id]); }
  clearFilters() { this.search='';this.category='all';this.availability='all';this.typeFilter='all';this.brandFilter='all';this.shippingFilter='all';this.sortBy='featured'; }
  onImageError(event: Event) { const image = event.target as HTMLImageElement; if (image && !image.src.endsWith('/assets/product-placeholder.svg')) image.src = '/assets/product-placeholder.svg'; }
  focusSearch() { if (this.activePage() !== 'catalogo') this.navigateTo('catalogo'); setTimeout(() => { document.querySelector<HTMLInputElement>('.search-box input')?.focus(); document.querySelector('.toolbar')?.scrollIntoView({ behavior: 'smooth', block: 'center' }); }, 80); }
  showAccountMessage() { this.showToast('Área do cliente será conectada em uma próxima etapa'); }

  checkout() {
    const items = this.cartItems();
    if (!items.length) {
      this.showToast('Adicione pelo menos um produto ao carrinho');
      return;
    }

    const lines = items.map(({ product, qty }) => {
      const unitPrice = Number(product.price) || 0;
      const subtotal = unitPrice * qty;
      return `• ${product.name}\n  Quantidade: ${qty}\n  Preço unitário: ${this.formatBRL(unitPrice)}\n  Subtotal: ${this.formatBRL(subtotal)}`;
    });
    const message = [
      'Olá! Gostaria de fazer um pedido na King Shape.',
      '',
      ...lines,
      '',
      `Total estimado: ${this.formatBRL(this.cartTotal())}`,
      '',
      'Poderiam confirmar disponibilidade, valores e condições de entrega?'
    ].join('\n');

    const whatsappUrl = `https://wa.me/5511941749894?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  }

  private formatBRL(value: number): string {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  }
  private showToast(message:string) { this.toast.set(message); setTimeout(()=>this.toast.set(''),2400); }
  private saveCart(items:CartItem[]) { try { localStorage.setItem('ks-prototype-cart',JSON.stringify(items.map(i=>({id:i.product.id,qty:i.qty})))); } catch {} }
  private restoreCart():CartItem[] { try { const saved=JSON.parse(localStorage.getItem('ks-prototype-cart')||'[]') as {id:number;qty:number}[]; return saved.flatMap(s=>{const product=this.products?.find(p=>p.id===s.id);return product&&s.qty>0?[{product,qty:s.qty}]:[];}); } catch { return []; } }
}
