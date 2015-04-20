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
    if($auth.isAuthenticated()){
      getMe(getUsers);
    }

    function isMe(u){
      return $scope.user._id === u._id
    }

    io().on('added post', function(user){
      console.log($scope.user.subscribedTo);
      if(_.includes($scope.user.subscribedTo, user._id) || isMe(user)) {
        var post = addToPost(_.last(user.posts), user);
        if(user._id === $scope.user._id)
          post.removable = true;
        $scope.$apply(function(){
          $scope.posts.push(post);
        })
      }
    })

    $scope.authenticate = function(provider) {
      $auth.authenticate(provider).then(function(response){
        getMe(getUsers);

      })
    };

    $scope.handleSubmit = function(e) {
      e.preventDefault();
      var post =  {
        author: $scope.user.displayName, 
        title:this.user.title, 
        body:this.user.body, 
        owner:$scope.user._id,
        picture:$scope.user.picture,
        removable: true
      }
      this.user.title = this.user.body = '';
      $http.put('/api/post', post);
    }

    function randomSpan(max){
      return Math.floor(Math.random()*max) + 1;  
    }

    $scope.removePost = function(i, post) {
      var idx = $scope.posts.length - 1 - i;
      $http({
        url:'/api/remove',
        method:'delete',
        params:{
          id:post._id
        }
      });
      $scope.posts = _.reject($scope.posts, function(el){
        return el._id == post._id;
      })
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

    function addToPost(post, user){
      post.author = user.displayName;
      post.picture = user.picture;
      post.owner = user._id
      return post;
    }

    function setSubscribed() {
      _.each($scope.user.subscribedTo, function(id){
        _.each($scope.people, function(user){
          if(user._id == id) {
            user.subscribed = true;
            _.each(user.posts, function(post){
              $scope.posts.push(addToPost(post, user));
            })
          }
        })
      })
    }

    function getMe(cb){
      cb = cb || function(){};
      $http.get('/api/me').
        success(function(data, status, headers, config){
          $scope.user = data;
          _.each($scope.user.posts, function(el){
            el = addToPost(el, $scope.user)
            el.removable = true;
          })
          $scope.posts = data.posts;
          cb();
        });
    }
  })
  .controller('RightCtrl', function($scope, $mdSidenav, $http){

    $scope.toggleUser = function() {
      if(this.person.subscribed)
        addSubscribe(this.person._id);
      else
        removeSubscribe(this.person._id);
    }

    function removeSubscribe(id) {
      $http({
        method:'get',
        url:'/api/unsubscribe',
        params:{
          id:id
        }
      })
      var posts = _.reject($scope.posts, function(post){
        return post.owner === id;
      })
      $scope.$parent.user.subscribedTo = _.pull($scope.$parent.user.subscribedTo, id)
      $scope.$parent.posts = posts;
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
      .success(function(user){
        _.each(user.posts, function(post){
          post.author = user.displayName;
          post.picture = user.picture;
          post.owner = user._id
          $scope.posts.push(post);
          $scope.$parent.user.subscribedTo.push(user._id);
        })
      })
    }

    function getUser(user) {
      for(var i = 0; i < user.posts.length; i++) {
        user.posts[i].author = user.displayName;
        $scope.posts.push(user.posts[i]);
      }
    }
  })
