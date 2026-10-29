/* LocalAgent official site concept. No external APIs, cookies or cloud-model calls. */
const translations = {
  en: {
    navApproach: 'THE IDEA', navDemo: 'EXPERIENCE', navRoadmap: 'ROADMAP', navRelease: 'RELEASE', navExplore: 'EXPLORE',
    heroEyebrow: 'INDEPENDENT WINDOWS AI · IN DEVELOPMENT', heroLine1: 'YOUR', heroLine2: 'SPACE.', heroLine3: 'YOUR AI',
    heroDesc: "We're building a Windows assistant that can think, remember and act on your machine — with local models at its core.",
    heroRuler: 'Local intelligence. Human control.', heroExplore: 'Explore the concept', heroIdea: 'The idea behind it',
    heroFootnote: 'NOT A CLOUD CHATBOT. NOT A WEB APP.', controlsCaption: 'TRY A STATE',
    stateIdle: 'IDLE', stateThink: 'THINK', stateListen: 'LISTEN', stateAct: 'ACT',
    heroVizNote: 'AN INTERACTIVE VISUAL CONCEPT — NOT A LIVE AGENT SESSION.',
    manifestoSide: 'BUILT DIFFERENT BY DESIGN', manifestoLine1: 'AI SHOULD FEEL', manifestoLine2: 'CLOSER.', manifestoLine3: 'NOT', manifestoLine4: 'MORE DISTANT.',
    manifestoKicker: 'A MORE PERSONAL RELATIONSHIP WITH COMPUTING.',
    manifestoText: "Most assistants live somewhere else. LocalAgent is being designed around the computer in front of you: local inference, useful context, and permission-based actions. It's an ambition we're building toward, not a claim that every feature is available today.",
    capabilitiesSide: 'AN ASSISTANT, NOT JUST A CHAT WINDOW',
    capabilitiesTitle: 'MORE THAN<br>ANSWERS<span class="period-dark">.</span>',
    capabilitiesIntro: 'Four connected ideas are shaping the product. Each module moves through development and independent acceptance before it can be called ready.',
    cap1Title: 'LOCAL REASONING', cap1Text: 'Run language models on supported Windows hardware instead of relying on a cloud model for core responses.',
    cap2Title: 'MEMORY WITH CONTROL', cap2Text: 'Useful context and task history, with clear controls for what gets stored and what can be removed.',
    cap3Title: 'ACTIONS THAT MATTER', cap3Text: 'Browser workflows, reusable skills and Windows actions — with permissions, stop controls and verifiable results.',
    cap4Title: 'A NATURAL INTERFACE', cap4Text: 'A native desktop experience with voice as an optional layer, not a requirement for getting things done.',
    statusDevelopment: 'IN DEVELOPMENT', statusIntegration: 'INTEGRATION WORK', statusPlanned: 'PLANNED / TESTING',
    experienceSide: 'INTERACTION CONCEPT / CLICK TO EXPLORE',
    experienceTitle: 'WHAT IF<br>YOUR PC<br><em>COULD HELP?</em>',
    experienceDesc: 'Choose a scenario. See how an assistant might break an instruction into steps. This is an illustrative prototype, not a connected LocalAgent runtime.',
    demoBrowse: 'EXPLORE A WEB PAGE', demoMemory: 'RECALL CONTEXT', demoWindows: 'DESKTOP WORKFLOW',
    demoBadge: 'SIMULATION', demoChannel: 'CONCEPT PREVIEW', demoRequestLabel: 'EXAMPLE REQUEST', demoPlanLabel: 'POSSIBLE TASK FLOW',
    demoNotice: 'ILLUSTRATION ONLY. NO REAL TASK IS EXECUTED.', demoFooterLeft: 'DESIGNED FOR PERMISSION-BASED ACTIONS',
    archSide: 'LOCAL BY DESIGN', archTitle: 'THE CENTER<br>IS <em>YOU.</em>',
    archText: 'The goal is simple: keep core intelligence and remembered context on your machine. Online access can still be used when you ask the assistant to work with the web.',
    archDisclaimer: 'Architecture illustration; component availability depends on development, hardware and user permissions.',
    archCore: 'USER CONTROL LAYER', archNode1: 'LOCAL MODEL', archNode2: 'MEMORY', archNode3: 'TOOLS', archCaveat: 'for core inference as designed',
    roadmapSide: 'BUILDING TOWARDS A REAL RELEASE', roadmapTitle: 'WORK IN<br>PROGRESS<span class="period-dark">.</span>',
    roadmapIntro: 'A public-facing overview, not a live sync of private engineering work. No release date is promised until the Windows build passes acceptance.',
    roadmap1: 'FOUNDATION', roadmap1Desc: 'Architecture, local model runtime and the desktop shell.',
    roadmap2: 'USEFUL WINDOWS MVP', roadmap2Desc: 'Repeatable startup, one end-to-end scenario, safe cancel and clear errors.',
    roadmap3: 'DEEPER CAPABILITIES', roadmap3Desc: 'Memory, skills, voice and Windows automation as their acceptance gates pass.',
    roadmap4: 'LOCALAGENT 1.0', roadmap4Desc: 'Verified release candidate, real-device testing and owner approval.',
    roadmapStatus1: 'DEVELOPING', roadmapStatus2: 'VALIDATION', roadmapStatus3: 'IN DEVELOPMENT', roadmapStatus4: 'NOT RELEASED',
    roadmapFootnote: 'The roadmap is intentionally conservative: planned features are not advertised as shipping features.',
    availEyebrow: 'STATUS / STILL BUILDING',
    availTitle: 'NOT READY<br>TO DOWNLOAD<span>.</span><br><em>WORTH BUILDING.</em>',
    availDesc: "LocalAgent 1.0 isn't published yet. The official Windows download will appear here only after a tested release is approved.",
    availStamp: 'RELEASE<br>PENDING ↗', footerTag: 'LOCAL INTELLIGENCE. HUMAN DECISIONS.', footerBack: 'BACK TO TOP',
    footerIndependent: 'INDEPENDENT PROJECT · WINDOWS · IN DEVELOPMENT'
  },
  ru: {
    navApproach: 'ИДЕЯ', navDemo: 'ДЕМОНСТРАЦИЯ', navRoadmap: 'ДОРОЖНАЯ КАРТА', navRelease: 'РЕЛИЗ', navExplore: 'СМОТРЕТЬ',
    heroEyebrow: 'НЕЗАВИСИМЫЙ ИИ ДЛЯ WINDOWS · В РАЗРАБОТКЕ', heroLine1: 'ТВОЁ', heroLine2: 'МЕСТО.', heroLine3: 'ТВОЙ ИИ',
    heroDesc: 'Мы создаём Windows-ассистента, который сможет думать, помнить и действовать на твоём компьютере. В основе — локальные модели.',
    heroRuler: 'Локальный интеллект. Твой контроль.', heroExplore: 'Посмотреть концепцию', heroIdea: 'Идея проекта',
    heroFootnote: 'НЕ ОБЛАЧНЫЙ ЧАТБОТ. НЕ ВЕБ-ПРИЛОЖЕНИЕ.', controlsCaption: 'ВЫБЕРИ РЕЖИМ',
    stateIdle: 'ПОКОЙ', stateThink: 'ДУМАЕТ', stateListen: 'СЛУШАЕТ', stateAct: 'ДЕЙСТВУЕТ',
    heroVizNote: 'ИНТЕРАКТИВНАЯ КОНЦЕПЦИЯ — НЕ НАСТОЯЩИЙ СЕАНС С АГЕНТОМ.',
    manifestoSide: 'ПРОЕКТИРУЕМ ПО-ДРУГОМУ', manifestoLine1: 'ИИ ДОЛЖЕН БЫТЬ', manifestoLine2: 'БЛИЖЕ.', manifestoLine3: 'НЕ', manifestoLine4: 'ДАЛЬШЕ ОТ НАС.',
    manifestoKicker: 'НОВЫЙ СПОСОБ РАБОТЫ С КОМПЬЮТЕРОМ.',
    manifestoText: 'Большинство ассистентов существуют где-то далеко. LocalAgent создаётся вокруг твоего компьютера: локальные ответы, полезный контекст и действия только с разрешения. Это наше направление разработки, а не заявление о готовности всех функций.',
    capabilitiesSide: 'БОЛЬШЕ, ЧЕМ ОКНО ЧАТА',
    capabilitiesTitle: 'БОЛЬШЕ<br>ОТВЕТОВ<span class="period-dark">.</span>',
    capabilitiesIntro: 'Четыре идеи лежат в основе продукта. Каждый модуль проходит разработку и независимую проверку перед тем, как мы назовём его готовым.',
    cap1Title: 'ЛОКАЛЬНЫЙ ИИ', cap1Text: 'Запуск языковых моделей на совместимом компьютере Windows без обязательной облачной модели для основных ответов.',
    cap2Title: 'ПАМЯТЬ ПОД КОНТРОЛЕМ', cap2Text: 'Контекст, история задач и понятное управление сохранёнными данными, включая их удаление.',
    cap3Title: 'ПОЛЕЗНЫЕ ДЕЙСТВИЯ', cap3Text: 'Браузерные задачи, навыки и работа с Windows — с разрешениями, отменой и проверяемыми результатами.',
    cap4Title: 'ЕСТЕСТВЕННЫЙ ИНТЕРФЕЙС', cap4Text: 'Обычное Windows-приложение с возможностью голосового взаимодействия, а не обязательным голосовым управлением.',
    statusDevelopment: 'В РАЗРАБОТКЕ', statusIntegration: 'ИНТЕГРАЦИЯ', statusPlanned: 'ПЛАН / ТЕСТЫ',
    experienceSide: 'КОНЦЕПЦИЯ ИНТЕРФЕЙСА / НАЖМИ',
    experienceTitle: 'А ЕСЛИ<br>КОМПЬЮТЕР<br><em>ПОМОЖЕТ?</em>',
    experienceDesc: 'Выбери сценарий и посмотри, как ассистент мог бы разбить задачу на шаги. Это макет взаимодействия, не подключённый к настоящему LocalAgent.',
    demoBrowse: 'ИССЛЕДОВАТЬ СТРАНИЦУ', demoMemory: 'ВСПОМНИТЬ КОНТЕКСТ', demoWindows: 'ЗАДАЧА В WINDOWS',
    demoBadge: 'СИМУЛЯЦИЯ', demoChannel: 'ПРИМЕР ИНТЕРФЕЙСА', demoRequestLabel: 'ПРИМЕР ЗАПРОСА', demoPlanLabel: 'ВОЗМОЖНЫЕ ШАГИ',
    demoNotice: 'ТОЛЬКО ПРИМЕР. РЕАЛЬНАЯ ЗАДАЧА НЕ ВЫПОЛНЯЕТСЯ.', demoFooterLeft: 'ДЕЙСТВИЯ ТОЛЬКО С РАЗРЕШЕНИЯ',
    archSide: 'ЛОКАЛЬНОСТЬ — ПРИНЦИП', archTitle: 'В ЦЕНТРЕ<br><em>ТЫ.</em>',
    archText: 'Наша цель — сохранять основные вычисления и память на твоём устройстве. Доступ в интернет возможен для задач с сайтами, которые ты сам запросишь.',
    archDisclaimer: 'Схема концептуальная; доступность модулей зависит от стадии разработки, компьютера и разрешений пользователя.',
    archCore: 'КОНТРОЛЬ ПОЛЬЗОВАТЕЛЯ', archNode1: 'ЛОКАЛЬНАЯ МОДЕЛЬ', archNode2: 'ПАМЯТЬ', archNode3: 'ИНСТРУМЕНТЫ', archCaveat: 'для основных ответов по проекту',
    roadmapSide: 'ИДЁМ К НАСТОЯЩЕМУ РЕЛИЗУ', roadmapTitle: 'РАБОТА<br>ИДЁТ<span class="period-dark">.</span>',
    roadmapIntro: 'Это публичный обзор, а не автоматическая выгрузка приватных инженерных задач. Дату релиза объявим после приёмки Windows-сборки.',
    roadmap1: 'ОСНОВА', roadmap1Desc: 'Архитектура, локальные модели и оболочка приложения.',
    roadmap2: 'РАБОЧИЙ MVP WINDOWS', roadmap2Desc: 'Повторяемый запуск, сквозной сценарий, остановка и понятные ошибки.',
    roadmap3: 'НОВЫЕ ВОЗМОЖНОСТИ', roadmap3Desc: 'Память, навыки, голос и управление Windows по мере прохождения проверки.',
    roadmap4: 'LOCALAGENT 1.0', roadmap4Desc: 'Проверенная сборка, реальные тесты на устройстве и одобрение владельца.',
    roadmapStatus1: 'РАЗРАБОТКА', roadmapStatus2: 'ПРОВЕРКА', roadmapStatus3: 'В РАЗРАБОТКЕ', roadmapStatus4: 'НЕ ВЫПУЩЕН',
    roadmapFootnote: 'Планы — не обещание готовой функциональности. Мы показываем статус осторожно.',
    availEyebrow: 'СТАТУС / РАЗРАБОТКА ПРОДОЛЖАЕТСЯ',
    availTitle: 'СКАЧИВАТЬ<br>ЕЩЁ РАНО<span>.</span><br><em>СОЗДАВАТЬ — НЕТ.</em>',
    availDesc: 'LocalAgent 1.0 пока не опубликован. Официальная Windows-версия появится здесь после тестирования и одобрения релиза.',
    availStamp: 'РЕЛИЗ<br>ПОЗЖЕ ↗', footerTag: 'ЛОКАЛЬНЫЙ ИИ. РЕШЕНИЯ — ЗА ЧЕЛОВЕКОМ.', footerBack: 'НАВЕРХ',
    footerIndependent: 'НЕЗАВИСИМЫЙ ПРОЕКТ · WINDOWS · В РАЗРАБОТКЕ'
  }
};

