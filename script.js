/* ===================== Sozlamalar ===================== */
// Telegram orqali buyurtma qabul qilinadi (hozircha backend yo'q — keyinroq bot ulanadi)
const ORDER_TELEGRAM_USERNAME = 'trixgstore'; // shu username'ga buyurtma xabari boradi

const ICONS = {
  keyboard: `<svg viewBox="0 0 24 24" fill="none"><rect x="2" y="6" width="20" height="12" rx="2" stroke="currentColor" stroke-width="1.5"/><path d="M6 10h.01M9 10h.01M12 10h.01M15 10h.01M18 10h.01M6 14h8M17 14h1" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>`,
  mouse: `<svg viewBox="0 0 24 24" fill="none"><rect x="7" y="3" width="10" height="16" rx="5" stroke="currentColor" stroke-width="1.5"/><path d="M12 3v6" stroke="currentColor" stroke-width="1.5"/></svg>`,
  headset: `<svg viewBox="0 0 24 24" fill="none"><path d="M4 13v-1a8 8 0 0 1 16 0v1" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><rect x="2.5" y="13" width="4" height="6" rx="1.6" stroke="currentColor" stroke-width="1.5"/><rect x="17.5" y="13" width="4" height="6" rx="1.6" stroke="currentColor" stroke-width="1.5"/></svg>`
};

// Namuna mahsulotlar — buni keyinchalik real mahsulotlaringiz bilan almashtirasiz
const PRODUCTS = [
  {id:1, name:'Vortex RGB', cat:'keyboard', spec:'Mexanik · Blue switch · RGB yoritish', price:485000, tag:'Bestseller'},
  {id:2, name:'Nightblade TKL', cat:'keyboard', spec:'Mexanik · Red switch · Kompakt TKL', price:520000},
  {id:3, name:'Cinder 60%', cat:'keyboard', spec:'Mexanik · Brown switch · Mini format', price:399000},
  {id:4, name:'Raptor Pro', cat:'mouse', spec:'16000 DPI · 6 tugma · RGB', price:245000, tag:'Yangi'},
  {id:5, name:'Ghost Lite', cat:'mouse', spec:'12000 DPI · 59g · Wireless', price:310000},
  {id:6, name:'Titan Grip', cat:'mouse', spec:'8000 DPI · Ergonomik dizayn', price:189000},
  {id:7, name:'Aegis 7.1', cat:'headset', spec:"Virtual 7.1 · Mikrofon · Yumshoq quloq yostig'i", price:415000, tag:'Bestseller'},
  {id:8, name:'Nova Wireless', cat:'headset', spec:'Simsiz · 30 soat batareya', price:560000},
  {id:9, name:'Pulse Air', cat:'headset', spec:'Yengil · Uzoq muddatli qulaylik', price:275000},
];

/* ===================== Holat (state) ===================== */
let cart = JSON.parse(localStorage.getItem('trixg_cart') || '{}'); // {id: qty}

function saveCart(){ localStorage.setItem('trixg_cart', JSON.stringify(cart)); }
function money(n){ return n.toLocaleString('ru-RU') + " so'm"; }

/* ===================== Savat mantig'i ===================== */
function addToCart(id){
  cart[id] = (cart[id] || 0) + 1;
  saveCart();
  renderCart();
  showToast("Savatga qo'shildi");
}
function changeQty(id, delta){
  cart[id] = (cart[id] || 0) + delta;
  if(cart[id] <= 0) delete cart[id];
  saveCart();
  renderCart();
}
function removeFromCart(id){
  delete cart[id];
  saveCart();
  renderCart();
}
function cartCount(){ return Object.values(cart).reduce((a,b) => a+b, 0); }
function cartTotal(){
  return Object.entries(cart).reduce((sum,[id,qty]) => {
    const p = PRODUCTS.find(x => x.id == id);
    return sum + (p ? p.price * qty : 0);
  }, 0);
}

