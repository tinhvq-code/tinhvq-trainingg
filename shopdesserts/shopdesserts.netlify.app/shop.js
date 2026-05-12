import productsData from './data.js';

// --- ĐỒNG BỘ DỮ LIỆU ---
const rawData = localStorage.getItem('productsList');
let data;

if (!rawData || rawData === "undefined" || JSON.parse(rawData).length === 0) {
    // Nếu chưa có dữ liệu trong kho, lấy từ file data.js và lưu vào localStorage
    localStorage.setItem('productsList', JSON.stringify(productsData));
    data = productsData;
} else {
    // Nếu đã có dữ liệu (đã từng thêm/sửa/xóa ở Admin), thì lấy dữ liệu đó
    data = JSON.parse(rawData);
}

function checkAdminButton() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const headerControls = document.querySelector('.header-controls');

    if (currentUser && currentUser.role === 'admin' && headerControls) {
        if (!document.getElementById('admin-btn')) {
            const adminBtn = document.createElement('a');
            adminBtn.id = 'admin-btn';
            adminBtn.href = 'admin.html';
            adminBtn.innerText = 'Quản trị';
            adminBtn.style = "background: #260f08; color: white; padding: 8px 15px; border-radius: 20px; text-decoration: none; font-size: 13px; font-weight: bold;";
            headerControls.prepend(adminBtn);
        }
    }
}
checkAdminButton();

// --- 1. KIỂM TRA ĐĂNG NHẬP ---
const currentUser = JSON.parse(localStorage.getItem('currentUser'));
if (!currentUser) { window.location.href = 'auth.html'; }

window.handleLogout = () => {
    if (confirm("Bạn có chắc chắn muốn đăng xuất không?")) {
        localStorage.removeItem('currentUser');
        window.location.href = 'auth.html';
    }
};

let cart = JSON.parse(localStorage.getItem('tempCart')) || {};

function initProducts() {
    const productElements = document.getElementById("products");
    if (!productElements) return;

    const welcomeEl = document.getElementById("user-welcome");
    if (welcomeEl) welcomeEl.innerText = `Hi, ${currentUser.username}!`;

    let html = "";
    data.forEach(product => {
        let imgSrc = (typeof product.image === 'object') ? product.image.desktop : product.image;
        const isSelected = cart[product.id] > 0;

        html += `
            <div class="product-cards" data-id='${product.id}'>
                <div class="product-image-container">
                    <img src="${imgSrc}" class="product-img" alt="${product.name}" 
                         onclick="showProductDetail(${product.id})"
                         style="border: ${isSelected ? '2px solid #c73a0f' : 'none'}; cursor: pointer;"
                         onerror="this.src='https://placehold.co/300x200?text=No+Image'">
                    
                    <button type="button" class="add-product" style="display: ${isSelected ? 'none' : 'flex'}"> 
                        <img src="./assets/images/icon-add-to-cart.svg" alt=""> Add to Cart
                    </button>

                    <div class="quantity" style="display: ${isSelected ? 'flex' : 'none'}">
                        <button type="button" class="decrease-quantity">
                            <svg width="10" height="2" viewBox="0 0 10 2"><path d="M0 .375h10v1.25H0V.375Z" fill="#fff"/></svg>
                        </button>
                        <span class="quantity-value">${cart[product.id] || 1}</span>
                        <button type="button" class="increase-quantity">
                            <svg width="10" height="10" viewBox="0 0 10 10"><path d="M10 4.375H5.625V0h-1.25v4.375H0v1.25h4.375V10h1.25V5.625H10v-1.25Z" fill="#fff"/></svg>
                        </button>
                    </div>
                </div>
                <div class="product-info" style="margin-top: 25px;">
                    <span class="product-category">${product.category}</span>
                    <p class="product-name" onclick="showProductDetail(${product.id})" style="font-weight: bold; cursor: pointer;">${product.name}</p>
                    <h4 class="product-price" style="color: #c73a0f;">$${product.price.toFixed(2)}</h4>
                </div>
            </div>`;
    });
    productElements.innerHTML = html;
    attachEventListeners();
    onCartUpdate();
}

