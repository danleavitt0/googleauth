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
  .controller('LoginCtrl', function($scope, $auth, $location, $http, $mdSidenav){

    $scope.posts = [];
    if($auth.isAuthenticated())
      getMe();
      getUsers();
    }

    $scope.authenticate = function(provider) {
      $auth.authenticate(provider).then(function(response){
        getMe();
        getUsers();
      })
    };

    $scope.handleSubmit = function(e) {
      e.preventDefault();
      var post =  {
        author: $scope.user.displayName, 
        title:this.user.title, 
        body:this.user.body, 
        owner:$scope.user._id,
        picture:$scope.user.picture
      }
      this.user.title = this.user.body = '';
      $http.put('/api/post', post);
      $scope.posts.push(post);
    }

    function randomSpan(max){
      return Math.floor(Math.random()*max) + 1;  
    }

    $scope.removePost = function(i) {
      var idx = $scope.posts.length - 1 - i;
      $http({
        url:'/api/remove',
        method:'delete',
        params:{
          idx:idx
        }
      });
      _.pullAt($scope.posts, idx)
    }
    
    $scope.logout = function(){
      $auth.logout();
    };
    
    $scope.isAuthenticated = function() {
      var auth = $auth.isAuthenticated();
      return auth;
    };

    $scope.sideOpen = function(){
      $mdSidenav('left').toggle();
    }

    function getUsers() {
      $http({
        method:'get',
        url:'/api/getUsers'
      })
      .success(function(data){
        $scope.people = _.reject(data, function(person){
          return person._id == $scope.user._id
        });
        setSubscribed();
      })
      .error(function(data){
        console.log(data);
      })
    }

    function setSubscribed() {
      console.log('setSubscribed');
      _.each($scope.user.subscribedTo, function(id){
        _.each($scope.people, function(user){
          console.log(user);
          if(user._id == id) {
            user.subscribed = true;
            _.each(user.posts, function(post){
              post.author = user.displayName;
              post.picture = user.picture;
              post.owner = user._id
              $scope.posts.push(post);
            })
          }
        })
      })
    }

    function getMe(){
      $http.get('/api/me').
        success(function(data, status, headers, config){
          $scope.user = data;
          _.each($scope.user.posts, function(el){
            el.author = $scope.user.displayName;
            el.owner = $scope.user._id
            el.picture = $scope.user.picture;
            el.removable = true;
          })
          $scope.posts = data.posts;
        });
    }
  })
  .controller('RightCtrl', function($scope, $mdSidenav, $http){

    $scope.toggleUser = function() {
      if(this.person.subscribed)
        addSubscribe(this.person._id).bind(this);
      else
        removeSubscribe(this.person._id);
    }

    function removeSubscribe(id) {
      $http({
        method:'delete',
        url:'/api/unsubscribe',
        params:{
          id:id
        }
      })
      $scope.posts = _.filter($scope.posts, function(post){
        post.owner === id;
      })
    }

    function addSubscribe(id){
      $http({
        method:'put',
        url:'/api/subscribe',
        params:{
          id:id
        }
      });

      $http({
        method:'get',
        url:'/api/getUser',
        params:{
          id:id
        }
      })
      .success(function(data){
        getUser(data);
        this.setSubscribed();
      })
    }

    function getUser(user) {
      for(var i = 0; i < user.posts.length; i++) {
        user.posts[i].author = user.displayName;
        $scope.posts.push(user.posts[i]);
      }
    }
  })
