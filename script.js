const products = [
    {
        id: 1,
        name: "Remera Básica",
        description: "Remera de algodón 100% premium, cómoda y suave.",
        price: "$15.00",
        emoji: "👕"
    },
    {
        id: 2,
        name: "Pantalón Deportivo",
        description: "Pantalón deportivo con cintura elástica, ideal para mayoristas.",
        price: "$25.00",
        emoji: "👖"
    },
    {
        id: 3,
        name: "Buzo con Capucha",
        description: "Buzo de algodón con capucha, perfecto para temporada invernal.",
        price: "$35.00",
        emoji: "🧥"
    },
    {
        id: 4,
        name: "Short Deportivo",
        description: "Short deportivo cómodo y resistente, ideal para verano.",
        price: "$18.00",
        emoji: "🩳"
    },
    {
        id: 5,
        name: "Campera de Abrigo",
        description: "Campera acolchada para invierno, excelente calidad mayorista.",
        price: "$45.00",
        emoji: "🧶"
    },
    {
        id: 6,
        name: "Pantalón Cargo",
        description: "Pantalón cargo con múltiples bolsillos, muy práctico.",
        price: "$28.00",
        emoji: "👔"
    }
    ,
    {
        id: 7,
        name: "Buso Escolar",
        description: "Buso escolar cómodo y resistente. Talles 4 al 16.",
        price: "$7000.00",
        emoji: "🧥",
        images: {
            "rojo": ["img/Gemini_Generated_Image_ga2t1fga2t1fga2t.png"],
            "azul-marino": ["img/Gemini_Generated_Image_h93ofch93ofch93o.png"],
            "gris": ["img/Gemini_Generated_Image_vwhpz7vwhpz7vwhp.png"]
        }
    }
];

const sizes = [4, 6, 8, 10, 12, 14, 16];
const colors = [
    { name: "Rojo", value: "rojo", hex: "#CC0000" },
    { name: "Azul Marino", value: "azul-marino", hex: "#0A2342" },
    { name: "Gris", value: "gris", hex: "#808080" }
];

let cart = [];
let currentProductId = null;