function attachEventListeners() {
    document.querySelectorAll('.add-product').forEach(btn => {
        btn.onclick = (e) => {
            const card = e.target.closest('.product-cards');
            const id = card.dataset.id;
            cart[id] = 1;
            updateUI(id);
            onCartUpdate();
        };
    });

    document.querySelectorAll('.increase-quantity').forEach(btn => {
        btn.onclick = (e) => {
            const card = e.target.closest('.product-cards');
            const id = card.dataset.id;
            cart[id] = (cart[id] || 0) + 1;
            updateUI(id);
            onCartUpdate();
        };
    });

    document.querySelectorAll('.decrease-quantity').forEach(btn => {
        btn.onclick = (e) => {
            const card = e.target.closest('.product-cards');
            const id = card.dataset.id;
            if (cart[id] > 1) {
                cart[id] -= 1;
            } else {
                delete cart[id];
            }
            updateUI(id);
            onCartUpdate();
        };
    });
}

function updateUI(id) {
    localStorage.setItem('tempCart', JSON.stringify(cart));
    const card = document.querySelector(`.product-cards[data-id="${id}"]`);
    if (!card) return;

    const isSelected = cart[id] > 0;
    const addBtn = card.querySelector('.add-product');
    const qtyDiv = card.querySelector('.quantity');
    const img = card.querySelector('.product-img');
    const qtyVal = card.querySelector('.quantity-value');

    if (isSelected) {
        addBtn.style.display = 'none';
        qtyDiv.style.display = 'flex';
        img.style.border = '2px solid #c73a0f';
        if (qtyVal) qtyVal.innerText = cart[id];
    } else {
        addBtn.style.display = 'flex';
        qtyDiv.style.display = 'none';
        img.style.border = 'none';
    }
}

function onCartUpdate() {
    const cartItemsDiv = document.querySelector('.cart-contents');
    const totalQtySpan = document.getElementById('cart-quantity');
    const miniCartQty = document.getElementById('mini-cart-value-mobile');
    const checkoutContainer = document.getElementById('checkout-container');

    let totalQty = 0, totalPrice = 0, html = "";

    Object.keys(cart).forEach(id => {
        const product = data.find(p => p.id == id);
        if (product && cart[id] > 0) {
            totalQty += cart[id];
            totalPrice += (product.price * cart[id]);

            html += `
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 15px 0; border-bottom: 1px solid #f1eaea;">
                    <div style="text-align: left;">
                        <p style="font-weight: 700; margin: 0; font-size: 15px; color: #260f08;">${product.name}</p>
                        <div style="margin-top: 5px;">
                            <span style="color: #c73a0f; font-weight: 700;">${cart[id]}x</span>
                            <span style="color: #87635a; margin-left: 10px;">@ $${product.price.toFixed(2)}</span>
                            <span style="color: #260f08; font-weight: 700; margin-left: 10px;">$${(product.price * cart[id]).toFixed(2)}</span>
                        </div>
                    </div>
                    <button onclick="removeItem(${id})" style="background: none; border: 1px solid #ad8982; border-radius: 50%; width: 22px; height: 22px; cursor: pointer; color: #ad8982; display: flex; align-items: center; justify-content: center;">&times;</button>
                </div>`;
        }
    });

    if (totalQtySpan) totalQtySpan.innerText = totalQty;
    if (miniCartQty) miniCartQty.innerText = totalQty;

    if (totalQty > 0) {
        if (checkoutContainer) checkoutContainer.style.display = 'block';
        cartItemsDiv.innerHTML = html;
        document.getElementById('total-price-value').innerText = totalPrice.toFixed(2);
    } else {
        if (checkoutContainer) checkoutContainer.style.display = 'none';
        cartItemsDiv.innerHTML = `
            <div style="text-align: center; padding: 30px 0;">
                <img src="assets/images/illustration-empty-cart.svg" style="width: 120px; margin-bottom: 15px;">
                <p style="color: #87635a; font-weight: 600;">Your added items will appear here</p>
            </div>`;
    }
}

window.removeItem = (id) => {
    delete cart[id];
    updateUI(id);
    onCartUpdate();
}

const confirmBtn = document.getElementById('confirm-order');
const confirmPopup = document.getElementById('confirm-popup');

