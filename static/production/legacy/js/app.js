if (sessionStorage.getItem('oecAuthorized') !== 'true') {
  document.documentElement.style.visibility = 'hidden';
  window.location.replace('login.html');
}

const pageViews = {
  "admin": `<section class="app-shell niiar-shell">
      <aside class="sidebar niiar-sidebar">
        <a class="release-brand" href="index.html">
          <img class="rosatom-logo" src="assets/rosatom-logo.svg" alt="Росатом">
        </a>
        <p class="nav-caption">Разделы программы</p>
        <nav class="side-nav familiar-nav">
      <div class="nav-item " data-menu="0">
        <button class="nav-button" data-href="">
          <span class="nav-icon nav-icon-database" aria-hidden="true"><svg viewBox="0 0 24 24"><ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v6c0 1.7 3.6 3 8 3s8-1.3 8-3V5M4 11v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6"/></svg></span><span class="nav-label">Ведение базы</span>
        </button>
        <div class="dropdown"><a href="entry.html">Введение нового заказа</a><a href="annual-plan.html">Формирование Годового плана</a><a href="plan-a.html">Формирование Плана А</a><a href="plan-b.html">Изменение / Формирование Плана Б</a></div>
      </div>
      <div class="nav-item " data-menu="1">
        <button class="nav-button" data-href="">
          <span class="nav-icon nav-icon-orders" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M7 4h10v3h3v14H4V7h3V4Z"/><path d="M8 11h8M8 15h8"/></svg></span><span class="nav-label">Просмотр по заказам</span>
        </button>
        <div class="dropdown"><a href="orders.html?view=portfolio">Портфель заказов</a><a href="orders.html?view=annual">Годовой план</a><a href="orders.html?view=archive">Архив работ</a><a href="products.html?view=products">Изделия</a></div>
      </div>
      <div class="nav-item " data-menu="2">
        <button class="nav-button" data-href="">
          <span class="nav-icon nav-icon-products" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="m12 3 8 4.5v9L12 21l-8-4.5v-9L12 3Z"/><path d="m4 7.5 8 4.5 8-4.5M12 12v9"/></svg></span><span class="nav-label">Просмотр по изделиям</span>
        </button>
        <div class="dropdown"><a href="orders.html?view=portfolio">Портфель заказов</a><a href="orders.html?view=annual">Годовой план</a><a href="products.html?view=plan-a">План А</a><a href="orders.html?view=archive">Архив работ</a><a href="products.html?view=products">Изделия</a><a href="processes.html">Полный просмотр</a></div>
      </div>
      <div class="nav-item " data-menu="8">
        <button class="nav-button" data-href="settings.html">
          <span class="nav-icon nav-icon-settings" aria-hidden="true"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2"/></svg></span><span class="nav-label">Настройка...</span>
        </button>

      </div>
      <div class="nav-item " data-menu="3">
        <button class="nav-button" data-href="standards.html">
          <span class="nav-icon nav-icon-clock" aria-hidden="true"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 7v6l4 2"/></svg></span><span class="nav-label">Нормирование</span>
        </button>

      </div>
      <div class="nav-item " data-menu="4">
        <button class="nav-button" data-href="form2.html">
          <span class="nav-icon nav-icon-alert" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M12 3 2.8 20h18.4L12 3Z"/><path d="M12 9v5M12 17h.01"/></svg></span><span class="nav-label">Отклонения плана</span>
        </button>

      </div>
      <div class="nav-item " data-menu="5">
        <button class="nav-button" data-href="production.html">
          <span class="nav-icon nav-icon-production" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M3 21V10l6 3V9l6 4V5h6v16H3Z"/><path d="M7 17h2M13 17h2M18 9h3"/></svg></span><span class="nav-label">Производство</span>
        </button>

      </div>
      <div class="nav-item " data-menu="6">
        <button class="nav-button" data-href="cam.html">
          <span class="nav-icon nav-icon-import" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M12 3v12M7 10l5 5 5-5M4 20h16"/></svg></span><span class="nav-label">Импорт NX CAM</span>
        </button>

      </div>
      <div class="nav-item " data-menu="7">
        <button class="nav-button" data-href="">
          <span class="nav-icon nav-icon-report" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M4 20V10h4v10M10 20V4h4v16M16 20v-7h4v7M3 20h18"/></svg></span><span class="nav-label">Отчёт</span>
        </button>
        <div class="dropdown"><a href="reports.html?report=plan-a">План А для технологов</a><a href="reports.html?report=plan-b">План Б для ПДБ</a><a href="reports.html?report=standards">Нормирование и отклонения Плана Б</a><a href="reports.html?report=balance">Остатки работ Плана Б</a><a href="reports.html?report=production">Производство заказа</a></div>
      </div>
      <div class="nav-item " data-menu="9">
        <button class="nav-button" data-href="help.html">
          <span class="nav-icon nav-icon-help" aria-hidden="true"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.7 2.7 0 1 1 4.1 2.3c-1 .6-1.6 1.1-1.6 2.2M12 17h.01"/></svg></span><span class="nav-label">Помощь</span>
        </button>

      </div>
      <div class="nav-item current" data-menu="10">
        <button class="nav-button" data-href="admin.html">
          <span class="nav-icon nav-icon-admin" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M12 3 20 6v5c0 5-3.4 8.3-8 10-4.6-1.7-8-5-8-10V6l8-3Z"/><path d="M9 12l2 2 4-4"/></svg></span><span class="nav-label">Администрирование</span>
        </button>

      </div></nav>
        <div class="sidebar-product">Система ТПП</div>
      </aside>
      <section class="main-area">
        <header class="topbar niiar-topbar">
          <div><p class="eyebrow">Автоматизированная система ТПП</p><h1>Администрирование пользователей</h1></div>
          <div class="user-panel">
            <div class="user-avatar">AD</div>
            <div class="user-meta"><strong>Администратор системы</strong></div>
            <button class="logout-button" id="logout-button">Выйти</button>
          </div>
        </header>
        <main class="workspace">
    <div class="modern-page admin-page">
      <section class="page-intro"><div><span class="eyebrow">Администрирование</span><h2>Пользователи и сервер</h2><p>Управление учетными записями и подключением к базе данных.</p></div></section>
      <section class="admin-summary-grid">
        <article class="content-card server-admin-card">
          <div class="card-heading"><div><span class="eyebrow">Подключение</span><h3>Сервер базы данных</h3></div><span class="status-pill">Проверка</span></div>
          <dl class="server-details"><div><dt>Адрес</dt><dd data-server-value="host">—</dd></div><div><dt>Порт</dt><dd data-server-value="port">—</dd></div><div><dt>База данных</dt><dd data-server-value="database">—</dd></div><div><dt>Пользователь</dt><dd data-server-value="username">—</dd></div></dl>
          <div class="row-actions admin-server-actions"><button class="ghost-button" data-action="test-server">Проверить подключение</button><button class="ghost-button" data-action="edit-server">Изменить параметры сервера</button></div>
        </article>
      </section>
      <section class="content-card">
        <div class="card-heading"><div><span class="eyebrow">Состав отдела</span><h3>Учетные записи</h3></div><div class="row-actions"><button class="primary-button" data-action="add-user">Создать пользователя</button><span class="status-pill" id="users-count" data-suffix="пользователя">Загрузка</span></div></div>
        <div class="modern-table-wrap"><table class="modern-table"><thead><tr><th>Фото</th><th>Логин</th><th>Сотрудник</th><th>Роль</th><th>Состояние</th><th></th></tr></thead><tbody id="admin-users-body"></tbody></table></div>
      </section>
      <section class="content-card">
        <div class="card-heading"><div><span class="eyebrow">Разграничение доступа</span><h3>Роли технологического отдела</h3></div></div>
        <div class="modern-table-wrap">
          <table class="modern-table permissions-table">
            <thead><tr><th>Роль</th><th>Рабочих мест</th><th>Доступные функции</th></tr></thead>
            <tbody>
              <tr><td><b>Начальник отдела</b></td><td>1</td><td>Контроль и аналитика, загрузка производства, утверждение планов и технологических процессов, сводные отчёты.</td></tr>
              <tr><td><b>Инженер-технолог</b></td><td>10</td><td>Проектирование технологических процессов, справочники, документы ЕСТД, материалы и импорт NX CAM.</td></tr>
              <tr><td><b>Инженер по нормированию труда</b></td><td>2</td><td>Расчёт норм времени, режимов обработки, укрупнённых нормативов и профильные отчёты.</td></tr>
              <tr><td><b>Администратор системы</b></td><td>—</td><td>Полный доступ, пользователи, роли и параметры подключения к серверу PostgreSQL.</td></tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  </main>
      </section>
    </section>
<template id="admin-user-row">
    <tr>
      <td><span class="admin-user-avatar fallback" data-user-avatar></span></td>
      <td><b data-user-login></b></td>
      <td data-user-name></td>
      <td data-user-role></td>
      <td><span class="status-pill success">Активен</span></td>
      <td class="row-actions"><button class="ghost-button" data-action="edit-user">Изменить</button><button class="ghost-button danger" data-action="delete-user">Удалить</button></td>
    </tr>
  </template>
  <dialog id="user-dialog" class="form-modal">
    <form id="user-form" method="dialog" class="form-modal-body">
      <header><div><span class="eyebrow">Управление данными</span><h2 id="user-dialog-title">Учетная запись</h2></div></header>
      <input type="hidden" name="originalUsername">
      <div class="form-modal-grid">
        <label class="form-modal-field required"><span>Логин</span><input name="username" required></label>
        <label class="form-modal-field required"><span>ФИО сотрудника</span><input name="fullName" required></label>
        <label class="form-modal-field required"><span>Пароль</span><input name="password" type="password" required></label>
        <label class="form-modal-field required"><span>Роль</span><select name="role" required><option value="technologist">Инженер-технолог</option><option value="normalizer">Инженер по нормированию труда</option><option value="manager">Начальник отдела</option><option value="admin">Администратор системы</option></select></label>
        <label class="form-modal-field optional"><span>Фотография пользователя</span><input name="avatar" type="file" accept="image/png,image/jpeg,image/webp"></label>
      </div>
      <footer><button type="button" class="ghost-button" data-dialog-close="user-dialog">Отмена</button><button class="primary-button" type="submit">Сохранить</button></footer>
    </form>
  </dialog>
  <dialog id="server-dialog" class="form-modal">
    <form id="server-form" method="dialog" class="form-modal-body">
      <header><div><span class="eyebrow">Подключение</span><h2>Параметры сервера PostgreSQL</h2></div><button type="button" class="modal-close" data-dialog-close="server-dialog" aria-label="Закрыть">×</button></header>
      <div class="form-modal-grid">
        <label class="form-modal-field required"><span>Адрес сервера</span><input name="host" required></label>
        <label class="form-modal-field required"><span>Порт</span><input name="port" required></label>
        <label class="form-modal-field required"><span>Имя базы данных</span><input name="database" required></label>
        <label class="form-modal-field required"><span>Пользователь базы данных</span><input name="username" required></label>
        <label class="form-modal-field required"><span>Пароль базы данных</span><input name="password" type="password" required></label>
      </div>
      <footer><button type="button" class="ghost-button" data-dialog-close="server-dialog">Отмена</button><button class="primary-button" type="submit">Сохранить</button></footer>
    </form>
  </dialog>`,
  "annual-plan": `<section class="app-shell niiar-shell">
      <aside class="sidebar niiar-sidebar">
        <a class="release-brand" href="index.html">
          <img class="rosatom-logo" src="assets/rosatom-logo.svg" alt="Росатом">
        </a>
        <p class="nav-caption">Разделы программы</p>
        <nav class="side-nav familiar-nav">
      <div class="nav-item current" data-menu="0">
        <button class="nav-button" data-href="">
          <span class="nav-icon nav-icon-database" aria-hidden="true"><svg viewBox="0 0 24 24"><ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v6c0 1.7 3.6 3 8 3s8-1.3 8-3V5M4 11v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6"/></svg></span><span class="nav-label">Ведение базы</span>
        </button>
        <div class="dropdown"><a href="entry.html">Введение нового заказа</a><a href="annual-plan.html">Формирование Годового плана</a><a href="plan-a.html">Формирование Плана А</a><a href="plan-b.html">Изменение / Формирование Плана Б</a></div>
      </div>
      <div class="nav-item " data-menu="1">
        <button class="nav-button" data-href="">
          <span class="nav-icon nav-icon-orders" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M7 4h10v3h3v14H4V7h3V4Z"/><path d="M8 11h8M8 15h8"/></svg></span><span class="nav-label">Просмотр по заказам</span>
        </button>
        <div class="dropdown"><a href="orders.html?view=portfolio">Портфель заказов</a><a href="orders.html?view=annual">Годовой план</a><a href="orders.html?view=archive">Архив работ</a><a href="products.html?view=products">Изделия</a></div>
      </div>
      <div class="nav-item " data-menu="2">
        <button class="nav-button" data-href="">
          <span class="nav-icon nav-icon-products" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="m12 3 8 4.5v9L12 21l-8-4.5v-9L12 3Z"/><path d="m4 7.5 8 4.5 8-4.5M12 12v9"/></svg></span><span class="nav-label">Просмотр по изделиям</span>
        </button>
        <div class="dropdown"><a href="orders.html?view=portfolio">Портфель заказов</a><a href="orders.html?view=annual">Годовой план</a><a href="products.html?view=plan-a">План А</a><a href="orders.html?view=archive">Архив работ</a><a href="products.html?view=products">Изделия</a><a href="processes.html">Полный просмотр</a></div>
      </div>
      <div class="nav-item " data-menu="8">
        <button class="nav-button" data-href="settings.html">
          <span class="nav-icon nav-icon-settings" aria-hidden="true"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2"/></svg></span><span class="nav-label">Настройка...</span>
        </button>

      </div>
      <div class="nav-item " data-menu="3">
        <button class="nav-button" data-href="standards.html">
          <span class="nav-icon nav-icon-clock" aria-hidden="true"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 7v6l4 2"/></svg></span><span class="nav-label">Нормирование</span>
        </button>

      </div>
      <div class="nav-item " data-menu="4">
        <button class="nav-button" data-href="form2.html">
          <span class="nav-icon nav-icon-alert" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M12 3 2.8 20h18.4L12 3Z"/><path d="M12 9v5M12 17h.01"/></svg></span><span class="nav-label">Отклонения плана</span>
        </button>

      </div>
      <div class="nav-item " data-menu="5">
        <button class="nav-button" data-href="production.html">
          <span class="nav-icon nav-icon-production" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M3 21V10l6 3V9l6 4V5h6v16H3Z"/><path d="M7 17h2M13 17h2M18 9h3"/></svg></span><span class="nav-label">Производство</span>
        </button>

      </div>
      <div class="nav-item " data-menu="6">
        <button class="nav-button" data-href="cam.html">
          <span class="nav-icon nav-icon-import" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M12 3v12M7 10l5 5 5-5M4 20h16"/></svg></span><span class="nav-label">Импорт NX CAM</span>
        </button>

      </div>
      <div class="nav-item " data-menu="7">
        <button class="nav-button" data-href="">
          <span class="nav-icon nav-icon-report" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M4 20V10h4v10M10 20V4h4v16M16 20v-7h4v7M3 20h18"/></svg></span><span class="nav-label">Отчёт</span>
        </button>
        <div class="dropdown"><a href="reports.html?report=plan-a">План А для технологов</a><a href="reports.html?report=plan-b">План Б для ПДБ</a><a href="reports.html?report=standards">Нормирование и отклонения Плана Б</a><a href="reports.html?report=balance">Остатки работ Плана Б</a><a href="reports.html?report=production">Производство заказа</a></div>
      </div>
      <div class="nav-item " data-menu="9">
        <button class="nav-button" data-href="help.html">
          <span class="nav-icon nav-icon-help" aria-hidden="true"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.7 2.7 0 1 1 4.1 2.3c-1 .6-1.6 1.1-1.6 2.2M12 17h.01"/></svg></span><span class="nav-label">Помощь</span>
        </button>

      </div>
      <div class="nav-item " data-menu="10">
        <button class="nav-button" data-href="admin.html">
          <span class="nav-icon nav-icon-admin" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M12 3 20 6v5c0 5-3.4 8.3-8 10-4.6-1.7-8-5-8-10V6l8-3Z"/><path d="M9 12l2 2 4-4"/></svg></span><span class="nav-label">Администрирование</span>
        </button>

      </div></nav>
        <div class="sidebar-product">Система ТПП</div>
      </aside>
      <section class="main-area">
        <header class="topbar niiar-topbar">
          <div><p class="eyebrow">Автоматизированная система ТПП</p><h1>Формирование годового плана</h1></div>
          <div class="user-panel">
            <div class="user-avatar">AD</div>
            <div class="user-meta"><strong>Администратор системы</strong></div>
            <button class="logout-button" id="logout-button">Выйти</button>
          </div>
        </header>
        <main class="workspace">
    <div class="planning-page">
      <section class="planning-table-card">
        <header>Формируемый годовой план</header>
        <label class="table-filter"><input type="checkbox"> Только не вошедшие в план</label>
        <div class="planning-table-wrap">
          <table><thead><tr><th>Заказ</th><th>№</th><th>Объект</th><th>Наименование</th><th>Чертёж</th><th>Кол. черт.</th><th>Год</th><th>Квартал</th><th>Стадия</th><th>Приоритет</th><th>№ заявки</th><th>Дата заявки</th><th>Дата ввода</th><th>Материалы</th></tr></thead>
          <tbody>
            <tr class="selected"><td>1256</td><td>1</td><td>ОРМ</td><td>Патрон станка</td><td>7002</td><td>1</td><td>2008</td><td>1</td><td>План Б</td><td>2</td><td>55-07/215</td><td>24.03.2008</td><td>27.03.2008</td><td>70%</td></tr>
            <tr><td>1353</td><td>1</td><td>РИК</td><td>Контейнер транспортно-защитный</td><td>1Ж.6867.000.00СБ</td><td>1</td><td>2008</td><td>3</td><td>План Б</td><td>2</td><td>44-69/1095</td><td>15.08.2008</td><td>21.08.2008</td><td>80%</td></tr>
            <tr><td>1587</td><td>1</td><td>ХТО</td><td>Контейнер</td><td>9Б.3021.000.00</td><td>1</td><td>2014</td><td>1</td><td>План А</td><td>2</td><td>25-16/1395</td><td>15.11.2013</td><td>21.11.2013</td><td>50%</td></tr>
            <tr><td>3219</td><td>1</td><td>РИК</td><td>Канал яч. 3-10</td><td>1Б.3481.000.00-01</td><td>1</td><td>2015</td><td>1</td><td>План А</td><td>2</td><td>Годовая 2015</td><td>05.11.2014</td><td>05.11.2014</td><td>0%</td></tr>
          </tbody></table>
        </div>
      </section>
      <aside class="planning-controls">
        <label>Сформировать на <select><option>2026</option><option>2027</option></select> год</label>
        <button class="primary-button" data-action="plan-preview">Предварительное формирование</button>
        <button class="ghost-button" data-action="plan-clear">Очистить</button>
        <div class="planning-controls-spacer"></div>
        <button class="primary-button" data-action="plan-approve">Утвердить</button>
        <button class="ghost-button" data-go="index.html">Отменить</button>
      </aside>
    </div>
  </main>
      </section>
    </section>`,
  "cam": `<section class="app-shell niiar-shell">
      <aside class="sidebar niiar-sidebar">
        <a class="release-brand" href="index.html">
          <img class="rosatom-logo" src="assets/rosatom-logo.svg" alt="Росатом">
        </a>
        <p class="nav-caption">Разделы программы</p>
        <nav class="side-nav familiar-nav">
      <div class="nav-item " data-menu="0">
        <button class="nav-button" data-href="">
          <span class="nav-icon nav-icon-database" aria-hidden="true"><svg viewBox="0 0 24 24"><ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v6c0 1.7 3.6 3 8 3s8-1.3 8-3V5M4 11v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6"/></svg></span><span class="nav-label">Ведение базы</span>
        </button>
        <div class="dropdown"><a href="entry.html">Введение нового заказа</a><a href="annual-plan.html">Формирование Годового плана</a><a href="plan-a.html">Формирование Плана А</a><a href="plan-b.html">Изменение / Формирование Плана Б</a></div>
      </div>
      <div class="nav-item " data-menu="1">
        <button class="nav-button" data-href="">
          <span class="nav-icon nav-icon-orders" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M7 4h10v3h3v14H4V7h3V4Z"/><path d="M8 11h8M8 15h8"/></svg></span><span class="nav-label">Просмотр по заказам</span>
        </button>
        <div class="dropdown"><a href="orders.html?view=portfolio">Портфель заказов</a><a href="orders.html?view=annual">Годовой план</a><a href="orders.html?view=archive">Архив работ</a><a href="products.html?view=products">Изделия</a></div>
      </div>
      <div class="nav-item " data-menu="2">
        <button class="nav-button" data-href="">
          <span class="nav-icon nav-icon-products" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="m12 3 8 4.5v9L12 21l-8-4.5v-9L12 3Z"/><path d="m4 7.5 8 4.5 8-4.5M12 12v9"/></svg></span><span class="nav-label">Просмотр по изделиям</span>
        </button>
        <div class="dropdown"><a href="orders.html?view=portfolio">Портфель заказов</a><a href="orders.html?view=annual">Годовой план</a><a href="products.html?view=plan-a">План А</a><a href="orders.html?view=archive">Архив работ</a><a href="products.html?view=products">Изделия</a><a href="processes.html">Полный просмотр</a></div>
      </div>
      <div class="nav-item " data-menu="8">
        <button class="nav-button" data-href="settings.html">
          <span class="nav-icon nav-icon-settings" aria-hidden="true"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2"/></svg></span><span class="nav-label">Настройка...</span>
        </button>

      </div>
      <div class="nav-item " data-menu="3">
        <button class="nav-button" data-href="standards.html">
          <span class="nav-icon nav-icon-clock" aria-hidden="true"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 7v6l4 2"/></svg></span><span class="nav-label">Нормирование</span>
        </button>

      </div>
      <div class="nav-item " data-menu="4">
        <button class="nav-button" data-href="form2.html">
          <span class="nav-icon nav-icon-alert" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M12 3 2.8 20h18.4L12 3Z"/><path d="M12 9v5M12 17h.01"/></svg></span><span class="nav-label">Отклонения плана</span>
        </button>

      </div>
      <div class="nav-item " data-menu="5">
        <button class="nav-button" data-href="production.html">
          <span class="nav-icon nav-icon-production" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M3 21V10l6 3V9l6 4V5h6v16H3Z"/><path d="M7 17h2M13 17h2M18 9h3"/></svg></span><span class="nav-label">Производство</span>
        </button>

      </div>
      <div class="nav-item current" data-menu="6">
        <button class="nav-button" data-href="cam.html">
          <span class="nav-icon nav-icon-import" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M12 3v12M7 10l5 5 5-5M4 20h16"/></svg></span><span class="nav-label">Импорт NX CAM</span>
        </button>

      </div>
      <div class="nav-item " data-menu="7">
        <button class="nav-button" data-href="">
          <span class="nav-icon nav-icon-report" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M4 20V10h4v10M10 20V4h4v16M16 20v-7h4v7M3 20h18"/></svg></span><span class="nav-label">Отчёт</span>
        </button>
        <div class="dropdown"><a href="reports.html?report=plan-a">План А для технологов</a><a href="reports.html?report=plan-b">План Б для ПДБ</a><a href="reports.html?report=standards">Нормирование и отклонения Плана Б</a><a href="reports.html?report=balance">Остатки работ Плана Б</a><a href="reports.html?report=production">Производство заказа</a></div>
      </div>
      <div class="nav-item " data-menu="9">
        <button class="nav-button" data-href="help.html">
          <span class="nav-icon nav-icon-help" aria-hidden="true"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.7 2.7 0 1 1 4.1 2.3c-1 .6-1.6 1.1-1.6 2.2M12 17h.01"/></svg></span><span class="nav-label">Помощь</span>
        </button>

      </div>
      <div class="nav-item " data-menu="10">
        <button class="nav-button" data-href="admin.html">
          <span class="nav-icon nav-icon-admin" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M12 3 20 6v5c0 5-3.4 8.3-8 10-4.6-1.7-8-5-8-10V6l8-3Z"/><path d="M9 12l2 2 4-4"/></svg></span><span class="nav-label">Администрирование</span>
        </button>

      </div></nav>
        <div class="sidebar-product">Система ТПП</div>
      </aside>
      <section class="main-area">
        <header class="topbar niiar-topbar">
          <div><p class="eyebrow">Автоматизированная система ТПП</p><h1>Импорт NX CAM</h1></div>
          <div class="user-panel">
            <div class="user-avatar">AD</div>
            <div class="user-meta"><strong>Администратор системы</strong></div>
            <button class="logout-button" id="logout-button">Выйти</button>
          </div>
        </header>
        <main class="workspace">
    <div class="modern-page">
      <section class="page-intro"><div><span class="eyebrow">Импорт данных</span><h2>Импорт NX CAM</h2><p>Загрузка операций, режимов резания, основного времени, управляющих программ и карт наладки.</p></div></section>
      <section class="dashboard-grid">
        <article class="content-card import-card"><div class="card-heading"><div><span class="eyebrow">Файл проекта</span><h3>Выберите пакет NX CAM</h3></div><span class="status-pill" id="import-status">Ожидание файла</span></div><div class="drop-zone"><strong>Файл .prt, .xml или архив проекта</strong><span id="import-file-name">Файл не выбран</span><input id="nx-file" type="file" accept=".prt,.xml,.zip" hidden><button class="secondary-button" data-action="select-import-file">Выбрать файл</button></div></article>
        <article class="content-card"><div class="card-heading"><div><span class="eyebrow">Предварительный результат</span><h3>Полученные данные</h3></div></div><div class="result-row"><span>Операций</span><b id="import-operations">0</b></div><div class="result-row"><span>Переходов</span><b id="import-steps">0</b></div><div class="result-row"><span>Управляющих программ</span><b id="import-programs">0</b></div><div class="result-row"><span>Карт наладки</span><b id="import-cards">0</b></div></article>
      </section>
      <section class="content-card"><div class="card-heading"><div><span class="eyebrow">Предпросмотр</span><h3>Операции из файла</h3></div><button class="primary-button" data-action="save-import">Сохранить импорт</button></div><div class="modern-table-wrap"><table class="modern-table"><thead><tr><th>№</th><th>Операция</th><th>Оборудование</th><th>Режим</th><th>Основное время</th></tr></thead><tbody id="import-preview"><tr><td colspan="5">Выберите файл для формирования предпросмотра</td></tr></tbody></table></div></section>
    </div>
  </main>
      </section>
    </section>`,
  "entry": `<section class="app-shell niiar-shell">
      <aside class="sidebar niiar-sidebar">
        <a class="release-brand" href="index.html">
          <img class="rosatom-logo" src="assets/rosatom-logo.svg" alt="Росатом">
        </a>
        <p class="nav-caption">Разделы программы</p>
        <nav class="side-nav familiar-nav">
      <div class="nav-item current" data-menu="0">
        <button class="nav-button" data-href="">
          <span class="nav-icon nav-icon-database" aria-hidden="true"><svg viewBox="0 0 24 24"><ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v6c0 1.7 3.6 3 8 3s8-1.3 8-3V5M4 11v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6"/></svg></span><span class="nav-label">Ведение базы</span>
        </button>
        <div class="dropdown"><a href="entry.html">Введение нового заказа</a><a href="annual-plan.html">Формирование Годового плана</a><a href="plan-a.html">Формирование Плана А</a><a href="plan-b.html">Изменение / Формирование Плана Б</a></div>
      </div>
      <div class="nav-item " data-menu="1">
        <button class="nav-button" data-href="">
          <span class="nav-icon nav-icon-orders" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M7 4h10v3h3v14H4V7h3V4Z"/><path d="M8 11h8M8 15h8"/></svg></span><span class="nav-label">Просмотр по заказам</span>
        </button>
        <div class="dropdown"><a href="orders.html?view=portfolio">Портфель заказов</a><a href="orders.html?view=annual">Годовой план</a><a href="orders.html?view=archive">Архив работ</a><a href="products.html?view=products">Изделия</a></div>
      </div>
      <div class="nav-item " data-menu="2">
        <button class="nav-button" data-href="">
          <span class="nav-icon nav-icon-products" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="m12 3 8 4.5v9L12 21l-8-4.5v-9L12 3Z"/><path d="m4 7.5 8 4.5 8-4.5M12 12v9"/></svg></span><span class="nav-label">Просмотр по изделиям</span>
        </button>
        <div class="dropdown"><a href="orders.html?view=portfolio">Портфель заказов</a><a href="orders.html?view=annual">Годовой план</a><a href="products.html?view=plan-a">План А</a><a href="orders.html?view=archive">Архив работ</a><a href="products.html?view=products">Изделия</a><a href="processes.html">Полный просмотр</a></div>
      </div>
      <div class="nav-item " data-menu="8">
        <button class="nav-button" data-href="settings.html">
          <span class="nav-icon nav-icon-settings" aria-hidden="true"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2"/></svg></span><span class="nav-label">Настройка...</span>
        </button>

      </div>
      <div class="nav-item " data-menu="3">
        <button class="nav-button" data-href="standards.html">
          <span class="nav-icon nav-icon-clock" aria-hidden="true"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 7v6l4 2"/></svg></span><span class="nav-label">Нормирование</span>
        </button>

      </div>
      <div class="nav-item " data-menu="4">
        <button class="nav-button" data-href="form2.html">
          <span class="nav-icon nav-icon-alert" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M12 3 2.8 20h18.4L12 3Z"/><path d="M12 9v5M12 17h.01"/></svg></span><span class="nav-label">Отклонения плана</span>
        </button>

      </div>
      <div class="nav-item " data-menu="5">
        <button class="nav-button" data-href="production.html">
          <span class="nav-icon nav-icon-production" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M3 21V10l6 3V9l6 4V5h6v16H3Z"/><path d="M7 17h2M13 17h2M18 9h3"/></svg></span><span class="nav-label">Производство</span>
        </button>

      </div>
      <div class="nav-item " data-menu="6">
        <button class="nav-button" data-href="cam.html">
          <span class="nav-icon nav-icon-import" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M12 3v12M7 10l5 5 5-5M4 20h16"/></svg></span><span class="nav-label">Импорт NX CAM</span>
        </button>

      </div>
      <div class="nav-item " data-menu="7">
        <button class="nav-button" data-href="">
          <span class="nav-icon nav-icon-report" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M4 20V10h4v10M10 20V4h4v16M16 20v-7h4v7M3 20h18"/></svg></span><span class="nav-label">Отчёт</span>
        </button>
        <div class="dropdown"><a href="reports.html?report=plan-a">План А для технологов</a><a href="reports.html?report=plan-b">План Б для ПДБ</a><a href="reports.html?report=standards">Нормирование и отклонения Плана Б</a><a href="reports.html?report=balance">Остатки работ Плана Б</a><a href="reports.html?report=production">Производство заказа</a></div>
      </div>
      <div class="nav-item " data-menu="9">
        <button class="nav-button" data-href="help.html">
          <span class="nav-icon nav-icon-help" aria-hidden="true"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.7 2.7 0 1 1 4.1 2.3c-1 .6-1.6 1.1-1.6 2.2M12 17h.01"/></svg></span><span class="nav-label">Помощь</span>
        </button>

      </div>
      <div class="nav-item " data-menu="10">
        <button class="nav-button" data-href="admin.html">
          <span class="nav-icon nav-icon-admin" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M12 3 20 6v5c0 5-3.4 8.3-8 10-4.6-1.7-8-5-8-10V6l8-3Z"/><path d="M9 12l2 2 4-4"/></svg></span><span class="nav-label">Администрирование</span>
        </button>

      </div></nav>
        <div class="sidebar-product">Система ТПП</div>
      </aside>
      <section class="main-area">
        <header class="topbar niiar-topbar">
          <div><p class="eyebrow">Автоматизированная система ТПП</p><h1>Введение нового заказа</h1></div>
          <div class="user-panel">
            <div class="user-avatar">AD</div>
            <div class="user-meta"><strong>Администратор системы</strong></div>
            <button class="logout-button" id="logout-button">Выйти</button>
          </div>
        </header>
        <main class="workspace">
    <div class="entry-workspace">
      <section class="order-entry-card">
        <header class="order-entry-title"><span>Введение нового заказа</span><time>22.08.2026</time></header>
        <div class="order-entry-main">
          <label>Номер заказа <b>*</b><input data-entry="order" required></label>
          <label>Дата регистрации <input type="date" value="2026-08-22"></label>
          <label>Объект <b>*</b><select data-entry="object" required><option value="">Выберите объект</option><option>ОРМ</option><option>РИК</option><option>ВК-50</option><option>ОЭС</option><option>ХТО</option></select></label>
          <label>Номер заявки <input data-entry="request"></label>
          <label>Дата заявки <input type="date" value="2026-08-22"></label>
        </div>

        <h2 class="entry-section-title">Список изделий</h2>
        <div class="entry-products-table">
          <table>
            <thead><tr><th>Наименование</th><th>Количество</th><th>Чертеж</th><th>Кол. чертежей</th><th>Объект</th></tr></thead>
            <tbody><tr><td><input data-entry="product" required></td><td><input type="number" min="1" value="1"></td><td><input data-entry="drawing"></td><td><input type="number" min="1" value="1"></td><td><input data-entry="product-object"></td></tr></tbody>
          </table>
        </div>
        <button class="entry-list-button" data-action="add-product-row">Изменить список</button>

        <div class="order-entry-options">
          <label>Добавить на стадию <select data-entry="stage"><option>План А</option><option>План Б</option></select></label>
          <label>Шифр затрат <input data-entry="cost-code"></label>
          <label>Приоритет <select><option>2 — плановый заказ текущего периода</option><option>1 — срочный заказ</option></select></label>
          <label>Год изготовления <select><option>2026</option><option>2027</option></select></label>
          <label>Квартал изготовления <select><option>1 квартал</option><option>2 квартал</option><option selected>3 квартал</option><option>4 квартал</option></select></label>
          <label>Группа технологического отдела <select><option>Группа не задана</option><option>Комната 306</option><option>Комната 307</option></select></label>
          <label>Предполагаемая трудоёмкость <input type="number" min="0" step="0.1"></label>
          <label class="wide-field">Примечание <input data-entry="note"></label>
        </div>

        <footer class="order-entry-actions">
          <button class="secondary-button" data-action="clear-entry">Очистить поля</button>
          <button class="primary-button" data-action="save-order-new">Сохранить заказ и ввести новый</button>
          <button class="primary-button" data-action="save-order-exit">Сохранить заказ и выйти</button>
          <button class="ghost-button" data-go="index.html">Выйти без сохранения</button>
        </footer>
      </section>
    </div>
  </main>
      </section>
    </section>`,
  "form2": `<section class="app-shell niiar-shell">
      <aside class="sidebar niiar-sidebar">
        <a class="release-brand" href="index.html">
          <img class="rosatom-logo" src="assets/rosatom-logo.svg" alt="Росатом">
        </a>
        <p class="nav-caption">Разделы программы</p>
        <nav class="side-nav familiar-nav">
      <div class="nav-item " data-menu="0">
        <button class="nav-button" data-href="">
          <span class="nav-icon nav-icon-database" aria-hidden="true"><svg viewBox="0 0 24 24"><ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v6c0 1.7 3.6 3 8 3s8-1.3 8-3V5M4 11v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6"/></svg></span><span class="nav-label">Ведение базы</span>
        </button>
        <div class="dropdown"><a href="entry.html">Введение нового заказа</a><a href="annual-plan.html">Формирование Годового плана</a><a href="plan-a.html">Формирование Плана А</a><a href="plan-b.html">Изменение / Формирование Плана Б</a></div>
      </div>
      <div class="nav-item " data-menu="1">
        <button class="nav-button" data-href="">
          <span class="nav-icon nav-icon-orders" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M7 4h10v3h3v14H4V7h3V4Z"/><path d="M8 11h8M8 15h8"/></svg></span><span class="nav-label">Просмотр по заказам</span>
        </button>
        <div class="dropdown"><a href="orders.html?view=portfolio">Портфель заказов</a><a href="orders.html?view=annual">Годовой план</a><a href="orders.html?view=archive">Архив работ</a><a href="products.html?view=products">Изделия</a></div>
      </div>
      <div class="nav-item " data-menu="2">
        <button class="nav-button" data-href="">
          <span class="nav-icon nav-icon-products" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="m12 3 8 4.5v9L12 21l-8-4.5v-9L12 3Z"/><path d="m4 7.5 8 4.5 8-4.5M12 12v9"/></svg></span><span class="nav-label">Просмотр по изделиям</span>
        </button>
        <div class="dropdown"><a href="orders.html?view=portfolio">Портфель заказов</a><a href="orders.html?view=annual">Годовой план</a><a href="products.html?view=plan-a">План А</a><a href="orders.html?view=archive">Архив работ</a><a href="products.html?view=products">Изделия</a><a href="processes.html">Полный просмотр</a></div>
      </div>
      <div class="nav-item " data-menu="8">
        <button class="nav-button" data-href="settings.html">
          <span class="nav-icon nav-icon-settings" aria-hidden="true"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2"/></svg></span><span class="nav-label">Настройка...</span>
        </button>

      </div>
      <div class="nav-item " data-menu="3">
        <button class="nav-button" data-href="standards.html">
          <span class="nav-icon nav-icon-clock" aria-hidden="true"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 7v6l4 2"/></svg></span><span class="nav-label">Нормирование</span>
        </button>

      </div>
      <div class="nav-item current" data-menu="4">
        <button class="nav-button" data-href="form2.html">
          <span class="nav-icon nav-icon-alert" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M12 3 2.8 20h18.4L12 3Z"/><path d="M12 9v5M12 17h.01"/></svg></span><span class="nav-label">Отклонения плана</span>
        </button>

      </div>
      <div class="nav-item " data-menu="5">
        <button class="nav-button" data-href="production.html">
          <span class="nav-icon nav-icon-production" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M3 21V10l6 3V9l6 4V5h6v16H3Z"/><path d="M7 17h2M13 17h2M18 9h3"/></svg></span><span class="nav-label">Производство</span>
        </button>

      </div>
      <div class="nav-item " data-menu="6">
        <button class="nav-button" data-href="cam.html">
          <span class="nav-icon nav-icon-import" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M12 3v12M7 10l5 5 5-5M4 20h16"/></svg></span><span class="nav-label">Импорт NX CAM</span>
        </button>

      </div>
      <div class="nav-item " data-menu="7">
        <button class="nav-button" data-href="">
          <span class="nav-icon nav-icon-report" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M4 20V10h4v10M10 20V4h4v16M16 20v-7h4v7M3 20h18"/></svg></span><span class="nav-label">Отчёт</span>
        </button>
        <div class="dropdown"><a href="reports.html?report=plan-a">План А для технологов</a><a href="reports.html?report=plan-b">План Б для ПДБ</a><a href="reports.html?report=standards">Нормирование и отклонения Плана Б</a><a href="reports.html?report=balance">Остатки работ Плана Б</a><a href="reports.html?report=production">Производство заказа</a></div>
      </div>
      <div class="nav-item " data-menu="9">
        <button class="nav-button" data-href="help.html">
          <span class="nav-icon nav-icon-help" aria-hidden="true"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.7 2.7 0 1 1 4.1 2.3c-1 .6-1.6 1.1-1.6 2.2M12 17h.01"/></svg></span><span class="nav-label">Помощь</span>
        </button>

      </div>
      <div class="nav-item " data-menu="10">
        <button class="nav-button" data-href="admin.html">
          <span class="nav-icon nav-icon-admin" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M12 3 20 6v5c0 5-3.4 8.3-8 10-4.6-1.7-8-5-8-10V6l8-3Z"/><path d="M9 12l2 2 4-4"/></svg></span><span class="nav-label">Администрирование</span>
        </button>

      </div></nav>
        <div class="sidebar-product">Система ТПП</div>
      </aside>
      <section class="main-area">
        <header class="topbar niiar-topbar">
          <div><p class="eyebrow">Автоматизированная система ТПП</p><h1>Отклонения производственного плана</h1></div>
          <div class="user-panel">
            <div class="user-avatar">AD</div>
            <div class="user-meta"><strong>Администратор системы</strong></div>
            <button class="logout-button" id="logout-button">Выйти</button>
          </div>
        </header>
        <main class="workspace">
    <div class="page deviation-page">
      <section class="page-intro compact-intro">
        <div><span class="eyebrow">Контроль производства</span><h2>Учет отклонений производственного плана</h2><p>Регистрация причин задержек по заказам и анализ отклонений за выбранный период.</p></div>
      </section>
      <div class="filters">
        <fieldset>
          <legend>Новое отклонение</legend>
          <div class="deviation-form-grid">
            <label><span>Заказ</span><input class="field" data-deviation-field="order" value="6938"></label>
            <label><span>Дата</span><input class="field" data-deviation-field="date" type="date" value="2026-08-22"></label>
            <label class="deviation-reason"><span>Причина</span><select class="field" data-deviation-field="reason"><option>Отсутствие инструмента/оснастки</option></select></label>
            <label><span>Работа</span><select class="field" data-deviation-field="work"><option>Заготовительные</option></select></label>
            <div class="deviation-row-actions"><button class="btn primary-inline" data-action="add-deviation">Добавить</button><button class="btn" data-action="edit-deviation">Изменить</button><button class="btn" data-action="delete-deviation">Удалить</button></div>
          </div>
        </fieldset>
        <fieldset>
          <legend>Период</legend>
          <div class="deviation-period-grid">
            <label><span>Год</span><select><option>2026</option></select></label>
            <label><span>Месяц</span><select><option>Август</option></select></label>
            <button class="btn" data-report="standards">Предпросмотр отчета</button>
          </div>
        </fieldset>
      </div>

    <div class="table-wrap">
      <table class="data-grid">
        <thead>
          <tr><th>Заказ</th><th>№</th><th>Объект</th><th>Наименование</th><th>Чертеж</th><th>Кол. черт.</th><th>Год пл.</th><th>Квартал пл.</th><th>Колич. изд.</th><th>Стадия</th><th>Приоритет</th><th>№ заявки</th><th>Д. заявки</th><th>Д. ввода</th><th>Примечание</th><th>Материалы</th><th>Окончание</th><th>Шифр затрат</th><th>Тр. предпол. на изделие</th><th>Тр. Сум. планируемой</th><th>Тр. Сум. фактической</th><th>Дата изготовления</th><th>Накладная</th><th>№ группы</th><th>№ исполнителя</th></tr>
        </thead>
        <tbody>

            <tr class="selected" data-order="1587">
              <td>1587</td><td>2</td><td>ХТО</td><td>САДКА</td><td>9Б.3021.200.00</td><td>1</td><td>2014</td><td>1</td><td>1</td><td>План А</td><td>2</td><td>25-16/1395</td><td>15.11.2013</td><td>21.11.2013</td><td></td><td>50%</td><td>В работе</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td>
            </tr>
            <tr class="" data-order="1692">
              <td>1692</td><td>1</td><td>ОРМ</td><td>СЛИВНОЕ УСТ-ВО</td><td>Б.396-0-00</td><td>1</td><td>2010</td><td>3</td><td>5</td><td>План Б</td><td>2</td><td>55-15/709</td><td>26.10.2009</td><td>28.10.2009</td><td></td><td>90%</td><td>В работе</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td>
            </tr>
            <tr class="" data-order="2136">
              <td>2136</td><td>1</td><td>ВК-50</td><td>ЗАГЛУШКА</td><td>1МТ.4823.110.00</td><td>1</td><td>2010</td><td>4</td><td>1</td><td>План Б</td><td>1</td><td>58-12/338</td><td>22.11.2010</td><td>25.11.2010</td><td></td><td>100%</td><td>В работе</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td>
            </tr>
            <tr class="" data-order="3219">
              <td>3219</td><td>1</td><td>РИК</td><td>КАНАЛ ЯЧ.3-10</td><td>1Б.3481.000.00-01</td><td>1</td><td>2015</td><td>1</td><td>1</td><td>План А</td><td>2</td><td>ГОДОВАЯ 2015</td><td>05.11.2014</td><td>05.11.2014</td><td></td><td>0%</td><td>В работе</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td>
            </tr>
            <tr class="" data-order="3600">
              <td>3600</td><td>6</td><td>ОРМ</td><td>ВИНТ</td><td>Л54.150.01.054</td><td>1</td><td>2016</td><td>1</td><td>400</td><td>План Б</td><td>2</td><td>55-15/230</td><td>29.02.2016</td><td>03.03.2016</td><td></td><td>100%</td><td>В работе</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td>
            </tr>
        </tbody>
      </table>
    </div>
    </div></main>
      </section>
    </section>`,
  "help": `<section class="app-shell niiar-shell">
      <aside class="sidebar niiar-sidebar">
        <a class="release-brand" href="index.html">
          <img class="rosatom-logo" src="assets/rosatom-logo.svg" alt="Росатом">
        </a>
        <p class="nav-caption">Разделы программы</p>
        <nav class="side-nav familiar-nav">
      <div class="nav-item " data-menu="0">
        <button class="nav-button" data-href="">
          <span class="nav-icon nav-icon-database" aria-hidden="true"><svg viewBox="0 0 24 24"><ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v6c0 1.7 3.6 3 8 3s8-1.3 8-3V5M4 11v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6"/></svg></span><span class="nav-label">Ведение базы</span>
        </button>
        <div class="dropdown"><a href="entry.html">Введение нового заказа</a><a href="annual-plan.html">Формирование Годового плана</a><a href="plan-a.html">Формирование Плана А</a><a href="plan-b.html">Изменение / Формирование Плана Б</a></div>
      </div>
      <div class="nav-item " data-menu="1">
        <button class="nav-button" data-href="">
          <span class="nav-icon nav-icon-orders" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M7 4h10v3h3v14H4V7h3V4Z"/><path d="M8 11h8M8 15h8"/></svg></span><span class="nav-label">Просмотр по заказам</span>
        </button>
        <div class="dropdown"><a href="orders.html?view=portfolio">Портфель заказов</a><a href="orders.html?view=annual">Годовой план</a><a href="orders.html?view=archive">Архив работ</a><a href="products.html?view=products">Изделия</a></div>
      </div>
      <div class="nav-item " data-menu="2">
        <button class="nav-button" data-href="">
          <span class="nav-icon nav-icon-products" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="m12 3 8 4.5v9L12 21l-8-4.5v-9L12 3Z"/><path d="m4 7.5 8 4.5 8-4.5M12 12v9"/></svg></span><span class="nav-label">Просмотр по изделиям</span>
        </button>
        <div class="dropdown"><a href="orders.html?view=portfolio">Портфель заказов</a><a href="orders.html?view=annual">Годовой план</a><a href="products.html?view=plan-a">План А</a><a href="orders.html?view=archive">Архив работ</a><a href="products.html?view=products">Изделия</a><a href="processes.html">Полный просмотр</a></div>
      </div>
      <div class="nav-item " data-menu="8">
        <button class="nav-button" data-href="settings.html">
          <span class="nav-icon nav-icon-settings" aria-hidden="true"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2"/></svg></span><span class="nav-label">Настройка...</span>
        </button>

      </div>
      <div class="nav-item " data-menu="3">
        <button class="nav-button" data-href="standards.html">
          <span class="nav-icon nav-icon-clock" aria-hidden="true"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 7v6l4 2"/></svg></span><span class="nav-label">Нормирование</span>
        </button>

      </div>
      <div class="nav-item " data-menu="4">
        <button class="nav-button" data-href="form2.html">
          <span class="nav-icon nav-icon-alert" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M12 3 2.8 20h18.4L12 3Z"/><path d="M12 9v5M12 17h.01"/></svg></span><span class="nav-label">Отклонения плана</span>
        </button>

      </div>
      <div class="nav-item " data-menu="5">
        <button class="nav-button" data-href="production.html">
          <span class="nav-icon nav-icon-production" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M3 21V10l6 3V9l6 4V5h6v16H3Z"/><path d="M7 17h2M13 17h2M18 9h3"/></svg></span><span class="nav-label">Производство</span>
        </button>

      </div>
      <div class="nav-item " data-menu="6">
        <button class="nav-button" data-href="cam.html">
          <span class="nav-icon nav-icon-import" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M12 3v12M7 10l5 5 5-5M4 20h16"/></svg></span><span class="nav-label">Импорт NX CAM</span>
        </button>

      </div>
      <div class="nav-item " data-menu="7">
        <button class="nav-button" data-href="">
          <span class="nav-icon nav-icon-report" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M4 20V10h4v10M10 20V4h4v16M16 20v-7h4v7M3 20h18"/></svg></span><span class="nav-label">Отчёт</span>
        </button>
        <div class="dropdown"><a href="reports.html?report=plan-a">План А для технологов</a><a href="reports.html?report=plan-b">План Б для ПДБ</a><a href="reports.html?report=standards">Нормирование и отклонения Плана Б</a><a href="reports.html?report=balance">Остатки работ Плана Б</a><a href="reports.html?report=production">Производство заказа</a></div>
      </div>
      <div class="nav-item current" data-menu="9">
        <button class="nav-button" data-href="help.html">
          <span class="nav-icon nav-icon-help" aria-hidden="true"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.7 2.7 0 1 1 4.1 2.3c-1 .6-1.6 1.1-1.6 2.2M12 17h.01"/></svg></span><span class="nav-label">Помощь</span>
        </button>

      </div>
      <div class="nav-item " data-menu="10">
        <button class="nav-button" data-href="admin.html">
          <span class="nav-icon nav-icon-admin" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M12 3 20 6v5c0 5-3.4 8.3-8 10-4.6-1.7-8-5-8-10V6l8-3Z"/><path d="M9 12l2 2 4-4"/></svg></span><span class="nav-label">Администрирование</span>
        </button>

      </div></nav>
        <div class="sidebar-product">Система ТПП</div>
      </aside>
      <section class="main-area">
        <header class="topbar niiar-topbar">
          <div><p class="eyebrow">Автоматизированная система ТПП</p><h1>Помощь</h1></div>
          <div class="user-panel">
            <div class="user-avatar">AD</div>
            <div class="user-meta"><strong>Администратор системы</strong></div>
            <button class="logout-button" id="logout-button">Выйти</button>
          </div>
        </header>
        <main class="workspace">
    <div class="help-screen">
      <section class="help-main-card">
        <span class="eyebrow">Основная информация</span>
        <h2>Как работать с программой</h2>
        <p>Выберите нужный раздел в меню слева. Вложенные пункты открываются нажатием на название раздела. Данные в формах сохраняются кнопкой «Сохранить», а отчёты сначала показываются на экране и только затем скачиваются.</p>
      </section>

      <section class="help-guide">
        <article><span>01</span><div><strong>Введение нового заказа</strong><p>Заполните номер, объект, заявку, дату, изделия, стадию, приоритет и плановый период. Обязательные поля отмечены.</p></div></article>
        <article><span>02</span><div><strong>Формирование годового плана</strong><p>Выберите год, проверьте список заказов и выполните предварительное формирование перед утверждением.</p></div></article>
        <article><span>03</span><div><strong>План А</strong><p>Распределение заказов по технологическому бюро и кварталам. Утверждение доступно начальнику отдела.</p></div></article>
        <article><span>04</span><div><strong>План Б</strong><p>Сводная таблица трудоёмкости по видам работ: заготовительные, прессовые, токарные, сварочные и другие.</p></div></article>
        <article><span>05</span><div><strong>Портфель заказов</strong><p>Нажмите строку, чтобы увидеть номер заказа, стадию, заявку и изделия. Двойное нажатие открывает изменение записи.</p></div></article>
        <article><span>06</span><div><strong>Годовой план и архив</strong><p>Годовой план показывает заказы и связанные изделия. Архив работ выводится отдельным подпунктом с теми же полями карточки.</p></div></article>
        <article><span>07</span><div><strong>Просмотр изделий</strong><p>Выбранная строка раскрывается в карточке с изделием, чертежом, объектом, стадией, заявкой и материалами.</p></div></article>
        <article><span>08</span><div><strong>Редактирование данных</strong><p>Выберите строку и нажмите «Изменить». После сохранения таблица и карточка выбранной записи обновятся.</p></div></article>
        <article><span>09</span><div><strong>Технологические процессы</strong><p>Создание и изменение ТП, выбор вида работ, выпуск маршрутных и операционных карт, ведомостей оснастки.</p></div></article>
        <article><span>10</span><div><strong>Нормирование труда</strong><p>Расчёт норм времени, режимов обработки и укрупнённых нормативов выполняет инженер по нормированию.</p></div></article>
        <article><span>11</span><div><strong>Материальное нормирование</strong><p>Расчёт массы заготовки, коэффициента использования материала и технологических отходов.</p></div></article>
        <article><span>12</span><div><strong>Импорт NX CAM</strong><p>Загрузите локальный файл, проверьте операции, режимы резания, основное время, УП и карты наладки.</p></div></article>
        <article><span>13</span><div><strong>Производство</strong><p>Контроль сроков, состояния работ, загрузки подразделений и фактического выполнения заказов.</p></div></article>
        <article><span>14</span><div><strong>Предпросмотр отчёта</strong><p>Сначала откройте отчёт на экране. Проверьте заголовки, строки и итоговые значения, затем скачайте файл.</p></div></article>
        <article><span>15</span><div><strong>Экспорт в Excel</strong><p>Файл содержит название отчёта, блок утверждения, период, табличную шапку и цветные итоговые колонки.</p></div></article>
        <article><span>16</span><div><strong>Права пользователей</strong><p>Доступные разделы и операции зависят от роли. Пользователей, роли и сервер изменяет только администратор.</p></div></article>
      </section>
    </div>
  </main>
      </section>
    </section>`,
  "home": `<section class="app-shell niiar-shell">
      <aside class="sidebar niiar-sidebar">
        <a class="release-brand" href="index.html">
          <img class="rosatom-logo" src="assets/rosatom-logo.svg" alt="Росатом">
        </a>
        <p class="nav-caption">Разделы программы</p>
        <nav class="side-nav familiar-nav">
      <div class="nav-item " data-menu="0">
        <button class="nav-button" data-href="">
          <span class="nav-icon nav-icon-database" aria-hidden="true"><svg viewBox="0 0 24 24"><ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v6c0 1.7 3.6 3 8 3s8-1.3 8-3V5M4 11v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6"/></svg></span><span class="nav-label">Ведение базы</span>
        </button>
        <div class="dropdown"><a href="entry.html">Введение нового заказа</a><a href="annual-plan.html">Формирование Годового плана</a><a href="plan-a.html">Формирование Плана А</a><a href="plan-b.html">Изменение / Формирование Плана Б</a></div>
      </div>
      <div class="nav-item " data-menu="1">
        <button class="nav-button" data-href="">
          <span class="nav-icon nav-icon-orders" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M7 4h10v3h3v14H4V7h3V4Z"/><path d="M8 11h8M8 15h8"/></svg></span><span class="nav-label">Просмотр по заказам</span>
        </button>
        <div class="dropdown"><a href="orders.html?view=portfolio">Портфель заказов</a><a href="orders.html?view=annual">Годовой план</a><a href="orders.html?view=archive">Архив работ</a><a href="products.html?view=products">Изделия</a></div>
      </div>
      <div class="nav-item " data-menu="2">
        <button class="nav-button" data-href="">
          <span class="nav-icon nav-icon-products" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="m12 3 8 4.5v9L12 21l-8-4.5v-9L12 3Z"/><path d="m4 7.5 8 4.5 8-4.5M12 12v9"/></svg></span><span class="nav-label">Просмотр по изделиям</span>
        </button>
        <div class="dropdown"><a href="orders.html?view=portfolio">Портфель заказов</a><a href="orders.html?view=annual">Годовой план</a><a href="products.html?view=plan-a">План А</a><a href="orders.html?view=archive">Архив работ</a><a href="products.html?view=products">Изделия</a><a href="processes.html">Полный просмотр</a></div>
      </div>
      <div class="nav-item " data-menu="8">
        <button class="nav-button" data-href="settings.html">
          <span class="nav-icon nav-icon-settings" aria-hidden="true"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2"/></svg></span><span class="nav-label">Настройка...</span>
        </button>

      </div>
      <div class="nav-item " data-menu="3">
        <button class="nav-button" data-href="standards.html">
          <span class="nav-icon nav-icon-clock" aria-hidden="true"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 7v6l4 2"/></svg></span><span class="nav-label">Нормирование</span>
        </button>

      </div>
      <div class="nav-item " data-menu="4">
        <button class="nav-button" data-href="form2.html">
          <span class="nav-icon nav-icon-alert" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M12 3 2.8 20h18.4L12 3Z"/><path d="M12 9v5M12 17h.01"/></svg></span><span class="nav-label">Отклонения плана</span>
        </button>

      </div>
      <div class="nav-item " data-menu="5">
        <button class="nav-button" data-href="production.html">
          <span class="nav-icon nav-icon-production" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M3 21V10l6 3V9l6 4V5h6v16H3Z"/><path d="M7 17h2M13 17h2M18 9h3"/></svg></span><span class="nav-label">Производство</span>
        </button>

      </div>
      <div class="nav-item " data-menu="6">
        <button class="nav-button" data-href="cam.html">
          <span class="nav-icon nav-icon-import" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M12 3v12M7 10l5 5 5-5M4 20h16"/></svg></span><span class="nav-label">Импорт NX CAM</span>
        </button>

      </div>
      <div class="nav-item " data-menu="7">
        <button class="nav-button" data-href="">
          <span class="nav-icon nav-icon-report" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M4 20V10h4v10M10 20V4h4v16M16 20v-7h4v7M3 20h18"/></svg></span><span class="nav-label">Отчёт</span>
        </button>
        <div class="dropdown"><a href="reports.html?report=plan-a">План А для технологов</a><a href="reports.html?report=plan-b">План Б для ПДБ</a><a href="reports.html?report=standards">Нормирование и отклонения Плана Б</a><a href="reports.html?report=balance">Остатки работ Плана Б</a><a href="reports.html?report=production">Производство заказа</a></div>
      </div>
      <div class="nav-item " data-menu="9">
        <button class="nav-button" data-href="help.html">
          <span class="nav-icon nav-icon-help" aria-hidden="true"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.7 2.7 0 1 1 4.1 2.3c-1 .6-1.6 1.1-1.6 2.2M12 17h.01"/></svg></span><span class="nav-label">Помощь</span>
        </button>

      </div>
      <div class="nav-item " data-menu="10">
        <button class="nav-button" data-href="admin.html">
          <span class="nav-icon nav-icon-admin" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M12 3 20 6v5c0 5-3.4 8.3-8 10-4.6-1.7-8-5-8-10V6l8-3Z"/><path d="M9 12l2 2 4-4"/></svg></span><span class="nav-label">Администрирование</span>
        </button>

      </div></nav>
        <div class="sidebar-product">Система ТПП</div>
      </aside>
      <section class="main-area">
        <header class="topbar niiar-topbar">
          <div><p class="eyebrow">Автоматизированная система ТПП</p><h1>Центр управления производством</h1></div>
          <div class="user-panel">
            <div class="user-avatar">AD</div>
            <div class="user-meta"><strong>Администратор системы</strong></div>
            <button class="logout-button" id="logout-button">Выйти</button>
          </div>
        </header>
        <main class="workspace">
    <div class="dashboard-page">
      <div class="atom-watermark" aria-hidden="true">
        <span></span><span></span><span></span><i></i>
      </div>

      <section class="hero-panel">
        <div>
          <p class="welcome-message">Добрый день, Администратор системы</p>
          <span class="hero-badge">Единый цифровой контур производства</span>
          <h2>Технологическая подготовка<br>без разрывов данных</h2>
          <p>Проектирование техпроцессов, нормирование, ЕСТД-документация и интеграция с NX CAM в одной системе.</p>
          <div class="hero-actions">
            <button class="primary-button" data-go="processes.html">Создать техпроцесс</button>
            <button class="secondary-button" data-go="entry.html">Добавить заказ</button>
          </div>
        </div>
        <div class="hero-stat">
          <span>Готовность портфеля</span>
          <strong>78%</strong>
          <div class="progress"><i style="width:78%"></i></div>
          <small>1 374 изделия в производственном контуре</small>
        </div>
      </section>

      <section class="metric-grid">

    <article class="metric-card cyan">
      <strong>13</strong>
      <span>рабочих мест</span>
      <small>Единая сетевая инфраструктура</small>
    </article>

    <article class="metric-card blue">
      <strong>10</strong>
      <span>инженеров-технологов</span>
      <small>Проектирование ТП и ЕСТД</small>
    </article>

    <article class="metric-card violet">
      <strong>2</strong>
      <span>нормировщика</span>
      <small>Трудовые и материальные нормы</small>
    </article>

    <article class="metric-card green">
      <strong>1</strong>
      <span>начальник отдела</span>
      <small>Контроль, аналитика и утверждение</small>
    </article>
      </section>

      <section class="dashboard-grid">
        <article class="content-card module-card">
          <div class="card-heading"><div><span class="eyebrow">Модули системы</span><h3>Ключевые направления</h3></div></div>
          <div class="module-list">

    <a class="module-link" href="processes.html">
      <span class="module-icon">⚙</span>
      <span><strong>Технологические процессы</strong><small>Механообработка, сборка, сварка и другие виды работ</small></span>
      <b>→</b>
    </a>

    <a class="module-link" href="standards.html">
      <span class="module-icon">◷</span>
      <span><strong>Трудовое нормирование</strong><small>Режимы резания, Тпз и штучно-калькуляционное время</small></span>
      <b>→</b>
    </a>

    <a class="module-link" href="materials.html">
      <span class="module-icon">⬡</span>
      <span><strong>Материальное нормирование</strong><small>Масса заготовки, коэффициент КИМ и отходы</small></span>
      <b>→</b>
    </a>

    <a class="module-link" href="cam.html">
      <span class="module-icon">NX</span>
      <span><strong>Интеграция NX CAM</strong><small>Переходы, режимы резания, УП и карты наладки</small></span>
      <b>→</b>
    </a>
          </div>
        </article>

        <article class="content-card activity-card">
          <div class="card-heading"><div><span class="eyebrow">Сегодня</span><h3>Текущие задачи</h3></div></div>
          <div class="activity-line"><span class="activity-icon wait">12</span><div><strong>План А</strong><small>Изделия ожидают утверждения</small></div><time>08:15</time></div>
          <div class="activity-line"><span class="activity-icon wait">4</span><div><strong>Нормирование</strong><small>Расчёты требуют проверки</small></div><time>09:20</time></div>
          <a class="text-link" href="orders.html">Открыть портфель заказов →</a>
        </article>
      </section>
    </div></main>
      </section>
    </section>`,
  "materials": `<section class="app-shell niiar-shell">
      <aside class="sidebar niiar-sidebar">
        <a class="release-brand" href="index.html">
          <img class="rosatom-logo" src="assets/rosatom-logo.svg" alt="Росатом">
        </a>
        <p class="nav-caption">Разделы программы</p>
        <nav class="side-nav familiar-nav">
      <div class="nav-item " data-menu="0">
        <button class="nav-button" data-href="">
          <span class="nav-icon nav-icon-database" aria-hidden="true"><svg viewBox="0 0 24 24"><ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v6c0 1.7 3.6 3 8 3s8-1.3 8-3V5M4 11v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6"/></svg></span><span class="nav-label">Ведение базы</span>
        </button>
        <div class="dropdown"><a href="entry.html">Введение нового заказа</a><a href="annual-plan.html">Формирование Годового плана</a><a href="plan-a.html">Формирование Плана А</a><a href="plan-b.html">Изменение / Формирование Плана Б</a></div>
      </div>
      <div class="nav-item " data-menu="1">
        <button class="nav-button" data-href="">
          <span class="nav-icon nav-icon-orders" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M7 4h10v3h3v14H4V7h3V4Z"/><path d="M8 11h8M8 15h8"/></svg></span><span class="nav-label">Просмотр по заказам</span>
        </button>
        <div class="dropdown"><a href="orders.html?view=portfolio">Портфель заказов</a><a href="orders.html?view=annual">Годовой план</a><a href="orders.html?view=archive">Архив работ</a><a href="products.html?view=products">Изделия</a></div>
      </div>
      <div class="nav-item " data-menu="2">
        <button class="nav-button" data-href="">
          <span class="nav-icon nav-icon-products" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="m12 3 8 4.5v9L12 21l-8-4.5v-9L12 3Z"/><path d="m4 7.5 8 4.5 8-4.5M12 12v9"/></svg></span><span class="nav-label">Просмотр по изделиям</span>
        </button>
        <div class="dropdown"><a href="orders.html?view=portfolio">Портфель заказов</a><a href="orders.html?view=annual">Годовой план</a><a href="products.html?view=plan-a">План А</a><a href="orders.html?view=archive">Архив работ</a><a href="products.html?view=products">Изделия</a><a href="processes.html">Полный просмотр</a></div>
      </div>
      <div class="nav-item " data-menu="8">
        <button class="nav-button" data-href="settings.html">
          <span class="nav-icon nav-icon-settings" aria-hidden="true"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2"/></svg></span><span class="nav-label">Настройка...</span>
        </button>

      </div>
      <div class="nav-item " data-menu="3">
        <button class="nav-button" data-href="standards.html">
          <span class="nav-icon nav-icon-clock" aria-hidden="true"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 7v6l4 2"/></svg></span><span class="nav-label">Нормирование</span>
        </button>

      </div>
      <div class="nav-item " data-menu="4">
        <button class="nav-button" data-href="form2.html">
          <span class="nav-icon nav-icon-alert" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M12 3 2.8 20h18.4L12 3Z"/><path d="M12 9v5M12 17h.01"/></svg></span><span class="nav-label">Отклонения плана</span>
        </button>

      </div>
      <div class="nav-item " data-menu="5">
        <button class="nav-button" data-href="production.html">
          <span class="nav-icon nav-icon-production" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M3 21V10l6 3V9l6 4V5h6v16H3Z"/><path d="M7 17h2M13 17h2M18 9h3"/></svg></span><span class="nav-label">Производство</span>
        </button>

      </div>
      <div class="nav-item " data-menu="6">
        <button class="nav-button" data-href="cam.html">
          <span class="nav-icon nav-icon-import" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M12 3v12M7 10l5 5 5-5M4 20h16"/></svg></span><span class="nav-label">Импорт NX CAM</span>
        </button>

      </div>
      <div class="nav-item " data-menu="7">
        <button class="nav-button" data-href="">
          <span class="nav-icon nav-icon-report" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M4 20V10h4v10M10 20V4h4v16M16 20v-7h4v7M3 20h18"/></svg></span><span class="nav-label">Отчёт</span>
        </button>
        <div class="dropdown"><a href="reports.html?report=plan-a">План А для технологов</a><a href="reports.html?report=plan-b">План Б для ПДБ</a><a href="reports.html?report=standards">Нормирование и отклонения Плана Б</a><a href="reports.html?report=balance">Остатки работ Плана Б</a><a href="reports.html?report=production">Производство заказа</a></div>
      </div>
      <div class="nav-item " data-menu="9">
        <button class="nav-button" data-href="help.html">
          <span class="nav-icon nav-icon-help" aria-hidden="true"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.7 2.7 0 1 1 4.1 2.3c-1 .6-1.6 1.1-1.6 2.2M12 17h.01"/></svg></span><span class="nav-label">Помощь</span>
        </button>

      </div>
      <div class="nav-item " data-menu="10">
        <button class="nav-button" data-href="admin.html">
          <span class="nav-icon nav-icon-admin" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M12 3 20 6v5c0 5-3.4 8.3-8 10-4.6-1.7-8-5-8-10V6l8-3Z"/><path d="M9 12l2 2 4-4"/></svg></span><span class="nav-label">Администрирование</span>
        </button>

      </div></nav>
        <div class="sidebar-product">Система ТПП</div>
      </aside>
      <section class="main-area">
        <header class="topbar niiar-topbar">
          <div><p class="eyebrow">Автоматизированная система ТПП</p><h1>Материальное нормирование</h1></div>
          <div class="user-panel">
            <div class="user-avatar">AD</div>
            <div class="user-meta"><strong>Администратор системы</strong></div>
            <button class="logout-button" id="logout-button">Выйти</button>
          </div>
        </header>
        <main class="workspace">
    <div class="modern-page">

    <section class="page-intro">
      <div><span class="eyebrow">Нормирование</span><h2>Материалы и заготовки</h2><p>Автоматический расчет расхода основных материалов по геометрии детали, КИМ и нормативным отходам.</p></div>

    </section>

      <section class="calculator-grid">
        <article class="content-card calculator-card">
          <div class="card-heading"><div><span class="eyebrow">Расчет заготовки</span><h3>Геометрические параметры</h3></div></div>
          <div class="modern-form-grid">
            <label>Материал<select id="material-type"><option>Сталь 40Х</option><option>Алюминий АМг6</option><option>Титан ВТ6</option></select></label>
            <label>Тип заготовки<select><option>Круг</option><option>Лист</option><option>Поковка</option></select></label>
            <label>Диаметр, мм<input id="blank-diameter" type="number" value="120"></label>
            <label>Длина, мм<input id="blank-length" type="number" value="240"></label>
            <label>Количество, шт.<input id="blank-count" type="number" value="10"></label>
            <label>Масса детали, кг<input id="part-weight" type="number" value="12.4" step="0.1"></label>
          </div>
          <button class="primary-button" data-action="calculate-material">Рассчитать норму расхода</button>
        </article>

        <article class="content-card material-result">
          <span class="eyebrow">Результат расчета</span>
          <div class="result-main"><strong id="material-total">214,6</strong><span>кг на партию</span></div>
          <div class="result-row"><span>Масса одной заготовки</span><b id="blank-weight">21,46 кг</b></div>
          <div class="result-row"><span>Коэффициент использования</span><b id="kim-value">0,578</b></div>
          <div class="result-row"><span>Технологические отходы</span><b id="waste-value">90,6 кг</b></div>
          <div class="progress large"><i id="kim-progress" style="width:57.8%"></i></div>
        </article>
      </section>

      <section class="content-card">
        <div class="card-heading"><div><span class="eyebrow">Нормативная база</span><h3>Материалы проекта</h3></div><button class="ghost-button" data-action="update-materials">Обновить справочник</button></div>
        <div class="modern-table-wrap"><table class="modern-table"><thead><tr><th>Марка</th><th>Профиль</th><th>Плотность</th><th>КИМ</th><th>Норма отходов</th></tr></thead><tbody><tr><td>Сталь 40Х</td><td>Круг Ø120</td><td>7 850 кг/м³</td><td>0,578</td><td>42,2%</td></tr><tr><td>АМг6</td><td>Лист 12 мм</td><td>2 640 кг/м³</td><td>0,740</td><td>26,0%</td></tr><tr><td>ВТ6</td><td>Пруток Ø80</td><td>4 430 кг/м³</td><td>0,612</td><td>38,8%</td></tr></tbody></table></div>
      </section>
    </div></main>
      </section>
    </section>`,
  "orders": `<section class="app-shell niiar-shell">
      <aside class="sidebar niiar-sidebar">
        <a class="release-brand" href="index.html">
          <img class="rosatom-logo" src="assets/rosatom-logo.svg" alt="Росатом">
        </a>
        <p class="nav-caption">Разделы программы</p>
        <nav class="side-nav familiar-nav">
      <div class="nav-item " data-menu="0">
        <button class="nav-button" data-href="">
          <span class="nav-icon nav-icon-database" aria-hidden="true"><svg viewBox="0 0 24 24"><ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v6c0 1.7 3.6 3 8 3s8-1.3 8-3V5M4 11v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6"/></svg></span><span class="nav-label">Ведение базы</span>
        </button>
        <div class="dropdown"><a href="entry.html">Введение нового заказа</a><a href="annual-plan.html">Формирование Годового плана</a><a href="plan-a.html">Формирование Плана А</a><a href="plan-b.html">Изменение / Формирование Плана Б</a></div>
      </div>
      <div class="nav-item current" data-menu="1">
        <button class="nav-button" data-href="">
          <span class="nav-icon nav-icon-orders" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M7 4h10v3h3v14H4V7h3V4Z"/><path d="M8 11h8M8 15h8"/></svg></span><span class="nav-label">Просмотр по заказам</span>
        </button>
        <div class="dropdown"><a href="orders.html?view=portfolio">Портфель заказов</a><a href="orders.html?view=annual">Годовой план</a><a href="orders.html?view=archive">Архив работ</a><a href="products.html?view=products">Изделия</a></div>
      </div>
      <div class="nav-item current" data-menu="2">
        <button class="nav-button" data-href="">
          <span class="nav-icon nav-icon-products" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="m12 3 8 4.5v9L12 21l-8-4.5v-9L12 3Z"/><path d="m4 7.5 8 4.5 8-4.5M12 12v9"/></svg></span><span class="nav-label">Просмотр по изделиям</span>
        </button>
        <div class="dropdown"><a href="orders.html?view=portfolio">Портфель заказов</a><a href="orders.html?view=annual">Годовой план</a><a href="products.html?view=plan-a">План А</a><a href="orders.html?view=archive">Архив работ</a><a href="products.html?view=products">Изделия</a><a href="processes.html">Полный просмотр</a></div>
      </div>
      <div class="nav-item " data-menu="8">
        <button class="nav-button" data-href="settings.html">
          <span class="nav-icon nav-icon-settings" aria-hidden="true"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2"/></svg></span><span class="nav-label">Настройка...</span>
        </button>

      </div>
      <div class="nav-item " data-menu="3">
        <button class="nav-button" data-href="standards.html">
          <span class="nav-icon nav-icon-clock" aria-hidden="true"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 7v6l4 2"/></svg></span><span class="nav-label">Нормирование</span>
        </button>

      </div>
      <div class="nav-item " data-menu="4">
        <button class="nav-button" data-href="form2.html">
          <span class="nav-icon nav-icon-alert" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M12 3 2.8 20h18.4L12 3Z"/><path d="M12 9v5M12 17h.01"/></svg></span><span class="nav-label">Отклонения плана</span>
        </button>

      </div>
      <div class="nav-item " data-menu="5">
        <button class="nav-button" data-href="production.html">
          <span class="nav-icon nav-icon-production" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M3 21V10l6 3V9l6 4V5h6v16H3Z"/><path d="M7 17h2M13 17h2M18 9h3"/></svg></span><span class="nav-label">Производство</span>
        </button>

      </div>
      <div class="nav-item " data-menu="6">
        <button class="nav-button" data-href="cam.html">
          <span class="nav-icon nav-icon-import" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M12 3v12M7 10l5 5 5-5M4 20h16"/></svg></span><span class="nav-label">Импорт NX CAM</span>
        </button>

      </div>
      <div class="nav-item " data-menu="7">
        <button class="nav-button" data-href="">
          <span class="nav-icon nav-icon-report" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M4 20V10h4v10M10 20V4h4v16M16 20v-7h4v7M3 20h18"/></svg></span><span class="nav-label">Отчёт</span>
        </button>
        <div class="dropdown"><a href="reports.html?report=plan-a">План А для технологов</a><a href="reports.html?report=plan-b">План Б для ПДБ</a><a href="reports.html?report=standards">Нормирование и отклонения Плана Б</a><a href="reports.html?report=balance">Остатки работ Плана Б</a><a href="reports.html?report=production">Производство заказа</a></div>
      </div>
      <div class="nav-item " data-menu="9">
        <button class="nav-button" data-href="help.html">
          <span class="nav-icon nav-icon-help" aria-hidden="true"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.7 2.7 0 1 1 4.1 2.3c-1 .6-1.6 1.1-1.6 2.2M12 17h.01"/></svg></span><span class="nav-label">Помощь</span>
        </button>

      </div>
      <div class="nav-item " data-menu="10">
        <button class="nav-button" data-href="admin.html">
          <span class="nav-icon nav-icon-admin" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M12 3 20 6v5c0 5-3.4 8.3-8 10-4.6-1.7-8-5-8-10V6l8-3Z"/><path d="M9 12l2 2 4-4"/></svg></span><span class="nav-label">Администрирование</span>
        </button>

      </div></nav>
        <div class="sidebar-product">Система ТПП</div>
      </aside>
      <section class="main-area">
        <header class="topbar niiar-topbar">
          <div><p class="eyebrow">Автоматизированная система ТПП</p><h1>Просмотр портфеля заказов</h1></div>
          <div class="user-panel">
            <div class="user-avatar">AD</div>
            <div class="user-meta"><strong>Администратор системы</strong></div>
            <button class="logout-button" id="logout-button">Выйти</button>
          </div>
        </header>
        <main class="workspace">
    <div class="page">

    <div class="toolbar">
      <button class="tool-button" data-action="export-current">💾 Сохранить в Excel...</button>
      <button class="tool-button" data-go="settings.html">🔑 Настройка...</button>
      <button class="tool-button" data-go="index.html">⬅ Перейти назад</button>
    </div>

      <div class="toolbar">
        <button class="btn" data-action="edit-order">Изменить изделие</button>
        <button class="btn">Фильтровать...</button>
        <label style="margin-left:12px">
          Поиск заказа № <input id="order-search" style="width:75px">
        </label>
        <button class="btn" data-action="reset-search">Все</button>
      </div>

    <div class="table-wrap">
      <table class="data-grid">
        <thead>
          <tr><th>Заказ</th><th>№</th><th>Объект</th><th>Наименование</th><th>Чертеж</th><th>Кол. черт.</th><th>Год пл.</th><th>Квартал пл.</th><th>Колич. изд.</th><th>Стадия</th><th>Приоритет</th><th>№ заявки</th><th>Д. заявки</th><th>Д. ввода</th><th>Примечание</th><th>Материалы</th><th>Окончание</th><th>Шифр затрат</th><th>Тр. предпол. на изделие</th><th>Тр. Сум. планируемой</th><th>Тр. Сум. фактической</th><th>Дата изготовления</th><th>Накладная</th><th>№ группы</th><th>№ исполнителя</th></tr>
        </thead>
        <tbody>

            <tr class="selected" data-order="1256">
              <td>1256</td><td>1</td><td>ОРМ</td><td>патрон станка</td><td>7002</td><td>1</td><td>2008</td><td>1</td><td>2</td><td>План Б</td><td>2</td><td>55-07/215</td><td>24.03.2008</td><td>27.03.2008</td><td></td><td>70%</td><td>В работе</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td>
            </tr>
            <tr class="" data-order="1353">
              <td>1353</td><td>1</td><td>РИК</td><td>КОНТЕЙНЕР ТРАНС.ЗАЩИТНЫЙ</td><td>1Ж.6867.000.00СБ</td><td>1</td><td>2008</td><td>3</td><td>1</td><td>План Б</td><td>2</td><td>44-69/1095</td><td>15.08.2008</td><td>21.08.2008</td><td></td><td>80%</td><td>В работе</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td>
            </tr>
            <tr class="" data-order="1587">
              <td>1587</td><td>1</td><td>ХТО</td><td>КОНТЕЙНЕР</td><td>9Б.3021.000.00</td><td>1</td><td>2014</td><td>1</td><td>1</td><td>План А</td><td>2</td><td>25-16/1395</td><td>15.11.2013</td><td>21.11.2013</td><td></td><td>50%</td><td>В работе</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td>
            </tr>
            <tr class="" data-order="1587">
              <td>1587</td><td>2</td><td>ХТО</td><td>САДКА</td><td>9Б.3021.200.00</td><td>1</td><td>2014</td><td>1</td><td>1</td><td>План А</td><td>2</td><td>25-16/1395</td><td>15.11.2013</td><td>21.11.2013</td><td></td><td>50%</td><td>В работе</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td>
            </tr>
            <tr class="" data-order="1692">
              <td>1692</td><td>1</td><td>ОРМ</td><td>СЛИВНОЕ УСТ-ВО</td><td>Б.396-0-00</td><td>1</td><td>2010</td><td>3</td><td>5</td><td>План Б</td><td>2</td><td>55-15/709</td><td>26.10.2009</td><td>28.10.2009</td><td></td><td>90%</td><td>В работе</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td>
            </tr>
            <tr class="" data-order="2136">
              <td>2136</td><td>1</td><td>ВК-50</td><td>ЗАГЛУШКА</td><td>1МТ.4823.110.00</td><td>1</td><td>2010</td><td>4</td><td>1</td><td>План Б</td><td>1</td><td>58-12/338</td><td>22.11.2010</td><td>25.11.2010</td><td></td><td>100%</td><td>В работе</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td>
            </tr>
            <tr class="" data-order="3219">
              <td>3219</td><td>1</td><td>РИК</td><td>КАНАЛ ЯЧ.3-10</td><td>1Б.3481.000.00-01</td><td>1</td><td>2015</td><td>1</td><td>1</td><td>План А</td><td>2</td><td>ГОДОВАЯ 2015</td><td>05.11.2014</td><td>05.11.2014</td><td></td><td>0%</td><td>В работе</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td>
            </tr>
            <tr class="" data-order="3600">
              <td>3600</td><td>6</td><td>ОРМ</td><td>ВИНТ</td><td>Л54.150.01.054</td><td>1</td><td>2016</td><td>1</td><td>400</td><td>План Б</td><td>2</td><td>55-15/230</td><td>29.02.2016</td><td>03.03.2016</td><td></td><td>100%</td><td>В работе</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td>
            </tr>
            <tr class="" data-order="3698">
              <td>3698</td><td>1</td><td>РИК</td><td>ГОЛОВКА</td><td>5ТО.271.000.01</td><td>1</td><td>2016</td><td>2</td><td>3</td><td>План Б</td><td>4</td><td>ГОДОВАЯ 2016</td><td>20.06.2016</td><td>20.06.2016</td><td></td><td>80%</td><td>В работе</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td>
            </tr>
            <tr class="" data-order="4985">
              <td>4985</td><td>2</td><td>РИК</td><td>Штанга шариковая</td><td>1Ж.09493.00.00</td><td>1</td><td>2021</td><td>2</td><td>1</td><td>План А</td><td>2</td><td>заявка 2кв.2021</td><td>24.02.2021</td><td>24.02.2021</td><td></td><td>0%</td><td>В работе</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td>
            </tr>
            <tr class="" data-order="5200">
              <td>5200</td><td>13</td><td>ОЭС</td><td>Сухарь для люнета</td><td>эскиз</td><td>1</td><td>2021</td><td>4</td><td>3</td><td>План А</td><td>2</td><td>б/н</td><td>20.10.2021</td><td>20.10.2021</td><td></td><td>0%</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td>
            </tr>
            <tr class="" data-order="5427">
              <td>5427</td><td>1</td><td>РИК</td><td>ВИНТ</td><td>МИР.М1.03.013</td><td>1</td><td>2024</td><td>3</td><td>3</td><td>План А</td><td>3</td><td>3кв.2024</td><td>30.05.2023</td><td>30.05.2023</td><td></td><td>0%</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td>
            </tr>
        </tbody>
      </table>
    </div>
      <section id="selected-record-panel" class="record-table-panel portfolio-items">
        <header class="record-panel-heading">
          <div>
            <span>Состав выбранного заказа</span>
            <h2 id="portfolio-items-title">Изделия заказа №1256</h2>
          </div>
          <strong id="portfolio-items-count">2 ед.</strong>
        </header>
        <div class="record-table-wrap">
          <table class="record-detail-table">
            <thead>
              <tr>
                <th>№</th><th>Название изделия</th><th>Чертеж</th><th>Объект</th>
                <th>Кол. чертежей</th><th>Кол. изделий</th><th>Материалы</th><th>Стадия</th>
                <th>Шифр затрат</th><th>Приоритет</th><th>Д.н. ТБ</th><th>Д.к. ТБ</th>
                <th>Д.н. БИХ</th><th>Д.к. БИХ</th><th>Д.н. нормирования</th><th>Д.к. нормирования</th>
                <th>Д.н. комплектации</th><th>Д.к. комплектации</th><th>Д.н. ПО</th><th>Д.к. ПО</th>
                <th>Д.н. производства</th><th>Д.к. производства</th>
              </tr>
            </thead>
            <tbody id="portfolio-items-body">
              <tr>
                <td>1</td><td>патрон станка</td><td>7002</td><td>ОРМ</td><td>1</td><td>2</td>
                <td>70%</td><td>План Б</td><td></td><td>2 - плановый</td><td>27.03.2008</td><td></td>
                <td></td><td></td><td></td><td></td><td>04.02.2016</td><td>17.05.2016</td>
                <td>17.05.2016</td><td>25.05.2016</td><td>25.05.2016</td><td></td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div></main>
      </section>
    </section>`,
  "plan-a": `<section class="app-shell niiar-shell">
      <aside class="sidebar niiar-sidebar">
        <a class="release-brand" href="index.html">
          <img class="rosatom-logo" src="assets/rosatom-logo.svg" alt="Росатом">
        </a>
        <p class="nav-caption">Разделы программы</p>
        <nav class="side-nav familiar-nav">
      <div class="nav-item current" data-menu="0">
        <button class="nav-button" data-href="">
          <span class="nav-icon nav-icon-database" aria-hidden="true"><svg viewBox="0 0 24 24"><ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v6c0 1.7 3.6 3 8 3s8-1.3 8-3V5M4 11v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6"/></svg></span><span class="nav-label">Ведение базы</span>
        </button>
        <div class="dropdown"><a href="entry.html">Введение нового заказа</a><a href="annual-plan.html">Формирование Годового плана</a><a href="plan-a.html">Формирование Плана А</a><a href="plan-b.html">Изменение / Формирование Плана Б</a></div>
      </div>
      <div class="nav-item " data-menu="1">
        <button class="nav-button" data-href="">
          <span class="nav-icon nav-icon-orders" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M7 4h10v3h3v14H4V7h3V4Z"/><path d="M8 11h8M8 15h8"/></svg></span><span class="nav-label">Просмотр по заказам</span>
        </button>
        <div class="dropdown"><a href="orders.html?view=portfolio">Портфель заказов</a><a href="orders.html?view=annual">Годовой план</a><a href="orders.html?view=archive">Архив работ</a><a href="products.html?view=products">Изделия</a></div>
      </div>
      <div class="nav-item " data-menu="2">
        <button class="nav-button" data-href="">
          <span class="nav-icon nav-icon-products" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="m12 3 8 4.5v9L12 21l-8-4.5v-9L12 3Z"/><path d="m4 7.5 8 4.5 8-4.5M12 12v9"/></svg></span><span class="nav-label">Просмотр по изделиям</span>
        </button>
        <div class="dropdown"><a href="orders.html?view=portfolio">Портфель заказов</a><a href="orders.html?view=annual">Годовой план</a><a href="products.html?view=plan-a">План А</a><a href="orders.html?view=archive">Архив работ</a><a href="products.html?view=products">Изделия</a><a href="processes.html">Полный просмотр</a></div>
      </div>
      <div class="nav-item " data-menu="8">
        <button class="nav-button" data-href="settings.html">
          <span class="nav-icon nav-icon-settings" aria-hidden="true"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2"/></svg></span><span class="nav-label">Настройка...</span>
        </button>

      </div>
      <div class="nav-item " data-menu="3">
        <button class="nav-button" data-href="standards.html">
          <span class="nav-icon nav-icon-clock" aria-hidden="true"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 7v6l4 2"/></svg></span><span class="nav-label">Нормирование</span>
        </button>

      </div>
      <div class="nav-item " data-menu="4">
        <button class="nav-button" data-href="form2.html">
          <span class="nav-icon nav-icon-alert" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M12 3 2.8 20h18.4L12 3Z"/><path d="M12 9v5M12 17h.01"/></svg></span><span class="nav-label">Отклонения плана</span>
        </button>

      </div>
      <div class="nav-item " data-menu="5">
        <button class="nav-button" data-href="production.html">
          <span class="nav-icon nav-icon-production" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M3 21V10l6 3V9l6 4V5h6v16H3Z"/><path d="M7 17h2M13 17h2M18 9h3"/></svg></span><span class="nav-label">Производство</span>
        </button>

      </div>
      <div class="nav-item " data-menu="6">
        <button class="nav-button" data-href="cam.html">
          <span class="nav-icon nav-icon-import" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M12 3v12M7 10l5 5 5-5M4 20h16"/></svg></span><span class="nav-label">Импорт NX CAM</span>
        </button>

      </div>
      <div class="nav-item " data-menu="7">
        <button class="nav-button" data-href="">
          <span class="nav-icon nav-icon-report" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M4 20V10h4v10M10 20V4h4v16M16 20v-7h4v7M3 20h18"/></svg></span><span class="nav-label">Отчёт</span>
        </button>
        <div class="dropdown"><a href="reports.html?report=plan-a">План А для технологов</a><a href="reports.html?report=plan-b">План Б для ПДБ</a><a href="reports.html?report=standards">Нормирование и отклонения Плана Б</a><a href="reports.html?report=balance">Остатки работ Плана Б</a><a href="reports.html?report=production">Производство заказа</a></div>
      </div>
      <div class="nav-item " data-menu="9">
        <button class="nav-button" data-href="help.html">
          <span class="nav-icon nav-icon-help" aria-hidden="true"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.7 2.7 0 1 1 4.1 2.3c-1 .6-1.6 1.1-1.6 2.2M12 17h.01"/></svg></span><span class="nav-label">Помощь</span>
        </button>

      </div>
      <div class="nav-item " data-menu="10">
        <button class="nav-button" data-href="admin.html">
          <span class="nav-icon nav-icon-admin" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M12 3 20 6v5c0 5-3.4 8.3-8 10-4.6-1.7-8-5-8-10V6l8-3Z"/><path d="M9 12l2 2 4-4"/></svg></span><span class="nav-label">Администрирование</span>
        </button>

      </div></nav>
        <div class="sidebar-product">Система ТПП</div>
      </aside>
      <section class="main-area">
        <header class="topbar niiar-topbar">
          <div><p class="eyebrow">Автоматизированная система ТПП</p><h1>Формирование Плана А</h1></div>
          <div class="user-panel">
            <div class="user-avatar">AD</div>
            <div class="user-meta"><strong>Администратор системы</strong></div>
            <button class="logout-button" id="logout-button">Выйти</button>
          </div>
        </header>
        <main class="workspace">
    <div class="planning-page plan-a-page">
      <section class="double-plan-tables">
        <div class="planning-table-card"><header>Формируемый План А</header><div class="planning-table-wrap"><table><thead><tr><th>Заказ</th><th>№</th><th>Стадия</th><th>Дата ввода</th><th>Квартал</th><th>Год</th><th>Приоритет</th><th>Материалы</th></tr></thead><tbody><tr class="selected"><td>1587</td><td>1</td><td>А</td><td>21.11.2013</td><td>1</td><td>2014</td><td>2</td><td>50</td></tr><tr><td>3219</td><td>1</td><td>А</td><td>05.11.2014</td><td>1</td><td>2015</td><td>2</td><td>0</td></tr><tr><td>3837</td><td>2</td><td>А</td><td>08.12.2016</td><td>4</td><td>2016</td><td>1</td><td>0</td></tr></tbody></table></div></div>
        <div class="planning-table-card"><label class="table-filter"><input type="checkbox"> Только не вошедшие в план</label><div class="planning-table-wrap"><table><thead><tr><th>Заказ</th><th>№</th><th>Объект</th><th>Наименование</th><th>Чертёж</th><th>Кол. изделий</th><th>Стадия</th><th>Приоритет</th><th>№ заявки</th><th>Дата ввода</th></tr></thead><tbody><tr><td>4985</td><td>2</td><td>РИК</td><td>Штанга шариковая</td><td>1Ж.09493.00.00</td><td>1</td><td>А</td><td>2</td><td>заявка 2 кв. 2021</td><td>24.02.2021</td></tr><tr><td>5200</td><td>13</td><td>ОЭС</td><td>Сухарь для люнета</td><td>эскиз</td><td>3</td><td>А</td><td>2</td><td>б/н</td><td>20.10.2021</td></tr></tbody></table></div></div>
      </section>
      <aside class="planning-controls">
        <button class="primary-button" data-action="plan-preview">Предварительное формирование</button><button class="ghost-button" data-action="plan-clear">Очистить</button>
        <fieldset><legend>Период</legend><label>Год <select><option>2026</option></select></label><label>Квартал <select><option>1 квартал</option><option>2 квартал</option><option>3 квартал</option><option>4 квартал</option></select></label><label>Количество часов <input type="number"></label></fieldset>
        <fieldset><legend>Технологическое бюро</legend><label>Количество чертежей <input value="4"></label><label>Количество н.ч. <input value="128"></label><label>Численность ТБ <input value="4"></label><label>Трудоёмкость тех. пр. <input value="1"></label><label>Загрузка <input value="78%"></label></fieldset>
        <div class="planning-controls-spacer"></div><button class="primary-button" data-action="plan-approve">Утвердить</button><button class="ghost-button" data-go="index.html">Отмена</button>
      </aside>
    </div>
  </main>
      </section>
    </section>`,
  "plan-b": `<section class="app-shell niiar-shell">
      <aside class="sidebar niiar-sidebar">
        <a class="release-brand" href="index.html">
          <img class="rosatom-logo" src="assets/rosatom-logo.svg" alt="Росатом">
        </a>
        <p class="nav-caption">Разделы программы</p>
        <nav class="side-nav familiar-nav">
      <div class="nav-item current" data-menu="0">
        <button class="nav-button" data-href="">
          <span class="nav-icon nav-icon-database" aria-hidden="true"><svg viewBox="0 0 24 24"><ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v6c0 1.7 3.6 3 8 3s8-1.3 8-3V5M4 11v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6"/></svg></span><span class="nav-label">Ведение базы</span>
        </button>
        <div class="dropdown"><a href="entry.html">Введение нового заказа</a><a href="annual-plan.html">Формирование Годового плана</a><a href="plan-a.html">Формирование Плана А</a><a href="plan-b.html">Изменение / Формирование Плана Б</a></div>
      </div>
      <div class="nav-item " data-menu="1">
        <button class="nav-button" data-href="">
          <span class="nav-icon nav-icon-orders" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M7 4h10v3h3v14H4V7h3V4Z"/><path d="M8 11h8M8 15h8"/></svg></span><span class="nav-label">Просмотр по заказам</span>
        </button>
        <div class="dropdown"><a href="orders.html?view=portfolio">Портфель заказов</a><a href="orders.html?view=annual">Годовой план</a><a href="orders.html?view=archive">Архив работ</a><a href="products.html?view=products">Изделия</a></div>
      </div>
      <div class="nav-item " data-menu="2">
        <button class="nav-button" data-href="">
          <span class="nav-icon nav-icon-products" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="m12 3 8 4.5v9L12 21l-8-4.5v-9L12 3Z"/><path d="m4 7.5 8 4.5 8-4.5M12 12v9"/></svg></span><span class="nav-label">Просмотр по изделиям</span>
        </button>
        <div class="dropdown"><a href="orders.html?view=portfolio">Портфель заказов</a><a href="orders.html?view=annual">Годовой план</a><a href="products.html?view=plan-a">План А</a><a href="orders.html?view=archive">Архив работ</a><a href="products.html?view=products">Изделия</a><a href="processes.html">Полный просмотр</a></div>
      </div>
      <div class="nav-item " data-menu="8">
        <button class="nav-button" data-href="settings.html">
          <span class="nav-icon nav-icon-settings" aria-hidden="true"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2"/></svg></span><span class="nav-label">Настройка...</span>
        </button>

      </div>
      <div class="nav-item " data-menu="3">
        <button class="nav-button" data-href="standards.html">
          <span class="nav-icon nav-icon-clock" aria-hidden="true"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 7v6l4 2"/></svg></span><span class="nav-label">Нормирование</span>
        </button>

      </div>
      <div class="nav-item " data-menu="4">
        <button class="nav-button" data-href="form2.html">
          <span class="nav-icon nav-icon-alert" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M12 3 2.8 20h18.4L12 3Z"/><path d="M12 9v5M12 17h.01"/></svg></span><span class="nav-label">Отклонения плана</span>
        </button>

      </div>
      <div class="nav-item " data-menu="5">
        <button class="nav-button" data-href="production.html">
          <span class="nav-icon nav-icon-production" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M3 21V10l6 3V9l6 4V5h6v16H3Z"/><path d="M7 17h2M13 17h2M18 9h3"/></svg></span><span class="nav-label">Производство</span>
        </button>

      </div>
      <div class="nav-item " data-menu="6">
        <button class="nav-button" data-href="cam.html">
          <span class="nav-icon nav-icon-import" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M12 3v12M7 10l5 5 5-5M4 20h16"/></svg></span><span class="nav-label">Импорт NX CAM</span>
        </button>

      </div>
      <div class="nav-item " data-menu="7">
        <button class="nav-button" data-href="">
          <span class="nav-icon nav-icon-report" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M4 20V10h4v10M10 20V4h4v16M16 20v-7h4v7M3 20h18"/></svg></span><span class="nav-label">Отчёт</span>
        </button>
        <div class="dropdown"><a href="reports.html?report=plan-a">План А для технологов</a><a href="reports.html?report=plan-b">План Б для ПДБ</a><a href="reports.html?report=standards">Нормирование и отклонения Плана Б</a><a href="reports.html?report=balance">Остатки работ Плана Б</a><a href="reports.html?report=production">Производство заказа</a></div>
      </div>
      <div class="nav-item " data-menu="9">
        <button class="nav-button" data-href="help.html">
          <span class="nav-icon nav-icon-help" aria-hidden="true"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.7 2.7 0 1 1 4.1 2.3c-1 .6-1.6 1.1-1.6 2.2M12 17h.01"/></svg></span><span class="nav-label">Помощь</span>
        </button>

      </div>
      <div class="nav-item " data-menu="10">
        <button class="nav-button" data-href="admin.html">
          <span class="nav-icon nav-icon-admin" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M12 3 20 6v5c0 5-3.4 8.3-8 10-4.6-1.7-8-5-8-10V6l8-3Z"/><path d="M9 12l2 2 4-4"/></svg></span><span class="nav-label">Администрирование</span>
        </button>

      </div></nav>
        <div class="sidebar-product">Система ТПП</div>
      </aside>
      <section class="main-area">
        <header class="topbar niiar-topbar">
          <div><p class="eyebrow">Автоматизированная система ТПП</p><h1>Формирование Плана Б</h1></div>
          <div class="user-panel">
            <div class="user-avatar">AD</div>
            <div class="user-meta"><strong>Администратор системы</strong></div>
            <button class="logout-button" id="logout-button">Выйти</button>
          </div>
        </header>
        <main class="workspace">
    <div class="plan-b-workspace">
      <header><h2>Формирование Плана Б</h2><div><button class="primary-button" data-action="plan-preview">Планирование</button><button class="ghost-button" data-action="plan-approve">Создать План Б на новый квартал</button></div></header>
      <section class="planning-table-card"><header>Сводная таблица по остаткам нормо-часов</header><div class="planning-table-wrap"><table><thead><tr><th>Заказ</th><th>Объект</th><th>Заготовительные</th><th>Пресс</th><th>Модельные</th><th>Газорезные</th><th>Кузнечные</th><th>Токарные</th><th>Ток. карусельные</th></tr></thead><tbody><tr class="selected"><td>1256</td><td>ОРМ</td><td>0</td><td>0</td><td>6</td><td>0</td><td>0</td><td>14,42</td><td>0</td></tr><tr><td>1353</td><td>РИК</td><td>14,94</td><td>0</td><td>0</td><td>0</td><td>10,4</td><td>108,05</td><td>0</td></tr><tr><td>1692</td><td>ОРМ</td><td>1,15</td><td>2,75</td><td>9,5</td><td>0</td><td>0</td><td>36,8</td><td>0</td></tr><tr><td>1774</td><td>РИК</td><td>4,14</td><td>0,2</td><td>9</td><td>0</td><td>0</td><td>57,95</td><td>0</td></tr></tbody></table></div></section>
      <section class="planning-table-card"><header>Суммы по работам на квартал с расчётом превышения</header><div class="planning-table-wrap"><table><thead><tr><th>Заготовительные</th><th>Пресс</th><th>Модельные</th><th>Газорезные</th><th>Кузнечные</th><th>Токарные</th><th>Ток. карусельные</th></tr></thead><tbody><tr><td>386,40</td><td>59,10</td><td>104,00</td><td>0</td><td>224,80</td><td>812,70</td><td>108,05</td></tr></tbody></table></div></section>
    </div>
  </main>
      </section>
    </section>`,
  "processes": `<section class="app-shell niiar-shell">
      <aside class="sidebar niiar-sidebar">
        <a class="release-brand" href="index.html">
          <img class="rosatom-logo" src="assets/rosatom-logo.svg" alt="Росатом">
        </a>
        <p class="nav-caption">Разделы программы</p>
        <nav class="side-nav familiar-nav">
      <div class="nav-item " data-menu="0">
        <button class="nav-button" data-href="">
          <span class="nav-icon nav-icon-database" aria-hidden="true"><svg viewBox="0 0 24 24"><ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v6c0 1.7 3.6 3 8 3s8-1.3 8-3V5M4 11v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6"/></svg></span><span class="nav-label">Ведение базы</span>
        </button>
        <div class="dropdown"><a href="entry.html">Введение нового заказа</a><a href="annual-plan.html">Формирование Годового плана</a><a href="plan-a.html">Формирование Плана А</a><a href="plan-b.html">Изменение / Формирование Плана Б</a></div>
      </div>
      <div class="nav-item " data-menu="1">
        <button class="nav-button" data-href="">
          <span class="nav-icon nav-icon-orders" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M7 4h10v3h3v14H4V7h3V4Z"/><path d="M8 11h8M8 15h8"/></svg></span><span class="nav-label">Просмотр по заказам</span>
        </button>
        <div class="dropdown"><a href="orders.html?view=portfolio">Портфель заказов</a><a href="orders.html?view=annual">Годовой план</a><a href="orders.html?view=archive">Архив работ</a><a href="products.html?view=products">Изделия</a></div>
      </div>
      <div class="nav-item current" data-menu="2">
        <button class="nav-button" data-href="">
          <span class="nav-icon nav-icon-products" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="m12 3 8 4.5v9L12 21l-8-4.5v-9L12 3Z"/><path d="m4 7.5 8 4.5 8-4.5M12 12v9"/></svg></span><span class="nav-label">Просмотр по изделиям</span>
        </button>
        <div class="dropdown"><a href="orders.html?view=portfolio">Портфель заказов</a><a href="orders.html?view=annual">Годовой план</a><a href="products.html?view=plan-a">План А</a><a href="orders.html?view=archive">Архив работ</a><a href="products.html?view=products">Изделия</a><a href="processes.html">Полный просмотр</a></div>
      </div>
      <div class="nav-item " data-menu="8">
        <button class="nav-button" data-href="settings.html">
          <span class="nav-icon nav-icon-settings" aria-hidden="true"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2"/></svg></span><span class="nav-label">Настройка...</span>
        </button>

      </div>
      <div class="nav-item " data-menu="3">
        <button class="nav-button" data-href="standards.html">
          <span class="nav-icon nav-icon-clock" aria-hidden="true"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 7v6l4 2"/></svg></span><span class="nav-label">Нормирование</span>
        </button>

      </div>
      <div class="nav-item " data-menu="4">
        <button class="nav-button" data-href="form2.html">
          <span class="nav-icon nav-icon-alert" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M12 3 2.8 20h18.4L12 3Z"/><path d="M12 9v5M12 17h.01"/></svg></span><span class="nav-label">Отклонения плана</span>
        </button>

      </div>
      <div class="nav-item " data-menu="5">
        <button class="nav-button" data-href="production.html">
          <span class="nav-icon nav-icon-production" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M3 21V10l6 3V9l6 4V5h6v16H3Z"/><path d="M7 17h2M13 17h2M18 9h3"/></svg></span><span class="nav-label">Производство</span>
        </button>

      </div>
      <div class="nav-item " data-menu="6">
        <button class="nav-button" data-href="cam.html">
          <span class="nav-icon nav-icon-import" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M12 3v12M7 10l5 5 5-5M4 20h16"/></svg></span><span class="nav-label">Импорт NX CAM</span>
        </button>

      </div>
      <div class="nav-item " data-menu="7">
        <button class="nav-button" data-href="">
          <span class="nav-icon nav-icon-report" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M4 20V10h4v10M10 20V4h4v16M16 20v-7h4v7M3 20h18"/></svg></span><span class="nav-label">Отчёт</span>
        </button>
        <div class="dropdown"><a href="reports.html?report=plan-a">План А для технологов</a><a href="reports.html?report=plan-b">План Б для ПДБ</a><a href="reports.html?report=standards">Нормирование и отклонения Плана Б</a><a href="reports.html?report=balance">Остатки работ Плана Б</a><a href="reports.html?report=production">Производство заказа</a></div>
      </div>
      <div class="nav-item " data-menu="9">
        <button class="nav-button" data-href="help.html">
          <span class="nav-icon nav-icon-help" aria-hidden="true"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.7 2.7 0 1 1 4.1 2.3c-1 .6-1.6 1.1-1.6 2.2M12 17h.01"/></svg></span><span class="nav-label">Помощь</span>
        </button>

      </div>
      <div class="nav-item " data-menu="10">
        <button class="nav-button" data-href="admin.html">
          <span class="nav-icon nav-icon-admin" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M12 3 20 6v5c0 5-3.4 8.3-8 10-4.6-1.7-8-5-8-10V6l8-3Z"/><path d="M9 12l2 2 4-4"/></svg></span><span class="nav-label">Администрирование</span>
        </button>

      </div></nav>
        <div class="sidebar-product">Система ТПП</div>
      </aside>
      <section class="main-area">
        <header class="topbar niiar-topbar">
          <div><p class="eyebrow">Автоматизированная система ТПП</p><h1>Технологические процессы</h1></div>
          <div class="user-panel">
            <div class="user-avatar">AD</div>
            <div class="user-meta"><strong>Администратор системы</strong></div>
            <button class="logout-button" id="logout-button">Выйти</button>
          </div>
        </header>
        <main class="workspace">
    <div class="modern-page">

    <section class="page-intro">
      <div><span class="eyebrow">Проектирование ТП</span><h2>Технологические процессы</h2><p>Создание процессов на основе типовых и групповых решений с автоматическим выпуском документов ЕСТД.</p></div>
      <button class="primary-button" data-action="new-process">＋ Новый техпроцесс</button>
    </section>

      <section class="content-card recent-processes">
        <div class="card-heading"><div><span class="eyebrow">Последние изменения</span><h3>Технологические процессы</h3></div><div class="row-actions"><button class="ghost-button" data-action="approve-process">Утвердить и подписать</button><button class="ghost-button" data-action="edit-process">Изменить</button><button class="ghost-button danger" data-action="delete-process">Удалить</button></div></div>
        <div class="modern-table-wrap">
          <table class="modern-table">
            <thead><tr><th>Код ТП</th><th>Изделие</th><th>Вид работ</th><th>Версия</th><th>Состояние</th><th>Дата изменения</th></tr></thead>
            <tbody>
              <tr data-process="ТП-5427-03"><td>ТП-5427-03</td><td>Винт МИР.М1.03.013</td><td>Механообработка</td><td>v4</td><td><span class="status-pill">Утвержден</span></td><td>22.08.2026</td></tr><tr data-process="ТП-5200-16"><td>ТП-5200-16</td><td>Кольцо уплотнительное</td><td>Токарная</td><td>v2</td><td><span class="status-pill">На согласовании</span></td><td>22.08.2026</td></tr><tr data-process="ТП-4985-02"><td>ТП-4985-02</td><td>Штанга шариковая</td><td>Сборка</td><td>v7</td><td><span class="status-pill">Черновик</span></td><td>22.08.2026</td></tr>
            </tbody>
          </table>
        </div>
      </section>
    </div></main>
      </section>
    </section>`,
  "production": `<section class="app-shell niiar-shell">
      <aside class="sidebar niiar-sidebar">
        <a class="release-brand" href="index.html">
          <img class="rosatom-logo" src="assets/rosatom-logo.svg" alt="Росатом">
        </a>
        <p class="nav-caption">Разделы программы</p>
        <nav class="side-nav familiar-nav">
      <div class="nav-item " data-menu="0">
        <button class="nav-button" data-href="">
          <span class="nav-icon nav-icon-database" aria-hidden="true"><svg viewBox="0 0 24 24"><ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v6c0 1.7 3.6 3 8 3s8-1.3 8-3V5M4 11v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6"/></svg></span><span class="nav-label">Ведение базы</span>
        </button>
        <div class="dropdown"><a href="entry.html">Введение нового заказа</a><a href="annual-plan.html">Формирование Годового плана</a><a href="plan-a.html">Формирование Плана А</a><a href="plan-b.html">Изменение / Формирование Плана Б</a></div>
      </div>
      <div class="nav-item " data-menu="1">
        <button class="nav-button" data-href="">
          <span class="nav-icon nav-icon-orders" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M7 4h10v3h3v14H4V7h3V4Z"/><path d="M8 11h8M8 15h8"/></svg></span><span class="nav-label">Просмотр по заказам</span>
        </button>
        <div class="dropdown"><a href="orders.html?view=portfolio">Портфель заказов</a><a href="orders.html?view=annual">Годовой план</a><a href="orders.html?view=archive">Архив работ</a><a href="products.html?view=products">Изделия</a></div>
      </div>
      <div class="nav-item " data-menu="2">
        <button class="nav-button" data-href="">
          <span class="nav-icon nav-icon-products" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="m12 3 8 4.5v9L12 21l-8-4.5v-9L12 3Z"/><path d="m4 7.5 8 4.5 8-4.5M12 12v9"/></svg></span><span class="nav-label">Просмотр по изделиям</span>
        </button>
        <div class="dropdown"><a href="orders.html?view=portfolio">Портфель заказов</a><a href="orders.html?view=annual">Годовой план</a><a href="products.html?view=plan-a">План А</a><a href="orders.html?view=archive">Архив работ</a><a href="products.html?view=products">Изделия</a><a href="processes.html">Полный просмотр</a></div>
      </div>
      <div class="nav-item " data-menu="8">
        <button class="nav-button" data-href="settings.html">
          <span class="nav-icon nav-icon-settings" aria-hidden="true"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2"/></svg></span><span class="nav-label">Настройка...</span>
        </button>

      </div>
      <div class="nav-item " data-menu="3">
        <button class="nav-button" data-href="standards.html">
          <span class="nav-icon nav-icon-clock" aria-hidden="true"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 7v6l4 2"/></svg></span><span class="nav-label">Нормирование</span>
        </button>

      </div>
      <div class="nav-item " data-menu="4">
        <button class="nav-button" data-href="form2.html">
          <span class="nav-icon nav-icon-alert" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M12 3 2.8 20h18.4L12 3Z"/><path d="M12 9v5M12 17h.01"/></svg></span><span class="nav-label">Отклонения плана</span>
        </button>

      </div>
      <div class="nav-item current" data-menu="5">
        <button class="nav-button" data-href="production.html">
          <span class="nav-icon nav-icon-production" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M3 21V10l6 3V9l6 4V5h6v16H3Z"/><path d="M7 17h2M13 17h2M18 9h3"/></svg></span><span class="nav-label">Производство</span>
        </button>

      </div>
      <div class="nav-item " data-menu="6">
        <button class="nav-button" data-href="cam.html">
          <span class="nav-icon nav-icon-import" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M12 3v12M7 10l5 5 5-5M4 20h16"/></svg></span><span class="nav-label">Импорт NX CAM</span>
        </button>

      </div>
      <div class="nav-item " data-menu="7">
        <button class="nav-button" data-href="">
          <span class="nav-icon nav-icon-report" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M4 20V10h4v10M10 20V4h4v16M16 20v-7h4v7M3 20h18"/></svg></span><span class="nav-label">Отчёт</span>
        </button>
        <div class="dropdown"><a href="reports.html?report=plan-a">План А для технологов</a><a href="reports.html?report=plan-b">План Б для ПДБ</a><a href="reports.html?report=standards">Нормирование и отклонения Плана Б</a><a href="reports.html?report=balance">Остатки работ Плана Б</a><a href="reports.html?report=production">Производство заказа</a></div>
      </div>
      <div class="nav-item " data-menu="9">
        <button class="nav-button" data-href="help.html">
          <span class="nav-icon nav-icon-help" aria-hidden="true"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.7 2.7 0 1 1 4.1 2.3c-1 .6-1.6 1.1-1.6 2.2M12 17h.01"/></svg></span><span class="nav-label">Помощь</span>
        </button>

      </div>
      <div class="nav-item " data-menu="10">
        <button class="nav-button" data-href="admin.html">
          <span class="nav-icon nav-icon-admin" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M12 3 20 6v5c0 5-3.4 8.3-8 10-4.6-1.7-8-5-8-10V6l8-3Z"/><path d="M9 12l2 2 4-4"/></svg></span><span class="nav-label">Администрирование</span>
        </button>

      </div></nav>
        <div class="sidebar-product">Система ТПП</div>
      </aside>
      <section class="main-area">
        <header class="topbar niiar-topbar">
          <div><p class="eyebrow">Автоматизированная система ТПП</p><h1>Производство</h1></div>
          <div class="user-panel">
            <div class="user-avatar">AD</div>
            <div class="user-meta"><strong>Администратор системы</strong></div>
            <button class="logout-button" id="logout-button">Выйти</button>
          </div>
        </header>
        <main class="workspace">
    <div class="page">

    <div class="toolbar">
      <button class="tool-button" data-action="export-current">💾 Сохранить в Excel...</button>
      <button class="tool-button" data-go="settings.html">🔑 Настройка...</button>
      <button class="tool-button" data-go="index.html">⬅ Перейти назад</button>
    </div>
      <div class="split-view">
        <div class="page">


    <div class="table-wrap">
      <table class="data-grid">
        <thead>
          <tr><th>Заказ</th><th>№</th><th>Объект</th><th>Наименование</th><th>Чертеж</th><th>Кол. черт.</th><th>Год пл.</th><th>Квартал пл.</th><th>Колич. изд.</th><th>Стадия</th><th>Приоритет</th><th>№ заявки</th><th>Д. заявки</th><th>Д. ввода</th><th>Примечание</th><th>Материалы</th><th>Окончание</th><th>Шифр затрат</th><th>Тр. предпол. на изделие</th><th>Тр. Сум. планируемой</th><th>Тр. Сум. фактической</th><th>Дата изготовления</th><th>Накладная</th><th>№ группы</th><th>№ исполнителя</th></tr>
        </thead>
        <tbody>

            <tr class="selected" data-order="1256">
              <td>1256</td><td>1</td><td>ОРМ</td><td>патрон станка</td><td>7002</td><td>1</td><td>2008</td><td>1</td><td>2</td><td>План Б</td><td>2</td><td>55-07/215</td><td>24.03.2008</td><td>27.03.2008</td><td></td><td>70%</td><td>В работе</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td>
            </tr>
            <tr class="" data-order="1353">
              <td>1353</td><td>1</td><td>РИК</td><td>КОНТЕЙНЕР ТРАНС.ЗАЩИТНЫЙ</td><td>1Ж.6867.000.00СБ</td><td>1</td><td>2008</td><td>3</td><td>1</td><td>План Б</td><td>2</td><td>44-69/1095</td><td>15.08.2008</td><td>21.08.2008</td><td></td><td>80%</td><td>В работе</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td>
            </tr>
            <tr class="" data-order="1587">
              <td>1587</td><td>1</td><td>ХТО</td><td>КОНТЕЙНЕР</td><td>9Б.3021.000.00</td><td>1</td><td>2014</td><td>1</td><td>1</td><td>План А</td><td>2</td><td>25-16/1395</td><td>15.11.2013</td><td>21.11.2013</td><td></td><td>50%</td><td>В работе</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td>
            </tr>
            <tr class="" data-order="1587">
              <td>1587</td><td>2</td><td>ХТО</td><td>САДКА</td><td>9Б.3021.200.00</td><td>1</td><td>2014</td><td>1</td><td>1</td><td>План А</td><td>2</td><td>25-16/1395</td><td>15.11.2013</td><td>21.11.2013</td><td></td><td>50%</td><td>В работе</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td>
            </tr>
            <tr class="" data-order="1692">
              <td>1692</td><td>1</td><td>ОРМ</td><td>СЛИВНОЕ УСТ-ВО</td><td>Б.396-0-00</td><td>1</td><td>2010</td><td>3</td><td>5</td><td>План Б</td><td>2</td><td>55-15/709</td><td>26.10.2009</td><td>28.10.2009</td><td></td><td>90%</td><td>В работе</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td>
            </tr>
            <tr class="" data-order="2136">
              <td>2136</td><td>1</td><td>ВК-50</td><td>ЗАГЛУШКА</td><td>1МТ.4823.110.00</td><td>1</td><td>2010</td><td>4</td><td>1</td><td>План Б</td><td>1</td><td>58-12/338</td><td>22.11.2010</td><td>25.11.2010</td><td></td><td>100%</td><td>В работе</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td>
            </tr>
            <tr class="" data-order="3219">
              <td>3219</td><td>1</td><td>РИК</td><td>КАНАЛ ЯЧ.3-10</td><td>1Б.3481.000.00-01</td><td>1</td><td>2015</td><td>1</td><td>1</td><td>План А</td><td>2</td><td>ГОДОВАЯ 2015</td><td>05.11.2014</td><td>05.11.2014</td><td></td><td>0%</td><td>В работе</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td>
            </tr>
            <tr class="" data-order="3600">
              <td>3600</td><td>6</td><td>ОРМ</td><td>ВИНТ</td><td>Л54.150.01.054</td><td>1</td><td>2016</td><td>1</td><td>400</td><td>План Б</td><td>2</td><td>55-15/230</td><td>29.02.2016</td><td>03.03.2016</td><td></td><td>100%</td><td>В работе</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td>
            </tr>
            <tr class="" data-order="3698">
              <td>3698</td><td>1</td><td>РИК</td><td>ГОЛОВКА</td><td>5ТО.271.000.01</td><td>1</td><td>2016</td><td>2</td><td>3</td><td>План Б</td><td>4</td><td>ГОДОВАЯ 2016</td><td>20.06.2016</td><td>20.06.2016</td><td></td><td>80%</td><td>В работе</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td>
            </tr>
            <tr class="" data-order="4985">
              <td>4985</td><td>2</td><td>РИК</td><td>Штанга шариковая</td><td>1Ж.09493.00.00</td><td>1</td><td>2021</td><td>2</td><td>1</td><td>План А</td><td>2</td><td>заявка 2кв.2021</td><td>24.02.2021</td><td>24.02.2021</td><td></td><td>0%</td><td>В работе</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td>
            </tr>
            <tr class="" data-order="5200">
              <td>5200</td><td>13</td><td>ОЭС</td><td>Сухарь для люнета</td><td>эскиз</td><td>1</td><td>2021</td><td>4</td><td>3</td><td>План А</td><td>2</td><td>б/н</td><td>20.10.2021</td><td>20.10.2021</td><td></td><td>0%</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td>
            </tr>
            <tr class="" data-order="5427">
              <td>5427</td><td>1</td><td>РИК</td><td>ВИНТ</td><td>МИР.М1.03.013</td><td>1</td><td>2024</td><td>3</td><td>3</td><td>План А</td><td>3</td><td>3кв.2024</td><td>30.05.2023</td><td>30.05.2023</td><td></td><td>0%</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td>
            </tr>
        </tbody>
      </table>
    </div>
        </div>
        <aside class="side-panel">
          <button class="btn">Все заказы</button>
          <button class="btn">Тех. Бюро</button>
          <button class="btn">БИХ</button>
          <fieldset>
            <legend>Производство</legend>
            Начало <input class="field" type="date" value="2016-05-25"><br><br>
            Окончание <input class="field" type="date"><br><br>
            <button class="btn" data-action="edit-order">Изменить изделие</button>
          </fieldset>
        </aside>
      </div>
    </div></main>
      </section>
    </section>`,
  "products": `<section class="app-shell niiar-shell">
      <aside class="sidebar niiar-sidebar">
        <a class="release-brand" href="index.html">
          <img class="rosatom-logo" src="assets/rosatom-logo.svg" alt="Росатом">
        </a>
        <p class="nav-caption">Разделы программы</p>
        <nav class="side-nav familiar-nav">
      <div class="nav-item " data-menu="0">
        <button class="nav-button" data-href="">
          <span class="nav-icon nav-icon-database" aria-hidden="true"><svg viewBox="0 0 24 24"><ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v6c0 1.7 3.6 3 8 3s8-1.3 8-3V5M4 11v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6"/></svg></span><span class="nav-label">Ведение базы</span>
        </button>
        <div class="dropdown"><a href="entry.html">Введение нового заказа</a><a href="annual-plan.html">Формирование Годового плана</a><a href="plan-a.html">Формирование Плана А</a><a href="plan-b.html">Изменение / Формирование Плана Б</a></div>
      </div>
      <div class="nav-item current" data-menu="1">
        <button class="nav-button" data-href="">
          <span class="nav-icon nav-icon-orders" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M7 4h10v3h3v14H4V7h3V4Z"/><path d="M8 11h8M8 15h8"/></svg></span><span class="nav-label">Просмотр по заказам</span>
        </button>
        <div class="dropdown"><a href="orders.html?view=portfolio">Портфель заказов</a><a href="orders.html?view=annual">Годовой план</a><a href="orders.html?view=archive">Архив работ</a><a href="products.html?view=products">Изделия</a></div>
      </div>
      <div class="nav-item current" data-menu="2">
        <button class="nav-button" data-href="">
          <span class="nav-icon nav-icon-products" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="m12 3 8 4.5v9L12 21l-8-4.5v-9L12 3Z"/><path d="m4 7.5 8 4.5 8-4.5M12 12v9"/></svg></span><span class="nav-label">Просмотр по изделиям</span>
        </button>
        <div class="dropdown"><a href="orders.html?view=portfolio">Портфель заказов</a><a href="orders.html?view=annual">Годовой план</a><a href="products.html?view=plan-a">План А</a><a href="orders.html?view=archive">Архив работ</a><a href="products.html?view=products">Изделия</a><a href="processes.html">Полный просмотр</a></div>
      </div>
      <div class="nav-item " data-menu="8">
        <button class="nav-button" data-href="settings.html">
          <span class="nav-icon nav-icon-settings" aria-hidden="true"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2"/></svg></span><span class="nav-label">Настройка...</span>
        </button>

      </div>
      <div class="nav-item " data-menu="3">
        <button class="nav-button" data-href="standards.html">
          <span class="nav-icon nav-icon-clock" aria-hidden="true"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 7v6l4 2"/></svg></span><span class="nav-label">Нормирование</span>
        </button>

      </div>
      <div class="nav-item " data-menu="4">
        <button class="nav-button" data-href="form2.html">
          <span class="nav-icon nav-icon-alert" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M12 3 2.8 20h18.4L12 3Z"/><path d="M12 9v5M12 17h.01"/></svg></span><span class="nav-label">Отклонения плана</span>
        </button>

      </div>
      <div class="nav-item " data-menu="5">
        <button class="nav-button" data-href="production.html">
          <span class="nav-icon nav-icon-production" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M3 21V10l6 3V9l6 4V5h6v16H3Z"/><path d="M7 17h2M13 17h2M18 9h3"/></svg></span><span class="nav-label">Производство</span>
        </button>

      </div>
      <div class="nav-item " data-menu="6">
        <button class="nav-button" data-href="cam.html">
          <span class="nav-icon nav-icon-import" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M12 3v12M7 10l5 5 5-5M4 20h16"/></svg></span><span class="nav-label">Импорт NX CAM</span>
        </button>

      </div>
      <div class="nav-item " data-menu="7">
        <button class="nav-button" data-href="">
          <span class="nav-icon nav-icon-report" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M4 20V10h4v10M10 20V4h4v16M16 20v-7h4v7M3 20h18"/></svg></span><span class="nav-label">Отчёт</span>
        </button>
        <div class="dropdown"><a href="reports.html?report=plan-a">План А для технологов</a><a href="reports.html?report=plan-b">План Б для ПДБ</a><a href="reports.html?report=standards">Нормирование и отклонения Плана Б</a><a href="reports.html?report=balance">Остатки работ Плана Б</a><a href="reports.html?report=production">Производство заказа</a></div>
      </div>
      <div class="nav-item " data-menu="9">
        <button class="nav-button" data-href="help.html">
          <span class="nav-icon nav-icon-help" aria-hidden="true"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.7 2.7 0 1 1 4.1 2.3c-1 .6-1.6 1.1-1.6 2.2M12 17h.01"/></svg></span><span class="nav-label">Помощь</span>
        </button>

      </div>
      <div class="nav-item " data-menu="10">
        <button class="nav-button" data-href="admin.html">
          <span class="nav-icon nav-icon-admin" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M12 3 20 6v5c0 5-3.4 8.3-8 10-4.6-1.7-8-5-8-10V6l8-3Z"/><path d="M9 12l2 2 4-4"/></svg></span><span class="nav-label">Администрирование</span>
        </button>

      </div></nav>
        <div class="sidebar-product">Система ТПП</div>
      </aside>
      <section class="main-area">
        <header class="topbar niiar-topbar">
          <div><p class="eyebrow">Автоматизированная система ТПП</p><h1>Просмотр Плана А (все заказы)</h1></div>
          <div class="user-panel">
            <div class="user-avatar">AD</div>
            <div class="user-meta"><strong>Администратор системы</strong></div>
            <button class="logout-button" id="logout-button">Выйти</button>
          </div>
        </header>
        <main class="workspace">
    <div class="page">

    <div class="toolbar">
      <button class="tool-button" data-action="export-current">💾 Сохранить в Excel...</button>
      <button class="tool-button" data-go="settings.html">🔑 Настройка...</button>
      <button class="tool-button" data-go="index.html">⬅ Перейти назад</button>
    </div>

      <div class="toolbar">
        <button class="btn" data-action="add-order">Добавить изделие</button><button class="btn" data-action="edit-order">Редактирование изделия</button><button class="btn" data-action="delete-order">Удалить изделие</button>
        <button class="btn">Фильтровать...</button>
        <label style="margin-left:12px">
          Поиск заказа № <input id="order-search" style="width:75px">
        </label>
        <button class="btn" data-action="reset-search">Все</button>
      </div>

    <div class="table-wrap">
      <table class="data-grid">
        <thead>
          <tr><th>Заказ</th><th>№</th><th>Объект</th><th>Наименование</th><th>Чертеж</th><th>Кол. черт.</th><th>Год пл.</th><th>Квартал пл.</th><th>Колич. изд.</th><th>Стадия</th><th>Приоритет</th><th>№ заявки</th><th>Д. заявки</th><th>Д. ввода</th><th>Примечание</th><th>Материалы</th><th>Окончание</th><th>Шифр затрат</th><th>Тр. предпол. на изделие</th><th>Тр. Сум. планируемой</th><th>Тр. Сум. фактической</th><th>Дата изготовления</th><th>Накладная</th><th>№ группы</th><th>№ исполнителя</th></tr>
        </thead>
        <tbody>

            <tr class="selected" data-order="1256">
              <td>1256</td><td>1</td><td>ОРМ</td><td>патрон станка</td><td>7002</td><td>1</td><td>2008</td><td>1</td><td>2</td><td>План Б</td><td>2</td><td>55-07/215</td><td>24.03.2008</td><td>27.03.2008</td><td></td><td>70%</td><td>В работе</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td>
            </tr>
            <tr class="" data-order="1353">
              <td>1353</td><td>1</td><td>РИК</td><td>КОНТЕЙНЕР ТРАНС.ЗАЩИТНЫЙ</td><td>1Ж.6867.000.00СБ</td><td>1</td><td>2008</td><td>3</td><td>1</td><td>План Б</td><td>2</td><td>44-69/1095</td><td>15.08.2008</td><td>21.08.2008</td><td></td><td>80%</td><td>В работе</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td>
            </tr>
            <tr class="" data-order="1587">
              <td>1587</td><td>1</td><td>ХТО</td><td>КОНТЕЙНЕР</td><td>9Б.3021.000.00</td><td>1</td><td>2014</td><td>1</td><td>1</td><td>План А</td><td>2</td><td>25-16/1395</td><td>15.11.2013</td><td>21.11.2013</td><td></td><td>50%</td><td>В работе</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td>
            </tr>
            <tr class="" data-order="1587">
              <td>1587</td><td>2</td><td>ХТО</td><td>САДКА</td><td>9Б.3021.200.00</td><td>1</td><td>2014</td><td>1</td><td>1</td><td>План А</td><td>2</td><td>25-16/1395</td><td>15.11.2013</td><td>21.11.2013</td><td></td><td>50%</td><td>В работе</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td>
            </tr>
            <tr class="" data-order="1692">
              <td>1692</td><td>1</td><td>ОРМ</td><td>СЛИВНОЕ УСТ-ВО</td><td>Б.396-0-00</td><td>1</td><td>2010</td><td>3</td><td>5</td><td>План Б</td><td>2</td><td>55-15/709</td><td>26.10.2009</td><td>28.10.2009</td><td></td><td>90%</td><td>В работе</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td>
            </tr>
            <tr class="" data-order="2136">
              <td>2136</td><td>1</td><td>ВК-50</td><td>ЗАГЛУШКА</td><td>1МТ.4823.110.00</td><td>1</td><td>2010</td><td>4</td><td>1</td><td>План Б</td><td>1</td><td>58-12/338</td><td>22.11.2010</td><td>25.11.2010</td><td></td><td>100%</td><td>В работе</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td>
            </tr>
            <tr class="" data-order="3219">
              <td>3219</td><td>1</td><td>РИК</td><td>КАНАЛ ЯЧ.3-10</td><td>1Б.3481.000.00-01</td><td>1</td><td>2015</td><td>1</td><td>1</td><td>План А</td><td>2</td><td>ГОДОВАЯ 2015</td><td>05.11.2014</td><td>05.11.2014</td><td></td><td>0%</td><td>В работе</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td>
            </tr>
            <tr class="" data-order="3600">
              <td>3600</td><td>6</td><td>ОРМ</td><td>ВИНТ</td><td>Л54.150.01.054</td><td>1</td><td>2016</td><td>1</td><td>400</td><td>План Б</td><td>2</td><td>55-15/230</td><td>29.02.2016</td><td>03.03.2016</td><td></td><td>100%</td><td>В работе</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td>
            </tr>
            <tr class="" data-order="3698">
              <td>3698</td><td>1</td><td>РИК</td><td>ГОЛОВКА</td><td>5ТО.271.000.01</td><td>1</td><td>2016</td><td>2</td><td>3</td><td>План Б</td><td>4</td><td>ГОДОВАЯ 2016</td><td>20.06.2016</td><td>20.06.2016</td><td></td><td>80%</td><td>В работе</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td>
            </tr>
            <tr class="" data-order="4985">
              <td>4985</td><td>2</td><td>РИК</td><td>Штанга шариковая</td><td>1Ж.09493.00.00</td><td>1</td><td>2021</td><td>2</td><td>1</td><td>План А</td><td>2</td><td>заявка 2кв.2021</td><td>24.02.2021</td><td>24.02.2021</td><td></td><td>0%</td><td>В работе</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td>
            </tr>
            <tr class="" data-order="5200">
              <td>5200</td><td>13</td><td>ОЭС</td><td>Сухарь для люнета</td><td>эскиз</td><td>1</td><td>2021</td><td>4</td><td>3</td><td>План А</td><td>2</td><td>б/н</td><td>20.10.2021</td><td>20.10.2021</td><td></td><td>0%</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td>
            </tr>
            <tr class="" data-order="5427">
              <td>5427</td><td>1</td><td>РИК</td><td>ВИНТ</td><td>МИР.М1.03.013</td><td>1</td><td>2024</td><td>3</td><td>3</td><td>План А</td><td>3</td><td>3кв.2024</td><td>30.05.2023</td><td>30.05.2023</td><td></td><td>0%</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td>
            </tr>
        </tbody>
      </table>
    </div>
      <section id="selected-record-panel" class="product-record-panel">
        <header class="record-panel-heading">
          <div>
            <span>Выбранная строка</span>
            <h2 id="selected-product-title">патрон станка</h2>
          </div>
          <strong id="selected-product-drawing">Чертеж 7002</strong>
        </header>
        <div class="product-record-content">
          <dl class="product-record-fields">
            <div><dt>Наименование</dt><dd data-product-detail="name">патрон станка</dd></div>
            <div><dt>Чертеж</dt><dd data-product-detail="drawing">7002</dd></div>
            <div><dt>Количество чертежей</dt><dd data-product-detail="drawingCount">1</dd></div>
            <div><dt>Процент неучтенных работ</dt><dd data-product-detail="unaccounted">0%</dd></div>
            <div><dt>Суммарная трудоемкость</dt><dd data-product-detail="labor">301,89 н.ч.</dd></div>
            <div><dt>Список заказов</dt><dd data-product-detail="orders">1256</dd></div>
          </dl>
          <div class="product-work-list">
            <h3>Работы</h3>
            <div class="work-value-grid" id="product-work-values">
              <span>Заготовительные (1)</span><strong>7,87</strong>
              <span>Модельные (1в)</span><strong>3</strong>
              <span>Токарные работы (2)</span><strong>91,27</strong>
              <span>Фрезерные (3)</span><strong>77,93</strong>
              <span>Координатные (5а)</span><strong>12,1</strong>
              <span>Слесарные (6)</span><strong>29,25</strong>
              <span>Гальваника (6б)</span><strong>5,43</strong>
              <span>Шлифовальные (7)</span><strong>30,37</strong>
              <span>Оснастка (17)</span><strong>19,71</strong>
            </div>
          </div>
        </div>
      </section>
    </div></main>
      </section>
    </section>`,
  "reports": `<section class="app-shell niiar-shell">
      <aside class="sidebar niiar-sidebar">
        <a class="release-brand" href="index.html">
          <img class="rosatom-logo" src="assets/rosatom-logo.svg" alt="Росатом">
        </a>
        <p class="nav-caption">Разделы программы</p>
        <nav class="side-nav familiar-nav">
      <div class="nav-item " data-menu="0">
        <button class="nav-button" data-href="">
          <span class="nav-icon nav-icon-database" aria-hidden="true"><svg viewBox="0 0 24 24"><ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v6c0 1.7 3.6 3 8 3s8-1.3 8-3V5M4 11v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6"/></svg></span><span class="nav-label">Ведение базы</span>
        </button>
        <div class="dropdown"><a href="entry.html">Введение нового заказа</a><a href="annual-plan.html">Формирование Годового плана</a><a href="plan-a.html">Формирование Плана А</a><a href="plan-b.html">Изменение / Формирование Плана Б</a></div>
      </div>
      <div class="nav-item " data-menu="1">
        <button class="nav-button" data-href="">
          <span class="nav-icon nav-icon-orders" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M7 4h10v3h3v14H4V7h3V4Z"/><path d="M8 11h8M8 15h8"/></svg></span><span class="nav-label">Просмотр по заказам</span>
        </button>
        <div class="dropdown"><a href="orders.html?view=portfolio">Портфель заказов</a><a href="orders.html?view=annual">Годовой план</a><a href="orders.html?view=archive">Архив работ</a><a href="products.html?view=products">Изделия</a></div>
      </div>
      <div class="nav-item " data-menu="2">
        <button class="nav-button" data-href="">
          <span class="nav-icon nav-icon-products" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="m12 3 8 4.5v9L12 21l-8-4.5v-9L12 3Z"/><path d="m4 7.5 8 4.5 8-4.5M12 12v9"/></svg></span><span class="nav-label">Просмотр по изделиям</span>
        </button>
        <div class="dropdown"><a href="orders.html?view=portfolio">Портфель заказов</a><a href="orders.html?view=annual">Годовой план</a><a href="products.html?view=plan-a">План А</a><a href="orders.html?view=archive">Архив работ</a><a href="products.html?view=products">Изделия</a><a href="processes.html">Полный просмотр</a></div>
      </div>
      <div class="nav-item " data-menu="8">
        <button class="nav-button" data-href="settings.html">
          <span class="nav-icon nav-icon-settings" aria-hidden="true"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2"/></svg></span><span class="nav-label">Настройка...</span>
        </button>

      </div>
      <div class="nav-item " data-menu="3">
        <button class="nav-button" data-href="standards.html">
          <span class="nav-icon nav-icon-clock" aria-hidden="true"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 7v6l4 2"/></svg></span><span class="nav-label">Нормирование</span>
        </button>

      </div>
      <div class="nav-item " data-menu="4">
        <button class="nav-button" data-href="form2.html">
          <span class="nav-icon nav-icon-alert" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M12 3 2.8 20h18.4L12 3Z"/><path d="M12 9v5M12 17h.01"/></svg></span><span class="nav-label">Отклонения плана</span>
        </button>

      </div>
      <div class="nav-item " data-menu="5">
        <button class="nav-button" data-href="production.html">
          <span class="nav-icon nav-icon-production" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M3 21V10l6 3V9l6 4V5h6v16H3Z"/><path d="M7 17h2M13 17h2M18 9h3"/></svg></span><span class="nav-label">Производство</span>
        </button>

      </div>
      <div class="nav-item " data-menu="6">
        <button class="nav-button" data-href="cam.html">
          <span class="nav-icon nav-icon-import" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M12 3v12M7 10l5 5 5-5M4 20h16"/></svg></span><span class="nav-label">Импорт NX CAM</span>
        </button>

      </div>
      <div class="nav-item current" data-menu="7">
        <button class="nav-button" data-href="">
          <span class="nav-icon nav-icon-report" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M4 20V10h4v10M10 20V4h4v16M16 20v-7h4v7M3 20h18"/></svg></span><span class="nav-label">Отчёт</span>
        </button>
        <div class="dropdown"><a href="reports.html?report=plan-a">План А для технологов</a><a href="reports.html?report=plan-b">План Б для ПДБ</a><a href="reports.html?report=standards">Нормирование и отклонения Плана Б</a><a href="reports.html?report=balance">Остатки работ Плана Б</a><a href="reports.html?report=production">Производство заказа</a></div>
      </div>
      <div class="nav-item " data-menu="9">
        <button class="nav-button" data-href="help.html">
          <span class="nav-icon nav-icon-help" aria-hidden="true"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.7 2.7 0 1 1 4.1 2.3c-1 .6-1.6 1.1-1.6 2.2M12 17h.01"/></svg></span><span class="nav-label">Помощь</span>
        </button>

      </div>
      <div class="nav-item " data-menu="10">
        <button class="nav-button" data-href="admin.html">
          <span class="nav-icon nav-icon-admin" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M12 3 20 6v5c0 5-3.4 8.3-8 10-4.6-1.7-8-5-8-10V6l8-3Z"/><path d="M9 12l2 2 4-4"/></svg></span><span class="nav-label">Администрирование</span>
        </button>

      </div></nav>
        <div class="sidebar-product">Система ТПП</div>
      </aside>
      <section class="main-area">
        <header class="topbar niiar-topbar">
          <div><p class="eyebrow">Автоматизированная система ТПП</p><h1>Отчёты</h1></div>
          <div class="user-panel">
            <div class="user-avatar">AD</div>
            <div class="user-meta"><strong>Администратор системы</strong></div>
            <button class="logout-button" id="logout-button">Выйти</button>
          </div>
        </header>
        <main class="workspace">
    <div class="modern-page reports-page">
      <section class="page-intro">
        <div><span class="eyebrow">Отчётность</span><h2>Формирование отчётов</h2><p>Таблица выбранного отчёта открывается сразу. После проверки данные можно скачать в формате Excel.</p></div>
      </section>
      <section class="report-picker-card">
        <label for="report-select">Вид отчёта</label>
        <select id="report-select">
          <option value="plan-a">План А для технологов</option>
          <option value="plan-b">План Б для ПДБ</option>
          <option value="standards">Нормирование и отклонения по работам</option>
          <option value="balance">Остатки работ Плана Б</option>
          <option value="production">Производство заказа</option>
        </select>
        <div class="report-picker-actions">
          <button class="primary-button" data-action="show-selected-report">Обновить таблицу</button>
          <button class="ghost-button" data-action="download-all-reports">Скачать все</button>
        </div>
      </section>
      <section class="report-guide"><strong>Порядок работы</strong><span>1. Выберите отчёт</span><span>2. Проверьте данные в предпросмотре</span><span>3. Скачайте Excel</span></section>
      <section class="content-card report-preview" id="report-preview">
        <div class="card-heading"><div><span class="eyebrow">Предпросмотр</span><h3 data-report-title>План А для технологов</h3></div><button class="primary-button" data-action="download-current-report">Скачать Excel</button></div>
        <div class="modern-table-wrap">
          <table class="modern-table">
            <thead><tr><th>Заказ</th><th>Объект</th><th>Токарные</th><th>Фрезерные</th><th>Строгальные</th><th>Расточные</th><th>Слесарные</th><th>Сварочные</th><th>Шлифовка</th><th>Плановая трудоёмкость</th><th>Отклонения</th><th>Фактически выполнено</th><th>Остаток по заказу</th></tr></thead>
            <tbody>
              <tr><td>1256</td><td>ОРМ</td><td>14,42</td><td>10,14</td><td>0,70</td><td>53,05</td><td>69,85</td><td>0</td><td>1,94</td><td>603,78</td><td>205,15</td><td>624,28</td><td>184,65</td></tr>
              <tr><td>1353</td><td>РИК</td><td>79,07</td><td>52,42</td><td>433,09</td><td>83,62</td><td>1126,98</td><td>88,62</td><td>14,39</td><td>2122,24</td><td>1319,56</td><td>2611,45</td><td>330,35</td></tr>
              <tr><td>1692</td><td>ОРМ</td><td>36,80</td><td>27,95</td><td>5,90</td><td>80,00</td><td>93,50</td><td>17,25</td><td>3,25</td><td>212,37</td><td>67,20</td><td>72,72</td><td>206,84</td></tr>
              <tr><td>1774</td><td>РИК</td><td>57,95</td><td>12,23</td><td>5,52</td><td>86,47</td><td>87,37</td><td>19,30</td><td>11,11</td><td>278,02</td><td>687,56</td><td>615,07</td><td>350,51</td></tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  </main>
      </section>
    </section>`,
  "settings": `<section class="app-shell niiar-shell">
      <aside class="sidebar niiar-sidebar">
        <a class="release-brand" href="index.html">
          <img class="rosatom-logo" src="assets/rosatom-logo.svg" alt="Росатом">
        </a>
        <p class="nav-caption">Разделы программы</p>
        <nav class="side-nav familiar-nav">
      <div class="nav-item " data-menu="0">
        <button class="nav-button" data-href="">
          <span class="nav-icon nav-icon-database" aria-hidden="true"><svg viewBox="0 0 24 24"><ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v6c0 1.7 3.6 3 8 3s8-1.3 8-3V5M4 11v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6"/></svg></span><span class="nav-label">Ведение базы</span>
        </button>
        <div class="dropdown"><a href="entry.html">Введение нового заказа</a><a href="annual-plan.html">Формирование Годового плана</a><a href="plan-a.html">Формирование Плана А</a><a href="plan-b.html">Изменение / Формирование Плана Б</a></div>
      </div>
      <div class="nav-item " data-menu="1">
        <button class="nav-button" data-href="">
          <span class="nav-icon nav-icon-orders" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M7 4h10v3h3v14H4V7h3V4Z"/><path d="M8 11h8M8 15h8"/></svg></span><span class="nav-label">Просмотр по заказам</span>
        </button>
        <div class="dropdown"><a href="orders.html?view=portfolio">Портфель заказов</a><a href="orders.html?view=annual">Годовой план</a><a href="orders.html?view=archive">Архив работ</a><a href="products.html?view=products">Изделия</a></div>
      </div>
      <div class="nav-item " data-menu="2">
        <button class="nav-button" data-href="">
          <span class="nav-icon nav-icon-products" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="m12 3 8 4.5v9L12 21l-8-4.5v-9L12 3Z"/><path d="m4 7.5 8 4.5 8-4.5M12 12v9"/></svg></span><span class="nav-label">Просмотр по изделиям</span>
        </button>
        <div class="dropdown"><a href="orders.html?view=portfolio">Портфель заказов</a><a href="orders.html?view=annual">Годовой план</a><a href="products.html?view=plan-a">План А</a><a href="orders.html?view=archive">Архив работ</a><a href="products.html?view=products">Изделия</a><a href="processes.html">Полный просмотр</a></div>
      </div>
      <div class="nav-item current" data-menu="8">
        <button class="nav-button" data-href="settings.html">
          <span class="nav-icon nav-icon-settings" aria-hidden="true"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2"/></svg></span><span class="nav-label">Настройка...</span>
        </button>

      </div>
      <div class="nav-item " data-menu="3">
        <button class="nav-button" data-href="standards.html">
          <span class="nav-icon nav-icon-clock" aria-hidden="true"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 7v6l4 2"/></svg></span><span class="nav-label">Нормирование</span>
        </button>

      </div>
      <div class="nav-item " data-menu="4">
        <button class="nav-button" data-href="form2.html">
          <span class="nav-icon nav-icon-alert" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M12 3 2.8 20h18.4L12 3Z"/><path d="M12 9v5M12 17h.01"/></svg></span><span class="nav-label">Отклонения плана</span>
        </button>

      </div>
      <div class="nav-item " data-menu="5">
        <button class="nav-button" data-href="production.html">
          <span class="nav-icon nav-icon-production" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M3 21V10l6 3V9l6 4V5h6v16H3Z"/><path d="M7 17h2M13 17h2M18 9h3"/></svg></span><span class="nav-label">Производство</span>
        </button>

      </div>
      <div class="nav-item " data-menu="6">
        <button class="nav-button" data-href="cam.html">
          <span class="nav-icon nav-icon-import" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M12 3v12M7 10l5 5 5-5M4 20h16"/></svg></span><span class="nav-label">Импорт NX CAM</span>
        </button>

      </div>
      <div class="nav-item " data-menu="7">
        <button class="nav-button" data-href="">
          <span class="nav-icon nav-icon-report" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M4 20V10h4v10M10 20V4h4v16M16 20v-7h4v7M3 20h18"/></svg></span><span class="nav-label">Отчёт</span>
        </button>
        <div class="dropdown"><a href="reports.html?report=plan-a">План А для технологов</a><a href="reports.html?report=plan-b">План Б для ПДБ</a><a href="reports.html?report=standards">Нормирование и отклонения Плана Б</a><a href="reports.html?report=balance">Остатки работ Плана Б</a><a href="reports.html?report=production">Производство заказа</a></div>
      </div>
      <div class="nav-item " data-menu="9">
        <button class="nav-button" data-href="help.html">
          <span class="nav-icon nav-icon-help" aria-hidden="true"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.7 2.7 0 1 1 4.1 2.3c-1 .6-1.6 1.1-1.6 2.2M12 17h.01"/></svg></span><span class="nav-label">Помощь</span>
        </button>

      </div>
      <div class="nav-item " data-menu="10">
        <button class="nav-button" data-href="admin.html">
          <span class="nav-icon nav-icon-admin" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M12 3 20 6v5c0 5-3.4 8.3-8 10-4.6-1.7-8-5-8-10V6l8-3Z"/><path d="M9 12l2 2 4-4"/></svg></span><span class="nav-label">Администрирование</span>
        </button>

      </div></nav>
        <div class="sidebar-product">Система ТПП</div>
      </aside>
      <section class="main-area">
        <header class="topbar niiar-topbar">
          <div><p class="eyebrow">Автоматизированная система ТПП</p><h1>Настройки</h1></div>
          <div class="user-panel">
            <div class="user-avatar">AD</div>
            <div class="user-meta"><strong>Администратор системы</strong></div>
            <button class="logout-button" id="logout-button">Выйти</button>
          </div>
        </header>
        <main class="workspace">
    <div class="page">

    <div class="toolbar">
      <button class="tool-button" data-action="export-current">💾 Сохранить в Excel...</button>
      <button class="tool-button" data-go="settings.html">🔑 Настройка...</button>
      <button class="tool-button" data-go="index.html">⬅ Перейти назад</button>
    </div>


    <div class="table-wrap">
      <table class="data-grid">
        <thead>
          <tr><th>Заказ</th><th>№</th><th>Объект</th><th>Наименование</th><th>Чертеж</th><th>Кол. черт.</th><th>Год пл.</th><th>Квартал пл.</th><th>Колич. изд.</th><th>Стадия</th><th>Приоритет</th><th>№ заявки</th><th>Д. заявки</th><th>Д. ввода</th><th>Примечание</th><th>Материалы</th><th>Окончание</th><th>Шифр затрат</th><th>Тр. предпол. на изделие</th><th>Тр. Сум. планируемой</th><th>Тр. Сум. фактической</th><th>Дата изготовления</th><th>Накладная</th><th>№ группы</th><th>№ исполнителя</th></tr>
        </thead>
        <tbody>

            <tr class="selected" data-order="1256">
              <td>1256</td><td>1</td><td>ОРМ</td><td>патрон станка</td><td>7002</td><td>1</td><td>2008</td><td>1</td><td>2</td><td>План Б</td><td>2</td><td>55-07/215</td><td>24.03.2008</td><td>27.03.2008</td><td></td><td>70%</td><td>В работе</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td>
            </tr>
            <tr class="" data-order="1353">
              <td>1353</td><td>1</td><td>РИК</td><td>КОНТЕЙНЕР ТРАНС.ЗАЩИТНЫЙ</td><td>1Ж.6867.000.00СБ</td><td>1</td><td>2008</td><td>3</td><td>1</td><td>План Б</td><td>2</td><td>44-69/1095</td><td>15.08.2008</td><td>21.08.2008</td><td></td><td>80%</td><td>В работе</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td>
            </tr>
            <tr class="" data-order="1587">
              <td>1587</td><td>1</td><td>ХТО</td><td>КОНТЕЙНЕР</td><td>9Б.3021.000.00</td><td>1</td><td>2014</td><td>1</td><td>1</td><td>План А</td><td>2</td><td>25-16/1395</td><td>15.11.2013</td><td>21.11.2013</td><td></td><td>50%</td><td>В работе</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td>
            </tr>
            <tr class="" data-order="1587">
              <td>1587</td><td>2</td><td>ХТО</td><td>САДКА</td><td>9Б.3021.200.00</td><td>1</td><td>2014</td><td>1</td><td>1</td><td>План А</td><td>2</td><td>25-16/1395</td><td>15.11.2013</td><td>21.11.2013</td><td></td><td>50%</td><td>В работе</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td>
            </tr>
            <tr class="" data-order="1692">
              <td>1692</td><td>1</td><td>ОРМ</td><td>СЛИВНОЕ УСТ-ВО</td><td>Б.396-0-00</td><td>1</td><td>2010</td><td>3</td><td>5</td><td>План Б</td><td>2</td><td>55-15/709</td><td>26.10.2009</td><td>28.10.2009</td><td></td><td>90%</td><td>В работе</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td>
            </tr>
            <tr class="" data-order="2136">
              <td>2136</td><td>1</td><td>ВК-50</td><td>ЗАГЛУШКА</td><td>1МТ.4823.110.00</td><td>1</td><td>2010</td><td>4</td><td>1</td><td>План Б</td><td>1</td><td>58-12/338</td><td>22.11.2010</td><td>25.11.2010</td><td></td><td>100%</td><td>В работе</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td>
            </tr>
            <tr class="" data-order="3219">
              <td>3219</td><td>1</td><td>РИК</td><td>КАНАЛ ЯЧ.3-10</td><td>1Б.3481.000.00-01</td><td>1</td><td>2015</td><td>1</td><td>1</td><td>План А</td><td>2</td><td>ГОДОВАЯ 2015</td><td>05.11.2014</td><td>05.11.2014</td><td></td><td>0%</td><td>В работе</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td>
            </tr>
            <tr class="" data-order="3600">
              <td>3600</td><td>6</td><td>ОРМ</td><td>ВИНТ</td><td>Л54.150.01.054</td><td>1</td><td>2016</td><td>1</td><td>400</td><td>План Б</td><td>2</td><td>55-15/230</td><td>29.02.2016</td><td>03.03.2016</td><td></td><td>100%</td><td>В работе</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td>
            </tr>
            <tr class="" data-order="3698">
              <td>3698</td><td>1</td><td>РИК</td><td>ГОЛОВКА</td><td>5ТО.271.000.01</td><td>1</td><td>2016</td><td>2</td><td>3</td><td>План Б</td><td>4</td><td>ГОДОВАЯ 2016</td><td>20.06.2016</td><td>20.06.2016</td><td></td><td>80%</td><td>В работе</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td>
            </tr>
            <tr class="" data-order="4985">
              <td>4985</td><td>2</td><td>РИК</td><td>Штанга шариковая</td><td>1Ж.09493.00.00</td><td>1</td><td>2021</td><td>2</td><td>1</td><td>План А</td><td>2</td><td>заявка 2кв.2021</td><td>24.02.2021</td><td>24.02.2021</td><td></td><td>0%</td><td>В работе</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td>
            </tr>
            <tr class="" data-order="5200">
              <td>5200</td><td>13</td><td>ОЭС</td><td>Сухарь для люнета</td><td>эскиз</td><td>1</td><td>2021</td><td>4</td><td>3</td><td>План А</td><td>2</td><td>б/н</td><td>20.10.2021</td><td>20.10.2021</td><td></td><td>0%</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td>
            </tr>
            <tr class="" data-order="5427">
              <td>5427</td><td>1</td><td>РИК</td><td>ВИНТ</td><td>МИР.М1.03.013</td><td>1</td><td>2024</td><td>3</td><td>3</td><td>План А</td><td>3</td><td>3кв.2024</td><td>30.05.2023</td><td>30.05.2023</td><td></td><td>0%</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td>
            </tr>
        </tbody>
      </table>
    </div>
    </div>
    <div class="modal-layer">
        <section class="dialog settings-dialog">
          <header class="dialog-title">🔑 Настройки</header>
          <div class="settings-layout">
            <nav class="settings-nav">

                <button class="active" data-settings-tab="tables" data-settings-roles="admin,technologist">Таблицы</button>

                <button class="" data-settings-tab="plan" data-settings-roles="admin">План А</button>

                <button class="" data-settings-tab="groups" data-settings-roles="admin,technologist">ТО список групп</button>

                <button class="" data-settings-tab="staff" data-settings-roles="admin">ТО исполнители</button>

            </nav>
            <div id="settings-content" class="settings-content">
    <h2 class="dialog-heading">Таблицы</h2>
    <div class="settings-columns" data-settings-panel="tables">
      <section>
        <div>Поля изделий</div>
        <div class="check-list">
    <label><input type="checkbox" checked> №</label>

    <label><input type="checkbox" checked> Название изделия</label>

    <label><input type="checkbox" checked> Чертеж</label>

    <label><input type="checkbox" > Объект</label>

    <label><input type="checkbox" checked> Кол. Чертежей</label>

    <label><input type="checkbox" checked> Кол. Изделий</label>

    <label><input type="checkbox" checked> Материалы</label>

    <label><input type="checkbox" checked> Стадия</label>

    <label><input type="checkbox" > Окончание</label>

    <label><input type="checkbox" checked> Шифр затрат</label>

    <label><input type="checkbox" checked> Приоритет</label>

    <label><input type="checkbox" checked> Тр. Предполагаемая</label>

    <label><input type="checkbox" checked> Сум. планируемой Тр.</label>

    <label><input type="checkbox" > Сум. фактической Тр.</label>

    <label><input type="checkbox" checked> Сум. дополнительной</label>

    <label><input type="checkbox" checked> Дата изг.</label>

    <label><input type="checkbox" checked> Накладная</label>
  </div>
      </section>
      <section>
        <div>Поля заказов</div>
        <div class="check-list">
    <label><input type="checkbox" checked> Заказ</label>

    <label><input type="checkbox" checked> Стадия</label>

    <label><input type="checkbox" checked> № заявки</label>

    <label><input type="checkbox" > Д. заявки</label>

    <label><input type="checkbox" checked> Д. ввода</label>

    <label><input type="checkbox" checked> Год пл.</label>

    <label><input type="checkbox" checked> Квартал пл.</label>

    <label><input type="checkbox" checked> Тр. Сумма план. по заказу</label>

    <label><input type="checkbox" > Тр. Сумма дополн. по заказу</label>

    <label><input type="checkbox" checked> Тр. Сумма фактич. по заказу</label>

    <label><input type="checkbox" checked> Примечание</label>

    <label><input type="checkbox" checked> Z_NOTNORM</label>

    <label><input type="checkbox" checked> Z_NOTNORM_FAKT</label>
  </div>
      </section>
    </div>
    <section class="settings-panel settings-plan" data-settings-panel="plan" hidden>
      <fieldset>
        <legend>Периоды подготовки производства</legend>
        <label>Трудоёмкость от 0 до 2000 н.ч. <input value="1" inputmode="numeric"> кв.</label>
        <label>Трудоёмкость от 2001 до 10000 н.ч. <input value="2" inputmode="numeric"> кв.</label>
      </fieldset>
      <fieldset>
        <legend>Тех. Бюро</legend>
        <label>Трудоёмкость разработки тех. процесса на 1 технолога <input value="1" inputmode="numeric"> н.ч.</label>
        <label>Численность технологов <input value="4" inputmode="numeric"> чел.</label>
      </fieldset>
      <div class="settings-quarter-table">
        <table>
          <thead><tr><th>Год</th><th>1 квартал</th><th>2 квартал</th><th>3 квартал</th><th>4 квартал</th></tr></thead>
          <tbody><tr class="selected"><td>2004</td><td>481</td><td>486</td><td>528</td><td>508</td></tr><tr><td>2005</td><td>401</td><td>446</td><td>474</td><td>461</td></tr></tbody>
        </table>
        <div class="settings-row-actions"><button class="btn" type="button" data-settings-plan-action="add">Добавить</button><button class="btn" type="button" data-settings-plan-action="edit">Изменить</button><button class="btn" type="button" data-settings-plan-action="delete">Удалить</button></div>
      </div>
    </section>
    <section class="settings-panel" data-settings-panel="groups" hidden>
      <div class="settings-list-toolbar"><button type="button" data-settings-list-action="add" title="Добавить">＋</button><button type="button" data-settings-list-action="up" title="Переместить выше">▲</button><button type="button" data-settings-list-action="edit" title="Изменить">✎</button><button type="button" data-settings-list-action="delete" title="Удалить">×</button><span>Ведёт: 2242 изд.</span></div>
      <div class="settings-list" data-settings-list="groups"><button class="selected">Группа не задана</button><button>Комната 306</button><button>Комната 307 (Мельников)</button></div>
    </section>
    <section class="settings-panel" data-settings-panel="staff" hidden>
      <div class="settings-list-toolbar"><button type="button" data-settings-list-action="add" title="Добавить">＋</button><button type="button" data-settings-list-action="up" title="Переместить выше">▲</button><button type="button" data-settings-list-action="edit" title="Изменить">✎</button><button type="button" data-settings-list-action="delete" title="Удалить">×</button><span>Ведёт: 9932 изд.</span></div>
      <div class="settings-list" data-settings-list="staff"><button class="selected">Исполнитель не задан</button><button>Вильдеев А.В.</button><button>Гоголев В.Г.</button><button>Додоларенко Г.Г.</button><button>Халтурина Т.В.</button><button>Шепарова Т.П.</button><button>Большат Л.И.</button><button>Кропачева Т.И.</button><button>Пудовкин В.Ф.</button><button>Мельников Ю.Г.</button><button>Илларионов И.В.</button><button>Гладкова А.Д.</button><button>Галата-Трифонов И.С.</button><button>Албаев А.М.</button><button>Горбачев С.В.</button></div>
    </section>
    </div>
          </div>
          <footer class="dialog-actions" style="padding:0 10px 8px">
            <button class="btn" data-action="save-settings">OK</button>
            <button class="btn" data-go="orders.html">Отмена</button>
          </footer>
        </section>
    </div></main>
      </section>
      <dialog class="form-modal settings-item-dialog" id="settings-item-dialog">
        <form id="settings-item-form" method="dialog">
          <div class="form-modal-title"><strong id="settings-item-title">Новая запись</strong><button type="button" data-dialog-close="settings-item-dialog" aria-label="Закрыть">×</button></div>
          <div class="form-modal-body">
            <label class="form-modal-field required"><span id="settings-item-label">Название</span><input name="itemName" required maxlength="120" autocomplete="off"></label>
          </div>
          <div class="form-modal-actions"><button type="button" class="ghost-button" data-dialog-close="settings-item-dialog">Отмена</button><button type="submit" class="primary-button">Сохранить</button></div>
        </form>
      </dialog>
    </section>`,
  "standards": `<section class="app-shell niiar-shell">
      <aside class="sidebar niiar-sidebar">
        <a class="release-brand" href="index.html">
          <img class="rosatom-logo" src="assets/rosatom-logo.svg" alt="Росатом">
        </a>
        <p class="nav-caption">Разделы программы</p>
        <nav class="side-nav familiar-nav">
      <div class="nav-item " data-menu="0">
        <button class="nav-button" data-href="">
          <span class="nav-icon nav-icon-database" aria-hidden="true"><svg viewBox="0 0 24 24"><ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v6c0 1.7 3.6 3 8 3s8-1.3 8-3V5M4 11v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6"/></svg></span><span class="nav-label">Ведение базы</span>
        </button>
        <div class="dropdown"><a href="entry.html">Введение нового заказа</a><a href="annual-plan.html">Формирование Годового плана</a><a href="plan-a.html">Формирование Плана А</a><a href="plan-b.html">Изменение / Формирование Плана Б</a></div>
      </div>
      <div class="nav-item " data-menu="1">
        <button class="nav-button" data-href="">
          <span class="nav-icon nav-icon-orders" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M7 4h10v3h3v14H4V7h3V4Z"/><path d="M8 11h8M8 15h8"/></svg></span><span class="nav-label">Просмотр по заказам</span>
        </button>
        <div class="dropdown"><a href="orders.html?view=portfolio">Портфель заказов</a><a href="orders.html?view=annual">Годовой план</a><a href="orders.html?view=archive">Архив работ</a><a href="products.html?view=products">Изделия</a></div>
      </div>
      <div class="nav-item " data-menu="2">
        <button class="nav-button" data-href="">
          <span class="nav-icon nav-icon-products" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="m12 3 8 4.5v9L12 21l-8-4.5v-9L12 3Z"/><path d="m4 7.5 8 4.5 8-4.5M12 12v9"/></svg></span><span class="nav-label">Просмотр по изделиям</span>
        </button>
        <div class="dropdown"><a href="orders.html?view=portfolio">Портфель заказов</a><a href="orders.html?view=annual">Годовой план</a><a href="products.html?view=plan-a">План А</a><a href="orders.html?view=archive">Архив работ</a><a href="products.html?view=products">Изделия</a><a href="processes.html">Полный просмотр</a></div>
      </div>
      <div class="nav-item " data-menu="8">
        <button class="nav-button" data-href="settings.html">
          <span class="nav-icon nav-icon-settings" aria-hidden="true"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2"/></svg></span><span class="nav-label">Настройка...</span>
        </button>

      </div>
      <div class="nav-item current" data-menu="3">
        <button class="nav-button" data-href="standards.html">
          <span class="nav-icon nav-icon-clock" aria-hidden="true"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 7v6l4 2"/></svg></span><span class="nav-label">Нормирование</span>
        </button>

      </div>
      <div class="nav-item " data-menu="4">
        <button class="nav-button" data-href="form2.html">
          <span class="nav-icon nav-icon-alert" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M12 3 2.8 20h18.4L12 3Z"/><path d="M12 9v5M12 17h.01"/></svg></span><span class="nav-label">Отклонения плана</span>
        </button>

      </div>
      <div class="nav-item " data-menu="5">
        <button class="nav-button" data-href="production.html">
          <span class="nav-icon nav-icon-production" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M3 21V10l6 3V9l6 4V5h6v16H3Z"/><path d="M7 17h2M13 17h2M18 9h3"/></svg></span><span class="nav-label">Производство</span>
        </button>

      </div>
      <div class="nav-item " data-menu="6">
        <button class="nav-button" data-href="cam.html">
          <span class="nav-icon nav-icon-import" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M12 3v12M7 10l5 5 5-5M4 20h16"/></svg></span><span class="nav-label">Импорт NX CAM</span>
        </button>

      </div>
      <div class="nav-item " data-menu="7">
        <button class="nav-button" data-href="">
          <span class="nav-icon nav-icon-report" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M4 20V10h4v10M10 20V4h4v16M16 20v-7h4v7M3 20h18"/></svg></span><span class="nav-label">Отчёт</span>
        </button>
        <div class="dropdown"><a href="reports.html?report=plan-a">План А для технологов</a><a href="reports.html?report=plan-b">План Б для ПДБ</a><a href="reports.html?report=standards">Нормирование и отклонения Плана Б</a><a href="reports.html?report=balance">Остатки работ Плана Б</a><a href="reports.html?report=production">Производство заказа</a></div>
      </div>
      <div class="nav-item " data-menu="9">
        <button class="nav-button" data-href="help.html">
          <span class="nav-icon nav-icon-help" aria-hidden="true"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.7 2.7 0 1 1 4.1 2.3c-1 .6-1.6 1.1-1.6 2.2M12 17h.01"/></svg></span><span class="nav-label">Помощь</span>
        </button>

      </div>
      <div class="nav-item " data-menu="10">
        <button class="nav-button" data-href="admin.html">
          <span class="nav-icon nav-icon-admin" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M12 3 20 6v5c0 5-3.4 8.3-8 10-4.6-1.7-8-5-8-10V6l8-3Z"/><path d="M9 12l2 2 4-4"/></svg></span><span class="nav-label">Администрирование</span>
        </button>

      </div></nav>
        <div class="sidebar-product">Система ТПП</div>
      </aside>
      <section class="main-area">
        <header class="topbar niiar-topbar">
          <div><p class="eyebrow">Автоматизированная система ТПП</p><h1>Формирование Плана А</h1></div>
          <div class="user-panel">
            <div class="user-avatar">AD</div>
            <div class="user-meta"><strong>Администратор системы</strong></div>
            <button class="logout-button" id="logout-button">Выйти</button>
          </div>
        </header>
        <main class="workspace">
    <div class="page">

    <div class="toolbar">
      <button class="tool-button" data-action="export-current">💾 Сохранить в Excel...</button>
      <button class="tool-button" data-go="settings.html">🔑 Настройка...</button>
      <button class="tool-button" data-go="index.html">⬅ Перейти назад</button>
    </div>
      <div class="filters standards-filters">
        <fieldset>
          <legend>Период</legend>
          Год <select><option>2026</option></select>
          Квартал <select><option>3</option></select>
        </fieldset>
        <fieldset class="technology-office">
          <legend>Технологическое бюро</legend>
          <label>Чертежей <input class="field" value="4"></label>
          <label>Часов <input class="field" value="128"></label>
          <label>Трудоёмкость <input class="field" value="1"></label>
          <label>Численность <input class="field" value="4"></label>
          <button class="btn">Предварительное формирование</button>
          <button class="btn">Очистить</button>
          <button class="btn primary-inline">Утвердить</button>
        </fieldset>
      </div>

    <div class="table-wrap">
      <table class="data-grid">
        <thead>
          <tr><th>Заказ</th><th>№</th><th>Объект</th><th>Наименование</th><th>Чертеж</th><th>Кол. черт.</th><th>Год пл.</th><th>Квартал пл.</th><th>Колич. изд.</th><th>Стадия</th><th>Приоритет</th><th>№ заявки</th><th>Д. заявки</th><th>Д. ввода</th><th>Примечание</th><th>Материалы</th><th>Окончание</th><th>Шифр затрат</th><th>Тр. предпол. на изделие</th><th>Тр. Сум. планируемой</th><th>Тр. Сум. фактической</th><th>Дата изготовления</th><th>Накладная</th><th>№ группы</th><th>№ исполнителя</th></tr>
        </thead>
        <tbody>

            <tr class="selected" data-order="1256">
              <td>1256</td><td>1</td><td>ОРМ</td><td>патрон станка</td><td>7002</td><td>1</td><td>2008</td><td>1</td><td>2</td><td>План Б</td><td>2</td><td>55-07/215</td><td>24.03.2008</td><td>27.03.2008</td><td></td><td>70%</td><td>В работе</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td>
            </tr>
            <tr class="" data-order="1353">
              <td>1353</td><td>1</td><td>РИК</td><td>КОНТЕЙНЕР ТРАНС.ЗАЩИТНЫЙ</td><td>1Ж.6867.000.00СБ</td><td>1</td><td>2008</td><td>3</td><td>1</td><td>План Б</td><td>2</td><td>44-69/1095</td><td>15.08.2008</td><td>21.08.2008</td><td></td><td>80%</td><td>В работе</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td>
            </tr>
            <tr class="" data-order="1587">
              <td>1587</td><td>1</td><td>ХТО</td><td>КОНТЕЙНЕР</td><td>9Б.3021.000.00</td><td>1</td><td>2014</td><td>1</td><td>1</td><td>План А</td><td>2</td><td>25-16/1395</td><td>15.11.2013</td><td>21.11.2013</td><td></td><td>50%</td><td>В работе</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td>
            </tr>
            <tr class="" data-order="1587">
              <td>1587</td><td>2</td><td>ХТО</td><td>САДКА</td><td>9Б.3021.200.00</td><td>1</td><td>2014</td><td>1</td><td>1</td><td>План А</td><td>2</td><td>25-16/1395</td><td>15.11.2013</td><td>21.11.2013</td><td></td><td>50%</td><td>В работе</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td>
            </tr>
            <tr class="" data-order="1692">
              <td>1692</td><td>1</td><td>ОРМ</td><td>СЛИВНОЕ УСТ-ВО</td><td>Б.396-0-00</td><td>1</td><td>2010</td><td>3</td><td>5</td><td>План Б</td><td>2</td><td>55-15/709</td><td>26.10.2009</td><td>28.10.2009</td><td></td><td>90%</td><td>В работе</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td>
            </tr>
            <tr class="" data-order="2136">
              <td>2136</td><td>1</td><td>ВК-50</td><td>ЗАГЛУШКА</td><td>1МТ.4823.110.00</td><td>1</td><td>2010</td><td>4</td><td>1</td><td>План Б</td><td>1</td><td>58-12/338</td><td>22.11.2010</td><td>25.11.2010</td><td></td><td>100%</td><td>В работе</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td>
            </tr>
            <tr class="" data-order="3219">
              <td>3219</td><td>1</td><td>РИК</td><td>КАНАЛ ЯЧ.3-10</td><td>1Б.3481.000.00-01</td><td>1</td><td>2015</td><td>1</td><td>1</td><td>План А</td><td>2</td><td>ГОДОВАЯ 2015</td><td>05.11.2014</td><td>05.11.2014</td><td></td><td>0%</td><td>В работе</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td>
            </tr>
            <tr class="" data-order="3600">
              <td>3600</td><td>6</td><td>ОРМ</td><td>ВИНТ</td><td>Л54.150.01.054</td><td>1</td><td>2016</td><td>1</td><td>400</td><td>План Б</td><td>2</td><td>55-15/230</td><td>29.02.2016</td><td>03.03.2016</td><td></td><td>100%</td><td>В работе</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td>
            </tr>
            <tr class="" data-order="3698">
              <td>3698</td><td>1</td><td>РИК</td><td>ГОЛОВКА</td><td>5ТО.271.000.01</td><td>1</td><td>2016</td><td>2</td><td>3</td><td>План Б</td><td>4</td><td>ГОДОВАЯ 2016</td><td>20.06.2016</td><td>20.06.2016</td><td></td><td>80%</td><td>В работе</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td>
            </tr>
            <tr class="" data-order="4985">
              <td>4985</td><td>2</td><td>РИК</td><td>Штанга шариковая</td><td>1Ж.09493.00.00</td><td>1</td><td>2021</td><td>2</td><td>1</td><td>План А</td><td>2</td><td>заявка 2кв.2021</td><td>24.02.2021</td><td>24.02.2021</td><td></td><td>0%</td><td>В работе</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td>
            </tr>
            <tr class="" data-order="5200">
              <td>5200</td><td>13</td><td>ОЭС</td><td>Сухарь для люнета</td><td>эскиз</td><td>1</td><td>2021</td><td>4</td><td>3</td><td>План А</td><td>2</td><td>б/н</td><td>20.10.2021</td><td>20.10.2021</td><td></td><td>0%</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td>
            </tr>
            <tr class="" data-order="5427">
              <td>5427</td><td>1</td><td>РИК</td><td>ВИНТ</td><td>МИР.М1.03.013</td><td>1</td><td>2024</td><td>3</td><td>3</td><td>План А</td><td>3</td><td>3кв.2024</td><td>30.05.2023</td><td>30.05.2023</td><td></td><td>0%</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td>
            </tr>
        </tbody>
      </table>
    </div>
    </div></main>
      </section>
    </section>`
};

