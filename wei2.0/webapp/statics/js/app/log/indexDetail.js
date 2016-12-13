angular.module('app').controller('indexDetailCtrl', ['$rootScope', '$scope','$state','httpLoad','$modal','$stateParams','LANGUAGE',function($rootScope, $scope,$state,httpLoad,$modal,$stateParams,LANGUAGE) {
    $rootScope.link = '/statics/css/user.css';//引入页面样式
    $rootScope.moduleTitle = '日志管理 > 索引详情';
 
    (function(){
        var id = $stateParams.id;
        //获取租户下的用户列表
        $scope.getDetail = function(){ 
            var dataparam = {
 					params: id
 		    };
    		httpLoad.loadData({
                url:'/indexmng/logIndex/detail',
                method:'POST',
                data: dataparam,    //传递数据 
                noParam: true,
                success:function(data){
                	var indexNm = 'logstash-20xx';
                	if (!data) {
                		return;
                	}
                	if (data.solution) {
                		var indexInfo = eval("(" + data.solution + ")"); 
                		indexNm = indexInfo.indexName;
                		$scope.indexName = indexInfo.indexName;  
                		$scope.status = indexInfo.status; 
                	}                	
                	if(data.success&&data.data){                  		
                		var jsonObj = eval("(" + data.data.replace(indexNm,'indexName') + ")");    
                		$scope.indexDetail = {
                				refreshTime:jsonObj.indexName.settings.index.refresh_interval,
                				shardsNumbers:jsonObj.indexName.settings.index.number_of_shards,
                				replicasNumbers:jsonObj.indexName.settings.index.number_of_replicas,
                				creation_date:jsonObj.indexName.settings.index.creation_date
                		};
                    }else{
                        $scope.isImageData = true;
                    }  
                }
            });		             
        };
        $scope.getDetail(); 
    })();    
    
    $scope.goBack = function(){
        $state.go('app.log.indexmng');
    };       
     
	
}]);