// Función para mostrar notificación flotante
function showNotification(message) {
    const notification = document.getElementById('notification');
    const notificationText = document.getElementById('notificationText');

    notificationText.textContent = message;
    notification.classList.add('show');

    // Ocultar automáticamente después de 3 segundos
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

// Funciones para localStorage
function loadCart() {
    const cartData = localStorage.getItem('cart');
    return cartData ? JSON.parse(cartData) : [];
}

function saveCart(cartArray) {
    localStorage.setItem('cart', JSON.stringify(cartArray));
}

// Cargar carrito al iniciar
cart = loadCart();

function renderProducts(productsToRender) {
    const catalog = document.getElementById('catalog');
    
    if (!catalog) {
        console.error('No se encontró el elemento catalog');
        return;
    }
    
    if (productsToRender.length === 0) {
        catalog.innerHTML = '<div class="no-results">No se encontraron productos</div>';
        return;
    }

    catalog.innerHTML = productsToRender.map(product => `
        <div class="product-card" onclick="openProductModal(${product.id})">
            <div class="product-image">${product.images ? (typeof product.images === 'object' && !Array.isArray(product.images) ? product.images[Object.keys(product.images)[0]][0] : product.images[0]) ? `<img src="${(typeof product.images === 'object' && !Array.isArray(product.images) ? product.images[Object.keys(product.images)[0]][0] : product.images[0])}" alt="${product.name}">` : product.emoji : product.emoji}</div>
            <div class="product-name">${product.name}</div>
            <div class="product-description">${product.description}</div>
            <div class="product-price">${product.price}</div>
            <div class="product-click-hint">👆 Toca para seleccionar talle y color</div>
        </div>
    `).join('');
}

function openProductModal(productId) {
    const product = products.find(p => p.id === productId);
    currentProductId = productId;
    
    const modalBody = document.getElementById('modalBody');
    // Determinar imagen inicial: sólo si `images` es un array (no map por color)
    const initialImageSrc = product.images ? (Array.isArray(product.images) ? product.images[0] : null) : null;

    // Estructura: imagen a la izquierda, opciones a la derecha
    modalBody.innerHTML = `
        <div class="modal-row">
            <div class="modal-media">
                <div class="modal-product-image">${initialImageSrc ? `<img id="modal-main-image-${productId}" src="${initialImageSrc}" alt="${product.name}">` : product.emoji}</div>
                <div class="modal-thumbs">${initialImageSrc && Array.isArray(product.images) ? product.images.map((src,i)=>`<img class="modal-thumb" src="${src}" alt="${product.name} ${i+1}" data-index="${i}">`).join('') : ''}</div>
            </div>

            <div class="modal-options">
                <h2 class="modal-product-name">${product.name}</h2>
                <p class="modal-product-description">${product.description}</p>
                <div class="modal-product-price">${product.price}</div>
            <div class="option-group">
                <label>Talle:</label>
                <div class="size-selector">
                    ${sizes.map(size => `
                        <button type="button" 
                                class="size-btn" 
                                data-size="${size}"
                                data-product="${productId}">
                            ${size}
                        </button>
                    `).join('')}
                </div>
            </div>
            
            <div class="option-group">
                <label>Color:</label>
                <div class="color-selector">
                    ${colors.map(color => `
                        <button type="button" 
                                class="color-btn modal-color-btn" 
                                data-color="${color.value}"
                                data-product="${productId}"
                                ${product.images && typeof product.images === 'object' && !Array.isArray(product.images) && product.images[color.value] && product.images[color.value].length ? '' : `style="background-color: ${color.hex}; border: 2px solid ${color.value === 'blanco' ? '#ccc' : color.hex}"`}
                                title="${color.name}">
                            ${product.images && typeof product.images === 'object' && !Array.isArray(product.images) && product.images[color.value] && product.images[color.value].length ? `<img src="${product.images[color.value][0]}" alt="${color.name}">` : ''}
                        </button>
                    `).join('')}
                </div>
            </div>
            
            <div class="option-group">
                <label>Cantidad:</label>
                <div class="quantity-selector">
                    <button type="button" class="qty-btn minus" data-product="${productId}">-</button>
                    <input type="number" 
                           class="quantity-input" 
                           id="modal-qty-${productId}" 
                           value="0" 
                           min="0" 
                           readonly>
                    <button type="button" class="qty-btn plus" data-product="${productId}">+</button>
                </div>
            </div>
            
            <button class="modal-add-button" onclick="addToCartFromModal(${productId})">
                Agregar al Carrito
            </button>
        </div>
    `;
    
    // Mostrar modal
    document.getElementById('modalOverlay').classList.add('open');
    
    // Event listeners para botones de talle en el modal
    document.querySelectorAll('.size-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const productId = parseInt(this.dataset.product);
            document.querySelectorAll(`.size-btn[data-product="${productId}"]`).forEach(b => {
                b.classList.remove('selected');
            });
            this.classList.add('selected');
        });
    });
    
    // Event listeners para botones de color en el modal
    document.querySelectorAll('.modal-color-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const productId = parseInt(this.dataset.product);
            document.querySelectorAll(`.modal-color-btn[data-product="${productId}"]`).forEach(b => {
                b.classList.remove('selected');
            });
            this.classList.add('selected');

            // Actualizar imagen principal y miniaturas según el color seleccionado
            const colorVal = this.dataset.color;
            const modalBodyEl = document.getElementById('modalBody');
            const mainImg = document.getElementById(`modal-main-image-${productId}`);
            if (product.images && typeof product.images === 'object' && !Array.isArray(product.images)) {
                const imgs = product.images[colorVal] || [];
                if (imgs.length > 0) {
                    if (mainImg) {
                        mainImg.src = imgs[0];
                    } else {
                        const mediaEl = modalBodyEl.querySelector('.modal-product-image');
                        if (mediaEl) {
                            mediaEl.innerHTML = `<img id="modal-main-image-${productId}" src="${imgs[0]}" alt="${product.name}">`;
                        }
                    }
                }

                const thumbsContainer = modalBodyEl.querySelector('.modal-thumbs');
                if (thumbsContainer) {
                    thumbsContainer.innerHTML = imgs.map((src,i) => `<img class="modal-thumb" src="${src}" alt="${product.name} ${i+1}" data-index="${i}">`).join('');
                    // reattach listeners a las miniaturas
                    thumbsContainer.querySelectorAll('.modal-thumb').forEach(t => {
                        t.addEventListener('click', function(ev) {
                            ev.stopPropagation();
                            if (mainImg) mainImg.src = this.src;
                            thumbsContainer.querySelectorAll('.modal-thumb').forEach(x => x.classList.remove('selected'));
                            this.classList.add('selected');
                        });
                    });
                }
            } else if (mainImg && product.images && product.images[0]) {
                mainImg.src = product.images[0];
            }
        });
    });

    // Preseleccionar siempre el primer color del producto y disparar su click
    const firstColorBtn = document.querySelector(`.modal-color-btn[data-product="${productId}"]`);
    if (firstColorBtn) {
        // ejecutar click para que el handler actualice imagenes y miniaturas
        firstColorBtn.click();
    }
    
    // Event listeners para cantidad en el modal
    document.querySelector(`.qty-btn.plus[data-product="${productId}"]`).addEventListener('click', function(e) {
        e.stopPropagation();
        const input = document.getElementById(`modal-qty-${productId}`);
        input.value = parseInt(input.value) + 1;
    });
    
    document.querySelector(`.qty-btn.minus[data-product="${productId}"]`).addEventListener('click', function(e) {
        e.stopPropagation();
        const input = document.getElementById(`modal-qty-${productId}`);
        if (parseInt(input.value) > 0) {
            input.value = parseInt(input.value) - 1;
        }
    });

    // Miniaturas: click cambia imagen principal y marca la miniatura seleccionada
    const modalBodyEl = document.getElementById('modalBody');
    const thumbs = modalBodyEl.querySelectorAll('.modal-thumb');
    if (thumbs && thumbs.length > 0) {
        thumbs.forEach(thumb => {
            thumb.addEventListener('click', function(e) {
                e.stopPropagation();
                const mainImg = document.getElementById(`modal-main-image-${productId}`);
                if (mainImg) mainImg.src = this.src;
                // remover selected de todas las miniaturas dentro del modal
                modalBodyEl.querySelectorAll('.modal-thumb').forEach(t => t.classList.remove('selected'));
                this.classList.add('selected');
            });
        });
    }
}