function modulePage(title, eyebrow, content) {
  return `<section class="app-shell niiar-shell">
    <aside class="sidebar niiar-sidebar">
      <a class="release-brand" href="index.html"><img class="rosatom-logo" src="assets/rosatom-logo.svg" alt="Росатом"></a>
      <p class="nav-caption">Разделы программы</p>
      <nav class="side-nav familiar-nav" data-shared-navigation></nav>
      <div class="sidebar-product">Система ТПП</div>
    </aside>
    <section class="main-area">
      <header class="topbar niiar-topbar">
        <div><p class="eyebrow">${eyebrow}</p><h1>${title}</h1></div>
        <div class="user-panel"><div class="user-avatar">US</div><div class="user-meta"><strong>Пользователь</strong></div><button class="logout-button" id="logout-button">Выйти</button></div>
      </header>
      <main class="workspace"><div class="modern-page module-page">${content}</div></main>
    </section>
  </section>`;
}

pageViews.personnel = modulePage('Персонал производственных рабочих', 'Справочник по штатному расписанию', `
  <section class="page-intro"><div><span class="eyebrow">Основные производственные рабочие</span><h2>Персонал и разряды по ШР</h2><p>Состав работников, профессии и квалификационные разряды согласно штатному расписанию.</p></div></section>
  <section class="content-card module-table-card">
    <div class="card-heading"><div><span class="eyebrow">Штатное расписание</span><h3>Работники</h3></div><div class="row-actions"><button class="primary-button" data-module-action="add">Добавить работника</button><button class="ghost-button" data-module-action="edit">Изменить</button><button class="ghost-button danger" data-module-action="delete">Удалить</button></div></div>
    <div class="module-filters"><label>Подразделение<select><option>Все подразделения</option><option>Механический участок</option><option>Сборочный участок</option><option>Сварочный участок</option></select></label><label>Профессия<input type="search" placeholder="Поиск по профессии"></label><label>Состояние<select><option>Все</option><option>Работает</option><option>Временно отсутствует</option></select></label></div>
    <div class="modern-table-wrap"><table class="modern-table module-data-table" data-module-store="personnel"><thead><tr><th>Таб. №</th><th>ФИО</th><th>Подразделение</th><th>Профессия по ШР</th><th>Разряд</th><th>Смена</th><th>Дата приема</th><th>Состояние</th></tr></thead><tbody>
      <tr class="selected"><td>01042</td><td>Иванов Сергей Петрович</td><td>Механический участок</td><td>Токарь</td><td>5</td><td>1</td><td>12.03.2018</td><td>Работает</td></tr>
      <tr><td>01108</td><td>Петров Алексей Викторович</td><td>Механический участок</td><td>Фрезеровщик</td><td>6</td><td>2</td><td>05.07.2016</td><td>Работает</td></tr>
      <tr><td>01216</td><td>Смирнов Игорь Николаевич</td><td>Сборочный участок</td><td>Слесарь механосборочных работ</td><td>5</td><td>1</td><td>21.09.2020</td><td>Работает</td></tr>
      <tr><td>01331</td><td>Кузнецов Павел Андреевич</td><td>Сварочный участок</td><td>Электрогазосварщик</td><td>6</td><td>1</td><td>14.02.2015</td><td>Работает</td></tr>
    </tbody></table></div>
  </section>`);

