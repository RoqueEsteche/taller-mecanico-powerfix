# Guión de Presentación — PowerFix Taller Mecánico
## Programación III · 6 integrantes · 5 requisitos técnicos

---

> **Duración estimada:** 20-25 minutos  
> **Estructura:** Parte 1 = Introducción · Partes 2-6 = Un requisito técnico por integrante  
> **Tip:** Cada integrante muestra el código en pantalla mientras lo explica.

---

## PARTE 1 — Introducción y Demo General
### 🧑 Integrante 1

**[Abrir el navegador en `http://localhost:5500`]**

---

"Buenas tardes. Presentamos **PowerFix**, un servicio web completo para un taller mecánico especializado en maquinaria a nafta y diésel: desmalezadoras, motosierras, generadores, motobombas y más.

El proyecto está construido con una **arquitectura de dos capas separadas**: un frontend en HTML, CSS y JavaScript puro, y un backend en **FastAPI con Python** conectado a una base de datos **SQLite**.

La aplicación tiene seis pantallas:

| Página | Descripción |
|---|---|
| `index.html` | Página de inicio con hero, estadísticas y servicios |
| `servicios.html` | Catálogo dinámico filtrable por categoría |
| `contacto.html` | Formulario de solicitud de turno |
| `login.html` | Acceso al panel administrativo |
| `admin.html` | Dashboard con gráficos, leads y catálogo |
| `terminos.html` | Términos, privacidad y cookies |

**[Demo en vivo: navegar las 4 páginas públicas en 60 segundos]**

Para que todo funcione se levantan dos servidores: el backend en el puerto 8000 y el frontend en el 5500. La comunicación entre ellos es 100% asíncrona vía Fetch API.

Ahora le paso la palabra a [Nombre 2], quien explica cómo construimos la capa de diseño."

---

## PARTE 2 — Capa Frontend: Diseño, UX/UI y Arquitectura CSS
### 🧑 Integrante 2

**[Abrir `frontend/css/styles.css` y `frontend/index.html`]**

---

"Gracias. Voy a mostrar tres pilares del frontend: la **regla de color 60-30-10**, la **metodología BEM** y las **etiquetas semánticas con SEO**.

---

### 2.1 — CSS Variables y Regla 60-30-10

Toda la paleta del sitio vive en un único lugar: el `:root` de `styles.css`. Esto significa que si el cliente cambia la marca, tocamos **una sola variable** y el cambio se propaga a todos los componentes.

```css
/* styles.css — línea 7 */
:root {
  /* 60% — Fondos neutros (crema) */
  --color-bg:        #F7F6F2;
  --color-bg-card:   #FFFFFF;

  /* 30% — Textos y estructura (azul oscuro) */
  --color-dark:      #1E2D3D;
  --color-gray-500:  #718096;

  /* 10% — Acento CTA (naranja) */
  --color-accent:       #E55F0A;
  --color-accent-hover: #C44E07;

  /* Dos tipografías máximo */
  --font-heading: 'Bebas Neue', sans-serif;  /* títulos */
  --font-body:    'Inter', sans-serif;        /* cuerpo  */
}
```

El **naranja** solo aparece en botones de acción, íconos de énfasis y bordes de estado activo. Nunca en texto corrido. Eso es la regla 10%.

El **modo oscuro** no requiere cambiar ningún nombre de clase; simplemente reemplaza las variables:

```css
/* styles.css — línea 88 */
[data-theme="dark"] {
  --color-bg:      #0F1923;   /* misma variable, distinto valor */
  --color-dark:    #E8E6E0;
  --color-gray-100: #1E2D3D;
}
```

---

### 2.2 — Metodología BEM

BEM separa el HTML del CSS de forma predecible. Usamos **Bloque__Elemento--Modificador**:

```css
/* styles.css — Sección 5: Componente NAV */

.nav { }                      /* Bloque */
.nav__inner { }               /* Elemento */
.nav__link { }                /* Elemento */
.nav__link--active { }        /* Modificador */
.nav--scrolled { }            /* Modificador del bloque */
```

