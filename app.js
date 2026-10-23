/* ============================================================
   البيانات والثوابت
   ============================================================ */
const LS_PRODUCTS = 'nokhba_products_v1';
const LS_ORDERS   = 'nokhba_orders_v1';
const LS_CART     = 'nokhba_cart_v1';
const LS_FAVS     = 'nokhba_favs_v1';
const WHATSAPP    = '201501727239';
const STORE_NAME  = 'مكتبة النخبة 3';

const DEFAULT_PRODUCTS = [
  {id:'p1',name:'قلم جاف أزرق فاخر',price:5,old:8,cat:'أقلام',stock:120,img:'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=400&q=80'},
  {id:'p2',name:'كراسة 60 ورقة مسطرة',price:12,cat:'كراسات',stock:45,img:'https://images.unsplash.com/photo-1517842645767-c639042777db?w=400&q=80'},
  {id:'p3',name:'كتاب الرياضيات المتقدمة',price:85,old:110,cat:'كتب ومراجع',stock:8,img:'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&q=80'},
  {id:'p4',name:'مسطرة 30 سم شفافة',price:7,cat:'أدوات هندسية',stock:60,img:'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=400&q=80'},
  {id:'p5',name:'حافظة أوراق A4',price:25,old:30,cat:'أدوات مكتبية',stock:3,img:'https://images.unsplash.com/photo-1544816155-12df9643f363?w=400&q=80'},
  {id:'p6',name:'لعبة تركيب تعليمية',price:40,old:55,cat:'هدايا',stock:15,img:'https://images.unsplash.com/photo-1594787318286-3d835c1d207f?w=400&q=80'},
];

if(!localStorage.getItem(LS_PRODUCTS)) localStorage.setItem(LS_PRODUCTS, JSON.stringify(DEFAULT_PRODUCTS));
if(!localStorage.getItem(LS_ORDERS)) localStorage.setItem(LS_ORDERS, JSON.stringify([]));

const getProducts = () => JSON.parse(localStorage.getItem(LS_PRODUCTS) || '[]');
const setProducts = (v) => localStorage.setItem(LS_PRODUCTS, JSON.stringify(v));
const getOrders   = () => JSON.parse(localStorage.getItem(LS_ORDERS)   || '[]');
const setOrders   = (v) => localStorage.setItem(LS_ORDERS, JSON.stringify(v));
const getCart     = () => JSON.parse(localStorage.getItem(LS_CART)     || '[]');
const setCart     = (v) => { localStorage.setItem(LS_CART, JSON.stringify(v)); updateBadge(); };
let FAVS = new Set(JSON.parse(localStorage.getItem(LS_FAVS) || '[]'));
const setFavs     = () => localStorage.setItem(LS_FAVS, JSON.stringify([...FAVS]));

const CATEGORIES = [
  {name:'أقلام', img:'https://images.unsplash.com/photo-1585336261022-680e295ce3fe?w=400&q=80', icon:'pen'},
  {name:'كراسات', img:'https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=400&q=80', icon:'book'},
  {name:'كتب ومراجع', img:'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=400&q=80', icon:'books'},
  {name:'أدوات هندسية', img:'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=400&q=80', icon:'ruler'},
  {name:'أدوات مكتبية', img:'https://images.unsplash.com/photo-1497032628192-86f99bcd76bc?w=400&q=80', icon:'clip'},
  {name:'هدايا', img:'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=400&q=80', icon:'gift'},
];

const STATUSES = {
  pending:    {label:'في انتظار الموافقة', cls:'status-pending',    step:0},
  processing: {label:'جاري التجهيز',        cls:'status-processing', step:1},
  ready:      {label:'تم التجهيز',           cls:'status-ready',      step:2},
  available:  {label:'متاح للاستلام',       cls:'status-available',  step:3},
  received:   {label:'تم الاستلام',          cls:'status-received',   step:4},
  cancelled:  {label:'ملغي',                cls:'status-cancelled',  step:-1},
};
const FLOW = ['pending','processing','ready','available','received'];

const fmt = n => new Intl.NumberFormat('ar-EG',{style:'currency',currency:'EGP'}).format(n);
const nowStr = () => new Date().toLocaleString('ar-EG',{dateStyle:'medium',timeStyle:'short'});

/* ============================================================
   الأيقونات
   ============================================================ */