pageViews.operations = modulePage('Справочник технологических операций', 'Проектирование технологических процессов', `
  <section class="page-intro"><div><span class="eyebrow">Нормативно-справочная информация</span><h2>Основные технологические операции</h2><p>Типовой перечень операций, применяемых при разработке технологических процессов.</p></div></section>
  <section class="content-card module-table-card">
    <div class="card-heading"><div><span class="eyebrow">Справочник операций</span><h3>Технологические операции</h3></div><div class="row-actions"><button class="primary-button" data-module-action="add">Добавить операцию</button><button class="ghost-button" data-module-action="edit">Изменить</button><button class="ghost-button danger" data-module-action="delete">Удалить</button></div></div>
    <div class="module-filters"><label>Вид работ<select><option>Все виды работ</option><option>Заготовительные</option><option>Токарные</option><option>Фрезерные</option><option>Слесарные</option><option>Сварочные</option></select></label><label>Наименование<input type="search" placeholder="Поиск операции"></label><label>Действует<select><option>Да</option><option>Нет</option><option>Все</option></select></label></div>
    <div class="modern-table-wrap"><table class="modern-table module-data-table" data-module-store="operations"><thead><tr><th>Код</th><th>Наименование операции</th><th>Вид работ</th><th>Оборудование</th><th>Мин. разряд</th><th>Единица нормирования</th><th>Обозначение ЕСТД</th><th>Действует</th></tr></thead><tbody>
      <tr class="selected"><td>010</td><td>Заготовительная</td><td>Заготовительные</td><td>Ленточнопильный станок</td><td>3</td><td>нормо-час</td><td>010</td><td>Да</td></tr>
      <tr><td>020</td><td>Токарная с ЧПУ</td><td>Токарные</td><td>Токарный станок с ЧПУ</td><td>4</td><td>нормо-час</td><td>020</td><td>Да</td></tr>
      <tr><td>030</td><td>Фрезерная с ЧПУ</td><td>Фрезерные</td><td>Обрабатывающий центр</td><td>4</td><td>нормо-час</td><td>030</td><td>Да</td></tr>
      <tr><td>040</td><td>Слесарная</td><td>Слесарные</td><td>Верстак слесарный</td><td>3</td><td>нормо-час</td><td>040</td><td>Да</td></tr>
      <tr><td>050</td><td>Сварочная</td><td>Сварочные</td><td>Сварочный пост</td><td>5</td><td>нормо-час</td><td>050</td><td>Да</td></tr>
      <tr><td>060</td><td>Контрольная</td><td>Контроль</td><td>Контрольно-измерительный участок</td><td>4</td><td>нормо-час</td><td>060</td><td>Да</td></tr>
    </tbody></table></div>
  </section>`);