En el HTML se ve así:

```html
<!-- index.html -->
<nav class="nav" id="mainNav">
  <div class="nav__inner">
    <ul class="nav__menu">
      <li class="nav__item">
        <a href="index.html" class="nav__link nav__link--active">Inicio</a>
      </li>
    </ul>
  </div>
</nav>
```

Ningún componente depende de su posición en el árbol DOM. El `.nav__link--active` siempre luce igual, esté donde esté.

---

### 2.3 — HTML5 Semántico + SEO / Open Graph

**No hay ni un `<div>` donde debería haber un elemento semántico**:

```html
<!-- index.html -->
<header role="banner">        <!-- encabezado del sitio  -->
  <nav role="navigation">     <!-- navegación principal  -->
</header>

<main>
  <section aria-label="Hero"> <!-- sección temática      -->
    <article class="card">    <!-- contenido autocontenido -->
  </section>
</main>

<footer role="contentinfo">   <!-- pie de página          -->
  <address class="footer__address"> <!-- datos de contacto -->
```

Las etiquetas **Open Graph** hacen que el link se vea bien al compartir en WhatsApp o redes:

```html
<!-- index.html — head -->
<meta property="og:title"       content="PowerFix — Tu Máquina. Nuestra Pasión." />
<meta property="og:description" content="Taller mecánico especializado..." />
<meta property="og:type"        content="website" />
<meta property="og:image"       content="/assets/images/og-image.webp" />
```

---

### 2.4 — UX: "No me hagas errar"

El formulario de contacto usa un `<select>` cerrado en lugar de un campo de texto libre para el tipo de máquina. Esto elimina errores de tipeo que romperían los filtros del panel admin:

```html
<!-- contacto.html -->
<select id="tipo_maquina" class="form__select" required>
  <option value="">— Seleccioná tu equipo —</option>
  <option value="Desmalezadora">Desmalezadora</option>
  <option value="Generador">Generador</option>
  <!-- ... todas las opciones del catálogo ... -->
</select>
```

Le paso la palabra a [Nombre 3] para la capa de interactividad."

---

## PARTE 3 — Capa Interactividad: JavaScript Avanzado
### 🧑 Integrante 3

**[Abrir `frontend/js/contacto.js` y `frontend/js/main.js`]**

---

"Gracias. Todo el comportamiento dinámico del sitio cumple tres reglas estrictas: **cero `onclick` en el HTML**, **cambios visuales solo con `classList`**, y **persistencia con Web Storage**.

---

### 3.1 — Event Listeners (prohibido onclick)

En lugar de `<button onclick="...">`, todos los eventos se registran desde JavaScript:

```js
/* main.js — línea 26 */
document.addEventListener('DOMContentLoaded', () => {

  const themeToggle = document.getElementById('themeToggle');

  // ✅ Correcto: evento registrado desde JS
  themeToggle.addEventListener('click', () => {
    const html     = document.documentElement;
    const newTheme = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', newTheme);
    localStorage.setItem('pf_theme', newTheme);
    updateThemeIcon(newTheme);
  });

});
```

El `DOMContentLoaded` garantiza que el elemento exista antes de intentar escucharlo.

---

### 3.2 — classList: cambios visuales sin inline styles

**Nunca** hacemos `element.style.display = 'block'`. Usamos clases:

```js
/* contacto.js — línea 56 */

// Mostrar estado de carga en el botón
function setLoading(loading) {
  submitBtn.disabled = loading;
  submitBtn.classList.toggle('btn--disabled', loading);  // ← classList
  submitText.textContent = loading ? 'Enviando...' : 'Enviar Consulta';
}

// Mostrar/ocultar alerta de éxito
function showAlert(el) {
  el?.classList.add('alert--visible');    // ← classList
}
function hideAlerts() {
  alertOk?.classList.remove('alert--visible');   // ← classList
  alertErr?.classList.remove('alert--visible');
}
```