const ICONS = {
  pen:'<path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/>',
  book:'<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>',
  books:'<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/><path d="M8 7h8M8 11h8"/>',
  ruler:'<path d="M21.3 8.7l-5-5a1 1 0 0 0-1.4 0L2.7 15.9a1 1 0 0 0 0 1.4l5 5a1 1 0 0 0 1.4 0L21.3 10a1 1 0 0 0 0-1.4z"/><path d="M7.5 10.5l2 2M10.5 7.5l2 2M13.5 4.5l2 2M4.5 13.5l2 2"/>',
  clip:'<path d="M21 8l-9-5-9 5v8l9 5 9-5V8z"/><path d="M3.3 7L12 12l8.7-5M12 22V12"/>',
  gift:'<path d="M20 12v10H4V12M2 7h20v5H2zM12 22V7M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7zM12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/>',
  cart:'<circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>',
  heart:'<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>',
  check:'<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="M22 4L12 14.01l-3-3"/>',
  trash:'<path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/>',
  arrow:'<path d="M5 12h14M12 5l7 7-7 7"/>',
  empty:'<circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>',
  print:'<path d="M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/>',
  wa:'<path d="M17.5 14.4c-.3-.2-1.7-.9-2-1-.3-.1-.5-.2-.7.2-.2.3-.7.9-.9 1.1-.2.2-.3.2-.6.1-.3-.2-1.3-.5-2.4-1.5-.9-.8-1.5-1.8-1.7-2.1-.2-.3 0-.5.1-.6.1-.1.3-.3.4-.5.1-.2.2-.3.3-.5.1-.2 0-.4 0-.5 0-.1-.7-1.6-.9-2.2-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1.1 1-1.1 2.5s1.1 2.9 1.3 3.1c.2.2 2.2 3.4 5.4 4.7.8.3 1.3.5 1.8.6.8.3 1.5.2 2 .1.6-.1 1.7-.7 2-1.4.3-.7.3-1.3.2-1.4-.1-.1-.3-.2-.6-.3zM12 2C6.5 2 2 6.5 2 12c0 1.8.5 3.5 1.3 5L2 22l5.1-1.3c1.4.8 3.1 1.3 4.9 1.3 5.5 0 10-4.5 10-10S17.5 2 12 2z"/>',
};
const icon = (name, extra='') => `<svg viewBox="0 0 24 24" fill="${name==='wa'?'currentColor':'none'}" stroke="${name==='wa'?'none':'currentColor'}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ${extra}>${ICONS[name]||''}</svg>`;

/* ============================================================
   أدوات عامة
   ============================================================ */
function toast(msg){
  const t = document.getElementById('toast');
  document.getElementById('toastMsg').textContent = msg;
  t.classList.add('is-in');
  clearTimeout(t._timer);
  t._timer = setTimeout(()=>t.classList.remove('is-in'), 2200);
}
function updateBadge(){
  const n = getCart().reduce((s,x)=>s+x.qty,0);
  const el = document.getElementById('cartCount'); if(el) el.textContent = n;
}
function addToCart(p){
  const c = getCart(); const i = c.find(x=>x.id===p.id);
  if(i) i.qty++; else c.push({id:p.id,name:p.name,price:p.price,qty:1,img:p.img});
  setCart(c); toast('أُضيف إلى السلة');
}
function toggleFav(id, el){
  if(FAVS.has(id)){ FAVS.delete(id); el.classList.remove('active'); }
  else { FAVS.add(id); el.classList.add('active'); toast('أُضيف للمفضلة'); }
  setFavs();
}
function genOrderNumber(){
  const d = new Date();
  const ymd = d.getFullYear().toString().slice(-2)+String(d.getMonth()+1).padStart(2,'0')+String(d.getDate()).padStart(2,'0');
  return 'AN-' + ymd + '-' + String(Math.floor(Math.random()*9000)+1000);
}

/* ============================================================
   وضع المتجر / الإدارة
   ============================================================ */
let currentPage = 'home';
function openAdmin(){
  document.body.classList.add('admin-mode');
  window.scrollTo(0,0);
  setAdminView('dashboard');
}
function exitAdmin(){
  document.body.classList.remove('admin-mode');
  window.scrollTo(0,0);
  go('home');
}

/* ============================================================
   المتجر - Router + الصفحات
   ============================================================ */
function go(page, param){
  currentPage = page;
  const app = document.getElementById('app');
  app.style.opacity = 0;
  setTimeout(()=>{
    app.innerHTML = '';
    window[`render_${page}`]?.(param);
    app.style.transition = 'opacity .3s';
    app.style.opacity = 1;
    window.scrollTo({top:0,behavior:'smooth'});
  }, 80);
}
window.onload = () => { updateBadge(); go('home'); };
window.addEventListener('storage', (e)=>{
  if(e.key===LS_PRODUCTS){
    if(['home','products'].includes(currentPage)) go(currentPage);
    updateAdminBadges();
  }
  if(e.key===LS_ORDERS){
    if(['orders','orderDetail'].includes(currentPage)) go('orders');
    updateAdminBadges();
  }
});

