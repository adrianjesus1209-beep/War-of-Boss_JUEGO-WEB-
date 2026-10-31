# WAR OF BOSS - Landing Page y Panel de Administracion

Landing page interactiva de estilo retro pixel art y sistema de administracion backoffice para el videojuego **WAR OF BOSS**.

## Tecnologias

- **Backend:** PHP 8+ (Vanilla), PDO MySQL / MariaDB, manipulacion y conversion automatica a WebP con GD.
- **Frontend:** HTML5 semantico, Tailwind CSS (CDN), CSS custom (scanlines CRT, glitches, efectos neon).
- **JavaScript Modular:**
  - `js/landing.js`: Orquestador principal, animaciones de entrada y carga reactiva de configuracion.
  - `js/starfield.js`: Lienzo espacial interactivo con estrellas parpadeantes y cometas de estela degradada.
  - `js/carousel-3d.js`: Galeria en perspectiva 3D sincronizada con el scroll mediante **GSAP + ScrollTrigger**.
  - `js/lightbox.js`: Visor modal de fotos con doble bufer, soporte tactil swipe y navegacion por teclado.
  - `js/features-modal.js`: Modal interactivo con informacion expandida de mecanicas de juego.
  - `js/figura-particles.js`: Logotipo reactivo de particulas con fisicas de repulsion y adaptacion a tema claro/oscuro.
- **Backoffice Admin:** Chart.js (metricas de trafico y descargas en tiempo real), jsPDF + autoTable (auditoria de IPs en PDF), gestion de contenidos y carga de recursos multimedia.

## Instalacion y Puesta en Marcha

1. Clonar o mover el repositorio en tu servidor web local (por ejemplo en XAMPP: `c:\xampp\htdocs\Proyectos\War-of-Boss_JUEGO(WEB)`):
   ```bash
   git clone https://github.com/adrianjesus1209-beep/War-of-Boss_JUEGO-WEB-.git
   ```
2. Configurar la conexion a la base de datos en `api/config_db.php` (usar `api/config_db.php.example` como referencia).
3. Crear la base de datos `base_datos_war_of_boss` e importar el script desde `database/base_datos_war_of_boss.sql`.
4. Acceder al proyecto:
   - **Landing Page:** `http://localhost/Proyectos/War-of-Boss_JUEGO(WEB)/`
   - **Panel Administrativo:** `http://localhost/Proyectos/War-of-Boss_JUEGO(WEB)/admin/?t=<TOKEN>`

## Estructura del Proyecto

```
War-of-Boss_JUEGO(WEB)/
|-- admin/               # Panel de administracion (Dashboard, metricas, CRUD)
|-- api/                 # Endpoints REST (configuracion, auth, uploads, metricas)
|-- css/                 # Hojas de estilo y efectos retro
|-- database/            # Scripts SQL y backups de la base de datos
|-- figura/              # Recursos graficos para el motor de particulas
|-- includes/            # Cabecera (header) y pie de pagina (footer) compartidos
|-- js/                  # Modulos JavaScript independientes y limpios
|-- pages/               # Paginas secundarias (historial de novedades)
|-- uploads/             # Archivos multimedia (imagenes, galeria, audios)
`-- index.php            # Pagina principal de aterrizaje
```

## Licencia

Proyecto privado. Todos los derechos reservados (c) 2026 War of Boss.