const scenarioData = {
  en: {
    browse: { prompt: 'Find the most useful information on this page and give me a summary.', steps: ['Check the page and identify relevant content', 'Extract key facts while respecting access limits', 'Return a clear summary with source context'] },
    memory: { prompt: 'Remember how I prefer to organize my projects.', steps: ['Ask what information may be saved', 'Store approved preferences locally', 'Use the preference on a future relevant task'] },
    windows: { prompt: 'Help me organize the files in my workspace.', steps: ['Inspect the selected workspace with permission', 'Propose a safe, reversible plan', 'Execute approved changes and report results'] }
  },
  ru: {
    browse: { prompt: 'Найди самое полезное на этой странице и кратко объясни.', steps: ['Изучить страницу и найти полезную информацию', 'Выделить основные факты с учётом ограничений доступа', 'Вернуть краткую сводку с контекстом источника'] },
    memory: { prompt: 'Запомни, как мне удобно организовывать проекты.', steps: ['Спросить, какую информацию можно сохранить', 'Локально записать одобренные предпочтения', 'Учесть их в следующей подходящей задаче'] },
    windows: { prompt: 'Помоги навести порядок в рабочей папке.', steps: ['С разрешения изучить выбранную папку', 'Предложить безопасный обратимый план', 'Выполнить одобренные изменения и отчитаться'] }
  }
};

