const SPREADSHEET_ID = '1cqOcMi5Ld6mF6hK-byXGrfRVFikBtErJmQJ2SwOiiEg';
const SHEET_NAME = 'Leads';

const HEADERS = [
  '時間戳記',
  '姓名',
  '聯絡電話',
  'LINE ID',
  '工程項目',
  '施工地點',
  '需求內容',
  '來源頁面',
  'User Agent',
];

function doGet(e) {
  return handleRequest_(e);
}

function doPost(e) {
  return handleRequest_(e);
}

function handleRequest_(e) {
  const params = normalizeParams_(e);

  if (params.ping) {
    return textResponse_('Success');
  }

  const name = requiredTrim_(params.name);
  const phone = requiredTrim_(params.phone);
  const lineId = optionalTrim_(params.lineId);
  const serviceType = optionalTrim_(params.serviceType);
  const location = optionalTrim_(params.location);
  const sourceUrl = optionalTrim_(params.sourceUrl || params.pageUrl);
  const userAgent = optionalTrim_(params.userAgent);
  const message = cleanMessage_(optionalTrim_(params.message), lineId);

  if (!name || !phone) {
    return textResponse_('Missing required fields', 400);
  }

  const sheet = getSheet_();
  ensureHeaders_(sheet);

  sheet.appendRow([
    new Date(),
    name,
    phone,
    lineId,
    serviceType,
    location,
    message,
    sourceUrl,
    userAgent,
  ]);

  return textResponse_('Success');
}

function getSheet_() {
  const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  return spreadsheet.getSheetByName(SHEET_NAME) || spreadsheet.insertSheet(SHEET_NAME);
}

function ensureHeaders_(sheet) {
  const firstRow = sheet.getRange(1, 1, 1, HEADERS.length).getValues()[0];
  const needsHeader = HEADERS.some((header, index) => firstRow[index] !== header);

  if (needsHeader) {
    sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
  }
}

function normalizeParams_(e) {
  if (!e || !e.parameter) {
    return {};
  }

  return e.parameter;
}

function requiredTrim_(value) {
  return String(value || '').trim();
}

function optionalTrim_(value) {
  return String(value || '').trim();
}

function cleanMessage_(message, lineId) {
  if (!message) {
    return '';
  }

  if (!lineId) {
    return message;
  }

  const lineSuffix = `LINE ID：${lineId}`;
  if (!message.includes(lineSuffix)) {
    return message;
  }

  return message
    .replace(new RegExp(`\\n?\\n?${escapeRegExp_(lineSuffix)}$`), '')
    .trim();
}

function escapeRegExp_(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function textResponse_(message, statusCode) {
  const output = ContentService.createTextOutput(message);
  output.setMimeType(ContentService.MimeType.TEXT);

  if (statusCode && typeof output.setStatusCode === 'function') {
    output.setStatusCode(statusCode);
  }

  return output;
}