function closeProductModal() {
    document.getElementById('modalOverlay').classList.remove('open');
    currentProductId = null;
}

function addToCartFromModal(productId) {
    const product = products.find(p => p.id === productId);
    const selectedSizeBtn = document.querySelector(`.size-btn.selected[data-product="${productId}"]`);
    const quantityInput = document.getElementById(`modal-qty-${productId}`);
    const selectedColorBtn = document.querySelector(`.modal-color-btn.selected[data-product="${productId}"]`);
    
    const size = selectedSizeBtn ? selectedSizeBtn.dataset.size : null;
    const quantity = parseInt(quantityInput.value);
    const color = selectedColorBtn ? selectedColorBtn.dataset.color : null;
    
    if (!size) {
        alert('Por favor selecciona un talle');
        return;
    }
    
    if (!color) {
        alert('Por favor selecciona un color');
        return;
    }
    
    if (quantity <= 0) {
        alert('Por favor ingresa una cantidad mayor a 0');
        return;
    }
    
    // Buscar si ya existe este producto con mismo talle y color
    const existingIndex = cart.findIndex(item => 
        item.productId === productId && 
        item.size === size && 
        item.color === color
    );
    
    if (existingIndex >= 0) {
        cart[existingIndex].quantity += quantity;
    } else {
        const colorName = colors.find(c => c.value === color).name;
        cart.push({
            productId: productId,
            productName: product.name,
            size: size,
            color: color,
            colorName: colorName,
            quantity: quantity,
            price: product.price
        });
    }
    
    // Guardar en localStorage
    saveCart(cart);
    
    // Resetear formulario
    quantityInput.value = 0;
    document.querySelectorAll(`.size-btn[data-product="${productId}"]`).forEach(b => {
        b.classList.remove('selected');
    });
    document.querySelectorAll(`.modal-color-btn[data-product="${productId}"]`).forEach(b => {
        b.classList.remove('selected');
    });
    
    updateCart();
    showNotification(`¡${quantity} unidad(es) agregada(s) al carrito!`);
}