let language = 'en';
let currentScenario = 'browse';
let currentState = 'idle';
const htmlTranslationKeys = new Set(['capabilitiesTitle', 'experienceTitle', 'archTitle', 'roadmapTitle', 'availTitle', 'availStamp']);

function renderScenario() {
  const { prompt, steps } = scenarioData[language][currentScenario];
  document.querySelector('#demoPrompt').textContent = prompt;
  document.querySelector('#demoStepCount').textContent = `${String(steps.length).padStart(2, '0')} ${language === 'ru' ? 'ШАГА' : 'STEPS'}`;
  const list = document.querySelector('#demoSteps');
  list.replaceChildren(...steps.map((step, index) => {
    const li = document.createElement('li');
    const number = document.createElement('span');
    number.textContent = String(index + 1).padStart(2, '0');
    const body = document.createElement('p');
    body.textContent = step;
    const arrow = document.createElement('span');
    arrow.className = 'step-indicator';
    arrow.setAttribute('aria-hidden', 'true');
    arrow.textContent = '↗';
    li.append(number, body, arrow);
    return li;
  }));
  for (const button of document.querySelectorAll('.scenario-button')) {
    const selected = button.dataset.scenario === currentScenario;
    button.classList.toggle('selected', selected);
    button.setAttribute('aria-pressed', String(selected));
  }
}

