/* Карты несоответствий ведутся отдельно от отклонений производственного плана. */
(() => {
  if (!['form2', 'processes'].includes(document.body.dataset.page)) return;
  const writableRoles = ['admin', 'manager', 'technologist', 'supervisor'];
  const mayWrite = writableRoles.includes(currentRole);
  const target = document.querySelector('.deviation-page') || document.querySelector('.page-intro');
  if (!target) return;
  const launch = document.createElement('button');
  launch.type = 'button'; launch.className = 'ghost-button nc-launch'; launch.textContent = 'Карты несоответствий';
  target.prepend(launch);
  const list = document.createElement('dialog'); list.className = 'form-modal nc-dialog';
  list.innerHTML = `<section class="form-modal-body"><header class="nc-header"><div><span class="eyebrow">Контроль качества</span><h2>Карты несоответствий</h2></div><button type="button" class="ghost-button nc-close">Закрыть</button></header>
    <p>Черновики по форме № 2 приложения Д. Простои и выполнение заказа учитываются отдельно.</p>
    <div class="row-actions"><button type="button" class="primary-button nc-add">Создать карту</button></div>
    <p class="nc-list-error editor-error" role="alert"></p><div class="modern-table-wrap"><table class="modern-table"><thead><tr><th>Номер</th><th>Дата</th><th>Заказ и изделие</th><th>Автор</th><th>Действия</th></tr></thead><tbody></tbody></table></div></section>`;
  document.body.append(list);
  list.querySelector('.nc-add').hidden = !mayWrite;
  list.querySelector('.nc-close').addEventListener('click', () => list.close());
  const editor = document.createElement('dialog'); editor.className = 'form-modal nc-dialog';
  editor.innerHTML = `<form class="form-modal-body"><header class="nc-header"><div><span class="eyebrow">Форма № 2 · приложение Д</span><h2>Черновик карты отклонений</h2></div><button type="button" class="ghost-button nc-editor-close">Закрыть</button></header>
    <div class="form-modal-grid nc-fields">
      <label class="form-modal-field">Номер карты<input name="number" maxlength="80" required></label>
      <label class="form-modal-field">Дата<input name="date" type="date" required></label>
      <label class="form-modal-field">Позиция заказа<select name="order_item" required></select></label>
      <label class="form-modal-field">Чертёж, ТУ или техпроцесс<input name="source_document" maxlength="200" required></label>
      <label class="form-modal-field">Регистрационный номер НП<input name="register_number" maxlength="100"></label>
      <label class="form-modal-field">Партия деталей<input name="batch_quantity" type="number" min="1" required></label>
      <label class="form-modal-field">Узел<input name="assembly" maxlength="200"></label><label class="form-modal-field">Чертёж узла<input name="assembly_drawing" maxlength="100"></label>
      <label class="form-modal-field">Деталь<input name="detail" maxlength="200"></label><label class="form-modal-field">Чертёж детали<input name="detail_drawing" maxlength="100"></label>
      <label class="form-modal-field">Изготовление и контроль по<input name="manufacturing_basis" maxlength="300"></label>
      <label class="form-modal-field">Операция обнаружения<input name="detection_operation" maxlength="200"></label>
      <label class="form-modal-field">Трудоёмкость одной детали, н/ч<input name="unit_labor_hours" type="number" min="0" step="0.001"></label>
      <label class="form-modal-field">Трудоёмкость операции с отклонением, н/ч<input name="deviation_labor_hours" type="number" min="0" step="0.001"></label>
      <label class="form-modal-field">Контролёр ОТК<input name="inspector" maxlength="200"></label><label class="form-modal-field">Изготовитель<input name="manufacturer" maxlength="200"></label>
      <label class="form-modal-field">Руководитель участка<input name="manager" maxlength="200"></label><label class="form-modal-field">Начальник УТК<input name="quality_manager" maxlength="200"></label>
    </div><h3>Описание отклонений</h3><div class="nc-lines"></div><button type="button" class="ghost-button nc-add-line">Добавить строку</button>
    <div class="form-modal-grid nc-fields">
      <label class="form-modal-field">Решение технолога<textarea name="technologist_decision" rows="2"></textarea></label>
      <label class="form-modal-field">Решение представителя заказчика<textarea name="customer_decision" rows="2"></textarea></label>
      <label class="form-modal-field">Заключение разработчика КД<textarea name="designer_conclusion" rows="2"></textarea></label>
      <label class="form-modal-field">Корректирующие действия<textarea name="corrective_action" rows="2"></textarea></label>
      <label class="form-modal-field">Срок выполнения<input name="action_due_date" type="date"></label><label class="form-modal-field">Ответственный<input name="action_responsible" maxlength="200"></label>
    </div><p class="editor-error nc-error" role="alert"></p><footer><button type="button" class="ghost-button nc-cancel">Отмена</button><button type="submit" class="primary-button">Сохранить черновик</button></footer></form>`;
  document.body.append(editor);
  const form = editor.querySelector('form'); let catalog = null; let activeId = null;
  editor.querySelectorAll('.nc-editor-close, .nc-cancel').forEach(button => button.addEventListener('click', () => editor.close()));
  function addLine(values = {}) {
    const row = document.createElement('fieldset'); row.className = 'nc-line';
    row.innerHTML = `<legend>Отклонение</legend><div class="form-modal-grid"><label class="form-modal-field">Должно быть по НТД<textarea name="requirement" required rows="2"></textarea></label><label class="form-modal-field">Фактически выполнено<textarea name="actual" required rows="2"></textarea></label><label class="form-modal-field">Количество деталей<input name="quantity" type="number" min="1" required></label><label class="form-modal-field">Причина, шифр<textarea name="reason" required rows="2"></textarea></label></div><button type="button" class="ghost-button danger nc-remove-line">Удалить строку</button>`;
    Object.entries(values).forEach(([name, value]) => { const field = row.querySelector(`[name="${name}"]`); if (field) field.value = value ?? ''; });
    row.querySelector('.nc-remove-line').addEventListener('click', () => { if (form.querySelectorAll('.nc-line').length > 1) row.remove(); });
    form.querySelector('.nc-lines').append(row);
  }
  editor.querySelector('.nc-add-line').addEventListener('click', () => { if (form.querySelectorAll('.nc-line').length < 50) addLine(); });
  async function refresh() {
    const response = await fetch('/api/nonconformities/');
    if (!response.ok) throw new Error('Не удалось загрузить карты несоответствий');
    catalog = await response.json();
    const body = list.querySelector('tbody'); body.replaceChildren();
    catalog.cards.forEach(card => {
      const row = body.insertRow();
      [card.number, legacyDate(card.date), `${card.order} · ${card.product}`, card.created_by].forEach(value => { row.insertCell().textContent = value; });
      const actions = row.insertCell(); actions.className = 'row-actions';
      const print = document.createElement('a'); print.className = 'ghost-button nc-link'; print.href = `/nonconformities/${card.id}/print/`; print.target = '_blank'; print.rel = 'noopener'; print.textContent = 'Печать'; actions.append(print);
      if (catalog.can_write) {
        const edit = document.createElement('button'); edit.type = 'button'; edit.className = 'ghost-button'; edit.textContent = 'Изменить'; edit.addEventListener('click', () => openEditor(card)); actions.append(edit);
        const remove = document.createElement('button'); remove.type = 'button'; remove.className = 'ghost-button danger'; remove.textContent = 'Удалить';
        remove.addEventListener('click', async () => {
          if (!confirm(`Удалить черновик карты ${card.number}?`)) return;
          try { const response = await fetch(`/api/nonconformities/${card.id}/`, {method: 'DELETE', headers: apiHeaders()}); const data = await response.json(); if (!response.ok) throw new Error(data.error || 'Не удалось удалить карту'); await refresh(); }
          catch (error) { list.querySelector('.nc-list-error').textContent = error.message; }
        }); actions.append(remove);
      }
    });
  }
  function openEditor(card = null) {
    if (!catalog?.can_write) return;
    activeId = card?.id || null; form.reset(); form.querySelector('.nc-error').textContent = '';
    const select = form.elements.order_item; select.replaceChildren(new Option('Выберите позицию заказа', ''));
    catalog.items.forEach(item => select.add(new Option(item.label, String(item.id))));
    if (card && !catalog.items.some(item => item.id === card.order_item)) {
      select.add(new Option(`${card.order} · ${card.product} (заказ в архиве)`, String(card.order_item)));
    }
    for (const [key, value] of Object.entries(card || {})) { const field = form.elements.namedItem(key); if (field && key !== 'lines') field.value = value ?? ''; }
    if (!card) form.elements.date.value = new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10);
    form.querySelector('.nc-lines').replaceChildren(); (card?.lines?.length ? card.lines : [{}]).forEach(addLine);
    editor.showModal();
  }
  form.addEventListener('submit', async event => {
    event.preventDefault(); const save = form.querySelector('[type="submit"]'); save.disabled = true;
    const data = {};
    [...form.elements].filter(field => field.name && !field.closest('.nc-line')).forEach(field => { data[field.name] = field.value; });
    data.lines = [...form.querySelectorAll('.nc-line')].map(row => Object.fromEntries([...row.querySelectorAll('[name]')].map(field => [field.name, field.value])));
    try {
      const response = await fetch(activeId ? `/api/nonconformities/${activeId}/` : '/api/nonconformities/', {method: activeId ? 'PUT' : 'POST', headers: apiHeaders(), body: JSON.stringify(data)});
      const result = await response.json();
      if (!response.ok) {
        const label = field => result.labels?.[field] || (field === '__all__' ? 'Карта' : field);
        const messages = [...Object.entries(result.fields || {}).flatMap(([field, errors]) => errors.map(error => `${label(field)}: ${error.message}`)),
          ...(result.lines || []).flatMap((row, index) => Object.entries(row).flatMap(([field, errors]) => errors.map(error => `Строка ${index + 1}, ${label(field)}: ${error.message}`)))];
        throw new Error(messages.join('; ') || result.error || 'Не удалось сохранить карту');
      }
      editor.close(); await refresh(); legacyNotice('Черновик карты сохранён');
    } catch (error) { form.querySelector('.nc-error').textContent = error.message; } finally { save.disabled = false; }
  });
  list.querySelector('.nc-add').addEventListener('click', () => openEditor());
  launch.addEventListener('click', async () => {
    try { list.querySelector('.nc-list-error').textContent = ''; await refresh(); list.showModal(); }
    catch (error) { legacyNotice(error.message, true); }
  });
})();
