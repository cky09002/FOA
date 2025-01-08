function doGet(e) {
  var view = e.parameter.view;

  Logger.log('View Parameter: ' + view);

  if (view === 'marketplace') {
    return HtmlService.createTemplateFromFile('集市').evaluate();
  } else if (view === 'medical'){
    return HtmlService.createHtmlOutputFromFile('medical');
  }
    else if (view === 'reward') {
    return HtmlService.createHtmlOutputFromFile('奖励处');
  } else if (view && view.startsWith('shelter')) {
    var shelterNumber = view.replace('shelter', '');
    Logger.log('Shelter Number: ' + shelterNumber);
    return createShelterHtml(shelterNumber);
  } else if (view && view.startsWith('reward')) {
    var rewardNumber = view.replace('reward', '');
    Logger.log('Reward Number: ' + rewardNumber);
    return createRewardHtml(rewardNumber);
  } else {
    return HtmlService.createHtmlOutputFromFile('index');
  }
}

function createRewardHtml(rewardNumber) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('奖励');
  
  var rangeMapping = {
    '1': 'A2:E8',
    '2': 'A9:E30',
    '3': 'A18:E26',
    '4': 'A27:E35',
    '5': 'A36:E44',
    '6': 'A45:E51'
    // Add other mappings as needed
  };
  
  var range = rangeMapping[rewardNumber];

  if (!range) {
    Logger.log('Invalid reward number: ' + rewardNumber);
    return HtmlService.createHtmlOutput('Invalid reward number');
  }

  try {
    var data = sheet.getRange(range).getValues();
    var backgrounds = sheet.getRange(range).getBackgrounds();
    var fonts = sheet.getRange(range).getFontWeights(); // Retrieve font weights

    Logger.log('Reward Data: ' + JSON.stringify(data));
    Logger.log('Background Colors: ' + JSON.stringify(backgrounds));
    Logger.log('Font Weights: ' + JSON.stringify(fonts));

    var rewardTemplate = HtmlService.createTemplateFromFile('reward_template');
    rewardTemplate.data = data;
    rewardTemplate.backgrounds = backgrounds;
    rewardTemplate.fonts = fonts; // Pass font weights to the template
    rewardTemplate.rewardNumber = rewardNumber;

    return rewardTemplate.evaluate();
  } catch (error) {
    Logger.log('Error: ' + error.message);
    return HtmlService.createHtmlOutput('An error occurred: ' + error.message);
  }
}


function createShelterHtml(shelterNumber) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('庇护所');
  var rateSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('感染率');
  var eventSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('庇护所随机事件');

  // Log sheet names for debugging
  Logger.log('Shelter Sheet: ' + sheet.getName());
  Logger.log('Rate Sheet: ' + rateSheet.getName());
  Logger.log('Event Sheet: ' + eventSheet.getName());

  var cellMapping = {
    '1': { countLight: 'B29', countDark: 'B30', owner: 'A33' },
    '2': { countLight: 'D29', countDark: 'D30', owner: 'C33' },
    '3': { countLight: 'F29', countDark: 'F30', owner: 'E33' },
    '4': { countLight: 'H29', countDark: 'H30', owner: 'G33' },
    '5': { countLight: 'J29', countDark: 'J30', owner: 'I33' },
    '6': { countLight: 'L29', countDark: 'L30', owner: 'K33' },
    '7': { countLight: 'N29', countDark: 'N30', owner: 'M33' },
    '8': { countLight: 'P29', countDark: 'P30', owner: 'O33' }
  };

  var cells = cellMapping[shelterNumber];

  if (!cells) {
    Logger.log('Invalid shelter number: ' + shelterNumber);
    return HtmlService.createHtmlOutput('Invalid shelter number');
  }

  try {
    var lightCount = sheet.getRange(cells.countLight).getValue();
    var darkCount = sheet.getRange(cells.countDark).getValue();
    var owner = sheet.getRange(cells.owner).getValue();
    var header = sheet.getRange(cells.owner).offset(-1, 0).getValue();
    var infectionRate = rateSheet.getRange('C1').getValue();
    var recoveryRate = rateSheet.getRange('H1').getValue();

    // Read events from sheet
    var positiveEventsRange = eventSheet.getRange('A3:B22').getValues();
    var negativeEventsRange = eventSheet.getRange('A24:B43').getValues();

    // Convert events to arrays of objects
    var positiveEvents = positiveEventsRange.map(function(row) {
      return { name: row[0], description: row[1], type: 'positive' };
    });

    var negativeEvents = negativeEventsRange.map(function(row) {
      return { name: row[0], description: row[1], type: 'negative' };
    });

    // Select one random positive event
    var randomPositiveIndex = Math.floor(Math.random() * positiveEvents.length);
    var selectedPositiveEvent = positiveEvents[randomPositiveIndex];

    // Select one random negative event
    var randomNegativeIndex = Math.floor(Math.random() * negativeEvents.length);
    var selectedNegativeEvent = negativeEvents[randomNegativeIndex];

    // Choose which event to show based on the condition
    var selectedEvent;
    if (infectionRate > recoveryRate) {
      selectedEvent = selectedPositiveEvent;
    } else {
      selectedEvent = selectedNegativeEvent;
    }

    Logger.log('Light Count: ' + lightCount);
    Logger.log('Dark Count: ' + darkCount);
    Logger.log('Owner: ' + owner);
    Logger.log('Header: ' + header);
    Logger.log('Infection Rate: ' + infectionRate);
    Logger.log('Recovery Rate: ' + recoveryRate);
    Logger.log('Selected Positive Event: ' + JSON.stringify(selectedPositiveEvent));
    Logger.log('Selected Negative Event: ' + JSON.stringify(selectedNegativeEvent));
    Logger.log('Chosen Event: ' + JSON.stringify(selectedEvent));

    // Separate the selected event's properties
    var eventName = selectedEvent.name;
    var eventDescription = selectedEvent.description;
    var eventType = selectedEvent.type;

    // Log the separated properties
    Logger.log('Event Name: ' + eventName);
    Logger.log('Event Description: ' + eventDescription);
    Logger.log('Event Type: ' + eventType);

    var template = HtmlService.createTemplateFromFile('shelter_template');
    template.shelterNumber = shelterNumber;
    template.lightCount = lightCount;
    template.darkCount = darkCount;
    template.owner = owner;
    template.header = header;
    template.infectionRate = infectionRate;
    template.recoveryRate = recoveryRate;
    template.eventName = eventName;
    template.eventDescription = eventDescription;
    template.eventType = eventType;

    return template.evaluate();
  } catch (error) {
    Logger.log('Error: ' + error.message);
    return HtmlService.createHtmlOutput('An error occurred: ' + error.message);
  }
}


