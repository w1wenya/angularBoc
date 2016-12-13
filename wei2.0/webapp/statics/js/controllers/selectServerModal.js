/**
 * Created by Zhang Haijun on 2016/10/28.
 */
//选择服务器ctrl
app.controller('selectServerModalCtrl', ['$scope', 'httpLoad', '$modalInstance','selectList',
	function($scope, httpLoad, $modalInstance, selectList) {
		$scope.param = {
			page: 1,
			rows: 10
		}
		var selectList = angular.fromJson(selectList);
		$scope.getList = function(page){
			$scope.param.page = page || $scope.param.page;
			$scope.isSelectAll = false;
			//获取已选主机的IPlist
			var ipList = [];
			for(var a in selectList){
				ipList.push(selectList[a].ip);
			}
			httpLoad.loadData({
				url:'/target/server/list',
				method:'POST',
				noParam: true,
				data:$scope.param,
				success:function(data){
					if(data.success){
						$scope.listData = data.data.rows;
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
		$scope.getList();
		//对选择的数据进行操作
		var setSelectList = function(data){
			if(data.isSelected){
				selectList.push(data);
			}else{
				for(var j = 0; j < selectList.length; j++){
					var item = selectList[j];
					if(item.ip == data.ip) selectList.splice(j,1)
				}
			}
			
		}
		//全选
		$scope.selectAll = function($event){
			$event.stopPropagation();$event.preventDefault();
			$scope.isSelectAll = !$scope.isSelectAll;
			$scope.listData.forEach(function (item,index) {
				if($scope.isSelectAll != item.isSelected){
					item.isSelected = $scope.isSelectAll;
					setSelectList(item);
				}else item.isSelected = $scope.isSelectAll;
			});
		};
		//选择一个
		$scope.selectItem = function ($event,row) {
			$event.stopPropagation();
			$event.preventDefault();
			row.isSelected = !row.isSelected;
			setSelectList(row);
		}
		//对参数进行处理，去除空参数
		var toObjFormat = function(obj) {
			for (var a in obj) {
				if (obj[a] == "") delete obj[a];
			}
			return obj;
		};
		//搜索
		$scope.search = function(){
			var params = [];
			var param1 = toObjFormat({
				name:$scope.name,
				managerIp:$scope.ip,
				platform:$scope.platform
			});
			if (angular.toJson(param1).length > 2) params.push({param: param1, sign: 'LK'});
			$scope.param = {
				page: 1,
				rows: 10,
				params: angular.toJson(params)
			}
			$scope.getList(1)
		}
		$scope.ok = function () {
			$modalInstance.close(selectList);
		}
		$scope.cancle = function () {
			$modalInstance.dismiss('cancel');
		};
	}
])