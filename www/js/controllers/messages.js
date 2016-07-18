angular.module('starter.controllers')


.controller('MessagesCtrl', function($scope,MessageService) {
  $scope.messages = MessageService.query();

  $scope.doRefresh = function(){
    $scope.messages = MessageService.query();
    $scope.$broadcast('scroll.refreshComplete');
  }
  $scope.$on("$ionicView.beforeEnter", function(event, data){
    $scope.doRefresh();
  });


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