export const printInvoice = (order, t, i18n) => {
  const isPaid = order.paymentStatus === "Paid" || order.paymentStatus === "PAID";
  const codAmount = isPaid ? 0 : order.totalAmount;
  
  const printLng = i18n.language === "vi" ? "vi" : "en";
  
  const printWindow = window.open("", "_blank");
  printWindow.document.write(`
    <html>
      <head>
        <title>Phiếu Giao Hàng - ${order.orderCode}</title>
        <style>
          @page { margin: 0; }
          body { font-family: sans-serif; padding: 40px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          .header { text-align: center; margin-bottom: 20px; border-bottom: 2px dashed #000; padding-bottom: 20px; }
          .info-block { display: flex; justify-content: space-between; margin-bottom: 20px; }
          .info-block > div { width: 48%; }
          .cod-block { text-align: right; margin-top: 20px; border: 2px solid #000; padding: 15px; display: inline-block; float: right; border-radius: 8px; }
          .clearfix::after { content: ""; clear: both; display: table; }
        </style>
      </head>
      <body>
        <div class="header">
          <h2>${t("admin:orders.print.title", { lng: printLng, defaultValue: "PHIẾU GIAO HÀNG (SHIPPING LABEL)" })}</h2>
          <p>${t("admin:orders.print.order_code", { lng: printLng, defaultValue: "Mã đơn" })}: <strong>${order.orderCode}</strong></p>
        </div>
        
        <div class="info-block">
          <div>
            <h3>${t("admin:orders.print.sender", { lng: printLng, defaultValue: "NGƯỜI GỬI:" })}</h3>
            <p><strong>${t("admin:orders.print.shop", { lng: printLng, defaultValue: "Shop:" })}</strong> MKHE Heritage</p>
            <p><strong>${t("admin:orders.print.phone", { lng: printLng, defaultValue: "Điện thoại:" })}</strong> 090 123 4567</p>
            <p><strong>${t("admin:orders.print.address", { lng: printLng, defaultValue: "Địa chỉ:" })}</strong> Trung tâm Kho vận MKHE, TP. Hồ Chí Minh</p>
          </div>
          <div>
            <h3>${t("admin:orders.print.receiver", { lng: printLng, defaultValue: "NGƯỜI NHẬN:" })}</h3>
            <p><strong>${t("admin:orders.print.customer", { lng: printLng, defaultValue: "Khách hàng:" })}</strong> ${order.shippingInfo.name}</p>
            <p><strong>${t("admin:orders.print.phone", { lng: printLng, defaultValue: "Điện thoại:" })}</strong> ${order.shippingInfo.phone}</p>
            <p><strong>${t("admin:orders.print.address", { lng: printLng, defaultValue: "Địa chỉ:" })}</strong> ${order.shippingInfo.address}</p>
            ${order.shippingInfo.note ? `<p><strong>${t("admin:orders.print.note", { lng: printLng, defaultValue: "Ghi chú:" })}</strong> ${order.shippingInfo.note}</p>` : ''}
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>${t("admin:orders.print.product", { lng: printLng, defaultValue: "Sản phẩm" })}</th>
              <th>${t("admin:orders.print.quantity", { lng: printLng, defaultValue: "Số lượng" })}</th>
              <th>${t("admin:orders.print.unit_price", { lng: printLng, defaultValue: "Đơn giá" })}</th>
              <th>${t("admin:orders.print.total", { lng: printLng, defaultValue: "Thành tiền" })}</th>
            </tr>
          </thead>
          <tbody>
            ${order.items.map(i => `
              <tr>
                <td>${i.name}</td>
                <td>${i.quantity}</td>
                <td>${i.price.toLocaleString()}đ</td>
                <td>${(i.price * i.quantity).toLocaleString()}đ</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <div class="clearfix">
          <h3 style="text-align: right; margin-top: 20px;">${t("admin:orders.print.total_amount", { lng: printLng, defaultValue: "Tổng tiền đơn hàng:" })} ${order.totalAmount.toLocaleString()}đ</h3>
          <div class="cod-block">
            <p style="margin: 0 0 5px 0;">${t("admin:orders.print.payment_method", { lng: printLng, defaultValue: "Phương thức thanh toán:" })} <strong>${order.paymentMethod}</strong></p>
            <h2 style="margin: 0; color: #000;">${t("admin:orders.print.cod", { lng: printLng, defaultValue: "TIỀN THU HỘ (COD):" })} ${codAmount.toLocaleString()}đ</h2>
          </div>
        </div>

        <script>
          window.onload = () => { setTimeout(() => { window.print(); window.close(); }, 500); }
        </script>
      </body>
    </html>
  `);
  printWindow.document.close();
};
