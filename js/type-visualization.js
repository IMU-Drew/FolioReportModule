// Constants

// An enum-esque object used to describe resource types.
const resourceTypes = {
  'Book': new resourceType(0, 'Book'),
  'CurrMat': new resourceType(1, 'Curriculum Material'),
  'Per-Bound': new resourceType(2, 'Per-Bound'),
  'Oversize': new resourceType(3, 'Oversize'),
  'School Library Material': new resourceType(4, 'School Library Material'),
  'CDROM': new resourceType(5, 'CD-ROM'),
  'CD': new resourceType(6, 'CD'),
  'Education Non-book': new resourceType(7, 'Education, Non-book'),
  'Video': new resourceType(8, 'Video'),
  'Non-book': new resourceType(9, 'Non-book'),
  'GovDoc': new resourceType(10, 'Government Document'),
  'Reference': new resourceType(11, 'Reference'),
  'Reserve 7 Day Loan': new resourceType(12, 'Reserve 7 Day Loan'),
  'Reserve 10 Day Loan': new resourceType(13, 'Reserve 10 Day Loan'),
  '30 Day Restricted': new resourceType(14, '30-Day Restricted'),
  'Score': new resourceType(15, 'Score'),
  'MinScore': new resourceType(16, 'MinScore'),
  'hsl,r7d': new resourceType(17, 'Health Sciences Library'),
  'SoundRec': new resourceType(18, 'Sound Recording')
}

// Variables

var plotlyBarChart = document.getElementById('plotly-bar-chart');

var data = {
  resourceTypeData: new Array(),
  resourceTypeLabels: new Array()
}

// Resource type object prototype constructor used in the resource types enum-esque object.
function resourceType(id, label) {
  this.id = id;
  this.label = label;
}

// Initialize the data object.
for (var type in resourceTypes) {
  data.resourceTypeData[resourceTypes[type].id] = 0;
  data.resourceTypeLabels[resourceTypes[type].id] = resourceTypes[type].label;
}

// Load and process the data file using D3.
d3.csv('https://alabama.box.com/shared/static/tw0rze209fk99s06dhqa4h19toirotjo.csv').then(function(resourceData) {
  // Loop through the data array.
  for (var i = 0; i < resourceData.length; ++i) {
    // Get the type of the current resource and increment that type's counter.
    var type = resourceData[i].ITEM_TYPE_NAME;

    // Try to increment the type's counter.
    try {
      ++data.resourceTypeData[resourceTypes[type].id];
    }
    // If there is an error...
    catch(error) {
      // Log the resource's type to the console.
      console.log('Type: ' + type);

      // Log the error itself.
      console.error(error);
    }
  }

  // Create the main class data array to be passed to Plotly.
  const plotlyData = [
    {
      x: data.resourceTypeLabels,
      y: data.resourceTypeData,
      type: 'bar'
    }
  ];

  // Create the layout object to pass to Plotly.
  const plotlyLayout = {
    title: 'Number of Resources by Type',
    xaxis: {
      title: 'Type',
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
  Plotly.newPlot('plotly-bar-chart', plotlyData, plotlyLayout);
});