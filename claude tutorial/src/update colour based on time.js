function updateColumnsBasedOnDuration() {
  // Get the active spreadsheet
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // Get the sheets
  var mainSheet = ss.getSheetByName('View');
  var referenceSheet = ss.getSheetByName('游戏开始时间');
  
  // Check if the sheets are found
  if (!mainSheet || !referenceSheet) {
    Logger.log("Required sheets not found.");
    return; // Exit if any sheet not found
  }
  
  // Get the start time from F1 in '游戏开始时间' sheet
  var startTime = referenceSheet.getRange('F1').getValue();
  if (!(startTime instanceof Date)) {
    Logger.log("Cell F1 in '游戏开始时间' does not contain a valid date/time. Function will not proceed.");
    return; // Exit if F1 is not a valid date/time
  }
  
  // Calculate the duration in minutes from F1 to NOW()
  var now = new Date();
  var duration = calculateDurationInMinutes(now, startTime);
  Logger.log("Game Duration in minutes: " + duration);
  
  // Define column indices and their respective thresholds
  var columnIndices = [14, 15, 16, 17]; // Column indices for N, O, P, Q
  var thresholds = [0, 60, 120, 180]; // Thresholds in minutes
  
  // Get the range from E2 downwards
  var lastRow = mainSheet.getLastRow();
  if (lastRow < 2) lastRow = 2; // Ensure at least row 2 is processed
  var eValues = mainSheet.getRange('E2:E' + lastRow).getValues(); // Get values from E2:E
  
  // Loop through each column and update accordingly
  columnIndices.forEach(function(columnIndex, idx) {
    var threshold = thresholds[idx]; // Get the specific threshold for the column
    
    var range = mainSheet.getRange(2, columnIndex, lastRow - 1);
    var values = range.getValues(); // Get the values from the range

    var startRow = -1;
    var endRow = -1;
    
    for (var i = 0; i < values.length; i++) {
      var cellValue = values[i][0];
      var eValue = eValues[i][0]; // Get the value from E2:E
      
      // Check if the threshold is reached, the cell is empty, and E column has a value
      if (cellValue === "" && duration >= threshold && eValue !== "") {
        if (startRow === -1) startRow = i + 2;
        endRow = i + 2;
        // Copy the value from E column to the respective cell in column N, O, P, or Q
        mainSheet.getRange(i + 2, columnIndex).setValue(eValue);
      }
    }
    
    // Log summary for the column
    if (startRow !== -1 && endRow !== -1) {
      Logger.log("Column " + mainSheet.getRange(1, columnIndex).getA1Notation() + ": Copied values from row " + startRow + " to row " + endRow);
    }
  });
}

// Function to calculate duration in minutes between two dates
function calculateDurationInMinutes(now, startTime) {
  // Calculate the difference in milliseconds
  var diffMs = now - startTime;
  
  // Convert milliseconds to minutes
  return Math.floor(diffMs / (1000 * 60));
}
