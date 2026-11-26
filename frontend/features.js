export function createFeatures({
  api,
  state,
  esc,
  selectedTrip,
  cityById,
  loadItinerary,
  loadWorkspace,
  render,
  notify,
  openModal
}) {
  let context = {};

  const button = (action, label, attributes = '') =>
    `<button type="button" class="btn btn-outline" data-action="${action}" ${attributes}>${label}</button>`;

  function field(name, label, value = '', type = 'text', attributes = '') {
    return `<label>${label}<input name="${name}" type="${type}" value="${esc(value ?? '')}" ${attributes}></label>`;
  }

  function form(content) {
    return `
<form id="feature-form" class="form-stack">
  ${content}
  <p class="form-error" role="alert" hidden></p>
  <button type="submit" class="btn btn-primary">Сохранить</button>
</form>
`;
  }

  function modal() {
    const trip = selectedTrip();
    const item = trip?.items.find((entry) => entry.id === context.itemId);
    switch (state.modal) {
      case 'edit-trip':
        return [
          'Изменить поездку',
          form(
            field('title', 'Название', trip.title, 'text', 'required maxlength="160"') +
              field('start_date', 'Начало', trip.startDate, 'date', 'required') +
              field('end_date', 'Окончание', trip.endDate, 'date', 'required')
          )
        ];
      case 'visit':
        return [
          'Посещение и оценка',
          form(`<label>Оценка<select name="rating">
          <option value="">Без оценки</option>${[1, 2, 3, 4, 5]
            .map(
              (value) =>
                `<option value="${value}" ${item.visit?.rating === value ? 'selected' : ''}>${value}</option>`
            )
            .join('')}</select></label>`) +
            (item.visited ? button('unvisit', 'Снять отметку о посещении') : '')
        ];
      case 'time':
        return [
          'Время остановки',
          form(
            field(
              'time',
              'Дата и время (UTC)',
              item.plannedTime ? new Date(item.plannedTime).toISOString().slice(0, 16) : '',
              'datetime-local'
            )
          )
        ];
      case 'notes':
        return [
          'Заметки',
          `<div class="notes-list">${
            (item.notes || [])
              .map(
                (note) => `
          <article class="note-preview"><p>${esc(note.text)}</p>
            ${button('edit-note', 'Изменить', `data-note="${note.id}"`)}
            ${button('delete-note', 'Удалить', `data-note="${note.id}"`)}
          </article>`
              )
              .join('') || '<p>Заметок пока нет.</p>'
          }</div>` +
            form(`<label>${context.noteId ? 'Изменить заметку' : 'Новая заметка'}
            <textarea name="text" rows="4" required maxlength="5000">${esc(context.text || '')}</textarea></label>`)
        ];
      case 'catalog-edit': {
        const record = context.record || {};
        const place = context.place;
        return [
          place ? 'Место в каталоге' : 'Город в каталоге',
          form(
            field(
              'name',
              'Название',
              record.name,
              'text',
              `required maxlength="${place ? 160 : 120}"`
            ) +
              (place
                ? field(
                    'category',
                    'Категория',
                    record.category,
                    'text',
                    'required maxlength="80"'
                  ) + field('address', 'Адрес', record.address, 'text', 'required maxlength="255"')
                : field('country', 'Страна', record.country, 'text', 'required maxlength="120"')) +
              field(
                'lat',
                'Широта',
                record.lat,
                'number',
                'required min="-90" max="90" step="any"'
              ) +
              field(
                'lon',
                'Долгота',
                record.lon,
                'number',
                'required min="-180" max="180" step="any"'
              )
          )
        ];
      }
      case 'catalog-delete':
        return [
          'Удалить запись каталога?',
          `<p>${esc(context.record.name)}</p>
          ${button('confirm-catalog-delete', 'Удалить')}`
        ];
      default:
        return null;
    }
  }

  function tripControls(trip) {
    const statuses = {
      planned: [['in_progress', 'Начать поездку']],
      active: [
        ['completed', 'Завершить поездку'],
        ['planned', 'Вернуть в планы']
      ],
      completed: [['planned', 'Вернуть в планы']]
    };
    return (
      button('edit-trip', 'Изменить') +
      (statuses[trip.status] || [])
        .map(([value, label]) => button('trip-status', label, `data-status="${value}"`))
        .join('')
    );
  }

  function itemControls(item, index, total) {
    return `
<div class="stop-bottom">
  ${button('move-stop', '↑', `data-id="${item.id}" data-direction="-1" aria-label="Выше" ${index === 0 ? 'disabled' : ''}`)}
  ${button('move-stop', '↓', `data-id="${item.id}" data-direction="1" aria-label="Ниже" ${index === total - 1 ? 'disabled' : ''}`)}
  ${button('time', 'Время', `data-id="${item.id}"`)}
  ${button('notes', 'Заметки', `data-id="${item.id}"`)}
  ${button('visit', item.visited ? 'Изменить оценку' : 'Посещение и оценка', `data-id="${item.id}"`)}
</div>
${item.plannedTime ? `<p>Запланировано (UTC): ${esc(item.plannedTime.slice(0, 16).replace('T', ' '))}</p>` : ''}
`;
  }

  function routePanel(trip) {
    const route = trip.walkingRoute;
    let map = '';
    const points = route?.geometry?.coordinates;
    if (points?.length > 1) {
      const latitude = points.reduce((sum, point) => sum + point[1], 0) / points.length;
      const projected = points.map(([lon, lat]) => [
        lon * Math.cos((latitude * Math.PI) / 180),
        lat
      ]);
      const xs = projected.map((point) => point[0]);
      const ys = projected.map((point) => point[1]);
      const minX = xs.reduce((a, b) => Math.min(a, b));
      const maxX = xs.reduce((a, b) => Math.max(a, b));
      const minY = ys.reduce((a, b) => Math.min(a, b));
      const maxY = ys.reduce((a, b) => Math.max(a, b));
      const scale = 340 / Math.max(maxX - minX, maxY - minY, 0.00001);
      const line = projected
        .map(([x, y]) => `${20 + (x - minX) * scale},${20 + (maxY - y) * scale}`)
        .join(' ');
      map = `
<svg
  class="walking-geometry"
  viewBox="0 0 380 380"
  role="img"
  aria-label="Геометрия пешеходного пути, север сверху">
  <polyline
    points="${line}"
    fill="none"
    stroke="#335d51"
    stroke-width="3"
    stroke-linejoin="round"
  />
</svg>
<p>Пешеходный путь · север сверху</p>
`;
    }
    const city = cityById(trip.cityId);
    return `
<section class="panel">
  <h3>Пешеходный маршрут</h3>
  ${
    route
      ? `<p>${esc(route.distance_km)} км · ${esc(route.duration_minutes)} мин</p>${map}
        <p>Рассчитан ${esc(new Date(route.calculated_at).toLocaleString('ru-RU'))}</p>`
      : '<p>Добавьте от 2 до 50 остановок и рассчитайте пешеходный путь.</p>'
  }
  ${trip.walkingError ? `<p role="alert" class="form-error">${esc(trip.walkingError)}</p>` : ''}
  ${button('calculate-route', route ? 'Пересчитать' : 'Рассчитать', trip.items.length < 2 || trip.items.length > 50 ? 'disabled' : '')}
  <a
    class="map-external"
    href="https://www.openstreetmap.org/#map=13/${Number(city.lat)}/${Number(city.lon)}"
    target="_blank"
    rel="noopener noreferrer">Открыть город на OpenStreetMap</a>
</section>
`;
  }

  function catalog() {
    const city = cityById(state.catalogCity) || state.cities[0];
    return `
<section class="panel">
  <h2>Управление каталогом</h2>
  <p>Изменения доступны аккаунтам с правами администратора.</p>
  ${button('new-city', 'Добавить город')}
  <label>Город<select id="catalog-city">
      ${state.cities
        .map(
          (entry) =>
            `<option value="${entry.id}" ${entry.id === city?.id ? 'selected' : ''}>${esc(entry.name)}, ${esc(entry.country)}</option>`
        )
        .join('')}
    </select></label>
  ${
    city
      ? `<div class="catalog-actions">${button('edit-city', 'Изменить город')}
        ${button('delete-city', 'Удалить город')}${button('new-place', 'Добавить место')}</div>
        <div class="notes-list">${(city.places || [])
          .map(
            (place) => `
<article class="note-preview">
  <h3>${esc(place.name)}</h3>
  <p>${esc(place.kind)} · ${esc(place.desc)}</p>
  ${button('edit-place', 'Изменить', `data-id="${place.id}"`)}
  ${button('delete-place', 'Удалить', `data-id="${place.id}"`)}
</article>
`
          )
          .join('')}</div>`
      : ''
  }
</section>
`;
  }

  async function action(name, element) {
    const trip = selectedTrip();
    const city = cityById(state.catalogCity) || state.cities[0];
    const itemId = element.dataset.id;
    switch (name) {
      case 'edit-trip':
        openModal(name);
        return true;
      case 'trip-status':
        Object.assign(trip, await api.updateTrip(trip.id, { status: element.dataset.status }));
        await loadItinerary(trip, true);
        notify('Статус сохранён');
        return true;
      case 'move-stop': {
        const ids = trip.items.map((item) => item.id);
        const index = ids.indexOf(itemId);
        const target = index + Number(element.dataset.direction);
        if (index < 0 || target < 0 || target >= ids.length) return true;
        [ids[index], ids[target]] = [ids[target], ids[index]];
        await api.reorder(trip.id, ids);
        await loadItinerary(trip, true);
        notify('Порядок сохранён');
        return true;
      }
      case 'time':
      case 'visit':
      case 'notes':
        if (name === 'notes') {
          trip.items.find((item) => item.id === itemId).notes = await api.notes(trip.id, itemId);
        }
        context = { itemId };
        openModal(name);
        return true;
      case 'unvisit':
        await api.unvisit(trip.id, context.itemId);
        await loadItinerary(trip, true);
        state.modal = null;
        notify('Отметка снята');
        return true;
      case 'edit-note': {
        const note = trip.items
          .find((item) => item.id === context.itemId)
          .notes.find((note) => String(note.id) === element.dataset.note);
        context.noteId = note.id;
        context.text = note.text;
        render();
        return true;
      }
      case 'delete-note':
        await api.deleteNote(trip.id, context.itemId, element.dataset.note);
        context.noteId = null;
        context.text = '';
        trip.items.find((item) => item.id === context.itemId).notes = await api.notes(
          trip.id,
          context.itemId
        );
        notify('Заметка удалена');
        return true;
      case 'calculate-route':
        try {
          trip.walkingRoute = await api.calculateRoute(trip.id);
          trip.walkingError = '';
          notify('Маршрут рассчитан');
        } catch (error) {
          trip.walkingError = error.message;
          render();
          throw error;
        }
        return true;
      case 'new-city':
      case 'edit-city':
      case 'delete-city':
      case 'new-place':
      case 'edit-place':
      case 'delete-place': {
        const place = name.endsWith('place');
        const record = name.startsWith('new')
          ? null
          : place
            ? city.places.find((entry) => entry.id === itemId)
            : city;
        context = {
          place,
          cityId: place || record ? city?.id : null,
          placeId: place ? record?.id : null,
          record:
            place && record ? { ...record, category: record.kind, address: record.desc } : record
        };
        openModal(name.startsWith('delete') ? 'catalog-delete' : 'catalog-edit');
        return true;
      }
      case 'confirm-catalog-delete':
        await api.deleteCatalog(context.cityId, context.placeId);
        await loadWorkspace();
        notify('Запись удалена');
        return true;
      default:
        return false;
    }
  }

  async function submit(formElement) {
    const fields = Object.fromEntries(new FormData(formElement));
    const trip = selectedTrip();
    switch (state.modal) {
      case 'edit-trip':
        if (fields.end_date < fields.start_date)
          throw new Error('Окончание должно быть не раньше начала.');
        Object.assign(trip, await api.updateTrip(trip.id, fields));
        break;
      case 'visit':
        await api.markVisit(trip.id, context.itemId, fields.rating ? Number(fields.rating) : null);
        break;
      case 'time':
        await api.planTime(trip.id, context.itemId, fields.time ? fields.time + ':00Z' : null);
        break;
      case 'notes':
        await api.saveNote(trip.id, context.itemId, context.noteId, fields.text.trim());
        break;
      case 'catalog-edit':
        fields.lat = Number(fields.lat);
        fields.lon = Number(fields.lon);
        await api.saveCatalog(context.cityId, context.placeId, fields, context.place);
        await loadWorkspace();
        notify('Каталог сохранён');
        return;
    }
    await loadItinerary(trip, true);
    state.modal = null;
    notify('Изменения сохранены');
  }

  return { modal, tripControls, itemControls, routePanel, catalog, action, submit };
}
