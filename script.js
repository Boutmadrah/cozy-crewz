emailjs.init('kJWiZCSiI3wWZxQdF');

const PRODUCTS = [
  { id:1, name:'Black TS ', type:'T-SHIRT · OVERSIZED', cat:'T-Shirts', price:299, badge:'NEW', image:'1S (2).png', bg:'linear-gradient(135deg,#1a0a0e,#2d0f15)', colors:['#0d0508','#F5F0EB','#8B0032'], sizes:['XS','S','M','L','XL','XXL'] },
  { id:2, name:'White TS ', type:'T-SHIRT · COMFORT FIT', cat:'T-Shirts', price:329, badge:'BESTSELLER', image:'1S (4).png', bg:'linear-gradient(135deg,#1a0a0e,#2d0f15)', colors:['#fff09e'], sizes:['S','M','L','XL','XXL'] },
  { id:3, name:'capishow TS ', type:'SWEATPANTS · WIDE LEG', cat:'Pants', price:399, badge:'HOT', image:'1S (6).png', bg:'linear-gradient(135deg,#120608,#1a0a0e)', colors:['#0d0508'], sizes:['S','M','L','XL','XXL'] },
  { id:4, name:'Tribal Sweatpants ', type:'T-SHIRT · RELAXED FIT', cat:'T-Shirts', price:279, badge:'', image:'1S (5).png', bg:'linear-gradient(135deg,#0d0508,#250d12)', colors:['#F5F0EB'], sizes:['XS','S','M','L','XL','XXL'] },
  { id:5, name:'Red Line Sweatpants ', type:'SWEATPANTS · SOFT FLEECE', cat:'Pants', price:369, badge:'', image:'1S (3).png', bg:'linear-gradient(135deg,#1a0a0e,#0d0508)', colors:['#0d0508','#8B0032'], sizes:['S','M','L','XL','XXL'] },
  { id:6, name:'white Line Sweatpants ', type:'SWEATPANTS · GRAPHIC', cat:'Pants', price:429, badge:'', image:'1S (1).png', bg:'linear-gradient(135deg,#250d12,#1a0a0e)', colors:['#0d0508','#F5F0EB'], sizes:['S','M','L','XL','XXL'] },
];

let cart = [];
let selectedSizes = {};

function renderProducts(filter='الكل') {
  const grid = document.getElementById('productsGrid');
  const filtered = filter === 'الكل' ? PRODUCTS : PRODUCTS.filter(p => p.cat === filter);
  grid.innerHTML = filtered.map(p => `
    <div class="product-card" data-id="${p.id}">
      <div class="product-img" style="background:${p.bg}">
        ${p.badge ? `<div class="product-badge">${p.badge}</div>` : ''}
        <img class="product-card-img" src="${p.image}" alt="${p.name}">
      </div>
      <div class="product-info">
        <div class="product-name">${p.name}</div>
        <div class="product-type">${p.type}</div>
        <div class="colors-row">
          ${p.colors.map(c => `<div class="color-dot" style="background:${c};${c==='#F5F0EB'?'border-color:#555':''}"></div>`).join('')}
        </div>
        <div class="size-row" id="sizes-${p.id}">
          ${p.sizes.map(s => `<button class="size-btn" onclick="selectSize(${p.id},'${s}',this)">${s}</button>`).join('')}
        </div>
        <div class="product-footer">
          <div class="product-price">${p.price} <span class="curr">EGP</span></div>
          <button class="add-btn" onclick="addToCart(${p.id})">+ أضف للسلة</button>
        </div>
      </div>
    </div>
  `).join('');
}

function filterProducts(cat, btn) {
  renderProducts(cat);
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  if (btn) btn.classList.add('active');
}

function selectSize(productId, size, btn) {
  selectedSizes[productId] = size;
  document.querySelectorAll(`#sizes-${productId} .size-btn`).forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');
}

function addToCart(productId) {
  const p = PRODUCTS.find(x => x.id === productId);
  const size = selectedSizes[productId];
  if (!size) {
    document.getElementById('sizes-'+productId).style.outline = '1px solid #C41E3A';
    setTimeout(() => document.getElementById('sizes-'+productId).style.outline = '', 1200);
    return;
  }
  const existing = cart.find(i => i.id === productId && i.size === size);
  if (existing) { existing.qty++; } else { cart.push({ ...p, size, qty:1 }); }
  updateCartUI();
  openCart();
}

