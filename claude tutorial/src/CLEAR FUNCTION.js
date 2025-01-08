// Function to clear a specific row and columns
function clearRow(sheet, row, startCol, endCol) {
  for (var col = startCol; col <= endCol; col++) {
    var cell = sheet.getRange(row, col);
    cell.clearContent().setBackground('white');
  }
}

// Function to clear a specific range of rows and columns
function clearSheet(sheet, startRow, endRow, startCol, endCol) {
  for (var row = startRow; row <= endRow; row++) {
    clearRow(sheet, row, startCol, endCol);
  }
}

// Function to clear content based on the sheet name
function clearZone(sheetName) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  
  var responseSheetName = '奖励处';
  var gameZone = ['游戏区1', '游戏区2', '游戏区3', '游戏区4', '游戏区5', '游戏区6', '医疗所', '实验室', '商店'];
  
  if (sheetName === responseSheetName) {
    var responseSheet = ss.getSheetByName(responseSheetName);
    if (responseSheet) {
      clearSheet(responseSheet, 2, responseSheet.getLastRow(), 1, 13); // Clear A2:M
    } else {
      Logger.log("Sheet '奖励处' not found.");
    }
  } else if (gameZone.indexOf(sheetName) !== -1) {
    var gameZoneSheet = ss.getSheetByName(sheetName);
    if (gameZoneSheet) {
      clearSheet(gameZoneSheet, 6, gameZoneSheet.getLastRow(), 1, 10); // Clear A6:J
    } else {
      Logger.log("Sheet '" + sheetName + "' not found.");
    }
  }
}