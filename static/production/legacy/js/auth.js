const defaultUsers = [
  { username: 'admin', password: 'admin', fullName: 'Администратор системы', role: 'admin' },
  { username: 'user', password: 'user', fullName: 'Инженер-технолог', role: 'technologist' }
];

const savedUsers = JSON.parse(localStorage.getItem('atppUsers') || 'null');
if (!Array.isArray(savedUsers) || !savedUsers.length) {
  localStorage.setItem('atppUsers', JSON.stringify(defaultUsers));
}

const loginForm = document.querySelector('#login-form');
const usernameInput = document.querySelector('#username');
const passwordInput = document.querySelector('#password');
const message = document.querySelector('#login-message');
const serverField = document.querySelector('#server');
const server = JSON.parse(localStorage.getItem('atppServer') || 'null');

if (server?.host) serverField.value = server.host;

function normalizeCredential(value) {
  return String(value)
    .normalize('NFKC')
    .replace(/[\u200B-\u200D\u2060\uFEFF]/g, '')
    .replace(/\u00A0/g, ' ')
    .trim();
}

if (sessionStorage.getItem('oecAuthorized') === 'true') {
  window.location.replace('index.html');
}

loginForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const users = JSON.parse(localStorage.getItem('atppUsers') || '[]');
  const username = normalizeCredential(usernameInput.value);
  const password = normalizeCredential(passwordInput.value);

  if (!username || !password) {
    message.className = 'login-message error';
    message.textContent = 'Заполните логин и пароль';
    return;
  }

  const account = users.find((user) => user.username === username && user.password === password);
  if (!account) {
    message.className = 'login-message error';
    message.textContent = 'Неверный логин или пароль';
    passwordInput.value = '';
    passwordInput.focus();
    return;
  }

  sessionStorage.setItem('oecAuthorized', 'true');
  sessionStorage.setItem('oecUser', account.username);
  sessionStorage.setItem('oecFullName', account.fullName);
  sessionStorage.setItem('oecRole', account.role);
  message.className = 'login-message success';
  message.textContent = 'Вход выполнен';
  window.setTimeout(() => window.location.replace('index.html'), 250);
});

document.querySelector('#close-login').addEventListener('click', () => {
  usernameInput.value = '';
  passwordInput.value = '';
  message.className = 'login-message';
  message.textContent = 'Введите логин и пароль';
});
