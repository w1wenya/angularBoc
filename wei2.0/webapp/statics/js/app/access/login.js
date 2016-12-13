app.controller('LoginCtrl', ['$scope', '$rootScope', 'httpLoad', '$state', function($scope, $rootScope, httpLoad, $state) {
  $scope.user = {};
  $scope.remember = '';
  $rootScope.link = '/statics/css/login.css';
  $scope.url = "/captcha";
  var userData = JSON.parse(localStorage.getItem('bycUserData'));
  if (userData != null) {
    $scope.user.username = userData.username;
    $scope.remember = userData.remember;
    if($scope.remember) $scope.user.password = userData.password;
  }
  //登陆接口
  $scope.login = function() {
    var user = {
      username: $scope.user.username,
      remember: $scope.remember
    };
    httpLoad.loadData({
      url : '/login',
      method : 'POST',
      noParam: true,
      data : {
        username : $scope.user.username,
        password : $scope.user.password,
        code : $scope.user.code
      },
      success : function(data) {
        if (data.success) {
          if ($scope.remember) {
            user.password = $scope.user.password;
          }
          var userData = data.data.user;
          $.extend(true,userData,user);
          localStorage.setItem('bycUserData', JSON.stringify(userData));
          localStorage.setItem('menuData', JSON.stringify(data.data.auths));
          $rootScope.userData = userData;
          $state.go('app.graph.dashboard');
        }
      }
    });
  };
  //刷新验证码
  $scope.refreshCode = function(){
    var index = parseInt(Math.random()*10);
    $scope.url = "/captcha?" + index;
    $scope.user.code = '';
  };
}]);
app.directive('ngAutoPos', ['httpLoad','$rootScope', function (httpLoad, $rootScope) {
  return {
    restrict: 'EA',
    scope:false,
    link: function (scope, element, attrs) {
      var setPos = function(){
        var top = ($(window).height() - 669)/2;
        $(element).css({"margin-top":top+"px"});
      };
      setPos();
      window.onresize = function(){
        setPos();
      }
    }
  }
}]);
