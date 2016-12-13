/**
 * Created by wangwenya on 2016/10/27.
 */
/**
 * Created by wangwenya on 2016/10/27.
 */
(function(){
    "use strict";
    app.controller('IosListCtrl', ['$scope', 'httpLoad', '$rootScope','$modal','$timeout','$state','LANGUAGE',
        function($scope, httpLoad, $rootScope, $modal, $timeout, $state, LANGUAGE) {
            $rootScope.moduleTitle = '自动装机 > 镜像管理 ';//定义当前页
            $scope.param = {
                page: 1,
                rows: 10,
            };
            $scope.showDetail = false;
            $scope.getList = function(page){
                $scope.param.page = page || $scope.param.page;
                httpLoad.loadData({
                    url:'/statics/api/autos/machine/machine-list.json',
                    method:'GET',
                    noParam: true,
                    data:$scope.param,
                    success:function(data){
                        if(data.success){
                            $scope.listData = data.data.rows;
                            $scope.totalPage = data.data.total;
                        }
                    }
                });
            }
            $scope.getList();
            //对参数进行处理，去除空参数
            var toObjFormat = function(obj) {
                for (var a in obj) {
                    if (obj[a] == "") delete obj[a];
                }
                return obj;
            };

            //搜索
            $scope.search = function(){
                // //对时间进行处理
                // var toFormatTime = function(time, place) {
                // 	if (!time) return "";
                // 	var date = time.split(' - ');
                // 	return date[place/1];
                // }
                var params = [];
                var param1 = toObjFormat({
                    name:$scope.name,
                });
                var param2 = toObjFormat({
                    level: $scope.level,
                    appId: $scope.appId,
                    dsId: $scope.dsId
                });
                if (angular.toJson(param1).length > 2) params.push({param: param1, sign: 'LK'});
                if (angular.toJson(param2).length > 2) params.push({param: param2, sign: 'EQ'});
                $scope.param = {
                    page: 1,
                    rows: 10,
                    params: angular.toJson(params)
                }
                $scope.getList(1)
            }
            //重置搜索条件
            $scope.reset = function(){
                var obj = ['name','level','appId','dsId'];
                angular.forEach(obj,function(data){
                    $scope[data] = '';
                })
            }

            //详情
            $scope.goDetail = function(id){
                $scope.showDetail = true;

                $state.go('app.autos.machinedetail',{id:id})
                httpLoad.loadData({
                    url:'/target/server/list',
                    method:'POST',
                    noParam: true,
                    data:$scope.param,
                    success:function(data){
                        if(data.success){
                            $scope.Datadetail = data.data.rows;
                            //数据反显
                            for(var i = 0; i < $scope.listData.length; i++){
                                var item = $scope.listData[i];
                                if(ipList.indexOf(item.ip) > -1) item.isSelected = true;
                            };
                            $scope.totalPage = data.data.total;
                        }
                    }
                });
            }

        }
    ]);

})()