pageViews.timesheet = modulePage('Табельный учет рабочего времени', 'Плановый и фактический учет', `
  <section class="page-intro"><div><span class="eyebrow">Учет рабочего времени</span><h2>Табель основных производственных рабочих</h2><p>Сопоставление планового и фактического времени для анализа выработки и загрузки работников.</p></div></section>
  <section class="module-metrics"><article><span>2 016</span><small>плановых часов</small></article><article><span>1 948</span><small>фактических часов</small></article><article><span>96,6%</span><small>коэффициент загрузки</small></article><article><span>1,08</span><small>коэффициент выработки</small></article></section>
  <section class="content-card module-table-card">
    <div class="card-heading"><div><span class="eyebrow">Расчетный период</span><h3>Август 2026</h3></div><div class="row-actions"><button class="primary-button" data-module-action="add">Добавить строку</button><button class="ghost-button" data-module-action="edit">Изменить</button><button class="ghost-button danger" data-module-action="delete">Удалить</button></div></div>
    <div class="module-filters"><label>Месяц<input type="month" value="2026-08"></label><label>Подразделение<select><option>Все подразделения</option><option>Механический участок</option><option>Сборочный участок</option></select></label><label>Работник<input type="search" placeholder="ФИО или табельный номер"></label></div>
    <div class="modern-table-wrap"><table class="modern-table module-data-table timesheet-table" data-module-store="timesheet"><thead><tr><th>Таб. №</th><th>Работник</th><th>Профессия</th><th>Разряд</th><th>План, ч</th><th>Факт, ч</th><th>Неявка, ч</th><th>Сверхурочно, ч</th><th>Выработка, н-ч</th><th>Коэф. выработки</th><th>Коэф. загрузки</th></tr></thead><tbody>
      <tr class="selected"><td>01042</td><td>Иванов С.П.</td><td>Токарь</td><td>5</td><td>168</td><td>164</td><td>4</td><td>8</td><td>177,1</td><td>1,08</td><td>97,6%</td></tr>
      <tr><td>01108</td><td>Петров А.В.</td><td>Фрезеровщик</td><td>6</td><td>168</td><td>168</td><td>0</td><td>6</td><td>184,8</td><td>1,10</td><td>100,0%</td></tr>
      <tr><td>01216</td><td>Смирнов И.Н.</td><td>Слесарь МСР</td><td>5</td><td>168</td><td>156</td><td>12</td><td>0</td><td>159,1</td><td>1,02</td><td>92,9%</td></tr>
      <tr><td>01331</td><td>Кузнецов П.А.</td><td>Электрогазосварщик</td><td>6</td><td>168</td><td>160</td><td>8</td><td>4</td><td>174,4</td><td>1,09</td><td>95,2%</td></tr>
    </tbody></table></div>
  </section>`);

