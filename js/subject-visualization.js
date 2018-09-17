// Constants

const LCC_MAIN_CLASSES = {
  'A': 'General Works',
  'B': 'Philosophy, Psychology, Religion',
  'C': 'Auxiliary Sciences of History',
  'D': 'World History and History of Europe, Asia, Africa, Australia, New Zealand, etc.',
  'E': 'History of the Americas',
  'F': 'History of the Americas',
  'G': 'Geography, Anthropology, Recreation',
  'H': 'Social Sciences',
  'J': 'Political Science',
  'K': 'Law',
  'L': 'Education',
  'M': 'Music and Books on Music',
  'N': 'Fine Arts',
  'P': 'Language and Literature',
  'Q': 'Science',
  'R': 'Medicine',
  'S': 'Agriculture',
  'T': 'Technology',
  'U': 'Military Science',
  'V': 'Naval Science',
  'Z': 'Bibliography, Library Sciecne, Information Resources (General)'
};

// An enum-esque object used to describe the state of the chart.
const chartLevels = {
  mainClass: 0,
  subclass: 1,
  category: 2,
  EOrFCategory: 3
}

// Variables

var data = {
  'mainClassData': new Array(),
  'mainClassTitles': new Array(),
  'mainClasses': new Object()
};

var lccSubclassDataRequest = new XMLHttpRequest();
var plotlyBarChart = document.getElementById('plotly-bar-chart');
var backButton = $('#back-button');
var chartLevel = chartLevels.mainClass;
var currentMainClass;

// Library of Congress Classification main class Object prototype constructor
function LccMainClass(description) {
  this.description = description;
  this.subclassData = new Array();
  this.subclassTitles = new Array();
  this.subclasses = new Object();
}

// Library of Congress Classification main class E or F Object prototype constructor
// Main classes E and F are distinct from all other main classes because they do not have any subclasses.
function LccMainClassEOrF(description) {
  this.description = description;
  this.categories = new Object();
  this.categoryData = new Array();
  this.categoryTitles = new Array();
}

// Library of Congress Classification subclass Object prototype constructor
function LccSubclass(description) {
  this.description = description;
  this.categoryData = new Array();
  this.categoryTitles = new Array();
  this.categories = new Object();
  this.mainCategory = new String();
}

// Library of Congress Classification category Object prototype constructor
function LccCategory(description, lowerBound, upperBound) {
  this.description = description;
  this.lowerBound = lowerBound;
  this.upperBound = upperBound;
  this.numResources = 0;
}

// Get the next character after a given character (for example, the next character in the alphabet).
function getNextChar(char) {
  return String.fromCharCode(char.charCodeAt(0) + 1);
}

// Return the numberical maximum in a given array.
function max(array) {
  // If the array is non-empty...
  if (array.length > 0) {
    // Start with the first element as the max.
    var max = array[0];

    // Loop through the rest of the array.
    for (var i = 1; i < array.length; ++i) {
      // If an element is larger than the current max...
      if (array[i] > max) {
        // Make it the new max.
        max = array[i];
      }
    }

    return max;
  }
}

// Animates the re-displaying of the main class data.
function animateMainClassData() {
  // Create the data array to pass to Plotly.
  const plotlyMainClassData = [
    {
      x: data.mainClassTitles,
      y: data.mainClassData,
      type: 'bar'
    }
  ];

  // Create the layout object to pass to Plotly.
  const plotlyMainClassLayout = {
    title: 'Number of Resources by Library of Congress Classification',
    xaxis: {
      title: 'Classification'
    },
    yaxis: {
      title: 'Number of Resources',
      range: [0, max(data.mainClassData)]
    }
  };

  // Animate the chart.
  Plotly.animate('plotly-bar-chart', {
    data: plotlyMainClassData,
    layout: plotlyMainClassLayout
  });

  // Update the state of the chart.
  chartLevel = chartLevels.mainClass;
  currentMainClass = '';

  // Un-display the back button.
  backButton.addClass('no-show');
}