function render_home(){
  const PRODUCTS = getProducts();
  document.getElementById('app').innerHTML = `
    <section class="hero">
      <h1>كل اللي محتاجه تلاقيه عندنا</h1>
      <p>مستلزماتك الدراسية والمكتبية في مكان واحد</p>
      <div class="row" style="display:flex;gap:14px">
        <button class="btn btn-primary" onclick="go('products')">${icon('cart')} تسوق الآن</button>
        <button class="btn btn-ghost" onclick="document.getElementById('cats').scrollIntoView({behavior:'smooth',block:'center'})">اكتشف الأقسام</button>
      </div>
    </section>
    <h2 class="section-title">تسوق حسب القسم</h2>
    <p class="section-sub">اختر القسم اللي يناسبك</p>
    <div class="cat-grid" id="cats">
      ${CATEGORIES.map((c,i)=>`
        <div class="cat" style="animation-delay:${i*.06}s" onclick="go('products')">
          <img src="${c.img}" alt="${c.name}" loading="lazy">
          <div class="cat__overlay">
            <div class="cat__icon">${icon(c.icon)}</div>
            <p class="cat__name">${c.name}</p>
          </div>
        </div>`).join('')}
    </div>
    <h2 class="section-title">أحدث المنتجات</h2>
    <p class="section-sub">جديدنا في المكتبة</p>
    <div class="grid">${PRODUCTS.map((p,i)=>card(p,i)).join('') || '<p style="color:var(--muted)">لا توجد منتجات</p>'}</div>
  `;
  bindCardActions(PRODUCTS);
}

function render_products(){
  const PRODUCTS = getProducts();
  document.getElementById('app').innerHTML = `
    <h2 class="section-title">جميع المنتجات</h2>
    <p class="section-sub">${PRODUCTS.length} منتج متاح</p>
    <div class="grid">${PRODUCTS.map((p,i)=>card(p,i)).join('')}</div>`;
  bindCardActions(PRODUCTS);
}

function card(p, i){
  const isFav = FAVS.has(p.id);
  const stockClass = p.stock === 0 ? 'out' : p.stock < 5 ? 'low' : '';
  const stockText = p.stock === 0 ? 'نفذ المخزون' : p.stock < 5 ? `متبقي ${p.stock} فقط` : `متوفر (${p.stock})`;
  const discount = p.old ? Math.round((1 - p.price/p.old)*100) : 0;
  return `<article class="card" style="animation-delay:${(i%6)*.06}s">
    <div class="card__img-wrap">
      <img class="card__img" src="${p.img}" alt="${p.name}" loading="lazy">
      ${discount?`<span class="card__tag">-${discount}%</span>`:''}
      <button class="card__fav ${isFav?'active':''}" data-fav="${p.id}" aria-label="مفضلة">${icon('heart')}</button>
    </div>
    <div class="card__body">
      <h3 class="card__name">${p.name}</h3>
      <div class="card__price">${fmt(p.price)}${p.old?`<s>${fmt(p.old)}</s>`:''}</div>
      <span class="card__stock ${stockClass}">${stockText}</span>
      <button class="card__add" data-add="${p.id}" ${p.stock===0?'disabled style="opacity:.5;cursor:not-allowed"':''}>${icon('cart')} أضف للسلة</button>
    </div>
  </article>`;
}
function bindCardActions(PRODUCTS){
  document.querySelectorAll('[data-add]').forEach(b=>{
    b.onclick = () => addToCart(PRODUCTS.find(p=>p.id===b.dataset.add));
  });
  document.querySelectorAll('[data-fav]').forEach(b=>{
    b.onclick = (e) => { e.stopPropagation(); toggleFav(b.dataset.fav, b); };
  });
}

function render_cart(){
  const CART = getCart();
  const app = document.getElementById('app');
  if(!CART.length){
    app.innerHTML = `<div class="empty">${icon('empty')}<h2>السلة فارغة</h2><p>ابدأ التسوق وضيف منتجاتك</p><button class="btn btn-primary" onclick="go('products')">تصفح المنتجات</button></div>`;
    return;
  }
  const total = CART.reduce((s,x)=>s+x.price*x.qty,0);
  app.innerHTML = `
    <h2 class="section-title">سلة التسوق</h2>
    ${CART.map((it,i)=>`
      <div class="cart-item">
        <img src="${it.img}" alt="${it.name}">
        <div class="cart-item__info">
          <p class="cart-item__name">${it.name}</p>
          <span class="cart-item__price">${fmt(it.price)} × ${it.qty} = ${fmt(it.price*it.qty)}</span>
        </div>
        <button class="cart-item__del" onclick="removeItem(${i})" aria-label="حذف">${icon('trash')}</button>
      </div>`).join('')}
    <div class="total-bar"><span>الإجمالي</span><strong>${fmt(total)}</strong></div>
    <div style="display:flex;gap:12px;flex-wrap:wrap">
      <button class="btn btn-primary" onclick="go('checkout')">${icon('arrow')} إتمام الطلب</button>
      <button class="btn" style="background:var(--gray);color:var(--navy)" onclick="go('products')">متابعة التسوق</button>
    </div>`;
}
function removeItem(i){ const c=getCart(); c.splice(i,1); setCart(c); render_cart(); }