pageViews['materials-1c'] = modulePage('Фактическое наличие материалов', 'Интеграция с 1С', `
  <section class="page-intro one-c-page-intro">
    <div><span class="eyebrow">Обмен данными с 1С</span><h2>Остатки материалов</h2><p>Получение фактического наличия материалов для проверки обеспеченности технологических процессов.</p></div>
    <div class="one-c-intro-status"><span class="status-pill success" id="one-c-status">Готов к обмену</span><small id="one-c-last-exchange">Источник данных не выбран</small></div>
  </section>
  <section class="one-c-methods" aria-label="Способы обмена с 1С">
    <article class="content-card one-c-connection-card one-c-method-card one-c-method-direct">
      <header class="one-c-method-heading"><span class="one-c-step">01</span><div><span class="eyebrow">Прямое подключение</span><h3>Получить данные из 1С</h3></div><span class="one-c-method-badge">Онлайн</span></header>
      <div class="one-c-connection-fields">
        <label class="one-c-field one-c-field-wide"><span class="one-c-field-label">Адрес сервиса 1С <em>*</em></span><span class="one-c-input-shell"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10 13a5 5 0 0 0 7.1.1l2-2a5 5 0 0 0-7-7.1l-1.2 1.2M14 11a5 5 0 0 0-7.1-.1l-2 2a5 5 0 0 0 7 7.1l1.2-1.2"/></svg><input id="one-c-endpoint" type="url" placeholder="https://1c-server/odata/.../ОстаткиМатериалов"></span><small>Полный URL ресурса, возвращающего остатки в формате JSON.</small></label>
        <label class="one-c-field"><span class="one-c-field-label">Пользователь 1С</span><span class="one-c-input-shell"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 21a8 8 0 0 0-16 0M12 13a5 5 0 1 0 0-10 5 5 0 0 0 0 10Z"/></svg><input id="one-c-user" type="text" autocomplete="username" placeholder="Введите пользователя"></span></label>
        <label class="one-c-field"><span class="one-c-field-label">Пароль 1С</span><span class="one-c-input-shell"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 11V8a5 5 0 0 1 10 0v3M5 11h14v10H5V11Z"/></svg><input id="one-c-password" type="password" autocomplete="current-password" placeholder="Введите пароль"><button type="button" class="one-c-password-toggle" data-action="toggle-1c-password" aria-label="Показать пароль">Показать</button></span></label>
      </div>
      <footer class="one-c-method-footer one-c-method-footer-buttons"><div class="row-actions one-c-method-actions"><button class="ghost-button" data-action="test-1c">Проверить подключение</button><button class="primary-button" data-action="sync-1c">Получить остатки</button></div></footer>
    </article>
    <article class="content-card one-c-import-card one-c-method-card one-c-method-file">
      <header class="one-c-method-heading"><span class="one-c-step">02</span><div><span class="eyebrow">Файл обмена</span><h3>Загрузить выгрузку из 1С</h3></div><span class="one-c-method-badge">Файл</span></header>
      <label class="one-c-dropzone" for="one-c-file"><input id="one-c-file" type="file" accept=".csv,.json,.xlsx,.xls"><span class="one-c-upload-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M12 16V4M7 9l5-5 5 5M5 14v6h14v-6"/></svg></span><strong id="one-c-file-name">Выберите файл выгрузки</strong><small>Нажмите на область, чтобы выбрать файл</small></label>
      <div class="one-c-format-list"><span><b>CSV / JSON</b><small>читаются в браузере</small></span><span><b>XLS / XLSX</b><small>передаются серверу</small></span></div>
      <footer class="one-c-method-footer"><span><b>Максимальный размер:</b> 20 МБ</span><button class="primary-button" data-action="import-1c">Импортировать файл</button></footer>
    </article>
  </section>
  <section class="content-card module-table-card">
    <div class="card-heading"><div><span class="eyebrow">Складские данные</span><h3>Фактическое наличие</h3></div><div class="row-actions"><button class="ghost-button" data-module-action="edit">Изменить</button><button class="ghost-button danger" data-module-action="delete">Удалить</button><span class="status-pill" id="one-c-count">4 позиции</span></div></div>
    <div class="modern-table-wrap"><table class="modern-table module-data-table" data-module-store="materials1c" id="one-c-table"><thead><tr><th>Номенклатурный №</th><th>Материал</th><th>Ед.</th><th>Склад</th><th>Фактический остаток</th><th>Зарезервировано</th><th>Доступно</th><th>Дата обмена</th></tr></thead><tbody>
      <tr class="selected"><td>МАТ-000184</td><td>Круг 40 Сталь 45</td><td>кг</td><td>ЦС-01</td><td>1240,5</td><td>315,0</td><td>925,5</td><td>31.08.2026 08:45</td></tr>
      <tr><td>МАТ-000327</td><td>Лист 12 09Г2С</td><td>кг</td><td>ЦС-02</td><td>860,0</td><td>240,0</td><td>620,0</td><td>31.08.2026 08:45</td></tr>
      <tr><td>МАТ-000512</td><td>Проволока Св-08Г2С</td><td>кг</td><td>ЦС-03</td><td>188,4</td><td>54,0</td><td>134,4</td><td>31.08.2026 08:45</td></tr>
      <tr><td>МАТ-000774</td><td>Труба 108×8 Сталь 20</td><td>м</td><td>ЦС-01</td><td>96,0</td><td>42,0</td><td>54,0</td><td>31.08.2026 08:45</td></tr>
    </tbody></table></div>
  </section>`);

