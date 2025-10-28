
// Home cart: render cart from localStorage, allow qty changes/removal, send items to checkout
function getCart(){
	try{ return JSON.parse(localStorage.getItem('cart') || '{}'); }catch(e){ return {}; }
}
function saveCart(cart){ localStorage.setItem('cart', JSON.stringify(cart)); }

function formatCurrencyFromCents(c){
	if(typeof c !== 'number') return '$0.00';
	return '$' + (c/100).toFixed(2);
}

async function fetchProductsMap(){
	try{
		const res = await fetch('/api/admin/products');
		if(!res.ok) throw new Error('no products');
		const list = await res.json();
		const map = {};
		list.forEach(p => { map[String(p._id)] = p; });
		return map;
	}catch(e){ return {}; }
}

async function renderCart(){
	const container = document.getElementById('cartItems');
	const empty = document.getElementById('cartEmpty');
	const summary = document.getElementById('cartSummary');
	const subtotalEl = document.getElementById('subtotal');
	const shippingEl = document.getElementById('shipping');
	const totalEl = document.getElementById('total');

	const cart = getCart();
	const items = Object.values(cart || {});

	if(!items || items.length === 0){
		container.innerHTML = '';
		empty.classList.remove('hidden');
		summary.classList.add('hidden');
		return;
	}

	empty.classList.add('hidden');
	summary.classList.remove('hidden');

	// try to fetch latest product info (images, stock, price) by id
	const productsMap = await fetchProductsMap();

	container.innerHTML = '';
	let subtotal = 0;

	items.forEach(it => {
		// cart stores { id, name, qty, price }
		const id = String(it.id || it.id);
		const prod = productsMap[id];
		const name = prod ? prod.name : it.name;
		const image = prod && prod.image ? prod.image : (it.image || '/assests/package.png');
		const price = (prod && typeof prod.price === 'number') ? prod.price : (typeof it.price === 'number' ? it.price : 0);
		const qty = parseInt(it.qty || 0, 10);
		const stock = prod && typeof prod.stock === 'number' ? prod.stock : undefined;

		const lineTotal = price * qty;
		subtotal += lineTotal;

		const itemDiv = document.createElement('div');
		itemDiv.className = 'flex items-center gap-4 bg-[#552c07] text-white p-4 rounded-lg shadow-md';
		itemDiv.innerHTML = `
			<img src="${image}" alt="${name}" style="max-width: 8rem; max-height: 8rem;" class="rounded-md object-contain" onerror="setPlaceholder(this,'Imagen no disponible')" />
			<div class="flex-1">
				<h3 class="text-[#39FF14] font-bold text-base mb-1">${escapeHtml(name)}</h3>
				<p class="text-sm">${escapeHtml(prod && prod.description ? prod.description : it.name || '')}</p>
				<div class="mt-2 text-sm">Precio: <strong>${formatCurrencyFromCents(price)}</strong></div>
				<div class="mt-2 text-sm">Subtotal: <strong>${formatCurrencyFromCents(lineTotal)}</strong></div>
			</div>
			<div class="flex flex-col items-end gap-2">
				<div class="flex items-center gap-2">
					<button class="decrease px-2 py-1 bg-white text-black rounded">-</button>
					<div class="px-3 py-1 bg-white text-black rounded">${qty}</div>
					<button class="increase px-2 py-1 bg-white text-black rounded">+</button>
				</div>
				<button class="remove text-sm underline">Eliminar</button>
				<div class="text-sm mt-1">${(typeof stock==='number') ? ('Stock: ' + stock) : ''}</div>
			</div>
		`;

		// attach handlers
		const dec = itemDiv.querySelector('.decrease');
		const inc = itemDiv.querySelector('.increase');
		const rem = itemDiv.querySelector('.remove');

		dec.addEventListener('click', ()=>{ updateQty(id, -1); });
		inc.addEventListener('click', ()=>{ updateQty(id, +1); });
		rem.addEventListener('click', ()=>{ removeItem(id); });

		container.appendChild(itemDiv);
	});

	// shipping simple: free over some amount (example)
	const shippingCents = subtotal >= 5000 ? 0 : 500; // €5.00 below €50
	subtotalEl.textContent = formatCurrencyFromCents(subtotal);
	shippingEl.textContent = formatCurrencyFromCents(shippingCents);
	totalEl.textContent = formatCurrencyFromCents(subtotal + shippingCents);
}

function escapeHtml(str){
	if(!str && str !== 0) return '';
	return String(str)
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#39;');
}

function updateQty(id, delta){
	const cart = getCart();
	const entry = cart[id];
	if(!entry) return;
	const newQty = Math.max(0, (entry.qty || 0) + delta);
	if(newQty === 0){
		delete cart[id];
	} else {
		cart[id].qty = newQty;
	}
	saveCart(cart);
	renderCart();
}

function removeItem(id){
	const cart = getCart();
	if(cart[id]) delete cart[id];
	saveCart(cart);
	renderCart();
}

document.getElementById('payButton').addEventListener('click', async function(){
	const cart = getCart();
	const items = Object.values(cart || {}).map(i => ({
		id: i.id,
		name: i.name,
		unit_amount: i.price, // cents
		quantity: i.qty
	}));

	if(items.length === 0){
		alert('Tu carrito está vacío');
		return;
	}

	try{
		const res = await axios.post('/api/checkout', { items });
		if(res && res.data && res.data.url){
			window.location.href = res.data.url;
		} else {
			alert('No se pudo crear la sesión de pago');
		}
	}catch(err){
		console.error(err);
		alert('Error al iniciar pago');
	}
});

// initial render
renderCart();