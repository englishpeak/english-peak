import { course, levels, accessLabels, availabilityLabels } from './curriculum.js';
import { modulesForLevel, modulePath, resolveCourseRoute, resolveModuleAccess } from './model.js';

const main = document.getElementById('main');

function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function link(text, href, className) {
  const node = element('a', className, text);
  node.href = href;
  return node;
}

function renderModule(module, index) {
  const item = element('li', 'module-row');
  const title = element('span', 'module-title', module.title);
  const number = element('span', 'module-number', String(index + 1).padStart(2, '0'));
  number.setAttribute('aria-hidden', 'true');
  const availability = element('span', 'availability', availabilityLabels[module.status] || 'Unavailable');
  const access = element('span', `access access-${module.access}`, accessLabels[module.access] || 'Restricted');
  const details = element('span', 'module-details');
  details.append(title, access);
  // Unreleased modules are readable list items, never links or clickable cards.
  // Keep their text at full contrast and out of the keyboard tab order.
  if (module.status === 'available') {
    const entry = link('', modulePath(module), 'module-entry');
    entry.append(number, details, availability);
    item.append(entry);
  } else {
    item.setAttribute('aria-disabled', 'true');
    item.append(number, details, availability);
  }
  return item;
}

function levelAvailability(items) {
  const statuses = new Set(items.map(module => module.status));
  if (statuses.size === 1) return availabilityLabels[items[0].status] || 'Unavailable';
  const count = items.filter(module => module.status === 'available').length;
  return count ? `${count} available · ${items.length - count} in development` : 'In development';
}

function renderCatalogue() {
  const intro = element('section', 'course-intro');
  intro.append(element('p', 'eyebrow', 'THE ENGLISH PEAK CURRICULUM'), element('h1', '', course.title), element('p', 'intro-description', course.description));
  const note = element('p', 'release-note', 'In development. Modules will be released gradually.');
  intro.append(note);

  const layout = element('div', 'curriculum-layout');
  const nav = element('nav', 'level-nav');
  nav.setAttribute('aria-label', 'Course levels');
  nav.append(element('p', 'eyebrow', 'YOUR PATH · A1–C1'));
  const navList = element('ol', 'level-links');
  for (const level of levels) {
    const item = element('li');
    const anchor = link('', `#${level.id}`, 'level-link');
    anchor.append(element('span', 'nav-code', level.label), element('span', 'nav-name', level.title));
    item.append(anchor);
    navList.append(item);
  }
  nav.append(navList);
  const sections = element('div', 'level-sections');
  for (const level of levels) {
    const items = modulesForLevel(level.id);
    const section = element('section', 'level-section');
    section.id = level.id;
    section.setAttribute('aria-labelledby', `${level.id}-title`);
    const heading = element('header', 'level-heading');
    const code = element('span', 'level-code', level.label);
    const summary = element('div', 'level-summary');
    const title = element('h2', '', level.title);
    title.id = `${level.id}-title`;
    const description = element('p', 'level-meta', `CEFR ${level.label} · ${items.length} modules`);
    summary.append(title, description);
    heading.append(code, summary, element('span', 'level-status', levelAvailability(items)));
    const list = element('ol', 'module-list');
    items.forEach((module, index) => list.append(renderModule(module, index)));
    section.append(heading, list);
    sections.append(section);
  }
  layout.append(nav, sections);
  main.replaceChildren(intro, layout);
}

async function renderModuleRoute(route) {
  const panel = element('section', 'route-panel');
  panel.append(link('← Course curriculum', `/course#${route.level.id}`, 'back-link'));
  panel.append(element('p', 'eyebrow', `CEFR ${route.level.label} · ${route.level.title}`));
  panel.append(element('h1', '', route.module.title));
  const status = element('p', 'route-status');
  status.setAttribute('role', 'status');
  status.textContent = 'Checking availability…';
  panel.append(status);
  main.replaceChildren(panel);
  document.title = `${route.module.title} | ePeak Course`;
  const access = await resolveModuleAccess(route.module);
  if (access === 'unreleased') {
    status.textContent = availabilityLabels[route.module.status] || 'Unavailable';
    panel.append(element('p', 'route-description', 'This module is in development.'));
    panel.append(element('p', 'access', `Access when released: ${accessLabels[route.module.access] || 'Restricted'}`));
  } else if (access === 'login') {
    status.textContent = 'Account required';
    panel.append(link('Sign in to ePeak', '/?auth=login', 'action-link'));
  } else if (access === 'upgrade') {
    status.textContent = 'ePeak+ required';
    // This is the dashboard's existing entry point to the shared ePeak+ modal.
    panel.append(link('Explore ePeak+', '/?upgrade=word-families', 'action-link'));
  } else if (access === 'error') {
    status.textContent = 'We could not check your access. Please reload to try again.';
  } else {
    // No content renderer is installed in this foundation. A metadata change
    // alone must never open an empty Study/Review/Test experience.
    status.textContent = 'This module is not ready yet.';
  }
}

const route = resolveCourseRoute(window.location.pathname);
if (route.kind === 'catalogue') {
  renderCatalogue();
  // The target may not exist when the browser first processes a direct hash URL.
  document.getElementById(window.location.hash.slice(1))?.scrollIntoView();
} else if (route.kind === 'module') {
  renderModuleRoute(route);
} else {
  document.title = 'Module not found | ePeak Course';
  const panel = element('section', 'route-panel');
  panel.append(element('p', 'eyebrow', 'ENGLISH PEAK COURSE'), element('h1', '', 'Module not found'), element('p', 'route-description', 'This course address does not match a module.'), link('Back to the curriculum', '/course', 'action-link'));
  main.replaceChildren(panel);
}