function renderCart(){
  const badge = document.getElementById('cartBadge');
  if(!badge) return;
  const count = cartCount();
  badge.style.display = count > 0 ? 'flex' : 'none';
  badge.textContent = count;

  const body = document.getElementById('cartBody');
  const foot = document.getElementById('cartFoot');
  const entries = Object.entries(cart);

  if(entries.length === 0){
    body.innerHTML = `<div class="cart-empty">
      <svg viewBox="0 0 24 24" fill="none"><path d="M3 4h2l2.4 12.2a2 2 0 0 0 2 1.6h7.8a2 2 0 0 0 2-1.6L21 8H6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
      Savatingiz hozircha bo'sh
    </div>`;
    foot.style.display = 'none';
    return;
  }

  body.innerHTML = entries.map(([id, qty]) => {
    const p = PRODUCTS.find(x => x.id == id);
    if(!p) return '';
    return `
      <div class="cart-item">
        <div class="cart-item-icon">${ICONS[p.cat]}</div>
        <div class="cart-item-info">
          <div class="cart-item-name">${p.name}</div>
          <div class="cart-item-price">${money(p.price)}</div>
          <div class="qty-row">
            <button class="qty-btn" onclick="changeQty(${p.id}, -1)">−</button>
            <span class="qty-val">${qty}</span>
            <button class="qty-btn" onclick="changeQty(${p.id}, 1)">+</button>
            <button class="remove-btn" onclick="removeFromCart(${p.id})">O'chirish</button>
          </div>
        </div>
      </div>
    `;
  }).join('');

  foot.style.display = 'block';
  document.getElementById('cartTotal').textContent = money(cartTotal());
}

/* ===================== Drawer ochish/yopish ===================== */
function openDrawer(){
  document.getElementById('overlay').classList.add('show');
  document.getElementById('cartDrawer').classList.add('show');
}
function closeDrawer(){
  document.getElementById('overlay').classList.remove('show');
  document.getElementById('cartDrawer').classList.remove('show');
}

/* ===================== Checkout modal ===================== */
function openCheckout(){
  if(cartCount() === 0) return;
  const summary = document.getElementById('modalSummary');
  const entries = Object.entries(cart);
  summary.innerHTML = entries.map(([id,qty]) => {
    const p = PRODUCTS.find(x => x.id == id);
    return `<div><span>${p.name} × ${qty}</span><span>${money(p.price*qty)}</span></div>`;
  }).join('') + `<div class="total"><span>Jami</span><span>${money(cartTotal())}</span></div>`;
  document.getElementById('checkoutOverlay').classList.add('show');
}
function closeCheckout(){
  document.getElementById('checkoutOverlay').classList.remove('show');
}

function sendOrder(){
  const name = document.getElementById('custName').value.trim();
  const phone = document.getElementById('custPhone').value.trim();
  const address = document.getElementById('custAddress').value.trim();
  const comment = document.getElementById('custComment').value.trim();

  if(!name || !phone){
    showToast("Ism va telefon raqamini kiriting");
    return;
  }

  const entries = Object.entries(cart);
  let msg = `🛒 Yangi buyurtma — TRIXG STORE%0A%0A`;
  msg += `👤 Ism: ${name}%0A📞 Tel: ${phone}%0A`;
  if(address) msg += `📍 Manzil: ${address}%0A`;
  msg += `%0A`;
  entries.forEach(([id,qty]) => {
    const p = PRODUCTS.find(x => x.id == id);
    msg += `• ${p.name} × ${qty} — ${money(p.price*qty)}%0A`;
  });
  msg += `%0A💰 Jami: ${money(cartTotal())}`;
  if(comment) msg += `%0A%0A💬 Izoh: ${comment}`;

  window.open(`https://t.me/${ORDER_TELEGRAM_USERNAME}?text=${msg}`, '_blank');

  cart = {};
  saveCart();
  renderCart();
  closeCheckout();
  closeDrawer();
  showToast("Buyurtma yuborildi!");
  ['custName','custPhone','custAddress','custComment'].forEach(id => document.getElementById(id).value = '');
}

/* ===================== Toast ===================== */
let toastTimer;
function showToast(text){
  const toast = document.getElementById('toast');
  if(!toast) return;
  toast.textContent = text;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2200);
}

/* ===================== Umumiy elementlarni ulash (har sahifada) ===================== */
function initCommon(){
  const openBtn = document.getElementById('cartOpenBtn');
  const closeBtn = document.getElementById('cartCloseBtn');
  const overlay = document.getElementById('overlay');
  const checkoutBtn = document.getElementById('checkoutBtn');
  const modalCancel = document.getElementById('modalCancelBtn');
  const modalSend = document.getElementById('modalSendBtn');

  if(openBtn) openBtn.addEventListener('click', openDrawer);
  if(closeBtn) closeBtn.addEventListener('click', closeDrawer);
  if(overlay) overlay.addEventListener('click', () => { closeDrawer(); closeCheckout(); });
  if(checkoutBtn) checkoutBtn.addEventListener('click', openCheckout);
  if(modalCancel) modalCancel.addEventListener('click', closeCheckout);
  if(modalSend) modalSend.addEventListener('click', sendOrder);

  renderCart();
}
document.addEventListener('DOMContentLoaded', initCommon);
