// ============================================================
// 1. إعدادات الاتصال بـ Supabase وبيانات المتجر الرسمية
// ============================================================
// تم تصحيح عنوان المشروع بدقة (حرف l الصحيح بدلاً من الخطأ المطبعي) لمنع Failed to fetch
const SUPABASE_URL = 'https://ckbajixdhbigrslbfbdf.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_Bymlf2vYI1qyqWsZ5uz_cg_olVr4vHt';
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const WHATSAPP = '201501727239';
const STORE_NAME = 'مكتبة النخبة 3';

const LS_CART = 'nokhba_cart_v1';
const LS_FAVS = 'nokhba_favs_v1';

let CART = JSON.parse(localStorage.getItem(LS_CART) || '[]');
let FAVS = new Set(JSON.parse(localStorage.getItem(LS_FAVS) || '[]'));
let POS_CART = [];
let currentUser = null;
let currentProfile = null;

const fmt = n => new Intl.NumberFormat('ar-EG', { style: 'currency', currency: 'EGP' }).format(n);
const nowStr = () => new Date().toLocaleString('ar-EG', { dateStyle: 'medium', timeStyle: 'short' });

const CATEGORIES = [
  { name: 'أقلام', img: 'https://images.unsplash.com/photo-1585336261022-680e295ce3fe?w=300&q=75', icon: 'pen' },
  { name: 'كراسات', img: 'https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=300&q=75', icon: 'book' },
  { name: 'كتب ومراجع', img: 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=300&q=75', icon: 'books' },
  { name: 'أدوات هندسية', img: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=300&q=75', icon: 'ruler' },
  { name: 'أدوات مكتبية', img: 'https://images.unsplash.com/photo-1497032628192-86f99bcd76bc?w=300&q=75', icon: 'clip' },
  { name: 'هدايا', img: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=300&q=75', icon: 'gift' }
];

const STATUSES = {
  pending: { label: 'في انتظار الموافقة', cls: 'status-pending', step: 0 },
  processing: { label: 'جاري التجهيز', cls: 'status-processing', step: 1 },
  ready: { label: 'تم التجهيز', cls: 'status-ready', step: 2 },
  available: { label: 'متاح للاستلام', cls: 'status-available', step: 3 },
  received: { label: 'تم الاستلام', cls: 'status-received', step: 4 },
  cancelled: { label: 'ملغي', cls: 'status-cancelled', step: -1 }
};
const FLOW = ['pending', 'processing', 'ready', 'available', 'received'];

const ICONS = {
  pen: '<path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/>',
  book: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>',
  books: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/><path d="M8 7h8M8 11h8"/>',
  ruler: '<path d="M21.3 8.7l-5-5a1 1 0 0 0-1.4 0L2.7 15.9a1 1 0 0 0 0 1.4l5 5a1 1 0 0 0 1.4 0L21.3 10a1 1 0 0 0 0-1.4z"/><path d="M7.5 10.5l2 2M10.5 7.5l2 2M13.5 4.5l2 2M4.5 13.5l2 2"/>',
  clip: '<path d="M21 8l-9-5-9 5v8l9 5 9-5V8z"/><path d="M3.3 7L12 12l8.7-5M12 22V12"/>',
  gift: '<path d="M20 12v10H4V12M2 7h20v5H2zM12 22V7M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7zM12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/>',
  cart: '<circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>',
  heart: '<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>',
  check: '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="M22 4L12 14.01l-3-3"/>',
  trash: '<path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/>',
  arrow: '<path d="M5 12h14M12 5l7 7-7 7"/>',
  empty: '<circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>',
  print: '<path d="M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/>',
  wa: '<path d="M17.5 14.4c-.3-.2-1.7-.9-2-1-.3-.1-.5-.2-.7.2-.2.3-.7.9-.9 1.1-.2.2-.3.2-.6.1-.3-.2-1.3-.5-2.4-1.5-.9-.8-1.5-1.8-1.7-2.1-.2-.3 0-.5.1-.6.1-.1.3-.3.4-.5.1-.2.2-.3.3-.5.1-.2 0-.4 0-.5 0-.1-.7-1.6-.9-2.2-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1.1 1-1.1 2.5s1.1 2.9 1.3 3.1c.2.2 2.2 3.4 5.4 4.7.8.3 1.3.5 1.8.6.8.3 1.5.2 2 .1.6-.1 1.7-.7 2-1.4.3-.7.3-1.3.2-1.4-.1-.1-.3-.2-.6-.3zM12 2C6.5 2 2 6.5 2 12c0 1.8.5 3.5 1.3 5L2 22l5.1-1.3c1.4.8 3.1 1.3 4.9 1.3 5.5 0 10-4.5 10-10S17.5 2 12 2z"/>'
};

const icon = (name, extra = '') => `<svg viewBox="0 0 24 24" fill="${name === 'wa' ? 'currentColor' : 'none'}" stroke="${name === 'wa' ? 'none' : 'currentColor'}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ${extra}>${ICONS[name] || ''}</svg>`;

function toast(msg) {
  const t = document.getElementById('toast');
  if (!t) return;
  document.getElementById('toastMsg').textContent = msg;
  t.classList.add('is-in');
  clearTimeout(t._timer);
  t._timer = setTimeout(() => t.classList.remove('is-in'), 2400);
}

const setCart = (v) => { CART = v; localStorage.setItem(LS_CART, JSON.stringify(v)); updateBadge(); };
const setFavs = () => localStorage.setItem(LS_FAVS, JSON.stringify([...FAVS]));

function updateBadge() {
  const count = CART.reduce((s, x) => s + x.qty, 0);
  const d = document.getElementById('cartCountDesktop');
  const m = document.getElementById('cartCountMobile');
  if (d) d.textContent = count;
  if (m) m.textContent = count;
}

// ============================================================
// 2. إدارة المستخدم والمصادقة (Auth & Roles)
// ============================================================
let isSignUp = false;

function toggleTheme() {
  const html = document.documentElement;
  const current = html.getAttribute('data-theme');
  const target = current === 'light' ? 'dark' : 'light';
  html.setAttribute('data-theme', target);
  localStorage.setItem('theme', target);
}
if (localStorage.getItem('theme') === 'dark') document.documentElement.setAttribute('data-theme', 'dark');

function toggleMenu() {
  const m = document.getElementById('sideMenu');
  const o = document.getElementById('sideMenuOverlay');
  if (m) m.classList.toggle('open');
  if (o) o.classList.toggle('open');
}

function openAuthModal() {
  if (currentUser) {
    if (confirm(`أنت مسجل حالياً باسم: ${currentProfile?.full_name || currentUser.email}\nهل تريد تسجيل الخروج؟`)) {
      logout();
    }
    return;
  }
  document.getElementById('authModalBg').classList.add('open');
}
function closeAuthModal() { 
  document.getElementById('authModalBg').classList.remove('open'); 
}

function toggleAuthMode() {
  isSignUp = !isSignUp;
  document.getElementById('authTitle').textContent = isSignUp ? 'إنشاء حساب جديد' : 'تسجيل الدخول';
  document.getElementById('authSubmitBtn').textContent = isSignUp ? 'إنشاء الحساب' : 'دخول';
  document.getElementById('toggleText').textContent = isSignUp ? 'لديك حساب بالفعل؟ تسجيل الدخول' : 'ليس لديك حساب؟ إنشاء حساب جديد';
  
  document.getElementById('signUpFields').style.display = isSignUp ? 'block' : 'none';
  document.getElementById('confirmPasswordField').style.display = isSignUp ? 'block' : 'none';
}

async function handleAuth(e) {
  e.preventDefault();
  const email = document.getElementById('authEmail').value.trim();
  const password = document.getElementById('authPassword').value;
  const submitBtn = document.getElementById('authSubmitBtn');

  if (isSignUp) {
    const fullName = document.getElementById('authName').value.trim();
    const phone = document.getElementById('authPhone').value.trim();
    const confirmPass = document.getElementById('authConfirmPassword').value;

    if (!fullName) { toast('يرجى إدخال الاسم بالكامل'); return; }
    if (!phone || !/^01[0-9]{9}$/.test(phone)) { toast('يرجى إدخال رقم هاتف صحيح مكون من 11 رقم'); return; }
    if (password.length < 6) { toast('كلمة المرور يجب أن لا تقل عن 6 أحرف'); return; }
    if (password !== confirmPass) { toast('كلمة المرور وتأكيد كلمة المرور غير متطابقين'); return; }

    submitBtn.textContent = 'جاري إنشاء الحساب...';
    submitBtn.disabled = true;

    try {
      const { data, error } = await supabaseClient.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            phone: phone
          }
        }
      });

      if (error) throw error;

      // تسجيل الدخول المباشر بعد إنشاء الحساب
      const { data: signInData, error: signInErr } = await supabaseClient.auth.signInWithPassword({
        email,
        password
      });

      if (!signInErr && signInData?.user) {
        toast('تم إنشاء الحساب وتسجيل الدخول بنجاح');
        closeAuthModal();
        await checkAuth();
        if (currentPage === 'orders' || currentPage === 'checkout' || currentPage === 'cart') {
          go(currentPage);
        }
      } else {
        toast('تم إنشاء الحساب بنجاح، يرجى تسجيل الدخول');
        toggleAuthMode();
      }
    } catch (err) {
      toast('خطأ في التسجيل: ' + (err.message || 'فشل الاتصال'));
    } finally {
      submitBtn.textContent = 'إنشاء الحساب';
      submitBtn.disabled = false;
    }
  } else {
    submitBtn.textContent = 'جاري التحقق...';
    submitBtn.disabled = true;

    try {
      const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
      if (error) throw error;

      toast('تم تسجيل الدخول بنجاح');
      closeAuthModal();
      await checkAuth();

      if (currentPage === 'orders') render_orders();
      else if (currentPage === 'cart') render_cart();
      else if (currentPage === 'checkout') render_checkout();
    } catch (err) {
      toast('خطأ في تسجيل الدخول: ' + (err.message || 'تأكد من صحة البريد وكلمة المرور'));
    } finally {
      submitBtn.textContent = 'دخول';
      submitBtn.disabled = false;
    }
  }
}

