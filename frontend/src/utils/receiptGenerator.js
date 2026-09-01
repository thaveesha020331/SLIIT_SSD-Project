/**
 * Receipt Generator Utility
 * Generates invoice/receipt in various formats
 */

export const generateReceiptHTML = (order, paymentDetails) => {
  const currentDate = new Date();
  const formattedDate = currentDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const formattedTime = currentDate.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  const itemsHTML = order.items
    ?.map(
      (item) => `
    <tr>
      <td>${item.product?.title || 'Product'}</td>
      <td style="text-align: center;">${item.quantity}</td>
      <td style="text-align: right;">LKR ${item.priceSnapshot?.toFixed(2) || '0.00'}</td>
      <td style="text-align: right;">LKR ${(item.priceSnapshot * item.quantity).toFixed(2)}</td>
    </tr>
  `
    )
    .join('');

  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Invoice #${order._id}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #f5f5f5;
            padding: 20px;
        }
        .receipt-container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            padding: 40px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }
        .receipt-header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #84cc16;
            padding-bottom: 20px;
        }
        .company-name {
            font-size: 28px;
            font-weight: 700;
            color: #1a1a1a;
            margin-bottom: 5px;
        }
        .receipt-title {
            font-size: 18px;
            color: #666;
            margin-bottom: 10px;
        }
        .invoice-number {
            font-size: 14px;
            color: #999;
            font-family: monospace;
        }
        .receipt-info {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 30px;
            margin-bottom: 30px;
        }
        .info-section h3 {
            font-size: 12px;
            font-weight: 600;
            color: #666;
            text-transform: uppercase;
            margin-bottom: 10px;
            letter-spacing: 1px;
        }
        .info-section p {
            font-size: 14px;
            color: #1a1a1a;
            margin-bottom: 5px;
            line-height: 1.6;
        }
        .items-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }
        .items-table thead {
            background-color: #f9fdf4;
            border-top: 2px solid #84cc16;
            border-bottom: 2px solid #84cc16;
        }
        .items-table th {
            padding: 12px;
            text-align: left;
            font-weight: 600;
            color: #1a1a1a;
            font-size: 13px;
            text-transform: uppercase;
        }
        .items-table td {
            padding: 12px;
            border-bottom: 1px solid #eee;
            color: #1a1a1a;
            font-size: 14px;
        }
        .items-table tbody tr:last-child td {
            border-bottom: none;
        }
        .summary-section {
            display: flex;
            justify-content: flex-end;
            margin-bottom: 30px;
        }
        .summary-table {
            width: 100%;
            max-width: 350px;
            border-collapse: collapse;
        }
        .summary-table tr td {
            padding: 10px 20px;
            border-bottom: 1px solid #eee;
        }
        .summary-table tr.total td {
            background-color: #f9fdf4;
            border-top: 2px solid #84cc16;
            border-bottom: 2px solid #84cc16;
            font-weight: 700;
            font-size: 16px;
            color: #1a1a1a;
        }
        .summary-table tr td:first-child {
            text-align: left;
            color: #666;
        }
        .summary-table tr td:last-child {
            text-align: right;
            color: #1a1a1a;
        }
        .payment-info {
            background-color: #f9fdf4;
            border: 1px solid #d9f99d;
            border-radius: 8px;
            padding: 15px;
            margin-bottom: 20px;
        }
        .payment-info h3 {
            font-size: 13px;
            font-weight: 600;
            color: #1a1a1a;
            text-transform: uppercase;
            margin-bottom: 10px;
            letter-spacing: 1px;
        }
        .payment-info p {
            font-size: 13px;
            color: #666;
            margin-bottom: 5px;
            line-height: 1.6;
        }
        .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #eee;
            color: #999;
            font-size: 12px;
        }
        .thank-you {
            font-size: 16px;
            font-weight: 600;
            color: #84cc16;
            margin-bottom: 10px;
        }
        @media print {
            body {
                background: white;
                padding: 0;
            }
            .receipt-container {
                box-shadow: none;
                padding: 0;
            }
        }
    </style>
