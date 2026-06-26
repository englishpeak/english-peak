# English Peak — Manual de branding y diseño para IA

Este documento es la referencia oficial para mantener consistencia visual cuando una IA o una persona cree nuevas pantallas, ejercicios, componentes o materiales para English Peak.

## 1. Esencia de marca

**English Peak** debe sentirse como una plataforma educativa premium: clara, confiable, académica y moderna.

- **Personalidad:** profesional, calmada, elegante, motivadora.
- **Promesa visual:** aprendizaje estructurado con una estética limpia y de alto valor.
- **Evitar:** colores neón, interfaces recargadas, tipografías infantiles, sombras agresivas o estilos genéricos sin jerarquía.

## 2. Diagnóstico del código actual

El código existente usa principalmente una identidad basada en azul marino, morado profundo, fondos claros y títulos serif. Los patrones más consistentes aparecen en el dashboard principal y ejercicios integrados:

- `index.html` define la paleta central con `--navy`, `--purple`, `--ink`, `--sky`, `--bg`, `--border`, `--green` y `--gold`.
- `index.html`, `unscramble.html` e `itp-mc/index.html` cargan **Cormorant Garamond** para títulos y **Outfit** para UI/cuerpo.
- Varias páginas antiguas (`ibt/index.html`, `general/index.html`, `emoji/index.html`, `conversations/index.html`) usan fuentes del sistema y valores de color duplicados. Al crear o retocar esas páginas, migra gradualmente a los tokens de este manual.

## 3. Tipografías

### Fuente principal de UI y texto

Usar **Outfit**.

```html
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600;700&family=Outfit:wght@300;400;500;600;700&display=swap" rel="stylesheet">
```

```css
font-family: 'Outfit', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
```

**Uso:** navegación, botones, etiquetas, cards, preguntas, formularios, descripciones y texto general.

### Fuente de títulos / marca

Usar **Cormorant Garamond**.

```css
font-family: 'Cormorant Garamond', Georgia, serif;
```

**Uso:** logo textual, títulos principales, headers de sección, números destacados y titulares editoriales.

### Escala recomendada

| Uso | Tamaño | Peso | Fuente |
| --- | ---: | ---: | --- |
| Hero / título principal | 2rem–2.8rem | 700 | Cormorant Garamond |
| Título de sección | 1.4rem–1.8rem | 700 | Cormorant Garamond |
| Título de card | 1rem–1.1rem | 600 | Outfit |
| Cuerpo | 0.88rem–1rem | 400–500 | Outfit |
| Metadatos / badges | 0.7rem–0.8rem | 600 | Outfit |
| Botones | 0.82rem–0.95rem | 600 | Outfit |

## 4. Paleta oficial

### Colores principales

| Token | Hex | Uso |
| --- | --- | --- |
| `--ep-navy` | `#0D3B6F` | Color principal, sidebar, títulos, acciones secundarias |
| `--ep-purple` | `#470074` | Acento premium, gradientes, estados destacados |
| `--ep-ink` | `#1A1A2E` | Texto principal sobre fondos claros |
| `--ep-sky` | `#4A90D9` | Acento informativo, gráficos y avatares |
| `--ep-bg` | `#F7F8FC` | Fondo general de app |
| `--ep-surface` | `#FFFFFF` | Cards, modales, barras superiores |
| `--ep-card-soft` | `#F4F6FB` | Superficies suaves en ejercicios |
| `--ep-border` | `rgba(13,59,111,0.12)` | Bordes sutiles |

### Estados y niveles

| Token | Hex | Uso |
| --- | --- | --- |
| `--ep-success` | `#1A7A4A` | Respuestas correctas, progreso positivo |
| `--ep-error` | `#C62828` | Respuestas incorrectas, errores críticos |
| `--ep-danger` | `#DC2626` | Nuevo, alerta comercial, bloqueo fuerte |
| `--ep-gold` | `#C9A84C` | Premium, logro, membresía |
| `--ep-muted` | `#666666` | Texto secundario |
| `--ep-muted-light` | `#999999` | Metadatos y ayudas discretas |

