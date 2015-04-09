angular.module('myApp', ['satellizer', 'ngMaterial'])
  .config(function($authProvider) {
    $authProvider.google({
      clientId: '478642107355-6g2g0u35sfedhlsskfitiekul2jelbf7.apps.googleusercontent.com',
      url: 'auth/google'
    });
  })
  .config( function($mdThemingProvider){
    // Configure a dark theme with primary foreground yellow
    $mdThemingProvider.theme('docs-dark', 'default')
        .primaryPalette('yellow')
        .dark();
  })
  .filter('reverse', function() {
      return function(items) {
        if(items)
          return items.slice().reverse();
      };
  })
  .controller('LoginCtrl', function($scope, $auth, $location, $http){

    if($auth.isAuthenticated())
      getMe();

    $scope.authenticate = function(provider) {
      $auth.authenticate(provider).then(function(response){
        getMe();
      })
    };

    $scope.handleSubmit = function(e) {
      e.preventDefault();
      var post =  {title:this.user.title, body:this.user.body}
      this.user.title = this.user.body = '';
      $http.put('/api/post', post);
      $scope.posts.push(post);
    }

    function randomSpan(max){
      return Math.floor(Math.random()*max) + 1;  
    }

    $scope.removePost = function(i) {
      $http({
        url:'/api/remove',
        method:'delete',
        params:{
          idx:i
        }
      });
      _.pullAt($scope.posts, i)
    }
    
    $scope.logout = function(){
      $auth.logout();
    };
    
    $scope.isAuthenticated = function() {
      var auth = $auth.isAuthenticated();
      return auth;
    };

    function getMe(){
      $http.get('/api/me').
        success(function(data, status, headers, config){
          $scope.user = data;
          $scope.posts = data.posts;
        });
    }
  
  })