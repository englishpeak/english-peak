# English Peak — AI HTML Styling Brief

Adjunta este archivo cuando le pidas a Codex, ChatGPT u otra IA que cree una nueva sección, bloque visual o archivo HTML para English Peak. Es una guía corta y obligatoria de styling; para contexto completo usa `docs/BRANDING_AND_DESIGN.md`.

## 1. Objetivo visual

English Peak debe verse como una plataforma educativa **premium, clara, académica, moderna y confiable**.

Evita:
- Paletas nuevas no autorizadas.
- Colores neón o saturados sin función.
- Tipografías infantiles, decorativas o distintas a las oficiales.
- Sombras negras agresivas.
- Bordes negros puros.
- Interfaces recargadas o genéricas.

## 2. Archivos de referencia

- Si trabajas dentro del repo, revisa `docs/BRANDING_AND_DESIGN.md` para contexto completo.
- Si el HTML puede importar CSS externo, usa `styles/brand-tokens.css`.
- Si el HTML debe ser autónomo/standalone, copia dentro del `<style>` solo los tokens necesarios de esta guía.

## 3. Fuentes oficiales

Incluye Google Fonts cuando el archivo HTML sea nuevo o standalone:

```html
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600;700&family=Outfit:wght@300;400;500;600;700&display=swap" rel="stylesheet">
```

Uso obligatorio:
- **Outfit:** texto general, navegación, botones, formularios, cards, preguntas, respuestas y badges.
- **Cormorant Garamond:** títulos principales, headers de sección, logo textual, números destacados y momentos de marca.

CSS base:

```css
body {
  font-family: 'Outfit', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

h1, h2, .brand-heading {
  font-family: 'Cormorant Garamond', Georgia, serif;
}
```

## 4. Paleta obligatoria

Usa estos valores como base. No inventes una paleta nueva.

```css
:root {
  --ep-navy: #0D3B6F;
  --ep-purple: #470074;
  --ep-ink: #1A1A2E;
  --ep-sky: #4A90D9;
  --ep-bg: #F7F8FC;
  --ep-surface: #FFFFFF;
  --ep-card-soft: #F4F6FB;
  --ep-border: rgba(13,59,111,0.12);
  --ep-success: #1A7A4A;
  --ep-error: #C62828;
  --ep-danger: #DC2626;
  --ep-gold: #C9A84C;
  --ep-muted: #666666;
  --ep-muted-light: #999999;

  --ep-font-sans: 'Outfit', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  --ep-font-serif: 'Cormorant Garamond', Georgia, serif;

  --ep-gradient-brand: linear-gradient(135deg, var(--ep-navy), var(--ep-purple));
  --ep-gradient-data: linear-gradient(180deg, var(--ep-sky), var(--ep-navy));
  --ep-gradient-soft: linear-gradient(135deg, #f5f7fa, #e8edf3);
  --ep-shadow-card: 0 12px 36px rgba(13,59,111,0.10);
  --ep-shadow-modal: 0 24px 80px rgba(13,59,111,0.20);
}
```

Uso recomendado:
- `--ep-navy`: títulos, sidebar, acciones secundarias, bordes activos.
- `--ep-purple`: acento premium, gradientes y estados destacados.
- `--ep-ink`: texto principal.
- `--ep-bg`: fondo general.
- `--ep-surface`: cards, modales y contenedores.
- `--ep-border`: bordes sutiles.
- `--ep-success` / `--ep-error`: feedback correcto/incorrecto.
- `--ep-gold`: premium, logros o elementos de membresía.

## 5. Link CSS para HTML conectado al sitio

Si el nuevo HTML no necesita ser standalone, usa:

```html
<link rel="stylesheet" href="/styles/brand-tokens.css">
```

Colócalo después del link de Google Fonts y antes de estilos específicos de la página.

## 6. Layout base

```css
* {
  box-sizing: border-box;
}

html, body {
  margin: 0;
  min-height: 100%;
  background: var(--ep-bg);
  color: var(--ep-ink);
  font-family: var(--ep-font-sans);
}

.page-shell {
  max-width: 1120px;
  margin: 0 auto;
  padding: 32px 20px;
}
```