function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function createMarketplace() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('商店');
  var range = sheet.getRange('H6:P15');
  var data = range.getValues();

  // Choose 5 random items
  var itemCount = data.length;
  var randomIndexes = [];
  while (randomIndexes.length < 5) {
    var randomIndex = Math.floor(Math.random() * itemCount);
    if (!randomIndexes.includes(randomIndex)) {
      randomIndexes.push(randomIndex);
    }
  }

  // Update statuses
  var statusValues = [];
  for (var i = 0; i < itemCount; i++) {
    var status = randomIndexes.includes(i) ? '上架' : '下架';
    statusValues.push([status]);
  }

  // Set updated status values back to the sheet
  var statusRange = sheet.getRange('P6:P15'); // Status column range
  statusRange.setValues(statusValues);

  // Prepare HTML for displayed items
  var html = '';

  data.forEach(function(row, index) {
    var name = row[0];
    var price = row[2];
    var quantity = row[3];
    var imageUrl = row[7];
    var status = statusValues[index][0]; // Get the status for the current row

    if (status === '上架' && name) {
      html += '<div class="item">';
      html += '<div class="item-image"><img src="' + imageUrl + '" alt="' + name + '"></div>';
      html += '<div class="item-details">';
      html += '<div class="item-name">' + name + '</div>';
      html += '<div class="item-price">' + price + ' 元</div>';
      if (quantity > 0) {
        html += '<div class="item-quantity">剩余数量: ' + quantity + '</div>';
        html += '<button class="buy-button" onclick="confirmPurchase(\'' + name + '\')">购买</button>';
      } else {
        html += '<div class="item-quantity">缺货</div>';
      }
      html += '</div></div>';
    }
  });

  return html;
}

function purchaseItem(name, inputNumber) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('商店');
  var itemRange = sheet.getRange('H6:P15'); // Range including item data and status
  var itemData = itemRange.getValues();

  var itemFound = false;
  var itemInStock = false;
  var itemRow = -1;

  // Find the item in the itemData range
  for (var i = 0; i < itemData.length; i++) {
    if (itemData[i][0] === name) { // Assuming item names are in column H (index 0)
      itemFound = true;
      if (itemData[i][8] === '上架') { // Assuming status is in column P (index 8 in H-P range)
        itemInStock = true;
        itemRow = i + 6; // Adjust row index for actual spreadsheet row
      }
      break;
    }
  }

  if (itemFound && itemInStock && inputNumber) {
    // Log the inputNumber and check if it's a valid number
    Logger.log('Input Number: ' + inputNumber);
    if (isNaN(inputNumber) || inputNumber <= 0) {
      Logger.log('Invalid input number');
      return "Invalid input number.";
    }

    var purchaseRange = sheet.getRange('A5:A'); // Column A for purchase log
    var purchaseValues = purchaseRange.getValues();

    var nextRow = -1;
    // Find the first empty row in the purchase log
    for (var j = 0; j < purchaseValues.length; j++) {
      if (!purchaseValues[j][0]) { // Check if cell in column A is empty
        nextRow = j + 5; // Adjust index to match the actual row in the spreadsheet
        break;
      }
    }

    if (nextRow === -1) {
      // If no empty row is found, append to the end
      nextRow = sheet.getLastRow() + 1;
    }

    // Append purchase details to the next available row
    sheet.getRange(nextRow, 1).setValue(new Date()); // Column A
    sheet.getRange(nextRow, 3).setValue(inputNumber); // Column C
    sheet.getRange(nextRow, 6).setValue(name); // Column F

    Logger.log('Purchase Recorded Successfully');
    return "Purchase recorded successfully.";
  } else if (!itemInStock) {
    Logger.log('Item is out of stock');
    return "Item is out of stock.";
  } else {
    Logger.log('Item not found or input number is missing');
    return "Item not found or input number is missing.";
  }
}

function getScamPage() {
  return HtmlService.createHtmlOutputFromFile('scam').getContent();
}