async function logout() {
  await supabaseClient.auth.signOut();
  currentUser = null;
  currentProfile = null;
  toast('تم تسجيل الخروج');
  await checkAuth();
  go('home');
}

async function checkAuth() {
  try {
    const { data: { user } } = await supabaseClient.auth.getUser();
    currentUser = user;

    const dName = document.getElementById('userNameDisplayDesktop');
    const mName = document.getElementById('userNameDisplayMobile');
    const aLink = document.getElementById('adminLink');
    const aLinkM = document.getElementById('adminLinkMobile');

    if (user) {
      const { data: profile } = await supabaseClient.from('profiles').select('*').eq('id', user.id).single();
      currentProfile = profile;
      const name = profile?.full_name || user.email.split('@')[0];
      if (dName) dName.textContent = name;
      if (mName) mName.textContent = name;

      const isAdmin = profile && (profile.role === 'admin' || profile.role === 'cashier');
      if (aLink) aLink.style.display = isAdmin ? 'inline-flex' : 'none';
      if (aLinkM) aLinkM.style.display = isAdmin ? 'flex' : 'none';
    } else {
      currentProfile = null;
      if (dName) dName.textContent = 'حسابي';
      if (mName) mName.textContent = 'حسابي';
      if (aLink) aLink.style.display = 'none';
      if (aLinkM) aLinkM.style.display = 'none';
    }
  } catch (e) {
    console.error('Auth verification error:', e);
  }
}

// ============================================================
// 3. دوال التواصل مع قاعدة البيانات (Database Operations)
// ============================================================
async function fetchProducts() {
  try {
    const { data, error } = await supabaseClient.from('products').select('*').eq('is_active', true).order('id', { ascending: false });
    if (error) throw error;
    return data || [];
  } catch (err) {
    console.warn('تعذر جلب المنتجات من السيرفر، استخدام الذاكرة المحلية إن وجدت:', err);
    return [];
  }
}

async function fetchOrders() {
  try {
    let query = supabaseClient.from('orders').select('*').order('created_at', { ascending: false });
    if (currentProfile?.role !== 'admin' && currentUser) {
      query = query.eq('user_id', currentUser.id);
    }
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error(err);
    return [];
  }
}

async function fetchInventory() {
  try {
    const { data, error } = await supabaseClient.from('inventory').select('*').order('name');
    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error(err);
    return [];
  }
}

async function fetchPosOrders() {
  try {
    const { data, error } = await supabaseClient.from('pos_orders').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error(err);
    return [];
  }
}
// ============================================================
// 4. التوجيه وعرض الواجهات الفوري (Instant Navigation & Router)
// ============================================================
let currentPage = 'home';
let STORE_PRODUCTS = [];
let ACTIVE_CATEGORY = 'all';
let SEARCH_QUERY = '';

async function go(page, param) {
  currentPage = page;
  const app = document.getElementById('app');
  if (!app) return;
  window.scrollTo({ top: 0, behavior: 'auto' });
  if (window[`render_${page}`]) {
    await window[`render_${page}`](param);
  }
}

// ============================================================
// 5. واجهات المتجر والصفحة الرئيسية السريعة (Storefront Views)
// ============================================================
async function render_home() {
  const app = document.getElementById('app');
  
  // 1. عرض فوري للهيكل والبانر والأقسام دون انتظار رد السيرفر إطلاقاً
  app.innerHTML = `
    <section class="hero">
      <h1>كل اللي محتاجه تلاقيه عندنا </h1>
      <p>مستلزماتك الدراسية والمكتبية والهندسية بأعلى جودة وأفضل الأسعار في مكتبة النخبة 3</p>
      <div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap">
        <button class="btn btn-primary" onclick="go('products')">${icon('cart')} تسوق الآن</button>
        <button class="btn btn-ghost" onclick="document.getElementById('catsSection').scrollIntoView({behavior:'smooth'})">اكتشف الأقسام</button>
      </div>
    </section>

    <h2 class="section-title" id="catsSection">تسوق حسب القسم </h2>
    <p class="section-sub">اختر القسم للوصول السريع لمنتجاتك</p>
    <div class="cat-grid">
      ${CATEGORIES.map(c => `
        <div class="cat" onclick="filterByCat('${c.name}')">
          <img src="${c.img}&auto=format&fit=crop&w=200&q=60" alt="${c.name}" loading="eager" decoding="async">
          <div class="cat__overlay">
            <div class="cat__icon">${icon(c.icon)}</div>
            <p class="cat__name">${c.name}</p>
          </div>
        </div>`).join('')}
    </div>

    <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;margin-top:40px">
      <div>
        <h2 class="section-title" style="margin:0">أحدث المنتجات </h2>
        <p class="section-sub" style="margin:0">وصل حديثاً لمكتبة النخبة 3</p>
      </div>
      <button class="btn" style="background:var(--gray);color:var(--navy);font-size:13px;padding:6px 14px" onclick="go('products')">عرض الكل ←</button>
    </div>
    
    <!-- هياكل تحميل مؤقتة سريعة في أجزاء من الثانية لحين جلب البيانات -->
    <div class="grid" id="homeProductsGrid" style="margin-top:16px">
      ${Array(4).fill(0).map(() => `
        <div class="card" style="opacity:.6;animation:pulse 1.2s infinite ease-in-out">
          <div style="aspect-ratio:1;background:var(--gray)"></div>
          <div style="padding:14px;display:flex;flex-direction:column;gap:8px">
            <div style="height:14px;background:var(--gray);border-radius:4px;width:75%"></div>
            <div style="height:18px;background:var(--gray);border-radius:4px;width:40%"></div>
            <div style="height:36px;background:var(--gray);border-radius:10px;margin-top:10px"></div>
          </div>
        </div>
      `).join('')}
    </div>
  `;

  // 2. تعبئة كروت المنتجات فور استلام البيانات
  STORE_PRODUCTS = await fetchProducts();
  const grid = document.getElementById('homeProductsGrid');
  if (grid) {
    if (STORE_PRODUCTS.length > 0) {
      grid.innerHTML = STORE_PRODUCTS.slice(0, 8).map((p, i) => card(p, i)).join('');
      bindCardActions(STORE_PRODUCTS);
    } else {
      grid.innerHTML = '<p style="color:var(--muted);text-align:center;grid-column:1/-1;padding:30px">لا توجد منتجات معروضة حالياً</p>';
    }
  }
}

function filterByCat(catName) {
  ACTIVE_CATEGORY = catName;
  go('products');
}

async function render_products() {
  STORE_PRODUCTS = await fetchProducts();
  renderProductsUI();
}

function renderProductsUI() {
  let list = STORE_PRODUCTS;
  if (ACTIVE_CATEGORY !== 'all') {
    list = list.filter(p => p.cat === ACTIVE_CATEGORY);
  }
  if (SEARCH_QUERY) {
    const q = SEARCH_QUERY.toLowerCase();
    list = list.filter(p => p.name.toLowerCase().includes(q) || (p.cat || '').toLowerCase().includes(q));
  }

  document.getElementById('app').innerHTML = `
    <h2 class="section-title">جميع المنتجات </h2>
    <p class="section-sub">تصفح مستلزماتك الدراسية مع إمكانية الفلترة والبحث المباشر</p>

    <div style="display:flex;gap:10px;flex-wrap:wrap;margin-bottom:20px;align-items:center">
      <input type="text" placeholder=" ابحث بالاسم أو القسم..." value="${SEARCH_QUERY}" 
        style="flex:1;min-width:200px;padding:12px;border:1px solid var(--border);border-radius:10px;background:var(--white);color:var(--ink)" 
        oninput="SEARCH_QUERY=this.value; renderProductsUI()">
      <select onchange="ACTIVE_CATEGORY=this.value; renderProductsUI()" 
        style="padding:12px;border:1px solid var(--border);border-radius:10px;background:var(--white);color:var(--ink);cursor:pointer">
        <option value="all" ${ACTIVE_CATEGORY === 'all' ? 'selected' : ''}>كل الأقسام</option>
        ${CATEGORIES.map(c => `<option value="${c.name}" ${ACTIVE_CATEGORY === c.name ? 'selected' : ''}>${c.name}</option>`).join('')}
      </select>
    </div>

    <div class="grid">
      ${list.map((p, i) => card(p, i)).join('') || '<p style="color:var(--muted);text-align:center;grid-column:1/-1;padding:40px">لا توجد منتجات مطابقة لخيارات البحث</p>'}
    </div>
  `;
  bindCardActions(list);
}

