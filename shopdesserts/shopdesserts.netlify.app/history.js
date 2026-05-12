document.addEventListener('DOMContentLoaded', () => {
    const historyList = document.getElementById('history-list');
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));

    if (!currentUser) {
        window.location.href = 'auth.html';
        return;
    }

    const allHistory = JSON.parse(localStorage.getItem('orderHistory')) || [];

    // LỌC: Đơn nào có userId trùng với ID của người đang login thì mới hiện
    const myHistory = allHistory.filter(order => order.userId === currentUser.id);

    if (myHistory.length === 0) {
        historyList.innerHTML = `<p style="text-align:center; margin-top:50px;">Bạn chưa có đơn hàng nào thành công.</p>`;
        return;
    }

    historyList.innerHTML = myHistory.map(order => `
        <div class="order-card" style="background:white; border-radius:12px; padding:20px; margin-bottom:20px; box-shadow:0 2px 10px rgba(0,0,0,0.05);">
            <div style="display:flex; justify-content:space-between; border-bottom:1px solid #f1eaea; padding-bottom:10px; margin-bottom:15px;">
                <span style="font-weight:bold;">Mã đơn: ${order.orderId}</span>
                <span style="color:#87635a;">${order.date}</span>
            </div>
            <div>
                ${order.items.map(item => {
        let fileName = item.image.split('/').pop().replace('-thumbnail.jpg', '-desktop.jpg');
        let fixedImg = `assets/images/${fileName}`;
        return `
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px;">
                            <div style="display:flex; align-items:center; gap:15px;">
                                <img src="${fixedImg}" style="width:50px; height:50px; border-radius:6px; object-fit:cover;" onerror="this.src='assets/images/image-waffle-desktop.jpg'">
                                <div><p style="margin:0; font-weight:bold;">${item.name}</p>
                                <span style="color:#c73a0f; font-weight:bold;">${item.qty}x</span></div>
                            </div>
                            <span style="font-weight:bold;">$${(item.qty * item.price).toFixed(2)}</span>
                        </div>`;
    }).join('')}
            </div>
            <div style="display:flex; justify-content:space-between; margin-top:15px; padding-top:15px; border-top:1px dashed #ad8982;">
                <span>Tổng cộng</span><span style="font-size:1.2em; font-weight:bold;">$${order.total.toFixed(2)}</span>
            </div>
        </div>
    `).join('');
});