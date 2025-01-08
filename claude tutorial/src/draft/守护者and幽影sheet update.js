function goodAndBad() {
  var allSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('All');
  var guardianSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('守护者');
  var shadowSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('幽影');
  
  // Get all data from the "All" sheet starting from row 2
  var lastRow = allSheet.getLastRow();
  var allData = allSheet.getRange(2, 1, lastRow - 1, 4).getValues(); // Columns A to D
  
  // Get the background colors of column D from the "All" sheet
  var allColors = allSheet.getRange(2, 4, lastRow - 1, 1).getBackgrounds();

  // Determine the first empty row in the target sheets (to start appending from row 3)
  var guardianStartRow = 3;
  var shadowStartRow = 3;

  // Clear existing data in the target sheets (keep headers if present)
  guardianSheet.getRange('A3:D').clearContent(); // Clear data from row 3 onwards
  shadowSheet.getRange('A3:D').clearContent(); // Clear data from row 3 onwards

  // Process each row in the "All" sheet
  for (var i = 0; i < allData.length; i++) {
    var id = allData[i][0]; // Column A
    var name = allData[i][1]; // Column B
    var status = allData[i][2]; // Column C
    var additionalInfo = allData[i][3]; // Column D
    var color = allColors[i][0]; // Background color of column D

    if (status == '平民' || status == '守卫') {
      var guardianRange = guardianSheet.getRange(guardianStartRow, 1, 1, 4);
      guardianRange.setValues([[id, name, status, additionalInfo]]);
      guardianSheet.getRange(guardianStartRow, 4).setBackground(color); // Set background color in column D
      guardianStartRow++; // Move to the next row for future data
    } else if (status == '轻度感染' || status == '重度感染') {
      var shadowRange = shadowSheet.getRange(shadowStartRow, 1, 1, 4);
      shadowRange.setValues([[id, name, status, additionalInfo]]);
      shadowSheet.getRange(shadowStartRow, 4).setBackground(color); // Set background color in column D
      shadowStartRow++; // Move to the next row for future data
    }
  }
}