// Animates the displaying of the appropriate subclass data.
function animateSubclassData(mainClass) {
  // Create the data array to pass to Plotly.
  const plotlySubclassData = [
    {
      x: data.mainClasses[mainClass].subclassTitles,
      y: data.mainClasses[mainClass].subclassData,
      type: 'bar'
    }
  ];

  // Create the layout object to pass to plotly.
  const plotlySubclassLayout = {
    title: 'Number of Resources by Library of Congress Classification',
    xaxis: {
      title: 'Classification'
    },
    yaxis: {
      title: 'Number of Resources',
      range: [0, max(data.mainClasses[mainClass].subclassData)]
    }
  };

  // Animate the chart.
  Plotly.animate('plotly-bar-chart', {
    data: plotlySubclassData,
    layout: plotlySubclassLayout
  });

  // Update the state of the chart.
  chartLevel = chartLevels.subclass;
  currentMainClass = mainClass;

  // Display the back button if it is not already visible.
  backButton.removeClass('no-show');
}

// Animates the displaying of the category data for the main classes E and F.
function animateEOrFCategoryData(mainClass) {
  // Create the data array to pass to plotly.
  const plotlyCategoryData = [
    {
      x: data.mainClasses[mainClass].categoryTitles,
      y: data.mainClasses[mainClass].categoryData,
      type: 'bar'
    }
  ];

  // Create the layout object to pass to plotly.
  const plotlyCategoryLayout = {
    title: 'Number of Resources by Library of Congress Classification',
    xaxis: {
      title: 'Classification'
    },
    yaxis: {
      title: 'Number of Resources',
      range: [0, max(data.mainClasses[mainClass].categoryData)]
    }
  };

  // Animate the chart.
  Plotly.animate('plotly-bar-chart', {
    data: plotlyCategoryData,
    layout: plotlyCategoryLayout
  });

  // Display the back button.
  backButton.removeClass('no-show');

  // Update the state of the chart.
  chartLevel = chartLevels.EOrFCategory;
}

// Animates the displaying of the appropriate category data.
function animateCategoryData(subclass) {
  // Create the data array to pass to Plotly.
  const plotlyCategoryData = [
    {
      x: data.mainClasses[subclass[0]].subclasses[subclass].categoryTitles,
      y: data.mainClasses[subclass[0]].subclasses[subclass].categoryData,
      type: 'bar'
    }
  ];

  // Create the layout object to pass to plotly.
  const plotlyCategoryLayout = {
    title: 'Number of Resources by Library of Congress Classification',
    xaxis: {
      title: 'Classification'
    },
    yaxis: {
      title: 'Number of Resources',
      range: [0, max(data.mainClasses[subclass[0]].subclasses[subclass].categoryData)]
    }
  };

  // Animate the chart.
  Plotly.animate('plotly-bar-chart', {
    data: plotlyCategoryData,
    layout: plotlyCategoryLayout
  });

  // Update the state of the chart.
  chartLevel = chartLevels.category;
}

// Initialize the data Object.
for (var mainClass in LCC_MAIN_CLASSES) {
  // If the main class is not E or F...
  if ((mainClass !== 'E') && (mainClass != 'F')) {
    // Create an LccMainClass Object for it.
    data.mainClasses[mainClass] = new LccMainClass(LCC_MAIN_CLASSES[mainClass]);
  }
  // Else, if the main class E or F...
  else {
    // Create an LccMainClassEOrF Object for it.
    data.mainClasses[mainClass] = new LccMainClassEOrF(LCC_MAIN_CLASSES[mainClass]);
  }
}

// Add the categories to the E class
data.mainClasses['E'].categories['E11-143'] = new LccCategory('America', 11, 143);
data.mainClasses['E'].categories['E151-909'] = new LccCategory('United States', 151, 909);

// Add the categories to the F class
data.mainClasses['F'].categories['F1-975'] = new LccCategory('United States local history', 1, 975);
data.mainClasses['F'].categories['F1001-1145.2'] = new LccCategory('British America (including Canada)', 1001, 1145.2);
data.mainClasses['F'].categories['F1170'] = new LccCategory('French America', 1170, 1170);
data.mainClasses['F'].categories['F1201-3799'] = new LccCategory('Latin America. Spanish America', 1201, 3799);

