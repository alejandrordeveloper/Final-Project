// document.addEventListener("DOMContentLoaded", () => {
//   const menuButton = document.getElementById("menuButton");
//   const mobileMenu = document.getElementById("mobileMenu");

//   // Siempre inicia cerrado
//   mobileMenu.classList.add('hidden');
//   menuButton.setAttribute('aria-expanded', 'false');

//   // Abrir/cerrar menú
//   function toggleMenu(open) {
//     if (open) {
//       mobileMenu.classList.remove('hidden');
//       mobileMenu.classList.add('flex');
//       menuButton.setAttribute('aria-expanded', 'true');
//       document.documentElement.style.overflow = 'hidden';
//     } else {
//       mobileMenu.classList.remove('flex');
//       mobileMenu.classList.add('hidden');
//       menuButton.setAttribute('aria-expanded', 'false');
//       document.documentElement.style.overflow = '';
//     }
//   }

//   // Click en botón hamburguesa
//   menuButton.addEventListener('click', (e) => {
//     e.stopPropagation();
//     const isOpen = menuButton.getAttribute('aria-expanded') === 'true';
//     toggleMenu(!isOpen);
//   });

//   // Cerrar al hacer clic fuera del menú
//   document.addEventListener('click', (e) => {
//     const isClickInsideMenu = mobileMenu.contains(e.target);
//     const isClickOnButton = menuButton.contains(e.target);
//     const isOpen = menuButton.getAttribute('aria-expanded') === 'true';
//     if (!isClickInsideMenu && !isClickOnButton && isOpen) {
//       toggleMenu(false);
//     }
//   });

//   // Cerrar con Escape
//   document.addEventListener('keydown', (e) => {
//     if (e.key === 'Escape') {
//       toggleMenu(false);
//     }
//   });
// });