El CSS define qué significa `alert--visible`; el JS solo añade o quita el nombre:

```css
/* styles.css */
.alert          { display: none; }     /* oculto por defecto */
.alert--visible { display: flex; }     /* visible cuando JS lo activa */
```

---

### 3.3 — Validación antes del envío

El formulario valida campo por campo al perder el foco (`blur`) y también al intentar enviar:

```js
/* contacto.js — línea 98 */
function validateField(id) {
  const input   = document.getElementById(id);
  const errorEl = document.getElementById(`${id}Error`);
  let valid = true;

  switch (id) {
    case 'email':
      valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value.trim());
      break;
    case 'telefono':
      valid = input.value.replace(/\D/g, '').length >= 6;  // solo dígitos
      break;
    case 'descripcion':
      valid = input.value.trim().length >= 10;
      break;
  }

  // Feedback visual: clase verde o roja en el input
  input.classList.toggle('form__input--error', !valid);
  input.classList.toggle('form__input--valid',  valid && input.value !== '');

  // Mostrar u ocultar el mensaje de error
  errorEl?.classList.toggle('form__error--visible', !valid);

  return valid;
}
```

El formulario no se envía si algún campo falla — el servidor nunca recibe datos mal formados.

---

### 3.4 — localStorage y sessionStorage

```js
/* main.js — línea 8 */

// IIFE: se ejecuta antes de que se pinte la página → cero flash de tema incorrecto
(function initTheme() {
  const savedTheme = localStorage.getItem('pf_theme') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);
})();
```

```js
/* main.js — función initCookieBanner */
btnAccept.addEventListener('click', () => {
  localStorage.setItem('pf_cookies', 'accepted');   // persiste entre sesiones
  sessionStorage.setItem('pf_session', 'active');   // solo dura esta pestaña
  banner.classList.add('cookie-banner--hidden');
});
```

| Storage | Cuándo se usa en PowerFix |
|---|---|
| `localStorage` | Tema (light/dark), token JWT, preferencia de cookies |
| `sessionStorage` | Token duplicado para esta sesión, estado de sesión activa |

Le paso la palabra a [Nombre 4] para el backend."

---

## PARTE 4 — Capa Backend: MVP y Base de Datos
### 🧑 Integrante 4

**[Abrir `backend/models.py`, `backend/main.py` y el navegador en `localhost:8000/docs`]**

---

"Gracias. El backend es una **REST API** construida con FastAPI. Voy a mostrar las tres tablas del modelo, la separación en routers y la documentación automática.

---

### 4.1 — Tres tablas con SQLAlchemy ORM

```python
# models.py

class Usuario(Base):
    __tablename__ = "usuarios"
    id           = Column(Integer, primary_key=True)
    email        = Column(String(150), unique=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    rol          = Column(String(20), default="cliente")  # admin | empleado | cliente
    is_active    = Column(Boolean, default=True)


class Contacto(Base):
    __tablename__ = "contactos"
    id           = Column(Integer, primary_key=True)
    tipo_maquina = Column(String(100), nullable=False)
    descripcion  = Column(Text, nullable=False)
    estado       = Column(String(20), default="nuevo")  # nuevo | en_proceso | resuelto | cerrado


class Servicio(Base):
    __tablename__ = "servicios"
    id           = Column(Integer, primary_key=True)
    imagen_path  = Column(String(300), nullable=False)  # ← solo la ruta, no el archivo
    disponible   = Column(Boolean, default=True)
```

Punto clave: la tabla `servicios` guarda **solo el texto de la ruta** a la imagen (`/assets/images/productos/generador.webp`), no el archivo binario. Los archivos viven en el filesystem. Esta es la práctica correcta para bases de datos.

---

### 4.2 — Roles y control de acceso

La función `require_admin` actúa como guardia en cualquier ruta:

```python
# auth.py
def require_admin(current_user: models.Usuario = Depends(get_current_user)):
    if current_user.rol != "admin":
        raise HTTPException(
            status_code=403,
            detail="Acceso denegado: se requiere rol de administrador",
        )
    return current_user
```