const app = document.querySelector('#app');
app.innerHTML = pageViews[document.body.dataset.page] || pageViews.home;

const sharedNavigation = document.querySelector('[data-shared-navigation]');
if (sharedNavigation) {
  const navigationSource = document.createElement('template');
  navigationSource.innerHTML = pageViews.home;
  sharedNavigation.innerHTML = navigationSource.content.querySelector('.familiar-nav').innerHTML;
}

document.querySelectorAll('.familiar-nav').forEach((menu) => {
  const moduleItem = document.createElement('div');
  moduleItem.className = 'nav-item';
  moduleItem.dataset.menu = '11';
  moduleItem.innerHTML = `<button class="nav-button" data-href=""><span class="nav-icon nav-icon-directory" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M4 5h6l2 2h8v12H4V5Z"/><path d="M8 11h8M8 15h5"/></svg></span><span class="nav-label">Персонал и справочники</span></button><div class="dropdown"><a href="personnel.html">Персонал и разряды по ШР</a><a href="operations.html">Технологические операции</a><a href="timesheet.html">Табельный учет</a><a href="materials-1c.html">Материалы из 1С</a></div>`;
  const settingsItem = menu.querySelector('[data-menu="8"]');
  menu.insertBefore(moduleItem, settingsItem || null);
});

