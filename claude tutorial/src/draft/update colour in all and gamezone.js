var zoneSheets = ['游戏区1', '游戏区2', '游戏区3', '游戏区4', '游戏区5', '游戏区6', '商店', 'Manual Control', '医疗所','验证自己' ]

function onEdit(e) {
  // Triggered when a user adds a new entry. Used to update on all sheet and individual game zones.
  //
  // I: Set to infected
  // S: Set to severe infection
  // R: Set to recovered
  // C: Clear one row
  // Clear All: Clear all rows
  var sheet = e.range.getSheet();
  var sheetName = sheet.getName();
  var column = e.range.getColumn();
  var row = e.range.getRow();
  
  // Handle edits in the "All" sheet and in column D
  if (sheetName == 'All' && column == 4) {
    var value = e.range.getValue();
    updateRow(sheet, row, value);
  }
  
  // Handle edits in game zone sheets and in column E
  if (zoneSheets.includes(sheetName) && column == 5) {
    reflectToAllSheet(sheet, row, e.range.getValue());
  }
}

function updateRow(sheet, row, value) {
  var startTime = sheet.getRange(row, 5).getValue();
  switch (value) {
    case "I":
    case "S":
    case "D":
      if (startTime == "") {
        startTime = new Date();
      }
      var duration = (new Date() - new Date(startTime)) / (1000 * 60); // Duration in minutes
      var severe = value === "S" || (duration >= 90 && value === "I");
      var tier2 = duration >= 30;
      var durationFormula = '=NOW()-E' + row;
      if (severe) {
        // Severe infection.
        sheet.getRange(row, 3).setValue('重度感染');
        sheet.getRange(row, 4).setBackground('red'); //.setValue(value);
        sheet.getRange(row, 5).setBackground('red').setValue(startTime);
        sheet.getRange(row, 6).setBackground('red').setFormula(durationFormula);
        sheet.getRange(row, 7).setBackground('pink');
        sheet.getRange(row, 8).setBackground('red');
      } else if (tier2) {
        // Tier 2 infection.
        sheet.getRange(row, 3).setValue('轻度感染');
        sheet.getRange(row, 4).setBackground('pink'); //.setValue(value);
        sheet.getRange(row, 5).setBackground('yellow').setValue(startTime);
        sheet.getRange(row, 6).setBackground('yellow').setFormula(durationFormula);
        sheet.getRange(row, 7).setBackground('pink');
        sheet.getRange(row, 8).clearContent();
      } else {
        // Normal infection.
        sheet.getRange(row, 3).setValue('轻度感染');
        sheet.getRange(row, 4).setBackground('pink'); //.setValue(value);
        sheet.getRange(row, 5).setBackground('yellow').setValue(startTime);
        sheet.getRange(row, 6).setBackground('yellow').setFormula(durationFormula);
        sheet.getRange(row, 7).clearContent();
        sheet.getRange(row, 8).clearContent();
      }
      break;
    case "G":
      sheet.getRange(row, 3).setValue('守卫');
      sheet.getRange(row, 4).setBackground('blue'); //.setValue(value);
      sheet.getRange(row, 5).clearContent();
      sheet.getRange(row, 6).clearContent();
      sheet.getRange(row, 7).setBackground('white');
      sheet.getRange(row, 8).setBackground('white');
      break;
    case "R":
      sheet.getRange(row, 3).setValue('平民');
      sheet.getRange(row, 4).setBackground('green'); //.setValue(value);
      sheet.getRange(row, 5).clearContent().setBackground('green');
      sheet.getRange(row, 6).clearContent().setBackground('green');
      sheet.getRange(row, 7).setBackground('white');
      sheet.getRange(row, 8).setBackground('white');
      break;
    case "C":
      clearRow(sheet, row);
      break;
    case "RESET WHOLE GAME":
      sheet.getRange(2, 3).clearContent().setBackground("white"); // Clear C2.
      var lastRow = sheet.getLastRow();
      for (var i = 4; i <= lastRow; i++)
        clearRow(sheet, i);
      for (var i = 0; i < zoneSheets.length; i++)
        clearZone(SpreadsheetApp.getActiveSpreadsheet().getSheetByName(zoneSheets[i]));
      break;
  }
}

// reflectToAllSheet handles individual game zone and maps the number inputted back to the all sheet so that the correct row in all sheet can be updated.
function reflectToAllSheet(sourceSheet, row, value) {
  // Column B is assumed to have the ID to reflect.
  var allSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('All');
  var id = sourceSheet.getRange(row, 2).getValue();
  // Find the corresponding row in the "All" sheet
  var allData = allSheet.getDataRange().getValues();
  for (var i = 3; i < allData.length; i++) {
    if (allData[i][0] === id) { // Column A in "All" sheet
      updateRow(allSheet, i + 1, value); // Update row in "All" sheet
      break;
    }
  }
}

function clearRow(sheet, row) {
  if (sheet.getRange(row, 2).getValue() === "") {
    sheet.getRange(row, 3, 1, 9).setBackground('white').clearContent();;
    return;
  }
  sheet.getRange(row, 3).setValue('平民');
  sheet.getRange(row, 4).setBackground('green').clearContent();
  for (var col = 5; col <= 11; col++) {
    sheet.getRange(row, col).setBackground('white').clearContent();
  }
}

function clearZone(sheet) {
  var lastRow = sheet.getLastRow();
  sheet.getRange(5, 2, lastRow-4, 1).clearContent().setBackground("white");
  sheet.getRange(5, 4, lastRow-4, 2).clearContent().setBackground("white");
}

function timeTriggerFunction() {
  // FIXME: This is theoretically not required but we keep it for sanity check.
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('All');
  var lastRow = sheet.getLastRow();
  for (var i = 4; i <= lastRow; i++) {
    var value = sheet.getRange(i, 4).getValue();
    updateRow(sheet, i, value);
  }
}

// checkDurations stops all trigger and updates the status of vaccination (30 min/90 min) of each player in the all sheet.
function checkDurations() {
  /*
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('All');
  var data = sheet.getDataRange().getValues();
  
  // Proceed with updating row colors based on duration
  for (var i = 3; i < data.length; i++) {
    var startTime = data[i][4]; // Column E (index 4)
    if (startTime !== '') {
      var duration = (new Date() - new Date(startTime)) / (1000 * 60); // Duration in minutes

      // Set background color of column G if duration exceeds 30 minutes
      if (duration > 30) {
        sheet.getRange(i + 1, 7).setBackground('pink');
      }

      // Set background color of column H if duration exceeds 90 minutes (1.5 hours)
      if (duration > 90) {
        sheet.getRange(i + 1, 8).setBackground('red');
        sheet.getRange(i + 1, 3).setValue('重度感染');
        sheet.getRange(i + 1, 4).setBackground('red');
      }
    }
  }
  */
}
