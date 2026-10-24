<?php
/**
 * Plugin Name: King Shape Checkout WooCommerce
 * Description: Registra pedidos pendentes do storefront Angular no WooCommerce, validando produtos, preços, estoque e cupons no servidor.
 * Version: 1.0.0
 * Requires Plugins: woocommerce
 */
if (!defined('ABSPATH')) exit;

class KS_Checkout_WooCommerce {
    const OPTION = 'ks_checkout_product_map';
    const NS = 'ks-checkout/v1';
    public function __construct() {
        add_action('admin_menu', [$this, 'menu']);
        add_action('admin_init', [$this, 'settings']);
        add_action('rest_api_init', [$this, 'routes']);
        add_action('rest_api_init', [$this, 'cors']);
    }
    public function menu() { add_submenu_page('woocommerce', 'King Shape Checkout', 'King Shape Checkout', 'manage_woocommerce', 'ks-checkout', [$this, 'page']); }
    public function settings() { register_setting('ks_checkout_group', self::OPTION, ['type'=>'array','sanitize_callback'=>[$this,'sanitize_map'],'default'=>[]]); }
    public function sanitize_map($input) {
        $out=[]; if (!is_array($input)) return $out;
        for ($i=1;$i<=11;$i++) $out[$i]=isset($input[$i]) ? absint($input[$i]) : 0;
        return $out;
    }
    public function page() {
        if (!current_user_can('manage_woocommerce')) return;
        $map=get_option(self::OPTION, []); $labels=[1=>'Cipionato de Testosterona 200mg/2ml',2=>'Decaland Depot 200mg/ml',3=>'Testosterone Mix Injection 250mg/ml',4=>'Durateston Plus Gold 250mg/ml',5=>'Testoland Depot 200mg/2ml',6=>'Testosterone Enanthate 250mg/ml',7=>'Enantato de Testosterona 250mg/ml',8=>'Enantato de Testosterona ZPHC — frasco',9=>'King Masteron Drostanolona Propionato',10=>'Testoviron 250mg/ml',11=>'Retatrutida 120mg'];
        echo '<div class="wrap"><h1>King Shape — Checkout WooCommerce</h1><p>O catálogo Angular consome os produtos publicados pela Store API do WooCommerce. O checkout usa o ID real do produto recebido do catálogo e valida preço, disponibilidade e estoque no servidor. O mapa abaixo é mantido apenas para compatibilidade com versões antigas.</p><form method="post" action="options.php">';
        settings_fields('ks_checkout_group'); echo '<table class="form-table"><tbody>';
        foreach($labels as $id=>$label) { $value=isset($map[$id])?absint($map[$id]):0; echo '<tr><th><label for="ksmap'.esc_attr($id).'">ID Angular '.$id.' — '.esc_html($label).'</label></th><td><input type="number" min="0" step="1" id="ksmap'.esc_attr($id).'" name="'.esc_attr(self::OPTION).'['.esc_attr($id).']" value="'.esc_attr($value).'" class="small-text">'; if($value && wc_get_product($value)) echo ' <span style="color:green">Produto: '.esc_html(wc_get_product($value)->get_name()).'</span>'; elseif($value) echo ' <span style="color:#b32d2e">ID não encontrado</span>'; echo '</td></tr>'; }
        echo '</tbody></table>'; submit_button('Salvar associações'); echo '</form><p><strong>Endpoint:</strong> <code>/wp-json/ks-checkout/v1/orders</code></p><p>Antes de publicar, confira os IDs, teste cupom/estoque e confirme que o número de WhatsApp configurado no Angular é o correto.</p></div>';
    }
    public function cors() {
        add_filter('rest_pre_serve_request', function($served) {
            $origin = isset($_SERVER['HTTP_ORIGIN']) ? esc_url_raw(wp_unslash($_SERVER['HTTP_ORIGIN'])) : '';
            $allowed = ['https://kingshape.fit','https://www.kingshape.fit','http://localhost:4200','http://127.0.0.1:4200'];
            if ($origin && in_array($origin, $allowed, true)) {
                header('Access-Control-Allow-Origin: '.$origin); header('Vary: Origin', false);
                header('Access-Control-Allow-Methods: GET, POST, OPTIONS'); header('Access-Control-Allow-Headers: Content-Type, X-WP-Nonce');
            }
            return $served;
        });
    }
    public function routes() {
        register_rest_route(self::NS, '/orders', ['methods'=>'POST','callback'=>[$this,'create_order'],'permission_callback'=>'__return_true']);
    }
    private function fail($message, $status=400) { return new WP_REST_Response(['success'=>false,'message'=>$message], $status); }
    public function create_order(WP_REST_Request $request) {
        if (!class_exists('WooCommerce') || !function_exists('wc_create_order')) return $this->fail('WooCommerce não está ativo.', 503);
        $ip = isset($_SERVER['REMOTE_ADDR']) ? sanitize_text_field(wp_unslash($_SERVER['REMOTE_ADDR'])) : 'unknown';
        $rate_key = 'ks_checkout_rate_'.md5($ip);
        $hits = (int)get_transient($rate_key); if ($hits >= 8) return $this->fail('Muitas tentativas. Aguarde alguns minutos e tente novamente.', 429);
        set_transient($rate_key, $hits+1, 10 * MINUTE_IN_SECONDS);
        $body=$request->get_json_params(); $customer=isset($body['customer']) && is_array($body['customer']) ? $body['customer'] : [];
        $name=sanitize_text_field($customer['name'] ?? ''); $phone=sanitize_text_field($customer['phone'] ?? '');
        $email=sanitize_email($customer['email'] ?? ''); $postcode=sanitize_text_field($customer['postcode'] ?? '');
        $address=sanitize_text_field($customer['address'] ?? ''); $number=sanitize_text_field($customer['address_number'] ?? ''); $state=sanitize_text_field($body['shipping_state'] ?? ($customer['state'] ?? '')); $shipping_insurance=!empty($body['shipping_insurance']);
        $digits=preg_replace('/\D+/', '', $phone);
        if (mb_strlen($name)<3 || strlen($digits)<10 || strlen($digits)>15) return $this->fail('Nome ou WhatsApp inválido.');
        if ($email && !is_email($email)) return $this->fail('E-mail inválido.');
        $items=isset($body['items']) && is_array($body['items']) ? $body['items'] : [];
        if (!$items || count($items)>30) return $this->fail('Carrinho vazio ou com itens demais.');
        $map=get_option(self::OPTION, []); $order_items=[]; $seen=[];
        foreach($items as $item) {
            $frontend_id=absint($item['product_id'] ?? 0); $qty=absint($item['quantity'] ?? 0);
            if (!$frontend_id || $qty<1 || $qty>99 || isset($seen[$frontend_id])) return $this->fail('Um item do carrinho é inválido. Atualize o carrinho e tente novamente.');
            $seen[$frontend_id]=true;
            // O catálogo ao vivo envia o ID real do WooCommerce. Mantém compatibilidade com a versão antiga via mapa Angular.
            $direct_wc_id = absint($item['woocommerce_product_id'] ?? 0);
            $wc_id = $direct_wc_id ?: absint($map[$frontend_id] ?? 0);
            $product = $wc_id ? wc_get_product($wc_id) : false;
            if (!$product || !$product->is_purchasable()) return $this->fail('Um produto do carrinho ainda não está associado ou não pode ser comprado. Verifique a configuração do catálogo.');
            if (!$product->is_in_stock() || !$product->has_enough_stock($qty)) return $this->fail('Estoque insuficiente para: '.$product->get_name());
            $order_items[]=[$product,$qty];
        }
        $coupon_code=sanitize_text_field($body['coupon_code'] ?? ''); $coupon=null;
        if ($coupon_code) {
            $coupon=new WC_Coupon($coupon_code);
            if (!$coupon->get_id() || !$coupon->is_valid()) return $this->fail('O cupom informado é inválido ou não está disponível. Confira o código ou remova-o para continuar.');
            if ($coupon->get_usage_limit() && $coupon->get_usage_count() >= $coupon->get_usage_limit()) return $this->fail('O cupom atingiu o limite de utilizações.');
        }
        try {
            $order=wc_create_order(['status'=>'pending','created_via'=>'king-shape-angular']);
            if (is_wp_error($order)) return $this->fail('Não foi possível criar o pedido. Tente novamente.', 500);
            foreach($order_items as [$product,$qty]) $order->add_product($product,$qty);
            $address_data=['first_name'=>$name,'phone'=>$phone,'email'=>$email,'address_1'=>trim($address.($number ? ', '.$number : '')),'postcode'=>$postcode,'state'=>$state,'country'=>'BR'];
            $order->set_address($address_data,'billing');
            $shipping=$address_data; $order->set_address($shipping,'shipping');
            if ($coupon) $order->apply_coupon($coupon);
            $order->calculate_totals(true);
            if ($shipping_insurance) {
                $insurance_fee = new WC_Order_Item_Fee();
                $insurance_fee->set_name('Seguro de encomenda (15%)');
                $insurance_fee->set_amount(round((float)$order->get_total() * 0.15, wc_get_price_decimals()));
                $insurance_fee->set_total(round((float)$order->get_total() * 0.15, wc_get_price_decimals()));
                $order->add_item($insurance_fee);
                $order->calculate_totals(true);
            }
            $order->update_meta_data('_ks_checkout_source','angular-storefront');
            $order->update_meta_data('_ks_customer_whatsapp',$phone);
            $order->add_order_note('Pedido criado pelo checkout Angular. Aguardando confirmação de frete e pagamento via WhatsApp.');
            $order->save();
            $response_items=[]; foreach($order->get_items() as $line) $response_items[]=['name'=>$line->get_name(),'quantity'=>$line->get_quantity(),'total'=>(float)$line->get_total()];
            return new WP_REST_Response(['success'=>true,'order'=>['id'=>$order->get_id(),'number'=>$order->get_order_number(),'status'=>$order->get_status(),'items'=>$response_items,'subtotal'=>(float)$order->get_subtotal(),'discount'=>(float)$order->get_discount_total(),'total'=>(float)$order->get_total(),'coupon'=>$coupon ? $coupon->get_code() : '', 'shipping_state'=>$state, 'shipping_insurance'=>$shipping_insurance]], 201);
        } catch (Throwable $e) {
            if (isset($order) && $order instanceof WC_Order) $order->delete(true);
            error_log('King Shape checkout error: '.$e->getMessage());
            return $this->fail('Erro ao registrar pedido na loja. Tente novamente ou fale com o atendimento.', 500);
        }
    }
}
new KS_Checkout_WooCommerce();
