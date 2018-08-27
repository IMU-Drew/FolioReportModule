// Constants
const MAX_NUM_RESOURCES_IN_SUBCLASS = 100;

// Variables
var sampleData = new Object;
var sampleMainClassDataArray = new Array;
var mainClassDataIsDisplayed = true;
var plotlyBarChart = document.getElementById('plotly-bar-chart');
var backButton = $('#back-button');

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

// Animates the displaying of the appropriate subclass data.
function animateSubclassData(mainClass) {
  var subclassDataArray = new Array;

  // Start with only the subclass of each class name.
  var fullClassNames = Object.keys(sampleData[mainClass]);

  // Prepend the main class letter to each subclass.
  for (var index in fullClassNames) {
    fullClassNames[index] = mainClass + fullClassNames[index];
  }

  // Counter
  var i = 0;

  // Get the subclass data into an array to give to Plotly.
  for (var subclass in sampleData[mainClass]) {
    subclassDataArray[i] = sampleData[mainClass][subclass];

    // Increment the counter.
    ++i;
  }

  // Create the data array to pass to Plotly.
  var data = [
    {
      x: fullClassNames,
      y: subclassDataArray,
      type: 'bar'
    }
  ];

  // Create the layout object to pass to plotly.
  var layout = {
    title: 'Number of Resources by Library of Congress Classification',
    xaxis: {
      title: 'Classification'
    },
    yaxis: {
      title: 'Number of Resources',
      range: [0, MAX_NUM_RESOURCES_IN_SUBCLASS]
    }
  };

  // Animate the chart.
  Plotly.animate('plotly-bar-chart', {
    data: data,
    layout: layout
  });

  mainClassDataIsDisplayed = false;

  // Display the back button.
  backButton.removeClass('no-show');
}

// Animates the re-displaying of the main class data.
function animateMainClassData() {
  // FIXME: Remove after testing.
  console.log('Animating main class data...');

  // Create the main class data array to pass to Plotly.
  var data = [
    {
      x: Object.keys(sampleData),
      y: sampleMainClassDataArray,
      type: 'bar'
    }
  ];

  // Create the layout object to pass to Plotly.
  var layout = {
    title: 'Number of Resources by Library of Congress Classification',
    xaxis: {
      title: 'Classification'
    },
    yaxis: {
      title: 'Number of Resources',
      range: [0, max(sampleMainClassDataArray)]
    }
  };

  // Animate the chart.
  Plotly.animate('plotly-bar-chart', {
    data: data,
    layout: layout
  });

  mainClassDataIsDisplayed = true;

  // Un-display the back button.
  backButton.addClass('no-show');
}

// Generate sample data.
for (var char1 = 'A'; char1.charAt(0) <= 'Z'; char1 = getNextChar(char1)) {
  sampleData[char1] = new Object;

  for (var char2 = 'A'; char2.charAt(0) <= 'Z'; char2 = getNextChar(char2)) {
    sampleData[char1][char2] = Math.floor(Math.random() * (MAX_NUM_RESOURCES_IN_SUBCLASS + 1));
  }
}

// Counter
var i = 0;

// Get the main class data into an array to give to Plotly.
for (var mainClass in sampleData) {
  // Start at zero.
  sampleMainClassDataArray[i] = 0;

  // Sum the subclass values.
  for (subclass in sampleData[mainClass]) {
    sampleMainClassDataArray[i] += sampleData[mainClass][subclass];
  }

  // Increment the counter.
  ++i;
}

// Create the main class data array to pass to Plotly.
var data = [
  {
    x: Object.keys(sampleData),
    y: sampleMainClassDataArray,
    type: 'bar'
  }
];

// Create the layout object to pass to Plotly.
var layout = {
  title: 'Number of Resources by Library of Congress Classification',
  xaxis: {
    title: 'Main Class'
  },
  yaxis: {
    title: 'Number of Resources'
  }
}

// Draw the chart.
Plotly.newPlot('plotly-bar-chart', data, layout);

// Display the appropriate subclass data when a bar is clicked.
plotlyBarChart.on('plotly_click', function(data) {
  // If the main class data is currently being displayed...
  if (mainClassDataIsDisplayed === true) {
    // Get the value of the main class corresponding to the bar that was clicked.
    var mainClass = data.points[0].x;

    // Animate the displaying of the appropriate subclass data.
    animateSubclassData(mainClass);
  }
});

// Re-display the main class data when the back button is pressed.
backButton.on('click', animateMainClassData);