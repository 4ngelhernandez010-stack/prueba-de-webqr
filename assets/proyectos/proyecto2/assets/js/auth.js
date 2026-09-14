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
  const authMessage = document.getElementById('authMessage');
  if (!authMessage) return;
  authMessage.textContent = message;
  authMessage.className = `status-message ${type}`;
  authMessage.classList.remove('hidden');
}

function redirectToPage(role, name) {
  const encodedName = encodeURIComponent(name);
  if (role === 'profesor') {
    window.location.href = `../dashboard/profesor.html?name=${encodedName}`;
  } else {
    window.location.href = `../dashboard/alumno.html?name=${encodedName}`;
  }
}

function inferRoleFromEmail(email) {
  const domain = email.split('@')[1] || '';
  if (/profesor|teacher|docente|faculty/i.test(domain)) {
    return 'profesor';
  }
  if (/alumno|student|estudiante|campus/i.test(domain)) {
    return 'alumno';
  }
  return 'alumno';
}

function attachFormHandlers() {
  const loginForm = document.getElementById('loginForm');
  const signupForm = document.getElementById('signupForm');
  const resetForm = document.getElementById('resetForm');
  const googleSignIn = document.getElementById('googleSignIn');

  if (loginForm) {
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
        showMessage('Correo no registrado. Crea una cuenta primero.', 'error');
        return;
      }
      if (account.password !== password) {
        showMessage('Contraseña incorrecta. Intenta nuevamente.', 'error');
        return;
      }

      showMessage('Inicio de sesión exitoso. Redirigiendo...', 'success');
      setTimeout(() => redirectToPage(account.role, account.name || email.split('@')[0]), 800);
    });
  }

  if (signupForm) {
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
      setTimeout(() => {
        window.location.href = 'login.html';
      }, 900);
    });
  }

  if (resetForm) {
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
      setTimeout(() => {
        window.location.href = 'login.html';
      }, 1400);
    });
  }

  if (googleSignIn) {
    googleSignIn.addEventListener('click', () => {
      const emailPrompt = prompt('Ingresa tu correo de Google:');
      if (!emailPrompt) {
        showMessage('Debes ingresar un correo para continuar.', 'error');
        return;
      }
      const email = normalizeEmail(emailPrompt);
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
      showMessage('Cuenta no encontrada. Redirigiendo según tu correo...', 'info');
      setTimeout(() => redirectToPage(inferredRole, inferredName || email), 900);
    });
  }
}

document.addEventListener('DOMContentLoaded', attachFormHandlers);
