const tokenKey = 'tripline-access-token';
const pageSize = 100;

export function hasSession() {
  return Boolean(sessionStorage.getItem(tokenKey));
}

export function clearSession() {
  sessionStorage.removeItem(tokenKey);
}

async function request(path, { method = 'GET', body, authenticated = true, timeout = 12000 } = {}) {
  const headers = new Headers({ Accept: 'application/json' });
  const token = authenticated && sessionStorage.getItem(tokenKey);
  if (token) headers.set('Authorization', `Bearer ${token}`);
  if (body !== undefined) headers.set('Content-Type', 'application/json');

  let response;
  try {
    response = await fetch(`/api/v1${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: AbortSignal.timeout(timeout)
    });
  } catch (error) {
    if (error.name === 'TimeoutError') throw new Error('Сервер не ответил вовремя. Попробуйте ещё раз.');
    throw new Error('Не удалось связаться с сервером.');
  }

  if (response.status === 204) return;
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    const messages = {
      401: authenticated ? 'Сеанс закончился. Войдите снова.' : 'Неверная почта или пароль.',
      404: 'Запись больше недоступна.',
      409: 'Данные уже существуют или изменились. Обновите страницу и повторите действие.',
      422: path.endsWith('/route') ? 'Не удалось построить путь между остановками. Проверьте выбранные места.' : 'Проверьте введённые данные, даты поездки и время остановок.',
      403: 'Управление каталогом доступно только администратору.',
      502: 'Сервис маршрутов вернул некорректный ответ.',
      503: 'Сервис пока недоступен. Попробуйте позже.'
    };
    if (data?.detail === 'Email already registered') messages[409] = 'Эта почта уже зарегистрирована. Войдите с этим адресом.';
    const error = new Error(messages[response.status] || 'Сервер не смог выполнить запрос.');
    error.status = response.status;
    error.validation = Array.isArray(data?.detail) ? data.detail : [];
    throw error;
  }
  if (data === null) throw new Error('Сервер вернул неожиданный ответ.');
  return data;
}

async function list(path) {
  const entries = [];
  for (let offset = 0; ; offset += pageSize) {
    const page = await request(`${path}?limit=${pageSize}&offset=${offset}`);
    entries.push(...page);
    if (page.length < pageSize) return entries;
  }
}

function toTrip(trip) {
  return {
    id: String(trip.id),
    cityId: String(trip.city_id),
    title: trip.title,
    startDate: trip.start_date,
    endDate: trip.end_date,
    status: trip.status === 'in_progress' ? 'active' : trip.status,
    items: [],
    stats: { total: 0, visited: 0, percent: 0 }
  };
}

function toItem(item) {
  return {
    id: String(item.id),
    placeId: String(item.place_id),
    position: item.position,
    plannedTime: item.planned_time,
    visited: item.status === 'visited'
  };
}

export const api = {
  async login(email, password) {
    const data = await request('/auth/login', {
      method: 'POST', body: { email, password }, authenticated: false
    });
    sessionStorage.setItem(tokenKey, data.access_token);
  },
  register: (fields) => request('/auth/register', {
    method: 'POST', body: fields, authenticated: false
  }),
  profile: () => request('/auth/me'),
  cities: () => list('/cities'),
  places: (cityId) => list(`/cities/${cityId}/places`),
  async trips() {
    return (await list('/trips')).map(toTrip);
  },
  async trip(id) {
    return toTrip(await request(`/trips/${id}`));
  },
  async createTrip({ title, cityId, startDate, endDate }) {
    const trip = await request('/trips', {
      method: 'POST',
      body: { title, city_id: Number(cityId), start_date: startDate, end_date: endDate }
    });
    return toTrip(trip);
  },
  async updateTrip(id, fields) {
    return toTrip(await request(`/trips/${id}`, { method: 'PATCH', body: fields }));
  },
  reorder: (id, itemIds) => request(`/trips/${id}/items/order`, {
    method: 'PUT', body: { item_ids: itemIds.map(Number) }
  }),
  planTime: (id, itemId, time) => request(`/trips/${id}/items/${itemId}`, {
    method: 'PATCH', body: { planned_time: time }
  }),
  unvisit: (id, itemId) => request(`/trips/${id}/items/${itemId}/visit`, { method: 'DELETE' }),
  notes: (id, itemId) => list(`/trips/${id}/items/${itemId}/notes`),
  saveNote: (id, itemId, noteId, text) => request(
    `/trips/${id}/items/${itemId}/notes${noteId ? '/' + noteId : ''}`,
    { method: noteId ? 'PATCH' : 'POST', body: { text } }
  ),
  deleteNote: (id, itemId, noteId) => request(
    `/trips/${id}/items/${itemId}/notes/${noteId}`, { method: 'DELETE' }
  ),
  async walkingRoute(id) {
    try { return await request(`/trips/${id}/route`); }
    catch (error) { if (error.status === 404) return null; throw error; }
  },
  calculateRoute: (id) => request(`/trips/${id}/route`, { method: 'POST', timeout: 30000 }),
  saveCatalog: (cityId, placeId, body, place = false) => request(
    `/admin/cities${cityId ? '/' + cityId : ''}${place ? '/places' + (placeId ? '/' + placeId : '') : ''}`,
    { method: (place ? placeId : cityId) ? 'PATCH' : 'POST', body }
  ),
  deleteCatalog: (cityId, placeId) => request(
    `/admin/cities/${cityId}${placeId ? '/places/' + placeId : ''}`, { method: 'DELETE' }
  ),
  deleteTrip: (id) => request(`/trips/${id}`, { method: 'DELETE' }),
  async items(tripId) {
    return (await request(`/trips/${tripId}/items`)).map(toItem);
  },
  addItem: (tripId, placeId, position) => request(`/trips/${tripId}/items`, {
    method: 'POST', body: { place_id: Number(placeId), position }
  }),
  deleteItem: (tripId, itemId) => request(`/trips/${tripId}/items/${itemId}`, {
    method: 'DELETE'
  }),
  progress: (tripId) => request(`/trips/${tripId}/progress`),
  visit: (tripId, itemId) => request(`/trips/${tripId}/items/${itemId}/visit`),
  markVisit: (tripId, itemId, rating = null) => request(`/trips/${tripId}/items/${itemId}/visit`, {
    method: 'PUT', body: { rating }
  })
};
