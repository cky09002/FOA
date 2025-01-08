// updateColorsBasedOnTimeDiff caches the status of all players at each hour.
function updateColorsBasedOnTimeDiff() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('All');
  
  // Get the value of cell C2
  var c2Value = sheet.getRange('C2').getValue();
  if (c2Value === '') {
    var lastRow = sheet.getLastRow();
    // Clear shown colours.
    sheet.getRange(4, 9, lastRow-4, 3).clearContent().setBackground("white");
    // Clear cached colours.
    sheet.getRange(4, 13, lastRow-4, 3).clearContent().setBackground("white");
    return
  }
  var hoursSinceStart = (new Date() - new Date(c2Value)) / (1000 * 60 * 60); // Difference in hours

  // Loop through all rows to update colors
  var lastRow = sheet.getLastRow();
  for (var row = 4; row <= lastRow; row++) {
    for (var i = 0; i < 3; i++) {
      if (hoursSinceStart >= i+1) {
        // In the past. Set the background color of column I, J, K to match M, N, O if it is the time.
        var savedColor = sheet.getRange(row, 13+i).getBackground();
        sheet.getRange(row, 9+i).setBackground(savedColor).clearContent();
      } else if (hoursSinceStart > i) {
        // Current hour.
        // Set the background color of column M, N or O to match column D
        var currentRoleColor = sheet.getRange(row, 4).getBackground();
        sheet.getRange(row, 13 + i).setBackground(currentRoleColor);
        sheet.getRange(row, 9+i).setBackground("white").clearContent();
      } else {
        // If in the future, clear background.
        sheet.getRange(row, 9+i).setBackground("white").clearContent();
      }
    }
  }
}

