const apiBase = '/api/admin/products';

async function fetchProducts() {
  const res = await fetch(apiBase);
  return res.json();
}

function escapeHtml(str){
  if(!str && str !== 0) return '';
  return String(str).replace(/[&<>"']/g, function(s){
    return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;"})[s];
  });
}

function dollarsToCents(d) { return Math.round(parseFloat(d || 0) * 100); }
function centsToDollars(c){ return (c/100).toFixed(2); }

async function render() {
  const list = document.getElementById('list');
  list.innerHTML = '<p class="text-sm text-gray-600">Loading...</p>';
  const products = await fetchProducts();
  if(!products || products.length===0){ list.innerHTML = '<p class="text-sm text-gray-600">No products yet</p>'; return }

  list.innerHTML = products.map(p => `
    <div class="bg-white p-4 rounded shadow flex items-center justify-between product-item" data-id="${p._id}">
      <div>
        <div class="font-semibold">${p.name}</div>
        <div class="text-sm text-gray-600">${p.description || ''}</div>
        <div class="text-sm text-gray-800 mt-1">$${centsToDollars(p.price)} • Stock: ${p.stock}</div>
      </div>
      <div class="flex gap-2">
        <button class="px-3 py-1 rounded bg-[#39FF14] text-black" data-action="inc" data-id="${p._id}">+ Stock</button>
        <button class="px-3 py-1 rounded bg-yellow-300 text-black" data-action="dec" data-id="${p._id}">- Stock</button>
        <button class="px-3 py-1 rounded bg-blue-500 text-white" data-action="edit" data-id="${p._id}">Edit</button>
        <button class="px-3 py-1 rounded bg-red-500 text-white" data-action="del" data-id="${p._id}">Delete</button>
      </div>
    </div>
  `).join('');

  // attach handlers
  list.querySelectorAll('button').forEach(btn => {
    btn.addEventListener('click', async (e)=>{
      const id = btn.dataset.id;
      const action = btn.dataset.action;
      if(action==='del'){
        if(!confirm('Delete product?')) return;
        await fetch(`${apiBase}/${id}`, { method: 'DELETE' });
      } else if(action==='inc' || action==='dec'){
        const p = (await fetch(`${apiBase}`).then(r=>r.json())).find(x=>x._id===id);
        if(!p) return;
        const newStock = Math.max(0, p.stock + (action==='inc'?1:-1));
        await fetch(`${apiBase}/${id}`, { method: 'PUT', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ stock: newStock })});
      }
      else if(action==='edit'){
        // open inline edit form
        const prodEl = btn.closest('.product-item');
        if(!prodEl) return;
  // fetch latest product from list
  const p = (await fetchProducts()).find(x=>x._id===id);
        // build form HTML
        const formHtml = `
          <div class="w-full">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input class="border rounded px-2 py-1" id="edit-name-${id}" value="${escapeHtml(p.name)}" />
              <input class="border rounded px-2 py-1" id="edit-price-${id}" value="${centsToDollars(p.price)}" />
              <input class="border rounded px-2 py-1" id="edit-stock-${id}" value="${p.stock}" />
              <input class="border rounded px-2 py-1" id="edit-image-${id}" value="${p.image||''}" />
              <textarea class="border rounded px-2 py-1 sm:col-span-2" id="edit-desc-${id}">${p.description||''}</textarea>
            </div>
            <div class="mt-2 flex gap-2 justify-end">
              <button id="save-${id}" class="px-3 py-1 bg-green-600 text-white rounded">Save</button>
              <button id="cancel-${id}" class="px-3 py-1 bg-gray-300 rounded">Cancel</button>
            </div>
          </div>
        `;
        // replace contents of prodEl with form
        prodEl.innerHTML = formHtml;

        // attach handlers
        document.getElementById(`save-${id}`).addEventListener('click', async ()=>{
          const name = document.getElementById(`edit-name-${id}`).value.trim();
          const price = dollarsToCents(document.getElementById(`edit-price-${id}`).value);
          const stock = parseInt(document.getElementById(`edit-stock-${id}`).value,10)||0;
          const image = document.getElementById(`edit-image-${id}`).value.trim();
          const description = document.getElementById(`edit-desc-${id}`).value.trim();
          const body = { name, price, stock, image, description };
          await fetch(`${apiBase}/${id}`, { method: 'PUT', headers: {'Content-Type':'application/json'}, body: JSON.stringify(body) });
          render();
        });
        document.getElementById(`cancel-${id}`).addEventListener('click', ()=>{ render(); });
        return;
      }
      render();
    })
  })
}

// create new
document.getElementById('productForm').addEventListener('submit', async (e)=>{
  e.preventDefault();
  const name = document.getElementById('name').value.trim();
  const price = dollarsToCents(document.getElementById('price').value);
  const stock = parseInt(document.getElementById('stock').value,10)||0;
  const description = document.getElementById('description').value.trim();
  const image = document.getElementById('image') ? document.getElementById('image').value.trim() : undefined;
  const body = { name, price, stock, description, image };
  await fetch(apiBase, { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(body)});
  document.getElementById('productForm').reset();
  render();
});

// initial
render();
