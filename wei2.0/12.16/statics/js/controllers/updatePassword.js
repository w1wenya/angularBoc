(function() {
    "use strict";
    //用户修改密码、退出登录验证
    angular.module('app').controller('updatePasswordCtrl', ['$scope','$state','$rootScope','$stateParams','$modal','httpLoad',function($scope,$state,$rootScope,$stateParams,$modal,httpLoad) {

        $scope.updatePassword = function($event){
            var modalInstance = $modal.open({
                templateUrl : '/statics/tpl/access/updatePassword.html',
                controller : 'updateModalCtrl',
                size : 'sm'
            });
        };

        $scope.loginout = function($event){
            $event.stopPropagation();
            httpLoad.loadData({
                url: '/logout',
                method: 'POST',
                success: function(data){
                    if(data.success){
                        $state.go('access.login');
                    }
                }
            });
        };
    }]);
    //用户修改密码--新增ctrl
    angular.module('app').controller('updateModalCtrl',['$scope','$rootScope','$modalInstance','$location','httpLoad',
        function($scope,$rootScope,$modalInstance,$location,httpLoad){ //依赖于modalInstance
            $scope.isRight = false;
            $scope.isSame = false;
            $scope.isChange = false;

            $scope.getCurrFocus = function($event){
                $scope.isChange = false;
                var oldPassword = $scope.updateData.oldPassword;
                var confirmOldPasswordParams = {id:$rootScope.userData.id,password:oldPassword};
                httpLoad.loadData({
                    url:'/user/check',
                    method:'POST',
                    data:confirmOldPasswordParams,
                    success:function(data){
                        if(data.success){
                            //console.log(confirmOldPasswordParams);
                            $scope.isRight = false;
                            $scope.updatePasswordForm.$invalid = false;
                        }else{
                            $scope.isRight = true;
                            $scope.updatePasswordForm.$invalid = true;
                            $scope.updateData.oldPassword ='';
                        }
                    }
                });
            };
            $scope.getFocus = function($event){
                if($scope.updateData.newPassword == $scope.updateData.oldPassword){
                    $scope.isChange = true;
                    $scope.updatePasswordForm.$invalid = true;
                }else{
                    $scope.isSame = false;
                    $scope.updatePasswordForm.$invalid = false;
                }
            };

            $scope.ok = function(){
                if($scope.updateData.newPassword == $scope.updateData.confirmPassword){
                    $scope.isSame = false;
                    $scope.updatePasswordForm.$invalid = false;
                    var updateData = {id:$rootScope.userData.id,password:$scope.updateData.newPassword,oldPassword:$scope.updateData.oldPassword};
                    httpLoad.loadData({
                        url:'/user/change',
                        method:'POST',
                        data:updateData,
                        success:function(data){
                            if(data.success){
                                //console.log($scope.updateData);
                                //var id = data.data["id"];
                                $scope.pop('密码修改成功');
                                $modalInstance.close();
                                $location.path('/access/login');
                            }
                        }
                    });
                }else{
                    $scope.isSame = true;
                    $scope.updatePasswordForm.$invalid = true;
                }
            };
            $scope.cancel = function(){
                $modalInstance.dismiss('cancel'); // ????
            };
    }]);
})();