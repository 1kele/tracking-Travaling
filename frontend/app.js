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
  const uid = () => (globalThis.crypto && crypto.randomUUID ? crypto.randomUUID() : `id-${Date.now()}-${Math.random().toString(36).slice(2)}`);
  const dateOffset = (days) => { const d = new Date(); d.setDate(d.getDate() + days); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; };
  const displayDate = value => value ? new Intl.DateTimeFormat('ru-RU', {day:'numeric', month:'short', year:'numeric'}).format(new Date(value+'T12:00:00')) : 'Дата не выбрана';
  const dayCount = (a,b) => a&&b ? Math.max(1,Math.round((new Date(b+'T12:00:00')-new Date(a+'T12:00:00'))/86400000)+1) : 0;
  const CITIES = [
    {id:'istanbul', name:'Стамбул', country:'Турция', emoji:'🇹🇷', tag:'Культура и история', desc:'Город двух континентов, минаретов и ароматного кофе', color:'terra', lat:41.0082, lon:28.9784, places:[
      {id:'aya',name:'Собор Святой Софии',kind:'Архитектура',duration:90,lat:41.0086,lon:28.9802,x:24,y:30,desc:'Знаменитый памятник византийской архитектуры'},
      {id:'galata',name:'Галатская башня',kind:'Смотровая',duration:60,lat:41.0256,lon:28.9741,x:51,y:21,desc:'Панорамный вид на исторический центр'},
      {id:'grand',name:'Гранд-базар',kind:'Рынок',duration:120,lat:41.0107,lon:28.9681,x:40,y:57,desc:'Большой исторический крытый рынок'},
      {id:'topkapi',name:'Дворец Топкапы',kind:'Музей',duration:120,lat:41.0115,lon:28.9834,x:77,y:36,desc:'Резиденция османских султанов'},
      {id:'bosphorus',name:'Набережная Босфора',kind:'Прогулка',duration:75,lat:41.0436,lon:29.0020,x:69,y:72,desc:'Красивые виды на пролив и город'}]},
    {id:'rome',name:'Рим',country:'Италия',emoji:'🇮🇹',tag:'История и искусство',desc:'Античные улицы, площади и итальянские закаты',color:'amber',lat:41.9028,lon:12.4964,places:[
      {id:'colosseum',name:'Колизей',kind:'История',duration:90,lat:41.8902,lon:12.4922,x:68,y:36,desc:'Античный амфитеатр'},
      {id:'forum',name:'Римский форум',kind:'История',duration:100,lat:41.8925,lon:12.4853,x:41,y:43,desc:'Археологический комплекс'},
      {id:'trevi',name:'Фонтан Треви',kind:'Архитектура',duration:35,lat:41.9009,lon:12.4833,x:35,y:24,desc:'Знаменитый барочный фонтан'},
      {id:'pantheon',name:'Пантеон',kind:'Архитектура',duration:50,lat:41.8986,lon:12.4769,x:23,y:67,desc:'Древнеримский храм'},
      {id:'vatican',name:'Музеи Ватикана',kind:'Музей',duration:180,lat:41.9065,lon:12.4536,x:74,y:73,desc:'Музейные коллекции Ватикана'}]},
    {id:'paris',name:'Париж',country:'Франция',emoji:'🇫🇷',tag:'Романтика и искусство',desc:'Музеи, бульвары и прогулки вдоль Сены',color:'lavender',lat:48.8566,lon:2.3522,places:[
      {id:'eiffel',name:'Эйфелева башня',kind:'Смотровая',duration:90,lat:48.8584,lon:2.2945,x:22,y:36,desc:'Символ Парижа'},
      {id:'louvre',name:'Лувр',kind:'Музей',duration:180,lat:48.8606,lon:2.3376,x:49,y:28,desc:'Всемирно известный художественный музей'},
      {id:'notredame',name:'Нотр-Дам',kind:'Архитектура',duration:60,lat:48.8530,lon:2.3499,x:70,y:55,desc:'Собор на острове Сите'},
      {id:'montmartre',name:'Монмартр',kind:'Прогулка',duration:100,lat:48.8867,lon:2.3431,x:47,y:76,desc:'Художественный квартал Парижа'}]},
    {id:'kazan',name:'Казань',country:'Россия',emoji:'🇷🇺',tag:'История и традиции',desc:'Переплетение культур, тысячелетняя история и уютные улицы',color:'teal',lat:55.7961,lon:49.1064,places:[
      {id:'kremlin',name:'Казанский кремль',kind:'История',duration:100,lat:55.7986,lon:49.1064,x:25,y:35,desc:'Главная историческая достопримечательность'},
      {id:'kulsharif',name:'Мечеть Кул-Шариф',kind:'Архитектура',duration:50,lat:55.7988,lon:49.1057,x:41,y:24,desc:'Мечеть на территории Кремля'},
      {id:'bauman',name:'Улица Баумана',kind:'Прогулка',duration:80,lat:55.7889,lon:49.1190,x:72,y:51,desc:'Пешеходная улица в центре города'},
      {id:'chasha',name:'Центр семьи «Казан»',kind:'Смотровая',duration:55,lat:55.8124,lon:49.1089,x:66,y:75,desc:'Смотровая площадка у набережной'}]},
    {id:'tokyo',name:'Токио',country:'Япония',emoji:'🇯🇵',tag:'Технологии и культура',desc:'Неоновые кварталы, традиции и огромный мегаполис',color:'pink',lat:35.6762,lon:139.6503,places:[
      {id:'shibuya',name:'Перекрёсток Сибуя',kind:'Прогулка',duration:45,lat:35.6595,lon:139.7004,x:31,y:41,desc:'Оживлённый пешеходный перекрёсток'},
      {id:'sensoji',name:'Храм Сэнсо-дзи',kind:'Культура',duration:70,lat:35.7148,lon:139.7967,x:70,y:28,desc:'Древний буддийский храм'},
      {id:'skytree',name:'Tokyo Skytree',kind:'Смотровая',duration:90,lat:35.7101,lon:139.8107,x:77,y:68,desc:'Высотная смотровая площадка'},
      {id:'meiji',name:'Храм Мэйдзи',kind:'Культура',duration:75,lat:35.6764,lon:139.6993,x:38,y:76,desc:'Святилище среди зелени'}]},
    {id:'stockholm',name:'Стокгольм',country:'Швеция',emoji:'🇸🇪',tag:'Северная архитектура',desc:'Острова, цветные фасады и скандинавская атмосфера',color:'sky',lat:59.3293,lon:18.0686,places:[
      {id:'gamla',name:'Гамла Стан',kind:'Прогулка',duration:110,lat:59.3252,lon:18.0706,x:37,y:31,desc:'Исторический центр города'},
      {id:'vasa',name:'Музей Васа',kind:'Музей',duration:130,lat:59.3280,lon:18.0914,x:71,y:42,desc:'Музей старинного корабля'},
      {id:'stadshuset',name:'Городская ратуша',kind:'Архитектура',duration:75,lat:59.3275,lon:18.0552,x:25,y:66,desc:'Знаковое здание на берегу'},
      {id:'skansen',name:'Скансен',kind:'Музей',duration:140,lat:59.3248,lon:18.1037,x:77,y:78,desc:'Музей под открытым небом'}]}
  ];
  const cityById = id => CITIES.find(c => c.id === id);
  const placeById = (city, placeId) => city?.places.find(p => p.id === placeId);
  const defaultTrips = () => [
    {id:uid(),cityId:'istanbul',title:'Выходные в Стамбуле',startDate:dateOffset(7),endDate:dateOffset(10),status:'planned',createdAt:Date.now(),items:[
      {id:uid(),placeId:'aya',visited:false,notes:'',rating:0},{id:uid(),placeId:'galata',visited:false,notes:'',rating:0},{id:uid(),placeId:'grand',visited:false,notes:'',rating:0}]},
    {id:uid(),cityId:'kazan',title:'Знакомство с Казанью',startDate:dateOffset(-20),endDate:dateOffset(-17),status:'completed',createdAt:Date.now()-10000000,items:[
      {id:uid(),placeId:'kremlin',visited:true,notes:'Очень красивое место!',rating:5},{id:uid(),placeId:'kulsharif',visited:true,notes:'',rating:5},{id:uid(),placeId:'bauman',visited:true,notes:'',rating:4},{id:uid(),placeId:'chasha',visited:false,notes:'',rating:0}]}
  ];
  const STORAGE = 'tripline-demo-v1';
  const loadDemo = () => {try{const o=JSON.parse(localStorage.getItem(STORAGE));if(o && Array.isArray(o.trips)) return o;}catch(e){}return {trips:defaultTrips(),notificationsRead:false,profile:{name:'Путешественник',email:''}};};
  const mode = window.TRAVEL_CONFIG?.mode === 'api' ? 'api' : 'demo';
  const base = String(window.TRAVEL_CONFIG?.apiBaseUrl || '/api').replace(/\/$/,'');
  const store = loadDemo();
  const api = {
    async request(method, path, body) {
      const ctrl = new AbortController(); const timeout = setTimeout(() => ctrl.abort(), window.TRAVEL_CONFIG?.requestTimeoutMs || 12000);
      try {
        const result = await fetch(base + path, {method, headers:{'Content-Type':'application/json'}, credentials:'include', body:body===undefined?undefined:JSON.stringify(body), signal:ctrl.signal});
        if (!result.ok) throw new Error(`Сервер ответил ${result.status}`);
        if (result.status === 204) return null;
        return result.json();
      } finally {clearTimeout(timeout);}
    },
    async getTrips() { return mode === 'demo' ? structuredClone(store.trips) : api.request('GET','/trips'); },
    async createTrip(trip) { if(mode === 'api') return api.request('POST','/trips',trip); store.trips.unshift(trip); persist();return trip; },
    async updateTrip(trip) { if(mode === 'api') return api.request('PATCH',`/trips/${encodeURIComponent(trip.id)}`,trip); const i=store.trips.findIndex(t=>t.id===trip.id);if(i>=0)store.trips[i]=trip;persist();return trip; },
    async deleteTrip(id) { if(mode === 'api') return api.request('DELETE',`/trips/${encodeURIComponent(id)}`);store.trips=store.trips.filter(t=>t.id!==id);persist(); },
    async getCities() { return mode === 'demo' ? CITIES : api.request('GET','/cities'); },
    async getPlaces(id) { return mode === 'demo' ? cityById(id)?.places||[] : api.request('GET',`/cities/${encodeURIComponent(id)}/places`); }
  };
  function persist() {if(mode==='demo')localStorage.setItem(STORAGE,JSON.stringify(store));}
  const state = {page:'dashboard',sidebarOpen:false,modal:null,menuFor:null,selectedTripId:null,selectedCityId:null,search:'',toast:null,filter:'all',confirmDelete:null, trips:store.trips, cities:CITIES, draftCity:'istanbul', draftNotesFor:null, placeSearch:''};
  const root = document.querySelector('#app');
  const progress = trip => trip.items.length ? Math.round(trip.items.filter(item=>item.visited).length/trip.items.length*100) : 0;
  const selectedTrip = () => state.trips.find(t=>t.id===state.selectedTripId);
  const notify = (message, type='success') => {state.toast={message,type};render();setTimeout(()=>{if(state.toast?.message===message){state.toast=null;render();}},3600);};
  const updateLocal = async trip => {await api.updateTrip(trip);state.trips=await api.getTrips();};
  const navItems = [
    ['dashboard','grid','Обзор'],['trips','suitcase','Мои поездки'],['explore','globe','Исследовать'],['routes','map','Маршруты'],['notifications','bell','Уведомления']
  ];
  function renderShell(content,title,subtitle='',right='') {
    const notificationsCount = store.notificationsRead ? 0 : 2;
    root.innerHTML = `<div class="app-shell">
      <aside class="sidebar ${state.sidebarOpen?'open':''}">
        <div class="brand"><span class="brand-icon">${icon('plane',25)}</span><span class="brand-word">tripline<span class="brand-dot">.</span><small>YOUR TRAVEL SPACE</small></span></div>
        <div class="sidebar-caption">РАЗДЕЛЫ</div>
        <nav class="side-nav" aria-label="Основная навигация">${navItems.map(([key,ic,label])=>`<button class="nav-link ${state.page===key?'active':''}" data-action="nav" data-page="${key}">${icon(ic,20)}<span>${label}</span>${key==='notifications'&&notificationsCount?`<span class="nav-count">${notificationsCount}</span>`:''}</button>`).join('')}</nav>
        <div class="side-bottom"><div class="side-tip"><span class="side-tip-icon">✦</span><strong>Мир ждёт!</strong><p>Каждая поездка начинается с одного маленького плана.</p><button data-action="new-trip">Создать поездку ${icon('arrowRight',15)}</button></div><button class="profile-button" data-action="nav" data-page="profile"><span class="profile-avatar">${icon('compass',19)}</span><span class="profile-meta"><strong>${esc(store.profile.name)}</strong><small>${mode==='demo'?'Демо-профиль':'Мой профиль'}</small></span>${icon('chevronRight',17)}</button></div>
      </aside><div class="mobile-scrim ${state.sidebarOpen?'visible':''}" data-action="close-sidebar"></div>
      <main class="main-area"><header class="topbar"><div class="topbar-start"><button class="icon-button mobile-toggle" aria-label="Открыть меню" data-action="toggle-sidebar">${icon('menu',22)}</button><div class="breadcrumbs">Пространство путешествий <span>/</span> <strong>${esc(title)}</strong></div></div><div class="topbar-actions"><span class="demo-chip">${mode==='demo'?'<span class="pulse"></span> Демо-режим':'Подключён к API'}</span><button class="icon-button bell-button" aria-label="Уведомления" data-action="nav" data-page="notifications">${icon('bell',20)}${notificationsCount?'<i></i>':''}</button><button class="top-avatar" title="Профиль" data-action="nav" data-page="profile">${esc((store.profile.name||'П').slice(0,1).toUpperCase())}</button></div></header>
      <div class="content-wrap"><section class="page-heading"><div><div class="eyebrow">${esc(subtitle)}</div><h1>${esc(title)}</h1></div><div class="heading-right">${right}</div></section>${content}<footer class="footer-note">TRIPLINE <span>© 2026 · Учебный проект · Валиев Булат, Балтин Михаил</span></footer></div></main>
      ${renderModal()}${state.toast?`<div role="status" class="toast ${state.toast.type==='error'?'error':''}">${icon(state.toast.type==='error'?'info':'circleCheck',18)}${esc(state.toast.message)}</div>`:''}
    </div>`;
  }
  function cityArtwork(city, type='card') {
    return `<div class="city-art city-${city.color} ${type==='large'?'city-art-large':''}"><div class="art-halo"></div><div class="art-sun"></div><div class="art-cloud cloud-a"></div><div class="art-cloud cloud-b"></div><div class="art-skyline skyline-back"></div><div class="art-skyline skyline-front"></div><div class="art-water"></div><span class="art-stamp">${esc(city.emoji)}</span></div>`;
  }
  function tripCard(trip, compact=false) {
    const city=cityById(trip.cityId); if(!city)return '';
    const p=progress(trip), complete=trip.items.filter(i=>i.visited).length;
    return `<article class="trip-card ${compact?'compact':''}"><div class="trip-card-visual">${cityArtwork(city)}<span class="trip-card-city">${icon('pin',13)} ${esc(city.country)}</span></div><div class="trip-card-body"><div class="trip-card-title-row"><div><span class="muted-kicker">${esc(city.name)} ${esc(city.emoji)}</span><h3>${esc(trip.title)}</h3></div><span class="status-pill ${trip.status==='completed'?'done':trip.status==='active'?'active':''}">${trip.status==='completed'?'Завершена':trip.status==='active'?'В процессе':'Запланирована'}</span></div><div class="trip-dates">${icon('calendar',15)} ${displayDate(trip.startDate)} – ${displayDate(trip.endDate)} <span>· ${dayCount(trip.startDate,trip.endDate)} дн.</span></div><div class="progress-top"><span>Прогресс маршрута</span><strong>${p}%</strong></div><div class="progress-track"><span style="width:${p}%"></span></div><div class="trip-card-foot"><div class="mini-avatars">${icon('pin',15)} ${complete} из ${trip.items.length} мест</div><button class="text-button" data-action="open-trip" data-id="${esc(trip.id)}">Открыть маршрут ${icon('arrowRight',16)}</button></div></div></article>`;
  }
  function cityCard(city, featured=false) {return `<article class="destination-card ${featured?'featured':''}"><button class="destination-visual" data-action="view-city" data-id="${city.id}" aria-label="Подробнее о городе ${esc(city.name)}">${cityArtwork(city)}</button><div class="destination-body"><div><span class="destination-country">${esc(city.country)} ${esc(city.emoji)}</span><h3>${esc(city.name)}</h3><p>${esc(city.tag)}</p></div><button class="round-arrow" data-action="view-city" data-id="${city.id}" aria-label="Посмотреть ${esc(city.name)}">${icon('arrowRight',18)}</button></div></article>`;}
  function renderDashboard() {
    const trips=state.trips, active=trips.filter(t=>t.status!=='completed'), placesVisited=trips.flatMap(t=>t.items).filter(i=>i.visited).length;
    const content=`<section class="hero"><div class="hero-copy"><span class="hero-overline"><span class="little-star">✳</span> ПУТЕШЕСТВУЙ В СВОЁМ РИТМЕ</span><h2>Коллекционируй<br>не вещи, а <em>моменты.</em></h2><p>Планируй маршрут, отмечай открытия и сохраняй самые яркие воспоминания в одном месте.</p><button class="btn btn-bright" data-action="new-trip">Начать путешествие ${icon('arrowRight',19)}</button></div><div class="hero-illustration" aria-hidden="true"><div class="hero-orbit o1"></div><div class="hero-orbit o2"></div><div class="hero-globe"><div class="globe-line a"></div><div class="globe-line b"></div><span class="hero-plane">✈</span></div><div class="hero-sticker sticker-a">${icon('pin',17)} Весь мир</div><div class="hero-sticker sticker-b">новые<br><b>впечатления ✦</b></div><div class="hero-spark">✳</div></div></section>
      <section class="stats-grid"><div class="stat-card"><span class="stat-symbol lavender">${icon('suitcase',24)}</span><div><span>Всего поездок</span><strong>${trips.length.toString().padStart(2,'0')}</strong></div><span class="stat-trend">Все приключения</span></div><div class="stat-card"><span class="stat-symbol peach">${icon('map',24)}</span><div><span>В планах</span><strong>${active.length.toString().padStart(2,'0')}</strong></div><span class="stat-trend">Будущие открытия</span></div><div class="stat-card"><span class="stat-symbol mint">${icon('pin',24)}</span><div><span>Посещено мест</span><strong>${placesVisited.toString().padStart(2,'0')}</strong></div><span class="stat-trend">Личные впечатления</span></div></section>
      <section class="section-block"><div class="section-head"><div><span class="eyebrow">МОЯ КОЛЛЕКЦИЯ</span><h2>Ближайшие путешествия</h2></div><button class="subtle-link" data-action="nav" data-page="trips">Все поездки ${icon('arrowRight',17)}</button></div><div class="trip-grid">${trips.length?trips.slice(0,2).map(t=>tripCard(t,true)).join(''):'<div class="empty-state">Пока нет поездок. Добавьте первую!</div>'}<button class="add-trip-card" data-action="new-trip"><span>${icon('plus',29)}</span><strong>Новая поездка</strong><small>Начнём с выбора города?</small></button></div></section>
      <section class="section-block"><div class="section-head"><div><span class="eyebrow">ВДОХНОВЕНИЕ</span><h2>Куда отправимся дальше?</h2></div><button class="subtle-link" data-action="nav" data-page="explore">Все направления ${icon('arrowRight',17)}</button></div><div class="destination-grid">${CITIES.slice(1,5).map(c=>cityCard(c)).join('')}</div></section>`;
    renderShell(content,'Хорошего путешествия!','ВАШ ЛИЧНЫЙ МИР ОТКРЫТИЙ');
  }
  function renderTrips() {
    const all=state.trips, visible=all.filter(t=>state.filter==='all'||t.status===state.filter);
    const content=`<div class="page-actions"><p class="support-copy">Все ваши маршруты, планы и воспоминания в одном месте.</p><button class="btn btn-primary" data-action="new-trip">${icon('plus',18)} Новая поездка</button></div><div class="filter-tabs" role="group" aria-label="Фильтр поездок">${[['all','Все поездки'],['planned','Запланированные'],['active','В процессе'],['completed','Завершённые']].map(([key,label])=>`<button data-action="filter" data-filter="${key}" class="${state.filter===key?'selected':''}">${label}</button>`).join('')}</div><div class="trip-grid trips-page-grid">${visible.length?visible.map(t=>tripCard(t)).join(''):`<div class="empty-state wide">${icon('suitcase',38)}<h3>Здесь пока пусто</h3><p>Создайте поездку или выберите другую категорию.</p><button class="btn btn-primary" data-action="new-trip">Создать поездку</button></div>`}</div>`;
    renderShell(content,'Мои поездки','МОИ ПЛАНЫ И ВОСПОМИНАНИЯ');
  }
  function renderExplore(){
    const cities=CITIES.filter(c=>`${c.name} ${c.country} ${c.tag}`.toLowerCase().includes(state.search.toLowerCase()));
    const content=`<section class="explore-intro"><div><span class="eyebrow">НАЙДИ СВОЁ МЕСТО</span><h2>У каждого города<br>своя <em>история.</em></h2><p>Исследуй направления, находи интересные места и собирай маршрут под себя.</p></div><div class="explore-globe">✳ <span>6 городов<br>и тысячи идей</span></div></section><label class="searchbox">${icon('search',21)}<input type="search" id="city-search" placeholder="Найти город, страну или впечатление..." value="${esc(state.search)}" autocomplete="off"><span>${cities.length} направлений</span></label><div class="destination-grid explore-grid">${cities.map(c=>cityCard(c)).join('')||'<div class="empty-state wide">Ничего не найдено. Попробуйте изменить запрос.</div>'}</div>`;
    renderShell(content,'Открой новые места','КАТАЛОГ ГОРОДОВ');
  }
  function renderCity(){
    const city=cityById(state.selectedCityId); if(!city){state.page='explore';return renderExplore();}
    const content=`<button class="back-link" data-action="nav" data-page="explore">${icon('arrowLeft',17)} К списку городов</button><div class="city-hero">${cityArtwork(city,'large')}<div class="city-hero-label"><span>${esc(city.country)} ${esc(city.emoji)}</span><h2>${esc(city.name)}</h2><p>${esc(city.desc)}</p></div></div><section class="section-block"><div class="section-head"><div><span class="eyebrow">ОТКРОЙ ГОРОД</span><h2>Что посмотреть</h2></div><button class="btn btn-primary" data-action="new-trip" data-city="${city.id}">${icon('plus',18)} Запланировать поездку</button></div><div class="places-grid">${city.places.map((place,i)=>`<article class="place-feature"><div class="place-feature-number">${String(i+1).padStart(2,'0')}</div><span class="place-kind">${esc(place.kind)}</span><h3>${esc(place.name)}</h3><p>${esc(place.desc)}</p><div>${icon('clock',15)} Около ${place.duration} мин.</div></article>`).join('')}</div></section>`;
    renderShell(content,city.name,'ГОРОД И ДОСТОПРИМЕЧАТЕЛЬНОСТИ');
  }
  function renderRoutes(){
    const trips=state.trips.filter(t=>t.items.length);const content=`<div class="page-actions"><p class="support-copy">Готовые маршруты и список мест для каждой поездки.</p><button class="btn btn-primary" data-action="new-trip">${icon('plus',18)} Создать маршрут</button></div><div class="route-gallery">${trips.length?trips.map(t=>{const c=cityById(t.cityId);return `<article class="route-overview"><div>${cityArtwork(c)}<span class="route-overview-count">${t.items.length} остановок</span></div><section><div class="eyebrow">${esc(c.country)} ${esc(c.emoji)}</div><h3>${esc(t.title)}</h3><p>${t.items.map(i=>placeById(c,i.placeId)?.name).filter(Boolean).slice(0,3).join(' → ')}</p><div class="progress-track"><span style="width:${progress(t)}%"></span></div><button class="subtle-link" data-action="open-trip" data-id="${esc(t.id)}">Открыть маршрут ${icon('arrowRight',17)}</button></section></article>`;}).join(''):'<div class="empty-state wide">Маршрутов ещё нет. Добавьте места в свою первую поездку.</div>'}</div>`;
    renderShell(content,'Маршруты','СОБИРАЙ СВОЙ ПУТЬ');
  }
  function renderNotifications(){
    const items=[{iconName:'plane',title:'Путешествия начинаются с плана',desc:'Добавьте новую поездку и выберите интересные места.',when:'Подсказка'},{iconName:'pin',title:'Не забывайте отмечать посещения',desc:'Так вы сможете отслеживать прогресс каждого маршрута.',when:'Подсказка'}];
    store.notificationsRead=true;persist();
    renderShell(`<div class="notification-list">${items.map(n=>`<article class="notification-card"><span class="notif-symbol">${icon(n.iconName,22)}</span><div><div class="notif-heading"><h3>${n.title}</h3><small>${n.when}</small></div><p>${n.desc}</p></div></article>`).join('')}<p class="info-note">${icon('info',16)} Сейчас здесь показаны демонстрационные подсказки. Серверные уведомления появятся после интеграции с бэкендом.</p></div>`,'Уведомления','НЕ ПРОПУСКАЙ ВАЖНОЕ');
  }
  function renderProfile(){
    renderShell(`<div class="profile-layout"><div class="profile-hero"><span class="profile-avatar giant">${esc((store.profile.name||'П').slice(0,1).toUpperCase())}</span><div><h2>${esc(store.profile.name)}</h2><p>${esc(store.profile.email || 'Профиль для демонстрации интерфейса')}</p><span class="status-pill">${mode==='demo'?'Локальный демо-режим':'Подключено к серверу'}</span></div></div><div class="setting-panel"><h3>Личные данные</h3><p>Имя отображается в профиле и в меню сервиса.</p><form id="profile-form" class="form-stack"><label>Как к вам обращаться?<input name="name" required maxlength="60" value="${esc(store.profile.name)}"></label><label>Электронная почта<input name="email" type="email" value="${esc(store.profile.email||'')}" placeholder="you@example.com"></label><button class="btn btn-primary" type="submit">Сохранить профиль</button></form></div><div class="setting-panel"><h3>Демонстрационные данные</h3><p>Поездки в демо-режиме хранятся только в этом браузере. Пароли не сохраняются.</p><button class="btn btn-outline" data-action="export">${icon('export',18)} Экспорт поездок (JSON)</button></div></div>`,'Мой профиль','НАСТРОЙКИ');
  }
  function renderPlanner(){
    const trip=selectedTrip();if(!trip){state.page='trips';return renderTrips();}
    const city=cityById(trip.cityId);if(!city){state.page='trips';return renderTrips();}
    const available=city.places.filter(p=>!trip.items.some(i=>i.placeId===p.id)); const complete=trip.items.filter(x=>x.visited).length;
    const routeItems=trip.items.map((item,index)=>{const place=placeById(city,item.placeId);if(!place)return '';return `<article class="route-stop ${item.visited?'visited':''}"><button class="stop-marker" data-action="toggle-visit" data-id="${esc(item.id)}" title="${item.visited?'Снять отметку':'Отметить как посещённое'}">${item.visited?icon('check',18):index+1}</button><div class="stop-content"><div class="stop-top"><span class="stop-kind">${esc(place.kind)} · ~${place.duration} мин</span><div class="stop-controls"><button class="mini-icon" data-action="move" data-id="${esc(item.id)}" data-dir="up" aria-label="Переместить выше" ${index===0?'disabled':''}>${icon('arrowUp',16)}</button><button class="mini-icon" data-action="move" data-id="${esc(item.id)}" data-dir="down" aria-label="Переместить ниже" ${index===trip.items.length-1?'disabled':''}>${icon('arrowDown',16)}</button><button class="mini-icon dangerous" data-action="remove-place" data-id="${esc(item.id)}" aria-label="Удалить место">${icon('close',16)}</button></div></div><h4>${esc(place.name)}</h4><p>${esc(place.desc)}</p><div class="stop-bottom"><button data-action="note" data-id="${esc(item.id)}" class="stop-note">${icon('edit',15)} ${item.notes?'Редактировать заметку':'Добавить заметку'}</button>${item.rating?`<span class="rating-inline">${'★'.repeat(item.rating)}${'☆'.repeat(5-item.rating)}</span>`:''}<a href="https://www.openstreetmap.org/?mlat=${place.lat}&mlon=${place.lon}#map=16/${place.lat}/${place.lon}" target="_blank" rel="noopener noreferrer">На реальной карте ${icon('external',13)}</a></div>${item.notes?`<div class="note-preview">«${esc(item.notes)}»</div>`:''}</div></article>`;}).join('');
    let mapPath=trip.items.map(item=>placeById(city,item.placeId)).filter(Boolean).map(p=>`${p.x},${p.y}`).join(' ');
    const content=`<button class="back-link" data-action="nav" data-page="trips">${icon('arrowLeft',17)} Все поездки</button><div class="planner-banner"><div><span>${esc(city.emoji)} ${esc(city.country)} · ${displayDate(trip.startDate)} – ${displayDate(trip.endDate)}</span><h2>${esc(trip.title)}</h2><p>${dayCount(trip.startDate,trip.endDate)} дн. · ${trip.items.length} мест · ${complete} посещено</p></div><div class="planner-banner-actions"><button class="btn btn-lightoutline" data-action="edit-trip">${icon('edit',16)} Изменить</button><button class="btn btn-lightoutline" data-action="confirm-delete">${icon('trash',16)} Удалить</button></div></div><div class="planner-layout"><div class="planner-left"><section class="panel route-panel"><div class="panel-head"><div><span class="eyebrow">ТВОЙ ПЛАН</span><h3>Маршрут по городу</h3></div><span class="small-count">${trip.items.length} остановок</span></div><div class="route-timeline">${routeItems||'<div class="empty-state small">В маршруте пока нет мест. Добавьте первую остановку ниже.</div>'}</div><div class="add-stop"><div><strong>Добавить остановку</strong><small>Выберите место из каталога</small></div><button class="small-add" data-action="add-place" ${!available.length?'disabled':''}>${icon('plus',17)} Добавить</button></div></section><section class="panel recommendations"><div class="panel-head"><div><span class="eyebrow">ИДЕИ ДЛЯ ВАС</span><h3>Места неподалёку</h3></div></div><div class="rec-list">${available.length?available.slice(0,3).map(p=>`<div class="rec-row"><span class="rec-emoji">${p.kind==='Музей'?'🏛️':p.kind==='Прогулка'?'🌿':'📍'}</span><div><strong>${esc(p.name)}</strong><small>${esc(p.kind)} · ${p.duration} мин</small></div><button data-action="quick-add" data-place="${esc(p.id)}" aria-label="Добавить ${esc(p.name)}">${icon('plus',17)}</button></div>`).join(''):'<p class="muted-empty">Все доступные места уже добавлены.</p>'}</div></section></div>
    <div class="planner-right"><section class="panel map-panel"><div class="panel-head"><div><span class="eyebrow">ВИЗУАЛИЗАЦИЯ</span><h3>Карта маршрута</h3></div><span class="map-pill">${icon('map',14)} Схема</span></div><div class="schematic-map"><div class="map-water"></div><div class="map-highway highway-a"></div><div class="map-highway highway-b"></div><div class="map-highway highway-c"></div><div class="map-park park-a"></div><div class="map-park park-b"></div><div class="map-block block-a"></div><div class="map-block block-b"></div><div class="map-block block-c"></div><div class="map-block block-d"></div><svg class="map-route-line" preserveAspectRatio="none" viewBox="0 0 100 100">${mapPath?`<polyline points="${mapPath}" stroke="#db6749" stroke-width="1.45" fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="3 1"/>`:''}</svg>${trip.items.map((item,i)=>{const p=placeById(city,item.placeId);return p?`<span class="map-pin ${item.visited?'done':''}" style="left:${p.x}%;top:${p.y}%" title="${esc(p.name)}">${item.visited?icon('check',13):i+1}</span>`:'';}).join('')}<div class="map-caption">${icon('pin',15)} ${esc(city.name)}</div></div><p class="map-disclaimer">Условная схема порядка остановок, не географическая навигация.</p><a class="map-external" href="https://www.openstreetmap.org/#map=12/${city.lat}/${city.lon}" target="_blank" rel="noopener noreferrer">Открыть карту ${esc(city.name)} ${icon('external',15)}</a></section><section class="panel progress-panel"><div class="panel-head"><div><span class="eyebrow">ДВИГАЙСЯ ВПЕРЁД</span><h3>Прогресс поездки</h3></div><strong class="large-percent">${progress(trip)}%</strong></div><div class="progress-track big"><span style="width:${progress(trip)}%"></span></div><div class="progress-summary"><span>${icon('circleCheck',17)} ${complete} посещено</span><span>${trip.items.length-complete} осталось</span></div>${progress(trip)===100&&trip.items.length?'<p class="completion-note">✦ Отлично! Все места из маршрута посещены.</p>':''}<button class="btn btn-outline wide-btn" data-action="change-status">${trip.status==='completed'?'Вернуть в планы':trip.status==='active'?'Завершить поездку':'Начать поездку'} ${icon('arrowRight',16)}</button></section></div></div>`;
    renderShell(content,'Мой маршрут','ПЛАНИРОВАНИЕ ПОЕЗДКИ');
  }
  function renderModal(){
    if(!state.modal) return '';
    const close=`<button type="button" class="icon-button modal-close" data-action="close-modal" aria-label="Закрыть">${icon('close',22)}</button>`;
    const newTripModal=()=>`<div class="modal-head"><div><span class="eyebrow">НОВОЕ ПРИКЛЮЧЕНИЕ</span><h2>${state.modal==='edit-trip'?'Изменить поездку':'Куда отправимся?'}</h2><p>Начните с города и дат — маршрут соберём дальше.</p></div>${close}</div><form id="trip-form" class="form-stack"><label>Название поездки<input name="title" required maxlength="80" placeholder="Например: Три дня в Риме" value="${esc(state.modal==='edit-trip'?selectedTrip()?.title:'')}"></label><label>Город<select name="cityId" required ${state.modal==='edit-trip'?'disabled':''}>${CITIES.map(c=>`<option value="${c.id}" ${c.id===(state.modal==='edit-trip'?selectedTrip()?.cityId:state.draftCity)?'selected':''}>${esc(c.name)}, ${esc(c.country)}</option>`).join('')}</select></label><div class="form-row"><label>Дата начала<input name="startDate" type="date" required value="${esc(state.modal==='edit-trip'?selectedTrip()?.startDate:dateOffset(7))}"></label><label>Дата окончания<input name="endDate" type="date" required value="${esc(state.modal==='edit-trip'?selectedTrip()?.endDate:dateOffset(10))}"></label></div><p class="form-hint">${icon('info',15)} После создания сможете добавить места в маршрут.</p><button class="btn btn-primary form-submit" type="submit">${state.modal==='edit-trip'?'Сохранить изменения':'Создать поездку'} ${icon('arrowRight',18)}</button></form>`;
    const trip=selectedTrip();const city=trip?cityById(trip.cityId):null;
    const available=city?.places.filter(p=>!trip.items.some(i=>i.placeId===p.id))||[];
    const addPlaceModal=()=>`<div class="modal-head"><div><span class="eyebrow">ПОСТРОЕНИЕ МАРШРУТА</span><h2>Добавить место</h2><p>Выберите остановку для путешествия по городу ${esc(city?.name||'')}.</p></div>${close}</div><div class="modal-places">${available.length?available.map(p=>`<button data-action="quick-add" data-place="${esc(p.id)}" class="modal-place"><span class="place-thumb">${icon('pin',18)}</span><span><strong>${esc(p.name)}</strong><small>${esc(p.kind)} · ~${p.duration} мин</small></span>${icon('plus',17)}</button>`).join(''):'<div class="empty-state small">Все места уже добавлены.</div>'}</div>`;
    const item=trip?.items.find(i=>i.id===state.draftNotesFor);const place=placeById(city,item?.placeId);
    const noteModal=()=>`<div class="modal-head"><div><span class="eyebrow">ЛИЧНЫЕ ВПЕЧАТЛЕНИЯ</span><h2>Заметка о месте</h2><p>${esc(place?.name)}</p></div>${close}</div><form id="note-form" class="form-stack"><label>Заметка<textarea name="notes" maxlength="600" rows="5" placeholder="Что вам запомнилось?">${esc(item?.notes||'')}</textarea></label><label>Ваша оценка<select name="rating">${[0,1,2,3,4,5].map(n=>`<option value="${n}" ${Number(item?.rating)===n?'selected':''}>${n===0?'Без оценки':`${'★'.repeat(n)}${'☆'.repeat(5-n)} (${n}/5)`}</option>`).join('')}</select></label><button class="btn btn-primary form-submit" type="submit">Сохранить заметку</button></form>`;
    const deleteModal=()=>`<div class="modal-head"><div><span class="eyebrow">ПОДТВЕРЖДЕНИЕ</span><h2>Удалить поездку?</h2><p>Маршрут «${esc(trip?.title||'')}» и все заметки будут удалены.</p></div>${close}</div><div class="confirm-actions"><button class="btn btn-outline" data-action="close-modal">Отмена</button><button class="btn btn-danger" data-action="delete-trip">Удалить безвозвратно</button></div>`;
    const inner=state.modal==='new-trip'||state.modal==='edit-trip'?newTripModal():state.modal==='add-place'?addPlaceModal():state.modal==='note'?noteModal():state.modal==='delete'?deleteModal():'';
    return `<div class="modal-overlay" data-action="modal-backdrop"><div class="modal-card" role="dialog" aria-modal="true" aria-label="${state.modal==='new-trip'?'Создание поездки':'Редактирование'}">${inner}</div></div>`;
  }
  function render(){
    switch(state.page){case 'dashboard':renderDashboard();break;case 'trips':renderTrips();break;case 'explore':renderExplore();break;case 'city':renderCity();break;case 'planner':renderPlanner();break;case 'routes':renderRoutes();break;case 'notifications':renderNotifications();break;case 'profile':renderProfile();break;default:renderDashboard();}
    const pageTitle = {dashboard:'Обзор',trips:'Мои поездки',explore:'Города',city:cityById(state.selectedCityId)?.name||'Город',planner:'Маршрут',routes:'Маршруты',notifications:'Уведомления',profile:'Профиль'};
    document.title=`${pageTitle[state.page]||'Tripline'} — Tripline`;
  }
  function navigate(page){state.page=page;state.sidebarOpen=false;state.modal=null;window.location.hash=page;window.scrollTo(0,0);render();}
  function editTripCopy(){const t=selectedTrip();return t?JSON.parse(JSON.stringify(t)):null;}
  async function handleAction(action, el){
    try{
      switch(action){
        case 'nav':navigate(el.dataset.page);break;
        case 'toggle-sidebar':state.sidebarOpen=!state.sidebarOpen;render();break;
        case 'close-sidebar':state.sidebarOpen=false;render();break;
        case 'new-trip':state.draftCity=el.dataset.city||'istanbul';state.modal='new-trip';render();break;
        case 'edit-trip':state.modal='edit-trip';render();break;
        case 'close-modal':state.modal=null;render();break;
        case 'modal-backdrop':state.modal=null;render();break;
        case 'open-trip':state.selectedTripId=el.dataset.id;navigate('planner');break;
        case 'view-city':state.selectedCityId=el.dataset.id;navigate('city');break;
        case 'filter':state.filter=el.dataset.filter;render();break;
        case 'add-place':state.modal='add-place';render();break;
        case 'quick-add':{const t=editTripCopy();if(!t)return;t.items.push({id:uid(),placeId:el.dataset.place,visited:false,notes:'',rating:0});await updateLocal(t);state.modal=null;notify('Место добавлено в маршрут');break;}
        case 'remove-place':{const t=editTripCopy();if(!t)return;t.items=t.items.filter(i=>i.id!==el.dataset.id);await updateLocal(t);notify('Место удалено из маршрута');break;}
        case 'toggle-visit':{const t=editTripCopy();if(!t)return;const item=t.items.find(i=>i.id===el.dataset.id);if(item){item.visited=!item.visited;item.visitDate=item.visited?new Date().toISOString():null;}await updateLocal(t);notify(item?.visited?'Место отмечено как посещённое':'Отметка снята');break;}
        case 'move':{const t=editTripCopy();if(!t)return;const idx=t.items.findIndex(i=>i.id===el.dataset.id);const to=idx+(el.dataset.dir==='up'?-1:1);if(idx>=0&&to>=0&&to<t.items.length)[t.items[idx],t.items[to]]=[t.items[to],t.items[idx]];await updateLocal(t);render();break;}
        case 'note':state.draftNotesFor=el.dataset.id;state.modal='note';render();break;
        case 'change-status':{const t=editTripCopy();if(!t)return;t.status=t.status==='planned'?'active':t.status==='active'?'completed':'planned';await updateLocal(t);notify('Статус поездки обновлён');break;}
        case 'confirm-delete':state.modal='delete';render();break;
        case 'delete-trip':{const id=state.selectedTripId;await api.deleteTrip(id);state.trips=await api.getTrips();state.modal=null;navigate('trips');notify('Поездка удалена');break;}
        case 'export':{const data=JSON.stringify({exportedAt:new Date().toISOString(),trips:state.trips},null,2);const url=URL.createObjectURL(new Blob([data],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download='tripline-trips.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);notify('Файл с поездками подготовлен');break;}
      }
    }catch(e){console.error(e);notify(e.message||'Не удалось выполнить действие','error');}
  }
  document.addEventListener('click', e => {const el=e.target.closest('[data-action]');if(!el)return;if(el.dataset.action==='modal-backdrop'&&e.target!==el)return;e.preventDefault();handleAction(el.dataset.action,el);});
  document.addEventListener('submit', async e => {
    const form=e.target;if(!['trip-form','note-form','profile-form'].includes(form.id))return;e.preventDefault();
    const d=new FormData(form);
    try{
      if(form.id==='trip-form'){
        const startDate=String(d.get('startDate')||''),endDate=String(d.get('endDate')||'');if(endDate<startDate){notify('Дата окончания не может быть раньше начала','error');return;}
        const isEdit=state.modal==='edit-trip';const trip=isEdit?editTripCopy():{id:uid(),status:'planned',createdAt:Date.now(),items:[],cityId:d.get('cityId')};
        trip.title=String(d.get('title')||'').trim();trip.startDate=startDate;trip.endDate=endDate;
        if(!trip.title||!trip.cityId)return;
        if(isEdit)await api.updateTrip(trip);else await api.createTrip(trip);
        state.trips=await api.getTrips();state.selectedTripId=trip.id;state.modal=null;navigate('planner');notify(isEdit?'Поездка обновлена':'Поездка создана. Добавьте места!');
      }else if(form.id==='note-form'){
        const t=editTripCopy();const item=t?.items.find(i=>i.id===state.draftNotesFor);if(!item)return;
        item.notes=String(d.get('notes')||'').trim();item.rating=Number(d.get('rating')||0);await updateLocal(t);state.modal=null;notify('Заметка сохранена');
      }else if(form.id==='profile-form'){
        store.profile={name:String(d.get('name')||'').trim(),email:String(d.get('email')||'').trim()};persist();notify('Профиль сохранён');
      }
    }catch(err){console.error(err);notify(err.message||'Ошибка сохранения','error');}
  });
  document.addEventListener('input', e=>{if(e.target.id==='city-search'){const input=e.target;const val=input.value;const pos=input.selectionStart;state.search=val;render();const next=document.querySelector('#city-search');if(next){next.focus();next.setSelectionRange(pos,pos);}}});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&state.modal){state.modal=null;render();}});
  const direct=window.location.hash.replace('#','');if(navItems.some(n=>n[0]===direct)||direct==='profile')state.page=direct;
  if(mode==='api'){
    Promise.all([api.getCities(),api.getTrips()]).then(([cities,trips])=>{state.cities=cities;state.trips=trips;render();}).catch(e=>{console.error('API недоступен',e);render();notify('Не удалось загрузить данные API. Проверьте сервер.','error');});
  } else {persist();render();}
})();