function updateCart() {
    // Recargar carrito desde localStorage
    cart = loadCart();
    
    // Solo actualizar el contador del botón flotante
    const cartCount = document.getElementById('cartCount');
    if (cartCount) {
        cartCount.textContent = cart.reduce((sum, item) => sum + item.quantity, 0);
    }
}

function removeFromCart(index) {
    cart.splice(index, 1);
    saveCart(cart);
    updateCart();
}

function removeGroup(key) {
    // Remover todos los items de este grupo
    const [productId, color] = key.split('-');
    cart = cart.filter(item => !(item.productId == productId && item.color === color));
    saveCart(cart);
    updateCart();
}

function removeSizeFromGroup(key, size) {
    // Remover solo los items de este grupo con este talle
    const [productId, color] = key.split('-');
    cart = cart.filter(item => !(item.productId == productId && item.color === color && item.size == size));
    saveCart(cart);
    updateCart();
}

function sendToWhatsApp() {
    const cart = loadCart();
    if (cart.length === 0) return;
    
    // Agrupar por producto y color
    const grouped = {};
    cart.forEach(item => {
        const key = `${item.productName} - ${item.colorName}`;
        if (!grouped[key]) {
            grouped[key] = {};
        }
        if (!grouped[key][item.size]) {
            grouped[key][item.size] = 0;
        }
        grouped[key][item.size] += item.quantity;
    });
    
    let message = `🦆 *PEDIDO - LOS 2 PATITOS* 🦆\n\n`;
    message += `*DETALLE DEL PEDIDO:*\n\n`;
    
    Object.keys(grouped).forEach(productKey => {
        message += `*${productKey}*\n`;
        const sizes = grouped[productKey];
        Object.keys(sizes).sort((a, b) => parseInt(a) - parseInt(b)).forEach(size => {
            message += `  Talle ${size}: ${sizes[size]} unidad(es)\n`;
        });
        message += `\n`;
    });
    
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    message += `*TOTAL: ${totalItems} unidad(es)*\n\n`;
    message += `Gracias por tu pedido! 🛍️`;
    
    // Codificar el mensaje para URL
    const encodedMessage = encodeURIComponent(message);
    
    // Número de WhatsApp (cambiar por el número real)
    const whatsappNumber = "5491112345678"; // Formato: código país + número sin espacios ni guiones
    
    // Abrir WhatsApp
    window.open(`https://wa.me/${whatsappNumber}?text=${encodedMessage}`, '_blank');
}

function searchProducts() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    
    const filteredProducts = products.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchTerm) ||
                            product.description.toLowerCase().includes(searchTerm);
        return matchesSearch;
    });

    renderProducts(filteredProducts);
}

// Función para inicializar todo
function init() {
    // Event listeners
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', searchProducts);
    }


    const closeModal = document.getElementById('closeModal');
    if (closeModal) {
        closeModal.addEventListener('click', closeProductModal);
    }


    const modalOverlay = document.getElementById('modalOverlay');
    if (modalOverlay) {
        modalOverlay.addEventListener('click', function(e) {
            if (e.target === this) {
                closeProductModal();
            }
        });
    }

    // Render inicial
    renderProducts(products);
    
    // Actualizar contador del carrito
    updateCart();
}

// Esperar a que el DOM esté listo o ejecutar inmediatamente si ya está listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    // DOM ya está listo
    init();
}
