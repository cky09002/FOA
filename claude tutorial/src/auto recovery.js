function autoRecovery() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const startSheet = ss.getSheetByName('游戏开始时间');
  const viewSheetName = 'View';
  const infectionRateSheetName = '感染率';
  const columnToCheck = 5; // Column E (身份)
  const columnToUpdate = 4; // Column D (操作)
  const columnTimestampView = 7; // Column G (Timestamp in View sheet)
  const valuesToChange = ['轻度感染', '中度感染'];
  const valuesForColumnD = ['AR', 'AG'];
  
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
  
  // Get the recovery rate from cell H1 in the 感染率 sheet
  const recoverRate = infectionRateSheet.getRange('H1').getValue();
  
  const numRows = viewSheet.getLastRow();
  if (numRows < 2) {
    Logger.log("No data to process.");
    return;
  }

  // Get the values from column 身份
  const columnValues = viewSheet.getRange(2, columnToCheck, numRows - 1).getValues();
  
  // Find rows with the values '轻度感染' or '中度感染'
  const rowsToUpdate = columnValues
    .map((value, index) => ({ value: value[0], row: index + 2 })) // Adjust index to match sheet rows
    .filter(row => valuesToChange.includes(row.value));
  
  // Calculate the number of rows to update based on the recovery rate
  const numRowsToUpdate = Math.ceil(rowsToUpdate.length * recoverRate);

  // Count the number of rows containing '平民' and '守卫' in column E
  const civilianCount = columnValues.filter(row => row[0] === '平民').length; // Check if the cell contains '平民'
  const guardCount = columnValues.filter(row => row[0] === '守卫').length; // Check if the cell contains '守卫'
  const goodCount = civilianCount + guardCount;
  
  if (guardCount >= 10) {
    Logger.log("Number of '守卫' is already 10 or more. No more '守卫' will be added.");
  } else if (numRowsToUpdate > 0) {
    // Shuffle the rows to update
    rowsToUpdate.sort(() => Math.random() - 0.5);

    // Select the first 'numRowsToUpdate' rows
    const rowsToChange = rowsToUpdate.slice(0, numRowsToUpdate);

    rowsToChange.forEach(({row}) => {
      viewSheet.getRange(row, columnToUpdate).setValue(valuesForColumnD[Math.floor(Math.random() * valuesForColumnD.length)]);
      viewSheet.getRange(row, columnTimestampView).setValue(new Date());
    })
    
    Logger.log(`${numRowsToUpdate} rows updated with 'AR' or 'AG' and timestamp in View sheet.`);
  }

  Logger.log(`Number of rows containing '平民' in column E: ${civilianCount}`);
  Logger.log(`Number of rows containing '守卫' in column E: ${guardCount}`);

  // Record the count, recovery rate, and timestamp in "感染率" sheet
  const nextRow = infectionRateSheet.getLastRow() + 1;
  const timestampRecoverRate = new Date(); // Timestamp for 感染率 sheet
  infectionRateSheet.getRange(nextRow, 6, 1, 3).setValues([[timestampRecoverRate, recoverRate, goodCount]]);
  
  Logger.log(`Recorded the civilianCount, guardCount, recover rate, and timestamp to "感染率" sheet.`);
}