function render_checkout(){
  const CART = getCart();
  if(!CART.length){ go('cart'); return; }
  const total = CART.reduce((s,x)=>s+x.price*x.qty,0);
  document.getElementById('app').innerHTML = `
    <h2 class="section-title">إتمام الطلب</h2>
    <p class="section-sub">الإجمالي الحالي: <b style="color:var(--orange)">${fmt(total)}</b></p>
    <form class="form" onsubmit="submitOrder(event)">
      <div><label>الاسم الرباعي الكامل *</label>
        <input name="fullName" placeholder="أحمد محمد علي حسن" required pattern=".*\\s+.*\\s+.*\\s+.*" title="4 أجزاء على الأقل">
      </div>
      <div><label>رقم الهاتف الأساسي *</label>
        <input name="phone" type="tel" placeholder="01xxxxxxxxx" required pattern="01[0-9]{9}">
      </div>
      <div><label>رقم الهاتف الاحتياطي *</label>
        <input name="backup" type="tel" placeholder="01xxxxxxxxx" required pattern="01[0-9]{9}">
      </div>
      <div><label>مكان الاستلام *</label>
        <select name="location" required><option value="">اختر</option><option>المكتبة</option><option>الجامعة</option></select>
      </div>
      <div><label>موعد الاستلام *</label>
        <input name="slot" type="datetime-local" required>
      </div>
      <div><label>ملاحظات (اختياري)</label>
        <textarea name="notes" rows="2"></textarea>
      </div>
      <button type="submit" class="btn btn-primary" style="width:100%">${icon('check')} تأكيد الطلب</button>
    </form>`;
}

function submitOrder(e){
  e.preventDefault();
  const data = Object.fromEntries(new FormData(e.target).entries());
  const parts = data.fullName.trim().split(/\s+/);
  if(parts.length < 4){ toast('الاسم يجب أن يكون رباعيًا'); return; }
  const items = getCart().map(x=>({...x}));
  const total = items.reduce((s,x)=>s+x.price*x.qty,0);
  const num = genOrderNumber();
  const order = {
    number: num, createdAt: nowStr(),
    customer: data.fullName, phone: data.phone, backup: data.backup,
    location: data.location, slot: new Date(data.slot).toLocaleString('ar-EG',{dateStyle:'full',timeStyle:'short'}),
    notes: data.notes || '—', items, total, status:'pending',
    history: [{status:'pending', at: nowStr()}],
  };
  const orders = getOrders(); orders.unshift(order); setOrders(orders);
  setCart([]);
  go('invoice', num);
}

function render_invoice(num){
  const o = getOrders().find(x=>x.number===num);
  if(!o){ go('home'); return; }
  const lines = [];
  lines.push(`*🧾 فاتورة طلب — ${STORE_NAME}*`);
  lines.push('');
  lines.push(`*رقم الطلب:* ${o.number}`);
  lines.push(`*التاريخ:* ${o.createdAt}`);
  lines.push('');
  lines.push(`*👤 بيانات العميل*`);
  lines.push(`الاسم: ${o.customer}`);
  lines.push(`الهاتف: ${o.phone}`);
  lines.push(`الاحتياطي: ${o.backup}`);
  lines.push('');
  lines.push(`*📦 المنتجات*`);
  o.items.forEach((it,i)=>{ lines.push(`${i+1}. ${it.name}`); lines.push(`   ${it.qty} × ${fmt(it.price)} = ${fmt(it.price*it.qty)}`); });
  lines.push('');
  lines.push(`*💰 الإجمالي: ${fmt(o.total)}*`);
  lines.push('');
  lines.push(`*🚚 الاستلام*`);
  lines.push(`المكان: ${o.location}`);
  lines.push(`الموعد: ${o.slot}`);
  if(o.notes && o.notes !== '—') lines.push(`ملاحظات: ${o.notes}`);
  lines.push('');
  lines.push(`*⏳ الحالة:* ${STATUSES[o.status].label}`);
  const waText = encodeURIComponent(lines.join('\n'));

  document.getElementById('app').innerHTML = `
    <div class="invoice">
      <div class="invoice__head">
        <div class="invoice__brand">
          <img src="logo.png" alt="" onerror="this.style.display='none'">
          <div><h2>${STORE_NAME}</h2><p>مستلزماتك الدراسية والمكتبية</p></div>
        </div>
        <div class="invoice__num"><small>رقم الطلب</small><b>${o.number}</b></div>
      </div>
      <div class="invoice__body">
        <div class="invoice__note">✅ تم استلام طلبك — أرسل الفاتورة عبر واتساب لتأكيد الطلب</div>
        <div class="invoice__meta">
          <div><small>العميل</small><b>${o.customer}</b></div>
          <div><small>الهاتف</small><b>${o.phone}</b></div>
          <div><small>الاستلام</small><b>${o.location}</b></div>
          <div><small>الموعد</small><b>${o.slot}</b></div>
          <div><small>التاريخ</small><b>${o.createdAt}</b></div>
          <div><small>الحالة</small><b style="color:var(--orange)">${STATUSES[o.status].label}</b></div>
        </div>
        <table>
          <thead><tr><th>المنتج</th><th>الكمية</th><th>السعر</th><th>الإجمالي</th></tr></thead>
          <tbody>${o.items.map(it=>`<tr><td>${it.name}</td><td>${it.qty}</td><td>${fmt(it.price)}</td><td>${fmt(it.price*it.qty)}</td></tr>`).join('')}</tbody>
          <tfoot><tr class="grand"><td colspan="3">الإجمالي النهائي</td><td>${fmt(o.total)}</td></tr></tfoot>
        </table>
        ${o.notes && o.notes!=='—'?`<p style="color:var(--muted);font-size:14px"><b>ملاحظات:</b> ${o.notes}</p>`:''}
      </div>
      <div class="invoice__actions">
        <a class="btn" style="background:#25D366;color:#fff;font-weight:800" href="https://wa.me/${WHATSAPP}?text=${waText}" target="_blank">${icon('wa')} إرسال على واتساب</a>
        <button class="btn btn-navy" onclick="window.print()">${icon('print')} طباعة</button>
        <button class="btn" style="background:var(--gray);color:var(--navy)" onclick="go('orders')">متابعة طلباتي</button>
      </div>
    </div>`;
}

