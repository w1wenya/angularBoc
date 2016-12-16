(function(){
    "use strict";
    app.controller('DataBaseMainCtrl', ['$rootScope', '$scope', function ($rootScope, $scope) {
        $rootScope.moduleTitle = '资源管理 > 数据库管理';
        $rootScope.link = '/statics/css/tpl-card.css';
        var flag = sessionStorage.getItem('tabLocation')||1;
        switch (flag/1){
            case 1:
                $scope.isP = true;
                break;
            case 2:
                $scope.isCloud = true;
                break;
        }
        sessionStorage.setItem('tabLocation','1');
    }]);
})();