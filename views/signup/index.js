
// Validation and signup handling for the signup page
// Regex
const reEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const reName = /^[A-Za-zÀ-ÿ\u00f1\u00d1 ]{8,16}$/;
const rePassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).{8,16}$/;

function debounce(fn, delay = 250) {
	let t;
	return function (...args) {
		clearTimeout(t);
		t = setTimeout(() => fn.apply(this, args), delay);
	};
}

function setValid(el, errEl, message = '') {
	el.classList.remove('invalid');
	el.classList.add('valid');
	el.setAttribute('aria-invalid', 'false');
	if (errEl) { errEl.textContent = ''; errEl.classList.remove('active'); }
}
function setInvalid(el, errEl, message = '') {
	el.classList.remove('valid');
	el.classList.add('invalid');
	el.setAttribute('aria-invalid', 'true');
	if (errEl) { errEl.textContent = message; errEl.classList.add('active'); }
}

function validateEmail(el, errEl) {
	const v = el.value.trim();
	if (!v) { setInvalid(el, errEl, 'El email es obligatorio.'); return false; }
	if (!reEmail.test(v)) { setInvalid(el, errEl, 'Introduce un email válido.'); return false; }
	setValid(el, errEl); return true;
}

function validateName(el, errEl) {
	const v = el.value.trim();
	if (!v) { setInvalid(el, errEl, 'El nombre es obligatorio.'); return false; }
	if (!reName.test(v)) { setInvalid(el, errEl, 'Nombre no válido (solo letras y espacios).'); return false; }
	setValid(el, errEl); return true;
}

function validatePassword(el, errEl) {
	const v = el.value;
	if (!v) { setInvalid(el, errEl, 'La contraseña es obligatoria.'); return false; }
	if (!rePassword.test(v)) {
		setInvalid(el, errEl, 'La contraseña debe tener al menos 8 caracteres, mayúscula, minúscula, número y símbolo.');
		return false;
	}
	setValid(el, errEl); return true;
}

function validateConfirm(passEl, confEl, errEl) {
	const p = passEl.value;
	const c = confEl.value;
	if (!c) { setInvalid(confEl, errEl, 'Confirma la contraseña.'); return false; }
	if (p !== c) { setInvalid(confEl, errEl, 'Las contraseñas no coinciden.'); return false; }
	setValid(confEl, errEl); return true;
}

function formValidSignUp() {
	const name = document.getElementById('signup-name');
	const email = document.getElementById('signup-email');
	const password = document.getElementById('signup-password');
	const confirm = document.getElementById('signup-confirm');
	const ok1 = validateName(name, document.getElementById('signup-name-error'));
	const ok2 = validateEmail(email, document.getElementById('signup-email-error'));
	const ok3 = validatePassword(password, document.getElementById('signup-password-error'));
	const ok4 = validateConfirm(password, confirm, document.getElementById('signup-confirm-error'));
	return ok1 && ok2 && ok3 && ok4;
}

function attachValidation() {
	const signupName = document.getElementById('signup-name');
	const signupEmail = document.getElementById('signup-email');
	const signupPass = document.getElementById('signup-password');
	const signupConfirm = document.getElementById('signup-confirm');
	const signupSubmit = document.getElementById('signup-submit');

	if (signupName) {
		signupName.addEventListener('input', debounce(() => {
			validateName(signupName, document.getElementById('signup-name-error'));
			signupSubmit.disabled = !formValidSignUp();
		}));
	}
	if (signupEmail) {
		signupEmail.addEventListener('input', debounce(() => {
			validateEmail(signupEmail, document.getElementById('signup-email-error'));
			signupSubmit.disabled = !formValidSignUp();
		}));
	}
	if (signupPass) {
		signupPass.addEventListener('input', debounce(() => {
			validatePassword(signupPass, document.getElementById('signup-password-error'));
			signupSubmit.disabled = !formValidSignUp();
		}));
	}
	if (signupConfirm) {
		signupConfirm.addEventListener('input', debounce(() => {
			validateConfirm(signupPass, signupConfirm, document.getElementById('signup-confirm-error'));
			signupSubmit.disabled = !formValidSignUp();
		}));
	}
}

document.addEventListener('DOMContentLoaded', () => {
	attachValidation();
	const signupSubmit = document.getElementById('signup-submit');
	if (signupSubmit) {
		signupSubmit.addEventListener('click', async (e) => {
			e.preventDefault();
			if (!formValidSignUp()) return;
			const name = document.getElementById('signup-name').value.trim();
			const email = document.getElementById('signup-email').value.trim();
			const password = document.getElementById('signup-password').value;
			try {
				const res = await fetch('/api/auth/register', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ name, email, password })
				});
				if (res.ok) {
					const json = await res.json().catch(()=>({ redirect: '/' }));
					window.location.href = json.redirect || '/';
				} else {
					const json = await res.json().catch(()=>({ error: 'Error' }));
					alert(json.error || 'Error al registrarse');
				}
			} catch (err) {
				console.error(err);
				alert('Error al registrarse');
			}
		});
	}
});

