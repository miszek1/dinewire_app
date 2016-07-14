// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
map = null;
baseURL = 'http://dinewire.herokuapp.com/api/v1';
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

.config(function($stateProvider, $urlRouterProvider) {
  $stateProvider

    .state('login', {
      url: '/login',
      templateUrl: 'templates/login.html',
      controller: 'LoginCtrl'
    })

    .state('app', {
      url: '/app',
      abstract: true,
      templateUrl: 'templates/menu.html',
      controller: 'AppCtrl'
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