if (confirmBtn) {
    confirmBtn.onclick = () => {
        if (Object.keys(cart).length === 0) return;
        if (confirmPopup) confirmPopup.style.display = 'flex';
    };
}

window.closeConfirmPopup = () => { if (confirmPopup) confirmPopup.style.display = 'none'; };

window.processOrder = () => {
    const boughtItems = Object.keys(cart).filter(id => cart[id] > 0).map(id => {
        const p = data.find(i => i.id == id);
        const thumb = (typeof p.image === 'object') ? p.image.thumbnail : p.image;
        return { name: p.name, qty: cart[id], price: p.price, image: thumb };
    });

    let total = boughtItems.reduce((s, i) => s + (i.price * i.qty), 0);
    const history = JSON.parse(localStorage.getItem('orderHistory')) || [];
    history.unshift({
        userId: currentUser.id,
        orderId: "#" + Math.floor(Math.random() * 100000),
        date: new Date().toLocaleString(),
        items: boughtItems,
        total: total
    });
    localStorage.setItem('orderHistory', JSON.stringify(history));

    if (confirmPopup) confirmPopup.style.display = 'none';
    showConfirmModal(boughtItems, total);
};

function showConfirmModal(items, total) {
    const modal = document.getElementById('success-modal');
    if (!modal) return;
    const modalBox = modal.querySelector('.modal');
    modal.style.display = 'flex';
    modal.classList.remove('hide');

    modalBox.innerHTML = `
        <img src="./assets/images/icon-order-confirmed.svg" style="width: 40px; margin-bottom: 20px;">
        <h1 style="font-size: 32px; margin-bottom: 8px;">Đặt hàng thành công</h1>
        <p style="color: #87635a; margin-bottom: 30px;">Chúc bạn ngon miệng, ${currentUser.username}!</p>
        <div style="background: #fcf8f7; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
            <div style="max-height: 220px; overflow-y: auto;">
                ${items.map(i => `
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; border-bottom: 1px solid #f1eaea; padding-bottom: 16px;">
                        <div style="display: flex; gap: 12px; align-items: center;">
                            <img src="${i.image}" style="width: 50px; border-radius: 4px;">
                            <div style="text-align: left;">
                                <p style="margin: 0; font-weight: bold; font-size: 14px;">${i.name}</p>
                                <span style="color: #c73a0f; font-weight: bold;">${i.qty}x</span> <span style="color: #87635a;">@ $${i.price.toFixed(2)}</span>
                            </div>
                        </div>
                        <span style="font-weight: bold;">$${(i.price * i.qty).toFixed(2)}</span>
                    </div>
                `).join('')}
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 20px;">
                <span style="color: #260f08;">Tổng tiền </span>
                <span style="color: #260f08; font-size: 24px; font-weight: bold;">$${total.toFixed(2)}</span>
            </div>
        </div>
        <button id="btn-new-order" style="width: 100%; background: #c73a0f; color: white; border: none; padding: 16px; border-radius: 30px; cursor: pointer; font-weight: bold; font-size: 16px;">Đóng</button>
    `;

    document.getElementById('btn-new-order').onclick = () => {
        localStorage.removeItem('tempCart');
        window.location.reload();
    };
}

window.showProductDetail = (id) => {
    const product = data.find(p => p.id == id);
    const modal = document.getElementById('success-modal');
    if (!modal) return;
    const modalBox = modal.querySelector('.modal');
    modal.style.display = 'flex';
    modal.classList.remove('hide');
    let imgSrc = (typeof product.image === 'object') ? product.image.desktop : product.image;
    modalBox.innerHTML = `
        <div style="text-align: center;">
            <img src="${imgSrc}" style="width:100%; border-radius:8px;">
            <h2 style="margin: 15px 0;">${product.name}</h2>
            <p style="text-align: left; background: #fcf8f7; padding: 15px; border-radius: 8px; color: #87635a;">${product.description || "Hương vị tuyệt vời."}</p>
            <button onclick="document.getElementById('success-modal').style.display='none'" style="background: #c73a0f; color: white; border: none; padding: 12px 30px; border-radius: 25px; cursor: pointer; margin-top: 20px; font-weight: bold;">Đóng</button>
        </div>
    `;
};

initProducts();