function render_orders(){
  const orders = getOrders();
  const app = document.getElementById('app');
  if(!orders.length){
    app.innerHTML = `<div class="empty">${icon('empty')}<h2>لا توجد طلبات بعد</h2><p>ابدأ التسوق وأكمل أول طلب</p><button class="btn btn-primary" onclick="go('products')">تصفح المنتجات</button></div>`;
    return;
  }
  app.innerHTML = `
    <h2 class="section-title">طلباتي</h2>
    <p class="section-sub">${orders.length} طلب — الحالة تُحدَّث من الإدارة</p>
    ${orders.map(o=>`
      <div class="order-card" onclick="go('orderDetail','${o.number}')">
        <div class="order-card__head">
          <span class="order-card__num">${o.number}</span>
          <span class="order-card__status ${STATUSES[o.status].cls}">${STATUSES[o.status].label}</span>
        </div>
        <div class="order-card__meta">
          <span>📅 ${o.createdAt}</span>
          <span>💰 ${fmt(o.total)}</span>
          <span>📦 ${o.items.length} منتج</span>
          <span>📍 ${o.location}</span>
        </div>
      </div>`).join('')}`;
}

function render_orderDetail(num){
  const o = getOrders().find(x=>x.number===num);
  if(!o){ go('orders'); return; }
  const currentStep = STATUSES[o.status].step;
  const steps = [
    {label:'في انتظار الموافقة', desc:'تم استلام الطلب وبانتظار تأكيد المكتبة'},
    {label:'جاري التجهيز',        desc:'جارٍ تجهيز منتجات طلبك'},
    {label:'تم التجهيز',           desc:'طلبك جاهز'},
    {label:'متاح للاستلام',       desc:'يمكنك الاستلام من الفرع'},
    {label:'تم الاستلام',          desc:'شكرًا لتعاملك معنا'},
  ];
  const waMsg = encodeURIComponent(`استفسار عن طلبي رقم ${o.number} — ${STORE_NAME}`);
  document.getElementById('app').innerHTML = `
    <button class="btn" style="background:var(--gray);color:var(--navy);margin:20px 0" onclick="go('orders')">← رجوع</button>
    <div class="invoice">
      <div class="invoice__head">
        <div class="invoice__brand">
          <img src="logo.png" alt="" onerror="this.style.display='none'">
          <div><h2>${o.number}</h2><p>${o.createdAt}</p></div>
        </div>
        <div class="invoice__num"><small>الحالة الحالية</small><b style="color:var(--orange)">${STATUSES[o.status].label}</b></div>
      </div>
      <div class="invoice__body">
        <h3 style="color:var(--navy);margin-top:0">حالة الطلب</h3>
        ${o.status === 'cancelled'
          ? `<div style="background:#fee2e2;color:#991b1b;padding:16px;border-radius:12px;text-align:center;font-weight:800">تم إلغاء هذا الطلب</div>`
          : `<div class="timeline">${steps.map((s,i)=>`
              <div class="step ${i<currentStep?'done':''} ${i===currentStep?'current':''}">
                <h4>${s.label}</h4><p>${s.desc}</p>
              </div>`).join('')}</div>`}
        <h3 style="color:var(--navy)">تفاصيل الطلب</h3>
        <div class="invoice__meta">
          <div><small>الاسم</small><b>${o.customer}</b></div>
          <div><small>الهاتف</small><b>${o.phone}</b></div>
          <div><small>الاستلام</small><b>${o.location}</b></div>
          <div><small>الموعد</small><b>${o.slot}</b></div>
        </div>
        <table>
          <thead><tr><th>المنتج</th><th>الكمية</th><th>السعر</th><th>الإجمالي</th></tr></thead>
          <tbody>${o.items.map(it=>`<tr><td>${it.name}</td><td>${it.qty}</td><td>${fmt(it.price)}</td><td>${fmt(it.price*it.qty)}</td></tr>`).join('')}</tbody>
          <tfoot><tr class="grand"><td colspan="3">الإجمالي</td><td>${fmt(o.total)}</td></tr></tfoot>
        </table>
      </div>
      <div class="invoice__actions">
        <a class="btn" style="background:#25D366;color:#fff;font-weight:800" href="https://wa.me/${WHATSAPP}?text=${waMsg}" target="_blank">${icon('wa')} تواصل بخصوص الطلب</a>
        <button class="btn btn-navy" onclick="go('invoice','${o.number}')">${icon('print')} عرض الفاتورة</button>
      </div>
    </div>`;
}

