function doGet(e) {
  Logger.log(e);  // Log the request parameters for debugging
  return HtmlService.createTemplateFromFile('index').evaluate();
}

function clickbutton(inputnumber) {
  try {
    // Get the active spreadsheet
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var ws = ss.getSheetByName("验证区");  // Get the sheet by name

    // Check if the sheet exists
    if (!ws) {
      Logger.log("Sheet '验证区' not found.");
      return null;  // CHANGED: Return null if sheet not found
    }

    var allSheet = ss.getSheetByName("All");  // Get the "All" sheet

    // Check if the "All" sheet exists
    if (!allSheet) {
      Logger.log("Sheet 'All' not found.");
      return null;  // CHANGED: Return null if sheet not found
    }

    var values = [];
    
    // Collect values into an array
    for (var i = 1; i <= 10; i++) {
      if (inputnumber['Input' + i]) {
        var input = inputnumber['Input' + i];
        var outputValue = searchAllSheetForIdentity(allSheet, input);
        var currentTime = new Date();
        values.push([input, outputValue, currentTime]);
      }
    }
    
    // Check if values array is not empty
    if (values.length > 0) {
      // Append values to the sheet, each value in a new row
      ws.getRange(ws.getLastRow() + 1, 1, values.length, 3).setValues(values);
      Logger.log("Data appended to sheet: " + JSON.stringify(values));

      // Check the criteria in '验证区' sheet
      var videoUrl = checkCriteriaAndPlayUrl(ws, values.length);
      Logger.log("Video URL: " + videoUrl);

      if (videoUrl) {
        return videoUrl;  // CHANGED: Return the URL as a string
      } else {
        return null;  // CHANGED: Return null if no URL
      }
    } else {
      Logger.log("No data to append");
      return null;  // CHANGED: Return null if no data to append
    }
  } catch (error) {
    Logger.log("Error in clickbutton function: " + error.message);
    return null;  // CHANGED: Return null on error
  }
}

function searchAllSheetForIdentity(allSheet, inputNumber) {
  var data = allSheet.getDataRange().getValues();
  for (var i = 0; i < data.length; i++) {
    if (data[i][0] == inputNumber) {
      return data[i][2];
    }
  }
  Logger.log("Input number " + inputNumber + " not found in sheet 'All'.");
  return "Not Found";
}

function checkCriteriaAndPlayUrl(sheet, totalInputs) {
  var data = sheet.getDataRange().getValues();
  var mildCount = 0;
  var severeCount = 0;

  for (var i = data.length - totalInputs; i < data.length; i++) {
    var status = data[i][1];
    if (status === "轻度感染") {
      mildCount++;
    } else if (status === "重度感染") {
      severeCount++;
    }
  }

  var totalCount = mildCount + severeCount;
  var lastRow = sheet.getLastRow();
  var lastInputCell = sheet.getRange(lastRow, 4);
  lastInputCell.setValue(totalCount);

  var halfInputs = totalInputs / 2;
  Logger.log("Total Inputs: " + totalInputs);
  Logger.log("Half Inputs: " + halfInputs);
  Logger.log("Mild Count: " + mildCount);
  Logger.log("Severe Count: " + severeCount);
  Logger.log("Total Count: " + totalCount);

  var videoUrls = [];

  if (totalCount >= halfInputs && totalCount != 0) {
    videoUrls.push('https://youtu.be/dBnHLomZ9kg', 'https://youtu.be/ppDOua5Gr-8');
    Logger.log("Criteria 1 met, adding URLs A1 and A2");
  }

  if (totalCount <= halfInputs && totalCount != 0) {
    videoUrls.push('https://youtu.be/ZVqum_x8p9Y', 'https://youtu.be/GkOTIfFuEAo');
    Logger.log("Criteria 2 met, adding URLs B1 and B2");
  }

  if (totalCount == 0) {
    videoUrls.push('https://youtu.be/9iXgRJdA85A', 'https://youtu.be/CEEYhGLRrzg');
    Logger.log("Criteria 3 met, adding URLs C1 and C2");
  }

  if (totalCount == totalInputs) {
    videoUrls.push('https://youtu.be/dBnHLomZ9kg');
    Logger.log("Criteria 4 met, adding URL D1");
  }

  if (severeCount > 0) {
    videoUrls.push('https://youtu.be/Pe0u7HlODzQ', 'https://youtu.be/Sd-OBYD1Ljs');
    Logger.log("Criteria for severe count met, adding URLs severe1 and severe2");
  }

  if (videoUrls.length > 0) {
    var selectedUrl = videoUrls[Math.floor(Math.random() * videoUrls.length)];
    Logger.log("Randomly selected URL: " + selectedUrl);
    return selectedUrl;  // Return the randomly selected URL
  } else {
    Logger.log("Criteria not met, no URL to return.");
    return null;  // Return null if no criteria are met
  }
}


function include(filename){
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}