En el router de contactos, el `GET /` y el `PATCH` requieren admin; el `POST /` es público:

```python
# routers/contacts.py

# ✅ Público — cualquiera puede enviar una consulta
@router.post("/", status_code=201)
def crear_contacto(data: schemas.ContactoCreate, db: Session = Depends(get_db)):
    contacto = models.Contacto(**data.dict())
    db.add(contacto)
    db.commit()
    return contacto

# 🔒 Solo admin puede listar
@router.get("/")
def listar_contactos(
    _: models.Usuario = Depends(require_admin),  # ← guardia de rol
    db: Session = Depends(get_db),
):
    return db.query(models.Contacto).order_by(models.Contacto.created_at.desc()).all()
```

---

### 4.3 — API REST y documentación en /docs

```python
# main.py
app = FastAPI(
    title="PowerFix API",
    version="1.0.0",
    docs_url="/docs",       # ← Swagger UI automático
    redoc_url="/redoc",     # ← Redoc alternativo
)

app.include_router(users.router)     # /api/users
app.include_router(contacts.router)  # /api/contactos
app.include_router(products.router)  # /api/servicios
```

**[Mostrar el navegador en `localhost:8000/docs` — todos los endpoints visibles, ejecutables]**

La documentación se genera sola. FastAPI lee los tipos de Python y los esquemas Pydantic y construye el Swagger sin ninguna línea extra.

Le paso la palabra a [Nombre 5] para la integración entre frontend y backend."

---

## PARTE 5 — Integración y Asincronía: El Puente
### 🧑 Integrante 5

**[Abrir `frontend/js/contacto.js` y `frontend/js/admin.js`]**

---

"Gracias. Esta parte muestra cómo el frontend habla con el backend: **async/await, Fetch API, manejo de errores y Chart.js**.

---

### 5.1 — Fetch API con async/await y try/catch

El formulario de contacto envía los datos al backend de forma asíncrona:

```js
/* contacto.js — línea 53 */
form.addEventListener('submit', async (e) => {
  e.preventDefault();    // evitar recarga de página
  if (!validateAll()) return;

  setLoading(true);

  try {
    // 1. Construir el payload como objeto JS
    const payload = {
      nombre:       document.getElementById('nombre').value.trim(),
      email:        document.getElementById('email').value.trim(),
      tipo_maquina: document.getElementById('tipo_maquina').value,
      descripcion:  document.getElementById('descripcion').value.trim(),
    };

    // 2. Enviar al backend como JSON
    const res = await fetch(`${window.PF.API_URL}/api/contactos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),   // objeto → texto JSON
    });

    // 3. Verificar el código HTTP antes de leer el cuerpo
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.detail || `Error ${res.status}`);
    }

    // 4. Éxito: limpiar y mostrar confirmación
    form.reset();
    showAlert(alertOk);

  } catch (err) {
    // 5. Error: mostrar mensaje al usuario (nunca un alert() genérico)
    errMsg.textContent = err.message;
    showAlert(alertErr);
  } finally {
    setLoading(false);   // siempre restablecer el botón
  }
});
```

El bloque `finally` garantiza que el botón siempre se reactive, aunque haya un error de red.

---

### 5.2 — Autenticación con JWT

El login guarda el token y lo usa en todas las peticiones protegidas:

```js
/* login.js — línea 65 */
const res = await fetch(`${API_URL}/api/users/login`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password }),
});

const data = await res.json();

// Guardar token en localStorage para persistencia
localStorage.setItem('pf_token', data.access_token);
localStorage.setItem('pf_user',  JSON.stringify(data.usuario));

