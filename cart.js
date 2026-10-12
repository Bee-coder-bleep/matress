(function () {
  var CART_KEY = 'mpm_cart';
  var ORDER_NUMBER = '254786167213';

  function getCart() {
    try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; }
    catch (e) { return []; }
  }
  function setCart(cart) {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
    updateBadges();
  }
  function formatKSh(n) {
    return 'KSh ' + Number(n).toLocaleString('en-KE');
  }
  function cartCount(cart) {
    return cart.reduce(function (sum, item) { return sum + item.qty; }, 0);
  }
  function updateBadges() {
    var cart = getCart();
    var count = cartCount(cart);
    document.querySelectorAll('.cart-badge').forEach(function (b) {
      b.textContent = count;
      b.style.display = count > 0 ? 'flex' : 'none';
    });
  }

  function addToCart(item) {
    var cart = getCart();
    var existing = cart.find(function (c) { return c.name === item.name && c.size === item.size; });
    if (existing) { existing.qty += item.qty; }
    else { cart.push(Object.assign({}, item)); }
    setCart(cart);
    showToast(item.name + ' (' + item.size + ') added to cart');
  }

  function removeFromCart(index) {
    var cart = getCart();
    cart.splice(index, 1);
    setCart(cart);
    renderCartDrawer();
  }

  function updateCartQty(index, qty) {
    var cart = getCart();
    if (!cart[index]) return;
    cart[index].qty = Math.max(1, qty);
    setCart(cart);
    renderCartDrawer();
  }

  function clearCart() { setCart([]); }

  var uiInjected = false;
  function injectUI() {
    if (uiInjected) return;
    uiInjected = true;

    var style = document.createElement('style');
    style.textContent =
      '.cart-badge{position:absolute;top:-6px;right:-6px;background:var(--brand-orange,#3cb74b);color:#fff;font-size:10px;font-weight:700;min-width:16px;height:16px;border-radius:999px;display:none;align-items:center;justify-content:center;padding:0 4px;}' +
      '.cart-icon-btn{position:relative;background:none;border:none;cursor:pointer;padding:0;display:flex;}' +
      '.mpm-overlay{position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:300;opacity:0;pointer-events:none;transition:opacity .25s;}' +
      '.mpm-overlay.open{opacity:1;pointer-events:all;}' +
      '.cart-drawer{position:fixed;top:0;right:0;bottom:0;width:88%;max-width:380px;background:#fff;z-index:301;transform:translateX(100%);transition:transform .3s ease;display:flex;flex-direction:column;}' +
      '.cart-drawer.open{transform:translateX(0);}' +
      '.cart-drawer-header{display:flex;align-items:center;justify-content:space-between;padding:18px 16px;border-bottom:1px solid #eee;}' +
      '.cart-drawer-header h3{font-size:18px;font-weight:800;}' +
      '.cart-drawer-close{background:none;border:none;font-size:22px;cursor:pointer;}' +
      '.cart-items{flex:1;overflow-y:auto;padding:12px 16px;}' +
      '.cart-item{display:flex;justify-content:space-between;align-items:flex-start;gap:10px;padding:12px 0;border-bottom:1px solid #f0f0f0;}' +
      '.cart-item-info{flex:1;}' +
      '.cart-item-name{font-weight:700;font-size:13.5px;margin-bottom:2px;}' +
      '.cart-item-meta{font-size:12px;color:#666;}' +
      '.cart-item-qty-row{display:flex;align-items:center;gap:8px;margin-top:6px;}' +
      '.cart-item-qty-row button{width:24px;height:24px;border:1px solid #ddd;background:#f8f8f8;border-radius:4px;font-size:14px;cursor:pointer;}' +
      '.cart-item-remove{background:none;border:none;color:#c0392b;font-size:12px;cursor:pointer;}' +
      '.cart-item-price{font-weight:700;font-size:13.5px;white-space:nowrap;}' +
      '.cart-empty{text-align:center;color:#888;padding:40px 0;font-size:14px;}' +
      '.cart-drawer-footer{padding:16px;border-top:1px solid #eee;}' +
      '.cart-total-row{display:flex;justify-content:space-between;font-weight:800;font-size:16px;margin-bottom:12px;}' +
      '.cart-checkout-btn{width:100%;background:#1a1a1a;color:#fff;border:none;padding:14px;border-radius:8px;font-size:14.5px;font-weight:700;cursor:pointer;}' +
      '.order-form-modal{position:fixed;top:0;left:0;right:0;bottom:0;z-index:302;display:flex;align-items:flex-end;justify-content:center;opacity:0;pointer-events:none;transition:opacity .25s;}' +
      '.order-form-modal.open{opacity:1;pointer-events:all;}' +
      '.order-form-box{background:#fff;width:100%;max-width:460px;border-radius:16px 16px 0 0;max-height:88vh;overflow-y:auto;padding:20px;transform:translateY(20px);transition:transform .25s;}' +
      '.order-form-modal.open .order-form-box{transform:translateY(0);}' +
      '.order-form-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;}' +
      '.order-form-header h3{font-size:18px;font-weight:800;}' +
      '.order-form-close{background:none;border:none;font-size:22px;cursor:pointer;}' +
      '.order-summary{background:#f8f8f8;border-radius:8px;padding:12px;margin-bottom:16px;font-size:13px;}' +
      '.order-summary-item{display:flex;justify-content:space-between;margin-bottom:6px;}' +
      '.order-summary-total{display:flex;justify-content:space-between;font-weight:800;margin-top:8px;padding-top:8px;border-top:1px solid #e0e0e0;}' +
      '.order-field{margin-bottom:12px;}' +
      '.order-field label{display:block;font-size:12.5px;font-weight:700;margin-bottom:5px;text-transform:uppercase;letter-spacing:.3px;}' +
      '.order-field input,.order-field textarea{width:100%;padding:11px;border:1.5px solid #ddd;border-radius:8px;font-size:14px;font-family:inherit;}' +
      '.order-field textarea{resize:vertical;min-height:60px;}' +
      '.order-submit-btn{width:100%;background:var(--brand-orange,#3cb74b);color:#fff;border:none;padding:14px;border-radius:8px;font-size:15px;font-weight:700;cursor:pointer;margin-top:6px;}' +
      '.order-error{color:#c0392b;font-size:12.5px;margin-top:-6px;margin-bottom:10px;display:none;}' +
      '.mpm-toast{position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:#1a1a1a;color:#fff;padding:10px 18px;border-radius:999px;font-size:13px;font-weight:600;z-index:400;opacity:0;transition:opacity .3s;pointer-events:none;white-space:nowrap;}' +
      '.mpm-toast.show{opacity:1;}';
    document.head.appendChild(style);

    var wrap = document.createElement('div');
    wrap.innerHTML =
      '<div class="mpm-overlay" id="mpmOverlay"></div>' +
      '<div class="cart-drawer" id="cartDrawer">' +
      '  <div class="cart-drawer-header"><h3>Your Cart</h3><button class="cart-drawer-close" id="cartDrawerClose">&times;</button></div>' +
      '  <div class="cart-items" id="cartItemsList"></div>' +
      '  <div class="cart-drawer-footer" id="cartDrawerFooter"></div>' +
      '</div>' +
      '<div class="order-form-modal" id="orderFormModal">' +
      '  <div class="order-form-box">' +
      '    <div class="order-form-header"><h3>Complete Your Order</h3><button class="order-form-close" id="orderFormClose">&times;</button></div>' +
      '    <div class="order-summary" id="orderSummary"></div>' +
      '    <div class="order-field"><label for="ofName">Full Name</label><input type="text" id="ofName" placeholder="e.g. Jane Wanjiru"></div>' +
      '    <div class="order-field"><label for="ofPhone">Phone Number</label><input type="tel" id="ofPhone" placeholder="e.g. 0712 345678"></div>' +
      '    <div class="order-field"><label for="ofLocation">Delivery Location</label><input type="text" id="ofLocation" placeholder="e.g. Eldoret, Uasin Gishu"></div>' +
      '    <div class="order-field"><label for="ofNotes">Notes (optional)</label><textarea id="ofNotes" placeholder="Any special instructions"></textarea></div>' +
      '    <div class="order-error" id="orderError">Please fill in your name, phone number, and delivery location.</div>' +
      '    <button class="order-submit-btn" id="orderSubmitBtn">Place Order</button>' +
      '  </div>' +
      '</div>';
    document.body.appendChild(wrap);

    document.getElementById('mpmOverlay').addEventListener('click', closeAll);
    document.getElementById('cartDrawerClose').addEventListener('click', closeAll);
    document.getElementById('orderFormClose').addEventListener('click', closeAll);
    document.getElementById('orderSubmitBtn').addEventListener('click', submitOrder);

    document.querySelectorAll('.cart-icon-btn').forEach(function (btn) {
      btn.addEventListener('click', openCartDrawer);
    });
  }

  function closeAll() {
    document.getElementById('mpmOverlay').classList.remove('open');
    document.getElementById('cartDrawer').classList.remove('open');
    document.getElementById('orderFormModal').classList.remove('open');
  }

  function openCartDrawer() {
    injectUI();
    renderCartDrawer();
    document.getElementById('mpmOverlay').classList.add('open');
    document.getElementById('cartDrawer').classList.add('open');
  }

  function renderCartDrawer() {
    var cart = getCart();
    var list = document.getElementById('cartItemsList');
    var footer = document.getElementById('cartDrawerFooter');
    if (!cart.length) {
      list.innerHTML = '<div class="cart-empty">Your cart is empty.</div>';
      footer.innerHTML = '';
      return;
    }
    list.innerHTML = cart.map(function (item, i) {
      return '<div class="cart-item">' +
        '<div class="cart-item-info">' +
        '<div class="cart-item-name">' + item.name + '</div>' +
        '<div class="cart-item-meta">' + item.size + '</div>' +
        '<div class="cart-item-qty-row">' +
        '<button data-action="dec" data-index="' + i + '">\u2212</button>' +
        '<span>' + item.qty + '</span>' +
        '<button data-action="inc" data-index="' + i + '">+</button>' +
        '<button class="cart-item-remove" data-action="remove" data-index="' + i + '">Remove</button>' +
        '</div></div>' +
        '<div class="cart-item-price">' + formatKSh(item.price * item.qty) + '</div>' +
        '</div>';
    }).join('');

    var total = cart.reduce(function (sum, item) { return sum + item.price * item.qty; }, 0);
    footer.innerHTML =
      '<div class="cart-total-row"><span>Total</span><span>' + formatKSh(total) + '</span></div>' +
      '<button class="cart-checkout-btn" id="cartCheckoutBtn">Checkout</button>';

    list.querySelectorAll('button[data-action]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var idx = parseInt(btn.dataset.index, 10);
        var action = btn.dataset.action;
        var c = getCart();
        if (action === 'inc') updateCartQty(idx, c[idx].qty + 1);
        else if (action === 'dec') updateCartQty(idx, c[idx].qty - 1);
        else if (action === 'remove') removeFromCart(idx);
      });
    });

    var checkoutBtn = document.getElementById('cartCheckoutBtn');
    if (checkoutBtn) {
      checkoutBtn.addEventListener('click', function () {
        openOrderForm(getCart(), { fromCart: true });
      });
    }
  }

  var currentOrderItems = [];
  var currentOrderIsCart = false;

  function openOrderForm(items, opts) {
    if (!items || !items.length) return;
    injectUI();
    currentOrderItems = items;
    currentOrderIsCart = !!(opts && opts.fromCart);

    var summary = document.getElementById('orderSummary');
    var total = items.reduce(function (sum, item) { return sum + item.price * item.qty; }, 0);
    summary.innerHTML = items.map(function (item) {
      return '<div class="order-summary-item"><span>' + item.name + ' (' + item.size + ') \u00d7 ' + item.qty + '</span><span>' + formatKSh(item.price * item.qty) + '</span></div>';
    }).join('') + '<div class="order-summary-total"><span>Total</span><span>' + formatKSh(total) + '</span></div>';

    document.getElementById('orderError').style.display = 'none';
    document.getElementById('mpmOverlay').classList.add('open');
    document.getElementById('orderFormModal').classList.add('open');
  }

  function submitOrder() {
    var name = document.getElementById('ofName').value.trim();
    var phone = document.getElementById('ofPhone').value.trim();
    var location = document.getElementById('ofLocation').value.trim();
    var notes = document.getElementById('ofNotes').value.trim();
    var errorEl = document.getElementById('orderError');

    if (!name || !phone || !location) {
      errorEl.style.display = 'block';
      return;
    }
    errorEl.style.display = 'none';

    var items = currentOrderItems;
    var total = items.reduce(function (sum, item) { return sum + item.price * item.qty; }, 0);
    var lines = items.map(function (item) {
      return '- ' + item.name + ' (' + item.size + ') x' + item.qty + ': ' + formatKSh(item.price * item.qty);
    }).join('\n');

    var message =
      'New order:\n' + lines + '\n' +
      'Total: ' + formatKSh(total) + '\n\n' +
      'Name: ' + name + '\n' +
      'Phone: ' + phone + '\n' +
      'Delivery Location: ' + location +
      (notes ? '\nNotes: ' + notes : '');

    window.open('https://wa.me/' + ORDER_NUMBER + '?text=' + encodeURIComponent(message), '_blank');

    if (currentOrderIsCart) clearCart();

    closeAll();
    showToast('Order submitted! We will confirm shortly.');
    document.getElementById('ofName').value = '';
    document.getElementById('ofPhone').value = '';
    document.getElementById('ofLocation').value = '';
    document.getElementById('ofNotes').value = '';
  }

  function showToast(msg) {
    var toast = document.querySelector('.mpm-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.className = 'mpm-toast';
      document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toast._t);
    toast._t = setTimeout(function () { toast.classList.remove('show'); }, 2200);
  }

  document.addEventListener('DOMContentLoaded', function () {
    injectUI();
    updateBadges();
  });

  window.MPMCart = {
    addToCart: addToCart,
    buyNow: function (item) { openOrderForm([item], { fromCart: false }); },
    openCartDrawer: openCartDrawer,
    openOrderForm: openOrderForm
  };
})();
