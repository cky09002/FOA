function checkAndUpdate() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('ALL');
  const cellValue = sheet.getRange('C2').getValue();
  
  // Check if C2 is not blank
  if (cellValue !== '') {
    // Check if 3 hours have passed since the timestamp in C2
    const now = new Date();
    const timestamp = new Date(cellValue);
    const timeDiff = now - timestamp; // Difference in milliseconds
    const threeHoursInMillis = 3 * 60 * 60 * 1000; // 3 hours in milliseconds
    
    if (timeDiff < threeHoursInMillis) {
      // Proceed with updating values if less than 3 hours
      updateValues();
    } else {
      // If more than 3 hours, stop triggers
      deleteCheckAndUpdateTimeTrigger();
    }
  }
}

function deleteCheckAndUpdateTimeTrigger() {
  const triggers = ScriptApp.getProjectTriggers();
  for (let i = 0; i < triggers.length; i++) {
    if (triggers[i].getHandlerFunction() === 'checkAndUpdate') {
      ScriptApp.deleteTrigger(triggers[i]);
    }
  }
  Logger.log("CheckAndUpdate trigger stopped.");
}


function updateValues() {
  // Define the sheet and columns
  const sheetName = 'ALL';
  const columnToCheck = 3; // Column C (3rd column)
  const columnToUpdate = 4; // Column D (4th column)
  const valueToChange = '平民';
  const newValue = '轻度感染';
  const valueForColumnD = 'I';

  // Access the sheet
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
  const numRows = sheet.getLastRow();
  
  // Get the values from column C
  const columnValues = sheet.getRange(1, columnToCheck, numRows).getValues();
  
  // Find rows with the value '平民'
  const rowsToUpdate = columnValues
    .map((value, index) => ({ value: value[0], row: index + 1 }))
    .filter(row => row.value === valueToChange);
  
  // Calculate the number of rows to update (rate can adjust) of '平民' rows)
  const numRowsToUpdate = Math.ceil(rowsToUpdate.length * 0.02); // Original ratio: 0.056

  if (numRowsToUpdate > 0) {
    // Shuffle the rows to update
    rowsToUpdate.sort(() => Math.random() - 0.5);

    // Select the first 'numRowsToUpdate' rows
    const rowsToChange = rowsToUpdate.slice(0, numRowsToUpdate);

    // Update the selected rows with '轻度感染' in column C and 'I' in column D
    rowsToChange.forEach(row => {
      sheet.getRange(row.row, columnToCheck).setValue(newValue);
      sheet.getRange(row.row, columnToUpdate).setValue(valueForColumnD);
      updateRow(sheet, row.row, "I");
    });
  }
}