window.location.replace('admin.html');
```

```js
/* admin.js — helper fetchAuth */
function fetchAuth(path, method = 'GET', body = null) {
  return fetch(`${API}${path}`, {
    method,
    headers: {
      'Content-Type':  'application/json',
      'Authorization': `Bearer ${localStorage.getItem('pf_token')}`,  // ← JWT
    },
    body: body ? JSON.stringify(body) : null,
  });
}
```

---

### 5.3 — Chart.js alimentado por el backend

El dashboard pide los datos con `fetchAuth` y los entrega directamente a Chart.js:

```js
/* admin.js — función loadDashboard */
async function loadDashboard() {
  // Dos peticiones en paralelo para mayor velocidad
  const [statsRes, chartRes] = await Promise.all([
    fetchAuth('/api/stats'),
    fetchAuth('/api/stats/charts'),
  ]);

  const charts = await chartRes.json();

  // Los labels y data vienen del backend, no están hardcodeados
  renderBarChart('chartMaquinas', charts.maquinas.labels, charts.maquinas.data);
  renderDoughnutChart('chartEstados', charts.estados.labels, charts.estados.data);
}

// El gráfico de barras
function renderBarChart(canvasId, labels, data, label) {
  const ctx = document.getElementById(canvasId).getContext('2d');

  new Chart(ctx, {
    type: 'bar',
    data: {
      labels,                  // ← viene del backend: ['Generador', 'Motosierra', ...]
      datasets: [{
        label,
        data,                  // ← viene del backend: [3, 2, 1, ...]
        backgroundColor: CHART_COLORS,
        borderRadius: 6,
      }],
    },
    options: {
      responsive: true,
      scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } },
    },
  });
}
```

**[Mostrar el panel admin con los tres gráficos renderizados]**

Si el equipo de ventas agrega un nuevo contacto desde el formulario público, el gráfico se actualiza solo al recargar el dashboard. No hay datos hardcodeados en ningún lado.

Le paso la palabra a [Nombre 6] para rendimiento, seguridad y cumplimiento legal."

---

## PARTE 6 — Rendimiento, Seguridad y Aspectos Legales
### 🧑 Integrante 6

**[Abrir `backend/main.py`, `frontend/index.html` y `frontend/terminos.html`]**

---

"Gracias. Esta última parte muestra cómo el proyecto trata tres aspectos no funcionales pero obligatorios: **WPO, CORS y cumplimiento legal**.

---

### 6.1 — Optimización de rendimiento (WPO): imágenes WebP

Todas las imágenes del catálogo son **WebP**, el formato moderno que pesa entre 25% y 35% menos que JPG con igual calidad visual. Las generamos con un script Python usando Pillow:

```python
# gen_images.py
from PIL import Image, ImageDraw

def make_placeholder(path, color, label, size=(800, 600)):
    img  = Image.new("RGB", size, color)   # imagen limpia
    draw = ImageDraw.Draw(img)
    # ... texto y círculo decorativo ...
    img.save(path, "WEBP", quality=80)     # ← formato WebP, calidad 80

# Genera 9 imágenes de producto + hero (1920x1080) + OG (1200x630)
for nombre, color, label in servicios:
    make_placeholder(f"productos/{nombre}.webp", color, label)