function card(p, i) {
  const isFav = FAVS.has(p.id);
  const stockClass = p.stock === 0 ? 'out' : p.stock < 5 ? 'low' : '';
  const stockText = p.stock === 0 ? 'نفذ المخزون' : p.stock < 5 ? `متبقي ${p.stock} فقط` : `متوفر (${p.stock})`;
  const discount = p.old_price && p.old_price > p.price ? Math.round((1 - p.price / p.old_price) * 100) : 0;

  return `
    <article class="card">
      <div class="card__img-wrap" onclick="openProductDetailModal(${p.id})">
        <img class="card__img" src="${p.img || 'https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=300&q=75'}" alt="${p.name}" loading="lazy">
        ${discount ? `<span class="card__tag">-${discount}%</span>` : ''}
        <button class="card__fav ${isFav ? 'active' : ''}" data-fav="${p.id}" aria-label="مفضلة">${icon('heart')}</button>
      </div>
      <div class="card__body">
        <h3 class="card__name" onclick="openProductDetailModal(${p.id})">${p.name}</h3>
        <div class="card__price">${fmt(p.price)} ${p.old_price ? `<s>${fmt(p.old_price)}</s>` : ''}</div>
        <span class="card__stock ${stockClass}">${stockText}</span>
        <button class="card__add" data-add="${p.id}" ${p.stock === 0 ? 'disabled style="opacity:.4;cursor:not-allowed"' : ''}>
          ${icon('cart')} أضف للسلة
        </button>
      </div>
    </article>
  `;
}

function bindCardActions(list) {
  document.querySelectorAll('[data-add]').forEach(b => {
    b.onclick = (e) => {
      e.stopPropagation();
      const p = list.find(x => x.id == b.dataset.add);
      if (p) addToCart(p);
    };
  });
  document.querySelectorAll('[data-fav]').forEach(b => {
    b.onclick = (e) => {
      e.stopPropagation();
      toggleFav(b.dataset.fav, b);
    };
  });
}

function addToCart(p) {
  const item = CART.find(x => x.id == p.id);
  if (item) {
    if (item.qty >= p.stock) { toast('عفواً، لقد وصلت للحد الأقصى المتاح'); return; }
    item.qty++;
  } else {
    CART.push({ id: p.id, name: p.name, price: p.price, qty: 1, img: p.img, stock: p.stock });
  }
  setCart(CART);
  toast(`تمت إضافة "${p.name}" إلى السلة 🛒`);
}

function toggleFav(id, el) {
  const numId = Number(id);
  if (FAVS.has(numId)) {
    FAVS.delete(numId);
    el.classList.remove('active');
    toast('تمت الإزالة من المفضلة');
  } else {
    FAVS.add(numId);
    el.classList.add('active');
    toast('أُضيف إلى المفضلة ❤️');
  }
  setFavs();
}