/* ============================================================
   لوحة الإدارة
   ============================================================ */
let CURRENT_VIEW = 'dashboard';
let FILTER_ORDER = 'all';
let FILTER_PRODUCT_Q = '';

function setAdminView(v){
  CURRENT_VIEW = v;
  document.querySelectorAll('.admin-nav-item').forEach(n=>n.classList.toggle('active', n.dataset.view===v));
  document.getElementById('adminSidebar').classList.remove('open');
  const titles = {dashboard:'لوحة القيادة', orders:'إدارة الطلبات', products:'إدارة المنتجات'};
  document.getElementById('adminPageTitle').textContent = titles[v] || '';
  renderAdmin();
}

function renderAdmin(){
  updateAdminBadges();
  if(CURRENT_VIEW==='dashboard') adminDashboard();
  else if(CURRENT_VIEW==='orders') adminOrders();
  else if(CURRENT_VIEW==='products') adminProducts();
}

function updateAdminBadges(){
  const orders = getOrders();
  const products = getProducts();
  const pendingCount = orders.filter(o=>o.status==='pending').length;
  const ob = document.getElementById('ordersBadge');
  if(ob) ob.textContent = pendingCount>0 ? `${orders.length} (${pendingCount} جديد)` : orders.length;
  const pb = document.getElementById('productsBadge');
  if(pb) pb.textContent = products.length;
}

function adminDashboard(){
  const orders = getOrders();
  const products = getProducts();
  const totalSales = orders.filter(o=>o.status!=='cancelled').reduce((s,o)=>s+o.total,0);
  const pending = orders.filter(o=>o.status==='pending').length;
  const lowStock = products.filter(p=>p.stock<5 && p.stock>0).length;
  const outStock = products.filter(p=>p.stock===0).length;

  document.getElementById('adminContent').innerHTML = `
    <div class="stats">
      <div class="stat stat--navy">
        <div class="stat__icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg></div>
        <div><div class="stat__num">${orders.length}</div><div class="stat__label">إجمالي الطلبات</div></div>
      </div>
      <div class="stat stat--orange">
        <div class="stat__icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg></div>
        <div><div class="stat__num">${pending}</div><div class="stat__label">في الانتظار</div></div>
      </div>
      <div class="stat stat--green">
        <div class="stat__icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg></div>
        <div><div class="stat__num">${fmt(totalSales)}</div><div class="stat__label">إجمالي المبيعات</div></div>
      </div>
      <div class="stat stat--blue">
        <div class="stat__icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><path d="M3 6h18M16 10a4 4 0 0 1-8 0"/></svg></div>
        <div><div class="stat__num">${products.length}</div><div class="stat__label">المنتجات</div></div>
      </div>
    </div>
    ${(pending>0||lowStock>0||outStock>0)?`
    <div class="panel">
      <h3>⚠️ يحتاج انتباه</h3>
      <div style="display:grid;gap:10px;grid-template-columns:repeat(auto-fit,minmax(200px,1fr))">
        ${pending>0?`<div style="background:#fef3c7;color:#92400e;padding:14px;border-radius:12px;font-weight:700">${pending} طلب في انتظار الموافقة</div>`:''}
        ${lowStock>0?`<div style="background:#fef3c7;color:#92400e;padding:14px;border-radius:12px;font-weight:700">${lowStock} منتج بمخزون منخفض</div>`:''}
        ${outStock>0?`<div style="background:#fee2e2;color:#991b1b;padding:14px;border-radius:12px;font-weight:700">${outStock} منتج نافذ</div>`:''}
      </div>
    </div>`:''}
    <div class="panel">
      <h3>آخر الطلبات</h3>
      ${orders.length===0?'<p style="color:var(--muted)">لا توجد طلبات بعد</p>':orders.slice(0,3).map(o=>`
        <div class="order" style="margin-bottom:10px">
          <div class="order__head" style="padding:12px 16px">
            <span class="order__num" style="font-size:14px">${o.number}</span>
            <span class="status-badge ${STATUSES[o.status].cls}">${STATUSES[o.status].label}</span>
            <span style="color:var(--muted);font-size:13px">${fmt(o.total)}</span>
          </div>
        </div>`).join('')}
    </div>`;
}

