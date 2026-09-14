const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');
const resetForm = document.getElementById('resetForm');
const authMessage = document.getElementById('authMessage');
const showSignup = document.getElementById('showSignup');
const showReset = document.getElementById('showReset');
const cancelSignup = document.getElementById('cancelSignup');
const cancelReset = document.getElementById('cancelReset');
const googleSignIn = document.getElementById('googleSignIn');

function getAccounts() {
  const stored = localStorage.getItem('userAccounts');
  try {
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

function saveAccounts(accounts) {
  localStorage.setItem('userAccounts', JSON.stringify(accounts));
}

function normalizeEmail(email) {
  return email.trim().toLowerCase();
}

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function showMessage(message, type = 'info') {
  authMessage.textContent = message;
  authMessage.className = `status-message ${type}`;
  authMessage.classList.remove('hidden');
}

function hideMessage() {
  authMessage.classList.add('hidden');
}

function showForm(formType) {
  hideMessage();
  loginForm.classList.toggle('hidden', formType !== 'login');
  signupForm.classList.toggle('hidden', formType !== 'signup');
  resetForm.classList.toggle('hidden', formType !== 'reset');
}

function redirectToPage(role, name) {
  const encodedName = encodeURIComponent(name);
  if (role === 'profesor') {
    location.href = `profesor.html?name=${encodedName}`;
  } else {
    location.href = `alumno.html?name=${encodedName}`;
  }
}

function inferRoleFromEmail(email) {
  const domain = email.split('@')[1] || '';
  if (/profesor|teacher|docente|school|faculty/i.test(domain)) {
    return 'profesor';
  }
  if (/alumno|student|estudiante|campus/i.test(domain)) {
    return 'alumno';
  }
  return 'alumno';
}

loginForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const email = normalizeEmail(document.getElementById('loginEmail').value);
  const password = document.getElementById('loginPassword').value;

  if (!validateEmail(email)) {
    showMessage('Ingresa un correo válido.', 'error');
    return;
  }
  if (!password) {
    showMessage('Ingresa tu contraseña.', 'error');
    return;
  }

  const accounts = getAccounts();
  const account = accounts[email];
  if (!account) {
    showMessage('Correo no registrado. Crea una cuenta para continuar.', 'error');
    return;
  }
  if (account.password !== password) {
    showMessage('Contraseña incorrecta. Intenta de nuevo.', 'error');
    return;
  }

  showMessage('Inicio de sesión exitoso. Redirigiendo...', 'success');
  setTimeout(() => redirectToPage(account.role, account.name || email.split('@')[0]), 900);
});

signupForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const name = document.getElementById('signupName').value.trim();
  const email = normalizeEmail(document.getElementById('signupEmail').value);
  const password = document.getElementById('signupPassword').value;
  const confirm = document.getElementById('signupConfirm').value;
  const role = document.getElementById('signupRole').value;

  if (!name) {
    showMessage('Ingresa tu nombre completo.', 'error');
    return;
  }
  if (!validateEmail(email)) {
    showMessage('Ingresa un correo válido.', 'error');
    return;
  }
  if (password.length < 6) {
    showMessage('La contraseña debe tener al menos 6 caracteres.', 'error');
    return;
  }
  if (password !== confirm) {
    showMessage('Las contraseñas no coinciden.', 'error');
    return;
  }

  const accounts = getAccounts();
  if (accounts[email]) {
    showMessage('Este correo ya tiene una cuenta registrada.', 'error');
    return;
  }

  accounts[email] = { name, email, password, role };
  saveAccounts(accounts);
  showMessage('Cuenta creada con éxito. Ahora puedes iniciar sesión.', 'success');
  loginForm.querySelector('input[name="email"]').value = email;
  showForm('login');
});

resetForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const email = normalizeEmail(document.getElementById('resetEmail').value);

  if (!validateEmail(email)) {
    showMessage('Ingresa un correo válido.', 'error');
    return;
  }

  const accounts = getAccounts();
  if (!accounts[email]) {
    showMessage('No existe una cuenta con ese correo.', 'error');
    return;
  }

  showMessage(`Se envió un enlace de recuperación a ${email} (simulado).`, 'success');
  setTimeout(() => showForm('login'), 1600);
});

showSignup.addEventListener('click', () => showForm('signup'));
showReset.addEventListener('click', () => showForm('reset'));
cancelSignup.addEventListener('click', () => showForm('login'));
cancelReset.addEventListener('click', () => showForm('login'));

googleSignIn.addEventListener('click', () => {
  const email = normalizeEmail(prompt('Ingresa tu correo de Google:'));
  if (!email) {
    showMessage('Debes ingresar un correo para continuar.', 'error');
    return;
  }
  if (!validateEmail(email)) {
    showMessage('Ingresa un correo válido.', 'error');
    return;
  }

  const accounts = getAccounts();
  const account = accounts[email];
  if (account) {
    showMessage('Ingreso con Google simulado. Redirigiendo...', 'success');
    setTimeout(() => redirectToPage(account.role, account.name || email.split('@')[0]), 900);
    return;
  }

  const inferredRole = inferRoleFromEmail(email);
  const inferredName = email.split('@')[0].replace(/[._\d]+/g, ' ').trim();
  showMessage(`No hay cuenta registrada. Redirigiendo según el tipo de correo...`, 'info');
  setTimeout(() => redirectToPage(inferredRole, inferredName || email), 900);
});

showForm('login');