document.querySelectorAll('.familiar-nav a').forEach((link) => {
  if (link.getAttribute('href') === `${document.body.dataset.page}.html`) {
    link.closest('.nav-item')?.classList.add('current');
  }
});

document.querySelectorAll('.familiar-nav').forEach((menu) => {
  const settings = menu.querySelector('[data-menu="8"]');
  const help = menu.querySelector('[data-menu="9"]');
  if (settings && help) menu.insertBefore(settings, help);
});

const currentRole = sessionStorage.getItem('oecRole') || 'technologist';
const currentUser = sessionStorage.getItem('oecUser') || 'user';
const currentName = sessionStorage.getItem('oecFullName') || currentUser;

const pageRoles = {
  admin: ['admin'],
  'annual-plan': ['admin', 'manager'],
  'plan-a': ['admin', 'manager'],
  'plan-b': ['admin', 'manager'],
  entry: ['admin', 'technologist'],
  materials: ['admin', 'technologist'],
  settings: ['admin', 'technologist'],
  cam: ['admin', 'technologist'],
  standards: ['admin', 'normalizer'],
  form2: ['admin', 'manager', 'normalizer'],
  production: ['admin', 'manager'],
  reports: ['admin', 'manager', 'normalizer'],
  processes: ['admin', 'manager', 'technologist'],
  personnel: ['admin', 'manager'],
  operations: ['admin', 'technologist'],
  timesheet: ['admin', 'manager', 'normalizer'],
  'materials-1c': ['admin', 'technologist'],
  orders: ['admin', 'manager', 'technologist', 'normalizer'],
  products: ['admin', 'manager', 'technologist', 'normalizer'],
  help: ['admin', 'manager', 'technologist', 'normalizer'],
  home: ['admin', 'manager', 'technologist', 'normalizer']
};

const pageFiles = {
  'index.html': 'home',
  'entry.html': 'entry',
  'annual-plan.html': 'annual-plan',
  'plan-a.html': 'plan-a',
  'plan-b.html': 'plan-b',
  'orders.html': 'orders',
  'products.html': 'products',
  'processes.html': 'processes',
  'personnel.html': 'personnel',
  'operations.html': 'operations',
  'timesheet.html': 'timesheet',
  'materials-1c.html': 'materials-1c',
  'materials.html': 'materials',
  'settings.html': 'settings',
  'standards.html': 'standards',
  'form2.html': 'form2',
  'production.html': 'production',
  'cam.html': 'cam',
  'reports.html': 'reports',
  'help.html': 'help',
  'admin.html': 'admin'
};

function pageFromHref(href) {
  return pageFiles[String(href || '').split('?')[0].split('/').pop()];
}

function canOpenPage(page) {
  return !pageRoles[page] || pageRoles[page].includes(currentRole);
}

if (!canOpenPage(document.body.dataset.page)) {
  window.location.replace('index.html');
}

const actionRoles = {
  'add-user': ['admin'],
  'edit-user': ['admin'],
  'delete-user': ['admin'],
  'edit-server': ['admin'],
  'test-server': ['admin'],
  'add-order': ['admin', 'technologist'],
  'edit-order': ['admin', 'technologist'],
  'delete-order': ['admin', 'technologist'],
  'save-order': ['admin', 'technologist'],
  'save-order-new': ['admin', 'technologist'],
  'save-order-exit': ['admin', 'technologist'],
  'clear-entry': ['admin', 'technologist'],
  'new-process': ['admin', 'technologist'],
  'edit-process': ['admin', 'technologist'],
  'delete-process': ['admin', 'technologist'],
  'add-deviation': ['admin', 'manager', 'normalizer'],
  'edit-deviation': ['admin', 'manager', 'normalizer'],
  'delete-deviation': ['admin', 'manager', 'normalizer'],
  'approve-process': ['admin', 'manager'],
  'calculate-material': ['admin', 'technologist', 'normalizer']
};

function canRun(action) {
  return !actionRoles[action] || actionRoles[action].includes(currentRole);
}

function updateAccountPanel() {
  document.querySelectorAll('.user-meta strong').forEach((node) => {
    node.textContent = currentName;
  });
  document.querySelectorAll('.user-avatar:not(.user-avatar-image)').forEach((node) => {
    node.textContent = currentUser.slice(0, 2).toUpperCase();
  });
  const greeting = document.querySelector('.welcome-message');
  if (greeting) greeting.textContent = `${greeting.textContent.split(',')[0]}, ${currentName}`;
  if (currentRole !== 'admin') {
    document.querySelectorAll('[data-href="admin.html"]').forEach((button) => button.closest('.nav-item')?.remove());
  }
  document.querySelectorAll('.nav-button[data-href]').forEach((button) => {
    const page = pageFromHref(button.dataset.href);
    if (page && !canOpenPage(page)) button.closest('.nav-item').hidden = true;
  });
  document.querySelectorAll('.dropdown a').forEach((link) => {
    const page = pageFromHref(link.getAttribute('href'));
    if (page && !canOpenPage(page)) link.hidden = true;
  });
  document.querySelectorAll('.nav-item').forEach((item) => {
    const links = [...item.querySelectorAll('.dropdown a')];
    const button = item.querySelector('.nav-button');
    if (links.length && !button?.dataset.href && links.every((link) => link.hidden)) item.hidden = true;
  });
  document.querySelectorAll('[data-action]').forEach((button) => {
    if (!canRun(button.dataset.action)) button.hidden = true;
  });
}

function applySettingsPermissions() {
  const tabs = [...document.querySelectorAll('[data-settings-tab]')];
  if (!tabs.length) return;

  tabs.forEach((tab) => {
    const allowedRoles = tab.dataset.settingsRoles.split(',');
    tab.hidden = !allowedRoles.includes(currentRole);
  });

  const activeTab = tabs.find((tab) => tab.classList.contains('active') && !tab.hidden)
    || tabs.find((tab) => !tab.hidden);
  if (!activeTab) return;

  tabs.forEach((tab) => tab.classList.toggle('active', tab === activeTab));
  document.querySelectorAll('[data-settings-panel]').forEach((panel) => {
    panel.hidden = panel.dataset.settingsPanel !== activeTab.dataset.settingsTab;
  });
  const heading = document.querySelector('.settings-content > .dialog-heading');
  if (heading) heading.textContent = activeTab.textContent.trim();
}

let settingsEditor = null;

function settingsListKey(list) {
  return `atppSettings_${list.dataset.settingsList}`;
}

function saveSettingsList(list) {
  const values = [...list.querySelectorAll('button')].map((button) => button.textContent.trim());
  localStorage.setItem(settingsListKey(list), JSON.stringify(values));
}

function renderSettingsList(list, values) {
  list.replaceChildren();
  values.forEach((value, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = value;
    if (index === 0) button.classList.add('selected');
    list.append(button);
  });
}

function initializeSettingsLists() {
  document.querySelectorAll('[data-settings-list]').forEach((list) => {
    try {
      const saved = JSON.parse(localStorage.getItem(settingsListKey(list)) || 'null');
      if (Array.isArray(saved) && saved.length) renderSettingsList(list, saved);
    } catch {
      localStorage.removeItem(settingsListKey(list));
    }
  });
}

function savePlanPeriods(table) {
  const rows = [...table.tBodies[0].rows].map((row) => [...row.cells].map((cell) => cell.textContent.trim()));
  localStorage.setItem('atppSettings_planPeriods', JSON.stringify(rows));
}

function renderPlanPeriods(table, rows) {
  const body = table.tBodies[0];
  body.replaceChildren();
  rows.forEach((values, rowIndex) => {
    const row = body.insertRow();
    if (rowIndex === 0) row.classList.add('selected');
    values.slice(0, 5).forEach((value) => {
      row.insertCell().textContent = value;
    });
  });
}

function initializePlanPeriods() {
  const table = document.querySelector('.settings-quarter-table table');
  if (!table) return;
  try {
    const saved = JSON.parse(localStorage.getItem('atppSettings_planPeriods') || 'null');
    if (Array.isArray(saved) && saved.length) renderPlanPeriods(table, saved);
  } catch {
    localStorage.removeItem('atppSettings_planPeriods');
  }
}

function setPlanRowEditing(row, editing) {
  if (!row) return;
  row.dataset.editing = String(editing);
  [...row.cells].forEach((cell) => {
    cell.contentEditable = String(editing);
  });
  if (editing) row.cells[0]?.focus();
}

function handleSettingsPlanAction(button) {
  const table = button.closest('.settings-quarter-table')?.querySelector('table');
  const body = table?.tBodies[0];
  if (!table || !body) return;
  let selected = body.querySelector('tr.selected');
  const action = button.dataset.settingsPlanAction;

  if (action === 'add') {
    body.querySelectorAll('tr').forEach((row) => row.classList.remove('selected'));
    selected = body.insertRow();
    selected.className = 'selected';
    ['Новый год', '0', '0', '0', '0'].forEach((value) => selected.insertCell().textContent = value);
    setPlanRowEditing(selected, true);
    button.parentElement.querySelector('[data-settings-plan-action="edit"]').textContent = 'Сохранить';
    savePlanPeriods(table);
    return;
  }
  if (!selected) return;

  if (action === 'edit') {
    const editing = selected.dataset.editing === 'true';
    setPlanRowEditing(selected, !editing);
    button.textContent = editing ? 'Изменить' : 'Сохранить';
    if (editing) savePlanPeriods(table);
  }
  if (action === 'delete' && window.confirm(`Удалить период «${selected.cells[0].textContent.trim()}»?`)) {
    const nextSelected = selected.nextElementSibling || selected.previousElementSibling;
    selected.remove();
    nextSelected?.classList.add('selected');
    button.parentElement.querySelector('[data-settings-plan-action="edit"]').textContent = 'Изменить';
    savePlanPeriods(table);
  }
}

function openSettingsItemDialog(list, mode) {
  const selected = list.querySelector('button.selected');
  if (mode === 'edit' && !selected) return;

  const isStaff = list.dataset.settingsList === 'staff';
  const form = document.querySelector('#settings-item-form');
  const dialog = document.querySelector('#settings-item-dialog');
  settingsEditor = { list, mode, selected };
  document.querySelector('#settings-item-title').textContent = mode === 'add'
    ? `Добавить ${isStaff ? 'исполнителя' : 'группу'}`
    : `Изменить ${isStaff ? 'исполнителя' : 'группу'}`;
  document.querySelector('#settings-item-label').textContent = isStaff ? 'ФИО исполнителя' : 'Название группы';
  form.elements.itemName.placeholder = isStaff ? 'Например: Иванов И.И.' : 'Например: Комната 308';
  form.elements.itemName.value = mode === 'edit' ? selected.textContent.trim() : '';
  dialog.showModal();
  form.elements.itemName.focus();
}

function handleSettingsListAction(button) {
  const panel = button.closest('[data-settings-panel]');
  const list = panel?.querySelector('[data-settings-list]');
  if (!list) return;

  const selected = list.querySelector('button.selected');
  const action = button.dataset.settingsListAction;
  if (action === 'add' || action === 'edit') {
    openSettingsItemDialog(list, action);
    return;
  }
  if (!selected) return;

  if (action === 'up' && selected.previousElementSibling) {
    list.insertBefore(selected, selected.previousElementSibling);
    saveSettingsList(list);
  }
  if (action === 'delete' && window.confirm(`Удалить запись «${selected.textContent.trim()}»?`)) {
    const nextSelected = selected.nextElementSibling || selected.previousElementSibling;
    selected.remove();
    nextSelected?.classList.add('selected');
    saveSettingsList(list);
  }
}

function closeMenus(except = null) {
  document.querySelectorAll('.nav-item.open').forEach((item) => {
    if (item !== except) item.classList.remove('open');
  });
}

function selectRow(row) {
  row.closest('tbody')?.querySelectorAll('tr').forEach((item) => item.classList.remove('selected'));
  row.classList.add('selected');
  updateOrderDetails(row);
}

