/**
 * Created by Zhang Haijun on 2016/8/9.
 */
//数据接口
materialAdmin.constant('CONFIG', {
	'/login': '/statics/api/access/login.json',
	//退出
	"/logout" : "/statics/api/assets/datacenter/dataCenter-modify.json",
	// 用户修改密码
	"/user/change" : "/statics/api/assets/datacenter/dataCenter-modify.json",   //密码修改
	"/user/check" : "/statics/api/assets/datacenter/dataCenter-modify.json",    //密码校验
	// 基础信息
	"/host/list" : "/data/basis/host.json",
	"/host/create" : "/data/basis/host.json",
    "/host/modify" : "/data/basis/dataCenter-modify.json",
    "/host/basic" : "/data/basis/dataCenter-basic.json",
    "/host/remove" : "/data/basis/dataCenter-modify.json",
	"/dc/modify" : "/statics/api/assets/datacenter/dataCenter-modify.json",
	"/dc/remove" : "/statics/api/assets/datacenter/dataCenter-modify.json",
	"/dc/load" : "/statics/api/assets/datacenter/dataCenter-load.json",
	"/dc/basic" : "/statics/api/assets/datacenter/dataCenter-basic.json",
	"/dc/detail" : "/statics/api/assets/datacenter/dataCenter-detail.json",//基本信息


});