/* Connect the original interface to the Django session and PostgreSQL API. */
const csrfToken = () => decodeURIComponent(document.cookie.match(/(?:^|; )csrftoken=([^;]+)/)?.[1] || '');
const apiHeaders = () => ({ 'Content-Type': 'application/json', 'X-CSRFToken': csrfToken() });

function installTppFields() {
  const main = document.querySelector('.order-entry-main');
  const options = document.querySelector('.order-entry-options');
  if (main && options) {
    main.insertAdjacentHTML('beforeend', '<label>Плановый запуск <input data-entry="start-date" type="date" required></label><label>Плановый выпуск <input data-entry="due-date" type="date" required></label>');
    const priority = [...options.querySelectorAll('label')].find(label => label.textContent.includes('Приоритет'));
    const prioritySelect = priority?.querySelector('select');
    if (prioritySelect) {
      prioritySelect.dataset.entry = 'priority';
      [...prioritySelect.options].forEach((option, index) => { option.value = String(index === 0 ? 2 : 1); });
    }
  }
  const deviationForm = document.querySelector('.deviation-form-grid');
  if (deviationForm) {
    const hours = document.createElement('label');
    hours.innerHTML = '<span>Часы</span><input class="field" data-deviation-field="hours" type="number" min="0.01" step="0.01" value="8">';
    deviationForm.querySelector('[data-deviation-field="date"]')?.closest('label')?.after(hours);
    const reason = deviationForm.querySelector('[data-deviation-field="reason"]');
    ['Нет материала', 'Неисправность оборудования', 'Нехватка персонала', 'Технологическая проблема', 'Контроль качества', 'Прочее']
      .forEach(value => reason.add(new Option(value, value)));
    const today = new Date();
    deviationForm.querySelector('[data-deviation-field="date"]').value =
      `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    deviationForm.querySelector('[data-deviation-field="order"]').addEventListener('input', () => updateDeviationJobs());
    const [year, month] = document.querySelectorAll('.deviation-period-grid select');
    year.dataset.deviationPeriod = 'year'; month.dataset.deviationPeriod = 'month';
    year.replaceChildren(new Option('Все годы', '')); month.replaceChildren(new Option('Все месяцы', ''));
    year.addEventListener('change', filterDeviations); month.addEventListener('change', filterDeviations);
    document.querySelector('.deviation-period-grid [data-report]').dataset.action = 'deviation-report-preview';
  }
}

function connectTppTables() {
  const tableEndpoint = table => {
    const base = `/api/legacy/table/${encodeURIComponent(table.dataset.moduleStore)}/`;
    if (table.dataset.moduleStore === 'operations') {
      const active = [...document.querySelectorAll('.module-filters select')][1]?.value;
      return active === 'Нет' || active === 'Все' ? `${base}?include_inactive=1` : base;
    }
    if (table.dataset.moduleStore !== 'timesheet') return base;
    const month = document.querySelector('.module-filters input[type="month"]')?.value || '';
    return `${base}?month=${encodeURIComponent(month)}`;
  };
  window.saveModuleTable = async function(table) {
    if (table.tBodies[0].querySelector('tr[data-editing="true"]')) return;
    const rows = [...table.tBodies[0].rows].map(row => [...row.cells].map(cell => cell.textContent.trim()));
    const endpoint = tableEndpoint(table);
    try {
      const response = await fetch(endpoint, {
        method: 'PUT', headers: apiHeaders(), body: JSON.stringify({ rows })
      });
      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || 'Не удалось сохранить таблицу');
      }
      const saved = await fetch(endpoint);
      if (saved.ok) { renderModuleTable(table, (await saved.json()).rows); applyModuleFilters(); }
    } catch (error) {
      legacyNotice(error.message, true);
      const saved = await fetch(endpoint);
      if (saved.ok) { renderModuleTable(table, (await saved.json()).rows); applyModuleFilters(); }
    }
  };
  document.querySelectorAll('[data-module-store]').forEach(table => {
    fetch(tableEndpoint(table))
      .then(response => response.ok ? response.json() : null)
      .then(data => { if (Array.isArray(data?.rows)) { renderModuleTable(table, data.rows); applyModuleFilters(); } if (typeof updateOneCCount === 'function') updateOneCCount(); })
      .catch(error => legacyNotice(error.message, true));
  });
  document.querySelector('.timesheet-table')?.closest('.module-table-card')
    ?.querySelector('input[type="month"]')?.addEventListener('change', event => {
      const table = document.querySelector('.timesheet-table');
      fetch(tableEndpoint(table)).then(response => response.json())
        .then(data => { renderModuleTable(table, data.rows); applyModuleFilters(); })
        .catch(error => legacyNotice(error.message, true));
      const month = event.target.value;
      const heading = table.closest('.module-table-card')?.querySelector('.card-heading h3');
      if (heading && month) heading.textContent = new Intl.DateTimeFormat('ru-RU', { month: 'long', year: 'numeric' }).format(new Date(`${month}-01T12:00:00`));
    });
  if (document.body.dataset.page === 'operations') {
    const status = [...document.querySelectorAll('.module-filters select')][1];
    status?.addEventListener('change', () => {
      const table = document.querySelector('[data-module-store="operations"]');
      fetch(tableEndpoint(table)).then(response => response.json())
        .then(data => { renderModuleTable(table, data.rows); applyModuleFilters(); })
        .catch(error => legacyNotice(error.message, true));
    });
  }
}

function connectSettings() {
  const lists = document.querySelectorAll('[data-settings-list]');
  if (!lists.length) return;
  const save = (key, rows) => fetch(`/api/legacy/table/${key}/`, {
    method: 'PUT', headers: apiHeaders(), body: JSON.stringify({ rows })
  }).then(response => { if (!response.ok) throw new Error('Не удалось сохранить настройки'); })
    .catch(error => { legacyNotice(error.message, true); return false; });
  window.saveSettingsList = list => save(`settings-${list.dataset.settingsList}`,
    [...list.querySelectorAll('button')].map(button => [button.textContent.trim()]));
  window.savePlanPeriods = table => save('settings-periods',
    [...table.tBodies[0].rows].map(row => [...row.cells].map(cell => cell.textContent.trim())));
  const columnPanel = document.querySelector('[data-settings-panel="tables"]');
  const columnRows = () => [...columnPanel.querySelectorAll('section')].flatMap((section, group) =>
    [...section.querySelectorAll('label')].map(label => [String(group), label.textContent.trim(), label.querySelector('input').checked]));
  window.saveSettingsColumns = () => save('settings-columns', columnRows());
  fetch('/api/legacy/table/settings-columns/')
    .then(response => response.ok ? response.json() : null)
    .then(data => {
      if (!data?.rows?.length) return;
      const saved = new Map(data.rows.map(row => [`${row[0]}:${row[1]}`, row[2]]));
      [...columnPanel.querySelectorAll('section')].forEach((section, group) =>
        section.querySelectorAll('label').forEach(label => {
          const key = `${group}:${label.textContent.trim()}`;
          if (saved.has(key)) label.querySelector('input').checked = saved.get(key) === true;
        }));
    }).catch(error => legacyNotice(error.message, true));
  const planInputs = [...document.querySelectorAll('[data-settings-panel="plan"] fieldset input')];
  window.saveSettingsPlanInputs = () => {
    if (planInputs.some(input => !Number.isInteger(Number(input.value)) || Number(input.value) < 0)) {
      legacyNotice('Параметры плана должны быть целыми неотрицательными числами', true);
      return Promise.resolve(false);
    }
    return save('settings-plan-inputs', planInputs.map((input, index) => [String(index), input.value]));
  };
  fetch('/api/legacy/table/settings-plan-inputs/')
    .then(response => response.ok ? response.json() : null)
    .then(data => data?.rows?.forEach(row => { if (planInputs[Number(row[0])]) planInputs[Number(row[0])].value = row[1]; }))
    .catch(error => legacyNotice(error.message, true));
  lists.forEach(list => fetch(`/api/legacy/table/settings-${list.dataset.settingsList}/`)
    .then(response => response.ok ? response.json() : null)
    .then(data => { if (data?.rows?.length) renderSettingsList(list, data.rows.map(row => row[0])); })
    .catch(error => legacyNotice(error.message, true)));
  const periods = document.querySelector('.settings-quarter-table table');
  if (periods) fetch('/api/legacy/table/settings-periods/')
    .then(response => response.ok ? response.json() : null)
    .then(data => { if (data?.rows?.length) renderPlanPeriods(periods, data.rows); })
    .catch(error => legacyNotice(error.message, true));
}

function connectMaterialCalculator() {
  if (document.body.dataset.page !== 'materials') return;
  window.calculateMaterial = function() {
    const material = document.querySelector('#material-type');
    const shape = document.querySelectorAll('.calculator-card .modern-form-grid select')[1];
    const density = [7850, 2640, 4430][material?.selectedIndex || 0];
    const widthOrDiameter = Number(document.querySelector('#blank-diameter')?.value);
    const length = Number(document.querySelector('#blank-length')?.value);
    const count = Number(document.querySelector('#blank-count')?.value);
    const partWeight = Number(document.querySelector('#part-weight')?.value);
    if (![widthOrDiameter, length, count, partWeight].every(value => Number.isFinite(value) && value > 0)) {
      legacyNotice('Введите положительные размеры, количество и массу детали', true); return;
    }
    let volume;
    if (shape?.selectedIndex === 1) {
      const thickness = Number(prompt('Толщина листа, мм:', '12'));
      if (!Number.isFinite(thickness) || thickness <= 0) {
        legacyNotice('Укажите положительную толщину листа', true); return;
      }
      volume = widthOrDiameter * length * thickness / 1e9;
    } else {
      volume = Math.PI * (widthOrDiameter / 2000) ** 2 * (length / 1000);
    }
    const blankWeight = volume * density;
    if (partWeight > blankWeight) { legacyNotice('Масса детали больше массы заготовки', true); return; }
    const total = blankWeight * count;
    const ratio = partWeight / blankWeight;
    const waste = total - partWeight * count;
    document.querySelector('#material-total').textContent = total.toFixed(1).replace('.', ',');
    document.querySelector('#blank-weight').firstChild.textContent = blankWeight.toFixed(2).replace('.', ',');
    document.querySelector('#kim-value').textContent = ratio.toFixed(3).replace('.', ',');
    document.querySelector('#waste-value').firstChild.textContent = waste.toFixed(1).replace('.', ',');
    document.querySelector('#kim-progress').style.width = `${Math.min(ratio * 100, 100)}%`;
  };
}

async function loadMaterialsFromServer() {
  if (document.body.dataset.page !== 'materials') return;
  const response = await fetch('/api/legacy/materials/');
  if (!response.ok) throw new Error('Не удалось загрузить справочник материалов');
  const { materials } = await response.json();
  const table = document.querySelector('.calculator-grid + .content-card table');
  if (!table) return;
  const headers = ['Материал', 'Код', 'Ед.', 'Остаток', 'Доступно'];
  const heading = table.tHead?.rows[0];
  if (heading) { heading.replaceChildren(); headers.forEach(value => {
    const cell = document.createElement('th'); cell.textContent = value; heading.append(cell);
  }); }
  const body = table.tBodies[0];
  body.replaceChildren();
  materials.forEach(item => {
    const row = body.insertRow();
    [item.name, item.code, item.unit, item.stock, item.available].forEach(value => row.insertCell().textContent = value);
  });
}

async function loadDashboardFromServer() {
  if (document.body.dataset.page !== 'home') return;
  const response = await fetch('/api/legacy/dashboard/');
  if (!response.ok) throw new Error('Не удалось загрузить показатели главной страницы');
  const data = await response.json();
  const greeting = document.querySelector('.welcome-message');
  if (greeting) greeting.textContent = `Добрый день, ${sessionStorage.getItem('oecFullName') || 'пользователь'}`;
  const readiness = document.querySelector('.hero-stat strong');
  if (readiness) readiness.textContent = `${data.readiness}%`;
  const progress = document.querySelector('.hero-stat .progress i');
  if (progress) progress.style.width = `${data.readiness}%`;
  const total = document.querySelector('.hero-stat small');
  if (total) total.textContent = `${data.quantity} изделий в ${data.orders} заказах`;
  [data.workplaces, data.technologists, data.normalizers, data.managers].forEach((value, index) => {
    const node = document.querySelectorAll('.metric-grid .metric-card strong')[index];
    if (node) node.textContent = value;
  });
}

function legacyNotice(message, error = false) {
  const node = document.createElement('div');
  node.className = 'server-toast' + (error ? ' error' : '');
  node.textContent = message;
  document.body.append(node);
  setTimeout(() => node.remove(), 4000);
}

function legacyDate(value) {
  if (!value) return '';
  const parts = value.split('-');
  return parts.length === 3 ? `${parts[2]}.${parts[1]}.${parts[0]}` : value;
}

// Редактирование справочников выполняется одной записью, без замены всей таблицы.
function openModuleEditor(table, row) {
  const key = table.dataset.moduleStore;
  const original = row?.cells[0]?.textContent.trim() || '';
  const dialog = document.createElement('dialog');
  dialog.className = 'form-modal';
  const form = document.createElement('form');
  form.className = 'form-modal-body';
  const title = document.createElement('h2');
  title.textContent = row ? 'Изменить запись' : 'Добавить запись';
  const grid = document.createElement('div'); grid.className = 'form-modal-grid';
  const fields = [];
  [...table.tHead.rows[0].cells].forEach((heading, index) => {
    const label = document.createElement('label'); label.className = 'form-modal-field';
    const caption = document.createElement('span'); caption.textContent = heading.textContent.trim();
    const input = document.createElement('input'); input.value = row?.cells[index]?.textContent.trim() || '';
    if (key === 'personnel' && index === 6) { input.type = 'date'; input.value = isoDate(input.value); }
    if (key === 'timesheet' && (index >= 9 || (index >= 1 && index <= 3))) {
      input.readOnly = true; input.title = 'Значение рассчитывается или берётся из справочника персонала';
    }
    label.append(caption, input); grid.append(label); fields.push(input);
  });
  const error = document.createElement('p'); error.setAttribute('role', 'alert'); error.className = 'editor-error';
  const footer = document.createElement('footer');
  const cancel = document.createElement('button'); cancel.type = 'button'; cancel.className = 'ghost-button'; cancel.textContent = 'Отмена';
  const save = document.createElement('button'); save.className = 'primary-button'; save.textContent = 'Сохранить';
  footer.append(cancel, save); form.append(title, grid, error, footer); dialog.append(form); document.body.append(dialog);
  cancel.addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => dialog.remove());
  form.addEventListener('submit', async event => {
    event.preventDefault(); save.disabled = true; error.textContent = '';
    const values = fields.map(input => input.value.trim());
    if (key === 'personnel' && values[6]) values[6] = legacyDate(values[6]);
    try {
      const response = await fetch(`/api/legacy/table/${encodeURIComponent(key)}/row/`, {
        method: 'POST', headers: apiHeaders(), body: JSON.stringify({ row: values, original,
          month: document.querySelector('.module-filters input[type="month"]')?.value || '' })
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Не удалось сохранить запись');
      const suffix = key === 'timesheet' ? `?month=${encodeURIComponent(document.querySelector('.module-filters input[type="month"]')?.value || '')}`
        : key === 'operations' ? '?include_inactive=1' : '';
      const updated = await fetch(`/api/legacy/table/${encodeURIComponent(key)}/${suffix}`);
      if (!updated.ok) throw new Error('Запись сохранена, но таблицу не удалось обновить');
      renderModuleTable(table, (await updated.json()).rows); applyModuleFilters();
      dialog.close(); legacyNotice('Запись сохранена');
    } catch (exc) { error.textContent = exc.message; } finally { save.disabled = false; }
  });
  dialog.showModal();
}

document.addEventListener('click', event => {
  const planButton = event.target.closest('[data-settings-plan-action="edit"], [data-settings-plan-action="add"]');
  if (planButton) {
    event.preventDefault(); event.stopImmediatePropagation();
    const table = planButton.closest('.settings-quarter-table').querySelector('table');
    const selected = table.tBodies[0].querySelector('tr.selected');
    if (planButton.dataset.settingsPlanAction === 'edit' && !selected) { legacyNotice('Выберите период', true); return; }
    const row = planButton.dataset.settingsPlanAction === 'edit' ? selected : null;
    const dialog = document.createElement('dialog'); dialog.className = 'form-modal';
    const form = document.createElement('form'); form.className = 'form-modal-body';
    const title = document.createElement('h2'); title.textContent = row ? 'Изменить период' : 'Добавить период';
    const grid = document.createElement('div'); grid.className = 'form-modal-grid';
    const inputs = [...table.tHead.rows[0].cells].map((cell, index) => {
      const label = document.createElement('label'); label.className = 'form-modal-field';
      const caption = document.createElement('span'); caption.textContent = cell.textContent.trim();
      const input = document.createElement('input'); input.type = 'number'; input.min = index ? '0' : '2000'; input.max = index ? '100000' : '2100'; input.step = '1'; input.required = true;
      input.value = row?.cells[index]?.textContent.trim() || (index ? '0' : String(new Date().getFullYear()));
      label.append(caption, input); grid.append(label); return input;
    });
    const error = document.createElement('p'); error.setAttribute('role', 'alert'); error.className = 'editor-error';
    const footer = document.createElement('footer');
    const cancel = document.createElement('button'); cancel.type = 'button'; cancel.className = 'ghost-button'; cancel.textContent = 'Отмена';
    const save = document.createElement('button'); save.className = 'primary-button'; save.textContent = 'Сохранить';
    footer.append(cancel, save); form.append(title, grid, error, footer); dialog.append(form); document.body.append(dialog);
    cancel.addEventListener('click', () => dialog.close()); dialog.addEventListener('close', () => dialog.remove());
    form.addEventListener('submit', async e => { e.preventDefault();
      const values = inputs.map(input => input.value.trim());
      const rows = [...table.tBodies[0].rows].map(existing => existing === row ? values : [...existing.cells].map(cell => cell.textContent.trim()));
      if (!row) rows.push(values);
      if (rows.filter(values2 => values2[0] === values[0]).length > 1) { error.textContent = 'Этот год уже существует'; return; }
      try {
        const response = await fetch('/api/legacy/table/settings-periods/', { method: 'PUT', headers: apiHeaders(), body: JSON.stringify({rows}) });
        const data = await response.json(); if (!response.ok) throw new Error(data.error || 'Не удалось сохранить период');
        renderPlanPeriods(table, rows); dialog.close(); legacyNotice('Период сохранён');
      } catch (exc) { error.textContent = exc.message; }
    });
    dialog.showModal(); return;
  }
  const button = event.target.closest('[data-module-action="edit"], [data-module-action="add"]');
  if (!button) return;
  const table = button.closest('.module-table-card')?.querySelector('[data-module-store]');
  if (!table || !['personnel', 'operations', 'timesheet'].includes(table.dataset.moduleStore)) return;
  event.preventDefault(); event.stopImmediatePropagation();
  const row = table.tBodies[0].querySelector('tr.selected');
  if (button.dataset.moduleAction === 'edit' && !row) { legacyNotice('Выберите запись', true); return; }
  openModuleEditor(table, button.dataset.moduleAction === 'edit' ? row : null);
}, true);

function openDeviationEditor(row) {
  const dialog = document.createElement('dialog'); dialog.className = 'form-modal';
  dialog.innerHTML = `<form class="form-modal-body"><h2>Изменить отклонение</h2><div class="form-modal-grid">
    <label class="form-modal-field"><span>Заказ</span><select name="order" required></select></label>
    <label class="form-modal-field"><span>Производственное задание</span><select name="job_id" required></select></label>
    <label class="form-modal-field"><span>Дата</span><input name="date" type="date" required></label>
    <label class="form-modal-field"><span>Часы</span><input name="hours" type="number" min="0.01" step="0.01" required></label>
    <label class="form-modal-field"><span>Причина</span><input name="reason" maxlength="200" required></label>
    </div><p role="alert" class="editor-error"></p><footer><button type="button" class="ghost-button">Отмена</button><button class="primary-button">Сохранить</button></footer></form>`;
  document.body.append(dialog); const form = dialog.querySelector('form');
  [...new Set(deviationJobs.map(job => job.order))].forEach(value => form.elements.order.add(new Option(value, value)));
  form.elements.order.value = row.dataset.order;
  const fillJobs = () => { form.elements.job_id.replaceChildren(); deviationJobs.filter(job => job.order === form.elements.order.value)
    .forEach(job => form.elements.job_id.add(new Option(job.label, job.id))); };
  fillJobs(); form.elements.job_id.value = row.dataset.jobId;
  form.elements.order.addEventListener('change', fillJobs);
  ['date', 'hours', 'reason'].forEach(name => { form.elements[name].value = row.dataset[name]; });
  dialog.querySelector('button[type="button"]').addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => dialog.remove());
  form.addEventListener('submit', async event => {
    event.preventDefault(); const save = form.querySelector('button[type="submit"], button:not([type])'); save.disabled = true;
    try {
      const response = await fetch(`/api/legacy/deviations/${row.dataset.deviationPk}/`, {
        method: 'PUT', headers: apiHeaders(), body: JSON.stringify(Object.fromEntries(new FormData(form))) });
      const result = await response.json(); if (!response.ok) throw new Error(result.error || 'Не удалось сохранить');
      await loadDeviationsFromServer(); dialog.close(); legacyNotice('Отклонение сохранено');
    } catch (exc) { dialog.querySelector('[role="alert"]').textContent = exc.message; } finally { save.disabled = false; }
  });
  dialog.showModal();
}

function isoDate(value) {
  const match = String(value || '').trim().match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
  return match ? `${match[3]}-${match[2]}-${match[1]}` : value;
}

// Встроенный календарь браузера открывается по нажатию на поле даты.
document.addEventListener('click', event => {
  const input = event.target.closest('input[type="date"], input[type="month"]');
  if (input && !input.disabled && typeof input.showPicker === 'function') {
    try { input.showPicker(); } catch (_) { /* Браузер сам покажет свой календарь. */ }
  }
});

function normingFields() {
  return Object.fromEntries(['year', 'quarter', 'drawings', 'hours', 'factor', 'staff']
    .map(key => [key, document.querySelector(`[data-norming="${key}"]`)]));
}

function showNormingResult(data, preview = false) {
  const output = document.querySelector('#norming-result');
  if (!output) return;
  const fields = normingFields();
  fields.drawings.value = data.drawing_count;
  const factor = Number(fields.factor.value);
  const hours = Number(fields.hours.value);
  const staff = Number(fields.staff.value);
  const planned = (Number(data.base_hours) * factor).toFixed(2);
  const capacity = (hours * staff).toFixed(2);
  const deficit = Math.max(Number(planned) - Number(capacity), 0).toFixed(2);
  const changed = Boolean(data.approval && (Number(data.approval.planned_hours) !== Number(planned) ||
    Number(data.approval.actual_hours) !== Number(data.actual_hours) ||
    Number(data.approval.capacity_hours) !== Number(capacity) ||
    Number(data.approval.drawing_count || data.drawing_count) !== Number(data.drawing_count)));
  output.textContent = `${preview ? 'Предварительно' : data.approval ? 'Утверждено' : 'Период'}: ` +
    `${data.items} позиций, ${data.drawing_count} чертежей; ` +
    `план ${planned} ч, факт ${data.actual_hours} ч, фонд ${capacity} ч, дефицит ${deficit} ч.` +
    (data.approval && !preview ? ` Утвердил ${data.approval.approved_by}.` : '') +
    (changed && !preview ? ' Данные изменились после утверждения; требуется повторное утверждение.' : '');
  const selected = new Set(data.item_ids.map(String));
  document.querySelectorAll('.data-grid tbody tr').forEach(row => {
    row.hidden = !selected.has(row.dataset.itemPk);
  });
}

async function loadNorming(preview = false) {
  const fields = normingFields();
  const query = new URLSearchParams({ year: fields.year.value, quarter: fields.quarter.value });
  const response = await fetch(`/api/legacy/norming/?${query}`);
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Не удалось получить нормирование');
  if (data.approval && !preview) {
    fields.hours.value = data.approval.hours_per_employee;
    fields.factor.value = data.approval.labor_factor;
    fields.staff.value = data.approval.staff_count;
  }
  showNormingResult(data, preview);
  return data;
}

function initializeNorming() {
  if (document.body.dataset.page !== 'standards') return;
  const fields = normingFields();
  const today = new Date();
  const years = new Set([today.getFullYear()]);
  document.querySelectorAll('.data-grid tbody tr[data-due-date]').forEach(row => years.add(Number(row.dataset.dueDate.slice(0, 4))));
  [...years].sort((a, b) => b - a).forEach(year => fields.year.add(new Option(String(year), String(year))));
  fields.year.value = String(today.getFullYear());
  fields.quarter.value = String(Math.floor(today.getMonth() / 3) + 1);
  if (currentRole === 'economist') document.querySelector('[data-action="norming-approve"]').hidden = true;
  if (currentRole !== 'economist') {
    const approve = document.querySelector('[data-action="norming-approve"]');
    const edit = document.createElement('button'); edit.type = 'button'; edit.className = 'btn'; edit.textContent = 'Изменить нормирование';
    approve.before(edit); edit.addEventListener('click', openNormingEditor);
  }
  for (const field of [fields.year, fields.quarter]) field.addEventListener('change', () =>
    loadNorming().catch(error => legacyNotice(error.message, true)));
  loadNorming().catch(error => legacyNotice(error.message, true));
}

function openNormingEditor() {
  const fields = normingFields(); const dialog = document.createElement('dialog'); dialog.className = 'form-modal';
  dialog.innerHTML = `<form class="form-modal-body"><h2>Изменить нормирование</h2><div class="form-modal-grid">
    <label class="form-modal-field"><span>Часы на работника</span><input name="hours" type="number" min="0.01" max="10000" step="0.01" required></label>
    <label class="form-modal-field"><span>Коэффициент</span><input name="factor" type="number" min="0.01" max="100" step="0.01" required></label>
    <label class="form-modal-field"><span>Численность</span><input name="staff" type="number" min="1" max="10000" step="1" required></label>
    </div><p>Период и количество чертежей определяются выбранным кварталом и заказами.</p><p role="alert" class="editor-error"></p>
    <footer><button type="button" class="ghost-button">Отмена</button><button class="primary-button">Сохранить и утвердить</button></footer></form>`;
  document.body.append(dialog); const form = dialog.querySelector('form');
  ['hours', 'factor', 'staff'].forEach(key => { form.elements[key].value = fields[key].value; });
  dialog.querySelector('button[type="button"]').addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => dialog.remove());
  form.addEventListener('submit', async event => { event.preventDefault();
    try {
      const payload = { year: fields.year.value, quarter: fields.quarter.value, hours_per_employee: form.elements.hours.value,
        labor_factor: form.elements.factor.value, staff_count: form.elements.staff.value };
      const response = await fetch('/api/legacy/norming/', { method: 'POST', headers: apiHeaders(), body: JSON.stringify(payload) });
      const data = await response.json(); if (!response.ok) throw new Error(data.error || 'Не удалось сохранить нормирование');
      ['hours', 'factor', 'staff'].forEach(key => { fields[key].value = form.elements[key].value; });
      showNormingResult(data); dialog.close(); legacyNotice('Нормирование сохранено');
    } catch (error) { dialog.querySelector('[role="alert"]').textContent = error.message; }
  });
  dialog.showModal();
}

function installOrderFilters() {
  if (!document.querySelector('[data-action="filter-orders"]')) return;
  document.body.insertAdjacentHTML('beforeend', `
    <dialog class="backup-dialog order-filter-dialog" id="order-filter-dialog" aria-labelledby="order-filter-title">
      <section class="content-card backup-admin-card">
        <div class="card-heading"><h3 id="order-filter-title">Фильтр заказов</h3>
          <button type="button" class="ghost-button" data-action="close-order-filters">Закрыть</button></div>
        <div class="order-filter-fields">
          <label>Подразделение <select data-order-filter="department"><option value="">Все</option></select></label>
          <label>Изделие <input data-order-filter="product" type="search" placeholder="Наименование или чертёж"></label>
          <label>Приоритет <select data-order-filter="priority"><option value="">Все</option><option value="1">1</option><option value="2">2</option><option value="3">3</option><option value="4">4</option></select></label>
          <label>Стадия <select data-order-filter="status"><option value="">Все</option></select></label>
          <label>Срок до <input data-order-filter="due" type="date"></label>
        </div>
        <div class="product-editor-actions"><button type="button" class="ghost-button" data-action="clear-order-filters">Сбросить</button>
          <button type="button" class="primary-button" data-action="apply-order-filters">Применить</button></div>
      </section>
    </dialog>`);
}

function updateOrderFilterOptions() {
  const dialog = document.querySelector('#order-filter-dialog');
  if (!dialog) return;
  for (const [key, source] of [['department', 'department'], ['status', 'status']]) {
    const select = dialog.querySelector(`[data-order-filter="${key}"]`);
    const current = select.value;
    select.replaceChildren(new Option('Все', ''));
    const values = new Set([...document.querySelectorAll('.data-grid tbody tr')]
      .map(row => source === 'department' ? row.dataset.department : row.cells[9]?.textContent.trim()).filter(Boolean));
    [...values].sort().forEach(value => select.add(new Option(value, value)));
    select.value = current;
  }
}

function applyOrderFilters() {
  const dialog = document.querySelector('#order-filter-dialog');
  if (!dialog) return;
  const field = key => dialog.querySelector(`[data-order-filter="${key}"]`).value;
  const search = document.querySelector('#order-search')?.value.trim().toLowerCase() || '';
  document.querySelectorAll('.data-grid tbody tr').forEach(row => {
    row.hidden = Boolean((field('department') && row.dataset.department !== field('department')) ||
      (field('product') && !`${row.cells[3]?.textContent} ${row.cells[4]?.textContent}`.toLowerCase()
        .includes(field('product').trim().toLowerCase())) ||
      (field('priority') && row.cells[10]?.textContent.trim() !== field('priority')) ||
      (field('status') && row.cells[9]?.textContent.trim() !== field('status')) ||
      (field('due') && row.dataset.dueDate > field('due')) ||
      (search && !row.cells[0]?.textContent.toLowerCase().includes(search)));
  });
}

function applyProductionFilters() {
  if (document.body.dataset.page !== 'production') return;
  const start = document.querySelector('[data-production-date="start"]')?.value || '';
  const end = document.querySelector('[data-production-date="end"]')?.value || '';
  const department = document.querySelector('.side-panel')?.dataset.selectedDepartment || '';
  document.querySelectorAll('.data-grid tbody tr').forEach(row => {
    row.hidden = Boolean((department && row.dataset.department !== department) ||
      (start && row.dataset.dueDate < start) || (end && row.dataset.dueDate > end));
  });
}

function updateProductionDepartments() {
  if (document.body.dataset.page !== 'production') return;
  const departments = [...new Set([...document.querySelectorAll('.data-grid tbody tr')]
    .map(row => row.dataset.department).filter(Boolean))].sort();
  document.querySelectorAll('[data-action="production-department"]').forEach((button, index) => {
    button.hidden = !departments[index];
    if (departments[index]) {
      button.dataset.department = departments[index]; button.textContent = departments[index];
    }
  });
}

let timesheetDepartments = new Map();

function updateTimesheetMetrics(table) {
  if (!table.classList.contains('timesheet-table')) return;
  const rows = [...table.tBodies[0].rows].filter(row => !row.hidden);
  const number = (row, index) => Number(row.cells[index]?.textContent.trim().replace(',', '.')) || 0;
  const plan = rows.reduce((sum, row) => sum + number(row, 4), 0);
  const actual = rows.reduce((sum, row) => sum + number(row, 5), 0);
  const output = rows.reduce((sum, row) => sum + number(row, 8), 0);
  const metrics = [...document.querySelectorAll('.module-metrics article span')];
  if (metrics.length >= 4) {
    metrics[0].textContent = plan.toLocaleString('ru-RU');
    metrics[1].textContent = actual.toLocaleString('ru-RU');
    metrics[2].textContent = plan ? `${(actual / plan * 100).toFixed(1).replace('.', ',')}%` : '0%';
    metrics[3].textContent = actual ? (output / actual).toFixed(2).replace('.', ',') : '0';
  }
}

function applyModuleFilters() {
  const table = document.querySelector('.module-data-table');
  const filters = document.querySelector('.module-filters');
  if (!table || !filters) return;
  const controls = [...filters.querySelectorAll('select, input[type="search"]')];
  const page = document.body.dataset.page;
  const allValue = value => !value || value === 'Все' || value.startsWith('Все ');
  [...table.tBodies[0].rows].forEach(row => {
    const cells = row.cells;
    let visible = true;
    if (page === 'personnel') visible = (allValue(controls[0].value) || cells[2].textContent.trim() === controls[0].value) &&
      cells[3].textContent.toLowerCase().includes(controls[1].value.trim().toLowerCase()) &&
      (allValue(controls[2].value) || cells[7].textContent.trim() === controls[2].value);
    if (page === 'operations') visible = (allValue(controls[0].value) || cells[2].textContent.trim() === controls[0].value) &&
      cells[1].textContent.toLowerCase().includes(controls[1].value.trim().toLowerCase()) &&
      (allValue(controls[2].value) || cells[7].textContent.trim() === controls[2].value);
    if (page === 'timesheet') visible = [cells[0].textContent, cells[1].textContent].join(' ')
      .toLowerCase().includes(controls[1].value.trim().toLowerCase()) &&
      (allValue(controls[0].value) || timesheetDepartments.get(cells[0].textContent.trim()) === controls[0].value);
    row.hidden = !visible;
  });
  const selected = table.tBodies[0].querySelector('tr.selected');
  if (selected?.hidden) {
    selected.classList.remove('selected');
    [...table.tBodies[0].rows].find(row => !row.hidden)?.classList.add('selected');
  }
  updateTimesheetMetrics(table);
}

async function loadTimesheetDepartments() {
  if (document.body.dataset.page !== 'timesheet') return;
  const response = await fetch('/api/legacy/table/timesheet/');
  if (!response.ok) return;
  const { departments } = await response.json();
  timesheetDepartments = new Map(Object.entries(departments || {}));
  const select = document.querySelector('.module-filters select');
  const values = new Set(Object.values(departments || {}).filter(Boolean));
  select.replaceChildren(new Option('Все подразделения', ''));
  [...values].sort().forEach(value => select.add(new Option(value, value)));
  applyModuleFilters();
}

let serverUsers = [];

async function loadDatabaseStatus() {
  const badge = document.querySelector('.server-admin-card .status-pill');
  if (badge) { badge.textContent = 'Проверка…'; badge.classList.remove('success'); }
  try {
    const response = await fetch('/api/admin/database/');
    const data = await response.json();
    if (!response.ok || !data.ok) throw new Error(data.error || 'PostgreSQL недоступна');
    document.querySelectorAll('[data-server-value]').forEach(node => { node.textContent = data[node.dataset.serverValue] || ''; });
    const form = document.querySelector('#server-form');
    if (form) for (const name of ['host', 'port', 'database', 'username']) form.elements[name].value = data[name] || '';
    if (badge) { badge.textContent = 'Подключено'; badge.classList.add('success'); }
  } catch (error) {
    if (badge) badge.textContent = 'Нет подключения';
    legacyNotice(error.message, true);
  }
}

function installDatabaseAdmin() {
  if (document.body.dataset.page !== 'admin') return;
  const form = document.querySelector('#server-form');
  if (form) {
    form.elements.password.required = false;
    form.elements.password.closest('label')?.classList.remove('required');
    form.elements.password.closest('label')?.querySelector('span')?.replaceChildren(document.createTextNode('Новый пароль (если меняется)'));
    form.addEventListener('submit', async event => {
      event.preventDefault(); event.stopImmediatePropagation();
      const payload = Object.fromEntries(new FormData(form).entries());
      try {
        const response = await fetch('/api/admin/database/config/', {
          method: 'POST', headers: apiHeaders(), body: JSON.stringify(payload)
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || 'Не удалось сохранить параметры PostgreSQL');
        document.querySelector('#server-dialog')?.close();
        form.elements.password.value = '';
        legacyNotice(result.message);
        if (result.restart) setTimeout(() => location.reload(), 3500);
        else await loadDatabaseStatus();
      } catch (error) { legacyNotice(error.message, true); }
    }, true);
  }
  const summary = document.querySelector('.admin-summary-grid');
  if (summary) {
    summary.insertAdjacentHTML('afterend', '<div class="backup-launch"><button type="button" class="ghost-button" data-action="backup-open">Резервные копии PostgreSQL</button></div>');
    document.body.insertAdjacentHTML('beforeend', `<dialog id="database-backup-dialog" class="backup-dialog" aria-labelledby="backup-dialog-title">
      <section class="content-card backup-admin-card">
        <div class="card-heading"><div><span class="eyebrow">Резервное копирование</span><h3 id="backup-dialog-title">Экспорт и импорт базы данных</h3></div>
          <button type="button" class="ghost-button danger" data-action="backup-close" aria-label="Закрыть окно">Закрыть</button></div>
        <div class="row-actions backup-actions"><button type="button" class="ghost-button" data-action="backup-create">Создать SQL на сервере</button>
          <button type="button" class="ghost-button" data-action="backup-export">Скачать SQL</button>
          <button type="button" class="ghost-button" data-action="backup-export-archive">Скачать архив .dump</button></div>
        <div class="row-actions backup-actions"><input id="restore-dump-file" class="backup-file-input" type="file" accept=".dump,application/octet-stream" aria-label="Архив PostgreSQL для восстановления">
          <button type="button" class="ghost-button" data-action="backup-restore">Восстановить архив .dump</button></div>
        <p class="backup-help">SQL-копия доступна для просмотра. Для восстановления через приложение используйте архив .dump.</p>
        <p id="restore-status" role="status"></p><div id="server-backup-list" class="backup-list"></div>
      </section></dialog>`);
  }
  loadRestoreStatus();
  loadBackups().catch(error => legacyNotice(error.message, true));
}

async function loadBackups() {
  const target = document.querySelector('#server-backup-list');
  if (!target) return;
  const response = await fetch('/api/admin/backup/');
  if (!response.ok) throw new Error('Не удалось загрузить список резервных копий');
  const { backups } = await response.json();
  target.replaceChildren();
  if (!backups.length) { target.textContent = 'Резервных копий на сервере пока нет'; return; }
  backups.forEach(item => {
    const row = document.createElement('p');
    const link = document.createElement('a');
    link.href = `/api/admin/backup/${encodeURIComponent(item.name)}/`;
    link.textContent = `${item.created} · ${item.name} · ${(item.bytes / 1024).toFixed(0)} КБ`;
    const remove = document.createElement('button');
    remove.type = 'button'; remove.className = 'ghost-button';
    remove.dataset.action = 'backup-delete'; remove.dataset.backupName = item.name;
    remove.textContent = 'Удалить';
    row.append(link, remove); target.append(row);
  });
}

async function loadRestoreStatus() {
  const node = document.querySelector('#restore-status');
  if (!node) return;
  try {
    const response = await fetch('/api/admin/backup/restore/');
    if (!response.ok) return;
    const data = await response.json();
    node.textContent = data.state === 'idle' ? '' : data.message || '';
    if (data.backup && ['done', 'failed'].includes(data.state)) {
      const link = document.createElement('a');
      link.href = `/api/admin/backup/${encodeURIComponent(data.backup)}/`;
      link.textContent = ' Скачать страховочную копию';
      node.append(link);
    }
    if (['queued', 'running'].includes(data.state)) setTimeout(loadRestoreStatus, 2000);
  } catch (error) { node.textContent = error.message; }
}

async function loadServerUsers() {
  const response = await fetch('/api/admin/users/');
  if (!response.ok) throw new Error('Не удалось загрузить пользователей');
  serverUsers = (await response.json()).users;
  window.loadUsers = () => serverUsers;
  renderUsers();
  const counts = ['manager', 'technologist', 'normalizer', 'admin'];
  document.querySelectorAll('.permissions-table tbody tr').forEach((row, index) => {
    if (counts[index] && row.cells[1]) row.cells[1].textContent = serverUsers.filter(user => user.isActive && user.role === counts[index]).length;
  });
  document.querySelectorAll('#admin-users-body tr').forEach(row => {
    const user = serverUsers.find(item => item.username === row.dataset.username);
    const pill = row.querySelector('.status-pill');
    if (pill && user && !user.isActive) { pill.textContent = 'Отключён'; pill.classList.remove('success'); }
    if (user?.id === Number(document.body.dataset.userId)) row.querySelector('[data-action="delete-user"]')?.setAttribute('disabled', '');
  });
}

function installProfile() {
  const panel = document.querySelector('.user-panel');
  if (!panel) return;
  const defaultAvatar = panel.querySelector('.user-avatar');
  if (defaultAvatar) defaultAvatar.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="4"></circle><path d="M4 21a8 8 0 0 1 16 0"></path></svg>';
  const button = document.createElement('button'); button.type = 'button'; button.className = 'ghost-button'; button.textContent = 'Профиль';
  panel.insertBefore(button, panel.querySelector('#logout-button'));
  const dialog = document.createElement('dialog'); dialog.className = 'form-modal';
  dialog.innerHTML = `<form class="form-modal-body"><h2>Мой профиль</h2><div class="form-modal-grid">
    <label class="form-modal-field"><span>Логин</span><input name="username" required maxlength="150"></label>
    <label class="form-modal-field"><span>Электронная почта</span><input name="email" type="email" maxlength="254"></label>
    <label class="form-modal-field"><span>Фотография (до 2 МБ)</span><input name="avatar" type="file" accept="image/png,image/jpeg,image/webp"></label>
    <label class="form-modal-field"><span>Текущий пароль для изменения логина или пароля</span><input name="current_password" type="password" autocomplete="current-password"></label>
    <label class="form-modal-field"><span>Новый пароль</span><input name="new_password" type="password" autocomplete="new-password"></label>
    </div><p role="alert" class="editor-error"></p><footer><button type="button" class="ghost-button">Отмена</button><button class="primary-button">Сохранить</button></footer></form>`;
  document.body.append(dialog); const form = dialog.querySelector('form');
  const load = async () => {
    const response = await fetch('/api/profile/'); if (!response.ok) throw new Error('Не удалось загрузить профиль');
    const data = await response.json(); form.elements.username.value = data.username; form.elements.email.value = data.email;
    form.elements.username.readOnly = !data.canChangeUsername; form.elements.new_password.disabled = !data.canChangePassword;
    const avatar = panel.querySelector('.user-avatar');
    if (avatar && data.hasAvatar) { avatar.textContent = ''; avatar.style.backgroundImage = `url('/api/profile/avatar/?v=${Date.now()}')`; avatar.classList.add('user-avatar-image'); }
    return data;
  };
  load().catch(error => legacyNotice(error.message, true));
  button.addEventListener('click', async () => { try { await load(); form.elements.current_password.value = ''; form.elements.new_password.value = ''; dialog.querySelector('[role="alert"]').textContent = ''; dialog.showModal(); } catch (error) { legacyNotice(error.message, true); } });
  dialog.querySelector('button[type="button"]').addEventListener('click', () => dialog.close());
  form.addEventListener('submit', async event => {
    event.preventDefault();
    try {
      const response = await fetch('/api/profile/', { method: 'POST', headers: { 'X-CSRFToken': csrfToken() }, body: new FormData(form) });
      const result = await response.json(); if (!response.ok) throw new Error(result.error || 'Не удалось сохранить профиль');
      sessionStorage.setItem('oecUser', result.username); form.reset(); await load(); dialog.close(); legacyNotice('Профиль сохранён');
    } catch (error) { dialog.querySelector('[role="alert"]').textContent = error.message; }
  });
}

function installMaintenance() {
  if (document.body.dataset.page !== 'admin') return;
  const target = document.querySelector('.backup-launch'); if (!target) return;
  const button = document.createElement('button'); button.className = 'ghost-button'; button.type = 'button'; target.append(' ', button);
  let active = false;
  const render = () => { button.textContent = active ? 'Выключить технический режим' : 'Включить технический режим'; };
  fetch('/api/admin/policy/').then(r => { if (!r.ok) throw new Error('Не удалось получить состояние технического режима'); return r.json(); })
    .then(data => { active = data.maintenance; render(); }).catch(error => legacyNotice(error.message, true));
  render();
  button.addEventListener('click', async () => {
    if (!active && !confirm('Приостановить доступ остальных пользователей?')) return;
    try {
      const response = await fetch('/api/admin/policy/', { method: 'PUT', headers: apiHeaders(), body: JSON.stringify({maintenance: !active}) });
      const data = await response.json(); if (!response.ok) throw new Error(data.error || 'Не удалось изменить режим');
      active = data.maintenance; render(); legacyNotice(active ? 'Технический режим включён' : 'Технический режим выключен');
    } catch (error) { legacyNotice(error.message, true); }
  });
}

function markDevelopmentSections() {
  const page = document.body.dataset.page;
  if (!['cam', 'materials-1c'].includes(page)) return;
  const heading = document.querySelector('.page-intro h2, .one-c-page h2');
  if (!heading) return;
  const badge = document.createElement('span');
  badge.className = 'status-pill';
  badge.textContent = page === 'materials-1c' ? 'Прямой обмен с 1С: в разработке — скоро'
    : 'Импорт NX CAM: в разработке — скоро';
  heading.after(badge);
}

function hideDeferredIntegrations() {
  // These modules keep their data and server endpoints for a later release.
  // The original tpp files stay unchanged; hide only their current entry points.
  document.querySelectorAll('.familiar-nav a[href="materials-1c.html"]').forEach(link => link.remove());
  document.querySelectorAll('.nav-button[data-href="cam.html"]').forEach(button => button.closest('.nav-item')?.remove());
  document.querySelectorAll('.module-link[href="cam.html"]').forEach(link => link.remove());
}

function planSelection() {
  const page = document.body.dataset.page;
  if (!['annual-plan', 'plan-a', 'plan-b'].includes(page)) return null;
  const kind = page === 'annual-plan' ? 'annual' : page === 'plan-a' ? 'a' : 'b';
  const controls = document.querySelector('.planning-controls');
  const year = Number(controls?.querySelector('select')?.value || new Date().getFullYear());
  const quarter = kind === 'annual' ? 0 : Number(controls?.querySelectorAll('select')[1]?.selectedIndex || 0) + 1;
  return { kind, year, quarter: kind === 'b' ? Math.floor(new Date().getMonth() / 3) + 1 : quarter };
}

function replacePlanRows(table, rows) {
  const body = table?.tBodies?.[0];
  if (!body) return;
  body.replaceChildren();
  rows.forEach((values, index) => {
    const row = body.insertRow();
    if (index === 0) row.classList.add('selected');
    values.forEach(value => row.insertCell().textContent = value ?? '');
  });
}

function renderPlans(items) {
  const page = document.body.dataset.page;
  const tables = document.querySelectorAll('.planning-table-card table');
  if (page === 'annual-plan') {
    replacePlanRows(tables[0], items.map(item => [item.number, '1', item.customer, item.product,
      item.drawing, item.quantity, item.due_date.slice(0, 4),
      Math.floor((Number(item.due_date.slice(5, 7)) - 1) / 3) + 1, 'План А',
      item.priority, item.request, legacyDate(item.start_date), legacyDate(item.start_date), `${item.progress}%`]));
  } else if (page === 'plan-a') {
    replacePlanRows(tables[0], items.filter(item => item.planned).map(item => [item.number, '1', 'А',
      legacyDate(item.start_date), Math.floor((Number(item.due_date.slice(5, 7)) - 1) / 3) + 1,
      item.due_date.slice(0, 4), item.priority, `${item.progress}%`]));
    replacePlanRows(tables[1], items.filter(item => !item.planned).map(item => [item.number, '1',
      item.customer, item.product, item.drawing, item.quantity, 'А', item.priority,
      item.request, legacyDate(item.start_date)]));
  } else if (page === 'plan-b') {
    tables.forEach(table => {
      const header = table?.tHead?.rows[0];
      if (header && header.cells[header.cells.length - 1]?.textContent !== 'Прочие') {
        const cell = document.createElement('th');
        cell.textContent = 'Прочие';
        header.append(cell);
      }
    });
    const remaining = item => item.remaining_by_category || Array(8).fill('0');
    replacePlanRows(tables[0], items.map(item => [item.number, item.customer, ...remaining(item)]));
    replacePlanRows(tables[1], [[...Array(8).keys()].map(index =>
      items.reduce((sum, item) => sum + Number(remaining(item)[index]), 0).toFixed(2))]);
  }
}

async function loadPlans() {
  const selection = planSelection();
  if (!selection) return;
  const params = new URLSearchParams(selection);
  const response = await fetch(`/api/legacy/plans/?${params}`);
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Не удалось загрузить план');
  renderPlans(data.items);
  return data;
}

async function loadReportFromServer() {
  if (document.body.dataset.page !== 'reports') return;
  const kind = document.querySelector('#report-select')?.value || 'plan-a';
  const response = await fetch(`/api/legacy/report/?${reportQuery(kind)}`);
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Не удалось обновить отчёт');
  showReport(false);
  const table = document.querySelector('#report-preview table');
  const header = table?.tHead?.rows[0];
  if (header) {
    header.replaceChildren();
    data.headers.forEach(value => { const cell = document.createElement('th'); cell.textContent = value; header.append(cell); });
  }
  replacePlanRows(table, data.rows);
}

function reportQuery(kind) {
  const params = new URLSearchParams({ kind });
  document.querySelectorAll('[data-report-filter]').forEach(field => {
    if (field.value.trim()) params.set(field.dataset.reportFilter, field.value.trim());
  });
  return params.toString();
}

let processCatalog = null;

async function loadProcessesFromServer() {
  if (document.body.dataset.page !== 'processes') return;
  const response = await fetch('/api/legacy/processes/');
  if (!response.ok) throw new Error('Не удалось загрузить технологические процессы');
  const data = await response.json();
  processCatalog = data;
  const body = document.querySelector('.recent-processes tbody');
  body.replaceChildren();
  data.processes.forEach((item, index) => {
    const row = body.insertRow();
    if (index === 0) row.classList.add('selected');
    row.dataset.routePk = item.id;
    [item.code, item.product, item.kind, item.version, item.status, item.date].forEach((value, cellIndex) => {
      const cell = row.insertCell();
      if (cellIndex === 4) {
        const pill = document.createElement('span'); pill.className = 'status-pill'; pill.textContent = value; cell.append(pill);
      } else cell.textContent = value;
    });
  });
}

function openProcessEditor(item = null) {
  if (!processCatalog) { legacyNotice('Справочник техпроцессов ещё загружается', true); return; }
  let dialog = document.querySelector('#process-dialog');
  if (!dialog) {
    dialog = document.createElement('dialog');
    dialog.id = 'process-dialog';
    dialog.className = 'form-modal';
    dialog.innerHTML = `<form id="process-form" class="form-modal-body">
      <header><div><span class="eyebrow">Проектирование ТП</span><h2 id="process-dialog-title">Технологическая операция</h2></div></header>
      <div class="form-modal-grid">
        <label class="form-modal-field required"><span>Изделие</span><select name="product_id" required></select></label>
        <label class="form-modal-field required"><span>Рабочий центр</span><select name="work_center_id" required></select></label>
        <label class="form-modal-field required"><span>Номер операции</span><input name="number" type="number" min="1" required></label>
        <label class="form-modal-field required"><span>Операция</span><input name="name" required maxlength="200"></label>
        <label class="form-modal-field required"><span>Вид работ</span><select name="kind" required></select></label>
        <label class="form-modal-field"><span>Тпз на партию, ч</span><input name="setup_hours" type="number" min="0" step="0.01" value="0"></label>
        <label class="form-modal-field"><span>Штучное время, ч</span><input name="piece_hours" type="number" min="0" step="0.001" value="0"></label>
        <label class="form-modal-field"><span>Контроль обязателен</span><input name="quality_required" type="checkbox"></label>
      </div>
      <details class="estd-fields"><summary>Поля маршрутной карты ЕСТД · ГОСТ 3.1118-82</summary>
        <div class="form-modal-grid">
          <label class="form-modal-field"><span>Код цеха (А)</span><input name="shop_code" maxlength="20"></label>
          <label class="form-modal-field"><span>Код участка (А)</span><input name="section_code" maxlength="20"></label>
          <label class="form-modal-field"><span>Код рабочего места (А)</span><input name="workplace_code" maxlength="20"></label>
          <label class="form-modal-field"><span>Код профессии (Б)</span><input name="profession_code" maxlength="20"></label>
          <label class="form-modal-field"><span>Исполнителей (Б)</span><input name="worker_count" type="number" min="1" value="1"></label>
          <label class="form-modal-field"><span>Одновременно деталей (Б)</span><input name="simultaneous_quantity" type="number" min="1" value="1"></label>
          <label class="form-modal-field"><span>Документы операции (А)</span><input name="document_refs" maxlength="300"></label>
          <label class="form-modal-field"><span>Содержание операции (О)</span><textarea name="operation_text" maxlength="2000" rows="3"></textarea></label>
          <label class="form-modal-field"><span>Оснастка через ; (Т)</span><textarea name="tooling" maxlength="2000" rows="3"></textarea></label>
        </div>
      </details>
      <footer><button type="button" class="ghost-button" data-dialog-close="process-dialog">Отмена</button><button type="submit" class="primary-button">Сохранить</button></footer>
    </form>`;
    document.body.append(dialog);
    dialog.querySelector('form').addEventListener('submit', async event => {
      event.preventDefault();
      const form = event.currentTarget;
      const values = new FormData(form);
      const payload = { product_id: values.get('product_id'), work_center_id: values.get('work_center_id'),
        number: values.get('number'), name: values.get('name'), kind: values.get('kind'),
        setup_hours: values.get('setup_hours'), piece_hours: values.get('piece_hours'),
        quality_required: form.elements.quality_required.checked };
      for (const name of ['shop_code', 'section_code', 'workplace_code', 'profession_code',
        'worker_count', 'simultaneous_quantity', 'document_refs', 'operation_text', 'tooling']) {
        payload[name] = values.get(name);
      }
      const pk = form.dataset.processPk;
      try {
        const response = await fetch(pk ? `/api/legacy/processes/${pk}/` : '/api/legacy/processes/', {
          method: pk ? 'PUT' : 'POST', headers: apiHeaders(), body: JSON.stringify(payload)
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || 'Не удалось сохранить технологическую операцию');
        dialog.close(); await loadProcessesFromServer(); legacyNotice('Технологическая операция сохранена в PostgreSQL');
      } catch (error) { legacyNotice(error.message, true); }
    });
  }
  const form = dialog.querySelector('form');
  form.reset();
  form.dataset.processPk = item?.id || '';
  dialog.querySelector('#process-dialog-title').textContent = item ? 'Изменить операцию' : 'Новая операция';
  for (const [name, options] of [['product_id', processCatalog.products], ['work_center_id', processCatalog.centers], ['kind', processCatalog.kinds]]) {
    const select = form.elements[name];
    select.replaceChildren();
    options.forEach(option => select.add(new Option(option.name || option.label, option.id || option.value)));
  }
  for (const name of ['product_id', 'work_center_id', 'number', 'name', 'kind', 'setup_hours', 'piece_hours',
    'shop_code', 'section_code', 'workplace_code', 'profession_code', 'worker_count',
    'simultaneous_quantity', 'document_refs', 'operation_text', 'tooling']) {
    if (item?.[name] != null) form.elements[name].value = item[name];
  }
  form.elements.quality_required.checked = Boolean(item?.quality_required);
  dialog.showModal();
}

function installProductEstdActions() {
  if (document.body.dataset.page !== 'products') return;
  const anchor = document.querySelector('[data-action="edit-order"]');
  if (!anchor) return;
  const edit = document.createElement('button');
  edit.type = 'button'; edit.className = 'btn'; edit.dataset.action = 'edit-product-estd';
  edit.textContent = 'Материал ЕСТД';
  const print = document.createElement('button');
  print.type = 'button'; print.className = 'btn'; print.dataset.action = 'print-product-estd';
  print.textContent = 'Маршрутная карта ЕСТД';
  anchor.after(edit, print);
}

async function openProductEstdEditor() {
  const row = document.querySelector('.data-grid tbody tr.selected');
  if (!row?.dataset.productPk) { legacyNotice('Выберите изделие', true); return; }
  const response = await fetch(`/api/legacy/products/${row.dataset.productPk}/estd/`);
  if (!response.ok) throw new Error('Паспорт материала недоступен');
  const product = await response.json();
  let dialog = document.querySelector('#product-estd-dialog');
  if (!dialog) {
    dialog = document.createElement('dialog');
    dialog.id = 'product-estd-dialog'; dialog.className = 'form-modal';
    dialog.innerHTML = `<form class="form-modal-body">
      <header><div><span class="eyebrow">ГОСТ 3.1118-82 · строки М01 и М02</span><h2>Материал и заготовка изделия</h2></div></header>
      <p class="estd-product-name"></p>
      <div class="form-modal-grid">
        <label class="form-modal-field"><span>Материал по конструкторскому документу (М01)</span><input name="material_specification" maxlength="240"></label>
        <label class="form-modal-field"><span>Код материала (М02)</span><input name="material_code" maxlength="50"></label>
        <label class="form-modal-field"><span>Масса детали, кг (МД)</span><input name="part_mass_kg" type="number" min="0" step="0.001"></label>
        <label class="form-modal-field"><span>Норма расхода, кг</span><input name="material_consumption_kg" type="number" min="0" step="0.001"></label>
        <label class="form-modal-field"><span>Вид заготовки</span><input name="blank_type" maxlength="100"></label>
        <label class="form-modal-field"><span>Профиль и размеры заготовки</span><input name="blank_dimensions" maxlength="120"></label>
        <label class="form-modal-field"><span>Масса заготовки, кг (МЗ)</span><input name="blank_mass_kg" type="number" min="0" step="0.001"></label>
        <label class="form-modal-field"><span>Деталей из одной заготовки (КД)</span><input name="parts_per_blank" type="number" min="1" value="1"></label>
      </div>
      <footer><button type="button" class="ghost-button" data-dialog-close="product-estd-dialog">Отмена</button><button type="submit" class="primary-button">Сохранить</button></footer>
    </form>`;
    document.body.append(dialog);
    dialog.querySelector('form').addEventListener('submit', async event => {
      event.preventDefault();
      const form = event.currentTarget;
      const payload = Object.fromEntries(new FormData(form));
      try {
        const saved = await fetch(`/api/legacy/products/${form.dataset.productPk}/estd/`, {
          method: 'PUT', headers: apiHeaders(), body: JSON.stringify(payload)
        });
        const result = await saved.json();
        if (!saved.ok) throw new Error(result.error || 'Не удалось сохранить паспорт материала');
        dialog.close(); legacyNotice('Паспорт материала сохранён в PostgreSQL');
      } catch (error) { legacyNotice(error.message, true); }
    });
  }
  const form = dialog.querySelector('form');
  form.dataset.productPk = product.id;
  dialog.querySelector('.estd-product-name').textContent = `${product.name} · ${product.drawing || 'без чертежа'}`;
  for (const name of ['material_specification', 'material_code', 'part_mass_kg',
    'material_consumption_kg', 'blank_type', 'blank_dimensions', 'blank_mass_kg', 'parts_per_blank']) {
    form.elements[name].value = product[name] ?? '';
  }
  dialog.showModal();
}

let editingDeviationPk = null;
let deviationJobs = [];

function updateDeviationJobs(selectedId = '') {
  const order = document.querySelector('[data-deviation-field="order"]')?.value.trim();
  const work = document.querySelector('[data-deviation-field="work"]');
  if (!work) return;
  work.replaceChildren(new Option('Выберите задание', ''));
  deviationJobs.filter(job => job.order === order).forEach(job => work.add(new Option(job.label, String(job.id))));
  if (selectedId) work.value = String(selectedId);
  else if (work.options.length === 2) work.selectedIndex = 1;
}

function filterDeviations() {
  const year = document.querySelector('[data-deviation-period="year"]')?.value || '';
  const month = document.querySelector('[data-deviation-period="month"]')?.value || '';
  document.querySelectorAll('.deviation-page .data-grid tbody tr').forEach(row => {
    row.hidden = Boolean((year && row.dataset.date.slice(0, 4) !== year) ||
      (month && row.dataset.date.slice(5, 7) !== month));
  });
  const selected = document.querySelector('.deviation-page .data-grid tbody tr.selected');
  if (selected?.hidden) {
    selected.classList.remove('selected');
    [...selected.parentElement.rows].find(row => !row.hidden)?.classList.add('selected');
  }
}

function previewDeviationReport() {
  let dialog = document.querySelector('#deviation-report-dialog');
  if (!dialog) {
    document.body.insertAdjacentHTML('beforeend', `<dialog class="backup-dialog product-list-dialog" id="deviation-report-dialog">
      <section class="content-card backup-admin-card"><div class="card-heading"><h3>Отклонения за выбранный период</h3>
      <button class="ghost-button" type="button" data-deviation-report-close>Закрыть</button></div>
      <div class="table-wrap"><table class="data-grid"><thead><tr><th>Дата</th><th>Заказ</th><th>Изделие</th><th>Задание</th><th>Часы</th><th>Причина</th></tr></thead><tbody></tbody></table></div>
      <p data-deviation-report-total></p></section></dialog>`);
    dialog = document.querySelector('#deviation-report-dialog');
    dialog.querySelector('[data-deviation-report-close]').addEventListener('click', () => dialog.close());
  }
  const body = dialog.querySelector('tbody'); body.replaceChildren();
  const rows = [...document.querySelectorAll('.deviation-page .data-grid tbody tr')].filter(row => !row.hidden);
  let total = 0;
  rows.forEach(source => {
    const job = deviationJobs.find(item => String(item.id) === source.dataset.jobId);
    const values = [legacyDate(source.dataset.date), source.dataset.order, source.cells[3].textContent,
      job?.label || '', source.dataset.hours, source.dataset.reason];
    const row = body.insertRow(); values.forEach(value => { row.insertCell().textContent = value || ''; });
    total += Number(source.dataset.hours) || 0;
  });
  dialog.querySelector('[data-deviation-report-total]').textContent = `Записей: ${rows.length}; всего часов: ${total.toFixed(2)}`;
  dialog.showModal();
}

async function loadDeviationsFromServer() {
  if (document.body.dataset.page !== 'form2') return;
  const response = await fetch('/api/legacy/deviations/');
  if (!response.ok) throw new Error('Не удалось загрузить отклонения');
  const body = document.querySelector('.deviation-page .data-grid tbody');
  const data = await response.json();
  deviationJobs = data.jobs || [];
  body.replaceChildren();
  data.deviations.forEach((item, index) => {
    const row = body.insertRow();
    if (index === 0) row.classList.add('selected');
    row.dataset.order = item.order;
    row.dataset.deviationPk = item.id;
    row.dataset.jobId = item.job_id;
    row.dataset.date = item.date;
    row.dataset.hours = item.hours;
    row.dataset.reason = item.reason;
    const values = [item.order, '1', item.customer, item.product, item.drawing, '1',
      item.date.slice(0, 4), String(Math.floor((Number(item.date.slice(5, 7)) - 1) / 3) + 1),
      item.quantity, '', '', '', '', legacyDate(item.date), item.reason, '', '', '',
      item.hours, '', '', legacyDate(item.date)];
    for (let cellIndex = 0; cellIndex < 25; cellIndex += 1) row.insertCell().textContent = values[cellIndex] ?? '';
  });
  if (data.deviations.length) {
    document.querySelector('[data-deviation-field="order"]').value = data.deviations[0].order;
  } else {
    document.querySelector('[data-deviation-field="order"]').value = deviationJobs[0]?.order || '';
  }
  updateDeviationJobs(data.deviations[0]?.job_id || '');
  const year = document.querySelector('[data-deviation-period="year"]');
  const month = document.querySelector('[data-deviation-period="month"]');
  const oldYear = year.value, oldMonth = month.value;
  year.replaceChildren(new Option('Все годы', ''));
  [...new Set(data.deviations.map(item => item.date.slice(0, 4)))].sort().reverse()
    .forEach(value => year.add(new Option(value, value)));
  month.replaceChildren(new Option('Все месяцы', ''));
  for (let index = 0; index < 12; index++) {
    const value = String(index + 1).padStart(2, '0');
    month.add(new Option(new Intl.DateTimeFormat('ru-RU', { month: 'long' }).format(new Date(2024, index, 1)), value));
  }
  year.value = oldYear || ''; month.value = oldMonth || '';
  filterDeviations();
}

async function loadOrdersFromServer() {
  const table = document.querySelector('.data-grid');
  if (!table || !['orders', 'products', 'production', 'standards', 'settings'].includes(document.body.dataset.page)) return;
  try {
    const response = await fetch('/api/legacy/orders/');
    if (!response.ok) throw new Error('Список заказов недоступен');
    const { orders } = await response.json();
    const body = table.tBodies[0];
    body.replaceChildren();
    const count = table.tHead.rows[0].cells.length;
    orders.forEach((item, index) => {
      const values = [item.number, '1', item.object_name || item.customer, item.product, item.drawing,
        String(item.drawing_count),
        item.due_date.slice(0, 4), String(Math.floor((Number(item.due_date.slice(5, 7)) - 1) / 3) + 1),
         item.quantity, item.status, item.priority, item.request_number, legacyDate(item.request_date), legacyDate(item.registration_date),
        item.note, '', `${item.progress}%`, item.cost_code || '', item.norm_per_item,
        item.planned_hours, item.actual_hours, legacyDate(item.due_date), item.invoice || '', '', item.executors || ''];
      const row = body.insertRow();
      if (index === 0) row.classList.add('selected');
      row.dataset.order = item.number;
      row.dataset.customer = item.customer;
      row.dataset.orderPk = item.id;
      row.dataset.itemPk = item.item_id;
      row.dataset.productPk = item.product_id;
      row.dataset.dueDate = item.due_date;
      row.dataset.startDate = item.start_date;
      row.dataset.statusCode = item.status_code;
      row.dataset.department = item.department;
      for (let i = 0; i < count; i += 1) row.insertCell().textContent = values[i] ?? '';
    });
    if (orders.length) updateOrderDetails(body.rows[0]);
    updateOrderFilterOptions();
    updateProductionDepartments();
    applyProductionFilters();
    await applySavedColumnPreferences(table);
  } catch (error) { legacyNotice(error.message, true); }
}

async function applySavedColumnPreferences(table) {
  const page = document.body.dataset.page;
  if (!['orders', 'products', 'production', 'standards'].includes(page)) return;
  const response = await fetch('/api/legacy/table/settings-columns/');
  if (!response.ok) return;
  const { rows } = await response.json();
  const group = page === 'products' ? '0' : '1';
  const columns = group === '0'
    ? { '№': 1, 'Название изделия': 3, 'Чертеж': 4, 'Объект': 2, 'Кол. Чертежей': 5,
        'Кол. Изделий': 8, 'Материалы': 15, 'Стадия': 9, 'Окончание': 16,
        'Шифр затрат': 17, 'Приоритет': 10, 'Тр. Предполагаемая': 18,
        'Сум. планируемой Тр.': 19, 'Сум. фактической Тр.': 20, 'Дата изг.': 21, 'Накладная': 22 }
    : { 'Заказ': 0, 'Стадия': 9, '№ заявки': 11, 'Д. заявки': 12, 'Д. ввода': 13,
        'Год пл.': 6, 'Квартал пл.': 7, 'Тр. Сумма план. по заказу': 19,
        'Тр. Сумма фактич. по заказу': 20, 'Примечание': 14 };
  rows.filter(row => row[0] === group && row[2] === false).forEach(row => {
    const index = columns[row[1]];
    if (index === undefined) return;
    [...table.rows].forEach(tableRow => { if (tableRow.cells[index]) tableRow.cells[index].hidden = true; });
  });
}

const entryProductTemplate = document.querySelector('.entry-products-table tbody tr')?.cloneNode(true);

function installProductListEditor() {
  const editButton = document.querySelector('.entry-list-button[data-action="add-product-row"]');
  if (!editButton) return;
  editButton.dataset.action = 'edit-product-list';
  editButton.type = 'button';
  editButton.setAttribute('aria-haspopup', 'dialog');
  document.body.insertAdjacentHTML('beforeend', `
    <dialog class="backup-dialog product-list-dialog" id="product-list-dialog" aria-labelledby="product-list-title">
      <section class="content-card backup-admin-card">
        <div class="card-heading"><div><span class="eyebrow">Список изделий</span><h3 id="product-list-title">Изменить список изделий</h3></div>
          <button type="button" class="ghost-button" data-action="product-list-close">Закрыть</button></div>
        <div class="entry-products-table product-editor-table"><table>
          <thead><tr><th>Наименование</th><th>Количество</th><th>Чертеж</th><th>Кол. чертежей</th><th>Объект</th><th>Действие</th></tr></thead>
          <tbody></tbody></table></div>
        <div class="product-editor-actions"><button type="button" class="ghost-button" data-action="product-list-add">Добавить строку</button>
          <button type="button" class="primary-button" data-action="product-list-apply">Сохранить изменения</button></div>
      </section>
    </dialog>`);
}

function addProductEditorRow(values = []) {
  const body = document.querySelector('#product-list-dialog tbody');
  const row = document.createElement('tr');
  row.innerHTML = '<td data-label="Наименование"><input aria-label="Наименование" maxlength="200" required></td>' +
    '<td data-label="Количество"><input aria-label="Количество" type="number" min="1" step="1" required></td>' +
    '<td data-label="Чертеж"><input aria-label="Чертеж" maxlength="100"></td>' +
    '<td data-label="Кол. чертежей"><input aria-label="Количество чертежей" type="number" min="1" step="1" required></td>' +
    '<td data-label="Объект"><input aria-label="Объект" maxlength="200"></td>' +
    '<td data-label="Действие"><button type="button" class="ghost-button danger" data-action="product-list-delete" aria-label="Удалить строку">Удалить</button></td>';
  [...row.querySelectorAll('input')].forEach((input, index) => { input.value = values[index] ?? (input.type === 'number' ? '1' : ''); });
  body.append(row);
  return row;
}

function openProductListEditor() {
  const body = document.querySelector('#product-list-dialog tbody');
  body.replaceChildren();
  document.querySelectorAll('.entry-products-table:not(.product-editor-table) tbody tr').forEach(source => {
    addProductEditorRow([...source.querySelectorAll('input')].map(input => input.value));
  });
  if (!body.rows.length) addProductEditorRow();
  document.querySelector('#product-list-dialog').showModal();
}

function applyProductListEditor() {
  const rows = [...document.querySelectorAll('#product-list-dialog tbody tr')];
  if (!rows.length) { legacyNotice('Добавьте хотя бы одно изделие', true); return; }
  for (const row of rows) {
    const inputs = [...row.querySelectorAll('input')];
    if (!inputs[0].value.trim() || !inputs[1].checkValidity() || !inputs[3].checkValidity()) {
      legacyNotice('Укажите наименование и положительное количество для каждой строки', true);
      inputs.find(input => !input.checkValidity())?.focus(); return;
    }
  }
  const body = document.querySelector('.entry-products-table:not(.product-editor-table) tbody');
  body.replaceChildren();
  rows.forEach(source => {
    const row = entryProductTemplate.cloneNode(true);
    const inputs = [...source.querySelectorAll('input')];
    [...row.querySelectorAll('input')].forEach((input, index) => { input.value = inputs[index].value.trim(); });
    body.append(row);
  });
  document.querySelector('#product-list-dialog').close();
  legacyNotice('Список изделий изменён. Сохраните заказ для записи в базу данных.');
}

function resetEntryForm() {
  document.querySelectorAll('[data-entry]').forEach(input => {
    if (input.tagName === 'SELECT') input.selectedIndex = 0;
    else input.value = input.type === 'number' ? '1' : '';
  });
  const body = document.querySelector('.entry-products-table tbody');
  if (body && !body.rows.length && entryProductTemplate) body.append(entryProductTemplate.cloneNode(true));
  while (body?.rows.length > 1) body.lastElementChild.remove();
  body?.querySelectorAll('input').forEach(input => { input.value = input.type === 'number' ? '1' : ''; });
  const today = new Date();
  const due = new Date(today); due.setDate(due.getDate() + 30);
  const localDate = value => `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, '0')}-${String(value.getDate()).padStart(2, '0')}`;
  const start = document.querySelector('[data-entry="start-date"]');
  const end = document.querySelector('[data-entry="due-date"]');
  const registered = document.querySelector('[data-entry="registration-date"]');
  if (start) start.value = localDate(today);
  if (end) end.value = localDate(due);
  if (registered) registered.value = localDate(today);
}

async function saveLegacyOrder(exitAfter) {
  const get = name => document.querySelector(`[data-entry="${name}"]`)?.value?.trim() || '';
  const start = get('start-date');
  const due = get('due-date');
  const productRows = [...document.querySelectorAll('.entry-products-table:not(.product-editor-table) tbody tr')];
  const items = productRows.map(row => ({
    name: row.querySelector('[data-entry="product"]')?.value?.trim() || '',
    quantity: row.cells[1]?.querySelector('input')?.value || 0,
    drawing: row.querySelector('[data-entry="drawing"]')?.value?.trim() || '',
    drawing_count: row.cells[3]?.querySelector('input')?.value || 0,
    object_name: row.querySelector('[data-entry="product-object"]')?.value?.trim() || ''
  })).filter((item, index) => [...productRows[index].querySelectorAll('input')].some(input => input.value.trim()));
  const payload = { number: get('order'), customer: get('object'), request_number: get('request'),
    start_date: start, due_date: due, registration_date: get('registration-date'),
    request_date: get('request-date'), priority: Number(get('priority') || 2), note: get('note'), cost_code: get('cost-code'),
    machine: get('machine'), cnc: get('cnc'), cnc_control: get('cnc-control'),
    cnc_program: get('cnc-program'), one_c_code: get('one-c-code'), items };
  let summary = document.querySelector('#order-validation-errors');
  if (!summary) {
    summary = document.createElement('div'); summary.id = 'order-validation-errors'; summary.className = 'editor-error';
    summary.setAttribute('role', 'alert'); document.querySelector('.order-entry-main')?.before(summary);
  }
  document.querySelectorAll('.order-field-error').forEach(node => { node.classList.remove('order-field-error'); node.removeAttribute('aria-invalid'); });
  const errors = [];
  const invalid = (input, message) => { errors.push(message); if (input) { input.classList.add('order-field-error'); input.setAttribute('aria-invalid', 'true'); } };
  [['order', 'Номер заказа'], ['object', 'Заказчик'], ['start-date', 'Плановый запуск'], ['due-date', 'Плановый выпуск']]
    .forEach(([name, label]) => { const input = document.querySelector(`[data-entry="${name}"]`); if (!input?.value.trim()) invalid(input, `${label}: заполните поле`); });
  if (start && due && due < start) invalid(document.querySelector('[data-entry="due-date"]'), 'Плановый выпуск: дата раньше запуска');
  let filled = 0;
  productRows.forEach((row, index) => {
    const inputs = [...row.querySelectorAll('input')];
    if (!inputs.some(input => input.value.trim())) return;
    filled++;
    const name = row.querySelector('[data-entry="product"]');
    if (!name?.value.trim()) invalid(name, `Изделие ${index + 1}: укажите наименование`);
    [1, 3].forEach(column => { const input = row.cells[column]?.querySelector('input');
      if (!input || !Number.isInteger(Number(input.value)) || Number(input.value) < 1) invalid(input, `Изделие ${index + 1}: ${column === 1 ? 'количество' : 'количество чертежей'} должно быть целым числом больше нуля`); });
  });
  if (!filled) invalid(productRows[0]?.querySelector('[data-entry="product"]'), 'Добавьте хотя бы одно изделие');
  if (errors.length) { summary.replaceChildren(...errors.map(message => { const line = document.createElement('div'); line.textContent = message; return line; })); summary.scrollIntoView({block: 'center'}); return; }
  summary.replaceChildren();
  try {
    const response = await fetch('/api/legacy/orders/', { method: 'POST', headers: apiHeaders(), body: JSON.stringify(payload) });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'Не удалось сохранить заказ');
    legacyNotice(`Заказ ${result.number} сохранен в PostgreSQL`);
    if (exitAfter) window.location.href = 'orders.html?view=portfolio';
    else resetEntryForm();
  } catch (error) { summary.textContent = `Не удалось сохранить заказ: ${error.message}`; summary.scrollIntoView({block: 'center'}); }
}

function openOrderEditor(row) {
  let dialog = document.querySelector('#order-edit-dialog');
  if (!dialog) {
    document.body.insertAdjacentHTML('beforeend', `<dialog class="backup-dialog product-list-dialog" id="order-edit-dialog">
      <section class="content-card"><div class="card-heading"><h3>Изменить заказ и изделие</h3>
      <button type="button" class="ghost-button" data-order-editor-close>Закрыть</button></div>
      <form id="order-edit-form"><div class="order-filter-fields">
      <label>Номер заказа <input name="number" maxlength="50" required></label>
      <label>Заказчик <input name="customer" maxlength="200" required></label>
      <label>Объект <input name="object_name" maxlength="200"></label>
      <label>Наименование изделия <input name="product" maxlength="200" required></label>
      <label>Чертёж <input name="drawing" maxlength="100"></label>
      <label>Количество чертежей <input name="drawing_count" type="number" min="1" step="1" required></label>
      <label>Количество изделий <input name="quantity" type="number" min="1" step="1" required></label>
      <label>Приоритет <input name="priority" type="number" min="1" max="32767" step="1" required></label>
      <label>Номер заявки <input name="request_number" maxlength="80"></label>
      <label>Шифр затрат <input name="cost_code" maxlength="80"></label>
      <label>Накладная <input name="invoice" maxlength="100"></label>
      <label>Дата заявки <input name="request_date" type="date"></label>
      <label>Дата ввода <input name="registration_date" type="date"></label>
      <label>Плановый запуск <input name="start_date" type="date" required></label>
      <label>Плановый выпуск <input name="due_date" type="date" required></label>
      <label>Состояние <select name="status"><option value="draft">Проект</option><option value="planned">Запланирован</option><option value="work">В работе</option><option value="risk">Под риском</option><option value="done">Исполнен</option><option value="closed">Закрыт</option></select></label>
      <label>Примечание <input name="note"></label></div>
      <p>Показатели выполнения и трудоёмкости рассчитываются по связанным данным.</p>
      <p data-order-editor-error role="alert"></p>
      <div class="product-editor-actions"><button class="primary-button" type="submit">Сохранить</button></div></form></section></dialog>`);
    dialog = document.querySelector('#order-edit-dialog');
    dialog.querySelector('[data-order-editor-close]').addEventListener('click', () => dialog.close());
    dialog.querySelector('form').addEventListener('submit', async event => {
      event.preventDefault();
      const form = event.currentTarget;
      const payload = Object.fromEntries(new FormData(form));
      payload.item_id = form.dataset.itemPk;
      payload.reason = 'Исправление в портфеле заказов';
      try {
        const response = await fetch(`/api/legacy/orders/${form.dataset.orderPk}/`, {
          method: 'PUT', headers: apiHeaders(), body: JSON.stringify(payload)
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || 'Не удалось сохранить');
        dialog.close();
        await loadOrdersFromServer();
        const refreshed = [...document.querySelectorAll('.data-grid tbody tr')].find(item => item.dataset.itemPk === payload.item_id);
        if (refreshed) {
          refreshed.closest('tbody').querySelectorAll('tr').forEach(item => item.classList.remove('selected'));
          refreshed.classList.add('selected'); updateOrderDetails(refreshed);
        }
        legacyNotice('Изменения сохранены');
      } catch (error) { dialog.querySelector('[data-order-editor-error]').textContent = error.message; }
    });
  }
  const form = dialog.querySelector('form'), cells = row.cells;
  dialog.querySelector('[data-order-editor-error]').textContent = '';
  form.dataset.itemPk = row.dataset.itemPk; form.dataset.orderPk = row.dataset.orderPk;
  const values = { number: cells[0].textContent.trim(), customer: row.dataset.customer,
    object_name: cells[2].textContent.trim(), product: cells[3].textContent.trim(),
    drawing: cells[4].textContent.trim(), drawing_count: cells[5].textContent.trim(),
    quantity: cells[8].textContent.trim(), priority: cells[10].textContent.trim(),
    request_number: cells[11].textContent.trim(), request_date: isoDate(cells[12].textContent),
    registration_date: isoDate(cells[13].textContent), start_date: row.dataset.startDate,
    due_date: row.dataset.dueDate, status: row.dataset.statusCode, note: cells[14].textContent.trim(),
    cost_code: cells[17].textContent.trim(), invoice: cells[22].textContent.trim() };
  Object.entries(values).forEach(([name, value]) => { form.elements[name].value = value || ''; });
  dialog.showModal(); form.elements.number.focus();
}

document.addEventListener('click', async event => {
  const portfolioItem = event.target.closest('#portfolio-items-body tr[data-item-pk]');
  if (portfolioItem) {
    const source = [...document.querySelectorAll('.data-grid tbody tr[data-item-pk]')]
      .find(row => row.dataset.itemPk === portfolioItem.dataset.itemPk);
    if (source) selectRow(source);
    return;
  }
  const clickedRow = event.target.closest('.data-grid tbody tr');
  const editingRow = clickedRow?.closest('tbody')?.querySelector('tr[data-editing="true"]');
  if (editingRow && clickedRow !== editingRow) {
    event.preventDefault(); event.stopPropagation();
    legacyNotice('Сначала сохраните изменения выбранной строки', true);
    return;
  }
  if (event.target.closest('#logout-button')) {
    event.stopPropagation(); event.preventDefault();
    await fetch('/logout/', { method: 'POST', headers: { 'X-CSRFToken': csrfToken() } });
    sessionStorage.clear(); window.location.href = '/login.html'; return;
  }
  const action = event.target.closest('[data-action]')?.dataset.action;
  if (action === 'production-all' || action === 'production-department') {
    event.stopPropagation(); event.preventDefault();
    document.querySelector('.side-panel').dataset.selectedDepartment =
      action === 'production-all' ? '' : event.target.closest('[data-department]').dataset.department;
    applyProductionFilters(); return;
  }
  if (action === 'filter-orders') {
    event.stopPropagation(); event.preventDefault();
    updateOrderFilterOptions(); document.querySelector('#order-filter-dialog')?.showModal(); return;
  }
  if (action === 'close-order-filters') {
    event.stopPropagation(); event.preventDefault();
    document.querySelector('#order-filter-dialog')?.close(); return;
  }
  if (action === 'apply-order-filters') {
    event.stopPropagation(); event.preventDefault();
    applyOrderFilters(); document.querySelector('#order-filter-dialog')?.close(); return;
  }
  if (action === 'clear-order-filters' || action === 'reset-search') {
    event.stopPropagation(); event.preventDefault();
    document.querySelectorAll('[data-order-filter]').forEach(field => { field.value = ''; });
    const search = document.querySelector('#order-search'); if (search) search.value = '';
    applyOrderFilters(); return;
  }
  if (['norming-preview', 'norming-clear', 'norming-approve'].includes(action)) {
    event.stopPropagation(); event.preventDefault();
    const fields = normingFields();
    if (action === 'norming-clear') {
      fields.hours.value = '128'; fields.factor.value = '1'; fields.staff.value = '4';
      fields.drawings.value = '0';
      document.querySelector('#norming-result').textContent = '';
      document.querySelectorAll('.data-grid tbody tr').forEach(row => { row.hidden = false; });
      return;
    }
    if (![fields.hours, fields.factor, fields.staff].every(field => field.checkValidity() && Number(field.value) > 0)) {
      legacyNotice('Укажите положительные часы, трудоёмкость и численность', true); return;
    }
    try {
      if (action === 'norming-preview') {
        const data = await loadNorming(true);
        legacyNotice(`Предварительно сформировано: ${data.items} позиций`);
      } else {
        const payload = { year: fields.year.value, quarter: fields.quarter.value,
          hours_per_employee: fields.hours.value, labor_factor: fields.factor.value,
          staff_count: fields.staff.value };
        const response = await fetch('/api/legacy/norming/', {
          method: 'POST', headers: apiHeaders(), body: JSON.stringify(payload)
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || 'Не удалось утвердить нормирование');
        showNormingResult(result); legacyNotice('Нормирование утверждено и сохранено в PostgreSQL');
      }
    } catch (error) { legacyNotice(error.message, true); }
    return;
  }
  if (action === 'deviation-report-preview') {
    event.stopPropagation(); event.preventDefault(); previewDeviationReport(); return;
  }
  if (action === 'backup-open') {
    event.stopPropagation(); event.preventDefault();
    document.querySelector('#database-backup-dialog')?.showModal();
    loadBackups().catch(error => legacyNotice(error.message, true)); return;
  }
  if (action === 'backup-close') {
    event.stopPropagation(); event.preventDefault();
    document.querySelector('#database-backup-dialog')?.close(); return;
  }
  if (action === 'edit-product-estd') {
    event.stopPropagation(); event.preventDefault();
    openProductEstdEditor().catch(error => legacyNotice(error.message, true)); return;
  }
  if (action === 'print-product-estd') {
    event.stopPropagation(); event.preventDefault();
    const row = document.querySelector('.data-grid tbody tr.selected');
    if (!row?.dataset.productPk || !row.dataset.itemPk) { legacyNotice('Выберите изделие', true); return; }
    window.location.href = `/products/${row.dataset.productPk}/route.pdf?item=${row.dataset.itemPk}`;
    return;
  }
  if (action === 'backup-delete') {
    event.stopPropagation(); event.preventDefault();
    const name = event.target.closest('[data-backup-name]')?.dataset.backupName;
    if (!name || !confirm(`Удалить резервную копию ${name}?`)) return;
    try {
      const response = await fetch(`/api/admin/backup/${encodeURIComponent(name)}/`, {
        method: 'DELETE', headers: { 'X-CSRFToken': csrfToken() }
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Не удалось удалить копию');
      await loadBackups(); legacyNotice('Резервная копия удалена');
    } catch (error) { legacyNotice(error.message, true); }
    return;
  }
  if (action === 'edit-product-list') {
    event.stopPropagation(); event.preventDefault();
    openProductListEditor();
    return;
  }
  if (action === 'product-list-add') {
    event.stopPropagation(); event.preventDefault();
    addProductEditorRow().querySelector('input')?.focus();
    return;
  }
  if (action === 'product-list-delete') {
    event.stopPropagation(); event.preventDefault();
    event.target.closest('tr')?.remove();
    return;
  }
  if (action === 'product-list-apply') {
    event.stopPropagation(); event.preventDefault();
    applyProductListEditor();
    return;
  }
  if (action === 'product-list-close') {
    event.stopPropagation(); event.preventDefault();
    document.querySelector('#product-list-dialog')?.close();
    return;
  }
  if (action === 'clear-entry') {
    event.stopPropagation(); event.preventDefault();
    resetEntryForm();
    return;
  }
  if (action === 'save-settings') {
    event.stopPropagation(); event.preventDefault();
    const saves = [...document.querySelectorAll('[data-settings-list]')]
      .filter(list => currentRole === 'admin' || list.dataset.settingsList !== 'staff')
      .map(list => saveSettingsList(list));
    saves.push(saveSettingsColumns());
    const periods = document.querySelector('.settings-quarter-table table');
    if (periods && currentRole === 'admin') {
      saves.push(savePlanPeriods(periods));
      saves.push(saveSettingsPlanInputs());
    }
    Promise.all(saves).then(results => { if (results.every(result => result !== false)) window.location.href = 'orders.html'; });
    return;
  }
  if (action === 'update-materials') {
    event.stopPropagation(); event.preventDefault();
    window.location.href = '/records/materials/'; return;
  }
  if (['test-1c', 'sync-1c', 'select-import-file', 'save-import'].includes(action)) {
    event.stopPropagation(); event.preventDefault();
    legacyNotice('Прямой обмен с 1С и NX CAM: в разработке — скоро'); return;
  }
  if (action === 'test-server') {
    event.stopPropagation(); event.preventDefault(); await loadDatabaseStatus(); return;
  }
  if (action === 'edit-server') {
    event.stopPropagation(); event.preventDefault();
    await loadDatabaseStatus();
    document.querySelector('#server-form [name="password"]').value = '';
    document.querySelector('#server-dialog')?.showModal(); return;
  }
  if (action === 'backup-export' || action === 'backup-export-archive') {
    event.stopPropagation(); event.preventDefault();
    try {
      const response = await fetch(action === 'backup-export' ? '/api/admin/backup/export/' : '/api/admin/backup/export/?format=dump', {
        method: 'POST', headers: { 'X-CSRFToken': csrfToken() }
      });
      if (!response.ok) throw new Error('Не удалось выгрузить резервную копию');
      const fileName = response.headers.get('Content-Disposition')?.match(/filename="([^"]+)"/)?.[1] || 'backup.sql';
      const url = URL.createObjectURL(await response.blob());
      const link = document.createElement('a'); link.href = url; link.download = fileName;
      document.body.append(link); link.click(); link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 60000);
    } catch (error) { legacyNotice(error.message, true); }
    return;
  }
  if (action === 'backup-create') {
    event.stopPropagation(); event.preventDefault();
    try {
      const response = await fetch('/api/admin/backup/', { method: 'POST', headers: { 'X-CSRFToken': csrfToken() } });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Не удалось создать резервную копию');
      await loadBackups(); legacyNotice('Резервная копия создана на сервере');
    } catch (error) { legacyNotice(error.message, true); }
    return;
  }
  if (action === 'backup-restore') {
    event.stopPropagation(); event.preventDefault();
    const file = document.querySelector('#restore-dump-file')?.files?.[0];
    if (!file) { legacyNotice('Выберите файл резервной копии .dump', true); return; }
    if (!confirm('Восстановление заменит текущие данные PostgreSQL. Перед заменой будет создана страховочная копия. Продолжить?')) return;
    const data = new FormData(); data.append('file', file);
    try {
      const response = await fetch('/api/admin/backup/restore/', {
        method: 'POST', headers: { 'X-CSRFToken': csrfToken() }, body: data
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Не удалось принять файл резервной копии');
      legacyNotice(result.message);
      loadRestoreStatus();
    } catch (error) { legacyNotice(error.message, true); }
    return;
  }
  if (action === 'add-user' || action === 'edit-user') {
    const password = document.querySelector('#user-form [name="password"]');
    if (password) password.required = action === 'add-user';
  }
  if (action === 'delete-user') {
    event.stopPropagation(); event.preventDefault();
    const username = event.target.closest('tr')?.dataset.username;
    const user = serverUsers.find(item => item.username === username);
    if (!user || !confirm(`Отключить пользователя ${username}?`)) return;
    try {
      const response = await fetch(`/api/admin/users/${user.id}/`, { method: 'DELETE', headers: apiHeaders() });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Не удалось отключить пользователя');
      await loadServerUsers(); legacyNotice('Пользователь отключён');
    } catch (error) { legacyNotice(error.message, true); }
    return;
  }
  if (['plan-preview', 'plan-clear', 'plan-approve'].includes(action) && planSelection()) {
    event.stopPropagation(); event.preventDefault();
    if (action === 'plan-clear') {
      document.querySelectorAll('.planning-table-card table tbody').forEach(body => body.replaceChildren());
      return;
    }
    try {
      if (action === 'plan-preview') {
        const result = await loadPlans();
        legacyNotice(`Заказов в выбранном периоде: ${result.items.length}`);
      } else {
        const response = await fetch('/api/legacy/plans/', {
          method: 'POST', headers: apiHeaders(), body: JSON.stringify(planSelection())
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || 'Не удалось утвердить план');
        await loadPlans(); legacyNotice(`${result.name}: утверждено ${result.lines} позиций`);
      }
    } catch (error) { legacyNotice(error.message, true); }
    return;
  }
  if (action === 'show-selected-report') {
    event.stopPropagation(); event.preventDefault();
    loadReportFromServer().catch(error => legacyNotice(error.message, true)); return;
  }
  if (['new-process', 'edit-process', 'approve-process', 'delete-process'].includes(action)) {
    event.stopPropagation(); event.preventDefault();
    const row = document.querySelector('.recent-processes tbody tr.selected');
    const pk = row?.dataset.routePk;
    if (action === 'new-process') { openProcessEditor(); return; }
    if (!pk) { legacyNotice('Выберите технологический процесс', true); return; }
    if (action === 'edit-process') { openProcessEditor(processCatalog?.processes.find(item => item.id === Number(pk))); return; }
    if (action === 'delete-process' && !confirm('Удалить выбранную операцию?')) return;
    try {
      const response = await fetch(`/api/legacy/processes/${pk}/`, {
        method: action === 'approve-process' ? 'PUT' : 'DELETE', headers: apiHeaders()
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Не удалось изменить процесс');
      await loadProcessesFromServer(); legacyNotice('Изменения сохранены в PostgreSQL');
    } catch (error) { legacyNotice(error.message, true); }
    return;
  }
  if (['add-deviation', 'edit-deviation', 'delete-deviation'].includes(action)) {
    event.stopPropagation(); event.preventDefault();
    const row = document.querySelector('.deviation-page .data-grid tbody tr.selected');
    const field = name => document.querySelector(`[data-deviation-field="${name}"]`);
    if (action === 'edit-deviation') {
      if (!row?.dataset.deviationPk) { legacyNotice('Выберите отклонение', true); return; }
      openDeviationEditor(row);
      return;
    }
    if (action === 'delete-deviation') {
      if (!row?.dataset.deviationPk || !confirm('Удалить выбранное отклонение?')) return;
      try {
        const response = await fetch(`/api/legacy/deviations/${row.dataset.deviationPk}/`, { method: 'DELETE', headers: apiHeaders() });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || 'Не удалось удалить отклонение');
        await loadDeviationsFromServer(); legacyNotice('Отклонение удалено');
      } catch (error) { legacyNotice(error.message, true); }
      return;
    }
    const payload = { order: field('order').value.trim(), job_id: field('work').value, date: field('date').value,
      hours: field('hours').value, reason: field('reason').value };
    if (!payload.job_id) { legacyNotice('Выберите производственное задание', true); return; }
    try {
      const response = await fetch(editingDeviationPk ? `/api/legacy/deviations/${editingDeviationPk}/` : '/api/legacy/deviations/', {
        method: editingDeviationPk ? 'PUT' : 'POST', headers: apiHeaders(), body: JSON.stringify(payload)
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Не удалось сохранить отклонение');
      editingDeviationPk = null;
      document.querySelector('[data-action="add-deviation"]').textContent = 'Добавить';
      await loadDeviationsFromServer(); legacyNotice('Отклонение сохранено в PostgreSQL');
    } catch (error) { legacyNotice(error.message, true); }
    return;
  }
  if (['export-current', 'download-current-report', 'download-all-reports'].includes(action)) {
    event.stopPropagation(); event.preventDefault();
    if (action === 'export-current') {
      const kind = { standards: 'standards', production: 'production' }[document.body.dataset.page];
      window.location.href = kind ? `/api/legacy/report/export/?kind=${kind}` : '/reports/export/';
    }
    else window.location.href = `/api/legacy/report/export/?${reportQuery(action === 'download-all-reports'
      ? 'all' : document.querySelector('#report-select')?.value || 'plan-a')}`;
    return;
  }
  if (action === 'save-order-new' || action === 'save-order-exit') {
    event.stopPropagation(); event.preventDefault();
    await saveLegacyOrder(action === 'save-order-exit'); return;
  }
  if (action === 'add-order' && ['orders', 'products'].includes(document.body.dataset.page)) {
    event.stopPropagation(); event.preventDefault(); window.location.href = 'entry.html'; return;
  }
  if (action === 'edit-order' && ['orders', 'products', 'production'].includes(document.body.dataset.page)) {
    event.stopPropagation(); event.preventDefault();
    const row = document.querySelector('.data-grid tbody tr.selected');
    if (!row?.dataset.itemPk) { legacyNotice('Выберите изделие', true); return; }
    openOrderEditor(row);
    return;
  }
  if (action === 'delete-order' && ['orders', 'products'].includes(document.body.dataset.page)) {
    event.stopPropagation(); event.preventDefault();
    const row = document.querySelector('.data-grid tbody tr.selected');
    if (!row?.dataset.orderPk || !confirm(`Удалить изделие из заказа ${row.dataset.order}?`)) return;
    const response = await fetch(`/api/legacy/orders/${row.dataset.orderPk}/`, { method: 'DELETE', headers: apiHeaders(), body: JSON.stringify({ item_id: row.dataset.itemPk, reason: 'Удаление изделия в портфеле заказов' }) });
    if (response.ok) { row.remove(); legacyNotice('Изделие удалено'); }
    else { const result = await response.json(); legacyNotice(result.error || 'Не удалось удалить изделие', true); }
  }
  if (action === 'archive-order') {
    event.stopPropagation(); event.preventDefault();
    const row = document.querySelector('.data-grid tbody tr.selected');
    if (!row?.dataset.orderPk) { legacyNotice('Выберите заказ', true); return; }
    if (!confirm(`Убрать заказ ${row.dataset.order} целиком из портфеля? Связанные данные сохранятся в архиве.`)) return;
    try {
      const response = await fetch(`/api/legacy/orders/${row.dataset.orderPk}/`, { method: 'DELETE', headers: apiHeaders(),
        body: JSON.stringify({scope: 'order', reason: 'Архивирование заказа в портфеле'}) });
      const data = await response.json(); if (!response.ok) throw new Error(data.error || 'Не удалось архивировать заказ');
      await loadOrdersFromServer(); legacyNotice('Заказ перенесён в архив');
    } catch (error) { legacyNotice(error.message, true); }
    return;
  }
  if (action === 'import-1c') {
    event.stopPropagation(); event.preventDefault();
    const file = document.querySelector('#one-c-file')?.files[0];
    if (!file) { legacyNotice('Выберите файл CSV, JSON или XLSX', true); return; }
    if (file.name.toLowerCase().endsWith('.xls')) {
      legacyNotice('Для загрузки сохраните файл 1С в формате XLSX, CSV или JSON', true); return;
    }
    try {
      const data = new FormData(); data.append('file', file);
      const response = await fetch('/materials/import/', { method: 'POST', headers: { 'X-CSRFToken': csrfToken(), Accept: 'application/json' }, body: data });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Ошибка загрузки файла 1С');
      legacyNotice(`Материалов загружено в PostgreSQL: ${result.count}`); location.reload();
    } catch (error) { legacyNotice(error.message, true); }
    return;
  }
}, true);

installTppFields();
installProductListEditor();
installOrderFilters();
installProductEstdActions();
hideDeferredIntegrations();
installDatabaseAdmin();
installProfile();
installMaintenance();
if (['orders', 'products'].includes(document.body.dataset.page) && ['admin', 'technologist', 'manager'].includes(currentRole)) {
  const edit = document.querySelector('[data-action="edit-order"]');
  if (edit) edit.insertAdjacentHTML('afterend', ' <button class="btn" data-action="archive-order">Убрать заказ целиком</button>');
}
if (document.body.dataset.page === 'production') {
  const edit = document.querySelector('.side-panel [data-action="edit-order"]');
  const toolbar = document.querySelector('.toolbar');
  if (edit && toolbar) toolbar.append(edit);
}
if (document.body.dataset.page === 'personnel' && currentRole === 'planner') {
  document.querySelectorAll('[data-module-action]').forEach(button => { button.hidden = true; });
}
const timesheetMonthInput = document.querySelector('.timesheet-table')?.closest('.module-table-card')?.querySelector('input[type="month"]');
if (timesheetMonthInput) {
  const now = new Date();
  timesheetMonthInput.value = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const heading = timesheetMonthInput.closest('.module-table-card')?.querySelector('.card-heading h3');
  if (heading) heading.textContent = new Intl.DateTimeFormat('ru-RU', { month: 'long', year: 'numeric' }).format(now);
}
connectTppTables();
loadTimesheetDepartments().catch(error => legacyNotice(error.message, true));
document.querySelectorAll('.module-filters select, .module-filters input[type="search"]').forEach(field => {
  field.addEventListener('change', applyModuleFilters);
  field.addEventListener('input', applyModuleFilters);
});
document.querySelector('#order-search')?.addEventListener('input', applyOrderFilters);
document.querySelectorAll('[data-production-date]').forEach(field => field.addEventListener('change', applyProductionFilters));
connectSettings();
connectMaterialCalculator();
loadMaterialsFromServer().catch(error => legacyNotice(error.message, true));
loadDashboardFromServer().catch(error => legacyNotice(error.message, true));
markDevelopmentSections();

if (document.body.dataset.page === 'admin') {
  loadDatabaseStatus();
  loadServerUsers().catch(error => legacyNotice(error.message, true));
  document.querySelector('#user-form')?.addEventListener('submit', async event => {
    event.preventDefault(); event.stopImmediatePropagation();
    const values = new FormData(event.currentTarget);
    const original = String(values.get('originalUsername') || '');
    const user = serverUsers.find(item => item.username === original);
    const payload = { username: String(values.get('username') || '').trim(),
      fullName: String(values.get('fullName') || '').trim(),
      password: String(values.get('password') || ''), role: String(values.get('role') || ''),
      isActive: event.currentTarget.elements.isActive.checked,
      canChangeUsername: event.currentTarget.elements.canChangeUsername.checked,
      canChangePassword: event.currentTarget.elements.canChangePassword.checked };
    try {
      const response = await fetch(user ? `/api/admin/users/${user.id}/` : '/api/admin/users/', {
        method: user ? 'PUT' : 'POST', headers: apiHeaders(), body: JSON.stringify(payload)
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Не удалось сохранить пользователя');
      document.querySelector('#user-dialog')?.close();
      await loadServerUsers(); legacyNotice('Пользователь сохранён в PostgreSQL');
    } catch (error) { legacyNotice(error.message, true); }
  }, true);
}

if (planSelection()) loadPlans().catch(error => legacyNotice(error.message, true));
if (document.body.dataset.page === 'reports') {
  loadReportFromServer().catch(error => legacyNotice(error.message, true));
  document.querySelector('#report-select')?.addEventListener('change', () =>
    loadReportFromServer().catch(error => legacyNotice(error.message, true)));
}
if (document.body.dataset.page === 'processes') loadProcessesFromServer().catch(error => legacyNotice(error.message, true));
if (document.body.dataset.page === 'form2') loadDeviationsFromServer().catch(error => legacyNotice(error.message, true));

if (document.body.dataset.page === 'entry') {
  const today = new Date();
  const due = new Date(today); due.setDate(due.getDate() + 30);
  const localDate = value => `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, '0')}-${String(value.getDate()).padStart(2, '0')}`;
  const start = document.querySelector('[data-entry="start-date"]');
  const end = document.querySelector('[data-entry="due-date"]');
  const registered = document.querySelector('[data-entry="registration-date"]');
  if (start && !start.value) start.value = localDate(today);
  if (end && !end.value) end.value = localDate(due);
  if (registered && !registered.value) registered.value = localDate(today);
}
loadOrdersFromServer().then(initializeNorming);