Reglas:
- Fondo general claro: `--ep-bg`.
- Cards y contenedores principales: `--ep-surface`.
- Espaciado preferido: `8px`, `12px`, `16px`, `20px`, `24px`, `28px`, `32px`, `40px`.
- Radios preferidos: `8px`, `10px`, `12px`, `18px`, `24px`.
- Evita layouts apretados; la interfaz debe sentirse respirable.

## 7. Componentes base

### Card

```css
.ep-card {
  background: var(--ep-surface);
  border: 1.5px solid var(--ep-border);
  border-radius: 18px;
  padding: 22px;
}

.ep-card:hover {
  box-shadow: var(--ep-shadow-card);
}
```

### Botón primario

```css
.ep-btn-primary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: var(--ep-gradient-brand);
  color: #fff;
  border: 0;
  border-radius: 10px;
  padding: 11px 18px;
  font-family: var(--ep-font-sans);
  font-size: 0.88rem;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 3px 12px rgba(13,59,111,0.20);
}
```

### Botón secundario

```css
.ep-btn-secondary {
  background: var(--ep-surface);
  color: var(--ep-navy);
  border: 1.5px solid var(--ep-border);
  border-radius: 10px;
  padding: 10px 16px;
  font-family: var(--ep-font-sans);
  font-weight: 600;
  cursor: pointer;
}
```

### Badge

```css
.ep-badge {
  display: inline-flex;
  align-items: center;
  border-radius: 999px;
  padding: 4px 10px;
  background: rgba(13,59,111,0.08);
  color: var(--ep-navy);
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}
```

### Feedback

```css
.feedback-success {
  background: rgba(26,122,74,0.10);
  color: var(--ep-success);
  border-left: 5px solid var(--ep-success);
}

.feedback-error {
  background: rgba(198,40,40,0.10);
  color: var(--ep-error);
  border-left: 5px solid var(--ep-error);
}
```

## 8. Jerarquía tipográfica

- `h1`: `2rem–2.8rem`, Cormorant Garamond, `700`, color `--ep-navy`.
- `h2`: `1.4rem–1.8rem`, Cormorant Garamond, `700`, color `--ep-navy`.
- Título de card: `1rem–1.1rem`, Outfit, `600`, color `--ep-navy`.
- Texto normal: `0.88rem–1rem`, Outfit, `400–500`, color `--ep-ink`.
- Metadata/badges: `0.7rem–0.8rem`, Outfit, `600`, color muted o navy.
- Botones: `0.82rem–0.95rem`, Outfit, `600`.

## 9. Accesibilidad

- Usa `--ep-ink` para texto principal sobre fondos claros.
- Usa texto blanco sobre `--ep-gradient-brand`.
- No uses morado sobre navy ni colores de bajo contraste.
- Combina color + texto/ícono para feedback; no dependas solo del color.
- Estados disabled: baja opacidad, pero conserva legibilidad.
- Mantén botones y controles con áreas cómodas de click/tap.

## 10. Prompt corto para pegar al pedir un HTML nuevo

> Crea este HTML siguiendo el branding de English Peak. Usa esta guía como referencia obligatoria. Mantén Outfit para UI/cuerpo y Cormorant Garamond para títulos. Usa navy `#0D3B6F`, purple `#470074`, ink `#1A1A2E`, bg `#F7F8FC`, surface `#FFFFFF`, border `rgba(13,59,111,0.12)`, success `#1A7A4A`, error `#C62828` y gold `#C9A84C`. Usa cards blancas, bordes sutiles, radios de 12–24px, sombras suaves y botones con gradiente navy→purple. Si el HTML puede importar CSS externo, usa `/styles/brand-tokens.css`; si debe ser standalone, copia los tokens mínimos dentro del `<style>`. No introduzcas nuevas fuentes, paletas o estilos visuales sin autorización.
