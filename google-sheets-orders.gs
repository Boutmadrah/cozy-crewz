const SPREADSHEET_ID = 'PASTE_YOUR_GOOGLE_SHEET_ID_HERE';
const ORDERS_SHEET_NAME = 'Orders';

function doPost(event) {
  try {
    const order = JSON.parse(event.postData.contents);
    validateOrder(order);

    const lock = LockService.getScriptLock();
    lock.waitLock(10000);
    try {
      const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
      const sheet = spreadsheet.getSheetByName(ORDERS_SHEET_NAME) || spreadsheet.insertSheet(ORDERS_SHEET_NAME);
      if (sheet.getLastRow() === 0) {
        sheet.appendRow([
          'Order ID', 'Date', 'Customer name', 'Phone', 'Governorate',
          'Address', 'Notes', 'Items', 'Total (EGP)'
        ]);
      }

      const items = order.items.map(item =>
        `${item.name} | size ${item.size} | qty ${item.quantity} | ${item.price * item.quantity} EGP`
      ).join('\n');
      sheet.appendRow([
        safeCell(order.orderId),
        new Date(),
        safeCell(order.customer.name),
        safeCell(order.customer.phone),
        safeCell(order.customer.governorate),
        safeCell(order.customer.address),
        safeCell(order.customer.notes || ''),
        safeCell(items),
        Number(order.total)
      ]);
    } finally {
      lock.releaseLock();
    }

    return ContentService.createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    console.error('Order could not be saved:', error);
    return ContentService.createTextOutput(JSON.stringify({ ok: false, error: error.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function validateOrder(order) {
  if (!order || !order.customer || !Array.isArray(order.items) || order.items.length === 0) {
    throw new Error('Invalid order data.');
  }
  ['name', 'phone', 'governorate', 'address'].forEach(field => {
    if (typeof order.customer[field] !== 'string' || !order.customer[field].trim()) {
      throw new Error(`Missing customer ${field}.`);
    }
  });
  if (order.items.some(item =>
    !item || typeof item.name !== 'string' || typeof item.size !== 'string' ||
    !Number.isFinite(Number(item.price)) || Number(item.price) < 0 ||
    !Number.isInteger(Number(item.quantity)) || Number(item.quantity) < 1
  )) {
    throw new Error('Invalid order items.');
  }
  if (!Number.isFinite(Number(order.total)) || Number(order.total) < 0) {
    throw new Error('Invalid order total.');
  }
}

function safeCell(value) {
  const text = String(value);
  return /^[=+\-@]/.test(text) ? `'${text}` : text;
}
