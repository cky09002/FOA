// Function to record treatment time in the adjacent column (B) when column A is edited
function recordTreatmentTime(sheet, row) {
  // Check if the edit is in column A (column 1) and the row is 5 or below
  if (row >= 5) {
    var time = new Date();
    var timeFormatted = Utilities.formatDate(time, Session.getScriptTimeZone(), "HH:mm:ss"); // Format time as HH:mm:ss

    // Set the treatment time in column H
    sheet.getRange(row, 8).setValue(timeFormatted);
  }
}
