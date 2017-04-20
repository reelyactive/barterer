DEFAULT_POLLING_MILLISECONDS = 2000;
DEFAULT_ORDERING = '+id';
MAX_DATA_POINTS = 8;
COLORS = [ '#ff6900', '#0770a2', '#aec844' ];

angular.module('response', [ 'ui.bootstrap', 'n3-line-chart' ])

  // API controller
  .controller('ApiCtrl', function($scope, $http, $interval, $window) {
    var url = $window.location.href;
    var periodSeconds = DEFAULT_POLLING_MILLISECONDS / 1000;
    var elapsedSeconds = 0;
    $scope.meta = { message: "loading", statusCode: "..." };
    $scope.links = { self: { href: url } };
    $scope.devices = {};
    $scope.devicesRSSI = {};
    $scope.transmitters = [];
    $scope.charts = {};
    $scope.showChart = {};
    $scope.expand = true;
    $scope.ordering = DEFAULT_ORDERING;
    $http.defaults.headers.common.Accept = 'application/json';

    function updateQuery() {
      elapsedSeconds += periodSeconds;
      $http({ method: 'GET', url: url })
        .then(function(response) { // Success
          $scope.meta = response.data._meta;
          $scope.links = response.data._links;
          $scope.devices = response.data.devices;
          $scope.transmitters = prepareTransmitters(response.data.devices);
          updateAllRSSI(response.data.devices);
        }, function(response) {    // Error
          $scope.meta = response.data._meta;
          $scope.links = response.data._links;
          $scope.devices = {};
          $scope.transmitters = [];
          updateAllRSSI({});
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

    function updateAllRSSI(devices) {
      for(device in $scope.devicesRSSI) {
        if($scope.showChart[device] && devices.hasOwnProperty(device)) {
          updateRSSI(devices, device);
        }
      }
    }

    function updateRSSI(devices, device) {
      var datapoint = { t: elapsedSeconds };
      var decodings = devices[device].radioDecodings;
      for(var cReceiver = 0; cReceiver < decodings.length; cReceiver++) {
        var receiverId = decodings[cReceiver].identifier.value;
        var rssi = decodings[cReceiver].rssi;
        datapoint[receiverId] = rssi;
        addChartSeries(device, receiverId);
      }
      $scope.devicesRSSI[device].dataset0.push(datapoint);
      if($scope.devicesRSSI[device].dataset0.length > MAX_DATA_POINTS) {
        $scope.devicesRSSI[device].dataset0.shift();
      }
    }

    function addChart(device) {
      $scope.devicesRSSI[device] = { dataset0: [] };
      $scope.charts[device] = {
        series: [],
        axes: {x: {key: "t"}, y: {padding: {min:2, max: 4}}}
      };
    }

    function addChartSeries(device, key) {
      var series = $scope.charts[device].series;
      if(series.length >= COLORS.length) return;
      for(var cSeries = 0; cSeries < series.length; cSeries++) {
        if(series[cSeries].key === key) return;
      }
      series.push({
        axis: "y",
        dataset: "dataset0",
        key: key,
        label: key,
        type: ['line'],
        color: COLORS[series.length]
      });
    }

    function clearChart(device) {
      $scope.charts[device].series = [];
      $scope.devicesRSSI[device].dataset0 = [];
    }

    $scope.isEmpty = function () {
      return (Object.keys($scope.devices).length === 0);
    }

    $scope.toggleChart = function(device) {
      if($scope.showChart.hasOwnProperty(device)) {
        if(!$scope.showChart[device]) {
          addChart(device);
        }
        else {
          clearChart(device);
        }
        $scope.showChart[device] = !$scope.showChart[device];
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
