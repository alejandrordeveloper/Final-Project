(function(){
  // Parse session_id from query string
  const params = new URLSearchParams(window.location.search);
  const sessionId = params.get('session_id');

  const elItems = document.getElementById('items-list');
  const elTotal = document.getElementById('total-amount');
  const elOrder = document.getElementById('order-id');
  const elEmail = document.getElementById('customer-email');

  function showError(msg){
    if(elItems) elItems.innerHTML = `<li style="color:#c00">${msg}</li>`;
    if(elTotal) elTotal.textContent = '-';
    if(elOrder) elOrder.textContent = '-';
    if(elEmail) elEmail.textContent = '-';
  }

  if(!sessionId){
    showError('No se encontró session_id en la URL.');
    console.warn('No session_id');
    return;
  }

  fetch(`/api/checkoutsuccess?session_id=${encodeURIComponent(sessionId)}`)
    .then(res => {
      if(!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    })
    .then(data => {
      if(data.error){
        showError(data.error);
        return;
      }

      const items = Array.isArray(data.items) ? data.items : [];
      if(items.length === 0){
        elItems.innerHTML = '<li>Pedido vacío</li>';
      } else {
        elItems.innerHTML = items.map(it => {
          const price = (Number(it.amount_total || 0) / 100).toFixed(2);
          return `<li>${escapeHtml(it.description || 'Artículo') } — $${price} × ${escapeHtml(String(it.quantity || 1))}</li>`;
        }).join('');
      }

      elTotal.textContent = `$${((Number(data.totalAmount||0)/100).toFixed(2))}`;
      elOrder.textContent = data.session_id || '-';
      elEmail.textContent = data.customer_email || '-';
    })
    .catch(err => {
      console.error('Fetch error:', err);
      showError('No se pudieron obtener los detalles del pedido.');
    });

  // small helper to avoid XSS when injecting text
  function escapeHtml(str){
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

})();