// نافذة عرض تفاصيل المنتج المنبثقة
async function openProductDetailModal(id) {
  if (!STORE_PRODUCTS.length) STORE_PRODUCTS = await fetchProducts();
  const p = STORE_PRODUCTS.find(x => x.id === id);
  if (!p) return;

  const bg = document.getElementById('productDetailModalBg');
  const box = document.getElementById('productDetailContent');
  box.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px">
      <h3 style="margin:0;color:var(--ink)">تفاصيل الصنف 🔍</h3>
      <button onclick="closeProductDetailModal()" style="border:0;background:none;font-size:24px;cursor:pointer">&times;</button>
    </div>
    <div style="aspect-ratio:1.2;overflow:hidden;border-radius:12px;margin-bottom:14px;background:var(--gray)">
      <img src="${p.img || ''}" alt="${p.name}" style="width:100%;height:100%;object-fit:cover">
    </div>
    <h2 style="font-size:18px;margin:0 0 6px">${p.name}</h2>
    <p style="color:var(--muted);font-size:13px;margin:0 0 10px">القسم: <b>${p.cat || 'عام'}</b></p>
    <div style="font-size:22px;font-weight:900;color:var(--orange);margin-bottom:14px">
      ${fmt(p.price)} ${p.old_price ? `<s style="font-size:14px;color:var(--muted)">${fmt(p.old_price)}</s>` : ''}
    </div>
    <div style="margin-bottom:16px;font-size:13px">
      حالة التوفر: <b>${p.stock > 0 ? `متوفر بالمكتبة (${p.stock} قطعة)` : 'نفذ المخزون'}</b>
    </div>
    <div style="display:flex;gap:10px">
      <button class="btn btn-primary" style="flex:1" ${p.stock === 0 ? 'disabled style="opacity:.4"' : ''} 
        onclick="addToCart(STORE_PRODUCTS.find(x=>x.id===${p.id})); closeProductDetailModal()">
        ${icon('cart')} أضف إلى السلة
      </button>
      <button class="btn" style="background:var(--gray);color:var(--ink)" onclick="closeProductDetailModal()">إغلاق</button>
    </div>
  `;
  bg.classList.add('open');
}
function closeProductDetailModal() { 
  document.getElementById('productDetailModalBg').classList.remove('open'); 
}

// ============================================================
// 6. سلة التسوق وإتمام الطلب (Cart & Checkout)
// ============================================================

  const total = CART.reduce((s, x) => s + x.price * x.qty, 0);
  app.innerHTML = `
    <h2 class="section-title">سلة التسوق 🛒</h2>
    <div style="margin-top:20px">
      ${CART.map((it, i) => `
        <div class="cart-item">
          <img src="${it.img || 'https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=300&q=75'}" alt="${it.name}">
          <div class="cart-item__info">
            <p class="cart-item__name">${it.name}</p>
            <div class="cart-item__price">${fmt(it.price)} × ${it.qty} = ${fmt(it.price * it.qty)}</div>
            <div class="cart-item__qty">
              <button onclick="changeCartQty(${i}, -1)">-</button>
              <span style="font-weight:800;font-size:13px">${it.qty}</span>
              <button onclick="changeCartQty(${i}, 1)">+</button>
            </div>
          </div>
          <button class="cart-item__del" onclick="removeCartItem(${i})" aria-label="حذف">${icon('trash')}</button>
        </div>`).join('')}
    </div>

    <div class="total-bar">
      <span>الإجمالي المستحق</span>
      <strong>${fmt(total)}</strong>
    </div>

    <div style="display:flex;gap:10px;flex-wrap:wrap">
      <button class="btn btn-primary" onclick="proceedToCheckout()">${icon('arrow')} إتمام وتأكيد الطلب</button>
      <button class="btn" style="background:var(--gray);color:var(--ink)" onclick="go('products')">متابعة التسوق</button>
    </div>
  `;


function changeCartQty(index, delta) {
  if (CART[index]) {
    CART[index].qty += delta;
    if (CART[index].qty <= 0) CART.splice(index, 1);
    setCart(CART);
    render_cart();
  }
}

function removeCartItem(index) {
  CART.splice(index, 1);
  setCart(CART);
  render_cart();
}

function proceedToCheckout() {
  if (!currentUser) {
    toast('إلزامي: يرجى تسجيل الدخول أولاً لتتمكن من إتمام طلبك');
    openAuthModal();
    return;
  }
  go('checkout');
}

async function render_checkout() {
  if (!currentUser) {
    toast('يرجى تسجيل الدخول لمتابعة تأكيد الطلب');
    openAuthModal();
    go('cart');
    return;
  }
  if (!CART.length) { go('cart'); return; }

  const total = CART.reduce((s, x) => s + x.price * x.qty, 0);
  const fullName = currentProfile?.full_name || '';
  const phone = currentProfile?.phone || '';

  document.getElementById('app').innerHTML = `
    <h2 class="section-title">إتمام وتأكيد الطلب 📝</h2>
    <p class="section-sub">يرجى كتابة البيانات بدقة للتجهيز والاستلام</p>

    <form class="form" onsubmit="submitOnlineOrder(event)">
      <div>
        <label>الاسم الرباعي الكامل *</label>
        <input name="fullName" value="${fullName}" placeholder="مثال: أحمد محمد علي حسن" required pattern=".*\\s+.*\\s+.*\\s+.*" title="يرجى إدخال اسم رباعي كامل">
      </div>
      <div>
        <label>رقم الهاتف الأساسي (01xxxxxxxxx) *</label>
        <input name="phone" type="tel" value="${phone}" placeholder="01012345678" required pattern="01[0-9]{9}">
      </div>
      <div>
        <label>رقم هاتف احتياطي *</label>
        <input name="backup" type="tel" placeholder="01112345678" required pattern="01[0-9]{9}">
      </div>
      <div>
        <label>مكان الاستلام المفضل *</label>
        <select name="location" required>
          <option value="">-- اختر المكان --</option>
          <option value="المكتبة">الاستلام من مقر مكتبة النخبة 3</option>
          <option value="الجامعة">الاستلام في مقر الجامعة</option>
        </select>
      </div>
      <div>
        <label>موعد الاستلام المتوقع *</label>
        <input name="slot" type="datetime-local" required>
      </div>
      <div>
        <label>ملاحظات إضافية على الطلب</label>
        <textarea name="notes" rows="2" placeholder="أي تفاصيل تخص التغليف، الألوان، أو تعليمات خاصة..."></textarea>
      </div>

      <div style="background:var(--gray);padding:14px;border-radius:10px;margin:8px 0;display:flex;justify-content:space-between;align-items:center">
        <span>إجمالي الفاتورة:</span>
        <strong style="color:var(--orange);font-size:18px">${fmt(total)}</strong>
      </div>

      <button type="submit" class="btn btn-primary" style="width:100%" id="submitOrderBtn">
        ${icon('check')} تأكيد وإرسال الطلب
      </button>
    </form>
  `;
}

async function submitOnlineOrder(e) {
  e.preventDefault();
  if (!currentUser) { toast('يجب تسجيل الدخول أولاً'); openAuthModal(); return; }

  const form = e.target;
  const data = Object.fromEntries(new FormData(form).entries());

  const nameParts = data.fullName.trim().split(/\s+/);
  if (nameParts.length < 4) {
    toast('الاسم يجب أن يكون رباعياً كاملاً');
    return;
  }

  const items = CART.map(x => ({ id: x.id, name: x.name, price: x.price, qty: x.qty }));
  const total = items.reduce((s, x) => s + x.price * x.qty, 0);

  const d = new Date();
  const ymd = d.getFullYear().toString().slice(-2) + String(d.getMonth() + 1).padStart(2, '0') + String(d.getDate()).padStart(2, '0');
  const orderNumber = 'AN-' + ymd + '-' + String(Math.floor(Math.random() * 9000) + 1000);

  const orderPayload = {
    order_number: orderNumber,
    user_id: currentUser.id,
    customer: data.fullName.trim(),
    phone: data.phone.trim(),
    backup_phone: data.backup.trim(),
    location: data.location,
    slot: new Date(data.slot).toLocaleString('ar-EG', { dateStyle: 'full', timeStyle: 'short' }),
    notes: data.notes?.trim() || '—',
    items: items,
    total: total,
    status: 'pending'
  };

  const btn = document.getElementById('submitOrderBtn');
  btn.textContent = 'جاري تسجيل الطلب...';
  btn.disabled = true;

  const { data: inserted, error } = await supabaseClient.from('orders').insert([orderPayload]).select();

  if (error || !inserted || !inserted.length) {
    console.error(error);
    toast('حدث خطأ أثناء حفظ الطلب، يرجى المحاولة ثانية');
    btn.textContent = 'تأكيد وإرسال الطلب';
    btn.disabled = false;
    return;
  }

  setCart([]);
  toast('تم إرسال طلبك بنجاح! ');
  go('invoice', orderNumber);
}
// ============================================================
// 7. الفواتير وتتبع الطلبات (Invoices & Order Tracking)
// ============================================================
async function render_invoice(num) {
  const orders = await fetchOrders();
  const o = orders.find(x => x.order_number === num);
  if (!o) { go('orders'); return; }

  const lines = [
    `* فاتورة طلب — ${STORE_NAME}*`,
    '',
    `*رقم الطلب:* ${o.order_number}`,
    `*تاريخ الطلب:* ${new Date(o.created_at).toLocaleString('ar-EG')}`,
    '',
    `*👤 بيانات العميل:*`,
    `الاسم: ${o.customer}`,
    `الهاتف: ${o.phone}`,
    `الاحتياطي: ${o.backup_phone}`,
    '',
    `* الأصناف المطلوبة:*`
  ];
  o.items.forEach((it, i) => {
    lines.push(`${i + 1}. ${it.name} | ${it.qty} × ${fmt(it.price)} = ${fmt(it.price * it.qty)}`);
  });
  lines.push('');
  lines.push(`* الإجمالي النهائي: ${fmt(o.total)}*`);
  lines.push('');
  lines.push(`*🚚 تفاصيل الاستلام:*`);
  lines.push(`المكان: ${o.location}`);
  lines.push(`الموعد: ${o.slot}`);
  if (o.notes && o.notes !== '—') lines.push(`ملاحظات: ${o.notes}`);
  lines.push('');
  lines.push(`*⏳ الحالة الحالية:* ${STATUSES[o.status]?.label || o.status}`);

  const waText = encodeURIComponent(lines.join('\n'));

  document.getElementById('app').innerHTML = `
    <div class="invoice">
      <div class="invoice__head">
        <div class="invoice__brand">
          <img src="logo.png" alt="" onerror="this.style.display='none'">
          <div>
            <h2>${STORE_NAME} </h2>
            <p>مستلزماتك المدرسية والجامعية</p>
          </div>
        </div>
        <div class="invoice__num">
          <small>كود الطلب</small>
          <b>${o.order_number}</b>
        </div>
      </div>
      <div class="invoice__body">
        <div class="invoice__note">
           تم تسجيل طلبك بنجاح! اضغط بالأسفل لإرسال الفاتورة لرقم المكتبة عبر واتساب لتأكيد الحجز.
        </div>
        <div class="invoice__meta">
          <div><small>العميل</small><b>${o.customer}</b></div>
          <div><small>رقم الهاتف</small><b>${o.phone}</b></div>
          <div><small>مكان الاستلام</small><b>${o.location}</b></div>
          <div><small>الموعد المجدول</small><b>${o.slot}</b></div>
        </div>
        <table>
          <thead><tr><th>المنتج</th><th>الكمية</th><th>السعر</th><th>الإجمالي</th></tr></thead>
          <tbody>
            ${o.items.map(it => `
              <tr>
                <td>${it.name}</td>
                <td>${it.qty}</td>
                <td>${fmt(it.price)}</td>
                <td>${fmt(it.price * it.qty)}</td>
              </tr>`).join('')}
          </tbody>
          <tfoot>
            <tr class="grand"><td colspan="3">الإجمالي النهائي</td><td>${fmt(o.total)}</td></tr>
          </tfoot>
        </table>
      </div>
      <div class="invoice__actions">
        <a class="btn" style="background:#25D366;color:#fff;font-weight:800" href="https://wa.me/${WHATSAPP}?text=${waText}" target="_blank" rel="noopener">
          ${icon('wa')} تأكيد وإرسال الفاتورة عبر واتساب
        </a>
        <button class="btn btn-navy" onclick="window.print()">${icon('print')} طباعة</button>
        <button class="btn" style="background:var(--gray);color:var(--ink)" onclick="go('orders')">متابعة طلباتي 📦</button>
      </div>
    </div>
  `;
}

function render_cart() {
  const app = document.getElementById('app');
  if (!CART.length) {
    app.innerHTML = `
      <div class="empty">
        ${icon('empty', 'style="width:80px;height:80px"')}
        <h2>السلة فارغة حاليا</h2>
        <p>ابدأ التسوق واختر مستلزماتك لتظهر هنا</p>
        <button class="btn btn-primary" onclick="go('products')">تصفح المنتجات</button>
      </div>`;
    return;
  }

  const total = CART.reduce((s, x) => s + x.price * x.qty, 0);
  app.innerHTML = `
    <h2 class="section-title">سلة التسوق</h2>
    <div style="margin-top:20px">
      ${CART.map((it, i) => `
        <div class="cart-item">
          <img src="${it.img || 'https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=300&q=75'}" alt="${it.name}">
          <div class="cart-item__info">
            <p class="cart-item__name">${it.name}</p>
            <div class="cart-item__price">${fmt(it.price)} × ${it.qty} = ${fmt(it.price * it.qty)}</div>
            <div class="cart-item__qty">
              <button onclick="changeCartQty(${i}, -1)">-</button>
              <span style="font-weight:800;font-size:13px">${it.qty}</span>
              <button onclick="changeCartQty(${i}, 1)">+</button>
            </div>
          </div>
          <button class="cart-item__del" onclick="removeCartItem(${i})" aria-label="حذف">${icon('trash')}</button>
        </div>`).join('')}
    </div>

    <div class="total-bar">
      <span>الإجمالي المستحق</span>
      <strong>${fmt(total)}</strong>
    </div>

    <div style="display:flex;gap:10px;flex-wrap:wrap">
      <button class="btn btn-primary" onclick="proceedToCheckout()">${icon('arrow')} إتمام وتأكيد الطلب</button>
      <button class="btn" style="background:var(--gray);color:var(--ink)" onclick="go('products')">متابعة التسوق</button>
    </div>
  `;
}

async function render_orders() {
  const app = document.getElementById('app');
  
  if (!currentUser) {
    app.innerHTML = `
      <div class="empty">
        ${icon('empty', 'style="width:80px;height:80px"')}
        <h2>يرجى تسجيل الدخول أولا</h2>
        <p>لتتمكن من مراجعة وتتبع سجل طلباتك السابقة</p>
        <button class="btn btn-primary" onclick="openAuthModal()">تسجيل الدخول</button>
      </div>`;
    return;
  }

  const orders = await fetchOrders();

  if (!orders.length) {
    app.innerHTML = `
      <div class="empty">
        ${icon('empty', 'style="width:80px;height:80px"')}
        <h2>لا توجد لديك طلبات مسجلة بعد</h2>
        <p>ابدأ تسوق مستلزماتك الدراسية الآن</p>
        <button class="btn btn-primary" onclick="go('products')">تصفح المنتجات</button>
      </div>`;
    return;
  }

  app.innerHTML = `
    <h2 class="section-title">طلباتي السابقة</h2>
    <p class="section-sub">${orders.length} طلبات مسجلة بحسابك</p>

    <div style="display:grid;gap:12px;margin-top:20px">
      ${orders.map(o => `
        <div class="order-card" onclick="go('orderDetail', '${o.order_number}')">
          <div class="order-card__head">
            <span class="order-card__num">${o.order_number}</span>
            <span class="order-card__status ${STATUSES[o.status]?.cls || ''}">${STATUSES[o.status]?.label || o.status}</span>
          </div>
          <div class="order-card__meta">
            <span>التاريخ: ${new Date(o.created_at).toLocaleDateString('ar-EG')}</span>
            <span>الإجمالي: ${fmt(o.total)}</span>
            <span>عدد الأصناف: ${o.items.length}</span>
            <span>مكان الاستلام: ${o.location}</span>
          </div>
        </div>`).join('')}
    </div>
  `;
}

  const orders = await fetchOrders();
  const app = document.getElementById('app');

  if (!orders.length) {
    app.innerHTML = `
      <div class="empty">
        ${icon('empty')}
        <h2>لا توجد لديك طلبات مسجلة بعد </h2>
        <p>ابدأ تسوق مستلزماتك الدراسية الآن</p>
        <button class="btn btn-primary" onclick="go('products')">تصفح المنتجات</button>
      </div>`;
    return;
  }

  app.innerHTML = `
    <h2 class="section-title">طلباتي السابقة </h2>
    <p class="section-sub">${orders.length} طلبات مسجلة بحسابك</p>

    <div style="display:grid;gap:12px;margin-top:20px">
      ${orders.map(o => `
        <div class="order-card" onclick="go('orderDetail', '${o.order_number}')">
          <div class="order-card__head">
            <span class="order-card__num">${o.order_number}</span>
            <span class="order-card__status ${STATUSES[o.status]?.cls || ''}">${STATUSES[o.status]?.label || o.status}</span>
          </div>
          <div class="order-card__meta">
            <span> ${new Date(o.created_at).toLocaleDateString('ar-EG')}</span>
            <span> ${fmt(o.total)}</span>
            <span> ${o.items.length} أصناف</span>
            <span> ${o.location}</span>
          </div>
        </div>`).join('')}
    </div>
  `;


async function render_orderDetail(num) {
  const orders = await fetchOrders();
  const o = orders.find(x => x.order_number === num);
  if (!o) { go('orders'); return; }

  const currentStep = STATUSES[o.status]?.step ?? 0;
  const steps = [
    { label: 'في انتظار الموافقة', desc: 'تم استلام الطلب وبانتظار تأكيد إدارة المكتبة' },
    { label: 'جاري التجهيز', desc: 'المكتبة تقوم حالياً بتجميع وتجهيز المستلزمات المطلوبة' },
    { label: 'تم التجهيز', desc: 'طلبك مغلف وجاهز بالكامل' },
    { label: 'متاح للاستلام', desc: 'يمكنك التوجه لمكان الاستلام المختار واستلام طلبك' },
    { label: 'تم الاستلام', desc: 'تم تسليم الطلب بنجاح، شكراً لتعاملك مع النخبة 3' }
  ];

  document.getElementById('app').innerHTML = `
    <button class="btn" style="background:var(--gray);color:var(--ink);margin:16px 0" onclick="go('orders')">← رجوع لقائمة الطلبات</button>
    <div class="invoice">
      <div class="invoice__head">
        <div>
          <h2 style="margin:0">${o.order_number}</h2>
          <small style="opacity:.85">${new Date(o.created_at).toLocaleString('ar-EG')}</small>
        </div>
        <div class="invoice__num">
          <small>الحالة الحالية</small>
          <b style="color:var(--orange)">${STATUSES[o.status]?.label || o.status}</b>
        </div>
      </div>
      <div class="invoice__body">
        <h3 style="margin-top:0">تتبع مسار الطلب </h3>
        ${o.status === 'cancelled'
          ? `<div style="background:#fee2e2;color:#991b1b;padding:12px;border-radius:10px;text-align:center;font-weight:800">هذا الطلب ملغي ❌</div>`
          : `<div class="timeline">
              ${steps.map((s, i) => `
                <div class="step ${i < currentStep ? 'done' : ''} ${i === currentStep ? 'current' : ''}">
                  <h4>${s.label}</h4>
                  <p>${s.desc}</p>
                </div>`).join('')}
            </div>`}

        <h4 style="margin:20px 0 10px">الأصناف:</h4>
        <table>
          <thead><tr><th>المنتج</th><th>الكمية</th><th>السعر</th><th>الإجمالي</th></tr></thead>
          <tbody>
            ${o.items.map(it => `<tr><td>${it.name}</td><td>${it.qty}</td><td>${fmt(it.price)}</td><td>${fmt(it.price * it.qty)}</td></tr>`).join('')}
          </tbody>
          <tfoot><tr class="grand"><td colspan="3">الإجمالي</td><td>${fmt(o.total)}</td></tr></tfoot>
        </table>
      </div>
    </div>
  `;
}

async function render_orderTracking() {
  if (!currentUser) { toast('يجب تسجيل الدخول لتتبع طلباتك'); openAuthModal(); return; }
  const orders = await fetchOrders();

  document.getElementById('app').innerHTML = `
    <h2 class="section-title">تتبع حالة الطلبات </h2>
    <p class="section-sub">اختر رقم طلبك لعرض الرسم البياني لمراحل التجهيز والتسليم</p>

    ${!orders.length ? '<p style="color:var(--muted)">لا توجد طلبات مسجلة بحسابك حالياً</p>' : `
      <div style="margin-bottom:24px">
        <select onchange="if(this.value) go('orderDetail', this.value)" 
          style="width:100%;padding:14px;border-radius:12px;border:1px solid var(--border);background:var(--white);color:var(--ink);font-weight:700">
          <option value="">-- اضغط هنا لاختيار الطلب المراد تتبعه --</option>
          ${orders.map(o => `<option value="${o.order_number}">${o.order_number} - (${STATUSES[o.status]?.label || o.status}) - ${fmt(o.total)}</option>`).join('')}
        </select>
      </div>`}

    <div style="display:grid;gap:10px">
      ${Object.entries(STATUSES).map(([k, v]) => `
        <div style="display:flex;justify-content:space-between;align-items:center;padding:14px 18px;background:var(--gray);border-radius:12px">
          <span style="font-weight:700">${v.label}</span>
          <span class="order-card__status ${v.cls}">${orders.filter(o => o.status === k).length} طلب</span>
        </div>`).join('')}
    </div>
  `;
}

// ============================================================
// 8. لوحة الإدارة ونظام الكاشير (Admin, POS, Inventory, Reports)
// ============================================================
let CURRENT_ADMIN_VIEW = 'dashboard';
let ADMIN_FILTER_STATUS = 'all';

function openAdmin() {
  if (currentProfile?.role !== 'admin' && currentProfile?.role !== 'cashier') {
    toast('غير مصرح لك بدخول لوحة الإدارة');
    return;
  }
  document.body.classList.add('admin-mode');
  window.scrollTo(0, 0);
  setAdminView('dashboard');
}

function exitAdmin() {
  document.body.classList.remove('admin-mode');
  window.scrollTo(0, 0);
  go('home');
}

function setAdminView(view) {
  CURRENT_ADMIN_VIEW = view;
  document.querySelectorAll('.admin-nav-item').forEach(b => {
    b.classList.toggle('active', b.dataset.view === view);
  });
  const side = document.getElementById('adminSidebar');
  if (side) side.classList.remove('open');

  const titles = {
    dashboard: 'لوحة القيادة والإحصائيات ',
    pos: 'شاشة الكاشير والمبيعات السريعة ',
    orders: 'إدارة طلبات الأونلاين ',
    products: 'إدارة منتجات المتجر',
    inventory: 'إدارة المخزون والتكاليف ',
    reports: 'التقارير المالية والأرباح '
  };
  document.getElementById('adminPageTitle').textContent = titles[view] || 'لوحة التحكم';
  renderAdminContent();
}

async function renderAdminContent() {
  await updateAdminBadges();
  if (CURRENT_ADMIN_VIEW === 'dashboard') await adminDashboard();
  else if (CURRENT_ADMIN_VIEW === 'pos') await adminPOS();
  else if (CURRENT_ADMIN_VIEW === 'orders') await adminOrders();
  else if (CURRENT_ADMIN_VIEW === 'products') await adminProducts();
  else if (CURRENT_ADMIN_VIEW === 'inventory') await adminInventory();
  else if (CURRENT_ADMIN_VIEW === 'reports') await adminReports();
}

async function updateAdminBadges() {
  const orders = await fetchOrders();
  const products = await fetchProducts();
  const pending = orders.filter(o => o.status === 'pending').length;
  const oB = document.getElementById('ordersBadge');
  const pB = document.getElementById('productsBadge');
  if (oB) oB.textContent = pending > 0 ? `${orders.length} (${pending} جديد)` : orders.length;
  if (pB) pB.textContent = products.length;
}

// 8.1 لوحة القيادة (Dashboard)
async function adminDashboard() {
  const orders = await fetchOrders();
  const posOrders = await fetchPosOrders();

  const onlineSales = orders.filter(o => o.status !== 'cancelled').reduce((s, o) => s + Number(o.total), 0);
  const posSales = posOrders.reduce((s, o) => s + Number(o.total), 0);
  const totalSales = onlineSales + posSales;
  const pendingOrders = orders.filter(o => o.status === 'pending').length;

  document.getElementById('adminContent').innerHTML = `
    <div class="stats">
      <div class="stat stat--navy">
        <div class="stat__icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg></div>
        <div><div class="stat__num">${orders.length}</div><div class="stat__label">طلبات الأونلاين</div></div>
      </div>
      <div class="stat stat--orange">
        <div class="stat__icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg></div>
        <div><div class="stat__num">${pendingOrders}</div><div class="stat__label">في انتظار الموافقة</div></div>
      </div>
      <div class="stat stat--green">
        <div class="stat__icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg></div>
        <div><div class="stat__num">${fmt(totalSales)}</div><div class="stat__label">إجمالي المبيعات الشامل</div></div>
      </div>
      <div class="stat stat--blue">
        <div class="stat__icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="4" width="20" height="16" rx="2"/></svg></div>
        <div><div class="stat__num">${posOrders.length}</div><div class="stat__label">فواتير الكاشير</div></div>
      </div>
    </div>

    <div class="panel">
      <h3>آخر طلبات الأونلاين الواردة </h3>
      ${!orders.length ? '<p style="color:var(--muted)">لا توجد طلبات بعد</p>' : `
        <div>
          ${orders.slice(0, 5).map(o => `
            <div style="display:flex;justify-content:space-between;align-items:center;padding:12px;border-bottom:1px solid var(--border);flex-wrap:wrap;gap:8px">
              <div>
                <b>${o.order_number}</b> — <span>${o.customer}</span>
                <div style="font-size:12px;color:var(--muted)">${new Date(o.created_at).toLocaleString('ar-EG')}</div>
              </div>
              <span class="status-badge ${STATUSES[o.status]?.cls || ''}">${STATUSES[o.status]?.label || o.status}</span>
              <strong style="color:var(--orange)">${fmt(o.total)}</strong>
            </div>`).join('')}
        </div>`}
    </div>
  `;
}

// 8.2 شاشة الكاشير السريع (POS)
async function adminPOS() {
  const inv = await fetchInventory();

  document.getElementById('adminContent').innerHTML = `
    <div class="pos-container">
      <div>
        <div class="panel" style="padding:14px;margin-bottom:12px">
          <input type="text" id="posSearch" placeholder="🔍 ابحث في أصناف المخزون للبيع السريع..." 
            style="width:100%;padding:10px 14px;border:1px solid var(--border);border-radius:10px" 
            oninput="filterPosProducts(this.value)">
        </div>
        <div class="pos-products" id="posProductsList">
          ${renderPosGrid(inv)}
        </div>
      </div>

      <div class="pos-bill">
        <h3 style="margin:0 0 10px;color:var(--navy);border-bottom:1px solid var(--border);padding-bottom:10px">الفاتورة الحالية </h3>
        <div class="pos-bill__items" id="posBillItems">
          ${renderPosBillItems()}
        </div>
        <div style="border-top:2px solid var(--border);padding-top:12px">
          <div style="display:flex;justify-content:space-between;align-items:center;font-size:18px;font-weight:900;margin-bottom:14px">
            <span>الإجمالي:</span>
            <span id="posBillTotal" style="color:var(--orange)">${fmt(calcPosTotal())}</span>
          </div>
          <div style="display:flex;gap:8px">
            <button class="btn btn-primary" style="flex:1" onclick="checkoutPOS()"> إتمام الدفع والطباعة</button>
            <button class="btn" style="background:#fee2e2;color:#dc2626" onclick="clearPOS()">مسح</button>
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderPosGrid(items) {
  if (!items.length) return '<p style="color:var(--muted);text-align:center;grid-column:1/-1">المخزون فارغ، أضف أصناف من إدارة المخزون أولاً</p>';
  return items.map(p => `
    <div class="pos-item" onclick="addItemToPOS(${p.id}, '${p.name.replace(/'/g, "\\'")}', ${p.sell_price}, ${p.cost_price}, ${p.stock})">
      <div class="pos-item__name">${p.name}</div>
      <div class="pos-item__price">${fmt(p.sell_price)}</div>
      <div class="pos-item__stock">${p.stock > 0 ? `المتاح: ${p.stock}` : '<b style="color:red">نفذ</b>'}</div>
    </div>`).join('');
}

async function filterPosProducts(q) {
  const inv = await fetchInventory();
  const filtered = inv.filter(x => x.name.toLowerCase().includes(q.toLowerCase()));
  document.getElementById('posProductsList').innerHTML = renderPosGrid(filtered);
}

function addItemToPOS(id, name, sellPrice, costPrice, stock) {
  if (stock <= 0) { toast('هذا الصنف نفذ من المخزون!'); return; }
  const existing = POS_CART.find(x => x.id === id);
  if (existing) {
    if (existing.qty >= stock) { toast('وصلت للحد الأقصى المتاح في المخزون'); return; }
    existing.qty++;
  } else {
    POS_CART.push({ id, name, sellPrice, costPrice, qty: 1, maxStock: stock });
  }
  updatePOSUI();
}

function renderPosBillItems() {
  if (!POS_CART.length) return '<p style="color:var(--muted);text-align:center;margin-top:40px">لا توجد أصناف في الفاتورة بعد</p>';
  return POS_CART.map((it, idx) => `
    <div class="pos-bill-row">
      <div style="flex:1">
        <b>${it.name}</b>
        <div style="color:var(--muted);font-size:12px">${fmt(it.sellPrice)} × ${it.qty} = ${fmt(it.sellPrice * it.qty)}</div>
      </div>
      <div class="qty-ctrls">
        <button onclick="changePosQty(${idx}, -1)">-</button>
        <b>${it.qty}</b>
        <button onclick="changePosQty(${idx}, 1)">+</button>
        <button onclick="removePosItem(${idx})" style="background:#fee2e2;color:#dc2626">×</button>
      </div>
    </div>`).join('');
}

function changePosQty(idx, delta) {
  if (POS_CART[idx]) {
    POS_CART[idx].qty += delta;
    if (POS_CART[idx].qty <= 0) POS_CART.splice(idx, 1);
    updatePOSUI();
  }
}
function removePosItem(idx) {
  POS_CART.splice(idx, 1);
  updatePOSUI();
}
function clearPOS() {
  POS_CART = [];
  updatePOSUI();
}
function calcPosTotal() {
  return POS_CART.reduce((s, x) => s + x.sellPrice * x.qty, 0);
}
function updatePOSUI() {
  const c = document.getElementById('posBillItems');
  const t = document.getElementById('posBillTotal');
  if (c) c.innerHTML = renderPosBillItems();
  if (t) t.textContent = fmt(calcPosTotal());
}

async function checkoutPOS() {
  if (!POS_CART.length) { toast('الفاتورة فارغة!'); return; }

  const total = calcPosTotal();
  const totalCost = POS_CART.reduce((s, x) => s + x.costPrice * x.qty, 0);
  const profit = total - totalCost;
  const invCode = 'POS-' + Date.now().toString().slice(-6);

  // 1. تسجيل الفاتورة في pos_orders
  const { error: posError } = await supabaseClient.from('pos_orders').insert([{
    invoice_code: invCode,
    items: POS_CART,
    total: total,
    profit: profit
  }]);

  if (posError) {
    toast('خطأ في حفظ الفاتورة: ' + posError.message);
    return;
  }

  // 2. خصم الكميات من المخزون inventory
  for (const it of POS_CART) {
    const { data: currentInv } = await supabaseClient.from('inventory').select('stock').eq('id', it.id).single();
    if (currentInv) {
      const newStock = Math.max(0, currentInv.stock - it.qty);
      await supabaseClient.from('inventory').update({ stock: newStock }).eq('id', it.id);
    }
  }

  // 3. عرض نافذة الطباعة والمشاركة
  openPosReceiptModal(invCode, [...POS_CART], total);
  POS_CART = [];
  adminPOS();
}

function openPosReceiptModal(code, items, total) {
  const modal = document.getElementById('posReceiptModalBg');
  const content = document.getElementById('posReceiptContent');

  const lines = [
    `* فاتورة مبيعات نقدية — ${STORE_NAME}*`,
    `رقم الفاتورة: ${code}`,
    `التاريخ: ${nowStr()}`,
    '-------------------------'
  ];
  items.forEach((it, i) => lines.push(`${i + 1}. ${it.name} (${it.qty} × ${fmt(it.sellPrice)}) = ${fmt(it.sellPrice * it.qty)}`));
  lines.push('-------------------------');
  lines.push(`*الإجمالي المدفوع: ${fmt(total)}*`);
  lines.push('شكراً لزيارتكم مكتبة النخبة 3!');

  const waText = encodeURIComponent(lines.join('\n'));

  content.innerHTML = `
    <div style="text-align:center;margin-bottom:14px">
      <h2 style="margin:0;color:var(--navy)">${STORE_NAME} </h2>
      <p style="margin:2px 0;font-size:12px;color:var(--muted)">فاتورة كاشير نقدية</p>
      <b>رقم الفاتورة: ${code}</b>
      <div style="font-size:11px;color:var(--muted)">${nowStr()}</div>
    </div>
    <table class="data-table" style="margin-bottom:16px">
      <thead><tr><th>الصنف</th><th>الكمية</th><th>السعر</th><th>الإجمالي</th></tr></thead>
      <tbody>
        ${items.map(it => `<tr><td>${it.name}</td><td>${it.qty}</td><td>${fmt(it.sellPrice)}</td><td>${fmt(it.sellPrice * it.qty)}</td></tr>`).join('')}
      </tbody>
      <tfoot>
        <tr style="font-weight:900"><td colspan="3">الإجمالي النهائي</td><td>${fmt(total)}</td></tr>
      </tfoot>
    </table>
    <div class="no-print" style="display:flex;gap:8px;flex-wrap:wrap">
      <button class="btn btn-navy" style="flex:1" onclick="window.print()">${icon('print')} طباعة الفاتورة</button>
      <a class="btn" style="background:#25D366;color:#fff" href="https://wa.me/?text=${waText}" target="_blank" rel="noopener">
        ${icon('wa')} مشاركة على واتساب
      </a>
      <button class="btn" style="background:var(--gray);color:var(--ink)" onclick="document.getElementById('posReceiptModalBg').classList.remove('open')">تم</button>
    </div>
  `;
  modal.classList.add('open');
}

// 8.3 إدارة طلبات الأونلاين
async function adminOrders() {
  const all = await fetchOrders();
  let orders = all;
  if (ADMIN_FILTER_STATUS !== 'all') {
    orders = orders.filter(o => o.status === ADMIN_FILTER_STATUS);
  }

  document.getElementById('adminContent').innerHTML = `
    <div class="panel">
      <h3>فلترة الطلبات 🔍</h3>
      <div style="display:flex;gap:10px;flex-wrap:wrap">
        <select onchange="ADMIN_FILTER_STATUS=this.value; adminOrders()" 
          style="padding:10px 14px;border:1px solid var(--border);border-radius:10px;background:var(--white);color:var(--ink)">
          <option value="all" ${ADMIN_FILTER_STATUS === 'all' ? 'selected' : ''}>كل الحالات (${all.length})</option>
          ${Object.entries(STATUSES).map(([k, v]) => `
            <option value="${k}" ${ADMIN_FILTER_STATUS === k ? 'selected' : ''}>${v.label} (${all.filter(x => x.status === k).length})</option>`).join('')}
        </select>
      </div>
    </div>

    <div style="display:grid;gap:14px">
      ${!orders.length ? '<div class="panel" style="text-align:center;color:var(--muted)">لا توجد طلبات مطابقة</div>' : orders.map(adminOrderCard).join('')}
    </div>
  `;
}

function adminOrderCard(o) {
  const currentIdx = FLOW.indexOf(o.status);
  const isCancelled = o.status === 'cancelled';
  const cleanPhone = o.phone ? o.phone.replace(/^0/, '') : '';
  const waUrl = `https://wa.me/20${cleanPhone}?text=${encodeURIComponent(`مرحباً أ/ ${o.customer}، بخصوص طلبك رقم ${o.order_number} من ${STORE_NAME}:`)}`;

  return `
    <div class="panel" style="margin-bottom:0">
      <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;margin-bottom:12px;border-bottom:1px solid var(--border);padding-bottom:10px">
        <div>
          <span style="font-size:16px;font-weight:900;color:var(--navy)">${o.order_number}</span>
          <span style="color:var(--muted);font-size:12px;margin-right:8px">${new Date(o.created_at).toLocaleString('ar-EG')}</span>
        </div>
        <span class="status-badge ${STATUSES[o.status]?.cls || ''}">${STATUSES[o.status]?.label || o.status}</span>
        <strong style="font-size:16px;color:var(--orange)">${fmt(o.total)}</strong>
      </div>

      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:10px;font-size:13px;margin-bottom:12px">
        <div> العميل: <b>${o.customer}</b></div>
        <div> الهاتف: <b>${o.phone}</b> (احتياطي: ${o.backup_phone || '—'})</div>
        <div>📍 الاستلام: <b>${o.location}</b></div>
        <div> الموعد: <b>${o.slot}</b></div>
      </div>

      <div style="background:var(--gray);border-radius:8px;padding:10px;font-size:13px;margin-bottom:12px">
        <b>الأصناف المطلوبة:</b>
        <ul style="margin:6px 0 0;padding-inline-start:20px">
          ${o.items.map(it => `<li>${it.name} × ${it.qty} = ${fmt(it.price * it.qty)}</li>`).join('')}
        </ul>
        ${o.notes && o.notes !== '—' ? `<div style="margin-top:6px;color:#b45309">ملاحظات العميل: ${o.notes}</div>` : ''}
      </div>

      ${!isCancelled ? `
        <div style="font-weight:700;font-size:12px;margin-bottom:8px">تحديث حالة الطلب:</div>
        <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:12px">
          ${FLOW.map((s, i) => `
            <button class="btn" style="padding:6px 12px;font-size:12px;background:${i === currentIdx ? 'var(--orange)' : i < currentIdx ? 'var(--navy)' : 'var(--gray)'};color:${i <= currentIdx ? '#fff' : 'var(--ink)'}"
              onclick="updateOrderStatus(${o.id}, '${s}')">
              ${i + 1}. ${STATUSES[s].label}
            </button>`).join('')}
        </div>` : '<div style="color:#dc2626;font-weight:700;margin-bottom:12px">تم إلغاء هذا الطلب</div>'}

      <div style="display:flex;gap:8px;justify-content:flex-end;border-top:1px solid var(--border);padding-top:10px">
        <a class="btn" style="background:#25D366;color:#fff;font-size:12px;padding:6px 14px" href="${waUrl}" target="_blank" rel="noopener">
          ${icon('wa')} محادثة العميل
        </a>
        ${!isCancelled && o.status !== 'received' ? `
          <button class="btn" style="background:#fee2e2;color:#dc2626;font-size:12px;padding:6px 14px" onclick="cancelOrderAdmin(${o.id})">
            إلغاء الطلب ❌
          </button>` : ''}
      </div>
    </div>
  `;
}

async function updateOrderStatus(id, newStatus) {
  const { error } = await supabaseClient.from('orders').update({ status: newStatus }).eq('id', id);
  if (error) { toast('خطأ: ' + error.message); return; }
  toast('تم تحديث حالة الطلب بنجاح');
  adminOrders();
  updateAdminBadges();
}

async function cancelOrderAdmin(id) {
  if (!confirm('هل تريد إلغاء هذا الطلب بالتأكيد؟')) return;
  await updateOrderStatus(id, 'cancelled');
}

// 8.4 إدارة منتجات المتجر
async function adminProducts() {
  const products = await fetchProducts();

  document.getElementById('adminContent').innerHTML = `
    <div class="panel">
      <h3>
        <span>منتجات المتجر (${products.length})</span>
        <button class="btn btn-primary" style="padding:6px 14px;font-size:13px" onclick="openProductModal()">+ إضافة منتج جديد</button>
      </h3>
    </div>

    <div class="panel">
      <div style="display:grid;gap:10px">
        ${!products.length ? '<p style="color:var(--muted);text-align:center">لا توجد منتجات مسجلة</p>' : products.map(p => `
          <div style="display:flex;align-items:center;justify-content:space-between;padding:12px;background:var(--gray);border-radius:10px;gap:10px;flex-wrap:wrap">
            <div style="display:flex;align-items:center;gap:12px">
              <img src="${p.img || ''}" alt="" style="width:48px;height:48px;border-radius:8px;object-fit:cover" onerror="this.style.display='none'">
              <div>
                <b style="color:var(--ink)">${p.name}</b>
                <div style="font-size:12px;color:var(--muted)">القسم: ${p.cat || 'عام'} | المخزون: ${p.stock}</div>
              </div>
            </div>
            <div style="font-weight:900;color:var(--orange)">${fmt(p.price)}</div>
            <div style="display:flex;gap:6px">
              <button class="btn" style="background:var(--blue);color:#fff;padding:6px 12px;font-size:12px" onclick="openProductModal(${p.id})">تعديل</button>
              <button class="btn" style="background:#fee2e2;color:#dc2626;padding:6px 12px;font-size:12px" onclick="deleteProductAdmin(${p.id})">حذف</button>
            </div>
          </div>`).join('')}
      </div>
    </div>
  `;
}

async function openProductModal(id = null) {
  let p = null;
  if (id) {
    const list = await fetchProducts();
    p = list.find(x => x.id === id);
  }

  const modal = document.getElementById('modalBg');
  const content = document.getElementById('modalContent');

  content.innerHTML = `
    <h3 style="margin-top:0">${p ? 'تعديل المنتج ' : 'إضافة منتج جديد للمتجر '}</h3>
    <form onsubmit="handleSaveProduct(event, ${p ? p.id : 'null'})">
      <label>اسم المنتج *</label>
      <input name="name" value="${p?.name || ''}" required style="margin-bottom:10px">

      <label>القسم</label>
      <select name="cat" style="margin-bottom:10px">
        ${CATEGORIES.map(c => `<option value="${c.name}" ${p?.cat === c.name ? 'selected' : ''}>${c.name}</option>`).join('')}
        <option value="عام" ${p?.cat === 'عام' ? 'selected' : ''}>عام</option>
      </select>

      <label>سعر البيع (EGP) *</label>
      <input name="price" type="number" step="0.5" value="${p?.price || ''}" required style="margin-bottom:10px">

      <label>السعر قبل الخصم (اختياري)</label>
      <input name="old_price" type="number" step="0.5" value="${p?.old_price || ''}" style="margin-bottom:10px">

      <label>الكمية المتاحة في المتجر *</label>
      <input name="stock" type="number" value="${p?.stock ?? 10}" required style="margin-bottom:10px">

      <label>رابط الصورة (Image URL)</label>
      <input name="img" value="${p?.img || ''}" placeholder="https://images.unsplash.com/..." style="margin-bottom:16px">

      <div style="display:flex;justify-content:flex-end;gap:8px">
        <button type="button" class="btn" style="background:var(--gray);color:var(--ink)" onclick="document.getElementById('modalBg').classList.remove('open')">إلغاء</button>
        <button type="submit" class="btn btn-primary">${p ? 'حفظ التعديلات' : 'إضافة المنتج'}</button>
      </div>
    </form>
  `;
  modal.classList.add('open');
}

async function handleSaveProduct(e, id) {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(e.target).entries());
  const payload = {
    name: data.name.trim(),
    cat: data.cat,
    price: parseFloat(data.price),
    old_price: data.old_price ? parseFloat(data.old_price) : null,
    stock: parseInt(data.stock, 10),
    img: data.img.trim() || 'https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=300&q=75'
  };

  let error;
  if (id) {
    const res = await supabaseClient.from('products').update(payload).eq('id', id);
    error = res.error;
  } else {
    const res = await supabaseClient.from('products').insert([payload]);
    error = res.error;
  }

  if (error) { toast('خطأ: ' + error.message); return; }
  toast('تم حفظ المنتج بنجاح');
  document.getElementById('modalBg').classList.remove('open');
  adminProducts();
  updateAdminBadges();
}

