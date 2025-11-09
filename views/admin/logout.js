// const logoutRouter = require('express').Router();


// logoutRouter.get('/', async (req, res) => {
//     const cookies = req.cookies;
//     if (!cookies?.accessToken) {
//         return res.status(401).send(); 
//     }

//     const accessToken = cookies.accessToken;

//     res.clearCookie('accessToken', {
//         httpOnly: true,
//         secure: process.env.NODE_ENV === 'production',
//         sameSite: 'Strict',
//     });

//     return res.status(200).json({ message: 'Cierre de sesión exitoso' });
// });

// module.exports = logoutRouter;

// Logout button handler
async function setupLogout(){
  const btn = document.getElementById('logoutBtn');
  if(!btn) return;
  btn.addEventListener('click', async ()=>{
    try{
      const res = await fetch('/api/auth/logout', { method: 'POST', credentials: 'same-origin' });
      if(res.ok){
        // redirect to login page
        window.location.href = '/login';
      } else {
        console.warn('Logout failed', res.status);
        alert('No se pudo cerrar sesión');
      }
    }catch(err){
      console.error('Logout error', err);
      alert('Error al cerrar sesión');
    }
  });
}

setupLogout();




