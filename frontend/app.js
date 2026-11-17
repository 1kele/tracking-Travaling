import { api, clearSession, hasSession } from './api.js';

(() => {
  'use strict';

  const svgPaths = {
    compass:'<circle cx="12" cy="12" r="10"/><path d="m16.2 7.8-2.7 5.7-5.7 2.7 2.7-5.7 5.7-2.7Z"/>',
    grid:'<rect x="3" y="3" width="7" height="7" rx="1.2"/><rect x="14" y="3" width="7" height="7" rx="1.2"/><rect x="3" y="14" width="7" height="7" rx="1.2"/><rect x="14" y="14" width="7" height="7" rx="1.2"/>',
    suitcase:'<rect x="3" y="7" width="18" height="14" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 12h18M9 12v3M15 12v3"/>',
    globe:'<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18"/>',
    map:'<path d="m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3V6Z"/><path d="M9 3v15m6-12v15"/>',
    bell:'<path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"/>',
    arrowRight:'<path d="M5 12h14m-7-7 7 7-7 7"/>',
    arrowLeft:'<path d="M19 12H5m7-7-7 7 7 7"/>',
    plus:'<path d="M12 5v14M5 12h14"/>',
    search:'<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>',
    calendar:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4M17 3v4M3 10h18"/>',
    pin:'<path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/>',
    check:'<path d="m4 12 5 5L20 6"/>',
    clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    coffee:'<path d="M4 8h14v7a6 6 0 0 1-12 0V8ZM18 9h2a3 3 0 0 1 0 6h-2M3 21h17"/>',
    plane:'<path d="m22 2-7 20-4-9-9-4 20-7ZM11 13l11-11"/>',
    settings:'<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.87l.07.07-2.83 2.83-.07-.07a1.7 1.7 0 0 0-1.87-.34 1.7 1.7 0 0 0-1.05 1.57V21h-4v-.1a1.7 1.7 0 0 0-1.05-1.57 1.7 1.7 0 0 0-1.87.34l-.07.07-2.83-2.83.07-.07A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-1.57-1.05H3v-4h.1A1.7 1.7 0 0 0 4.67 8.9a1.7 1.7 0 0 0-.34-1.87l-.07-.07 2.83-2.83.07.07a1.7 1.7 0 0 0 1.87.34 1.7 1.7 0 0 0 1.05-1.57V3h4v.1a1.7 1.7 0 0 0 1.05 1.57 1.7 1.7 0 0 0 1.87-.34l.07-.07 2.83 2.83-.07.07A1.7 1.7 0 0 0 19.4 9a1.7 1.7 0 0 0 1.57 1.05h.1v4h-.1A1.7 1.7 0 0 0 19.4 15Z"/>',
    menu:'<path d="M4 7h16M4 12h16M4 17h16"/>',
    close:'<path d="M5 5 19 19M19 5 5 19"/>',
    dots:'<circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/>',
    trash:'<path d="M4 7h16M10 4h4M7 7l1 14h8l1-14M10 11v6m4-6v6"/>',
    edit:'<path d="m4 20 4-.8L20 7a2 2 0 0 0-3-3L5 16l-1 4ZM15 6l3 3"/>',
    star:'<path d="m12 2 3.1 6.4 7.1 1-5.1 5 .9 7.1-6-3.4-6 3.4.9-7.1-5.1-5 7.1-1L12 2Z"/>',
    external:'<path d="M13 4h7v7M20 4 10 14M20 14v6H4V4h6"/>',
    circleCheck:'<circle cx="12" cy="12" r="9"/><path d="m8 12 3 3 5-6"/>',
    route:'<circle cx="6" cy="18" r="2"/><circle cx="18" cy="6" r="2"/><path d="M8 18h6a4 4 0 0 0 0-8h-4a4 4 0 0 1 0-8"/>',
    info:'<circle cx="12" cy="12" r="10"/><path d="M12 11v6M12 7h.01"/>',
    logout:'<path d="M10 4H4v16h6m5-4 4-4-4-4m-9 4h13"/>',
    chevronDown:'<path d="m6 9 6 6 6-6"/>',
    chevronRight:'<path d="m9 6 6 6-6 6"/>',
    arrowUp:'<path d="M12 19V5m-6 6 6-6 6 6"/>',
    arrowDown:'<path d="M12 5v14m-6-6 6 6 6-6"/>',
    heart:'<path d="M20.8 4.6c-2.6-2.6-6-1.4-8.8 1.4-2.8-2.8-6.2-4-8.8-1.4C-1 8.8 5 15.4 12 21c7-5.6 13-12.2 8.8-16.4Z"/>',
    shield:'<path d="M12 2 4 5v7c0 5 3.5 8.5 8 10 4.5-1.5 8-5 8-10V5l-8-3Z"/>',
    export:'<path d="M12 3v12M7 8l5-5 5 5M5 14v7h14v-7"/>'
  };
  const icon = (name, size=20) => `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${svgPaths[name] || svgPaths.compass}</svg>`;
  const esc = value => String(value == null ? '' : value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const dateOffset = (days) => { const d = new Date(); d.setDate(d.getDate() + days); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; };
  const displayDate = value => value ? new Intl.DateTimeFormat('ru-RU', {day:'numeric', month:'short', year:'numeric'}).format(new Date(value+'T12:00:00')) : 'Дата не выбрана';
  const dayCount = (a,b) => a&&b ? Math.max(1,Math.round((new Date(b+'T12:00:00')-new Date(a+'T12:00:00'))/86400000)+1) : 0;
  const root = document.querySelector('#app');
  const state = {
    profile: null, trips: [], cities: [], ready: false,
    authMode: 'login', authError: '', bootstrapError: '',
    page: 'dashboard', sidebarOpen: false, modal: null, selectedTripId: null,
    selectedCityId: null, search: '', toast: null, filter: 'all', draftCity: null,
    routeLoading: false, routeError: ''
  };
  const cityById = id => state.cities.find(city => city.id === id);
  const placeById = (city, id) => city?.places?.find(place => place.id === id);
  const selectedTrip = () => state.trips.find(trip => trip.id === state.selectedTripId);
  const progress = trip => trip.stats.percent;
  const visitDate = new Intl.DateTimeFormat('ru-RU', { dateStyle: 'medium', timeStyle: 'short' });
  const navItems = [
    ['dashboard', 'grid', 'Обзор'], ['trips', 'suitcase', 'Мои поездки'],
    ['explore', 'globe', 'Исследовать'], ['routes', 'map', 'Маршруты']
  ];

  function renderShell(content,title,subtitle='',right='') {
    root.innerHTML = `<div class="app-shell">
      <aside class="sidebar ${state.sidebarOpen?'open':''}">
        <div class="brand"><span class="brand-icon">${icon('plane',25)}</span><span class="brand-word">tripline<span class="brand-dot">.</span><small>YOUR TRAVEL SPACE</small></span></div>
        <div class="sidebar-caption">РАЗДЕЛЫ</div>
        <nav class="side-nav" aria-label="Основная навигация">${navItems.map(([key,ic,label])=>`<button class="nav-link ${state.page===key?'active':''}" data-action="nav" data-page="${key}">${icon(ic,20)}<span>${label}</span></button>`).join('')}</nav>
        <div class="side-bottom"><div class="side-tip"><span class="side-tip-icon">✦</span><strong>Мир ждёт!</strong><p>Каждая поездка начинается с одного маленького плана.</p><button data-action="new-trip">Создать поездку ${icon('arrowRight',15)}</button></div><button class="profile-button" data-action="nav" data-page="profile"><span class="profile-avatar">${icon('compass',19)}</span><span class="profile-meta"><strong>${esc(state.profile.name)}</strong><small>Мой профиль</small></span>${icon('chevronRight',17)}</button></div>
      </aside><div class="mobile-scrim ${state.sidebarOpen?'visible':''}" data-action="close-sidebar"></div>
      <main class="main-area"><header class="topbar"><div class="topbar-start"><button class="icon-button mobile-toggle" aria-label="Открыть меню" data-action="toggle-sidebar">${icon('menu',22)}</button><div class="breadcrumbs">Пространство путешествий <span>/</span> <strong>${esc(title)}</strong></div></div><div class="topbar-actions"><button class="top-avatar" title="Профиль" data-action="nav" data-page="profile">${esc((state.profile.name||'П').slice(0,1).toUpperCase())}</button></div></header>
      <div class="content-wrap"><section class="page-heading"><div><div class="eyebrow">${esc(subtitle)}</div><h1>${esc(title)}</h1></div><div class="heading-right">${right}</div></section>${content}<footer class="footer-note">TRIPLINE <span>© 2026 · Учебный проект · Валиев Булат, Балтин Михаил</span></footer></div></main>
      ${renderModal()}${state.toast?`<div role="status" class="toast ${state.toast.type==='error'?'error':''}">${icon(state.toast.type==='error'?'info':'circleCheck',18)}${esc(state.toast.message)}</div>`:''}
    </div>`;
  }
  function cityArtwork(city, type='card') {
    return `<div class="city-art city-${city.color} ${type==='large'?'city-art-large':''}"><div class="art-halo"></div><div class="art-sun"></div><div class="art-cloud cloud-a"></div><div class="art-cloud cloud-b"></div><div class="art-skyline skyline-back"></div><div class="art-skyline skyline-front"></div><div class="art-water"></div><span class="art-stamp">${esc(city.emoji)}</span></div>`;
  }
  function tripCard(trip, compact=false) {
    const city=cityById(trip.cityId); if(!city)return '';
    const p=progress(trip), complete=trip.stats.visited;
    return `<article class="trip-card ${compact?'compact':''}"><div class="trip-card-visual">${cityArtwork(city)}<span class="trip-card-city">${icon('pin',13)} ${esc(city.country)}</span></div><div class="trip-card-body"><div class="trip-card-title-row"><div><span class="muted-kicker">${esc(city.name)} ${esc(city.emoji)}</span><h3>${esc(trip.title)}</h3></div><span class="status-pill ${trip.status==='completed'?'done':trip.status==='active'?'active':''}">${trip.status==='completed'?'Завершена':trip.status==='active'?'В процессе':'Запланирована'}</span></div><div class="trip-dates">${icon('calendar',15)} ${displayDate(trip.startDate)} – ${displayDate(trip.endDate)} <span>· ${dayCount(trip.startDate,trip.endDate)} дн.</span></div><div class="progress-top"><span>Прогресс маршрута</span><strong>${p}%</strong></div><div class="progress-track"><span style="width:${p}%"></span></div><div class="trip-card-foot"><div class="mini-avatars">${icon('pin',15)} ${complete} из ${trip.items.length} мест</div><button class="text-button" data-action="open-trip" data-id="${esc(trip.id)}">Открыть маршрут ${icon('arrowRight',16)}</button></div></div></article>`;
  }
  function cityCard(city, featured=false) {return `<article class="destination-card ${featured?'featured':''}"><button class="destination-visual" data-action="view-city" data-id="${city.id}" aria-label="Подробнее о городе ${esc(city.name)}">${cityArtwork(city)}</button><div class="destination-body"><div><span class="destination-country">${esc(city.country)} ${esc(city.emoji)}</span><h3>${esc(city.name)}</h3></div><button class="round-arrow" data-action="view-city" data-id="${city.id}" aria-label="Посмотреть ${esc(city.name)}">${icon('arrowRight',18)}</button></div></article>`;}
  function renderDashboard() {
    const trips=state.trips, active=trips.filter(t=>t.status!=='completed'), placesVisited=trips.reduce((sum, trip)=>sum+trip.stats.visited, 0);
    const content=`<section class="hero"><div class="hero-copy"><span class="hero-overline"><span class="little-star">✳</span> ПУТЕШЕСТВУЙ В СВОЁМ РИТМЕ</span><h2>Коллекционируй<br>не вещи, а <em>моменты.</em></h2><p>Планируй маршрут, отмечай открытия и сохраняй самые яркие воспоминания в одном месте.</p><button class="btn btn-bright" data-action="new-trip">Начать путешествие ${icon('arrowRight',19)}</button></div><div class="hero-illustration" aria-hidden="true"><div class="hero-orbit o1"></div><div class="hero-orbit o2"></div><div class="hero-globe"><div class="globe-line a"></div><div class="globe-line b"></div><span class="hero-plane">✈</span></div><div class="hero-sticker sticker-a">${icon('pin',17)} Весь мир</div><div class="hero-sticker sticker-b">новые<br><b>впечатления ✦</b></div><div class="hero-spark">✳</div></div></section>
      <section class="stats-grid"><div class="stat-card"><span class="stat-symbol lavender">${icon('suitcase',24)}</span><div><span>Всего поездок</span><strong>${trips.length.toString().padStart(2,'0')}</strong></div><span class="stat-trend">Все приключения</span></div><div class="stat-card"><span class="stat-symbol peach">${icon('map',24)}</span><div><span>В планах</span><strong>${active.length.toString().padStart(2,'0')}</strong></div><span class="stat-trend">Будущие открытия</span></div><div class="stat-card"><span class="stat-symbol mint">${icon('pin',24)}</span><div><span>Посещено мест</span><strong>${placesVisited.toString().padStart(2,'0')}</strong></div><span class="stat-trend">Личные впечатления</span></div></section>
      <section class="section-block"><div class="section-head"><div><span class="eyebrow">МОЯ КОЛЛЕКЦИЯ</span><h2>Ближайшие путешествия</h2></div><button class="subtle-link" data-action="nav" data-page="trips">Все поездки ${icon('arrowRight',17)}</button></div><div class="trip-grid">${trips.length?trips.slice(0,2).map(t=>tripCard(t,true)).join(''):'<div class="empty-state">Пока нет поездок. Добавьте первую!</div>'}<button class="add-trip-card" data-action="new-trip"><span>${icon('plus',29)}</span><strong>Новая поездка</strong><small>Начнём с выбора города?</small></button></div></section>
      <section class="section-block"><div class="section-head"><div><span class="eyebrow">ВДОХНОВЕНИЕ</span><h2>Куда отправимся дальше?</h2></div><button class="subtle-link" data-action="nav" data-page="explore">Все направления ${icon('arrowRight',17)}</button></div><div class="destination-grid">${state.cities.slice(0,4).map(c=>cityCard(c)).join('')}</div></section>`;
    renderShell(content,'Хорошего путешествия!','ВАШ ЛИЧНЫЙ МИР ОТКРЫТИЙ');
  }
  function renderTrips() {
    const all=state.trips, visible=all.filter(t=>state.filter==='all'||t.status===state.filter);
    const content=`<div class="page-actions"><p class="support-copy">Все ваши маршруты, планы и воспоминания в одном месте.</p><button class="btn btn-primary" data-action="new-trip">${icon('plus',18)} Новая поездка</button></div><div class="filter-tabs" role="group" aria-label="Фильтр поездок">${[['all','Все поездки'],['planned','Запланированные'],['active','В процессе'],['completed','Завершённые']].map(([key,label])=>`<button data-action="filter" data-filter="${key}" class="${state.filter===key?'selected':''}">${label}</button>`).join('')}</div><div class="trip-grid trips-page-grid">${visible.length?visible.map(t=>tripCard(t)).join(''):`<div class="empty-state wide">${icon('suitcase',38)}<h3>Здесь пока пусто</h3><p>Создайте поездку или выберите другую категорию.</p><button class="btn btn-primary" data-action="new-trip">Создать поездку</button></div>`}</div>`;
    renderShell(content,'Мои поездки','МОИ ПЛАНЫ И ВОСПОМИНАНИЯ');
  }
  function renderExplore(){
    const cities=state.cities.filter(c=>`${c.name} ${c.country}`.toLowerCase().includes(state.search.toLowerCase()));
    const content=`<section class="explore-intro"><div><span class="eyebrow">НАЙДИ СВОЁ МЕСТО</span><h2>У каждого города<br>своя <em>история.</em></h2><p>Исследуй направления, находи интересные места и собирай маршрут под себя.</p></div></section><label class="searchbox">${icon('search',21)}<input type="search" id="city-search" aria-label="Поиск по каталогу" placeholder="Найти город или страну…" value="${esc(state.search)}" autocomplete="off"><span>${cities.length} направлений</span></label><div class="destination-grid explore-grid">${cities.map(c=>cityCard(c)).join('')||'<div class="empty-state wide">Ничего не найдено. Попробуйте изменить запрос.</div>'}</div>`;
    renderShell(content,'Открой новые места','КАТАЛОГ ГОРОДОВ');
  }
  function renderCity(){
    const city=cityById(state.selectedCityId); if(!city){state.page='explore';return renderExplore();}
    const content=`<button class="back-link" data-action="nav" data-page="explore">${icon('arrowLeft',17)} К списку городов</button><div class="city-hero">${cityArtwork(city,'large')}<div class="city-hero-label"><span>${esc(city.country)} ${esc(city.emoji)}</span><h2>${esc(city.name)}</h2></div></div><section class="section-block"><div class="section-head"><div><span class="eyebrow">ОТКРОЙ ГОРОД</span><h2>Что посмотреть</h2></div><button class="btn btn-primary" data-action="new-trip" data-city="${city.id}">${icon('plus',18)} Запланировать поездку</button></div><div class="places-grid">${city.places?.map((place,i)=>`<article class="place-feature"><div class="place-feature-number">${String(i+1).padStart(2,'0')}</div><span class="place-kind">${esc(place.kind)}</span><h3>${esc(place.name)}</h3><p>${esc(place.desc)}</p></article>`).join('') || (city.places ? '<div class="empty-state wide">В каталоге пока нет мест для этого города.</div>' : '<p role="status">Загружаем места…</p>')}</div></section>`;
    renderShell(content,city.name,'ГОРОД И ДОСТОПРИМЕЧАТЕЛЬНОСТИ');
  }
  function renderRoutes(){
    const trips=state.trips.filter(t=>t.items.length);const content=`<div class="page-actions"><p class="support-copy">Готовые маршруты и список мест для каждой поездки.</p><button class="btn btn-primary" data-action="new-trip">${icon('plus',18)} Создать маршрут</button></div><div class="route-gallery">${trips.length?trips.map(t=>{const c=cityById(t.cityId);if(!c)return '';return `<article class="route-overview"><div>${cityArtwork(c)}<span class="route-overview-count">${t.items.length} остановок</span></div><section><div class="eyebrow">${esc(c.country)} ${esc(c.emoji)}</div><h3>${esc(t.title)}</h3><p>${t.items.map(i=>placeById(c,i.placeId)?.name).filter(Boolean).slice(0,3).map(esc).join(' → ')}</p><div class="progress-track"><span style="width:${progress(t)}%"></span></div><button class="subtle-link" data-action="open-trip" data-id="${esc(t.id)}">Открыть маршрут ${icon('arrowRight',17)}</button></section></article>`;}).join(''):'<div class="empty-state wide">Маршрутов ещё нет. Добавьте места в свою первую поездку.</div>'}</div>`;
    renderShell(content,'Маршруты','СОБИРАЙ СВОЙ ПУТЬ');
  }
  function renderProfile() {
    const { name, email } = state.profile;
    renderShell(`<div class="profile-layout">
      <div class="profile-hero">
        <span class="profile-avatar giant">${esc(name.slice(0, 1).toUpperCase())}</span>
        <div><h2>${esc(name)}</h2><p>${esc(email)}</p></div>
      </div>
      <div class="setting-panel">
        <h3>Аккаунт</h3>
        <button class="btn btn-outline" data-action="export">${icon('export', 18)} Экспорт поездок (JSON)</button>
        <button class="btn btn-outline" data-action="logout">${icon('logout', 18)} Выйти</button>
      </div>
    </div>`, 'Мой профиль');
  }
  function renderPlanner(){
    if (state.routeLoading) {
      renderShell('<p role="status">Загружаем маршрут…</p>', 'Мой маршрут');
      return;
    }
    if (state.routeError) {
      renderShell(`<p class="form-error" role="alert">${esc(state.routeError)}</p>
        <button class="btn btn-outline" data-action="retry-trip">Повторить</button>
        <button class="text-button" data-action="nav" data-page="trips">К поездкам</button>`, 'Мой маршрут');
      return;
    }
    const trip=selectedTrip();if(!trip){state.page='trips';return renderTrips();}
    const city=cityById(trip.cityId);if(!city){state.page='trips';return renderTrips();}
    const available=city.places.filter(p=>!trip.items.some(i=>i.placeId===p.id)); const complete=trip.stats.visited;
    const routeItems = trip.items.map((item, index) => {
      const place = placeById(city, item.placeId);
      if (!place) return '';
      const label = item.visited ? 'Место посещено' : 'Отметить как посещённое';
      return `<article class="route-stop ${item.visited ? 'visited' : ''}">
        <button class="stop-marker" data-action="mark-visit" data-id="${esc(item.id)}"
                aria-label="${label}: ${esc(place.name)}" title="${label}" ${item.visited ? 'disabled' : ''}>
          ${item.visited ? icon('check', 18) : index + 1}
        </button>
        <div class="stop-content">
          <div class="stop-top"><span class="stop-kind">${esc(place.kind)}</span>
            <button class="mini-icon dangerous" data-action="remove-place" data-id="${esc(item.id)}"
                    aria-label="Удалить ${esc(place.name)}">${icon('close', 16)}</button>
          </div>
          <h4>${esc(place.name)}</h4><p>${esc(place.desc)}</p>
          ${item.visit ? `<p class="visit-detail">Посещено ${visitDate.format(new Date(item.visit.visited_at))}
            ${item.visit.rating === null ? '' : ` · Оценка ${esc(item.visit.rating)}/5`}</p>` : ''}
          <div class="stop-bottom"><a href="https://www.openstreetmap.org/?mlat=${place.lat}&mlon=${place.lon}#map=16/${place.lat}/${place.lon}"
             target="_blank" rel="noopener noreferrer">На карте ${icon('external', 13)}</a></div>
        </div>
      </article>`;
    }).join('');
    const mapPath=trip.items.map(item=>placeById(city,item.placeId)).filter(Boolean).map(p=>`${p.x},${p.y}`).join(' ');
    const content=`<button class="back-link" data-action="nav" data-page="trips">${icon('arrowLeft',17)} Все поездки</button><div class="planner-banner"><div><span>${esc(city.emoji)} ${esc(city.country)} · ${displayDate(trip.startDate)} – ${displayDate(trip.endDate)}</span><h2>${esc(trip.title)}</h2><p>${dayCount(trip.startDate,trip.endDate)} дн. · ${trip.items.length} мест · ${complete} посещено</p></div><div class="planner-banner-actions"><button class="btn btn-lightoutline" data-action="confirm-delete">${icon('trash',16)} Удалить</button></div></div><div class="planner-layout"><div class="planner-left"><section class="panel route-panel"><div class="panel-head"><div><span class="eyebrow">ТВОЙ ПЛАН</span><h3>Маршрут по городу</h3></div><span class="small-count">${trip.items.length} остановок</span></div><div class="route-timeline">${routeItems||'<div class="empty-state small">В маршруте пока нет мест. Добавьте первую остановку ниже.</div>'}</div><div class="add-stop"><div><strong>Добавить остановку</strong><small>Выберите место из каталога</small></div><button class="small-add" data-action="add-place" ${!available.length?'disabled':''}>${icon('plus',17)} Добавить</button></div></section><section class="panel recommendations"><div class="panel-head"><div><span class="eyebrow">ИДЕИ ДЛЯ ВАС</span><h3>Места неподалёку</h3></div></div><div class="rec-list">${available.length?available.slice(0,3).map(p=>`<div class="rec-row"><span class="rec-emoji">${p.kind==='Музей'?'🏛️':p.kind==='Прогулка'?'🌿':'📍'}</span><div><strong>${esc(p.name)}</strong><small>${esc(p.kind)}</small></div><button data-action="quick-add" data-place="${esc(p.id)}" aria-label="Добавить ${esc(p.name)}">${icon('plus',17)}</button></div>`).join(''):'<p class="muted-empty">Все доступные места уже добавлены.</p>'}</div></section></div>
    <div class="planner-right"><section class="panel map-panel"><div class="panel-head"><div><span class="eyebrow">ВИЗУАЛИЗАЦИЯ</span><h3>Карта маршрута</h3></div><span class="map-pill">${icon('map',14)} Схема</span></div><div class="schematic-map"><div class="map-water"></div><div class="map-highway highway-a"></div><div class="map-highway highway-b"></div><div class="map-highway highway-c"></div><div class="map-park park-a"></div><div class="map-park park-b"></div><div class="map-block block-a"></div><div class="map-block block-b"></div><div class="map-block block-c"></div><div class="map-block block-d"></div><svg class="map-route-line" preserveAspectRatio="none" viewBox="0 0 100 100">${mapPath?`<polyline points="${mapPath}" stroke="#db6749" stroke-width="1.45" fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="3 1"/>`:''}</svg>${trip.items.map((item,i)=>{const p=placeById(city,item.placeId);return p?`<span class="map-pin ${item.visited?'done':''}" style="left:${p.x}%;top:${p.y}%" title="${esc(p.name)}">${item.visited?icon('check',13):i+1}</span>`:'';}).join('')}<div class="map-caption">${icon('pin',15)} ${esc(city.name)}</div></div><p class="map-disclaimer">Условная схема порядка остановок, не географическая навигация.</p><a class="map-external" href="https://www.openstreetmap.org/#map=12/${city.lat}/${city.lon}" target="_blank" rel="noopener noreferrer">Открыть карту ${esc(city.name)} ${icon('external',15)}</a></section><section class="panel progress-panel"><div class="panel-head"><div><span class="eyebrow">ДВИГАЙСЯ ВПЕРЁД</span><h3>Прогресс поездки</h3></div><strong class="large-percent">${progress(trip)}%</strong></div><div class="progress-track big"><span style="width:${progress(trip)}%"></span></div><div class="progress-summary"><span>${icon('circleCheck',17)} ${complete} посещено</span><span>${trip.stats.total-complete} осталось</span></div>${progress(trip)===100&&trip.items.length?'<p class="completion-note">✦ Отлично! Все места из маршрута посещены.</p>':''}</section></div></div>`;
    renderShell(content,'Мой маршрут','ПЛАНИРОВАНИЕ ПОЕЗДКИ');
  }

  function renderModal() {
    if (!state.modal) return '';
    const close = `<button type="button" class="icon-button modal-close" data-action="close-modal"
                           aria-label="Закрыть">${icon('close', 22)}</button>`;
    const trip = selectedTrip();
    const city = cityById(trip?.cityId);
    let title;
    let content;

    if (state.modal === 'new-trip') {
      title = 'Новая поездка';
      const cities = state.cities.map(city =>
        `<option value="${city.id}" ${city.id === state.draftCity ? 'selected' : ''}>${esc(city.name)}, ${esc(city.country)}</option>`
      ).join('');
      content = `<form id="trip-form" class="form-stack">
        <label>Название поездки<input name="title" required maxlength="160" placeholder="Например, Выходные в Казани"></label>
        <label>Город<select name="cityId" required>${cities}</select></label>
        <div class="form-row">
          <label>Дата начала<input name="startDate" type="date" required value="${dateOffset(7)}"></label>
          <label>Дата окончания<input name="endDate" type="date" required value="${dateOffset(10)}"></label>
        </div>
        <p class="form-error" role="alert" hidden></p>
        <button class="btn btn-primary form-submit" type="submit">Создать поездку ${icon('arrowRight', 18)}</button>
      </form>`;
    } else if (state.modal === 'add-place') {
      title = 'Добавить место';
      const available = city?.places?.filter(place => !trip.items.some(item => item.placeId === place.id)) || [];
      content = `<div class="modal-places">${available.map(place => `
        <button data-action="quick-add" data-place="${place.id}" class="modal-place">
          <span class="place-thumb">${icon('pin', 18)}</span>
          <span><strong>${esc(place.name)}</strong><small>${esc(place.kind)}</small></span>
          ${icon('plus', 17)}
        </button>`).join('') || '<p class="empty-state small">Все доступные места уже добавлены.</p>'}</div>`;
    } else {
      title = 'Удалить поездку?';
      content = `<p>Маршрут «${esc(trip?.title)}» и отметки о посещениях будут удалены.</p>
        <div class="confirm-actions">
          <button class="btn btn-outline" data-action="close-modal">Отмена</button>
          <button class="btn btn-danger" data-action="delete-trip">Удалить поездку</button>
        </div>`;
    }
    return `<div class="modal-overlay" data-action="modal-backdrop">
      <div class="modal-card" role="dialog" aria-modal="true" aria-labelledby="dialog-title">
        <div class="modal-head"><h2 id="dialog-title">${title}</h2>${close}</div>
        ${content}
      </div>
    </div>`;
  }

  function renderAuth() {
    const registration = state.authMode === 'register';
    const title = registration ? 'Создать аккаунт' : 'Войти в Tripline';
    const passwordLabel = registration ? 'Пароль (от 12 символов)' : 'Пароль';
    document.title = `${title} — Tripline`;
    root.innerHTML = `<main class="auth-page"><section class="auth-card panel">
      <div class="auth-brand"><span class="brand-icon">${icon('plane', 24)}</span>Tripline</div>
      <h1>${title}</h1>
      <form id="auth-form" class="form-stack">
        ${registration ? '<label>Имя<input name="name" autocomplete="name" maxlength="120" required></label>' : ''}
        <label>Электронная почта<input name="email" type="email" autocomplete="username" maxlength="254" required></label>
        <label>${passwordLabel}<input name="password" type="password" autocomplete="${registration ? 'new-password' : 'current-password'}"
           maxlength="128" ${registration ? 'minlength="12"' : ''} required></label>
        <p class="form-error" role="alert" ${state.authError ? '' : 'hidden'}>${esc(state.authError)}</p>
        <button type="submit" class="btn btn-primary">${registration ? 'Зарегистрироваться' : 'Войти'}</button>
      </form>
      <button type="button" class="text-button auth-switch" data-action="switch-auth">
        ${registration ? 'Уже есть аккаунт? Войти' : 'Нет аккаунта? Зарегистрироваться'}
      </button>
    </section></main>`;
  }

  function render() {
    if (!hasSession()) {
      renderAuth();
      return;
    }
    if (!state.ready) {
      root.innerHTML = `<main class="auth-page"><section class="auth-card panel">
        <h1>${state.bootstrapError ? 'Не удалось загрузить поездки' : 'Загружаем поездки…'}</h1>
        ${state.bootstrapError ? `<p class="form-error" role="alert">${esc(state.bootstrapError)}</p>
          <div class="confirm-actions"><button class="btn btn-primary" data-action="retry">Повторить</button>
          <button class="btn btn-outline" data-action="logout">Выйти</button></div>` : '<p role="status">Подключаемся к серверу.</p>'}
      </section></main>`;
      return;
    }
    const views = {
      dashboard: renderDashboard, trips: renderTrips, explore: renderExplore,
      city: renderCity, planner: renderPlanner, routes: renderRoutes, profile: renderProfile
    };
    views[state.page]();
  }

  function notify(message, type = 'success') {
    const toast = { message, type };
    state.toast = toast;
    render();
    setTimeout(() => {
      if (state.toast !== toast) return;
      state.toast = null;
      root.querySelector('.toast')?.remove();
    }, 4500);
  }

  function signOut(message = '') {
    clearSession();
    Object.assign(state, {
      ready: false, profile: null, trips: [], cities: [], authMode: 'login', authError: message,
      modal: null, toast: null, selectedTripId: null, selectedCityId: null,
      filter: 'all', search: '', sidebarOpen: false
    });
    render();
  }

  function formatPlaces(places) {
    if (!places.length) return [];
    const bounds = places.reduce((box, place) => ({
      minLon: Math.min(box.minLon, place.lon), maxLon: Math.max(box.maxLon, place.lon),
      minLat: Math.min(box.minLat, place.lat), maxLat: Math.max(box.maxLat, place.lat)
    }), { minLon: Infinity, maxLon: -Infinity, minLat: Infinity, maxLat: -Infinity });
    const scale = (coordinate, min, max) => min === max ? 50 : 18 + (coordinate - min) * 64 / (max - min);
    return places.map(place => ({
      id: String(place.id), name: place.name, kind: place.category, desc: place.address,
      lat: place.lat, lon: place.lon, x: scale(place.lon, bounds.minLon, bounds.maxLon),
      y: 100 - scale(place.lat, bounds.minLat, bounds.maxLat)
    }));
  }

  async function loadPlaces(city) {
    if (city.places !== null) return;
    city.places = formatPlaces(await api.places(city.id));
  }

  async function loadItinerary(trip, includeVisits = false) {
    const [items, stats] = await Promise.all([api.items(trip.id), api.progress(trip.id)]);
    if (includeVisits) {
      await Promise.all(items.filter(item => item.visited).map(async item => {
        item.visit = await api.visit(trip.id, item.id);
      }));
    }
    trip.items = items;
    trip.stats = stats;
  }

  async function loadWorkspace() {
    state.bootstrapError = '';
    render();
    try {
      const [profile, cities, trips] = await Promise.all([api.profile(), api.cities(), api.trips()]);
      if (!hasSession()) return;
      const colors = ['teal', 'terra', 'sky', 'amber', 'lavender', 'pink'];
      state.profile = profile;
      state.cities = cities.map(city => ({
        ...city, id: String(city.id), color: colors[city.id % colors.length], places: null
      }));
      state.trips = trips;

      const lookupIds = [...new Set(trips.map(trip => trip.cityId))];
      const loads = [
        ...trips.map(trip => () => loadItinerary(trip)),
        ...lookupIds.map(cityById).filter(Boolean).map(city => () => loadPlaces(city))
      ];
      for (let offset = 0; offset < loads.length; offset += 8) {
        for (const result of await Promise.allSettled(loads.slice(offset, offset + 8).map(load => load()))) {
          if (result.status === 'rejected') throw result.reason;
        }
      }

      state.ready = true;
      await applyLocation();
    } catch (error) {
      if (error.status === 401) {
        signOut(error.message);
        return;
      }
      state.bootstrapError = error.message;
      state.ready = false;
      render();
    }
  }

  async function applyLocation() {
    if (!state.ready) return;
    const route = window.location.hash.slice(1);
    const [section, id] = route.split('/');
    state.modal = null;
    state.sidebarOpen = false;
    if (section === 'trips' && /^\d+$/.test(id || '')) {
      await openTrip(id, route);
      return;
    } else if (section === 'cities' && id && cityById(id)) {
      state.page = 'city';
      state.selectedCityId = id;
      try {
        render();
        await loadPlaces(cityById(id));
      } catch (error) {
        if (window.location.hash.slice(1) === route) {
          notify(error.message, 'error');
          const status = root.querySelector('.places-grid [role="status"]');
          if (status) status.textContent = 'Места не удалось загрузить. Откройте город снова.';
        }
        return;
      }
      if (window.location.hash.slice(1) !== route) return;
    } else {
      state.page = section === 'profile' || navItems.some(([name]) => name === section) ? section : 'dashboard';
    }
    render();
  }

  async function openTrip(id, route) {
    state.page = 'planner';
    state.selectedTripId = id;
    state.routeError = '';
    state.routeLoading = true;
    render();

    try {
      const trip = await api.trip(id);
      const city = cityById(trip.cityId);
      if (!city) throw new Error('Город поездки сейчас недоступен.');
      await Promise.all([loadItinerary(trip, true), loadPlaces(city)]);
      if (!state.ready || window.location.hash.slice(1) !== route) return;
      const index = state.trips.findIndex(entry => entry.id === id);
      if (index === -1) state.trips.push(trip);
      else state.trips[index] = trip;
    } catch (error) {
      if (error.status === 401) {
        signOut(error.message);
        return;
      }
      if (window.location.hash.slice(1) === route) state.routeError = error.message;
    } finally {
      if (state.ready && window.location.hash.slice(1) === route) {
        state.routeLoading = false;
        render();
      }
    }
  }

  async function navigate(route) {
    const hash = `#${route}`;
    if (window.location.hash !== hash) history.pushState(null, '', hash);
    window.scrollTo(0, 0);
    await applyLocation();
  }

  function openModal(name) {
    state.modal = name;
    render();
    const target = root.querySelector('.modal-card input') || root.querySelector('.modal-card [data-action="close-modal"]');
    target?.focus();
  }

  function reportError(error) {
    if (error.status === 401) signOut(error.message);
    else notify(error.message, 'error');
  }

  function showFormError(form, message) {
    const error = form.querySelector('.form-error');
    error.textContent = message;
    error.hidden = false;
  }

  function exportTrips() {
    const json = JSON.stringify({ trips: state.trips }, null, 2);
    const url = URL.createObjectURL(new Blob([json], { type: 'application/json' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'tripline-trips.json';
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  let working = false;
  async function handleAction(action, element) {
    if (working || element.disabled) return;
    working = true;
    const isButton = element instanceof HTMLButtonElement;
    if (isButton) element.disabled = true;
    try {
      const trip = selectedTrip();
      switch (action) {
        case 'switch-auth':
          state.authMode = state.authMode === 'login' ? 'register' : 'login';
          state.authError = '';
          render();
          root.querySelector('#auth-form input')?.focus();
          break;
        case 'logout':
          history.replaceState(null, '', window.location.pathname);
          signOut();
          break;
        case 'retry': await loadWorkspace(); break;
        case 'retry-trip': await applyLocation(); break;
        case 'nav': await navigate(element.dataset.page); break;
        case 'open-trip': await navigate(`trips/${element.dataset.id}`); break;
        case 'view-city': await navigate(`cities/${element.dataset.id}`); break;
        case 'toggle-sidebar': state.sidebarOpen = !state.sidebarOpen; render(); break;
        case 'close-sidebar': state.sidebarOpen = false; render(); break;
        case 'filter': state.filter = element.dataset.filter; render(); break;
        case 'new-trip':
          if (!state.cities.length) {
            notify('В каталоге пока нет городов.', 'error');
            break;
          }
          state.draftCity = element.dataset.city || state.cities[0].id;
          openModal('new-trip');
          break;
        case 'add-place': openModal('add-place'); break;
        case 'confirm-delete': openModal('delete'); break;
        case 'close-modal':
        case 'modal-backdrop':
          state.modal = null;
          render();
          break;
        case 'quick-add': {
          const position = trip.items.reduce((max, item) => Math.max(max, item.position), 0) + 1;
          await api.addItem(trip.id, element.dataset.place, position);
          await loadItinerary(trip, true);
          state.modal = null;
          notify('Место добавлено в маршрут');
          break;
        }
        case 'remove-place':
          await api.deleteItem(trip.id, element.dataset.id);
          await loadItinerary(trip, true);
          notify('Место удалено из маршрута');
          break;
        case 'mark-visit':
          await api.markVisit(trip.id, element.dataset.id);
          await loadItinerary(trip, true);
          notify('Место отмечено как посещённое');
          break;
        case 'delete-trip':
          await api.deleteTrip(trip.id);
          state.trips = state.trips.filter(item => item.id !== trip.id);
          await navigate('trips');
          notify('Поездка удалена');
          break;
        case 'export': exportTrips(); break;
      }
    } catch (error) {
      reportError(error);
    } finally {
      if (isButton) element.disabled = false;
      working = false;
    }
  }

  document.addEventListener('click', event => {
    const element = event.target.closest('[data-action]');
    if (!element || (element.dataset.action === 'modal-backdrop' && element !== event.target)) return;
    event.preventDefault();
    void handleAction(element.dataset.action, element);
  });

  document.addEventListener('submit', async event => {
    const form = event.target;
    if (form.id !== 'trip-form' && form.id !== 'auth-form') return;
    event.preventDefault();
    if (working) return;
    working = true;

    const fields = new FormData(form);
    const submit = form.querySelector('button[type="submit"]');
    const label = submit.textContent;
    submit.disabled = true;
    submit.textContent = 'Подождите…';
    form.querySelector('.form-error').hidden = true;
    try {
      if (form.id === 'auth-form') {
        const email = fields.get('email').trim();
        const password = fields.get('password');
        if (state.authMode === 'register') {
          await api.register({ email, password, name: fields.get('name').trim() });
        }
        await api.login(email, password);
        await loadWorkspace();
      } else {
        const { cityId, startDate, endDate, title } = Object.fromEntries(fields);
        if (endDate < startDate) {
          showFormError(form, 'Дата окончания не может быть раньше начала.');
          return;
        }
        await loadPlaces(cityById(cityId));
        const trip = await api.createTrip({ cityId, startDate, endDate, title: title.trim() });
        state.trips.push(trip);
        await navigate(`trips/${trip.id}`);
        notify('Поездка создана');
      }
    } catch (error) {
      if (form.id === 'trip-form' && error.status === 401) signOut(error.message);
      else showFormError(form, error.message);
    } finally {
      submit.disabled = false;
      submit.textContent = label.trim();
      working = false;
    }
  });

  document.addEventListener('input', event => {
    if (event.target.id !== 'city-search') return;
    state.search = event.target.value;
    render();
    root.querySelector('#city-search')?.focus();
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && state.modal && !working) {
      state.modal = null;
      render();
    }
  });
  window.addEventListener('hashchange', () => { void applyLocation(); });
  if (hasSession()) void loadWorkspace();
  else render();
})();