async function deleteProductAdmin(id) {
  if (!confirm('هل تريد حذف هذا المنتج نهائياً من المتجر؟')) return;
  const { error } = await supabaseClient.from('products').delete().eq('id', id);
  if (error) { toast('خطأ: ' + error.message); return; }
  toast('تم حذف المنتج');
  adminProducts();
  updateAdminBadges();
}

// 8.5 إدارة المخزون (Inventory Management)
async function adminInventory() {
  const inv = await fetchInventory();

  document.getElementById('adminContent').innerHTML = `
    <div class="panel">
      <h3>
        <span>سجل المخزون الداخلي والتكاليف  (${inv.length} صنف)</span>
        <button class="btn btn-primary" style="padding:6px 14px;font-size:13px" onclick="openInventoryModal()">+ إضافة صنف للمخزون</button>
      </h3>
    </div>

    <div class="panel">
      <div class="data-table-wrap">
        <table class="data-table">
          <thead>
            <tr>
              <th>اسم الصنف</th>
              <th>سعر الجملة (Cost)</th>
              <th>سعر البيع (Sell)</th>
              <th>الكمية المتاحة (Stock)</th>
              <th>الربح للقطعة</th>
              <th>إجراءات</th>
            </tr>
          </thead>
          <tbody>
            ${!inv.length ? '<tr><td colspan="6" style="text-align:center;color:var(--muted)">المخزون فارغ</td></tr>' : inv.map(item => `
              <tr>
                <td><b>${item.name}</b></td>
                <td>${fmt(item.cost_price)}</td>
                <td>${fmt(item.sell_price)}</td>
                <td><b style="color:${item.stock < 5 ? '#dc2626' : 'var(--navy)'}">${item.stock}</b></td>
                <td style="color:#16a34a;font-weight:700">${fmt(item.sell_price - item.cost_price)}</td>
                <td>
                  <button class="btn" style="background:var(--blue);color:#fff;padding:4px 8px;font-size:11px" onclick="openInventoryModal(${item.id})">تعديل</button>
                  <button class="btn" style="background:#fee2e2;color:#dc2626;padding:4px 8px;font-size:11px" onclick="deleteInventoryItem(${item.id})">حذف</button>
                </td>
              </tr>`).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

async function openInventoryModal(id = null) {
  let item = null;
  if (id) {
    const list = await fetchInventory();
    item = list.find(x => x.id === id);
  }

  const modal = document.getElementById('modalBg');
  const content = document.getElementById('modalContent');

  content.innerHTML = `
    <h3 style="margin-top:0">${item ? 'تعديل صنف المخزون ' : 'إضافة صنف جديد للمخزون '}</h3>
    <form onsubmit="handleSaveInventory(event, ${item ? item.id : 'null'})">
      <label>اسم الصنف *</label>
      <input name="name" value="${item?.name || ''}" required style="margin-bottom:10px">

      <label>سعر التكلفة / الجملة (EGP) *</label>
      <input name="cost_price" type="number" step="0.5" value="${item?.cost_price || ''}" required style="margin-bottom:10px">

      <label>سعر البيع للكاشير (EGP) *</label>
      <input name="sell_price" type="number" step="0.5" value="${item?.sell_price || ''}" required style="margin-bottom:10px">

      <label>الكمية المتوفرة بالمخزن *</label>
      <input name="stock" type="number" value="${item?.stock ?? 50}" required style="margin-bottom:16px">

      <div style="display:flex;justify-content:flex-end;gap:8px">
        <button type="button" class="btn" style="background:var(--gray);color:var(--ink)" onclick="document.getElementById('modalBg').classList.remove('open')">إلغاء</button>
        <button type="submit" class="btn btn-primary">${item ? 'حفظ التعديل' : 'إضافة للمخزون'}</button>
      </div>
    </form>
  `;
  modal.classList.add('open');
}

async function handleSaveInventory(e, id) {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(e.target).entries());
  const payload = {
    name: data.name.trim(),
    cost_price: parseFloat(data.cost_price),
    sell_price: parseFloat(data.sell_price),
    stock: parseInt(data.stock, 10)
  };

  let res;
  if (id) {
    res = await supabaseClient.from('inventory').update(payload).eq('id', id);
  } else {
    res = await supabaseClient.from('inventory').insert([payload]);
  }

  if (res.error) { toast('خطأ: ' + res.error.message); return; }
  toast('تم حفظ بيانات المخزون');
  document.getElementById('modalBg').classList.remove('open');
  adminInventory();
}

async function deleteInventoryItem(id) {
  if (!confirm('حذف هذا الصنف من المخزون؟')) return;
  const { error } = await supabaseClient.from('inventory').delete().eq('id', id);
  if (error) { toast('خطأ: ' + error.message); return; }
  toast('تم الحذف');
  adminInventory();
}

// 8.6 التقارير المالية والأرباح (Financial Reports)
let REPORT_FILTER = 'all';

async function adminReports() {
  const posOrders = await fetchPosOrders();
  const onlineOrders = await fetchOrders();

  let filteredPos = posOrders;
  const now = new Date();

  if (REPORT_FILTER === 'today') {
    filteredPos = posOrders.filter(o => new Date(o.created_at).toDateString() === now.toDateString());
  } else if (REPORT_FILTER === 'week') {
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    filteredPos = posOrders.filter(o => new Date(o.created_at) >= oneWeekAgo);
  } else if (REPORT_FILTER === 'month') {
    filteredPos = posOrders.filter(o => {
      const d = new Date(o.created_at);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });
  }

  const totalPosSales = filteredPos.reduce((s, x) => s + Number(x.total), 0);
  const totalPosProfit = filteredPos.reduce((s, x) => s + Number(x.profit), 0);
  const totalOnline = onlineOrders.filter(o => o.status !== 'cancelled').reduce((s, x) => s + Number(x.total), 0);

  document.getElementById('adminContent').innerHTML = `
    <div class="panel">
      <h3>
        <span>التقارير المالية والأرباح </span>
        <select onchange="REPORT_FILTER=this.value; adminReports()" 
          style="padding:8px 12px;border:1px solid var(--border);border-radius:10px;background:var(--white);color:var(--ink)">
          <option value="all" ${REPORT_FILTER === 'all' ? 'selected' : ''}>كل الفترات</option>
          <option value="today" ${REPORT_FILTER === 'today' ? 'selected' : ''}>اليوم فقط</option>
          <option value="week" ${REPORT_FILTER === 'week' ? 'selected' : ''}>آخر 7 أيام</option>
          <option value="month" ${REPORT_FILTER === 'month' ? 'selected' : ''}>هذا الشهر</option>
        </select>
      </h3>
    </div>

    <div class="stats">
      <div class="stat stat--green">
        <div class="stat__icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg></div>
        <div>
          <div class="stat__num" style="color:#16a34a">${fmt(totalPosProfit)}</div>
          <div class="stat__label">صافي أرباح الكاشير (Profit)</div>
        </div>
      </div>
      <div class="stat stat--orange">
        <div class="stat__icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="4" width="20" height="16" rx="2"/></svg></div>
        <div>
          <div class="stat__num">${fmt(totalPosSales)}</div>
          <div class="stat__label">مبيعات الكاشير المحددة</div>
        </div>
      </div>
      <div class="stat stat--blue">
        <div class="stat__icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg></div>
        <div>
          <div class="stat__num">${fmt(totalOnline)}</div>
          <div class="stat__label">مبيعات الأونلاين المؤكدة</div>
        </div>
      </div>
    </div>

    <div class="panel">
      <h3>سجل فواتير الكاشير الأخيرة </h3>
      <div class="data-table-wrap">
        <table class="data-table">
          <thead>
            <tr>
              <th>كود الفاتورة</th>
              <th>التاريخ والوقت</th>
              <th>عدد الأصناف</th>
              <th>إجمالي الفاتورة</th>
              <th>الربح المحقق</th>
            </tr>
          </thead>
          <tbody>
            ${!filteredPos.length ? '<tr><td colspan="5" style="text-align:center;color:var(--muted)">لا توجد مبيعات في هذه الفترة</td></tr>' : filteredPos.map(inv => `
              <tr>
                <td><b>${inv.invoice_code}</b></td>
                <td>${new Date(inv.created_at).toLocaleString('ar-EG')}</td>
                <td>${inv.items.length} أصناف</td>
                <td style="font-weight:900;color:var(--orange)">${fmt(inv.total)}</td>
                <td style="font-weight:900;color:#16a34a">+${fmt(inv.profit)}</td>
              </tr>`).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

// ============================================================
// 9. تشغيل التطبيق التلقائي عند التحميل (Auto-Init)
// ============================================================
window.addEventListener('DOMContentLoaded', () => {
  updateBadge();
  go('home'); // عرض فوري للصفحة الرئيسية دون أي تأخير
  checkAuth(); // فحص تسجيل الدخول في الخلفية
});
