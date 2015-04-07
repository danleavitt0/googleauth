angular.module('myApp', ['satellizer', 'ngMaterial'])
  .config(function($authProvider) {
    $authProvider.google({
      clientId: '478642107355-6g2g0u35sfedhlsskfitiekul2jelbf7.apps.googleusercontent.com',
      url: 'auth/google'
    });
  })
  .controller('LoginCtrl', function($scope, $auth, $location, $http){
    $scope.authenticate = function(provider) {
      $auth.authenticate(provider).then(function(response){
        $scope.user = response;
        console.log(response)
        // $scope.activities = response.data.activities.items;
        // $scope.circles = response.data.circles
        // console.log($scope.circles)
      })
    };
    
    $scope.logout = function(){
      $auth.logout();
    };
    
    $scope.isAuthenticated = function() {
      return $auth.isAuthenticated();
    };
  
  });