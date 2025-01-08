function onEdit(e) {
  var sheet = e.range.getSheet();
  var sheetName = sheet.getName();
  var column = e.range.getColumn();
  var row = e.range.getRow();
  var value = e.range.getValue();
  var triggerColumns = [1, 3, 5]; // Columns A and E
  var triggerColumn = 1; //医疗所A

  var targetSheets = ['游戏区1', '游戏区2', '游戏区3', '游戏区4', '游戏区5', '游戏区6','商店','实验室'];

 // Handle edits in 商店 and 实验室 sheets
if ((sheetName === '商店' || sheetName === '实验室') && triggerColumns.includes(column)) {
  if (value !== "") {
    recordBuyingTime(sheet, row);
  }
}

  // Handle edits in the "医疗所" sheet
  if (sheetName === '医疗所' && column === triggerColumn) {
    if (value !== "" && row >= 5) { // Check if the value is not empty and row is 5 or below
      recordTreatmentTime(sheet, row); // Record the treatment time
    }
  }
  // Check if the edit was in the trigger column and the value is "CLEAR ZONE"
  if (triggerColumns.includes(column) && value === 'CLEAR ZONE') {
    clearZone(sheetName);
  }

  // Handle edits in the "View" sheet and in column D
  if (sheetName == 'View' && column == 4) {
    updateRow(sheet, row, value);
  }

  // Handle edits in target sheets (游戏区1-6) in columns E4:E
  if (targetSheets.includes(sheetName) && column === 5 ||11 && row >= 4) { // Column E is column 5
    handleTargetSheetEdit(sheet, row, value);
  }
}

// Function to update a row in the View sheet based on the value
function updateRow(sheet, row, value) {
  var startTime = sheet.getRange(row, 7).getValue();

  if (value === "I" || value === "AI" || value === "M" || value === "AM" || value === "AS" || value === "S") {
    if (!startTime) {
      // Set start time if it is empty
      startTime = new Date();
      sheet.getRange(row, 7).setValue(startTime);
    }
  } else if (value === "R" || value === "C") {
    // Clear start time if value is "R"
    if (startTime) {
      sheet.getRange(row, 7).clearContent(); // Clear start time in column G (7th column)
    }
  } else if (value === 'CLEAR SHEET') {
    clearSheet(sheet, 3, 200, 4, 17); // Clear range D3:Q200
  }
}

// Function to handle edits in target sheets and update the View sheet
function handleTargetSheetEdit(sheet, row, value) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var viewSheet = ss.getSheetByName('View');
  
  var match = value.match(/^([A-Z]+)(\d+)$/);
  if (!match) return;

  var letterPart = match[1];
  var numberPart = parseInt(match[2], 10);

  var lastRow = viewSheet.getLastRow();
  for (var i = 2; i <= lastRow; i++) { // Assuming data starts from row 2
    var viewSheetKey = parseInt(viewSheet.getRange(i, 1).getValue(), 10); // Column A in View sheet
    if (viewSheetKey === numberPart) {
      viewSheet.getRange(i, 4).setValue(letterPart); // Update column D in View sheet
      break;
    }
  }
}


// function timeTriggerAutoInfect() {
//   // For Auto Infect
//   var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('View');
//   var lastRow = sheet.getLastRow();
//   for (var i = 2; i <= lastRow; i++) {
//     var autoControlValue = sheet.getRange(i, 4).getValue();
//     updateRow(sheet, i, autoControlValue);
//   }
// }


/*function transferData() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sourceSheet = ss.getSheetByName('奖励处');
  
  var gameZoneSheets = {
    1: '游戏区1',
    2: '游戏区2',
    3: '游戏区3',
    4: '游戏区4',
    5: '游戏区5',
    6: '游戏区6'
  };
  
  var data = sourceSheet.getDataRange().getValues();
  var headers = data[0];
  var gameZoneData = {
    1: [],
    2: [],
    3: [],
    4: [],
    5: [],
    6: []
  };
  
  for (var i = 1; i < data.length; i++) {
    var timestamp = data[i][0];
    var gameZone = data[i][1];
    var status = data[i][headers.length - 1];
    
    if (gameZoneSheets[gameZone] && status !== 'Processed') {
      Logger.log('Start to process data for row ' + (i + 1));
      
      for (var j = 2; j <= 6; j++) {
        var winner = headers[j];
        if (data[i][j]) {
          gameZoneData[gameZone].push([timestamp, winner, data[i][j]]);
        }
      }
      for (var k = 7; k <= 11; k++) {
        var loser = headers[k];
        if (data[i][k]) {
          gameZoneData[gameZone].push([timestamp, loser, data[i][k]]);
        }
      }

      Logger.log('Data successfully gained for row ' + (i + 1));
      
      sourceSheet.getRange(i + 1, headers.length).setValue('Processed');
    }
  }
  
  for (var zone in gameZoneData) {
    if (gameZoneData[zone].length > 0) {
      var targetSheet = ss.getSheetByName(gameZoneSheets[zone]);
      Logger.log('Recording data to ' + gameZoneSheets[zone]);
      if (targetSheet) {
        var targetData = targetSheet.getDataRange().getValues();
        var targetLastRow = targetData.length;

        // Find the first empty row in the target sheet
        while (targetLastRow > 0 && targetData[targetLastRow - 1].join("") === "") {
          targetLastRow--;
        }

        var numColumns = gameZoneData[zone][0].length;
        
        targetSheet.getRange(targetLastRow + 1, 1, gameZoneData[zone].length, numColumns).setValues(gameZoneData[zone]);
        Logger.log('Data successfully written to ' + gameZoneSheets[zone]);
      } else {
        Logger.log('Target sheet not found for zone ' + zone);
      }
    } else {
      Logger.log('No data to transfer for zone ' + zone);
    }
  }
  
  Logger.log('Data transfer completed');
  */