function adminOrders(){
  const allOrders = getOrders();
  let orders = allOrders;
  if(FILTER_ORDER !== 'all') orders = orders.filter(o=>o.status===FILTER_ORDER);
  document.getElementById('adminContent').innerHTML = `
    <div class="panel">
      <h3>فلترة الطلبات</h3>
      <div class="filter-bar">
        <select onchange="FILTER_ORDER=this.value; adminOrders()">
          <option value="all" ${FILTER_ORDER==='all'?'selected':''}>كل الطلبات (${allOrders.length})</option>
          ${Object.entries(STATUSES).map(([k,v])=>`<option value="${k}" ${FILTER_ORDER===k?'selected':''}>${v.label} (${allOrders.filter(o=>o.status===k).length})</option>`).join('')}
        </select>
      </div>
    </div>
    <div id="ordersList">
      ${orders.length===0?'<div class="panel" style="text-align:center;color:var(--muted)">لا توجد طلبات مطابقة</div>':orders.map(adminOrderCard).join('')}
    </div>`;
}

function adminOrderCard(o){
  const currentIdx = FLOW.indexOf(o.status);
  const isCancelled = o.status==='cancelled';
  const waText = encodeURIComponent(`مرحبًا، بخصوص طلبك رقم ${o.number} من ${STORE_NAME}`);
  return `<div class="order">
    <div class="order__head">
      <div>
        <div class="order__num">${o.number}</div>
        <div style="color:var(--muted);font-size:12px">${o.createdAt}</div>
      </div>
      <span class="status-badge ${STATUSES[o.status].cls}">${STATUSES[o.status].label}</span>
      <div style="font-weight:900;color:var(--navy);font-size:16px">${fmt(o.total)}</div>
    </div>
    <div class="order__body">
      <div class="order__meta">
        <div><small>👤 العميل</small><b>${o.customer}</b></div>
        <div><small>📞 الهاتف</small><b>${o.phone}</b></div>
        <div><small>📞 احتياطي</small><b>${o.backup}</b></div>
        <div><small>📍 الاستلام</small><b>${o.location}</b></div>
        <div><small>🕐 الموعد</small><b>${o.slot}</b></div>
        ${o.notes && o.notes!=='—'?`<div><small>📝 ملاحظات</small><b>${o.notes}</b></div>`:''}
      </div>
      <ul class="order__items">
        ${o.items.map(it=>`<li><span>${it.name} × ${it.qty}</span><span>${fmt(it.price*it.qty)}</span></li>`).join('')}
        <li><span>الإجمالي</span><span>${fmt(o.total)}</span></li>
      </ul>
      ${!isCancelled ? `
        <div style="margin-bottom:8px;font-weight:700;color:var(--navy);font-size:13px">🔄 تغيير الحالة:</div>
        <div class="status-flow">
          ${FLOW.map((s,i)=>`
            <button class="status-btn ${i<currentIdx?'done':''} ${i===currentIdx?'active current':''}" onclick="changeStatus('${o.number}','${s}')">
              ${i+1}. ${STATUSES[s].label}
            </button>`).join('')}
        </div>` : `<div style="background:#fee2e2;color:#991b1b;padding:12px;border-radius:10px;margin-bottom:12px;text-align:center;font-weight:800">تم إلغاء هذا الطلب</div>`}
      <div class="order__actions" style="border-top:1px solid #eef2f5;padding-top:14px;margin-top:8px">
        <a href="https://wa.me/2${o.phone.replace(/^0/,'')}?text=${waText}" target="_blank" style="padding:8px 14px;border-radius:10px;background:#25D366;color:#fff;font-weight:700;font-size:13px;text-decoration:none">واتساب العميل</a>
        ${!isCancelled && o.status!=='received' ? `<button class="btn-danger" onclick="cancelOrder('${o.number}')">إلغاء الطلب</button>` : ''}
      </div>
    </div>
  </div>`;
}

function changeStatus(num, newStatus){
  const orders = getOrders();
  const o = orders.find(x=>x.number===num);
  if(!o) return;
  if(o.status===newStatus) return;
  o.status = newStatus;
  o.history = o.history || [];
  o.history.push({status:newStatus, at:nowStr()});
  setOrders(orders);
  toast(`تم تحديث الحالة إلى: ${STATUSES[newStatus].label}`);
  adminOrders();
  updateAdminBadges();
}
function cancelOrder(num){
  if(!confirm('هل أنت متأكد من إلغاء الطلب؟')) return;
  changeStatus(num, 'cancelled');
}

