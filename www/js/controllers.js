angular.module('starter.controllers', [])

.controller('AppCtrl', function($scope, $ionicModal, $timeout) {

})
.controller('LoginCtrl', function($scope, $ionicPopup, $state,$timeout , $localstorage, $ionicLoading, LoginService) {
    $scope.data = {};
    $scope.login = function() {
      $ionicLoading.show({template: '<ion-spinner></ion-spinner><div>Signing In...</div>'});
        LoginService.save({body:$scope.data},function(data) {
          if(data.success){
            console.log(data);
            $localstorage.set('auth',data.user.authentication_token);
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
})

.controller('MealsCtrl', function($scope, $ionicModal,$ionicLoading,MealsService) {
  $scope.meals = MealsService.query();
  // Form data for the login modal
  // 
  $scope.loadingLocation = false;
  $scope.mealData = {};


  $scope.deleteMeal = function(meal,idx){
   MealsService.remove({id: meal.id},function(){
    $scope.meals.splice(idx, 1);
   }); 
  }

  $scope.addMeal = function(){
     $scope.mealData = {
      name: "",
      description: "",
      image: "",
      latitude: 0,
      longitude: 0
    };
    $scope.getLocation();
    $scope.openMealForm();
  }


  $scope.editMeal = function(meal){
   $scope.mealData = MealsService.get({id: meal.id},function(){
    $scope.openMealForm();
   }); 
  }

  $scope.getLocation = function(){
    $scope.loadingLocation = true;
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position){
            setTimeout(function () {
              $scope.$apply(function(){
                $scope.loadingLocation = false;
                $scope.mealData.latitude = position.coords.latitude.toFixed(5); 
                $scope.mealData.longitude = position.coords.longitude.toFixed(5);
              });
            }, 20);         
        },function(){
          $scope.loadingLocation = false;          
        });
    } else {
      $scope.loadingLocation = false;
    }
  };


  // Create the login modal that we will use later
  $ionicModal.fromTemplateUrl('templates/meal_form.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.mealFormModal = modal;
  });

  $scope.closeMealForm = function() {
    $scope.mealFormModal.hide();
  };

  $scope.openMealForm = function() {
    $scope.mealFormModal.show();
  };

  $scope.sendMealForm = function() {
    $ionicLoading.show();
    if($scope.mealData.hasOwnProperty('id') && $scope.mealData.id > 0){
      MealsService.update($scope.mealData,function(){
        $scope.mealFormModal.hide();        
        $ionicLoading.hide();
        $scope.meals = MealsService.query();
      })

    } else {
      MealsService.save($scope.mealData,function(){
        $scope.mealFormModal.hide();        
        $ionicLoading.hide();
        $scope.meals = MealsService.query();        
      });      
    }

  };


})

.controller('MealCtrl', function($scope, $stateParams, $state,$ionicPopup, $ionicLoading, $ionicModal,MealsService,MessageService) {
  $scope.meal = MealsService.get({id: $stateParams.mealId});



  $scope.deleteMeal = function(meal) {
     var confirmPopup = $ionicPopup.confirm({
       title: 'Delete Meal',
       template: 'Are you sure you want to delete this meal?'
     });

     confirmPopup.then(function(res) {
       if(res) {
        MealsService.remove({id: meal.id},function(){
          $state.go("app.meals")
        }); 
       }
     });
   };


  // Form data for the login modal
  $scope.messageData = {};

  // Create the login modal that we will use later
  $ionicModal.fromTemplateUrl('templates/message_form.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.messageModal = modal;
  });

  // Triggered in the login modal to close it
  $scope.closeMessage = function() {
    $scope.messageModal.hide();
  };

  // Open the login modal
  $scope.openMessage = function(meal) {
    $scope.messageData.recipient_id =  meal.user_id;
    $scope.messageModal.show();
  };

  // Open the login modal
  $scope.sendMessage = function() {
    $ionicLoading.show();
    MessageService.save({body: $scope.messageData},function(){
      $ionicLoading.hide();
    });
    $scope.messageModal.hide();
  };


})

.controller('MessagesCtrl', function($scope,MessageService) {
  $scope.messages = MessageService.query();

  $scope.deleteMessage = function(message,idx){
   MessageService.remove({id: message.id},function(){
    $scope.messages.splice(idx, 1);
   }); 
  }




})

.controller('MessageCtrl', function($scope, $stateParams,$filter,$state,$ionicPopup,$ionicModal, $ionicLoading, MessageService) {
  $scope.message = MessageService.get({id: $stateParams.messageId});

   $scope.deleteMessage = function(message) {
   var confirmPopup = $ionicPopup.confirm({
     title: 'Delete Message',
     template: 'Are you sure you want to delete this message?'
   });

   confirmPopup.then(function(res) {
     if(res) {
      MessageService.remove({id: message.id},function(){
        $state.go("app.messages")
      }); 
     }
   });
 };

   // Form data for the login modal
  $scope.messageData = {};

  // Create the login modal that we will use later
  $ionicModal.fromTemplateUrl('templates/message_form.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.messageModal = modal;
  });

  // Triggered in the login modal to close it
  $scope.closeMessage = function() {
    $scope.messageModal.hide();
  };

  // Open the login modal
  $scope.openReply = function(message) {
    $scope.messageData.recipient_id =  message.user_id;
    $scope.messageModal.show();
  };

  // Open the login modal
  $scope.sendMessage = function() {
    $ionicLoading.show();
    MessageService.save({body: $scope.messageData},function(){
      $ionicLoading.hide();
      $scope.messageModal.hide();
    });
  };
});