function renderState() {
  for (const button of document.querySelectorAll('.state-btn')) {
    const active = button.dataset.state === currentState;
    button.classList.toggle('is-active', active);
    button.setAttribute('aria-pressed', String(active));
  }
  const labels = { en: { idle: 'IDLE', think: 'THINKING', listen: 'LISTENING', act: 'ACTING' }, ru: { idle: 'ПОКОЙ', think: 'ДУМАЕТ', listen: 'СЛУШАЕТ', act: 'ДЕЙСТВУЕТ' } };
  document.querySelector('#stateText').textContent = `SIGNAL: ${labels[language][currentState]}`;
  document.querySelector('#fieldFrame').dataset.state = currentState;
}

function setLanguage(next) {
  if (!Object.hasOwn(translations, next)) return;
  language = next;
  document.documentElement.lang = language;
  for (const el of document.querySelectorAll('[data-i18n]')) {
    const key = el.dataset.i18n;
    const value = translations[language][key];
    if (value === undefined) continue;
    if (htmlTranslationKeys.has(key)) el.innerHTML = value; // Fixed, locally-authored HTML fragments only.
    else el.textContent = value;
  }
  const languageToggle = document.querySelector('#langToggle');
  languageToggle.innerHTML = `${language === 'en' ? 'RU' : 'EN'} <span aria-hidden="true">↗</span>`;
  languageToggle.setAttribute('aria-label', language === 'en' ? 'Switch language to Russian' : 'Переключить язык на английский');
  document.title = language === 'en' ? 'LocalAgent — Intelligence on your terms' : 'LocalAgent — локальный ИИ на твоих условиях';
  renderState();
  renderScenario();
}