```

En el HTML se referencian con la etiqueta correcta:

```html
<!-- El atributo role="img" + aria-label describe la imagen a lectores de pantalla -->
<div class="hero__bg" role="img" aria-label="Taller mecánico profesional"></div>
```

El hero usa un `div` con `background-image` en CSS para poder aplicar el gradiente encima sin un segundo elemento DOM.

---

### 6.2 — CORS: política de origen cruzado

Sin CORS el navegador bloquearía todas las peticiones del frontend (puerto 5500) al backend (puerto 8000). La configuración en FastAPI:

```python
# main.py — líneas 24-30
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],           # en producción: ["https://powerfix.com"]
    allow_credentials=True,
    allow_methods=["*"],           # GET, POST, PATCH, DELETE
    allow_headers=["*"],           # Authorization, Content-Type
)
```

El `*` es válido para desarrollo local. En un deploy real se especifica el dominio exacto del frontend para evitar que otros sitios llamen a la API.

---

### 6.3 — Aviso de cookies (RGPD simulado)

El banner se muestra solo si el usuario no tomó una decisión previa:

```js
/* main.js — función initCookieBanner */
function initCookieBanner() {
  const cookieStatus = localStorage.getItem('pf_cookies');

  if (cookieStatus !== null) {
    // Ya decidió → no molestar de nuevo
    banner.classList.add('cookie-banner--hidden');
    return;
  }

  btnAccept.addEventListener('click', () => {
    localStorage.setItem('pf_cookies', 'accepted');
    banner.classList.add('cookie-banner--hidden');
  });

  btnReject.addEventListener('click', () => {
    localStorage.setItem('pf_cookies', 'rejected');
    banner.classList.add('cookie-banner--hidden');
  });
}
```

Y la analítica respeta la decisión:

```js
/* main.js — función trackPageView */
async function trackPageView() {
  const cookieStatus = localStorage.getItem('pf_cookies');
  if (cookieStatus === 'rejected') return;  // ← respeta la preferencia

  await fetch(`${API_URL}/api/analytics/pageview`, {
    method: 'POST',
    body: JSON.stringify({ pagina }),
  });
}
```

---

### 6.4 — Términos, Condiciones y Privacidad

El pie de página de **todas** las páginas enlaza a `terminos.html`:

```html
<!-- footer de index.html, servicios.html, contacto.html -->
<div class="footer__bottom-links">
  <a href="terminos.html">Términos y Condiciones</a>
  <a href="terminos.html#privacidad">Política de Privacidad</a>
</div>
```

`terminos.html` documenta tres secciones obligatorias: servicios y precios, política de privacidad (qué datos se recopilan y cómo se usan) y política de cookies (esenciales vs analíticas).

---

### Cierre

**[Mostrar el repositorio en GitHub]**

El código está publicado en: `github.com/RoqueEsteche/taller-mecanico-powerfix`

Para resumir lo que construimos:

| Requisito | Implementación |
|---|---|
| UX/UI · 60-30-10 · 2 tipografías | `styles.css :root`, `Bebas Neue` + `Inter` |
| BEM · Variables CSS · Semántica | Toda la hoja de estilos, 6 páginas HTML |
| Event Listeners · classList · Validación | `main.js`, `contacto.js`, `login.js` |
| localStorage · sessionStorage | Tema, JWT, cookies, sesión |
| 3 tablas · Roles · Rutas REST · /docs | `models.py`, `auth.py`, routers, FastAPI |
| async/await · Fetch · try/catch · Chart.js | `contacto.js`, `admin.js`, dashboard |
| WebP · CORS · Cookies · Términos | `gen_images.py`, `main.py`, `terminos.html` |

Quedamos a disposición para preguntas. Muchas gracias."

---

## Resumen de distribución por integrante

| # | Integrante | Tema | Archivos clave |
|---|---|---|---|
| 1 | — | Introducción y demo navegable | Navegador |
| 2 | — | Frontend: BEM, 60-30-10, semántica, OG | `styles.css`, `index.html` |
| 3 | — | JS: eventos, classList, validación, storage | `main.js`, `contacto.js` |
| 4 | — | Backend: modelos, roles, REST, /docs | `models.py`, `main.py`, `contacts.py` |
| 5 | — | Async: Fetch, JWT, Chart.js | `contacto.js`, `admin.js` |
| 6 | — | WPO, CORS, cookies, términos + cierre | `gen_images.py`, `main.py`, `terminos.html` |

---

## Checklist antes de la presentación

- [ ] Backend corriendo en `localhost:8000` (`uvicorn main:app --reload`)
- [ ] Frontend corriendo en `localhost:5500` (`python -m http.server 5500`)
- [ ] Base de datos seedeada (`python seed.py`)
- [ ] Imágenes generadas (`python gen_images.py`)
- [ ] Abrir `localhost:8000/docs` en una pestaña para la demo del backend
- [ ] Abrir `localhost:5500/admin.html` y loguearse con `admin@powerfix.com` / `Admin2024!`
- [ ] VS Code con los archivos del guión abiertos y listos para mostrar
