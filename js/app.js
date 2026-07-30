/* ════════════════════════════════════════════════════
   EL TOMATE ITALIANO — LOGICA DE APLICACION & INTERACCIONES
   Carrito de Compras, Asistente de Checkout y Animaciones GSAP
   ════════════════════════════════════════════════════ */

document.addEventListener("DOMContentLoaded", () => {
  // Variables de Estado
  let cart = [];
  let currentStep = 1;
  let checkoutMode = "delivery"; // default
  let userGpsCoordinates = "";
  let orderNumber = "";
  let currentCategory = "pastichos";

  // Cargar carrito de localStorage si existe
  if (localStorage.getItem("eti_cart")) {
    try {
      cart = JSON.parse(localStorage.getItem("eti_cart"));
      // updateCartUI se llamará una vez que las funciones del carrito estén declaradas más abajo
    } catch (e) {
      cart = [];
    }
  }

  // Clonar e inyectar el logo SVG en las secciones respectivas
  const brandLogoSrc = document.getElementById("Layer_1");
  if (brandLogoSrc) {
    // Clonar para Header y Footer
    document.querySelectorAll(".brand__logo-slot").forEach(slot => {
      const clone = brandLogoSrc.cloneNode(true);
      clone.removeAttribute("id");
      clone.style.width = "100%";
      clone.style.height = "100%";
      clone.style.margin = "0";
      // Asegurar visibilidad sin depender del estado del preloader
      clone.querySelectorAll("path").forEach(p => {
        p.style.opacity = "1";
        p.style.transform = "none";
      });
      slot.appendChild(clone);
    });

    // Clonar para el modal de Gracias
    const grazieSlot = document.querySelector(".grazie__logo-slot");
    if (grazieSlot) {
      const clone = brandLogoSrc.cloneNode(true);
      clone.removeAttribute("id");
      clone.style.width = "100%";
      clone.style.height = "100%";
      clone.style.margin = "0";
      clone.querySelectorAll("path").forEach(p => {
        p.style.opacity = "1";
        p.style.transform = "none";
      });
      grazieSlot.appendChild(clone);
    }
  }


  /* ════════════════════════════════════════════════════
     1. PRELOADER Y FLUJO DE INGRESO CON GSAP
     ════════════════════════════════════════════════════ */
  const preloader = document.getElementById("pre");
  const preLogo = document.getElementById("preLogo");
  const preFill = document.getElementById("preFill");
  const prePct = document.getElementById("prePct");

  let progress = 0;
  const statusTexts = [
    "Amasando la pasta fresca...",
    "Reduciendo salsa napoli...",
    "Cocinando bologna a fuego lento...",
    "Preparando la bechamel...",
    "Gratinando parmesano...",
    "¡Listo para hornear!"
  ];

  // Iniciar animación de trazado/aparición de paths con GSAP si está cargado
  const svgPaths = document.querySelectorAll("#Layer_1 path");
  if (svgPaths.length > 0 && window.gsap) {
    gsap.from(svgPaths, {
      duration: 1.8,
      opacity: 0,
      scale: 0.9,
      transformOrigin: "50% 50%",
      stagger: {
        each: 0.003,
        from: "random"
      },
      ease: "power2.out"
    });
  }

  const preloaderInterval = setInterval(() => {
    progress += Math.floor(Math.random() * 4) + 1;
    if (progress > 100) progress = 100;

    // Actualizar barra e indicadores
    if (preFill) preFill.style.width = `${progress}%`;
    
    if (prePct) {
      const textIndex = Math.min(
        Math.floor((progress / 100) * statusTexts.length),
        statusTexts.length - 1
      );
      prePct.innerText = `${progress}% · ${statusTexts[textIndex]}`;
    }

    if (progress === 100) {
      clearInterval(preloaderInterval);
      setTimeout(() => {
        // Ocultar preloader
        if (preloader) preloader.classList.add("fade-out");
        
        // Iniciar animaciones de la página
        initEntranceAnimations();
        initFlourCanvas();
      }, 600);
    }
  }, 40);

  /* ════════════════════════════════════════════════════
     2. RENDERIZADO DEL MENÚ DIGITAL COMPLETO
     ════════════════════════════════════════════════════ */
  const catWrap = document.getElementById("catWrap");

  function renderMenu() {
    if (!catWrap) return;
    
    let html = "";

    // 1. SECCIÓN PASTICHOS
    html += `
      <div class="menu-section" id="pastichos" style="scroll-margin-top: 100px;">
        <h3 class="menu-section__title">Pastichos</h3>
        <div class="category__grid">
    `;

    const pastichos = MENU_DATA["pastichos"] || [];
    pastichos.forEach(item => {
      const tagsHtml = item.tags.map(tag => `<span class="card__tag">${tag}</span>`).join("");
      const badgeHtml = item.badge ? `<span class="card__badge">${item.badge}</span>` : "";
      let sizesHtml = "";
      let initialPrice = item.price;
      
      if (item.hasSizes && item.sizes) {
        initialPrice = item.sizes[0].price;
        sizesHtml = `<div class="card__sizes">`;
        item.sizes.forEach((size, idx) => {
          sizesHtml += `
            <label class="size-option">
              <input type="radio" name="size-${item.id}" value="${size.id}" data-price="${size.price}" data-label="${size.name}" ${idx === 0 ? "checked" : ""}/>
              <span>${size.name} <small style="display:block;font-size:0.72rem;opacity:0.6">${size.label}</small></span>
              <b>ref ${size.price}</b>
            </label>
          `;
        });
        sizesHtml += `</div>`;
      } else {
        sizesHtml = `<p style="font-size:0.8rem;color:var(--oro);margin-bottom:20px;font-style:italic">${item.unit || ""}</p>`;
      }

      html += `
        <div class="card-outer">
          <article class="card">
            <div class="card__img-wrap">
              <img class="card__img" src="${item.image}" alt="${item.name} de El Tomate Italiano" width="110" height="110" loading="lazy"/>
              ${badgeHtml}
            </div>
            <div class="card__body">
              <h3 class="card__title">${item.name}</h3>
              <p class="card__desc">${item.description}</p>
              ${tagsHtml ? `<div class="card__tags">${tagsHtml}</div>` : ""}
              ${sizesHtml}
              <div class="card__foot">
                <div class="card__price">
                  <span>Precio</span>
                  <b id="price-${item.id}">Ref ${initialPrice}</b>
                </div>
                <button class="btn btn--rosso card__add" data-id="${item.id}" data-cat="pastichos">
                  <svg class="icon" aria-hidden="true"><use href="#i-plus"/></svg> Agregar
                </button>
              </div>
            </div>
          </article>
        </div>
      `;
    });

    html += `
        </div>
      </div>
    `;

    // 2. SECCIÓN SALSAS
    html += `
      <div class="menu-section" id="salsas" style="margin-top: 80px; scroll-margin-top: 100px;">
        <h3 class="menu-section__title">Salsas</h3>
        <div class="category__grid">
    `;

    const salsas = MENU_DATA["salsas"] || [];
    salsas.forEach(item => {
      const tagsHtml = item.tags.map(tag => `<span class="card__tag">${tag}</span>`).join("");
      const badgeHtml = item.badge ? `<span class="card__badge">${item.badge}</span>` : "";
      let sizesHtml = "";
      let initialPrice = item.price;
      
      if (item.hasSizes && item.sizes) {
        initialPrice = item.sizes[0].price;
        sizesHtml = `<div class="card__sizes">`;
        item.sizes.forEach((size, idx) => {
          sizesHtml += `
            <label class="size-option">
              <input type="radio" name="size-${item.id}" value="${size.id}" data-price="${size.price}" data-label="${size.name}" ${idx === 0 ? "checked" : ""}/>
              <span>${size.name} <small style="display:block;font-size:0.72rem;opacity:0.6">${size.label}</small></span>
              <b>ref ${size.price}</b>
            </label>
          `;
        });
        sizesHtml += `</div>`;
      } else {
        sizesHtml = `<p style="font-size:0.8rem;color:var(--oro);margin-bottom:20px;font-style:italic">${item.unit || ""}</p>`;
      }

      html += `
        <div class="card-outer">
          <article class="card">
            <div class="card__img-wrap">
              <img class="card__img" src="${item.image}" alt="${item.name} de El Tomate Italiano" width="110" height="110" loading="lazy"/>
              ${badgeHtml}
            </div>
            <div class="card__body">
              <h3 class="card__title">${item.name}</h3>
              <p class="card__desc">${item.description}</p>
              ${tagsHtml ? `<div class="card__tags">${tagsHtml}</div>` : ""}
              ${sizesHtml}
              <div class="card__foot">
                <div class="card__price">
                  <span>Precio</span>
                  <b id="price-${item.id}">Ref ${initialPrice}</b>
                </div>
                <button class="btn btn--rosso card__add" data-id="${item.id}" data-cat="salsas">
                  <svg class="icon" aria-hidden="true"><use href="#i-plus"/></svg> Agregar
                </button>
              </div>
            </div>
          </article>
        </div>
      `;
    });

    html += `
        </div>
      </div>
    `;

    catWrap.innerHTML = html;

    // Escuchar cambios de tamaño para actualizar el precio mostrado en la tarjeta
    const allItems = [...pastichos, ...salsas];
    allItems.forEach(item => {
      if (item.hasSizes) {
        const radios = document.querySelectorAll(`input[name="size-${item.id}"]`);
        const priceLabel = document.getElementById(`price-${item.id}`);
        radios.forEach(radio => {
          radio.addEventListener("change", (e) => {
            priceLabel.innerText = `Ref ${e.target.dataset.price}`;
          });
        });
      }
    });

    // Escuchar botón de agregar al carrito
    const addBtns = catWrap.querySelectorAll(".card__add");
    addBtns.forEach(btn => {
      btn.addEventListener("click", (e) => {
        const productId = btn.getAttribute("data-id");
        const category = btn.getAttribute("data-cat");
        addToCart(productId, category, btn);
      });
    });
  }

  // Inicializar menú
  renderMenu();

  /* ═══════════ REPRODUCCIÓN DE IMÁGENES ROTAS CON PLACEHOLDERS DE ALTO DISEÑO ═══════════ */
  document.addEventListener("error", (e) => {
    if (e.target.tagName.toLowerCase() === "img") {
      const src = e.target.getAttribute("src");
      if (src.includes("dishes/")) {
        let color = "#8a1519";
        let text = "El Tomate Italiano";
        if (src.includes("pasticho-tradicional")) {
          color = "#8a1519";
          text = "Pasticho Tradicional";
        } else if (src.includes("berenjenas")) {
          color = "#c59b5f";
          text = "Pasticho Berenjenas";
        } else if (src.includes("platano")) {
          color = "#a32328";
          text = "Pasticho de Plátano";
        } else if (src.includes("pollo")) {
          color = "#3d7a45";
          text = "Pollo 4 Quesos";
        } else if (src.includes("ragu")) {
          color = "#8a1519";
          text = "Ragú de Polpette";
        } else if (src.includes("napoli")) {
          color = "#a32328";
          text = "Salsa Napoli";
        } else if (src.includes("bologna")) {
          color = "#c59b5f";
          text = "Salsa Bologna";
        } else if (src.includes("puttanesca")) {
          color = "#8a1519";
          text = "Salsa Puttanesca";
        } else if (src.includes("4quesos")) {
          color = "#3d7a45";
          text = "Salsa 4 Quesos";
        }
        
        e.target.src = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400"><rect width="100%" height="100%" fill="%23fffdf9"/><circle cx="200" cy="200" r="140" fill="${color}" opacity="0.05"/><circle cx="200" cy="200" r="100" fill="none" stroke="${color}" stroke-width="1.5" stroke-dasharray="8 6" opacity="0.2"/><circle cx="200" cy="200" r="105" fill="none" stroke="%23c59b5f" stroke-width="0.7" opacity="0.4"/><text x="50%" y="50%" font-family="Fraunces,Georgia,serif" font-style="italic" font-size="20" fill="%238a1519" text-anchor="middle" dominant-baseline="middle">${text}</text><text x="50%" y="58%" font-family="sans-serif" font-size="10" fill="%23c59b5f" text-anchor="middle" letter-spacing="4">ARTESANAL</text></svg>`;
      } else if (src.includes("emblem")) {
        e.target.src = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><circle cx="50" cy="50" r="45" fill="none" stroke="%23c59b5f" stroke-width="1.5"/><text x="50" y="55" font-size="28" text-anchor="middle">🍅</text></svg>`;
      }
    }
  }, true);

  /* ════════════════════════════════════════════════════
     3. MECÁNICA Y FLUJO DEL CARRITO DE COMPRAS
     ════════════════════════════════════════════════════ */
  const scrim = document.getElementById("scrim");
  const cartDrawer = document.getElementById("cart");
  const cartOpenBtn = document.getElementById("cartOpen");
  const bnavCartBtn = document.getElementById("bnavCart");
  const cartCloseBtn = document.getElementById("cartClose");
  const cartBody = document.getElementById("cartBody");
  const cartBadge = document.getElementById("cartBadge");
  const bnavBadge = document.getElementById("bnavBadge");
  const obCount = document.getElementById("obCount");
  const obTotal = document.getElementById("obTotal");
  const orderBar = document.getElementById("orderbar");
  
  const tSub = document.getElementById("tSub");
  const tTot = document.getElementById("tTot");
  const toCheckoutBtn = document.getElementById("toCheckout");

  // Mostrar / Ocultar Cajón de Carrito
  function openCart() {
    cartDrawer.classList.add("on");
    scrim.classList.add("on");
    orderBar.classList.remove("on");
  }

  function closeCart() {
    cartDrawer.classList.remove("on");
    scrim.classList.remove("on");
    toggleOrderBar();
  }

  cartOpenBtn.addEventListener("click", openCart);
  if (bnavCartBtn) {
    bnavCartBtn.addEventListener("click", (e) => {
      e.preventDefault();
      openCart();
    });
  }
  cartCloseBtn.addEventListener("click", closeCart);
  scrim.addEventListener("click", () => {
    closeCart();
    closeCheckout();
  });

  // Agregar al carrito
  function addToCart(productId, category, buttonElement) {
    const items = MENU_DATA[category] || [];
    const product = items.find(p => p.id === productId);
    if (!product) return;

    let cartItemId = productId;
    let sizeId = null;
    let sizeName = null;
    let price = product.price;

    // Leer tamaños seleccionados en la tarjeta
    if (product.hasSizes) {
      const selectedRadio = document.querySelector(`input[name="size-${productId}"]:checked`);
      if (selectedRadio) {
        sizeId = selectedRadio.value;
        sizeName = selectedRadio.dataset.label;
        price = parseFloat(selectedRadio.dataset.price);
        cartItemId = `${productId}-${sizeId}`;
      }
    }

    // Verificar si ya existe en el carrito
    const existing = cart.find(item => item.id === cartItemId);
    if (existing) {
      existing.quantity += 1;
    } else {
      cart.push({
        id: cartItemId,
        productId: productId,
        name: product.name,
        sizeId: sizeId,
        sizeName: sizeName,
        price: price,
        quantity: 1,
        image: product.image,
        unit: product.unit || ""
      });
    }

    // Guardar en LocalStorage
    localStorage.setItem("eti_cart", JSON.stringify(cart));

    // Animación de vuelo y UI
    animateFlyingTomato(buttonElement);
    updateCartUI();
    showToast(`Agregado: ${product.name}`);
  }

  // Animación del Elemento Volador
  function animateFlyingTomato(button) {
    const flyEl = document.getElementById("fly");
    if (!flyEl) return;

    const btnRect = button.getBoundingClientRect();
    let targetEl = cartOpenBtn;
    
    if (window.innerWidth <= 768 && bnavCartBtn) {
      targetEl = bnavCartBtn;
    }
    const targetRect = targetEl.getBoundingClientRect();

    // Posicionamiento inicial
    flyEl.style.display = "block";
    flyEl.style.left = `${btnRect.left + btnRect.width / 2 - 10}px`;
    flyEl.style.top = `${btnRect.top + btnRect.height / 2 - 10}px`;
    flyEl.style.transform = "scale(1)";
    flyEl.style.opacity = "1";

    if (window.gsap) {
      // Curva arqueada con GSAP
      gsap.to(flyEl, {
        duration: 0.8,
        left: targetRect.left + targetRect.width / 2 - 10,
        top: targetRect.top + targetRect.height / 2 - 10,
        scale: 0.4,
        opacity: 0.7,
        ease: "power2.out",
        onComplete: () => {
          flyEl.style.display = "none";
          // Vibración del botón destino
          gsap.to(targetEl, {
            duration: 0.3,
            scale: 1.15,
            yoyo: true,
            repeat: 1,
            ease: "power1.inOut"
          });
        }
      });
    } else {
      // Fallback CSS clásico si GSAP falla
      flyEl.style.transition = "all 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)";
      setTimeout(() => {
        flyEl.style.left = `${targetRect.left + targetRect.width / 2 - 10}px`;
        flyEl.style.top = `${targetRect.top + targetRect.height / 2 - 10}px`;
        flyEl.style.transform = "scale(0.3)";
        flyEl.style.opacity = "0.5";
      }, 20);
      
      setTimeout(() => {
        flyEl.style.display = "none";
        flyEl.style.transition = "none";
      }, 620);
    }
  }

  // Modificación de cantidades en el carrito
  function updateQuantity(itemId, change) {
    const item = cart.find(i => i.id === itemId);
    if (!item) return;

    item.quantity += change;
    if (item.quantity <= 0) {
      cart = cart.filter(i => i.id !== itemId);
    }

    localStorage.setItem("eti_cart", JSON.stringify(cart));
    updateCartUI();
  }

  // Eliminar un producto del carrito
  function removeFromCart(itemId) {
    cart = cart.filter(i => i.id !== itemId);
    localStorage.setItem("eti_cart", JSON.stringify(cart));
    updateCartUI();
    showToast("Producto eliminado del pedido");
  }

  // Calcular totales y redibujar interfaz del carrito
  function updateCartUI() {
    let totalItems = 0;
    let subtotal = 0;

    if (cart.length === 0) {
      cartBody.innerHTML = `
        <div class="cart-empty">
          <svg class="icon"><use href="#i-bag"/></svg>
          <p>Tu pedido está vacío por ahora.</p>
          <small style="display:block;margin-top:8px;opacity:0.6">¡Date una vuelta por el menú!</small>
        </div>
      `;
      toCheckoutBtn.disabled = true;
    } else {
      toCheckoutBtn.disabled = false;
      let html = "";
      
      cart.forEach(item => {
        totalItems += item.quantity;
        subtotal += item.price * item.quantity;

        const sizeLabel = item.sizeName ? `<span class="cart-item__size">${item.sizeName}</span>` : `<span class="cart-item__size" style="opacity:0.6">${item.unit}</span>`;

        html += `
          <div class="cart-item">
            <img class="cart-item__img" src="${item.image}" alt="${item.name}"/>
            <div class="cart-item__info">
              <h4 class="cart-item__title">${item.name}</h4>
              ${sizeLabel}
              <div class="cart-item__controls">
                <button class="cart-item__btn" onclick="window.updateCartQty('${item.id}', -1)"><svg class="icon"><use href="#i-minus"/></svg></button>
                <span class="cart-item__qty">${item.quantity}</span>
                <button class="cart-item__btn" onclick="window.updateCartQty('${item.id}', 1)"><svg class="icon"><use href="#i-plus"/></svg></button>
              </div>
            </div>
            <div class="cart-item__right">
              <span class="cart-item__price">Ref ${item.price * item.quantity}</span>
              <button class="cart-item__del" onclick="window.removeCartItem('${item.id}')">
                <svg class="icon" style="width:14px;height:14px"><use href="#i-x"/></svg> Quitar
              </button>
            </div>
          </div>
        `;
      });

      // Venta Sugerida (Upsell) inteligente en el carrito
      let upsellCandidates = [];
      const hasPastichos = cart.some(i => i.productId.includes("pasticho") || i.productId === "tradicional" || i.productId === "berenjenas" || i.productId === "platano" || i.productId === "pollo");
      
      if (hasPastichos) {
        upsellCandidates = [
          { id: "napoli", cat: "salsas", name: "Salsa Napoli (500g)", price: 6, image: "assets/dishes/salsa-napoli.webp" },
          { id: "bologna", cat: "salsas", name: "Salsa Bologna (500g)", price: 10, image: "assets/dishes/salsa-bologna.webp" }
        ];
      } else {
        upsellCandidates = [
          { id: "tradicional", cat: "pastichos", name: "Pasticho Tradicional (650g)", price: 10, image: "assets/dishes/pasticho-tradicional.webp" }
        ];
      }

      const availableUpsells = upsellCandidates.filter(u => !cart.some(c => c.productId === u.id));

      if (availableUpsells.length > 0) {
        html += `
          <div class="cart-upsell">
            <div class="cart-upsell__title">
              <svg class="icon" style="width:16px;height:16px;color:var(--oro)"><use href="#i-check"/></svg>
              <span>¿Te provoca acompañarlo? (Venta sugerida)</span>
            </div>
            <div class="cart-upsell__grid">
        `;

        availableUpsells.forEach(u => {
          html += `
            <div class="upsell-item">
              <div class="upsell-item__info">
                <img class="upsell-item__img" src="${u.image}" alt="${u.name}"/>
                <div>
                  <div class="upsell-item__name">${u.name}</div>
                  <div class="upsell-item__price">Ref ${u.price}</div>
                </div>
              </div>
              <button class="upsell-item__btn" onclick="window.addUpsellItem(event, '${u.id}', '${u.cat}')">+ Añadir</button>
            </div>
          `;
        });

        html += `
            </div>
          </div>
        `;
      }

      cartBody.innerHTML = html;
    }

    // Exponer funciones al scope global para los onclick HTML
    window.updateCartQty = updateQuantity;
    window.removeCartItem = removeFromCart;
    window.addUpsellItem = function(evt, id, category) {
      addToCart(id, category, evt.currentTarget);
    };

    // Actualizar insignias y contadores
    cartBadge.innerText = totalItems;
    if (bnavBadge) {
      bnavBadge.innerText = totalItems;
      if (totalItems > 0) bnavBadge.classList.add("on");
      else bnavBadge.classList.remove("on");
    }

    tSub.innerText = `Ref ${subtotal}`;
    tTot.innerText = `Ref ${subtotal}`;

    // Actualizar barra de pedido flotante
    if (obCount && obTotal) {
      obCount.innerText = `${totalItems} producto${totalItems !== 1 ? 's' : ''}`;
      obTotal.innerText = `Ref ${subtotal}`;
    }

    toggleOrderBar();
  }

  // Barra de pedido flotante
  function toggleOrderBar() {
    if (!orderBar) return;
    
    const isCartOpen = cartDrawer.classList.contains("on");
    const isCheckoutOpen = document.getElementById("checkout").classList.contains("on");
    const isGrazieOpen = document.getElementById("grazie").classList.contains("on");

    if (cart.length > 0 && !isCartOpen && !isCheckoutOpen && !isGrazieOpen) {
      orderBar.classList.add("on");
    } else {
      orderBar.classList.remove("on");
    }
  }

  if (orderBar) {
    orderBar.addEventListener("click", openCart);
  }

  /* ════════════════════════════════════════════════════
     4. WIZARD DE CHECKOUT EN 4 PASOS
     ════════════════════════════════════════════════════ */
  const checkoutPanel = document.getElementById("checkout");
  const coBackBtn = document.getElementById("coBack");
  const coNextBtn = document.getElementById("coNext");
  const coFill = document.getElementById("coFill");
  const coStepLbl = document.getElementById("coStepLbl");
  const coTitle = document.getElementById("coTitle");
  
  const stepDivs = document.querySelectorAll(".step");
  const modeBtns = document.querySelectorAll(".mode");

  function openCheckout() {
    cartDrawer.classList.remove("on");
    checkoutPanel.classList.add("on");
    scrim.classList.add("on");
    orderBar.classList.remove("on");
    
    // Pre-seleccionar Delivery por defecto si aún no hay modo activo
    const deliveryBtn = document.querySelector('.mode[data-mode="delivery"]');
    if (deliveryBtn && !document.querySelector('.mode.on')) {
      deliveryBtn.classList.add("on");
      checkoutMode = "delivery";
      const delOnly = document.querySelectorAll('[data-only="delivery"]');
      const pickOnly = document.querySelectorAll('[data-only="pickup"]');
      delOnly.forEach(el => { el.removeAttribute("hidden"); el.style.display = "block"; });
      pickOnly.forEach(el => { el.setAttribute("hidden", "true"); el.style.display = "none"; });
    }

    setStep(1);
  }

  function closeCheckout() {
    checkoutPanel.classList.remove("on");
    toggleOrderBar();
  }

  toCheckoutBtn.addEventListener("click", openCheckout);
  
  if (coBackBtn) {
    coBackBtn.addEventListener("click", () => {
      if (currentStep > 1) {
        setStep(currentStep - 1);
      } else {
        closeCheckout();
        openCart();
      }
    });
  }

  // Toggles de los Modos de Entrega (Paso 1)
  modeBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      modeBtns.forEach(b => b.classList.remove("on"));
      btn.classList.add("on");
      checkoutMode = btn.getAttribute("data-mode");
      
      const delOnly = document.querySelectorAll('[data-only="delivery"]');
      const pickOnly = document.querySelectorAll('[data-only="pickup"]');
      
      if (checkoutMode === "delivery") {
        delOnly.forEach(el => { el.removeAttribute("hidden"); el.style.display = "block"; });
        pickOnly.forEach(el => { el.setAttribute("hidden", "true"); el.style.display = "none"; });
        document.getElementById("datosT").innerText = "Tus datos de entrega";
        document.getElementById("datosP").innerText = "Ingresa tu dirección y contacto para coordinar el delivery.";
      } else {
        delOnly.forEach(el => { el.setAttribute("hidden", "true"); el.style.display = "none"; });
        pickOnly.forEach(el => { el.removeAttribute("hidden"); el.style.display = "block"; });
        document.getElementById("datosT").innerText = "Tus datos de contacto";
        document.getElementById("datosP").innerText = "Ingresa tu nombre y la hora estimada de tu retiro.";
      }

      setTimeout(() => {
        setStep(2);
      }, 350);
    });
  });

  const stepTitles = {
    1: "Tipo de entrega",
    2: "Tus datos",
    3: "Pago móvil",
    4: "Confirmar orden"
  };

  function setStep(stepNum) {
    currentStep = stepNum;
    
    stepDivs.forEach(div => {
      div.classList.remove("on");
      if (parseInt(div.getAttribute("data-step")) === stepNum) {
        div.classList.add("on");
      }
    });

    const pct = stepNum * 25;
    if (coFill) coFill.style.width = `${pct}%`;
    if (coStepLbl) coStepLbl.innerText = `Paso ${stepNum} de 4`;
    if (coTitle) coTitle.innerText = stepTitles[stepNum] || "";

    if (coNextBtn) {
      if (stepNum === 4) {
        coNextBtn.innerHTML = `Confirmar Pedido <svg class="icon"><use href="#i-wa"/></svg>`;
      } else {
        coNextBtn.innerHTML = `Continuar <svg class="icon"><use href="#i-arrow"/></svg>`;
      }
    }

    if (stepNum === 3) {
      const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      document.getElementById("pmMonto").innerText = `Ref ${subtotal}`;
      
      const fMonto = document.getElementById("fMonto");
      if (fMonto && !fMonto.value) {
        fMonto.value = subtotal;
      }

      document.getElementById("pmBanco").innerText = CONFIG.pagoMovil.banco;
      document.getElementById("pmTel").innerText = CONFIG.pagoMovil.telefono;
      document.getElementById("pmCi").innerText = CONFIG.pagoMovil.ci;

      populateBanks();
    }

    if (stepNum === 4) {
      renderSummary();
    }
  }

  // Continuar en el wizard
  coNextBtn.addEventListener("click", () => {
    if (currentStep === 1) {
      const activeMode = document.querySelector(".mode.on");
      if (!activeMode) {
        showToast("Selecciona Delivery o Pick up");
        return;
      }
      setStep(2);
    } else if (currentStep === 2) {
      if (validateStep2()) {
        setStep(3);
      }
    } else if (currentStep === 3) {
      if (validateStep3()) {
        setStep(4);
      }
    } else if (currentStep === 4) {
      submitOrder();
    }
  });

  // Botones rápidas en Hero Section
  document.querySelectorAll("[data-mode-cta]").forEach(cta => {
    cta.addEventListener("click", () => {
      const mode = cta.getAttribute("data-mode-cta");
      openCheckout();
      
      const targetModeBtn = document.querySelector(`.mode[data-mode="${mode}"]`);
      if (targetModeBtn) {
        targetModeBtn.click();
      }
    });
  });

  /* ═══════════ DETALLES DEL PASO 2: GEOLOCALIZACIÓN Y VALIDACIÓN (Amigable y rápida) ═══════════ */
  const geoBtn = document.getElementById("fGeo");
  
  if (geoBtn) {
    geoBtn.addEventListener("click", () => {
      geoBtn.querySelector("span").innerText = "Obteniendo coordenadas...";
      
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const lat = position.coords.latitude.toFixed(6);
            const lon = position.coords.longitude.toFixed(6);
            userGpsCoordinates = `${lat},${lon}`;
            
            geoBtn.classList.add("success");
            geoBtn.querySelector("span").innerText = "Ubicación compartida ✔";
            showToast("Coordenadas obtenidas correctamente");
          },
          (error) => {
            console.warn(error);
            geoBtn.querySelector("span").innerText = "No se pudo obtener. Ingresa la dirección detallada";
            showToast("Acceso GPS denegado. Continúa ingresando tu dirección.");
          },
          { enableHighAccuracy: true, timeout: 5000 }
        );
      } else {
        showToast("Tu navegador no soporta geolocalización.");
      }
    });
  }

  // Validación de Paso 2 (Amigable y rápida)
  function validateStep2() {
    const nombre = document.getElementById("fNombre").value.trim();
    const tel = document.getElementById("fTel").value.trim().replace(/\D/g, "");

    if (!nombre) {
      showToast("Ingresa tu nombre y apellido");
      document.getElementById("fNombre").focus();
      return false;
    }

    if (tel.length < 7) {
      showToast("Ingresa un número de celular válido (min 7 dígitos)");
      document.getElementById("fTel").focus();
      return false;
    }

    if (checkoutMode === "delivery") {
      const dir = document.getElementById("fDir").value.trim();
      if (!dir) {
        showToast("Ingresa tu dirección de entrega");
        document.getElementById("fDir").focus();
        return false;
      }
    }

    return true;
  }

  /* ═══════════ DETALLES DEL PASO 3: BANCOS Y VALIDACIÓN PERMISIVA ═══════════ */
  function populateBanks() {
    const select = document.getElementById("fBanco");
    if (!select || select.children.length > 0) return;
    
    let html = `<option value="Banco Origen">Selecciona tu banco origen...</option>`;
    CONFIG.bancosVenezuela.forEach(bank => {
      html += `<option value="${bank.name}">${bank.name}</option>`;
    });
    select.innerHTML = html;
  }

  // Botones de copiar
  document.querySelectorAll(".copy").forEach(btn => {
    btn.addEventListener("click", () => {
      const targetId = btn.getAttribute("data-copy");
      const targetEl = document.getElementById(targetId);
      if (!targetEl) return;
      
      const text = targetEl.innerText;
      navigator.clipboard.writeText(text).then(() => {
        showToast(`Copiado: ${text}`);
      }).catch(() => {
        showToast(`Copiado: ${text}`);
      });
    });
  });

  // Drag and Drop comprobantes
  const dropZone = document.getElementById("drop");
  const fileIn = document.getElementById("fFile");
  const proofPreview = document.getElementById("proof");
  const proofImg = document.getElementById("proofImg");
  const proofName = document.getElementById("proofName");
  const proofDel = document.getElementById("proofDel");

  if (dropZone && fileIn) {
    dropZone.addEventListener("click", () => fileIn.click());
    
    dropZone.addEventListener("dragover", (e) => {
      e.preventDefault();
      dropZone.classList.add("dragover");
    });
    
    dropZone.addEventListener("dragleave", () => dropZone.classList.remove("dragover"));
    
    dropZone.addEventListener("drop", (e) => {
      e.preventDefault();
      dropZone.classList.remove("dragover");
      
      if (e.dataTransfer.files.length) {
        handleReceiptFile(e.dataTransfer.files[0]);
      }
    });

    fileIn.addEventListener("change", () => {
      if (fileIn.files.length) {
        handleReceiptFile(fileIn.files[0]);
      }
    });
  }

  function handleReceiptFile(file) {
    if (!file.type.startsWith("image/")) {
      showToast("Por favor carga una imagen válida (JPG o PNG)");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      proofImg.src = e.target.result;
      proofName.innerText = file.name;
      
      dropZone.style.display = "none";
      proofPreview.style.display = "flex";
      showToast("Comprobante cargado correctamente");
    };
    reader.readAsDataURL(file);
  }

  if (proofDel) {
    proofDel.addEventListener("click", () => {
      fileIn.value = "";
      proofImg.src = "";
      proofName.innerText = "";
      
      proofPreview.style.display = "none";
      dropZone.style.display = "flex";
      showToast("Comprobante removido");
    });
  }

  // Validación de Paso 3 (Ultra fluida: permite avanzar sin bloquear al cliente)
  function validateStep3() {
    return true;
  }

  /* ═══════════ DETALLES DEL PASO 4: RESUMEN DE ORDEN ═══════════ */
  function renderSummary() {
    const sumItems = document.getElementById("sumItems");
    const sumEntrega = document.getElementById("sumEntrega");
    const sumPago = document.getElementById("sumPago");

    // Items
    let itemsHtml = "";
    let subtotal = 0;
    cart.forEach(item => {
      const priceText = item.sizeName ? `${item.sizeName}` : `${item.unit}`;
      itemsHtml += `
        <li>
          <div>${item.quantity}x <b>${item.name}</b> <small style="display:block;opacity:0.6">${priceText}</small></div>
          <span>Ref ${item.price * item.quantity}</span>
        </li>
      `;
      subtotal += item.price * item.quantity;
    });
    sumItems.innerHTML = itemsHtml + `
      <li style="border-top:1px solid var(--border-color);padding-top:10px;font-weight:700">
        <b>Total a pagar</b>
        <b style="color:var(--rosso)">Ref ${subtotal}</b>
      </li>
    `;

    // Datos de Entrega
    const nombre = document.getElementById("fNombre").value.trim();
    const tel = document.getElementById("fTel").value.trim();
    
    let entregaHtml = `
      <li><span>Cliente</span><b>${nombre}</b></li>
      <li><span>Teléfono</span><b>${tel}</b></li>
      <li><span>Método</span><b style="color:var(--rosso)">${checkoutMode === "delivery" ? "Delivery a domicilio" : "Retiro en local (Pick up)"}</b></li>
    `;

    if (checkoutMode === "delivery") {
      const dir = document.getElementById("fDir").value.trim();
      const ref = document.getElementById("fRef").value.trim() || "No especificada";
      entregaHtml += `
        <li><span>Dirección</span><b style="text-align:right;max-width:70%">${dir}</b></li>
        <li><span>Referencia</span><b style="text-align:right;max-width:70%">${ref}</b></li>
        ${userGpsCoordinates ? `<li><span>GPS</span><b style="color:var(--basilico)">Ubicación adjunta ✔</b></li>` : ""}
      `;
    } else {
      const hora = document.getElementById("fHora").value || "Por acordar";
      entregaHtml += `
        <li><span>Hora de retiro</span><b>${hora}</b></li>
      `;
    }
    sumEntrega.innerHTML = entregaHtml;

    // Datos de Pago
    const banco = document.getElementById("fBanco").value || "Por confirmar";
    const opRef = document.getElementById("fOp").value.trim() || "Pendiente";
    const ciTitular = document.getElementById("fCi").value.trim() || "N/A";
    const montoBsRef = document.getElementById("fMonto").value.trim() || subtotal;

    sumPago.innerHTML = `
      <li><span>Banco origen</span><b>${banco}</b></li>
      <li><span>Referencia</span><b>${opRef}</b></li>
      <li><span>C.I. Titular</span><b>${ciTitular}</b></li>
      <li><span>Monto reportado</span><b>Ref ${montoBsRef}</b></li>
      <li><span>Comprobante</span><b style="color:var(--basilico)">${proofImg.src ? "Imagen lista ✔" : "Adjuntar en WhatsApp"}</b></li>
    `;
  }

  /* ════════════════════════════════════════════════════
     5. PROCESAMIENTO Y ENVÍO A WHATSAPP
     ════════════════════════════════════════════════════ */
  const graciasPanel = document.getElementById("grazie");
  const graciasNum = document.getElementById("grazieNum");
  const graciasWaBtn = document.getElementById("grazieWa");
  const graciasCloseBtn = document.getElementById("grazieClose");

  function submitOrder() {
    orderNumber = `ETI-${Math.floor(1000 + Math.random() * 9000)}`;
    
    const nombre = document.getElementById("fNombre").value.trim();
    const tel = document.getElementById("fTel").value.trim();
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    const banco = document.getElementById("fBanco").value || "Por confirmar";
    const pmTel = document.getElementById("fPmTel").value.trim() || tel;
    const ci = document.getElementById("fCi").value.trim() || "N/A";
    const op = document.getElementById("fOp").value.trim() || "Por enviar";
    const monto = document.getElementById("fMonto").value.trim() || subtotal;

    let deliveryDetails = "";
    if (checkoutMode === "delivery") {
      const dir = document.getElementById("fDir").value.trim();
      const ref = document.getElementById("fRef").value.trim() || "N/A";
      deliveryDetails = `📍 *Dirección de Entrega:* ${dir}\n📌 *Punto de Referencia:* ${ref}`;
      if (userGpsCoordinates) {
        deliveryDetails += `\n🗺️ *Ubicación GPS:* https://maps.google.com/?q=${userGpsCoordinates}`;
      }
    } else {
      const hora = document.getElementById("fHora").value || "Por acordar";
      deliveryDetails = `🏪 *Hora estimada de retiro (Pick up):* ${hora}`;
    }

    let productosTexto = "";
    cart.forEach(item => {
      const sizeText = item.sizeName ? ` (${item.sizeName})` : "";
      productosTexto += `• *${item.quantity}x* ${item.name}${sizeText} — Ref ${item.price * item.quantity}\n`;
    });

    const messageText = `🍅 *NUEVO PEDIDO — EL TOMATE ITALIANO* 🍅\n` +
      `----------------------------------------\n` +
      `🆔 *Orden:* #${orderNumber}\n` +
      `👤 *Cliente:* ${nombre}\n` +
      `📞 *WhatsApp:* ${tel}\n` +
      `🛵 *Modalidad:* ${checkoutMode === "delivery" ? "Delivery a domicilio" : "Retiro en local (Pick up)"}\n` +
      `${deliveryDetails}\n\n` +
      `🛒 *Detalle de Compra:*\n` +
      `${productosTexto}\n` +
      `💵 *Total del Pedido:* *Ref ${subtotal}*\n` +
      `----------------------------------------\n` +
      `💳 *Detalles de Pago Móvil:*\n` +
      `• *Banco Origen:* ${banco}\n` +
      `• *Celular Pago:* ${pmTel}\n` +
      `• *Cédula Titular:* ${ci}\n` +
      `• *Referencia N°:* ${op}\n` +
      `• *Monto Pagado:* Ref ${monto}\n` +
      `----------------------------------------\n` +
      `⚠️ _Adjunto a este mensaje la captura de mi pago móvil._`;

    const waUrl = `https://wa.me/${CONFIG.whatsappNumber}?text=${encodeURIComponent(messageText)}`;

    graciasWaBtn.setAttribute("href", waUrl);
    
    const footWa = document.getElementById("footWa");
    if (footWa) footWa.setAttribute("href", waUrl);

    window.open(waUrl, "_blank");

    cart = [];
    localStorage.removeItem("eti_cart");
    updateCartUI();

    // Resetear formulario
    document.getElementById("fNombre").value = "";
    document.getElementById("fTel").value = "";
    if (document.getElementById("fDir")) document.getElementById("fDir").value = "";
    if (document.getElementById("fRef")) document.getElementById("fRef").value = "";
    if (document.getElementById("fHora")) document.getElementById("fHora").value = "";
    document.getElementById("fBanco").value = "";
    document.getElementById("fPmTel").value = "";
    document.getElementById("fCi").value = "";
    document.getElementById("fOp").value = "";
    document.getElementById("fMonto").value = "";
    
    if (fileIn) fileIn.value = "";
    if (proofImg) proofImg.src = "";
    if (proofName) proofName.innerText = "";
    if (proofPreview) proofPreview.style.display = "none";
    if (dropZone) dropZone.style.display = "flex";
    if (geoBtn) {
      geoBtn.classList.remove("success");
      geoBtn.querySelector("span").innerText = "Compartir mi ubicación GPS (opcional)";
    }
    userGpsCoordinates = "";

    closeCheckout();
    graciasNum.innerText = `Pedido #${orderNumber}`;
    graciasPanel.classList.add("on");

    spawnConfetti();
  }

  if (graciasCloseBtn) {
    graciasCloseBtn.addEventListener("click", () => {
      graciasPanel.classList.remove("on");
      const confettiWrap = document.getElementById("confetti");
      if (confettiWrap) confettiWrap.innerHTML = "";
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  // Confeti con paleta de color de marca
  function spawnConfetti() {
    const confettiWrap = document.getElementById("confetti");
    if (!confettiWrap) return;

    confettiWrap.innerHTML = "";
    const colors = ["#8a1519", "#a32328", "#3d7a45", "#c59b5f", "#fffdf9"];
    const piecesCount = 80;

    for (let i = 0; i < piecesCount; i++) {
      const piece = document.createElement("div");
      piece.classList.add("confetti-piece");

      const size = Math.floor(Math.random() * 8) + 6;
      const left = Math.floor(Math.random() * 100);
      const color = colors[Math.floor(Math.random() * colors.length)];
      const delay = (Math.random() * 3).toFixed(2);
      const duration = (Math.random() * 2 + 2).toFixed(2);
      const rotation = Math.floor(Math.random() * 360);

      piece.style.width = `${size}px`;
      piece.style.height = `${size}px`;
      piece.style.left = `${left}%`;
      piece.style.backgroundColor = color;
      piece.style.animationDelay = `${delay}s`;
      piece.style.animationDuration = `${duration}s`;
      piece.style.transform = `rotate(${rotation}deg)`;
      
      if (Math.random() > 0.5) {
        piece.style.borderRadius = "50%";
      }

      confettiWrap.appendChild(piece);
    }
  }

  /* ════════════════════════════════════════════════════
     6. CANVAS DE HARINA FLOTANTE (MICRO-DETALLE DE LUJO)
     ════════════════════════════════════════════════════ */
  function initFlourCanvas() {
    const canvas = document.getElementById("flour");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    let width = (canvas.width = canvas.offsetWidth);
    let height = (canvas.height = canvas.offsetHeight);

    const particles = [];
    const count = 40;

    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        r: Math.random() * 1.5 + 0.5,
        d: Math.random() * count,
        vx: Math.random() * 0.3 - 0.15,
        vy: Math.random() * 0.4 + 0.1
      });
    }

    function draw() {
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = "rgba(197, 155, 95, 0.15)"; /* Tono ocre/oro para harina flotante */
      ctx.beginPath();
      for (let i = 0; i < count; i++) {
        const p = particles[i];
        ctx.moveTo(p.x, p.y);
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2, true);

        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > width || p.y > height) {
          particles[i] = {
            x: Math.random() * width,
            y: 0,
            r: p.r,
            d: p.d,
            vx: Math.random() * 0.3 - 0.15,
            vy: Math.random() * 0.4 + 0.1
          };
        }
      }
      ctx.fill();
      requestAnimationFrame(draw);
    }

    window.addEventListener("resize", () => {
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    });

    draw();
  }

  /* ════════════════════════════════════════════════════
     7. ANIMACIONES DE INGRESO CON GSAP Y PARALLAX DE MOUSE
     ════════════════════════════════════════════════════ */
  function initEntranceAnimations() {
    if (window.gsap) {
      if (window.ScrollTrigger) {
        gsap.registerPlugin(ScrollTrigger);
      }

      // Animaciones de entrada en el Hero
      gsap.to(".hero__copy .rv", {
        duration: 1,
        y: 0,
        opacity: 1,
        stagger: 0.15,
        ease: "power3.out"
      });

      // Animación del Plato de Entrada
      gsap.fromTo(".hero__dish", {
        opacity: 0,
        scale: 0.85,
        rotate: -20
      }, {
        duration: 1.4,
        opacity: 1,
        scale: 1,
        rotate: 0,
        ease: "elastic.out(1, 0.75)",
        delay: 0.2
      });

      // Animación de las hojas de albahaca
      gsap.from(".hero__leaf--a", {
        duration: 2,
        y: -50,
        x: -30,
        rotate: -60,
        opacity: 0,
        ease: "power2.out",
        delay: 0.6
      });
      gsap.from(".hero__leaf--b", {
        duration: 2,
        y: 50,
        x: 30,
        rotate: 90,
        opacity: 0,
        ease: "power2.out",
        delay: 0.8
      });

      // ScrollTrigger para la sección de historia / Nosotros
      gsap.from(".story__card", {
        scrollTrigger: {
          trigger: ".story",
          start: "top 80%",
          toggleActions: "play none none none"
        },
        duration: 1.2,
        y: 50,
        opacity: 0,
        ease: "power3.out"
      });

      // Parallax sutil del plato de la Hero en base al scroll
      gsap.to(".hero__plate img", {
        scrollTrigger: {
          trigger: ".hero",
          start: "top top",
          end: "bottom top",
          scrub: true
        },
        y: 80,
        rotate: 45,
        ease: "none"
      });

      // Parallax de las hojas de albahaca al scroll
      gsap.to(".hero__leaf--a", {
        scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true },
        y: -120,
        x: 40,
        rotate: 35,
        ease: "none"
      });
      gsap.to(".hero__leaf--b", {
        scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true },
        y: -60,
        x: -40,
        rotate: -45,
        ease: "none"
      });

    } else {
      document.querySelectorAll(".rv").forEach(el => {
        el.style.opacity = "1";
        el.style.transform = "none";
        el.style.transition = "opacity 0.6s var(--ease-out), transform 0.6s var(--ease-out)";
      });
      const heroDish = document.querySelector(".hero__dish");
      if (heroDish) {
        heroDish.style.opacity = "1";
      }
    }

    // Parallax de Movimiento del Ratón
    const heroSection = document.querySelector(".hero");
    const plate = document.querySelector(".hero__plate");
    const leafA = document.querySelector(".hero__leaf--a");
    const leafB = document.querySelector(".hero__leaf--b");

    if (heroSection) {
      heroSection.addEventListener("mousemove", (e) => {
        const width = window.innerWidth;
        const height = window.innerHeight;
        
        const mouseX = (e.clientX / width) - 0.5;
        const mouseY = (e.clientY / height) - 0.5;

        if (plate) {
          const factor = parseFloat(plate.getAttribute("data-px")) || 1;
          const tx = mouseX * 30 * factor;
          const ty = mouseY * 30 * factor;
          plate.style.transform = `translate3d(${tx}px, ${ty}px, 0)`;
        }

        if (leafA) {
          const factor = parseFloat(leafA.getAttribute("data-px")) || 1.8;
          const tx = mouseX * 50 * factor;
          const ty = mouseY * 50 * factor;
          leafA.style.transform = `translate3d(${tx}px, ${ty}px, 0) rotate(-15deg)`;
        }

        if (leafB) {
          const factor = parseFloat(leafB.getAttribute("data-px")) || 2.4;
          const tx = mouseX * 60 * factor;
          const ty = mouseY * 60 * factor;
          leafB.style.transform = `translate3d(${tx}px, ${ty}px, 0) rotate(45deg)`;
        }
      });

      heroSection.addEventListener("mouseleave", () => {
        if (plate) plate.style.transform = "translate3d(0,0,0)";
        if (leafA) leafA.style.transform = "translate3d(0,0,0) rotate(-15deg)";
        if (leafB) leafB.style.transform = "translate3d(0,0,0) rotate(45deg)";
      });
    }
  }

  /* ════════════════════════════════════════════════════
     8. WIDGET DE TOAST FLOTANTE Y NAVEGACIÓN ACTIVA
     ════════════════════════════════════════════════════ */
  let toastTimeout;
  function showToast(message) {
    const toast = document.getElementById("toast");
    if (!toast) return;

    clearTimeout(toastTimeout);

    toast.innerHTML = `<svg class="icon" style="color:var(--basilico)"><use href="#i-check"/></svg> <span>${message}</span>`;
    toast.classList.add("on");

    toastTimeout = setTimeout(() => {
      toast.classList.remove("on");
    }, 3000);
  }

  const bnavLinks = document.querySelectorAll(".bnav__in a[data-nav]");
  bnavLinks.forEach(link => {
    link.addEventListener("click", (e) => {
      bnavLinks.forEach(l => l.classList.remove("on"));
      link.classList.add("on");
    });
  });

  const topnavLinks = document.querySelectorAll(".topnav a[data-nav]");
  topnavLinks.forEach(link => {
    link.addEventListener("click", () => {
      topnavLinks.forEach(l => l.classList.remove("on"));
      link.classList.add("on");
    });
  });

  // Inicializar UI de Carrito al cargar la página
  updateCartUI();
});