const orderStageDates = {
  '1256': ['27.03.2008', '', '', '', '', '', '04.02.2016', '17.05.2016', '17.05.2016', '25.05.2016', '25.05.2016', ''],
  '1587': ['21.11.2013', '', '', '', '', '', '10.06.2014', '10.06.2014', '10.06.2014', '30.06.2014', '30.06.2014', '13.02.2015'],
  '3600': ['03.03.2016', '', '', '', '', '', '', '', '', '', '', '']
};

function renderOrderItems(cells, orderNumber) {
  const body = document.querySelector('#portfolio-items-body');
  if (!body) return;
  const dates = orderStageDates[orderNumber] || [cells[13] || '', '', '', '', '', '', '', '', '', '', '', ''];
  const values = [
    cells[1], cells[3], cells[4], cells[2], cells[5], cells[8], cells[15], cells[9],
    cells[17], cells[10] ? `${cells[10]} - плановый` : '', ...dates
  ];
  const row = document.createElement('tr');
  values.forEach((value) => {
    const cell = document.createElement('td');
    cell.textContent = value || '';
    row.append(cell);
  });
  body.replaceChildren(row);
  const count = document.querySelector('#portfolio-items-count');
  if (count) count.textContent = `${cells[8] || 1} ед.`;
}

function renderProductCard(cells) {
  const title = document.querySelector('#selected-product-title');
  const drawing = document.querySelector('#selected-product-drawing');
  if (!title || !drawing) return;
  const details = {
    name: cells[3],
    drawing: cells[4],
    drawingCount: cells[5],
    unaccounted: cells[15] === '0%' ? '0%' : '20%',
    labor: cells[18] || '301,89 н.ч.',
    orders: cells[0]
  };
  title.textContent = details.name || 'Изделие';
  drawing.textContent = `Чертеж ${details.drawing || 'не указан'}`;
  document.querySelectorAll('[data-product-detail]').forEach((field) => {
    field.textContent = details[field.dataset.productDetail] || '';
  });
}

function updateOrderDetails(row) {
  if (!row?.dataset.order) return;
  const cells = [...row.cells].map((cell) => cell.textContent.trim());
  const values = {
    number: row.dataset.order || cells[0],
    year: cells[5] || cells[6],
    quarter: cells[6] || cells[7],
    stage: cells[1] || cells[9],
    request: cells[2] || cells[10],
    note: cells[7] || cells[14]
  };
  document.querySelectorAll('[data-order-detail]').forEach((field) => {
    field.value = values[field.dataset.orderDetail] || '';
  });
  const title = document.querySelector('#portfolio-items-title');
  if (title) {
    const prefix = title.textContent.split('№')[0];
    title.textContent = `${prefix}№${values.number}`;
  }
  renderOrderItems(cells, values.number);
  renderProductCard(cells);
}

function selectedRow() {
  return document.querySelector('.data-grid tbody tr.selected, .modern-table tbody tr.selected');
}

function toggleRowEditing(row) {
  if (!row) return;
  const editing = row.dataset.editing === 'true';
  row.dataset.editing = String(!editing);
  [...row.cells].forEach((cell) => {
    if (!cell.querySelector('button, input, select')) cell.contentEditable = String(!editing);
  });
  if (!editing) row.cells[0]?.focus();
}

function addEditableRow() {
  const body = document.querySelector('.data-grid tbody, .modern-table tbody');
  const sample = body?.querySelector('tr');
  if (!body || !sample) return;
  const row = sample.cloneNode(true);
  row.classList.add('selected');
  row.removeAttribute('data-order');
  row.removeAttribute('data-process');
  [...row.cells].forEach((cell) => {
    if (!cell.querySelector('button')) {
      cell.textContent = '';
      cell.contentEditable = 'true';
    }
  });
  body.querySelectorAll('tr').forEach((item) => item.classList.remove('selected'));
  body.prepend(row);
  row.cells[0]?.focus();
}

function moduleTableKey(table) {
  return `atppModule_${table.dataset.moduleStore}`;
}

function saveModuleTable(table) {
  const rows = [...table.tBodies[0].rows].map((row) => [...row.cells].map((cell) => cell.textContent.trim()));
  localStorage.setItem(moduleTableKey(table), JSON.stringify(rows));
}

function renderModuleTable(table, rows) {
  const body = table.tBodies[0];
  body.replaceChildren();
  rows.forEach((values, rowIndex) => {
    const row = body.insertRow();
    if (rowIndex === 0) row.classList.add('selected');
    const columnCount = table.tHead.rows[0].cells.length;
    for (let index = 0; index < columnCount; index += 1) {
      row.insertCell().textContent = values[index] || '';
    }
  });
}

function initializeModuleTables() {
  document.querySelectorAll('[data-module-store]').forEach((table) => {
    try {
      const saved = JSON.parse(localStorage.getItem(moduleTableKey(table)) || 'null');
      if (Array.isArray(saved) && saved.length) renderModuleTable(table, saved);
    } catch {
      localStorage.removeItem(moduleTableKey(table));
    }
  });
  updateOneCCount();
}

function recalculateTimesheetRow(row) {
  if (!row?.closest('.timesheet-table')) return;
  const number = (index) => Number(row.cells[index]?.textContent.replace(',', '.')) || 0;
  const plan = number(4);
  const fact = number(5);
  const output = number(8);
  row.cells[9].textContent = fact ? (output / fact).toFixed(2).replace('.', ',') : '0,00';
  row.cells[10].textContent = plan ? `${(fact / plan * 100).toFixed(1).replace('.', ',')}%` : '0,0%';
}

function setModuleRowEditing(row, editing) {
  if (!row) return;
  row.dataset.editing = String(editing);
  [...row.cells].forEach((cell) => {
    cell.contentEditable = String(editing);
  });
  if (editing) row.cells[0]?.focus();
}

function handleModuleAction(button) {
  const card = button.closest('.module-table-card');
  const table = card?.querySelector('[data-module-store]');
  const body = table?.tBodies[0];
  if (!table || !body) return;
  let selected = body.querySelector('tr.selected');
  const action = button.dataset.moduleAction;

  if (action === 'add') {
    body.querySelectorAll('tr').forEach((row) => row.classList.remove('selected'));
    selected = body.insertRow();
    selected.className = 'selected';
    for (let index = 0; index < table.tHead.rows[0].cells.length; index += 1) selected.insertCell();
    setModuleRowEditing(selected, true);
    card.querySelector('[data-module-action="edit"]').textContent = 'Сохранить';
    saveModuleTable(table);
    return;
  }
  if (!selected) return;

  if (action === 'edit') {
    const editing = selected.dataset.editing === 'true';
    if (editing) recalculateTimesheetRow(selected);
    setModuleRowEditing(selected, !editing);
    button.textContent = editing ? 'Изменить' : 'Сохранить';
    if (editing) saveModuleTable(table);
  }
  if (action === 'delete' && window.confirm('Удалить выбранную запись?')) {
    const nextSelected = selected.nextElementSibling || selected.previousElementSibling;
    selected.remove();
    nextSelected?.classList.add('selected');
    card.querySelector('[data-module-action="edit"]')?.replaceChildren('Изменить');
    saveModuleTable(table);
    updateOneCCount();
  }
}

function updateOneCCount() {
  const count = document.querySelectorAll('#one-c-table tbody tr').length;
  const node = document.querySelector('#one-c-count');
  const lastTwoDigits = count % 100;
  const lastDigit = count % 10;
  const label = lastTwoDigits >= 11 && lastTwoDigits <= 14
    ? 'позиций'
    : lastDigit === 1
      ? 'позиция'
      : lastDigit >= 2 && lastDigit <= 4
        ? 'позиции'
        : 'позиций';
  if (node) node.textContent = `${count} ${label}`;
}

function materialRowsFromJson(data) {
  const source = Array.isArray(data) ? data : data.materials || data.value;
  if (!Array.isArray(source)) return [];
  return source.map((item) => Array.isArray(item) ? item : [
    item.code || item.nomenclature || item.Код || item.НоменклатурныйНомер || '',
    item.name || item.material || item.Наименование || item.Материал || '',
    item.unit || item.ЕдиницаИзмерения || item.Единица || '',
    item.warehouse || item.Склад || '',
    item.stock || item.quantity || item.Остаток || item.Количество || '',
    item.reserved || item.Зарезервировано || item.Резерв || '',
    item.available || item.Доступно || item.СвободныйОстаток || '',
    item.exchangeDate || item.ДатаОбмена || item.Период || new Date().toLocaleString('ru-RU')
  ]);
}

function materialRowsFromCsv(text) {
  const lines = text.split(/\r?\n/).filter((line) => line.trim());
  if (!lines.length) return [];
  const delimiter = lines[0].includes(';') ? ';' : ',';
  const rows = lines.map((line) => line.split(delimiter).map((cell) => cell.trim().replace(/^"|"$/g, '')));
  if (/код|номенклат|материал/i.test(rows[0].join(' '))) rows.shift();
  return rows;
}

async function importOneCData() {
  const input = document.querySelector('#one-c-file');
  const status = document.querySelector('#one-c-status');
  const table = document.querySelector('#one-c-table');
  const file = input?.files[0];
  if (!file || !table) {
    if (status) {
      status.classList.remove('success');
      status.textContent = 'Выберите файл обмена';
    }
    return;
  }
  if (file.size > 20 * 1024 * 1024) {
    if (status) {
      status.classList.remove('success');
      status.textContent = 'Размер файла превышает 20 МБ';
    }
    return;
  }

  const extension = file.name.split('.').pop().toLowerCase();
  if (extension === 'xls' || extension === 'xlsx') {
    localStorage.setItem('atpp1cLastFile', file.name);
    if (status) {
      status.classList.add('success');
      status.textContent = 'Файл принят для серверной обработки';
    }
    return;
  }

  try {
    if (status) {
      status.classList.remove('success');
      status.textContent = 'Чтение файла…';
    }
    const text = await file.text();
    const rows = extension === 'json' ? materialRowsFromJson(JSON.parse(text)) : materialRowsFromCsv(text);
    if (!rows.length) throw new Error('empty');
    renderModuleTable(table, rows);
    saveModuleTable(table);
    updateOneCCount();
    updateOneCExchangeMeta(`Файл ${file.name}`);
    if (status) {
      status.classList.add('success');
      status.textContent = `Импортировано: ${rows.length}`;
    }
  } catch {
    if (status) {
      status.classList.remove('success');
      status.textContent = 'Не удалось прочитать файл';
    }
  }
}

function updateOneCExchangeMeta(source) {
  const text = `${source} · ${new Date().toLocaleString('ru-RU')}`;
  localStorage.setItem('atpp1cLastExchange', text);
  const node = document.querySelector('#one-c-last-exchange');
  if (node) node.textContent = text;
}

function oneCConnectionSettings() {
  const endpoint = document.querySelector('#one-c-endpoint')?.value.trim() || '';
  const username = document.querySelector('#one-c-user')?.value.trim() || '';
  const password = document.querySelector('#one-c-password')?.value || '';
  if (endpoint || username) {
    localStorage.setItem('atpp1cConnection', JSON.stringify({ endpoint, username }));
  }
  const headers = { Accept: 'application/json' };
  if (username || password) headers.Authorization = `Basic ${btoa(unescape(encodeURIComponent(`${username}:${password}`)))}`;
  return { endpoint, headers };
}

function initializeOneCConnection() {
  try {
    const saved = JSON.parse(localStorage.getItem('atpp1cConnection') || 'null');
    const endpoint = document.querySelector('#one-c-endpoint');
    const username = document.querySelector('#one-c-user');
    if (saved && endpoint) endpoint.value = saved.endpoint || '';
    if (saved && username) username.value = saved.username || '';
  } catch {
    localStorage.removeItem('atpp1cConnection');
  }
  const exchange = localStorage.getItem('atpp1cLastExchange');
  const exchangeNode = document.querySelector('#one-c-last-exchange');
  if (exchange && exchangeNode) exchangeNode.textContent = exchange;
}

async function requestOneCData(loadRows = false) {
  const status = document.querySelector('#one-c-status');
  const table = document.querySelector('#one-c-table');
  const { endpoint, headers } = oneCConnectionSettings();
  if (!endpoint) {
    if (status) status.textContent = 'Укажите адрес сервиса 1С';
    document.querySelector('#one-c-endpoint')?.focus();
    return;
  }

  try {
    new URL(endpoint);
  } catch {
    if (status) status.textContent = 'Проверьте адрес сервиса 1С';
    return;
  }

  if (status) {
    status.classList.remove('success');
    status.textContent = loadRows ? 'Получение остатков…' : 'Проверка подключения…';
  }

  try {
    const response = await fetch(endpoint, { method: 'GET', headers });
    if (!response.ok) throw new Error(String(response.status));
    if (!loadRows) {
      if (status) {
        status.classList.add('success');
        status.textContent = 'Подключение к 1С установлено';
      }
      return;
    }

    const rows = materialRowsFromJson(await response.json());
    if (!rows.length || !table) throw new Error('empty');
    renderModuleTable(table, rows);
    saveModuleTable(table);
    updateOneCCount();
    updateOneCExchangeMeta('Прямое подключение к 1С');
    if (status) {
      status.classList.add('success');
      status.textContent = `Получено из 1С: ${rows.length}`;
    }
  } catch {
    if (status) {
      status.classList.remove('success');
      status.textContent = '1С недоступна или обмен запрещен сервером';
    }
  }
}

function addDeviationRow(button) {
  const form = button.closest('fieldset');
  const body = document.querySelector('.deviation-page .data-grid tbody');
  const sample = body?.querySelector('tr');
  if (!form || !body || !sample) return;

  const value = (name) => form.querySelector(`[data-deviation-field="${name}"]`)?.value || '';
  const row = sample.cloneNode(true);
  const date = value('date').split('-').reverse().join('.');
  body.querySelectorAll('tr').forEach((item) => item.classList.remove('selected'));
  row.className = 'selected';
  row.dataset.order = value('order');
  row.cells[0].textContent = value('order');
  row.cells[3].textContent = value('work');
  row.cells[12].textContent = date;
  row.cells[14].textContent = value('reason');
  body.prepend(row);
}

function exportTable(table, fileName = document.title) {
  if (!table) return;
  const content = table.outerHTML;
  const blob = new Blob(['\ufeff', content], { type: 'application/vnd.ms-excel;charset=utf-8' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${fileName.replace(/[\\/:*?"<>|]/g, '_')}.xls`;
  document.body.append(link);
  link.click();
  URL.revokeObjectURL(link.href);
  link.remove();
}

function calculateMaterial() {
  const diameter = Number(document.querySelector('#blank-diameter')?.value) / 1000;
  const length = Number(document.querySelector('#blank-length')?.value) / 1000;
  const count = Number(document.querySelector('#blank-count')?.value);
  const partWeight = Number(document.querySelector('#part-weight')?.value);
  if (!diameter || !length || !count || !partWeight) return;
  const blankWeight = Math.PI * (diameter / 2) ** 2 * length * 7850;
  const total = blankWeight * count;
  const useful = partWeight * count;
  const ratio = Math.min(useful / total, 1);
  const waste = Math.max(total - useful, 0);
  const totalNode = document.querySelector('#material-total');
  const blankNode = document.querySelector('#blank-weight');
  const ratioNode = document.querySelector('#kim-value');
  const wasteNode = document.querySelector('#waste-value');
  if (totalNode) totalNode.textContent = total.toFixed(1).replace('.', ',');
  if (blankNode) blankNode.firstChild.textContent = blankWeight.toFixed(2).replace('.', ',');
  if (ratioNode) ratioNode.textContent = ratio.toFixed(3).replace('.', ',');
  if (wasteNode) wasteNode.firstChild.textContent = waste.toFixed(1).replace('.', ',');
  const progress = document.querySelector('#kim-progress');
  if (progress) progress.style.width = `${ratio * 100}%`;
}

function loadUsers() {
  return JSON.parse(localStorage.getItem('atppUsers') || '[]');
}

function saveUsers(users) {
  localStorage.setItem('atppUsers', JSON.stringify(users));
}

function roleLabels() {
  return Object.fromEntries([...document.querySelectorAll('#user-form [name="role"] option')].map((option) => [option.value, option.textContent]));
}

function renderUsers() {
  const body = document.querySelector('#admin-users-body');
  const template = document.querySelector('#admin-user-row');
  if (!body || !template) return;
  body.replaceChildren();
  const labels = roleLabels();
  const users = loadUsers();
  users.forEach((user) => {
    const fragment = template.content.cloneNode(true);
    const row = fragment.querySelector('tr');
    row.dataset.username = user.username;
    fragment.querySelector('[data-user-avatar]').textContent = user.username.slice(0, 2).toUpperCase();
    fragment.querySelector('[data-user-login]').textContent = user.username;
    fragment.querySelector('[data-user-name]').textContent = user.fullName;
    fragment.querySelector('[data-user-role]').textContent = labels[user.role] || user.role;
    if (user.username === 'admin') fragment.querySelector('[data-action="delete-user"]').disabled = true;
    body.append(fragment);
  });
  const counter = document.querySelector('#users-count');
  if (counter) {
    const suffix = counter.dataset.suffix || counter.textContent.replace(/^\d+\s*/, '');
    counter.dataset.suffix = suffix;
    counter.textContent = `${users.length} ${suffix}`.trim();
  }
}

function openUserDialog(username = '') {
  const dialog = document.querySelector('#user-dialog');
  const form = document.querySelector('#user-form');
  if (!dialog || !form) return;
  form.reset();
  const user = loadUsers().find((item) => item.username === username);
  form.elements.originalUsername.value = user?.username || '';
  form.elements.username.value = user?.username || '';
  form.elements.fullName.value = user?.fullName || '';
  form.elements.password.value = user?.password || '';
  form.elements.role.value = user?.role || 'technologist';
  form.elements.username.readOnly = user?.username === 'admin';
  dialog.showModal();
}

function saveUserForm() {
  const form = document.querySelector('#user-form');
  if (!form) return;
  const data = new FormData(form);
  const original = data.get('originalUsername');
  const user = {
    username: String(data.get('username')).trim(),
    fullName: String(data.get('fullName')).trim(),
    password: String(data.get('password')),
    role: String(data.get('role'))
  };
  const users = loadUsers();
  const index = users.findIndex((item) => item.username === original);
  if (index >= 0) users[index] = { ...users[index], ...user };
  else users.push(user);
  saveUsers(users);
  document.querySelector('#user-dialog')?.close();
  renderUsers();
}

function deleteUser(username) {
  if (!username || username === 'admin') return;
  saveUsers(loadUsers().filter((user) => user.username !== username));
  renderUsers();
}

function serverDefaults() {
  const values = {};
  document.querySelectorAll('[data-server-value]').forEach((node) => {
    values[node.dataset.serverValue] = node.textContent.trim();
  });
  values.password = '';
  return values;
}

function loadServer() {
  return { ...serverDefaults(), ...JSON.parse(localStorage.getItem('atppServer') || 'null') };
}

function renderServer() {
  const server = loadServer();
  document.querySelectorAll('[data-server-value]').forEach((node) => {
    node.textContent = server[node.dataset.serverValue] || '';
  });
}

function openServerDialog() {
  const dialog = document.querySelector('#server-dialog');
  const form = document.querySelector('#server-form');
  if (!dialog || !form) return;
  const server = loadServer();
  Object.entries(server).forEach(([key, value]) => {
    if (form.elements[key]) form.elements[key].value = value;
  });
  dialog.showModal();
}

function saveServerForm() {
  const data = Object.fromEntries(new FormData(document.querySelector('#server-form')).entries());
  localStorage.setItem('atppServer', JSON.stringify(data));
  document.querySelector('#server-dialog')?.close();
  renderServer();
}

function showReport(shouldScroll = true) {
  const select = document.querySelector('#report-select');
  const preview = document.querySelector('#report-preview');
  if (!select || !preview) return;
  const title = preview.querySelector('[data-report-title]');
  if (title) title.textContent = select.selectedOptions[0].textContent;
  preview.hidden = false;
  if (shouldScroll) preview.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function initializeReportPage() {
  const select = document.querySelector('#report-select');
  if (!select) return;
  const requestedReport = new URLSearchParams(window.location.search).get('report');
  if (requestedReport && [...select.options].some((option) => option.value === requestedReport)) {
    select.value = requestedReport;
  }
  showReport(false);
}

function handleAction(button) {
  const action = button.dataset.action;
  if (!canRun(action)) return;
  if (action === 'reset-search') {
    const search = document.querySelector('#order-search');
    if (search) search.value = '';
    document.querySelectorAll('.data-grid tbody tr').forEach((row) => row.hidden = false);
  } else if (action === 'export-current') {
    exportTable(document.querySelector('.data-grid, .modern-table, .planning-table-card table'));
  } else if (action === 'calculate-material') {
    calculateMaterial();
  } else if (action === 'import-1c') {
    importOneCData();
  } else if (action === 'test-1c') {
    requestOneCData(false);
  } else if (action === 'sync-1c') {
    requestOneCData(true);
  } else if (action === 'toggle-1c-password') {
    const password = document.querySelector('#one-c-password');
    if (!password) return;
    const showPassword = password.type === 'password';
    password.type = showPassword ? 'text' : 'password';
    button.textContent = showPassword ? 'Скрыть' : 'Показать';
    button.setAttribute('aria-label', showPassword ? 'Скрыть пароль' : 'Показать пароль');
  } else if (action === 'add-user') {
    openUserDialog();
  } else if (action === 'edit-user') {
    openUserDialog(button.closest('tr')?.dataset.username);
  } else if (action === 'delete-user') {
    deleteUser(button.closest('tr')?.dataset.username);
  } else if (action === 'edit-server') {
    openServerDialog();
  } else if (action === 'test-server') {
    button.closest('.content-card')?.querySelector('.status-pill')?.classList.add('success');
  } else if (action === 'add-order' || action === 'new-process') {
    addEditableRow();
  } else if (action === 'edit-order' || action === 'edit-process') {
    toggleRowEditing(selectedRow());
  } else if (action === 'delete-order' || action === 'delete-process') {
    selectedRow()?.remove();
  } else if (action === 'add-deviation') {
    addDeviationRow(button);
  } else if (action === 'edit-deviation') {
    toggleRowEditing(document.querySelector('.deviation-page .data-grid tbody tr.selected'));
  } else if (action === 'delete-deviation') {
    document.querySelector('.deviation-page .data-grid tbody tr.selected')?.remove();
  } else if (action === 'approve-process') {
    selectedRow()?.classList.add('approved');
  } else if (action === 'select-operation') {
    document.querySelectorAll('.operation-card').forEach((card) => card.classList.remove('selected'));
    button.classList.add('selected');
  } else if (action === 'show-selected-report') {
    showReport();
  } else if (action === 'download-current-report' || action === 'download-all-reports') {
    exportTable(document.querySelector('#report-preview table, .data-grid, .modern-table'));
  } else if (action === 'clear-entry') {
    button.closest('form')?.reset();
  } else {
    button.classList.add('completed');
  }
}

document.addEventListener('click', (event) => {
  const close = event.target.closest('[data-dialog-close]');
  if (close) {
    document.querySelector(`#${close.dataset.dialogClose}`)?.close();
    return;
  }
  if (event.target.closest('#logout-button')) {
    sessionStorage.clear();
    window.location.replace('login.html');
    return;
  }
  const navigation = event.target.closest('.nav-button');
  if (navigation) {
    const item = navigation.closest('.nav-item');
    closeMenus(item);
    if (navigation.dataset.href) window.location.href = navigation.dataset.href;
    else item?.classList.toggle('open');
    return;
  }
  const direct = event.target.closest('[data-go]');
  if (direct) {
    window.location.href = direct.dataset.go;
    return;
  }
  const moduleAction = event.target.closest('[data-module-action]');
  if (moduleAction) {
    handleModuleAction(moduleAction);
    return;
  }
  const settingsListAction = event.target.closest('[data-settings-list-action]');
  if (settingsListAction) {
    handleSettingsListAction(settingsListAction);
    return;
  }
  const settingsPlanAction = event.target.closest('[data-settings-plan-action]');
  if (settingsPlanAction) {
    handleSettingsPlanAction(settingsPlanAction);
    return;
  }
  const settingsPlanRow = event.target.closest('.settings-quarter-table tbody tr');
  if (settingsPlanRow) {
    const body = settingsPlanRow.closest('tbody');
    const editedRow = body.querySelector('tr[data-editing="true"]');
    if (editedRow && editedRow !== settingsPlanRow) setPlanRowEditing(editedRow, false);
    body.querySelectorAll('tr').forEach((row) => row.classList.toggle('selected', row === settingsPlanRow));
    settingsPlanRow.closest('.settings-quarter-table').querySelector('[data-settings-plan-action="edit"]').textContent = settingsPlanRow.dataset.editing === 'true' ? 'Сохранить' : 'Изменить';
    savePlanPeriods(settingsPlanRow.closest('table'));
    return;
  }
  const settingsListItem = event.target.closest('.settings-list button');
  if (settingsListItem) {
    settingsListItem.closest('.settings-list').querySelectorAll('button').forEach((item) => item.classList.remove('selected'));
    settingsListItem.classList.add('selected');
    return;
  }
  const settingsTab = event.target.closest('[data-settings-tab]');
  if (settingsTab) {
    document.querySelectorAll('[data-settings-tab]').forEach((button) => button.classList.toggle('active', button === settingsTab));
    document.querySelectorAll('[data-settings-panel]').forEach((panel) => {
      panel.hidden = panel.dataset.settingsPanel !== settingsTab.dataset.settingsTab;
    });
    const heading = document.querySelector('.settings-content > .dialog-heading');
    if (heading) heading.textContent = settingsTab.textContent.trim();
    return;
  }
  const action = event.target.closest('[data-action]');
  if (action) {
    handleAction(action);
    return;
  }
  const moduleRow = event.target.closest('.module-data-table tbody tr');
  if (moduleRow) {
    const table = moduleRow.closest('[data-module-store]');
    const body = moduleRow.closest('tbody');
    const editedRow = body.querySelector('tr[data-editing="true"]');
    if (editedRow && editedRow !== moduleRow) {
      recalculateTimesheetRow(editedRow);
      setModuleRowEditing(editedRow, false);
      saveModuleTable(table);
    }
    body.querySelectorAll('tr').forEach((row) => row.classList.toggle('selected', row === moduleRow));
    const editButton = moduleRow.closest('.module-table-card')?.querySelector('[data-module-action="edit"]');
    if (editButton) editButton.textContent = moduleRow.dataset.editing === 'true' ? 'Сохранить' : 'Изменить';
    return;
  }
  const row = event.target.closest('tbody tr');
  if (row) selectRow(row);
  if (!event.target.closest('.nav-item')) closeMenus();
});

document.addEventListener('input', (event) => {
  if (event.target.id !== 'order-search') return;
  const query = event.target.value.trim().toLowerCase();
  document.querySelectorAll('.data-grid tbody tr').forEach((row) => {
    row.hidden = !row.textContent.toLowerCase().includes(query);
  });
});

document.addEventListener('change', (event) => {
  if (event.target.id === 'report-select') {
    showReport(false);
    return;
  }
  if (event.target.id === 'one-c-file') {
    const fileName = document.querySelector('#one-c-file-name');
    const file = event.target.files[0];
    if (fileName) fileName.textContent = file ? file.name : 'Выберите файл выгрузки';
    return;
  }
  if (event.target.id !== 'nx-file' || !event.target.files[0]) return;
  const name = document.querySelector('#import-file-name');
  const status = document.querySelector('#import-status');
  if (name) name.textContent = event.target.files[0].name;
  if (status) status.hidden = false;
});

document.querySelector('#user-form')?.addEventListener('submit', (event) => {
  event.preventDefault();
  saveUserForm();
});

document.querySelector('#server-form')?.addEventListener('submit', (event) => {
  event.preventDefault();
  saveServerForm();
});

document.querySelector('#settings-item-form')?.addEventListener('submit', (event) => {
  event.preventDefault();
  if (!settingsEditor) return;

  const value = event.currentTarget.elements.itemName.value.trim();
  if (!value) return;
  const { list, mode, selected } = settingsEditor;

  list.querySelectorAll('button').forEach((item) => item.classList.remove('selected'));
  if (mode === 'edit') {
    selected.textContent = value;
    selected.classList.add('selected');
  } else {
    const item = document.createElement('button');
    item.type = 'button';
    item.textContent = value;
    item.className = 'selected';
    list.append(item);
  }
  saveSettingsList(list);
  document.querySelector('#settings-item-dialog').close();
  settingsEditor = null;
});

updateAccountPanel();
applySettingsPermissions();
initializeSettingsLists();
initializePlanPeriods();
initializeModuleTables();
initializeOneCConnection();
renderUsers();
renderServer();
initializeReportPage();
updateOrderDetails(document.querySelector('.data-grid tbody tr.selected'));
