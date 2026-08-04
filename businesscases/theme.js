export const BUSINESS_CASES_THEME_KEY = 'businessCasesTheme';
export const BUSINESS_CASES_THEMES = ['default', 'dark', 'city'];

export function initialiseBusinessCasesTheme({ buttonSelector = '.theme-button', cssImageVariable = '--bc-background-image' } = {}) {
  const backgrounds = ['https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=2400&q=85'];
  const buttons = document.querySelectorAll(buttonSelector);
  const apply = requested => {
    const theme = BUSINESS_CASES_THEMES.includes(requested) ? requested : 'default';
    document.body.classList.remove('theme-default', 'theme-dark', 'theme-city');
    document.body.classList.add(`theme-${theme}`);
    if (theme === 'city') document.body.style.setProperty(cssImageVariable, `url("${backgrounds[0]}")`);
    else document.body.style.removeProperty(cssImageVariable);
    buttons.forEach(button => { const active = button.dataset.theme === theme; button.classList.toggle('active', active); button.setAttribute('aria-pressed', String(active)); });
  };
  const set = theme => { localStorage.setItem(BUSINESS_CASES_THEME_KEY, theme); apply(theme); };
  apply(localStorage.getItem(BUSINESS_CASES_THEME_KEY) || 'default');
  buttons.forEach(button => button.addEventListener('click', () => set(button.dataset.theme)));
  return { apply, set };
}