### Gradientes oficiales

```css
--ep-gradient-brand: linear-gradient(135deg, var(--ep-navy), var(--ep-purple));
--ep-gradient-data: linear-gradient(180deg, var(--ep-sky), var(--ep-navy));
--ep-gradient-soft: linear-gradient(135deg, #f5f7fa, #e8edf3);
```

## 5. Tokens CSS canónicos

Para nuevas pantallas, copiar o importar `styles/brand-tokens.css` y usar estos nombres. Si una página existente usa `--navy` o `--purple`, mantener compatibilidad con aliases mientras se migra.

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
}
```

## 6. Componentes base

### Botón primario

```css
.ep-btn-primary {
  background: var(--ep-gradient-brand);
  color: #fff;
  border: 0;
  border-radius: 10px;
  padding: 11px 18px;
  font-family: var(--ep-font-sans);
  font-size: 0.88rem;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 3px 12px rgba(13,59,111,0.2);
}
```

### Card

```css
.ep-card {
  background: var(--ep-surface);
  border: 1.5px solid var(--ep-border);
  border-radius: 18px;
  box-shadow: none;
}

.ep-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 36px rgba(13,59,111,0.1);
}
```

### Badge

```css
.ep-badge {
  border-radius: 999px;
  padding: 4px 10px;
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}
```

## 7. Layout y espaciado

- Usar fondo global `--ep-bg` y superficies blancas para cards/modales.
- Preferir radios amplios: `8px`, `10px`, `12px`, `18px`, `24px`.
- Espaciado base: `8px`, `12px`, `16px`, `20px`, `24px`, `28px`, `32px`, `40px`.
- Cards de catálogo: `border-radius: 18px`, padding interno `22px`, gap `18px`.
- Modales: `border-radius: 24px`, padding `32px–40px`, sombra suave azul.
- Evitar bordes negros puros; usar `--ep-border` o variaciones transparentes del navy.

## 8. Accesibilidad y contraste

- Texto principal: `--ep-ink` sobre `--ep-bg` o blanco.
- Títulos y botones secundarios: `--ep-navy`.
- Botones primarios: texto blanco sobre `--ep-gradient-brand`.
- No usar texto morado sobre azul marino.
- Para feedback, combinar color + texto/ícono; no depender solo del color.
- En estados disabled, bajar opacidad pero mantener legibilidad.

## 9. Instrucciones para futuras IAs

Cuando una IA cree o modifique UI en este repo:

1. Revisar este manual antes de escribir estilos.
2. Usar `styles/brand-tokens.css` como fuente de tokens si la página puede importar CSS externo.
3. Si la página es HTML autónomo, copiar solo los tokens necesarios desde este manual.
4. Mantener **Outfit** para UI y **Cormorant Garamond** para títulos.
5. Usar `#0D3B6F` y `#470074` como eje visual; no inventar una nueva paleta para secciones nuevas.
6. Preferir componentes con cards blancas, bordes sutiles, radios amplios y sombras azules suaves.
7. Si se encuentra CSS antiguo con Arial/Segoe UI o colores duplicados, migrar gradualmente sin romper funcionalidad.

## 10. Prompt corto para pedir cambios a una IA

> Trabaja dentro del sistema visual de English Peak. Usa Outfit para interfaz y Cormorant Garamond para títulos. Usa la paleta oficial: navy `#0D3B6F`, purple `#470074`, ink `#1A1A2E`, bg `#F7F8FC`, surface `#FFFFFF`, border `rgba(13,59,111,0.12)`, success `#1A7A4A`, error `#C62828`, gold `#C9A84C`. Mantén cards blancas con bordes sutiles, radios de 12–24px, botones con gradiente navy→purple y sombras suaves. No introduzcas una paleta nueva salvo que sea un estado funcional justificado.
