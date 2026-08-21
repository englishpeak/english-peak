export const BUSINESS_CASES_THEME_KEY = 'businessCasesTheme';
export const BUSINESS_CASES_THEMES = ['default', 'dark', 'city'];
export const BUSINESS_CASES_BACKGROUND_KEY = 'businessCasesLastBackground';
export const BUSINESS_CASES_BACKGROUNDS = [
  'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=2400&q=85',
  'https://unsplash.com/photos/lFv0V3_2H6s/download?force=true&w=2400',
  'https://unsplash.com/photos/VBLHICVh-lI/download?force=true&w=2400',
  'https://unsplash.com/photos/C2Dyr5FhGPQ/download?force=true&w=2400',
  'https://unsplash.com/photos/XsC0GHXi-8k/download?force=true&w=2400',
];

export function selectBusinessCasesBackground(previousBackground = '', random = Math.random) {
  const choices = BUSINESS_CASES_BACKGROUNDS.filter(background => background !== previousBackground);
  return choices[Math.floor(random() * choices.length)] || BUSINESS_CASES_BACKGROUNDS[0] || '';
}

export function initialiseBusinessCasesTheme({ buttonSelector = '.theme-button', cssImageVariable = '--bc-background-image' } = {}) {
  const buttons = document.querySelectorAll(buttonSelector);
  let currentBackground = '';
  const apply = requested => {
    const theme = BUSINESS_CASES_THEMES.includes(requested) ? requested : 'default';
    document.body.classList.remove('theme-default', 'theme-dark', 'theme-city');
    document.body.classList.add(`theme-${theme}`);
    if (theme === 'city') {
      if (!currentBackground) {
        currentBackground = selectBusinessCasesBackground(sessionStorage.getItem(BUSINESS_CASES_BACKGROUND_KEY) || '');
        sessionStorage.setItem(BUSINESS_CASES_BACKGROUND_KEY, currentBackground);
      }
      document.body.style.setProperty(cssImageVariable, `url("${currentBackground}")`);
    }
    else document.body.style.removeProperty(cssImageVariable);
    buttons.forEach(button => { const active = button.dataset.theme === theme; button.classList.toggle('active', active); button.setAttribute('aria-pressed', String(active)); });
  };
  const set = theme => { localStorage.setItem(BUSINESS_CASES_THEME_KEY, theme); apply(theme); };
  apply(localStorage.getItem(BUSINESS_CASES_THEME_KEY) || 'default');
  buttons.forEach(button => button.addEventListener('click', () => set(button.dataset.theme)));
  return { apply, set };
}
