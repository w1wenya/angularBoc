'use strict';

/**
 * Config for the router
 */
angular.module('app')
	.run(['$rootScope', '$state', '$stateParams', '$location', 'IGNOREPERMISSION',
			function ($rootScope, $state, $stateParams, $location, IGNOREPERMISSION) {
				$rootScope.$state = $state;
				$rootScope.$stateParams = $stateParams;

				//加入权限控制
				$rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams) {
					if(!fromState.name) return;
					var currentUrl = toState.name;
					var searchVal = currentUrl.replace(/\./g,'');
					if (IGNOREPERMISSION.IGNORELIST.indexOf(searchVal) < 0) {
						// $location.path('/access/login');
						// $state.go('access.login');
					}
				});
			}]
	).config(['$stateProvider', '$urlRouterProvider', '$locationProvider', 'JQ_CONFIG', 'MODULE_CONFIG',
			function ($stateProvider, $urlRouterProvider, $locationProvider, JQ_CONFIG, MODULE_CONFIG) {
				var layout = "/statics/tpl/app.html";
				$urlRouterProvider
					.otherwise('/access/login');
				$stateProvider
					.state('access', {
						url: '/access',
						template: '<div ui-view class="fade-in-right-big smooth"></div>'
					}).state('access.login', {
					url: '/login',
					templateUrl: '/statics/tpl/access/login.html',
					controller: 'LoginCtrl',
					resolve: load(['/statics/js/app/access/login.js'])
				}).state('app', {
					abstract: true,
					url: '/app',
					templateUrl: layout
				}).state('app.graph', {
					url: '/graph',
					template: '<div ui-view class="fade-in-up"></div>'
				}).state('app.graph.dashboard', {
					url: '/dashboard',
					templateUrl: '/statics/tpl/graph/dashborad.html',
					resolve: load(['/statics/js/app/graph/dashborad.js','/statics/libs/assets/echarts/echarts.min.js'])
				}).state('app.assets', {
					url: '/assets',
					template: '<div ui-view class="fade-in-up"></div>'
				}).state('app.assets.datacenter', {
					url: '/datacenter',
					templateUrl: '/statics/tpl/assets/datacenter/list.html',
					resolve: load(['/statics/js/app/assets/datacenter.js'])
				}).state('app.assets.centerdetail', {
					url: '/centerdetail/:id',
					templateUrl: '/statics/tpl/assets/datacenter/detail.html',
					resolve: load(['/statics/js/app/assets/datacenterdetail.js','/statics/js/app/assets/room.js'])
				}).state('app.assets.room', {
					url: '/room',
					templateUrl: '/statics/tpl/assets/room/list.html',
					resolve: load(['/statics/js/app/assets/room.js'])
				}).state('app.assets.roomdetail', {
					url: '/roomdetail/:id',
					templateUrl: '/statics/tpl/assets/room/detail.html',
					resolve: load(['/statics/js/app/assets/roomdetail.js','/statics/js/app/assets/rack.js'])
				}).state('app.assets.rack', {
					url: '/rack',
					templateUrl: '/statics/tpl/assets/rack/list.html',
					resolve: load(['/statics/js/app/assets/rack.js'])
				}).state('app.assets.rackdetail', {
					url: '/rackdetail/:id',
					templateUrl: '/statics/tpl/assets/rack/detail.html',
					resolve: load(['/statics/js/app/assets/rackdetail.js','/statics/js/app/assets/server.js'])
				}).state('app.assets.server', {
					url: '/server',
					templateUrl: '/statics/tpl/assets/server/list.html',
					resolve: load(['/statics/js/app/assets/server.js'])
				}).state('app.assets.serverdetail', {
					url: '/serverdetail/:id',
					templateUrl: '/statics/tpl/assets/server/detail.html',
					resolve: load(['/statics/js/app/assets/serverdetail.js'])
				}).state('app.assets.vm', {
						url: '/vm',
						templateUrl: '/statics/tpl/config/vm/vm.html',
						resolve: load(['/statics/js/app/config/vm.js'])
					}).state('app.assets.vmTab', {
						url: '/vmTab/:id',
						templateUrl: '/statics/tpl/config/vm/tab.html',
						resolve: load(['/statics/js/app/config/vmTab.js','smart-table'])
					}).state('app.assets.vmDetail', {
						url: '/vmDetail/:id/:vmId',
						templateUrl: '/statics/tpl/config/vm/detail.html',
						resolve: load(['/statics/js/app/config/vmDetail.js'])
					}).state('app.assets.vmAdd', {
						url: '/vmAdd/:id',
						templateUrl: '/statics/tpl/config/vm/add.html',
						resolve: load(['/statics/js/app/config/vmAdd.js'])
					}).state('app.assets.vmUpdate', {
						url: '/vmUpdate/:id/:vmId',
						templateUrl: '/statics/tpl/config/vm/update.html',
						resolve: load(['/statics/js/app/config/vmUpdate.js'])
				}).state('app.assets.storage', {
						url: '/storage',
						templateUrl: '/statics/tpl/assets/storage/storage.html',
						resolve: load(['/statics/js/app/assets/storage.js'])
					}).state('app.assets.storageTab', {
						url: '/storageTab/:id',
						templateUrl: '/statics/tpl/assets/storage/tab.html',
						resolve: load(['/statics/js/app/assets/storageTab.js','smart-table'])
					}).state('app.assets.bucketDetail', {
						url: '/bucketDetail/:id/:bucketId',
						templateUrl: '/statics/tpl/assets/storage/bucket/detail.html',
						resolve: load(['/statics/js/app/assets/bucketDetail.js'])
				}).state('app.assets.image', {
						url: '/image',
						templateUrl: '/statics/tpl/assets/image/image.html',
						resolve: load(['/statics/js/app/assets/image.js'])
					}).state('app.assets.imageDetail', {
						url: '/imageDetail/:id/:vmId',
						templateUrl: '/statics/tpl/assets/image/detail.html',
						resolve: load(['/statics/js/app/assets/imageDetail.js'])
				}).state('app.assets.volume', {
						url: '/volume',
						templateUrl: '/statics/tpl/assets/volume/volume.html',
						resolve: load(['/statics/js/app/assets/volume.js'])
					}).state('app.assets.volumeAdd', {
						url: '/volumeAdd/:id',
						templateUrl: '/statics/tpl/assets/volume/addJd.html',
						resolve: load(['/statics/js/app/assets/volumeAdd.js'])
					}).state('app.assets.volumeDetail', {
						url: '/volumeDetail/:id/:vmId',
						templateUrl: '/statics/tpl/assets/volume/detail.html',
						resolve: load(['/statics/js/app/assets/volumeDetail.js'])
				}).state('app.assets.snapshot', {
						url: '/snapshot',
						templateUrl: '/statics/tpl/assets/snapshot/snapshot.html',
						resolve: load(['/statics/js/app/assets/snapshot.js'])
					}).state('app.assets.snapshotDetail', {
						url: '/snapshotDetail/:id/:vmId',
						templateUrl: '/statics/tpl/assets/snapshot/detail.html',
						resolve: load(['/statics/js/app/assets/snapshotDetail.js'])
				}).state('app.assets.flavor', {
						url: '/flavor',
						templateUrl: '/statics/tpl/assets/size/size.html',
						resolve: load(['/statics/js/app/assets/size.js'])
					}).state('app.assets.flavorDetail', {
						url: '/flavorDetail/:id/:vmId',
						templateUrl: '/statics/tpl/assets/size/detail.html',
						resolve: load(['/statics/js/app/assets/sizeDetail.js'])
				}).state('app.assets.network', {
						url: '/network',
						templateUrl: '/statics/tpl/assets/network/network.html',
						resolve: load(['/statics/js/app/assets/network.js'])
					}).state('app.assets.networkDetail', {
						url: '/networkDetail/:id/:vmId',
						templateUrl: '/statics/tpl/assets/network/detail.html',
						resolve: load(['/statics/js/app/assets/networkDetail.js'])
				}).state('app.assets.tenantQuota', {
						url: '/tenantQuota',
						templateUrl: '/statics/tpl/assets/tenantQuota/tenantQuota.html',
						resolve: load(['/statics/js/app/assets/tenantQuota.js'])
					}).state('app.assets.tenantQuotaDetail', {
						url: '/tenantQuotaDetail/:id',
						templateUrl: '/statics/tpl/assets/tenantQuota/detail.html',
						resolve: load(['/statics/js/app/assets/tenantQuotaDetail.js'])
				}).state('app.assets.securityDetail', {
						url: '/securityDetail/:id',
						templateUrl: '/statics/tpl/assets/security/detail.html',
						resolve: load(['/statics/js/app/assets/securityDetail.js'])
				}).state('app.assets.database', {
					url: '/database',
					templateUrl: '/statics/tpl/assets/database/index.html',
					resolve: load(['/statics/js/app/assets/database/database.js'])
				}).state('app.assets.dblist', {
					url: '/dblist/:flag/:id',
					templateUrl: '/statics/tpl/assets/database/list.html',
					resolve: load(['/statics/js/app/assets/database/dblist.js'])
				}).state('app.assets.dbdetail', {
					url: '/dbdetail/:flag/:id',
					templateUrl: '/statics/tpl/assets/database/detail.html',
					resolve: load(['/statics/js/app/assets/database/detail.js'])
				}).state('app.assets.adddb', {
					url: '/adddb/:flag/:id',
					templateUrl: '/statics/tpl/assets/database/adddb.html',
					resolve: load(['/statics/js/app/assets/database/adddb.js'])
				}).state('app.operation', {
					url: '/operation',
					template: '<div ui-view class="fade-in-up"></div>',
					resolve: load(['taskLayout'])
				}).state('app.operation.dashboard', {
					url: '/dashboard',
					templateUrl: '/statics/tpl/operation/dashborad/dashborad.html',
					resolve: load(['/statics/libs/assets/echarts/echarts.min.js','/statics/js/app/operation/dashborad.js'])
				}).state('app.operation.quick', {
					url: '/quick',
					templateUrl: '/statics/tpl/operation/quick/quick.html',
					resolve: load(['ui.select', '/statics/js/app/operation/quick.js', 'smart-table'])
				}).state('app.operation.tasklist', {
					url: '/tasklist',
					templateUrl: '/statics/tpl/operation/tasklist/list.html',
					resolve: load(['/statics/js/app/operation/tasklist.js','smart-table','clipboard','/statics/js/directives/auto-complete.js'])
				}).state('app.operation.history', {
					url: '/history',
					templateUrl: '/statics/tpl/operation/history/history.html',
					resolve: load(['/statics/js/app/operation/history.js','/statics/js/directives/auto-complete.js'])
				}).state('app.operation.newtask', {
					url: '/newtask/:flag/:id',
					templateUrl: '/statics/tpl/operation/newtaskcopy/newtask.html',
					resolve: load(['/statics/js/app/operation/newtaskcopy.js','ui.select','smart-table'])
				}).state('app.operation.tasktpl', {
					url: '/tasktpl',
					templateUrl: '/statics/tpl/operation/tasktpl/list.html',
					resolve: load(['/statics/js/app/operation/tasktpl.js','smart-table','/statics/js/directives/auto-complete.js'])
				}).state('app.operation.timedOperation', {
						url: '/timedOperation',
						templateUrl: '/statics/tpl/operation/timedOperation/timedOperation.html',
						resolve: load(['/statics/js/app/operation/timedOperation.js'])
				}).state('app.operation.timedOperationDetail', {
						url: '/timedOperationDetail/:id',
						templateUrl: '/statics/tpl/operation/timedOperation/detail.html',
						resolve: load(['/statics/js/app/operation/timedOperationDetail.js'])
				}).state('app.operation.backupRecovery', {
					url: '/backupRecovery',
					templateUrl: '/statics/tpl/operation/backupRecovery/list.html',
					resolve: load(['/statics/js/app/operation/backupRecovery.js','smart-table'])
				}).state('app.operation.account', {
						url: '/account',
						templateUrl: '/statics/tpl/operation/account/account.html',
						resolve: load(['/statics/js/app/operation/account.js'])
					}).state('app.operation.accountDetail', {
						url: '/accountDetail/:id',
						templateUrl: '/statics/tpl/operation/account/detail.html',
						resolve: load(['/statics/js/app/operation/accountDetail.js'])
				}).state('app.config', {
					url: '/config',
					template: '<div ui-view class="fade-in-up"></div>',
					resolve: load(['easyui','tableGrid','codeMirror'])
				}).state('app.config.manageScript', {
					url: '/manageScript',
					templateUrl: '/statics/tpl/config/managescript/script.html',
					resolve: load(['/statics/js/app/config/managescript.js','ui.select'])
				}).state('app.config.groupManageScript', {
					url: '/groupManageScript',
					templateUrl: '/statics/tpl/config/groupManageScript/groupManageScript.html',
					resolve: load(['/statics/js/app/config/groupManageScript.js'])
				}).state('app.config.groupManageScriptDetail', {
						url: '/groupManageScriptDetail/:id',
						templateUrl: '/statics/tpl/config/groupManageScript/detail.html',
						resolve: load(['/statics/js/app/config/groupManageScriptDetail.js'])
				}).state('app.config.manageSoftware', {
					url: '/manageSoftware',
					templateUrl: '/statics/tpl/config/manageSoftware/manageSoftware.html',
					resolve: load(['/statics/js/app/config/manageSoftware.js'])
				}).state('app.config.manageSoftwareDetail', {
						url: '/manageSoftwareDetail/:id',
						templateUrl: '/statics/tpl/config/manageSoftware/detail.html',
						resolve: load(['/statics/js/app/config/manageSoftwareDetail.js'])
				}).state('app.config.groupManageSoftware', {
					url: '/groupManageSoftware',
					templateUrl: '/statics/tpl/config/groupManageSoftware/groupManageSoftware.html',
					resolve: load(['/statics/js/app/config/groupManageSoftware.js'])
				}).state('app.config.groupManageSoftwareDetail', {
						url: '/groupManageSoftwareDetail/:id',
						templateUrl: '/statics/tpl/config/groupManageSoftware/detail.html',
						resolve: load(['/statics/js/app/config/groupManageSoftwareDetail.js'])
				}).state('app.config.dictionary', {
					url: '/dictionary',
					templateUrl: '/statics/tpl/config/dictionary/dictionary.html',
					resolve: load(['/statics/js/app/config/dictionary.js'])
				}).state('app.config.cloudVendor', {
						url: '/cloudVendor',
						templateUrl: '/statics/tpl/config/supplier/supplier.html',
						resolve: load(['/statics/js/app/config/supplier.js'])
					}).state('app.config.cloudVendorAdd', {
						url: '/cloudVendorAdd',
						templateUrl: '/statics/tpl/config/supplier/add.html',
						resolve: load(['/statics/js/app/config/supplierAdd.js'])
					}).state('app.config.cloudVendorUpdate', {
						url: '/cloudVendorUpdate/:id',
						templateUrl: '/statics/tpl/config/supplier/update.html',
						resolve: load(['/statics/js/app/config/supplierUpdate.js'])
					}).state('app.config.cloudVendorDetail', {
						url: '/cloudVendorDetail/:id',
						templateUrl: '/statics/tpl/config/supplier/detail.html',
						resolve: load(['/statics/js/app/config/supplierDetail.js'])
				}).state('app.config.command', {
						url: '/command',
						templateUrl: '/statics/tpl/config/command/command.html',
						resolve: load(['/statics/js/app/config/command.js'])
					}).state('app.config.commandDetail', {
						url: '/commandDetail/:id',
						templateUrl: '/statics/tpl/config/command/detail.html',
						resolve: load(['/statics/js/app/config/commandDetail.js'])
				}).state('app.config.price', {
					url: '/price',
					templateUrl: '/statics/tpl/config/component/price.html',
					resolve: load(['/statics/js/filters/formatDate.js','/statics/js/app/config/price.js'])
				}).state('app.config.systemConfig', {
					url: '/systemConfig',
					templateUrl: '/statics/tpl/config/systemConfig/list.html',
					resolve: load(['/statics/js/app/config/systemConfig.js'])
				}).state('app.measure', {
					url: '/measure',
					template: '<div ui-view class="fade-in-up"></div>',
					resolve: load(['/statics/libs/assets/echarts/echarts.min.js'])
				}).state('app.measure.resources', {
					url: '/resources',
					templateUrl: '/statics/tpl/measure/resources/resources.html',
					resolve: load(['/statics/js/services/meterService.js','/statics/js/filters/formatDate.js','/statics/libs/jquery/jquery-datepicker/jquery-ui-1.10.2.min.js','/statics/libs/jquery/jquery.ui/jquery-ui-1.10.2.css','/statics/js/app/measure/resources.js','smart-table','easyui','ui.select'])
				}).state('app.log', {
					url: '/log',
					template: '<div ui-view class="fade-in-up"></div>'
				}).state('app.log.platform', {
					url: '/platform',
					templateUrl: '/statics/tpl/log/platform.html',
					resolve: load(['/statics/js/app/log/platform.js'])
				}).state('app.log.audit', {
					url: '/audit',
					templateUrl: '/statics/tpl/log/audit.html',
					resolve: load(['/statics/js/app/log/audit.js'])
				}).state('app.log.plugin', {
					url: '/plugin',
					templateUrl: '/statics/tpl/log/plugin/list.html',
					resolve: load(['/statics/js/app/log/plugin/list.js'])
				}).state('app.log.plugincreate', {
					url: '/plugincreate/:id',
					templateUrl: '/statics/tpl/log/plugin/create.html',
					resolve: load(['/statics/js/app/log/plugin/create.js'])
				}).state('app.log.plugindetail', {
					url: '/plugindetail/:id`',
					templateUrl: '/statics/tpl/log/plugin/detail.html',
					resolve: load(['/statics/js/app/log/plugin/detail.js'])
				}).state('app.log.source', {
					url: '/source',
					templateUrl: '/statics/tpl/log/source/list.html',
					resolve: load(['/statics/js/app/log/source/list.js'])
				}).state('app.log.sourcecreate', {
					url: '/sourcecreate/:id',
					templateUrl: '/statics/tpl/log/source/create.html',
					resolve: load(['/statics/js/app/log/source/create.js'])
				}).state('app.log.sourcedetail', {
					url: '/sourcedetail/:id',
					templateUrl: '/statics/tpl/log/source/detail.html',
					resolve: load(['/statics/js/app/log/source/detail.js'])
				}).state('app.log.sourcerecorddetail', {
					url: '/sourcerecorddetail/:id',
					templateUrl: '/statics/tpl/log/source/record/detail.html',
					resolve: load(['/statics/js/app/log/source/recorddetail.js'])
				}).state('app.log.sourceupload', {
					url: '/sourceupload/:id',
					templateUrl: '/statics/tpl/log/source/upload.html',
					resolve: load(['/statics/js/app/log/source/uploadsource.js','smart-table','selectServer'])
				}).state('app.log.sourcerecord', {
					url: '/sourcerecord/:id',
					templateUrl: '/statics/tpl/log/source/record/list.html',
					resolve: load(['/statics/js/app/log/source/uploadrecord.js'])
				}).state('app.log.esnode', {
					url: '/esnode',
					templateUrl: '/statics/tpl/log/esnode.html',
					resolve: load(['/statics/js/app/log/esnode.js'])
				}).state('app.log.eslog', {
					url: '/eslog',
					templateUrl: '/statics/tpl/log/eslog.html',
					resolve: load(['/statics/js/app/log/eslog.js'])
				}).state('app.log.customeslog', {
					url: '/customeslog',
					templateUrl: '/statics/tpl/log/custom/eslog.html',
					resolve: load(['/statics/js/app/log/custom/eslog.js'])
				}).state('app.log.dashboard', {
					url: '/eslogchart',
					templateUrl: '/statics/tpl/log/eslogChart.html',
					resolve: load(['echarts','/statics/js/app/log/eslogChart.js'])
				}).state('app.log.indexmng', {
					url: '/indexmng',
					templateUrl: '/statics/tpl/log/indexmng.html',
					resolve: load(['/statics/js/app/log/indexmng.js'])
				}).state('app.log.indexOperation', {
					url: '/indexOperation/:id',
					templateUrl: '/statics/tpl/log/indexOperation.html',
					resolve: load(['/statics/js/app/log/indexOperation.js'])
				}).state('app.log.indexDetail', {
					url: '/indexDetail/:id',
					templateUrl: '/statics/tpl/log/indexDetail.html',
					resolve: load(['/statics/js/app/log/indexDetail.js'])
				}).state('app.autos', {
					url: '/autos',
					template: '<div ui-view class="fade-in-up"></div>'
				}).state('app.autos.machine', {
					url: '/machine',
					templateUrl: '/statics/tpl/autos/machine/list.html',
					resolve: load(['/statics/js/app/autos/machine.js'])
				}).state('app.autos.machineinstall', {
					url: '/machineinstall/',
					templateUrl: "/statics/tpl/autos/machine/machineinstall.html",
					resolve: load(['/statics/js/app/autos/machineinstall.js'])
				}).state('app.autos.iso', {
					url: '/iso',
					templateUrl: '/statics/tpl/autos/iso/list.html',
					resolve: load(['/statics/js/app/autos/iso.js'])
				}).state('app.autos.record', {
					url: '/record',
					templateUrl: '/statics/tpl/autos/record/list.html',
					resolve: load(['/statics/js/app/autos/record.js'])
				}).state('app.userCenter', {
					url: '/userCenter',
					template: '<div ui-view class="fade-in-up"></div>',
					resolve: load([ 'easyui','tableGrid'])
				}).state('app.userCenter.tenant', {
						url: '/tenant',
						templateUrl: '/statics/tpl/userCenter/tenant/tenant.html',
						resolve: load(['/statics/js/app/userCenter/tenant.js'])
					}).state('app.userCenter.tenantDetail', {
							url: '/tenantDetail/:id',
							templateUrl: '/statics/tpl/userCenter/tenant/detail.html',
							resolve: load(['/statics/js/app/userCenter/tenantDetail.js'])
					}).state('app.userCenter.tenantUser', {
							url: '/tenantUser/:id',
							templateUrl: '/statics/tpl/userCenter/tenant/user.html',
							resolve: load(['/statics/js/app/userCenter/tenantUser.js'])
					}).state('app.userCenter.tenantRole', {
							url: '/tenantRole/:id',
							templateUrl: '/statics/tpl/userCenter/tenant/role.html',
							resolve: load(['/statics/js/app/userCenter/tenantRole.js'])
					}).state('app.userCenter.tenantResource', {
						url: '/tenantResource/:id',
						templateUrl: '/statics/tpl/userCenter/tenant/bindhost.html',
						resolve: load(['/statics/js/app/userCenter/tenantResource.js','smart-table'])
				}).state('app.userCenter.user', {
						url: '/user',
						templateUrl: '/statics/tpl/userCenter/user/user.html',
						resolve: load(['/statics/js/app/userCenter/user.js'])
					}).state('app.userCenter.userDetail', {
						url: '/userDetail/:id',
						templateUrl: "/statics/tpl/userCenter/user/detail.html",
						resolve: load(['/statics/js/app/userCenter/userDetail.js'])
					}).state('app.userCenter.userResource', {
						url: '/userResource/:id',
						templateUrl: '/statics/tpl/userCenter/user/bindhost.html',
						resolve: load(['/statics/js/app/userCenter/userResource.js','smart-table'])
				}).state('app.userCenter.role', {
					url: '/role',
					templateUrl: '/statics/tpl/userCenter/role/role.html',
					resolve: load(['/statics/js/app/userCenter/role.js'])
				}).state('app.userCenter.permission', {
					url: '/permission',
					templateUrl: '/statics/tpl/userCenter/permission/permission.html',
					resolve: load(['/statics/js/app/userCenter/permission.js'])
				}).state('app.userCenter.permissionDetail', {
						url: 'permissionDetail/:id',
						templateUrl: "/statics/tpl/userCenter/permission/detail.html",
						resolve: load(['/statics/js/app/userCenter/permissionDetail.js'])
				}).state('app.userCenter.department', {
						url: '/department',
						templateUrl: '/statics/tpl/userCenter/department/department.html',
						resolve: load(['/statics/js/app/userCenter/department.js'])
					}).state('app.userCenter.departmentDetail', {
						url: 'departmentDetail/:id',
						templateUrl: "/statics/tpl/userCenter/department/detail.html",
						resolve: load(['/statics/js/app/userCenter/departmentDetail.js'])
					}).state('app.userCenter.departmentResource', {
						url: '/departmentResource/:id',
						templateUrl: '/statics/tpl/userCenter/department/bindhost.html',
						resolve: load(['/statics/js/app/userCenter/departmentResource.js','smart-table'])
				}).state('app.userCenter.group', {
						url: '/group',
						templateUrl: '/statics/tpl/userCenter/group/group.html',
						resolve: load(['/statics/js/app/userCenter/group.js','smart-table'])
					}).state('app.userCenter.userGroupDetail', {
						url: '/userGroupDetail/:id',
						templateUrl: '/statics/tpl/userCenter/group/userGroup/detail.html',
						resolve: load(['/statics/js/app/userCenter/userGroupDetail.js','smart-table'])
					}).state('app.userCenter.resGroupDetail', {
						url: '/resGroupDetail/:id',
						templateUrl: '/statics/tpl/userCenter/group/resourceGroup/detail.html',
						resolve: load(['/statics/js/app/userCenter/resourceGroupDetail.js','smart-table'])
				}).state('app.application', {
					url: '/application',
					template: '<div ui-view class="fade-in-up"></div>',
					noCache:true,
					resolve: load(['taskLayout','easyui','/statics/js/directives/auto-complete.js'])
				}).state('app.application.manage', {
					url: '/manage',
					templateUrl: '/statics/tpl/application/manage/list.html',
					resolve: load(['/statics/js/app/application/manage.js'])
				}).state('app.application.deploy', {
					url: '/deploy',
					templateUrl: '/statics/tpl/application/deploy/list.html',
					resolve: load([ '/statics/js/app/application/deploy.js'])
				}).state('app.application.newtask', {
					url: '/newtask/:flag/:id',
					templateUrl: '/statics/tpl/operation/newtaskcopy/newtask.html',
					resolve: load(['/statics/libs/jquery/jquery.ui/jquery.ui.min.js','/statics/js/app/operation/newtaskcopy.js','ui.select','smart-table'])
				}).state('app.application.appdetail', {
					url: '/appdetail/:id',
					templateUrl: '/statics/tpl/application/manage/detail.html',
					resolve: load(['/statics/js/app/application/managedetail.js'])
				}).state('app.application.bindhost', {
					url: '/bindhost/:id',
					templateUrl: '/statics/tpl/application/manage/bindhost.html',
					resolve: load(['/statics/js/app/application/bindhost.js','smart-table'])
				}).state('app.application.history', {
					url: '/history/:id',
					templateUrl: '/statics/tpl/application/deploy/history.html',
					resolve: load(['/statics/js/app/application/deployhistory.js'])
				}).state('app.application.integrate', {
					url: '/integrate',
					templateUrl: '/statics/tpl/application/ciTool/ciTool.html',
					resolve: load([ '/statics/js/app/application/ciTool.js'])
				}).state('app.application.integrateDetail', {
					url: '/integrateDetail/:id',
					templateUrl: "/statics/tpl/application/ciTool/detail.html",
					resolve: load(['/statics/js/app/application/ciToolDetail.js'])
				}).state('app.application.integrateJob', {
					url: '/integrateJob/:id',
					templateUrl: "/statics/tpl/application/ciTool/ciJob.html",
					resolve: load(['/statics/js/app/application/ciJob.js'])
				}).state('app.application.topology', {
					url: '/topology',
					templateUrl: "/statics/tpl/application/topology/topology.html",
					resolve: load(['/statics/libs/jquery/topology/jtopo-all-min.js','/statics/js/app/application/topology.js'])
				}).state('app.application.topologyshow', {
					url: '/topologyshow',
					templateUrl: "/statics/tpl/application/topologyshow/topology.html",
					resolve: load(['/statics/libs/jquery/topology/jtopo-all-min.js','/statics/js/app/application/topologyshow.js'])
				}).state('app.alarm', {
					url: '/alarm',
					template: '<div ui-view class="fade-in-up"></div>'
				}).state('app.alarm.manage', {
					url: '/manage',
					templateUrl: '/statics/tpl/alarm/manage/list.html',
					resolve: load([ '/statics/js/app/alarm/manage.js'])
				}).state('app.alarm.managedetail', {
					url: '/managedetail/:id',
					templateUrl: "/statics/tpl/alarm/manage/detail.html",
					resolve: load(['/statics/js/app/alarm/managedetail.js'])
				}).state('app.alarm.alarm', {
					url: '/alarm',
					templateUrl: '/statics/tpl/alarm/alarm/list.html',
					resolve: load(['/statics/js/app/alarm/alarmstrategy/alarm.js'])
				}).state('app.alarm.addalarm', {
					url: '/addalarm/:id',
					templateUrl: '/statics/tpl/alarm/alarm/add.html',
					resolve: load(['/statics/js/app/alarm/alarmstrategy/add.js'])
				}).state('app.alarm.alarmdetail', {
					url: '/alarmdetail/:id',
					templateUrl: "/statics/tpl/alarm/alarm/detail.html",
					resolve: load(['/statics/js/app/alarm/alarmstrategy/alarmdetail.js'])
				}).state('app.alarm.aurecord', {
					url: '/aurecord/:id',
					templateUrl: "/statics/tpl/alarm/alarm/uploadrecord/list.html",
					resolve: load(['/statics/js/app/alarm/alarmstrategy/uploadrecord.js'])
				}).state('app.alarm.aurecorddetail', {
					url: '/aurecorddetail/:id',
					templateUrl: "/statics/tpl/alarm/alarm/uploadrecord/detail.html",
					resolve: load(['/statics/js/app/alarm/alarmstrategy/uploadrecorddetail.js'])
				}).state('app.alarm.assign', {
					url: '/assign',
					templateUrl: '/statics/tpl/alarm/assign/list.html',
					resolve: load([ '/statics/js/app/alarm/assign.js','/statics/js/directives/muselect.js'])
				}).state('app.alarm.notice', {
					url: '/notice',
					templateUrl: '/statics/tpl/alarm/notice/list.html',
					resolve: load([ '/statics/js/app/alarm/notice.js'])
				}).state('app.alarm.noticedetail', {
					url: '/noticedetail/:id',
					templateUrl: "/statics/tpl/alarm/notice/detail.html",
					resolve: load(['/statics/js/app/alarm/noticedetail.js'])
				}).state('app.monitor', {
					url: '/monitor',
					template: '<div ui-view class="fade-in-up"></div>',
					resolve: load(['codeMirror'])
				}).state('app.monitor.datacenter', {
						url: '/datacenter',
						templateUrl: '/statics/tpl/monitor/datacenter/datacenter.html',
						resolve: load(['/statics/js/app/monitor/datacenter.js'])
					}).state('app.monitor.datacenterMonitor', {
						url: '/datacenterMonitor/:id',
						templateUrl: "/statics/tpl/monitor/datacenter/monitor.html",
						resolve: load(['echarts','/statics/libs/assets/echarts/shine.js','/statics/js/app/monitor/datacenterMonitor.js'])
				}).state('app.monitor.room', {
						url: '/room',
						templateUrl: '/statics/tpl/monitor/room/room.html',
						resolve: load(['/statics/js/app/monitor/room.js'])
					}).state('app.monitor.roomMonitor', {
						url: '/roomMonitor/:id',
						templateUrl: "/statics/tpl/monitor/room/monitor.html",
						resolve: load(['echarts','/statics/libs/assets/echarts/shine.js','/statics/js/app/monitor/roomMonitor.js'])
				})
				.state('app.monitor.rack', {
					url: '/rack',
					templateUrl: '/statics/tpl/monitor/analysis/analysis.html',
					resolve: load(['echarts','/statics/libs/assets/echarts/shine.js','/statics/js/app/monitor/analysis/analysis.js'])
				})
				//.state('app.monitor.rack', {
				//		url: '/rack',
				//		templateUrl: '/statics/tpl/monitor/rack/rack.html',
				//		resolve: load(['/statics/js/app/monitor/rack.js'])
				//	}).state('app.monitor.rackMonitor', {
				//		url: '/rackMonitor/:id',
				//		templateUrl: "/statics/tpl/monitor/rack/monitor.html",
				//		resolve: load(['echarts','/statics/libs/assets/echarts/shine.js','/statics/js/app/monitor/rackMonitor.js'])
				//})
					.state('app.monitor.server', {
						url: '/server',
						templateUrl: '/statics/tpl/monitor/host/host.html',
						resolve: load(['/statics/js/app/monitor/host.js'])
					}).state('app.monitor.serverMonitor', {
						url: '/serverMonitor/:id',
						templateUrl: "/statics/tpl/monitor/host/monitor.html",
						resolve: load(['echarts','/statics/libs/assets/echarts/shine.js','/statics/js/app/monitor/hostMonitor.js'])
				}).state('app.monitor.vm', {
						url: '/vm',
						templateUrl: '/statics/tpl/monitor/vm/vm.html',
						resolve: load(['/statics/js/app/monitor/vm.js'])
					}).state('app.monitor.vmMonitor', {
						url: '/vmMonitor/:id',
						templateUrl: "/statics/tpl/monitor/vm/monitor.html",
						resolve: load(['echarts','/statics/libs/assets/echarts/shine.js','/statics/js/app/monitor/vmMonitor.js'])
				}).state('app.monitor.query', {
						url: '/query',
						templateUrl: '/statics/tpl/monitor/query/monitor.html',
						resolve: load(['echarts','/statics/libs/assets/echarts/shine.js','/statics/js/app/monitor/query.js'])
				}).state('app.monitor.measure', {
						url: '/measure',
						templateUrl: '/statics/tpl/monitor/measure/manage/list.html',
						resolve: load(['/statics/js/app/monitor/measure/managelist.js'])
				}).state('app.monitor.measureitem', {
					url: '/measureitem/:id',
					templateUrl: '/statics/tpl/monitor/measure/measureitem/list.html',
					resolve: load(['/statics/js/app/monitor/measure/measureitem.js'])
				}).state('app.monitor.measurerecord', {
					url: '/measurerecord/:id',
					templateUrl: '/statics/tpl/monitor/measure/measurerecord/list.html',
					resolve: load(['/statics/js/app/monitor/measure/measurerecord.js'])
				}).state('app.monitor.measurerecorddetail', {
					url: '/measurerecorddetail/:id',
					templateUrl: '/statics/tpl/monitor/measure/measurerecord/detail.html',
					resolve: load(['treeGrid','/statics/js/app/monitor/measure/measurerecorddetail.js'])
				}).state('app.monitor.measureplugin', {
					url: '/measureplugin/:id',
					templateUrl: '/statics/tpl/monitor/measure/plugin/plugins.html',
					resolve: load(['treeGrid','/statics/js/app/monitor/measure/measureplugins.js'])
				}).state('app.monitor.measureupload', {
					url: '/measureupload/:id',
					templateUrl: '/statics/tpl/monitor/measure/upload.html',
					resolve: load(['treeGrid','/statics/js/app/monitor/measure/measureupload.js','selectServer','smart-table'])
				}).state('app.personal', {
					url: '/personal',
					template: '<div ui-view class="fade-in-up"></div>'
				}).state('app.personal.message', {
					url: '/manage',
					templateUrl: '/statics/tpl/personal/message/list.html',
					resolve: load([ '/statics/js/app/personal/message.js'])
				}).state('app.personal.apply', {
					url: '/apply',
					templateUrl: '/statics/tpl/personal/apply/list.html',
					resolve: load([ '/statics/js/app/personal/apply.js'])
				}).state('app.process', {
					url: '/process',
					template: '<div ui-view class="fade-in-up"></div>'
				}).state('app.process.apply', {
					url: '/apply',
					templateUrl: '/statics/tpl/process/apply/list.html',
					resolve: load([ '/statics/js/app/process/apply.js'])
				})
				function load(srcs, callback) {
					return {
						deps: ['$ocLazyLoad', '$q',
							function ($ocLazyLoad, $q) {
								var deferred = $q.defer();
								var promise = false;
								srcs = angular.isArray(srcs) ? srcs : srcs.split(/\s+/);
								if (!promise) {
									promise = deferred.promise;
								}
								angular.forEach(srcs, function (src) {
									//console.log(src);
									promise = promise.then(function () {
										if (JQ_CONFIG[src]) {
											return $ocLazyLoad.load(JQ_CONFIG[src]);
										}
										//if(src.substr(src.length-3, 3) === '.js') {
										//    name = src + '?v=' + OpsConstant.O_VERSION;
										//} else {
										name = src;
										//}
										return $ocLazyLoad.load(name);
									});
								});
								deferred.resolve();
								return callback ? promise.then(function () {
									return callback();
								}) : promise;
							}]
					}
				}

				// 去掉angular url的#号
				//$locationProvider.html5Mode(true);
			}
		]
	);
