const tokenKey = 'tripline-access-token';
const pageSize = 100;

export function hasSession() {
  return Boolean(sessionStorage.getItem(tokenKey));
}

export function clearSession() {
  sessionStorage.removeItem(tokenKey);
}

async function request(path, { method = 'GET', body, authenticated = true } = {}) {
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
      signal: AbortSignal.timeout(12000)
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
      422: 'Проверьте введённые данные.',
      503: 'Сервис пока недоступен. Попробуйте позже.'
    };
    if (data?.detail === 'Email already registered') messages[409] = 'Эта почта уже зарегистрирована.';
    const error = new Error(messages[response.status] || 'Сервер не смог выполнить запрос.');
    error.status = response.status;
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
    items: []
  };
}

function toItem(item) {
  return {
    id: String(item.id),
    placeId: String(item.place_id),
    position: item.position,
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
  async createTrip({ title, cityId, startDate, endDate }) {
    const trip = await request('/trips', {
      method: 'POST',
      body: { title, city_id: Number(cityId), start_date: startDate, end_date: endDate }
    });
    return toTrip(trip);
  },
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
  markVisit: (tripId, itemId) => request(`/trips/${tripId}/items/${itemId}/visit`, {
    method: 'PUT', body: {}
  })
};
