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
];

const sizes = [4, 6, 8, 10, 12, 14, 16, 18];
const colors = [
    { name: "Blanco", value: "blanco", hex: "#FFFFFF" },
    { name: "Azul", value: "azul", hex: "#0066CC" },
    { name: "Rojo", value: "rojo", hex: "#CC0000" }
];

let cart = [];
let currentProductId = null;

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
            <div class="product-image">${product.emoji}</div>
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
    modalBody.innerHTML = `
        <div class="modal-product-image">${product.emoji}</div>
        <h2 class="modal-product-name">${product.name}</h2>
        <p class="modal-product-description">${product.description}</p>
        <div class="modal-product-price">${product.price}</div>
        
        <div class="modal-options">
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
                                style="background-color: ${color.hex}; border: 2px solid ${color.value === 'blanco' ? '#ccc' : color.hex}"
                                title="${color.name}">
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
        });
    });
    
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
    alert(`¡${quantity} unidad(es) agregada(s) al carrito!`);
    closeProductModal();
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