function updateCartUI() {
  const total = cart.reduce((s,i) => s + i.price * i.qty, 0);
  const count = cart.reduce((s,i) => s + i.qty, 0);
  document.getElementById('cartCountBadge').textContent = count;
  document.getElementById('cartTotal').textContent = total;
  const itemsEl = document.getElementById('cartItems');
  if (cart.length === 0) {
    itemsEl.innerHTML = '<div class="cart-empty"><span style="font-size:2.5rem">🛒</span><span>السلة فاضية — ابدأ تتسوق!</span></div>';
    return;
  }
  itemsEl.innerHTML = cart.map((item,idx) => `
    <div class="cart-item">
      <div class="cart-item-icon"><img src="${item.image}" alt="${item.name}"></div>
      <div class="cart-item-info">
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-meta">المقاس: ${item.size}</div>
        <div class="cart-qty">
          <button class="qty-btn" onclick="changeQty(${idx},-1)">−</button>
          <span class="qty-num">${item.qty}</span>
          <button class="qty-btn" onclick="changeQty(${idx},1)">+</button>
        </div>
        <div class="cart-item-price">${item.price * item.qty} EGP</div>
      </div>
      <button class="cart-item-remove" onclick="removeItem(${idx})">🗑</button>
    </div>
  `).join('');
}

function changeQty(idx, delta) {
  cart[idx].qty += delta;
  if (cart[idx].qty <= 0) cart.splice(idx, 1);
  updateCartUI();
}
function removeItem(idx) { cart.splice(idx,1); updateCartUI(); }

function openCart() { document.getElementById('cartSidebar').classList.add('open'); document.getElementById('cartOverlay').classList.add('open'); }
function closeCart() { document.getElementById('cartSidebar').classList.remove('open'); document.getElementById('cartOverlay').classList.remove('open'); }

function openOrderModal() {
  if (cart.length === 0) return;
  closeCart();
  const total = cart.reduce((s,i) => s + i.price * i.qty, 0);
  document.getElementById('orderSummaryItems').innerHTML = cart.map(i => `<div class="order-summary-item"><span>${i.name} (${i.size}) ×${i.qty}</span><span>${i.price * i.qty}</span></div>`).join('');
  document.getElementById('orderSummaryTotal').textContent = total + ' EGP';
  document.getElementById('modalBody').style.display = '';
  document.getElementById('successScreen').classList.remove('show');
  document.getElementById('orderModal').classList.add('open');
}
function closeOrderModal() { document.getElementById('orderModal').classList.remove('open'); }

function submitOrder() {
  const name = document.getElementById('custName').value.trim();
  const phone = document.getElementById('custPhone').value.trim();
  const gov = document.getElementById('custGov').value;
  const address = document.getElementById('custAddress').value.trim();
  const notes = document.getElementById('custNotes').value.trim();
  if (!name || !phone || !gov || !address) { alert('من فضلك اكمل جميع البيانات المطلوبة (*)'); return; }
  const total = cart.reduce((s,i) => s + i.price * i.qty, 0);
  const itemsText = cart.map(i => `• ${i.name} - مقاس ${i.size} × ${i.qty} = ${i.price * i.qty} EGP`).join('\n');
  const msg = `🛒 *طلب جديد - Cuzy Crewz*\n\n` + `👤 *الاسم:* ${name}\n📞 *الموبايل:* ${phone}\n🏙️ *المحافظة:* ${gov}\n📍 *العنوان:* ${address}\n\n` + `*المنتجات:*\n${itemsText}\n\n` + `💰 *الإجمالي:* ${total} EGP\n` + (notes ? `📝 *ملاحظات:* ${notes}` : '');
  const waUrl = `https://wa.me/201145589480?text=${encodeURIComponent(msg)}`;
  window.open(waUrl, '_blank');
  document.getElementById('modalBody').style.display = 'none';
  document.getElementById('successScreen').classList.add('show');
  cart = [];
  updateCartUI();
}

function subscribeNewsletter() {
  const emailInput = document.getElementById('newsletterEmail');
  const btn = document.getElementById('newsletterBtn');
  const msg = document.getElementById('newsletterMsg');
  const email = emailInput.value.trim();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { msg.style.color = '#ff6b6b'; msg.textContent = '⚠️ من فضلك ادخل إيميل صحيح.'; return; }
  btn.disabled = true;
  btn.textContent = '⏳ جاري الإرسال...';
  msg.textContent = '';
  emailjs.send('service_60c7jn3', 'template_4cddpqj', { email: email, to_email: 'cuzycrewz@gmail.com', subscriber_email: email, message: 'اشتراك جديد في النيوزليتر من: ' + email, })
  .then(() => { msg.style.color = '#4ade80'; msg.textContent = '✅ تم الاشتراك بنجاح! هنبعتلك أحدث العروض.'; emailInput.value = ''; btn.textContent = '✓ تم'; btn.style.background = '#4ade80'; btn.style.color = '#0d0508'; })
  .catch((err) => { console.error('EmailJS error:', err); msg.style.color = '#ff6b6b'; msg.textContent = '❌ حصل خطأ، حاول تاني بعد شوية.'; btn.disabled = false; btn.textContent = 'اشترك'; });
}

renderProducts();
updateCartUI();
document.querySelectorAll('a[href^="#"]').forEach(a => { a.addEventListener('click', e => { const t = document.querySelector(a.getAttribute('href')); if (t) { e.preventDefault(); t.scrollIntoView({ behavior:'smooth' }); } }); });
document.getElementById('orderModal').addEventListener('click', function(e) { if (e.target === this) closeOrderModal(); });
