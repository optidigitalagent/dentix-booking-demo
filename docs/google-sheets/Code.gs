const DOCTORS_SHEET_NAME = "Doctors";
const PRICE_SHEET_NAME = "Price";

function doGet() {
  try {
    const spreadsheetId = PropertiesService.getScriptProperties().getProperty("DENTIX_SPREADSHEET_ID");
    if (!spreadsheetId) {
      throw new Error("Missing DENTIX_SPREADSHEET_ID script property");
    }

    const spreadsheet = SpreadsheetApp.openById(spreadsheetId);
    const payload = {
      version: 1,
      updated_at: new Date().toISOString(),
      doctors: readRows_(spreadsheet, DOCTORS_SHEET_NAME),
      price: readRows_(spreadsheet, PRICE_SHEET_NAME),
    };

    return json_(payload);
  } catch (error) {
    return json_({
      version: 1,
      updated_at: new Date().toISOString(),
      doctors: [],
      price: [],
      error: String(error && error.message ? error.message : error),
    });
  }
}

function readRows_(spreadsheet, sheetName) {
  const sheet = spreadsheet.getSheetByName(sheetName);
  if (!sheet || sheet.getLastRow() < 2 || sheet.getLastColumn() < 1) return [];

  const values = sheet.getDataRange().getDisplayValues();
  const headers = values.shift().map(function (header) {
    return String(header).trim();
  });

  return values
    .filter(function (row) {
      return row.some(function (cell) {
        return String(cell).trim() !== "";
      });
    })
    .map(function (row) {
      return headers.reduce(function (record, header, index) {
        if (header) record[header] = row[index] === undefined ? "" : row[index];
        return record;
      }, {});
    });
}

function json_(value) {
  return ContentService.createTextOutput(JSON.stringify(value)).setMimeType(
    ContentService.MimeType.JSON,
  );
}
