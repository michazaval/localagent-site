/* LocalAgent website v1.1: accessible decorative effects and wayfinding, no network or persistence. */
(() => {
  const root = document.documentElement;
  const frame = document.querySelector('#fieldFrame');
  const insight = document.querySelector('#signalInsight');
  const motionToggle = document.querySelector('#motionToggle');
  const motionLabel = document.querySelector('#motionLabel');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const descriptions = {
    en: {
      idle: 'IDLE / Ready for an instruction. Visual simulation.',
      think: 'THINK / Local reasoning preview. No model is running.',
      listen: 'LISTEN / Voice input preview. Microphone is off.',
      act: 'ACT / Permission-based action preview. Nothing is executed.'
    },
    ru: {
      idle: 'ПОКОЙ / Ожидает команду. Только визуальная симуляция.',
      think: 'ДУМАЕТ / Пример локального анализа. Модель не запущена.',
      listen: 'СЛУШАЕТ / Пример голоса. Микрофон выключен.',
      act: 'ДЕЙСТВУЕТ / Пример действий. Ничего не выполняется.'
    }
  };
  function paintInsight() {
    if (!insight || !frame) return;
    const language = root.lang === 'ru' ? 'ru' : 'en';
    insight.textContent = descriptions[language][frame.dataset.state] || descriptions[language].idle;
  }
  paintInsight();
  if (frame) new MutationObserver(paintInsight).observe(frame, { attributes: true, attributeFilter: ['data-state'] });
  new MutationObserver(paintInsight).observe(root, { attributes: true, attributeFilter: ['lang'] });

  let manuallyPaused = false;
  function updateMotion() {
    const unavailable = reduced.matches;
    const paused = manuallyPaused || unavailable;
    root.classList.toggle('motion-paused', paused);
    if (motionToggle && motionLabel) {
      motionToggle.disabled = unavailable;
      motionToggle.setAttribute('aria-pressed', String(paused));
      const ru = root.lang === 'ru';
      motionToggle.setAttribute('aria-label', unavailable ? (ru ? 'Системный режим без анимации' : 'System reduced motion enabled') : paused ? (ru ? 'Включить анимацию' : 'Resume decorative animation') : (ru ? 'Остановить анимацию' : 'Pause decorative animation'));

      motionLabel.textContent = unavailable ? (ru ? 'БЕЗ FX' : 'REDUCED') : paused ? (ru ? 'ВКЛ. FX' : 'PLAY FX') : (ru ? 'ПАУЗА FX' : 'PAUSE FX');
      motionToggle.setAttribute('aria-label', motionLabel.textContent + ': ' + motionToggle.getAttribute('aria-label'));
      motionToggle.title = motionToggle.getAttribute('aria-label');
      motionToggle.querySelector('.motion-icon').textContent = paused ? '▶' : 'Ⅱ';
    }
    document.dispatchEvent(new Event('localagent:motion-change'));
  }
  motionToggle?.addEventListener('click', () => { manuallyPaused = !manuallyPaused; updateMotion(); });
  reduced.addEventListener('change', updateMotion);
  new MutationObserver(updateMotion).observe(root, { attributes: true, attributeFilter: ['lang'] });
  updateMotion();

  const navLinks = [...document.querySelectorAll('.nav a[href^="#"]')];
  const sections = navLinks.map(link => ({ link, section: document.querySelector(link.getAttribute('href')) })).filter(item => item.section);
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      const visible = entries.filter(x => x.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!visible) return;
      for (const { link, section } of sections) {
        if (section === visible.target) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      }
    }, { rootMargin: '-18% 0px -57% 0px', threshold: 0 });
    sections.forEach(({ section }) => observer.observe(section));
  }
})();
