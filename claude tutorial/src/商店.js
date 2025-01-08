function recordBuyingTime(sheet, row) {
  var BuyingTime = new Date();
  var BuyingTimeFormatted = Utilities.formatDate(BuyingTime, Session.getScriptTimeZone(), "HH:mm:ss"); // Format time as HH:mm:ss
  if (row >= 5) {
  // Set the buying time in column B (column index 2)
  sheet.getRange(row, 1).setValue(BuyingTimeFormatted);
  }
}