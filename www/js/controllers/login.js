angular.module('starter.controllers')

.controller('LoginCtrl', function($scope, $ionicPopup, $state, $timeout, $localstorage,$http, $ionicLoading, $ionicModal, LoginService, authService) {
    $scope.data = {};
    $scope.login = function() {
      $ionicLoading.show({template: '<ion-spinner></ion-spinner><div>Signing In...</div>'});
        LoginService.save({body:$scope.data},function(data) {
          if(data.success){
            $localstorage.set("auth",data.user.authentication_token);
            $http.defaults.headers.common.authentication = data.user.authentication_token;
            $ionicLoading.hide();
            $state.go('app.meals');
          } else {
            $ionicLoading.hide();
            var alertPopup = $ionicPopup.alert({
                title: 'Login failed!',
                template: '<div style="text-align:center">Incorrect Username or Password.</div>'
            });
          }

        },function(){
          $ionicLoading.hide();
            var alertPopup = $ionicPopup.alert({
                title: 'Login failed!',
                template: '<div style="text-align:center">Incorrect Username or Password.</div>'
            });
        });
    }
    $scope.logout = function() {
        for(var i in $localstorage.getAll()){
          $localstorage.deleteItem(i);
        }
        $state.go('login');
    }

  $scope.signupData = {
    first_name: '',
    last_name: '',
    user_name: '',
    email: '',
    password: '',
    password_confirmation: ''
  };

  // Create the login modal that we will use later
  $ionicModal.fromTemplateUrl('templates/signup.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.signupModal = modal;
  });

  $scope.closeSignupForm = function() {
    $scope.signupModal.hide();
  };

  $scope.openSignupForm = function() {
    $scope.signupModal.show();
  };

  $scope.registerAccount = function() {
    $ionicLoading.show();
    var saveData = angular.extend({}, $scope.signupData);
    var errors = [];
    if(saveData.first_name == '') errors.push('Please enter an First Name');
    if(saveData.last_name == '') errors.push('Please enter an Last Name');
    if(saveData.user_name == '') errors.push('Please enter an Username');
    if(saveData.email == '') errors.push('Please enter an Email');
    if(saveData.password == '') errors.push('Please enter a Password');
    if(saveData.password != saveData.password_confirmation) errors.push('Your Password confirmation does not match your password');
    if(errors.length){
      $ionicLoading.hide();
      alert(errors.join("\n"));
      return false;
    } 

    var req = {
      method: 'POST',
      url: baseURL + '/users',
      dataType:'json',
      data: {
        user: saveData
      }
    };

    $http(req).then(function(response){
        console.log(response);
        $localstorage.set('auth',response.data.authentication_token);
        $ionicLoading.hide();
        $scope.signupModal.hide();
        $state.go('app.meals');
    },function(response){
        var message = [];
        for(i in response.data.errors){
          message.push(i + " " + response.data.errors[i].join(", "));
        }
        $ionicLoading.hide();
        alert(errors.join("\n"));
        return false;
    });

  };


})