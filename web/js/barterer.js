DEFAULT_POLLING_MILLISECONDS = 2000;
DEFAULT_ORDERING = '+id';
MAX_LINE_CHART_DATA_POINTS = 8;
LINE_CHART_OPTIONS = {
  legend: {
    display: true,
    position: 'bottom'
  },
  scales: {
    xAxes: [{
      type: 'linear',
      position: 'bottom'
    }]
  }
};
COLORS = [ '#ff6900', '#0770a2', '#aec844', '#5a5a5a' ];

angular.module('response', [ 'ui.bootstrap', 'chart.js' ])

  // API controller
  .controller('ApiCtrl', function($scope, $http, $interval, $window) {
    var url = $window.location.href;
    var periodSeconds = DEFAULT_POLLING_MILLISECONDS / 1000;
    var elapsedSeconds = 0;
    $scope.meta = { message: "loading", statusCode: "..." };
    $scope.links = { self: { href: url } };
    $scope.devices = {};
    $scope.transmitters = [];
    $scope.charts = {};
    $scope.showChart = {};
    $scope.expand = true;
    $scope.ordering = DEFAULT_ORDERING;
    $http.defaults.headers.common.Accept = 'application/json';

    $scope.chartColors = COLORS;
    $scope.lineChartOptions = LINE_CHART_OPTIONS;

    function updateQuery() {
      elapsedSeconds += periodSeconds;
      $http({ method: 'GET', url: url })
        .then(function(response) { // Success
          $scope.meta = response.data._meta;
          $scope.links = response.data._links;
          $scope.devices = response.data.devices;
          $scope.transmitters = prepareTransmitters(response.data.devices);
          updateAllCharts(response.data.devices);
        }, function(response) {    // Error
          $scope.meta = response.data._meta;
          $scope.links = response.data._links;
          $scope.devices = {};
          $scope.transmitters = [];
          updateAllCharts({});
      });
    }

    function prepareTransmitters(devices) {
      var transmitterArray = [];
      for(id in devices) {
        var device = devices[id];
        device.id = id;
        device.rssi = device.radioDecodings[0].rssi;
        transmitterArray.push(device);
      }
      return transmitterArray;
    }

    function updateAllCharts(devices) {
      for(device in $scope.charts) {
        if($scope.showChart[device] && devices.hasOwnProperty(device)) {
          updateChart(devices, device);
        }
      }
    }

    function updateChart(devices, device) {
      var chart = $scope.charts[device];
      chart.labels.push(elapsedSeconds);
      var numberOfSamples = Math.min(chart.labels.length,
                                     MAX_LINE_CHART_DATA_POINTS);

      var decodings = devices[device].radioDecodings;
      for(var cReceiver = 0; cReceiver < decodings.length; cReceiver++) {
        var receiverId = decodings[cReceiver].identifier.value;
        var rssi = decodings[cReceiver].rssi;
        var index = chart.series.indexOf(receiverId);
        if(index < 0) {
          chart.series.push(receiverId);
          index = chart.series.indexOf(receiverId);
          chart.data.push([]);
        }
        chart.data[index].push( { x: elapsedSeconds, y: rssi } );
      }
      if(chart.labels.length > MAX_LINE_CHART_DATA_POINTS) {
        chart.labels.shift();
      }
      for(var cSeries = 0; cSeries < chart.series.length; cSeries++) {
        var cSample = 0;
        while(cSample < chart.data[cSeries].length) {
          if(chart.labels.indexOf(chart.data[cSeries][cSample].x) < 0) {
            chart.data[cSeries].shift();
          }
          else {
            cSample++;
          }
        }
      }
    }

    function addChart(device) {
      $scope.charts[device] = {
        labels: [],
        series: [],
        data: []
      };
    }

    function clearChart(device) {
      $scope.charts[device].labels = [];
      $scope.charts[device].series = [];
      $scope.charts[device].data = [];
    }

    $scope.isEmpty = function () {
      return (Object.keys($scope.devices).length === 0);
    }

    $scope.toggleChart = function(device) {
      if($scope.showChart.hasOwnProperty(device) && $scope.showChart[device]) {
        clearChart(device);
        $scope.showChart[device] = false;
      }
      else {
        addChart(device);
        $scope.showChart[device] = true;
      }
    }

    $scope.updatePeriod = function (period) {
      if(period) {
        periodSeconds = period / 1000;
        $scope.pollingMessage = "Polling every " + periodSeconds + "s";
        $interval.cancel($scope.pollingPromise);
        $scope.pollingPromise = $interval(updateQuery, period);
        updateQuery();
      }
      else {
        $scope.pollingMessage = "Polling disabled";
        $interval.cancel($scope.pollingPromise);
      }
    };

    $scope.updateOrdering = function(ordering) {
      switch(ordering) {
        case '+id':
          $scope.ordering = 'id';
          $scope.orderingMessage = 'Increasing ID';
          break;
        case '-id':
          $scope.ordering = '-id';
          $scope.orderingMessage = 'Decreasing ID';
          break;    
        case '+rssi':
          $scope.ordering = 'rssi';
          $scope.orderingMessage = 'Increasing RSSI';
          break;
        case '-rssi':
          $scope.ordering = '-rssi';
          $scope.orderingMessage = 'Decreasing RSSI';
          break; 
      }
    };

    updateQuery();
    $scope.updatePeriod(DEFAULT_POLLING_MILLISECONDS);
    $scope.updateOrdering(DEFAULT_ORDERING);
  });
