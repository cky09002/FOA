function autoInfection() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const startSheet = ss.getSheetByName('游戏开始时间');
  const viewSheetName = 'View';
  const infectionRateSheetName = '感染率';
  const columnToCheck = 5; // Column E (身份)
  const columnToUpdate = 4; // Column D (操作)
  const columnTimestampView = 7; // Column G (Timestamp in View sheet)
  const valueToChange = '平民';
  const valueForColumnD = 'AI';
  
  // Check if F1 in 游戏开始时间 is not empty
  const startValue = startSheet.getRange('F1').getValue();
  if (!startValue) {
    Logger.log("游戏开始时间!F1 is empty. Function will not execute.");
    return;
  }

  const viewSheet = ss.getSheetByName(viewSheetName);
  const infectionRateSheet = ss.getSheetByName(infectionRateSheetName);
  
  if (!viewSheet || !infectionRateSheet) {
    Logger.log(`Sheet with name "${viewSheetName}" or "${infectionRateSheetName}" not found.`);
    return;
  }
  
  // Get the infection rate from cell C1 in the 感染率 sheet
  const infectionRate = infectionRateSheet.getRange('C1').getValue();
  
  const numRows = viewSheet.getLastRow();
  if (numRows < 2) {
    Logger.log("No data to process.");
    return;
  }

  // Get the values from column 身份
  const columnValues = viewSheet.getRange(2, columnToCheck, numRows - 1).getValues();
  
  // Find rows with the value '平民'
  const rowsToUpdate = columnValues
    .map((value, index) => ({ value: value[0], row: index + 2 })) // Adjust index to match sheet rows
    .filter(row => row.value === valueToChange);
  
  // Calculate the number of rows to update based on the infection rate
  const numRowsToUpdate = Math.ceil(rowsToUpdate.length * infectionRate);

  if (numRowsToUpdate > 0) {
    // Shuffle the rows to update
    rowsToUpdate.sort(() => Math.random() - 0.5);

    // Select the first 'numRowsToUpdate' rows
    const rowsToChange = rowsToUpdate.slice(0, numRowsToUpdate);
    rowsToChange.forEach(({row}) => {
      viewSheet.getRange(row, columnToUpdate).setValue(valueForColumnD);
      viewSheet.getRange(row, columnTimestampView).setValue(new Date());
    })
  
    Logger.log(`${numRowsToUpdate} rows updated with 'AI' and timestamp in View sheet.`);
  }

  // Count the number of rows containing '感染' in column E
  const infectionColumnValues = viewSheet.getRange(2, columnToCheck, numRows - 1).getValues();
  const infectionCount = infectionColumnValues
    .filter(row => row[0] && row[0].toString().indexOf('感染') !== -1).length; // Check if the cell contains '感染'
  
  Logger.log(`Number of rows containing '感染' in column E: ${infectionCount}`);

  // Record the count, infection rate, and timestamp in "感染率" sheet
  const nextRow = infectionRateSheet.getLastRow() + 1;
  const timestampInfectionRate = new Date(); // Timestamp for 感染率 sheet
  infectionRateSheet.getRange(nextRow, 1, 1, 3).setValues([[timestampInfectionRate, infectionRate, infectionCount]]);
  
  Logger.log(`Recorded the count of '感染', infection rate, and timestamp to "感染率" sheet.`);
}