function adminProducts(){
  const allProducts = getProducts();
  let products = allProducts;
  if(FILTER_PRODUCT_Q){
    const q = FILTER_PRODUCT_Q.toLowerCase();
    products = products.filter(p=>p.name.toLowerCase().includes(q) || (p.cat||'').toLowerCase().includes(q));
  }
  document.getElementById('adminContent').innerHTML = `
    <div class="panel">
      <h3>
        <span>قائمة المنتجات (${products.length})</span>
        <button style="background:var(--orange);color:#fff;border:0;border-radius:10px;cursor:pointer;padding:8px 16px;font-weight:700" onclick="openProductModal()">+ إضافة منتج</button>
      </h3>
      <div class="filter-bar">
        <input placeholder="🔍 ابحث بالاسم أو القسم..." value="${FILTER_PRODUCT_Q}" oninput="FILTER_PRODUCT_Q=this.value; adminProducts()">
      </div>
    </div>
    <div class="panel">
      <div class="products-list">
        ${products.length===0?'<p style="text-align:center;color:var(--muted);padding:24px">لا توجد منتجات</p>':products.map(p=>`
          <div class="prod-row">
            <img src="${p.img||''}" alt="${p.name}" onerror="this.style.background='#eef2f5'">
            <div class="prod-row__info">
              <p class="prod-row__name">${p.name}</p>
              <div class="prod-row__meta">${p.cat||'—'} · مخزون: ${p.stock} ${p.stock<5&&p.stock>0?'⚠️':''} ${p.stock===0?'❌':''}</div>
            </div>
            <div class="prod-row__price">${fmt(p.price)}${p.old?`<br><s style="color:var(--muted);font-size:12px;font-weight:400">${fmt(p.old)}</s>`:''}</div>
            <div class="prod-row__actions">
              <button class="edit" onclick="openProductModal('${p.id}')">تعديل</button>
              <button class="del" onclick="deleteProduct('${p.id}')">حذف</button>
            </div>
          </div>`).join('')}
      </div>
    </div>`;
}

function openProductModal(id){
  const modal = document.getElementById('modalBg');
  const content = document.getElementById('modalContent');
  const products = getProducts();
  const p = id ? products.find(x=>x.id===id) : null;
  const cats = ['أقلام','كراسات','كتب ومراجع','أدوات هندسية','أدوات مكتبية','هدايا','عام'];
  content.innerHTML = `
    <h3>${p?'تعديل منتج':'إضافة منتج جديد'}</h3>
    <form onsubmit="saveProduct(event, ${p?`'${p.id}'`:'null'})">
      <label>اسم المنتج *</label>
      <input name="name" value="${p?.name||''}" required>
      <label>القسم</label>
      <select name="cat">${cats.map(c=>`<option ${p?.cat===c?'selected':''}>${c}</option>`).join('')}</select>
      <label>السعر الحالي (ج.م) *</label>
      <input name="price" type="number" step="0.01" value="${p?.price||''}" required>
      <label>السعر قبل الخصم (اختياري)</label>
      <input name="old" type="number" step="0.01" value="${p?.old||''}">
      <label>الكمية المتاحة *</label>
      <input name="stock" type="number" value="${p?.stock??0}" required>
      <label>رابط الصورة</label>
      <input name="img" value="${p?.img||''}" placeholder="https://...">
      <div class="modal__actions">
        <button type="button" onclick="closeModal()" style="padding:10px 20px;border-radius:10px;border:1px solid #ccd6dd;background:#fff;font-weight:700">إلغاء</button>
        <button type="submit" style="padding:10px 20px;border-radius:10px;border:0;background:var(--orange);color:#fff;font-weight:700">${p?'حفظ':'إضافة'}</button>
      </div>
    </form>`;
  modal.classList.add('open');
}

function closeModal(){ document.getElementById('modalBg').classList.remove('open'); }

function saveProduct(e, id){
  e.preventDefault();
  const data = Object.fromEntries(new FormData(e.target).entries());
  const products = getProducts();
  const payload = {
    name: data.name,
    cat: data.cat,
    price: +data.price,
    stock: +data.stock,
    img: data.img || 'https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=400&q=80',
  };
  if(data.old) payload.old = +data.old;
  if(id){
    const i = products.findIndex(p=>p.id===id);
    if(i>-1) products[i] = {...products[i], ...payload};
    toast('تم حفظ التعديلات');
  } else {
    products.unshift({id:'p'+Date.now(), ...payload});
    toast('تمت الإضافة');
  }
  setProducts(products);
  closeModal();
  adminProducts();
  updateAdminBadges();
}

function deleteProduct(id){
  if(!confirm('حذف المنتج نهائيًا؟')) return;
  const products = getProducts().filter(p=>p.id!==id);
  setProducts(products);
  toast('تم الحذف');
  adminProducts();
  updateAdminBadges();
}