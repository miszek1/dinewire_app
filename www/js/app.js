// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
map = null;
//baseURL = 'http://dinewire.herokuapp.com/api/v1';
baseURL = 'http://10.0.1.6:3000/api/v1';
lastknownLocation = null;
token = null;
function distance(lat1, lon1, lat2, lon2) {
  var radlat1 = Math.PI * lat1/180
  var radlat2 = Math.PI * lat2/180
  var theta = lon1-lon2
  var radtheta = Math.PI * theta/180
  var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
  dist = Math.acos(dist)
  dist = dist * 180/Math.PI
  dist = dist * 60 * 1.1515
  return dist
}

angular.module('starter', ['ionic','ngResource', 'starter.controllers', 'starter.services'])

.run(function($ionicPlatform,$rootScope,$state) {

  $ionicPlatform.ready(function() {
     
    // $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams) {
    //   var loggedIn = false;
    //   if(loggedIn) {
    //       $state.go('app.meals');
    //   } else {
    //       $state.go('app.login');          
    //   }
    // });
   
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);

    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }

  });
})
.config(function($httpProvider) {
  $httpProvider.defaults.headers.common.authentication = window.localStorage.getItem('auth');
})
.config(function($stateProvider, $urlRouterProvider,$httpProvider) {
  $stateProvider

    .state('login', {
      url: '/login',
      templateUrl: 'templates/login.html',
      controller: 'LoginCtrl',
      resolve:{
        item: function($localstorage,$state,$timeout,authService){
          if($localstorage.get("auth",0) != 0){
            $httpProvider.defaults.headers.common.authentication = window.localStorage.getItem('auth');
            $timeout(function(){$state.go('app.meals');},200);
          } 
        }
      }
    })

    .state('app', {
      url: '/app',
      abstract: true,
      templateUrl: 'templates/menu.html',
      controller: 'AppCtrl'
    })

    .state('app.mymeals', {
      url: '/mymeals',
        views: {
          'menuContent': {
            templateUrl: 'templates/my_meals/list.html',
            controller: 'MyMealsCtrl'
          }
      }
    })
    .state('app.mymeal', {
      url: '/mymeals/:mealId',
      views: {
        'menuContent': {
          templateUrl: 'templates/my_meals/item.html',
          controller: 'MyMealCtrl'
        }
      }
    })
    .state('app.meals', {
      url: '/meals',
        views: {
          'menuContent': {
            templateUrl: 'templates/meals/list.html',
            controller: 'MealsCtrl'
          }
      }
    })

    .state('app.meal', {
      url: '/meals/:mealId',
      views: {
        'menuContent': {
          templateUrl: 'templates/meals/item.html',
          controller: 'MealCtrl'
        }
      }
    })
    .state('app.messages', {
      url: '/messages',
        views: {
          'menuContent': {
            templateUrl: 'templates/messages/list.html',
            controller: 'MessagesCtrl'
          }
      }
    })

    .state('app.message', {
      url: '/messages/:messageId',
      views: {
        'menuContent': {
          templateUrl: 'templates/messages/item.html',
          controller: 'MessageCtrl'
        }
      }
    });
  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/login');
})
.filter('formatDate',function ($filter) {

    return function(date){

      return $filter('date')(date, "MMMM dd,yyyy", "UTC");

    }

})    
.filter('distance', function($q,MapService) {

  return function(locationItem) {
    var q = $q.defer();
    if(locationItem.latitude <= 0) {
      return "No Distance";
    }
    if(!lastknownLocation){
      MapService.getLocation().then(function(position){
        lastknownLocation = position;
        var dist = distance(lastknownLocation.lat, lastknownLocation.lng, locationItem.latitude, locationItem.longitude);
        return dist.toFixed(2) + " mi.";
      });
    } else {
      var dist = distance(lastknownLocation.lat, lastknownLocation.lng, locationItem.latitude, locationItem.longitude);
      return dist.toFixed(2) + " mi.";
      
    }
    return q.promise;
  };
})
.directive('fileModel', ['$parse', function ($parse) {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            var model = $parse(attrs.fileModel);
            var modelSetter = model.assign;

            element.bind('change', function () {
                scope.$apply(function () {
                    modelSetter(scope, element[0].files[0]);
                });
            });
        }
    };
}]);
