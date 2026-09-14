document.addEventListener('DOMContentLoaded', () => {
  const links = document.querySelectorAll('.sidebar-nav a');
  const currentPath = window.location.pathname.toLowerCase();

  links.forEach(link => {
    if (currentPath.includes(link.getAttribute('href').toLowerCase())) {
      link.classList.add('active');
    }
  });

  const themeToggle = document.getElementById('theme-toggle');
  const savedTheme = localStorage.getItem('theme');
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

  const applyTheme = (theme) => {
    if (theme === 'dark') {
      document.body.classList.add('dark-mode');
      if (themeToggle) themeToggle.innerHTML = '<i class="bi bi-sun-fill"></i>';
    } else {
      document.body.classList.remove('dark-mode');
      if (themeToggle) themeToggle.innerHTML = '<i class="bi bi-moon-stars-fill"></i>';
    }
  };

  if (savedTheme) {
    applyTheme(savedTheme);
  } else {
    applyTheme(prefersDark ? 'dark' : 'light');
  }

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      themeToggle.classList.add('active');
      setTimeout(() => themeToggle.classList.remove('active'), 260);
      const nextTheme = document.body.classList.contains('dark-mode') ? 'light' : 'dark';
      applyTheme(nextTheme);
      localStorage.setItem('theme', nextTheme);
    });
  }

  const loginEmailInput = document.getElementById('login-email');
  const loginPasswordStep = document.querySelector('.form-step-password');
  const continueButton = document.getElementById('login-continue');
  const loginSubmit = document.getElementById('login-submit');
  const emailPreview = document.getElementById('email-preview');
  const changeEmailButton = document.getElementById('change-email');

  if (continueButton && loginEmailInput && loginPasswordStep && emailPreview) {
    continueButton.addEventListener('click', () => {
      const email = loginEmailInput.value.trim();
      if (!email) {
        loginEmailInput.focus();
        return;
      }
      loginEmailInput.setAttribute('readonly', 'true');
      loginPasswordStep.classList.remove('d-none');
      continueButton.classList.add('d-none');
      loginSubmit.classList.remove('d-none');
      emailPreview.textContent = email;
      const passwordInput = document.getElementById('login-password');
      if (passwordInput) passwordInput.focus();
    });
  }

  if (changeEmailButton && loginEmailInput && loginPasswordStep && continueButton && loginSubmit) {
    changeEmailButton.addEventListener('click', () => {
      loginEmailInput.removeAttribute('readonly');
      loginEmailInput.focus();
      loginPasswordStep.classList.add('d-none');
      continueButton.classList.remove('d-none');
      loginSubmit.classList.add('d-none');
    });
  }

  if (loginSubmit) {
    loginSubmit.addEventListener('click', () => {
      const passwordInput = document.getElementById('login-password');
      if (passwordInput && !passwordInput.value.trim()) {
        passwordInput.focus();
        return;
      }
      loginSubmit.textContent = 'Ingresando...';
      setTimeout(() => {
        loginSubmit.textContent = 'Iniciar sesión';
      }, 800);
    });
  }
});
