angular.module('starter.controllers')

.controller('MealsCtrl', function($scope, $ionicModal, $ionicLoading, MealsService, MapService, $state ) {
  // Form data for the login modal

  $scope.loadingLocation = false;
  $scope.doRefresh = function(){
    $scope.mealData = {};
    $scope.meals = MealsService.query();
    MapService.getLocation().then(function(position){
      lastknownLocation = position;
      $scope.mealData.latitude = position.lat;
      $scope.mealData.longitude = position.lng;
    });
    $scope.$broadcast('scroll.refreshComplete');
  }

  $scope.$on("$ionicView.beforeEnter", function(event, data){
    $scope.doRefresh();
  });

  $scope.addMeal = function(){
    $scope.mealData = {
      name: "",
      description: "",
      image: "",
      latitude: 0,
      longitude: 0
    };

    MapService.getLocation().then(function(position){
      lastknownLocation = position;
      $scope.mealData.latitude = position.lat;
      $scope.mealData.longitude = position.lng;
    });

    $scope.openMealForm();
  }


  $scope.getMealLocation = function(data) {
    MapService.pickLocation(true,$scope.mealData.latitude,$scope.mealData.longitude).then(function(position){
      $scope.mealData.latitude = position.lat;
      $scope.mealData.longitude = position.lng;
      console.log(position);
    });

  }

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
        $state.go('app.mymeals');
      })

    } else {
      MealsService.save($scope.mealData,function(){
        $scope.mealFormModal.hide();        
        $ionicLoading.hide();
        $state.go('app.mymeals');       
      });      
    }

  };


})
.controller('MealSearchCtrl', function($scope, $ionicLoading, SearchService, $state ) {
  // Form data for the login modal
  $scope.meals = [];
  $scope.runSearch = function(term){
     $scope.meals = SearchService.query( { q : term } );
  };

})

.controller('MealCtrl', function($scope, $stateParams, $state,$ionicPopup, $ionicLoading, $ionicModal,MealsService,MessageService) {
  $scope.meal = MealsService.get({id: $stateParams.mealId});
  MealsService.get({id: $stateParams.mealId}).$promise.then(function(data){
    $scope.meal = data;

    var myLatlng = new google.maps.LatLng(data.latitude,data.longitude);
    
    mapMyMeals = new google.maps.Map(document.getElementById("mapMyMeals" + data.id),{
      center: myLatlng,
      zoom: 16,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    });

    var myMarker = new google.maps.Marker({
      position: myLatlng,
      map: mapMyMeals
    });

  });

  $scope.$on('$ionicView.beforeLeave', function(){
      mapMyMeals = null;
  });

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