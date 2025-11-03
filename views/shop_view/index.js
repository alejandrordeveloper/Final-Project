// Client-side product renderer: fetches products from the admin API and renders the same grid template
const grid = document.querySelector('#products .grid');

function escapeHtml(str){
  if(!str && str !== 0) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function centsToPrice(c){
  if(typeof c !== 'number') return '';
  return '$' + (c/100).toFixed(2);
}

async function loadProducts(){
  if(!grid){
    console.warn('No se encontró el contenedor de productos (#products .grid).');
    return;
  }

  grid.innerHTML = '<p class="text-sm text-gray-600">Cargando productos...</p>';

  try{
    const res = await fetch('/api/admin/products');
    if(!res.ok) throw new Error('Error al obtener productos');
    const products = await res.json();

    if(!products || products.length === 0){
      grid.innerHTML = '<p class="text-sm text-gray-600">No hay productos disponibles.</p>';
      return;
    }

    grid.innerHTML = '';
    products.forEach(p => {
      const card = document.createElement('article');
      card.className = 'text-center';
      const img = escapeHtml(p.image || '/assests/package.png');
      const name = escapeHtml(p.name || 'Sin nombre');
      const desc = escapeHtml(p.description || '');
      const price = centsToPrice(p.price || 0);
      const stock = typeof p.stock === 'number' ? p.stock : 0;

      card.innerHTML = `
        <div class="w-full bg-[#f3f3f3] rounded mb-3 flex items-center justify-center" style="height:220px;">
          <img src="${img}" alt="${name}" class="max-h-48 object-contain" onerror="setPlaceholder(this,'Producto')" />
        </div>
        <h4 class="text-sm text-gray-800">${name}</h4>
        <div class="text-sm text-gray-600 mt-1">${price}</div>
        <div class="text-sm text-gray-600 mt-1">${desc}</div>
        <div class="mt-3 flex items-center justify-center gap-3">
          <div class="text-sm text-gray-700">${stock > 0 ? 'Stock: ' + stock : '<span class="text-red-600 font-semibold">Agotado</span>'}</div>
          <button data-id="${escapeHtml(p._id)}" class="add-to-cart-btn inline-flex items-center px-3 py-1 rounded ${stock>0? 'bg-[#39FF14] text-black hover:brightness-90' : 'bg-gray-300 text-gray-600 cursor-not-allowed'}" ${stock>0? '': 'disabled'}>
            ${stock>0? 'Add to cart' : 'Agotado'}
          </button>
        </div>
      `;

      grid.appendChild(card);

      // attach add-to-cart handler for this card
      const btn = card.querySelector('.add-to-cart-btn');
      if(btn){
        btn.addEventListener('click', (e)=>{
          e.preventDefault();
          if(stock <= 0){
            // should not happen because button is disabled, but guard anyway
            return;
          }
          addToCart(p);
          // temporarily show feedback
          btn.textContent = 'Añadido ✓';
          btn.classList.remove('bg-[#39FF14]');
          btn.classList.add('bg-green-400');
          setTimeout(()=>{
            btn.textContent = 'Add to cart';
            btn.classList.remove('bg-green-400');
            btn.classList.add('bg-[#39FF14]');
          }, 1200);
        });
      }
    });

  }catch(err){
    console.error(err);
    grid.innerHTML = '<p class="text-sm text-red-600">Error cargando productos.</p>';
  }
}

// cargar al inicio
loadProducts();

// --- Simple local cart (stored in localStorage) ---
function getCart(){
  try{ return JSON.parse(localStorage.getItem('cart')||'{}'); }catch(e){ return {}; }
}
function saveCart(cart){ localStorage.setItem('cart', JSON.stringify(cart)); }
function addToCart(product){
  const cart = getCart();
  const id = String(product._id || product.name);
  const current = cart[id] || { id, name: product.name, qty: 0, price: product.price };
  // check stock (use product.stock if present)
  const available = typeof product.stock === 'number' ? product.stock : Infinity;
  if(current.qty + 1 > available){
    alert('No hay suficiente stock');
    return false;
  }
  current.qty = current.qty + 1;
  cart[id] = current;
  saveCart(cart);
  // dispatch event so other parts of the app can listen if needed
  window.dispatchEvent(new CustomEvent('cart:updated', { detail: { cart } }));
  return true;
}

//carrito 
function updateCartCount() {
  const cart = getCart();
  const totalItems = Object.values(cart).reduce((sum, item) => sum + item.qty, 0);
  const countEl = document.getElementById('cart-count');
  if (countEl) countEl.textContent = totalItems;
}

// Actualiza al cargar
updateCartCount();

// Escucha cambios en el carrito
window.addEventListener('cart:updated', updateCartCount);