lccSubclassDataRequest.addEventListener('load', function(event) {
  // Convert the returned JSON data to a JavaScript object.
  const lccSubclassData = JSON.parse(lccSubclassDataRequest.responseText);

  // Incorporate the subclass data into the main data object.
  for (var subclass in lccSubclassData) {
    // Variables
    var mainClass = new String();

    // Get the main class that the subclass falls under.
    mainClass = subclass.charAt(0);

    // If the main class isn't E or F...
    if ((mainClass !== 'E') && (mainClass !== 'F')) {
      // Create the new LccSubclass Object.
      data.mainClasses[mainClass].subclasses[subclass] = new LccSubclass('');

      // Find the "main" cateogry of the subclass, and use it to get the description of the subclass.
      // Loop through the subclass's categories.
      for (var i = 0; i < lccSubclassData[subclass].length; ++i) {
        // If the category is the "main" category...
        if (lccSubclassData[subclass][i].parents.length === 0) {
          // Record the name of the "main" category, and use its description for the subclass.
          data.mainClasses[mainClass].subclasses[subclass].mainCategory = lccSubclassData[subclass][i].id;
          data.mainClasses[mainClass].subclasses[subclass].description = lccSubclassData[subclass][i].subject;

          // End the loop, since the "main" category has been found.
          break;
        }
      }

      // Populate the subclass's categories Object.
      // Loop through the subclass's categories again.
      for (var i = 0; i < lccSubclassData[subclass].length; ++i) {
        // If the category is a first-level category...
        if (lccSubclassData[subclass][i].parents[0] === data.mainClasses[mainClass].subclasses[subclass].mainCategory) {
          // Create a new sub-Object in the subclass's categories Object to represent it.
          data.mainClasses[mainClass].subclasses[subclass].categories[lccSubclassData[subclass][i].id] = new LccCategory(lccSubclassData[subclass][i].subject, lccSubclassData[subclass][i].start, lccSubclassData[subclass][i].stop);
        }
      }
    }
  }

  /*
  // Add an "Other" subclass to each main class and an "Other" category to each subclass.
  for (var mainClass in data.mainClasses) {
    // Add an "Other" subclass.
    data.mainClasses[mainClass].subclasses['Other'] = new LccSubclass('');

    // Add an "Other" category to each subclass.
    for (var subclass in data.mainClasses[mainClass].subclasses) {
      data.mainClasses[mainClass].subclasses[subclass].categories['Other'] = new LccCategory('');
    }
  }
  */

  // Load and process the data file using D3.
  d3.csv('https://alabama.box.com/shared/static/tw0rze209fk99s06dhqa4h19toirotjo.csv').then(function(resourceData) {
    // Loop through the data array.
    // for (var i = 0; i < resourceData.length; ++i) {
    for (var i = 0; i < resourceData.length; ++i) {
      // Variables
      var callNumber = resourceData[i].DISPLAY_CALL_NO;
      var mainClass;
      var subclass;
      var classNumber = '';

      // Extract the main class, subclass (if there is one), and class number.
      if (callNumber.length > 0) {
        // Get the main class, and start the subclass with the letter denoting the main class.
        mainClass = callNumber[0];
        subclass = mainClass;

        // Start with the second character.
        var j = 1;

        // Extract the subclass from the call number.
        // Note that if the call number does not contain a subclass, then the subclass variable will just contain the letter for the main class.
        // Loop through each character of the call number.
        while (j < callNumber.length) {
          // If the character is an uppercase letter...
          if ((callNumber[j] >= 'A') && (callNumber[j] <= 'Z')) {
            // Add it to the subclass.
            subclass += callNumber[j];
          }
          // Else, if the character is not an uppercase letter...
          else {
            // End the loop.
            break;
          }

          // Get the next character.
          ++j;
        }

        // Extract the class number from the call number.
        // Continue looping through each character in the call number.
        while (j < callNumber.length) {
          // If the character is a digit...
          if ((callNumber[j] >= '0') && (callNumber[j] <= '9')) {
            // Add it to the class number.
            classNumber += callNumber[j];
          }
          // Else, if the character is not a digit...
          else {
            // Convert the class number string into a Number object, and end the loop.
            classNumber = Number(classNumber);
            break;
          }

          // Get the next character.
          ++j;
        }
      }

      // Find the category that the resource belongs in.
      // If the main class is valid...
      if (data.mainClasses.hasOwnProperty(mainClass)) {
        // If the main class is not E or F...
        if ((mainClass !== 'E') && (mainClass !== 'F')) {
          // FIXME: Uncomment after implementing "Other" subclasses in the data object structure.
          /*
          // If the subclass is invalid...
          if (!data.mainClasses[mainClass].subclasses.hasOwnProperty(subclass)) {
            // Set the subclass to "Other".
            subclass = 'Other';
          }
          */

          // FIXME: Remove if statement after implementing "Other" subclasses in the data object sturcture.
          // If the subclass is valid...
          if (data.mainClasses[mainClass].subclasses.hasOwnProperty(subclass)) {
            // Use a flag to determine whether or not the appropriate category can be found.
            var categoryFound = false;

            // Loop through the appropriate categories.
            for (var category in data.mainClasses[mainClass].subclasses[subclass].categories) {
              // Get the lower and upper bounds for the current category.
              var lowerBound = data.mainClasses[mainClass].subclasses[subclass].categories[category].lowerBound;
              var upperBound = data.mainClasses[mainClass].subclasses[subclass].categories[category].upperBound;

              // If the resource's class number falls within the bounds of the curent category...
              if ((classNumber >= lowerBound) && (classNumber <= upperBound)) {
                // Increment the category's resource counter.
                ++data.mainClasses[mainClass].subclasses[subclass].categories[category].numResources;

                // Set the flag indicating that the category has been found.
                categoryFound = true;
              }
            }

            // If the appropriate category was not found...
            if (categoryFound === false) {
              // ++data.mainClasses[mainClass].subclasses[subclass].categories['Other'].numResources;
            }
          }
        }
        // Else, if the main class is E or F...
        else {
          // Loop through the appropriate categories.
          for (var category in data.mainClasses[mainClass].categories) {
            // Get the lower and upper bounds for the current category.
            var lowerBound = data.mainClasses[mainClass].categories[category].lowerBound;
            var upperBound = data.mainClasses[mainClass].categories[category].upperBound;

            // If the resource's class number falls within the bounds of the current cateogry...
            if ((classNumber >= lowerBound) && (classNumber <= upperBound)) {
              // Increment the category's resource counter.
              ++data.mainClasses[mainClass].categories[category].numResources;
            }
          }
        }
      }
    }

    // Recursively construct the data and title arrays.
    // Loop through each main class in the data object.
    for (var mainClass in data.mainClasses) {
      // Variables
      var numResourcesInMainClass = 0;

      // If the main class is not E or F...
      if ((mainClass !== 'E') && (mainClass !== 'F')) {
        // Construct the subclass data and titles arrays for the current main class.
        // Loop through each subclass in the current main class.
        for (var subclass in data.mainClasses[mainClass].subclasses) {
          // Variables
          var numResourcesInSubclass = 0;

          // Construct the category data and titles arrays for the current subclass.
          // Loop through each category in the current subclass.
          for (var category in data.mainClasses[mainClass].subclasses[subclass].categories) {
            // Push the number of resources in the current category to the data array of its subclass.
            data.mainClasses[mainClass].subclasses[subclass].categoryData.push(data.mainClasses[mainClass].subclasses[subclass].categories[category].numResources);

            // Add the number of resources in the current category to the number of resources in the subclass.
            numResourcesInSubclass += data.mainClasses[mainClass].subclasses[subclass].categories[category].numResources;

            // Push the title of the current category to the title array of its subclass.
            data.mainClasses[mainClass].subclasses[subclass].categoryTitles.push(data.mainClasses[mainClass].subclasses[subclass].categories[category].description);
          }

          // Push the number of resources in the current subclass to the data array of its main class.
          data.mainClasses[mainClass].subclassData.push(numResourcesInSubclass);

          // Add the number of resources in the current subclass to the number of resources in the main class.
          numResourcesInMainClass += numResourcesInSubclass;

          // Push the title of the current subclass to the title array of its main class.
          data.mainClasses[mainClass].subclassTitles.push(subclass + ': ' + data.mainClasses[mainClass].subclasses[subclass].description);
        }
      }
      // Else, if the main class is E or F...
      else {
        for (var category in data.mainClasses[mainClass].categories) {
          // Push the number of resources in the current category to the data array of its main class.
          data.mainClasses[mainClass].categoryData.push(data.mainClasses[mainClass].categories[category].numResources);

          // Add the number of resources in the current category to the number of resources in the main class.
          numResourcesInMainClass += data.mainClasses[mainClass].categories[category].numResources;

          // Push the title of the current category to the title array of its subclass.
          data.mainClasses[mainClass].categoryTitles.push(data.mainClasses[mainClass].categories[category].description);
        }
      }

      // Push the number of resources in the current main class to the main class data array.
      data.mainClassData.push(numResourcesInMainClass);

      // Push the title of the current main class to the main class titles array.
      data.mainClassTitles.push(mainClass + ': ' + data.mainClasses[mainClass].description);
    }

    // Create the main class data array to be passed to Plotly.
    const plotlyMainClassData = [
      {
        x: data.mainClassTitles,
        y: data.mainClassData,
        type: 'bar'
      }
    ];

    // Create the main class layout object to pass to Plotly.
    const plotlyMainClasslayout = {
      title: 'Number of Resources by Library of Congress Classification',
      xaxis: {
        title: 'Classification',
        tickangle: -60
      },
      yaxis: {
        title: 'Number of Resources'
      },
      height: 1000,
      margin: {
        b: 500
      }
    }

    // Draw the chart.
    Plotly.newPlot('plotly-bar-chart', plotlyMainClassData, plotlyMainClasslayout);

    // Add an event listener to the chart that displays the appropriate subclass or category data when a bar is clicked.
    plotlyBarChart.on('plotly_click', function(eventData) {
      // If the main class data is currently being displayed...
      if (chartLevel === chartLevels.mainClass) {
        // Get the value of the main class corresponding to the bar that was clicked.
        var mainClass = eventData.points[0].x[0];

        // If the main class selected is not E or F...
        if ((mainClass !== 'E') && (mainClass !== 'F')) {
          // Display the appropriate subclass data.
          animateSubclassData(mainClass);
        }
        // Else, if the main class selected is E or F...
        else {
          animateEOrFCategoryData(mainClass);
        }
      }
      // Else, if subclass data is currently being displayed...
      else if (chartLevel === chartLevels.subclass) {
        // Get the value of the subclass corresponding to the bar that was clicked.

        var i = 0;
        var subclass = '';

        // Loop through each charter in the title of the bar that was clicked until a non-uppercase or non-alphabetic character is found.
        while ((i < eventData.points[0].x.length) && (eventData.points[0].x[i] >= 'A') && (eventData.points[0].x[i] <= 'Z')) {
          // Add the character to the subclass string.
          subclass += eventData.points[0].x[i];

          // Get the next character.
          ++i;
        }

        // Display the appropriate category data.
        animateCategoryData(subclass);
      }
    });
  });
});

lccSubclassDataRequest.open('GET', 'https://raw.githubusercontent.com/thisismattmiller/lcc-pdf-to-json/master/results.json', true);
lccSubclassDataRequest.send();

// Re-display the main class data when the back button is pressed.
backButton.on('click', function() {
  // If subclass data or the category data for the E or F main classes is currently being displayed...
  if ((chartLevel === chartLevels.subclass) || (chartLevel === chartLevels.EOrFCategory)) {
    // Display the main class data.
    animateMainClassData();
  }
  // Else, if category data is currently being displayed...
  else if (chartLevel === chartLevels.category) {
    // Display the appropriate subclass data.
    animateSubclassData(currentMainClass);
  }
});