document.querySelector('#langToggle').addEventListener('click', () => setLanguage(language === 'en' ? 'ru' : 'en'));
for (const button of document.querySelectorAll('.scenario-button')) {
  button.addEventListener('click', () => { currentScenario = button.dataset.scenario; renderScenario(); });
}
for (const button of document.querySelectorAll('.state-btn')) {
  button.addEventListener('click', () => { currentState = button.dataset.state; renderState(); });
}

const menuToggle = document.querySelector('#menuToggle');
const navigation = document.querySelector('#navigation');
function closeMenu() {
  navigation.classList.remove('is-open');
  document.body.classList.remove('menu-open');
  menuToggle.setAttribute('aria-expanded', 'false');
  menuToggle.setAttribute('aria-label', language === 'en' ? 'Open navigation' : 'Открыть меню');
}
menuToggle.addEventListener('click', () => {
  const open = menuToggle.getAttribute('aria-expanded') !== 'true';
  navigation.classList.toggle('is-open', open);
  document.body.classList.toggle('menu-open', open);
  menuToggle.setAttribute('aria-expanded', String(open));
  menuToggle.setAttribute('aria-label', open ? (language === 'en' ? 'Close navigation' : 'Закрыть меню') : (language === 'en' ? 'Open navigation' : 'Открыть меню'));
});
for (const link of navigation.querySelectorAll('a')) link.addEventListener('click', closeMenu);
document.addEventListener('keydown', event => { if (event.key === 'Escape') closeMenu(); });
window.addEventListener('resize', () => { if (window.innerWidth > 900) closeMenu(); });
document.querySelector('#year').textContent = String(new Date().getFullYear());

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const motionPaused = () => reducedMotion.matches || document.documentElement.classList.contains('motion-paused');
const revealElements = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window && !motionPaused()) {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    for (const entry of entries) if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    }
  }, { rootMargin: '0px 0px -25px 0px', threshold: .08 });
  revealElements.forEach(element => revealObserver.observe(element));
} else revealElements.forEach(element => element.classList.add('is-visible'));
reducedMotion.addEventListener('change', event => {
  if (event.matches) revealElements.forEach(element => element.classList.add('is-visible'));
});

// The Canvas scene lives in atelier.js; interface state/locale remain here.
setLanguage('en');

// Thin scroll indicator makes long-form interaction discoverable without
// hijacking scrolling, animation frameworks or scroll-jacking.
const scrollMeter = document.querySelector('#scrollProgress');
let meterQueued = false;
function paintMeter() {
  meterQueued = false;
  const total = document.documentElement.scrollHeight - window.innerHeight;
  const progress = total > 0 ? Math.max(0, Math.min(1, window.scrollY / total)) : 0;
  scrollMeter.style.transform = `scaleX(${progress})`;
}
window.addEventListener('scroll', () => {
  if (!meterQueued) { meterQueued = true; requestAnimationFrame(paintMeter); }
}, { passive:true });
window.addEventListener('resize', paintMeter, { passive:true });
paintMeter();