</head>
<body>
    <div class="receipt-container">
        <!-- Header -->
        <div class="receipt-header">
            <div class="company-name">🌿 EcoSmart</div>
            <div class="receipt-title">INVOICE / RECEIPT</div>
            <div class="invoice-number">Invoice #${order._id}</div>
        </div>

        <!-- Invoice Info -->
        <div class="receipt-info">
            <div class="info-section">
                <h3>Bill To</h3>
                <p><strong>${order.user?.name || 'Customer'}</strong></p>
                <p>${order.shippingAddress}</p>
                <p>Phone: ${order.phone}</p>
                <p>Email: ${order.user?.email || 'N/A'}</p>
            </div>
            <div class="info-section">
                <h3>Invoice Details</h3>
                <p><strong>Invoice Date:</strong><br>${formattedDate}</p>
                <p><strong>Invoice Time:</strong><br>${formattedTime}</p>
                <p><strong>Order Status:</strong><br>${order.status?.toUpperCase() || 'PENDING'}</p>
            </div>
        </div>

        <!-- Items Table -->
        <table class="items-table">
            <thead>
                <tr>
                    <th>Product</th>
                    <th style="text-align: center;">Quantity</th>
                    <th style="text-align: right;">Unit Price</th>
                    <th style="text-align: right;">Total</th>
                </tr>
            </thead>
            <tbody>
                ${itemsHTML}
            </tbody>
        </table>

        <!-- Summary -->
        <div class="summary-section">
            <table class="summary-table">
                <tr>
                    <td>Subtotal</td>
                    <td>LKR ${order.total?.toFixed(2) || '0.00'}</td>
                </tr>
                <tr>
                    <td>Shipping</td>
                    <td>LKR 0.00</td>
                </tr>
                <tr>
                    <td>Tax</td>
                    <td>LKR 0.00</td>
                </tr>
                <tr class="total">
                    <td>Total Amount</td>
                    <td>LKR ${order.total?.toFixed(2) || '0.00'}</td>
                </tr>
            </table>
        </div>

        <!-- Payment Info -->
        <div class="payment-info">
            <h3>Payment Information</h3>
            <p><strong>Payment Method:</strong> ${paymentDetails?.method === 'card' ? 'Credit/Debit Card' : 'Cash on Delivery'}</p>
            <p><strong>Payment Status:</strong> ${paymentDetails?.status?.toUpperCase() || 'COMPLETED'}</p>
            <p><strong>Transaction ID:</strong> <code>${paymentDetails?.transactionId || 'N/A'}</code></p>
            <p><strong>Payment Date:</strong> ${formattedDate} ${formattedTime}</p>
        </div>

        <!-- Footer -->
        <div class="footer">
            <div class="thank-you">Thank you for your purchase! 🌱</div>
            <p>This is a computer-generated invoice. No signature is required.</p>
            <p>For any queries, please contact us: support@ecosmart.com</p>
            <p style="margin-top: 10px;">© 2026 EcoSmart. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
  `;
};

/**
 * Download receipt as HTML file
 */
export const downloadReceiptHTML = (order, paymentDetails) => {
  try {
    const htmlContent = generateReceiptHTML(order, paymentDetails);
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', `receipt_${order._id}_${new Date().toISOString().split('T')[0]}.html`);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    return true;
  } catch (error) {
    console.error('Error downloading receipt:', error);
    return false;
  }
};

/**
 * Print receipt
 */
export const printReceipt = (order, paymentDetails) => {
  try {
    const htmlContent = generateReceiptHTML(order, paymentDetails);
    const printWindow = window.open('', '', 'height=800,width=900');
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    return true;
  } catch (error) {
    console.error('Error printing receipt:', error);
    return false;
  }
};

/**
 * Download receipt as CSV format
 */
export const downloadReceiptCSV = (order, paymentDetails) => {
  try {
    const rows = [
      ['INVOICE RECEIPT'],
      ['Invoice #', order._id],
      ['Date', new Date().toLocaleDateString()],
      [''],
      ['CUSTOMER INFORMATION'],
      ['Name', order.user?.name || 'Customer'],
      ['Email', order.user?.email || 'N/A'],
      ['Phone', order.phone],
      ['Address', order.shippingAddress],
      [''],
      ['ORDER ITEMS'],
      ['Product', 'Quantity', 'Unit Price', 'Total'],
      ...order.items?.map((item) => [
        item.product?.title || 'Product',
        item.quantity,
        item.priceSnapshot?.toFixed(2) || '0.00',
        (item.priceSnapshot * item.quantity).toFixed(2),
      ]) || [],
      [''],
      ['SUMMARY'],
      ['Subtotal', order.total?.toFixed(2) || '0.00'],
      ['Shipping', '0.00'],
      ['Tax', '0.00'],
      ['Total Amount', order.total?.toFixed(2) || '0.00'],
      [''],
      ['PAYMENT INFORMATION'],
      ['Payment Method', paymentDetails?.method === 'card' ? 'Credit/Debit Card' : 'Cash on Delivery'],
      ['Payment Status', paymentDetails?.status?.toUpperCase() || 'COMPLETED'],
      ['Transaction ID', paymentDetails?.transactionId || 'N/A'],
      [''],
      ['Thank you for your purchase!'],
    ];

    const csvContent = rows
      .map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')
      )
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', `receipt_${order._id}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    return true;
  } catch (error) {
    console.error('Error downloading receipt as CSV:', error);
    return false;
  }
};

export default {
  generateReceiptHTML,
  downloadReceiptHTML,
  printReceipt,
  downloadReceiptCSV,
};
