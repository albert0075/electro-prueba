/* tutorial.js
   Tour interactivo en español para clientes (excluye panel admin).
   - Mostrar un prompt al abrir la página: "¿Deseas hacer el tutorial?"
   - Si acepta, guía paso a paso explicando partes clave (incluye recomendación de zoom 80%).
   - Navegación con botones Siguiente / Anterior / Saltar.
   - Resalta elementos y hace scroll hacia ellos.
   - No modifica datos; solo UI temporal.
*/

/* CONFIG: pasos del tutorial (texto en español).
   Si un selector no existe en la página, el paso se mostrará en el centro.
*/
(function () {
  if (window.__electroflips_tutorial_installed) return;
  window.__electroflips_tutorial_installed = true;

  const STEPS = [
    {
      id: 'zoom',
      title: 'Mejor visualización',
      text: 'Recomendamos usar zoom del navegador al 80% para una mejor visualización en escritorio. Puedes cambiarlo desde el menú del navegador (Ctrl/Cmd + -). ¿Listo?'
    },
    {
      id: 'nav',
      selector: 'nav.main-nav',
      title: 'Navegación principal',
      text: 'Usa la barra de navegación para moverte entre Inicio, Catálogo, Carrito, Contacto y Administrador (este tutorial no cubre el panel admin).'
    },
    {
      id: 'brand',
      selector: '#brandNeon',
      title: 'Nombre del sitio',
      text: 'Aquí aparece el nombre del sitio. Es útil para identificar la tienda y se puede configurar en el panel administrativo.'
    },
    {
      id: 'favorites',
      selector: '#favoritesContainer',
      title: 'Favoritos',
      text: 'En Favoritos verás los servicios destacados. Haz clic en cualquiera para abrir su tarjeta o ver más detalles.'
    },
    {
      id: 'promos',
      selector: '#promosContainer',
      title: 'Promociones',
      text: 'Aquí se muestran las promociones activas. Al ver una promo, puedes "Ver en catálogo" y el sitio te llevará al producto o sección correspondiente.'
    },
    {
      id: 'catalog',
      selector: '#catalogContainer',
      title: 'Catálogo',
      text: 'En el catálogo encontrarás los productos organizados por categorías. Cada tarjeta muestra imagen, nombre y precio, y tiene botones para Comprar o Ver Más.'
    },
    {
      id: 'productCard',
      selector: '.product-card',
      title: 'Tarjetas de producto',
      text: 'Cada tarjeta muestra una imagen, el nombre y el precio. Usa "Mas Info" para ver detalles o el botón Comprar para agregar al carrito.'
    },
    {
      id: 'productModal',
      title: 'Detalles del producto',
      text: 'Al abrir "Mas Info" se muestra un modal con la imagen ampliada, descripción, precios y el botón para comprar. Si el producto está agotado, verás un badge y no podrás comprarlo.'
    },
    {
      id: 'cartBubble',
      selector: '#cartBubbleBtn',
      title: 'Carrito rápido',
      text: 'El botón flotante abre tu carrito. El badge indica cuántos ítems tienes. También puedes finalizar tu compra desde la página de carrito.'
    },
    {
      id: 'whatsapp',
      selector: '#whatsappBubbleBtn',
      title: 'Contacto por WhatsApp',
      text: 'Usa este botón para iniciar una conversación por WhatsApp con el número de la tienda y preguntar sobre tu compra o solicitar ayuda.'
    },
    {
      id: 'cartPage',
      selector: '#carrito',
      title: 'Página del carrito',
      text: 'En la página Carrito puedes ver el detalle de los items, cambiar cantidades y eliminar productos. Al finalizar se genera un mensaje para WhatsApp con el resumen.'
    },
    {
      id: 'contact',
      selector: '#contacto',
      title: 'Contacto y redes',
      text: 'En Contacto encontrarás correo, WhatsApp y redes sociales para soporte o preguntas sobre tu compra.'
    },
    {
      id: 'end',
      title: '¡Listo!',
      text: 'Has recorrido las partes principales del sitio. Si quieres repetir el tutorial, lo puedes abrir desde el menú (o recargando la página). ¡Gracias por visitar Electroflips Xperience!'
    }
  ];

  /* Crear y añadir estilos (si no están) */
  function injectTutorialStyles() {
    if (document.getElementById('tutorialStyles')) return;
    const link = document.createElement('link');
    link.id = 'tutorialStyles';
    link.rel = 'stylesheet';
    link.href = 'tutorial.css';
    document.head.appendChild(link);
  }

  /* Crear elementos del tutorial: overlay, tooltip y prompt */
  function createTutorialDom() {
    if (document.getElementById('efTutorialOverlay')) return;

    const overlay = document.createElement('div');
    overlay.id = 'efTutorialOverlay';
    overlay.className = 'ef-tut-overlay';
    overlay.setAttribute('aria-hidden', 'true');

    const tooltip = document.createElement('div');
    tooltip.id = 'efTutorialTooltip';
    tooltip.className = 'ef-tut-tooltip';
    tooltip.innerHTML = `
      <div class="ef-tut-head">
        <strong id="efTutTitle"></strong>
      </div>
      <div id="efTutBody" class="ef-tut-body"></div>
      <div class="ef-tut-controls">
        <button id="efTutPrev" class="btn small">Anterior</button>
        <button id="efTutNext" class="btn small">Siguiente</button>
        <button id="efTutSkip" class="btn small" style="background:#bbb;color:#222;">Saltar</button>
      </div>
    `;

    const prompt = document.createElement('div');
    prompt.id = 'efTutorialPrompt';
    prompt.className = 'ef-tut-prompt';
    prompt.innerHTML = `
      <div class="ef-prompt-inner">
        <h3>¿Deseas hacer el tutorial?</h3>
        <p>Te recomendamos usar zoom 80% para mejor visualización. El tutorial te mostrará cómo usar la página.</p>
        <div class="ef-prompt-actions">
          <button id="efStartTut" class="btn">Sí, empezar</button>
          <button id="efSkipTut" class="btn" style="background:#bbb;color:#222;">No, gracias</button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);
    document.body.appendChild(tooltip);
    document.body.appendChild(prompt);

    // Controls
    document.getElementById('efTutNext').addEventListener('click', () => showStep(currentIndex + 1));
    document.getElementById('efTutPrev').addEventListener('click', () => showStep(currentIndex - 1));
    document.getElementById('efTutSkip').addEventListener('click', endTutorial);

    document.getElementById('efStartTut').addEventListener('click', () => {
      closePrompt();
      startTutorial();
    });
    document.getElementById('efSkipTut').addEventListener('click', () => {
      closePrompt();
      // set overlay hidden (do nothing else)
    });

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (!isRunning) return;
      if (e.key === 'Escape') endTutorial();
      if (e.key === 'ArrowRight') showStep(currentIndex + 1);
      if (e.key === 'ArrowLeft') showStep(currentIndex - 1);
    });

    // click outside tooltip to advance
    overlay.addEventListener('click', () => {
      if (!isRunning) return;
      showStep(currentIndex + 1);
    });
  }

  function openPrompt() {
    const p = document.getElementById('efTutorialPrompt');
    if (!p) return;
    p.classList.add('open');
  }
  function closePrompt() {
    const p = document.getElementById('efTutorialPrompt');
    if (!p) return;
    p.classList.remove('open');
  }

  /* Helper to highlight an element: add class and keep reference */
  let highlightedEl = null;
  function highlightElement(el) {
    clearHighlight();
    if (!el) return;
    highlightedEl = el;
    el.classList.add('ef-tut-highlight');
  }
  function clearHighlight() {
    if (highlightedEl) {
      highlightedEl.classList.remove('ef-tut-highlight');
      highlightedEl = null;
    }
  }

  /* Position tooltip near an element (or center when no element) */
  function positionTooltipForElement(el) {
    const tooltip = document.getElementById('efTutorialTooltip');
    if (!tooltip) return;
    const pad = 12;
    tooltip.style.top = '';
    tooltip.style.left = '';
    tooltip.style.right = '';
    tooltip.style.bottom = '';

    if (!el) {
      // center
      tooltip.classList.add('ef-center');
      tooltip.style.transform = 'translate(-50%, -50%)';
      tooltip.style.left = '50%';
      tooltip.style.top = '50%';
      return;
    }

    tooltip.classList.remove('ef-center');
    const rect = el.getBoundingClientRect();
    // prefer placing tooltip above the element when possible
    const availableAbove = rect.top;
    const availableBelow = window.innerHeight - rect.bottom;
    const tooltipWidth = Math.min(420, Math.max(240, rect.width * 0.9));
    tooltip.style.width = tooltipWidth + 'px';

    if (availableBelow > 220 || availableBelow >= availableAbove) {
      // place below
      tooltip.style.left = Math.min(window.innerWidth - tooltipWidth - 12, Math.max(12, rect.left + rect.width / 2 - tooltipWidth / 2)) + 'px';
      tooltip.style.top = Math.min(window.innerHeight - 16, rect.bottom + pad) + 'px';
    } else {
      // place above
      tooltip.style.left = Math.min(window.innerWidth - tooltipWidth - 12, Math.max(12, rect.left + rect.width / 2 - tooltipWidth / 2)) + 'px';
      tooltip.style.top = Math.max(12, rect.top - pad - 180) + 'px';
    }
    // smooth scroll into view
    try {
      el.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
    } catch (e) { /* ignore */ }
  }

  /* Main flow */
  let currentIndex = 0;
  let isRunning = false;

  function startTutorial() {
    injectTutorialStyles();
    createTutorialDom();
    isRunning = true;
    document.getElementById('efTutorialOverlay').classList.add('visible');
    showStep(0);
  }

  function showStep(index) {
    // clamp
    if (index < 0) index = 0;
    if (index >= STEPS.length) {
      endTutorial();
      return;
    }
    currentIndex = index;

    const step = STEPS[index];
    const titleEl = document.getElementById('efTutTitle');
    const bodyEl = document.getElementById('efTutBody');
    titleEl.innerText = step.title || '';
    bodyEl.innerText = step.text || '';

    // Update controls visibility
    document.getElementById('efTutPrev').style.display = index === 0 ? 'none' : 'inline-block';
    document.getElementById('efTutNext').innerText = (index === STEPS.length - 1) ? 'Finalizar' : 'Siguiente';

    // Find element
    let el = null;
    if (step.selector) {
      el = document.querySelector(step.selector);
      // For product-card we may want the first product specifically
      if (!el && step.selector === '.product-card') {
        el = document.querySelector('.product-card');
      }
    }

    clearHighlight();
    positionTooltipForElement(el);
    highlightElement(el);

    // Special behaviour: if step.productModal want to open the modal of first product for demo
    if (step.id === 'productModal') {
      const firstProd = (window.PRODUCTS && PRODUCTS.length) ? PRODUCTS[0] : null;
      if (firstProd) {
        // try to open details safely
        try { showProductDetails(firstProd.id); } catch (e) { /* ignore */ }
        // close automatically after a while if user moves on
      }
    }

    // If the target doesn't exist, show center tooltip
    if (!el) {
      positionTooltipForElement(null);
    }
  }

  function endTutorial() {
    isRunning = false;
    clearHighlight();
    // close product modal if we opened one
    try { closeProductModal(); } catch (e) { /* ignore */ }
    const overlay = document.getElementById('efTutorialOverlay');
    if (overlay) overlay.classList.remove('visible');
    const tooltip = document.getElementById('efTutorialTooltip');
    if (tooltip) tooltip.style.left = tooltip.style.top = tooltip.style.right = tooltip.style.bottom = '';
    // hide prompt if open
    closePrompt();
  }

  // Expose control to global so user can reopen tutorial manually from console: window.startEfTutorial()
  window.startEfTutorial = function () {
    closePrompt();
    startTutorial();
  };
  window.endEfTutorial = endTutorial;

  // Inject prompt after DOM content loaded but before app.js heavy init might run.
  document.addEventListener('DOMContentLoaded', () => {
    injectTutorialStyles();
    createTutorialDom();
    // Delay a bit to avoid fighting initial animations/navigation
    setTimeout(openPrompt, 600);
  });
})();
