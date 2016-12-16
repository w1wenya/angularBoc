materialAdmin
    .config(function ($stateProvider, $urlRouterProvider){
        $urlRouterProvider.otherwise("/home");


        $stateProvider
        
            //------------------------------
            // HOME
            //------------------------------

            .state ('home', {
                url: '/home',
                templateUrl: 'views/home.html',
                resolve: {
                    loadPlugin: function($ocLazyLoad) {
                        return $ocLazyLoad.load ([
                            {
                                name: 'css',
                                insertBefore: '#app-level',
                                files: [
                                    'vendors/bower_components/fullcalendar/dist/fullcalendar.min.css',
                                ]
                            },
                            {
                                name: 'vendors',
                                insertBefore: '#app-level-js',
                                files: [
                                    'vendors/sparklines/jquery.sparkline.min.js',
                                    'vendors/bower_components/jquery.easy-pie-chart/dist/jquery.easypiechart.min.js',
                                    'vendors/bower_components/simpleWeather/jquery.simpleWeather.min.js'
                                ]
                            }
                        ])
                    }
                }
            })

            //------------------------------
            // LOGIN OUT
            //------------------------------
            .state ('login', {
                url: '/login',
                templateUrl: 'views/login.html'
            })
            //------------------------------
            // HEADERS
            //------------------------------
            .state ('basis', {
            url: '/basis',
            templateUrl: '/views/common-2.html'
        })

            .state('basis.host', {
                url: '/host',
                templateUrl: '/views/basis/host/host.html',
                resolve: {
                    loadPlugin: function($ocLazyLoad) {
                        return $ocLazyLoad.load ([
                            {
                                name: 'js',
                                files: [
                                    'js/controllers/basis/host.js'
                                ]
                            }, {
                                name: 'css',
                                insertBefore: '#app-level',
                                files: [
                                    'vendors/bower_components/fullcalendar/dist/fullcalendar.min.css',
                                    'vendors/bower_components/nouislider/jquery.nouislider.css',
                                    'vendors/farbtastic/farbtastic.css'
                                ]
                            },
                            {
                                name: 'vendors',
                                files: [
                                    'vendors/input-mask/input-mask.min.js',
                                    'vendors/bower_components/nouislider/jquery.nouislider.min.js',
                                    'vendors/bower_components/moment/min/moment.min.js',
                                    'vendors/bower_components/eonasdan-bootstrap-datetimepicker/build/js/bootstrap-datetimepicker.min.js',
                                    'vendors/bower_components/summernote/dist/summernote.min.js',
                                    'vendors/fileinput/fileinput.min.js',
                                ]
                            }
                        ])
                    }
                }

            })

            .state('basis.hostDetail', {
                url: '/centerdetail/:id',
                templateUrl: '/views/basis/host/detail.html',
                resolve: {
                    loadPlugin: function($ocLazyLoad) {
                        return $ocLazyLoad.load ([
                            {
                                name: 'js',
                                files: [
                                    'js/controllers/basis/hostDetail.js'
                                ]
                            }
                        ])
                    }
                }
            })
			      .state('basis.storage', {
                url: '/storage',
                templateUrl: '/views/basis/storage/list.html',
                resolve: {
                    loadPlugin: function($ocLazyLoad) {
                        return $ocLazyLoad.load ([
                            {
                                name: 'js',
                                files: [
                                    'js/controllers/basis/storage.js'
                                ]
                            }
                        ])
                    }
                }
            })
			      .state('basis.network', {
                url: '/network',
                templateUrl: '/views/basis/network/network.html',
                resolve: {
                    loadPlugin: function($ocLazyLoad) {
                        return $ocLazyLoad.load ([
                            {
                                name: 'js',
                                files: [
                                    'js/controllers/basis/network.js'
                                ]
                            }
                        ])
                    }
                }
            })
			      .state('basis.warehouse', {
                url: '/warehouse',
                templateUrl: '/views/basis/warehouse/warehouse.html',
                resolve: {
                    loadPlugin: function($ocLazyLoad) {
                        return $ocLazyLoad.load ([
                            {
                                name: 'js',
                                files: [
                                    'js/controllers/basis/warehouse.js'
                                ]
                            }
                        ])
                    }
                }
            })
			//配置中心
			.state ('collocate', {
            url: '/collocate',
            templateUrl: '/views/common-2.html'
        })
		      .state('collocate.resource', {
                url: '/resource',
                templateUrl: '/views/collocate/resource/resource.html',
                resolve: {
                    loadPlugin: function($ocLazyLoad) {
                        return $ocLazyLoad.load ([
                            {
                                name: 'js',
                                files: [
                                    'js/controllers/collocate/resource.js'
                                ]
                            }
                        ])
                    }
                }
            })
			.state('collocate.applycollocate', {
                url: '/applycollocate',
                templateUrl: '/views/collocate/applycollocate/applycollocate.html',
                resolve: {
                    loadPlugin: function($ocLazyLoad) {
                        return $ocLazyLoad.load ([
                            {
                                name: 'js',
                                files: [
                                    'js/controllers/collocate/applycollocate.js'
                                ]
                            }
                        ])
                    }
                }
            })
			.state('collocate.files', {
                url: '/files',
                templateUrl: '/views/collocate/files/files.html',
                resolve: {
                    loadPlugin: function($ocLazyLoad) {
                        return $ocLazyLoad.load ([
                            {
                                name: 'js',
                                files: [
                                    'js/controllers/collocate/files.js'
                                ]
                            }
                        ])
                    }
                }
            })
			
			//  应用管理
			 .state ('application', {
                url: '/application',
                templateUrl: 'views/common-2.html'
            })
			   .state('application.image', {
                url: '/image',
                templateUrl: '/views/application/image/list.html',
                resolve: {
                    loadPlugin: function($ocLazyLoad) {
                        return $ocLazyLoad.load ([
                            {
                                name: 'js',
                                files: [
                                    'js/controllers/application/tasktpl.js'
                                ]
                            }
                        ])
                    }
                }
            })
			   .state('application.deploy', {
                url: '/deploy',
                templateUrl: '/views/application/deploy/list.html',
                resolve: {
                    loadPlugin: function($ocLazyLoad) {
                        return $ocLazyLoad.load ([
                            {
                                name: 'js',
                                files: [
                                    'js/controllers/application/tasktpl.js'
                                ]
                            }
                        ])
                    }
                }
            })
            .state('application.tasklist', {
                url: '/tasklist',
                templateUrl: '/views/application/tasklist/list.html',
                resolve: {
                    loadPlugin: function($ocLazyLoad) {
                        return $ocLazyLoad.load ([
                            {
                                name: 'js',
                                files: [
                                    'js/controllers/application/tasktpl.js'
                                ]
                            }
                        ])
                    }
                }
            })
            .state('application.tasktpl', {
                url: '/newtask/:flag/:id',
                templateUrl: '/views/application/newtaskcopy/newtask.html',
                resolve: {
                loadPlugin: function($ocLazyLoad) {
                return $ocLazyLoad.load ([
                    {
                        name: 'css',
                        files: [

                            '/vendors/codemirror/codemirror.css',
                            '/vendors/codemirror/theme/erlang-dark.css',
                            '/vendors/angular-ui-select/dist/select.min.css',


                        ]
                    },
                {
                name: 'js',
                files: [
                'js/controllers/application/newtaskcopy.js',
                    '/vendors/jquery.ui/jquery.ui.min.js',
                    '/vendors/angular-ui-select/dist/select.min.js',
                    '/vendors/codemirror/codemirror-min.js',
                    '/vendors/angular-sanitize/angular-sanitize.min.js'

                ]
                }
                ])
                }
                 }
            })

            //------------------------------
            // 系统维护
            //------------------------------
        
            .state ('system', {
                url: '/system',
                templateUrl: 'views/common-2.html'
            })
	   .state('system.s_control', {
                url: '/s_control',
                templateUrl: '/views/system/s_control/list.html',
                resolve: {
                    loadPlugin: function($ocLazyLoad) {
                        return $ocLazyLoad.load ([
                            {
                                name: 'js',
                                files: [
                                    'js/controllers/system/tasktpl.js'
                                ]
                            }
                        ])
                    }
                }
            })
				   .state('system.s_vocabulary', {
                url: '/s_vocabulary',
                templateUrl: '/views/system/s_vocabulary/list.html',
                resolve: {
                    loadPlugin: function($ocLazyLoad) {
                        return $ocLazyLoad.load ([
                            {
                                name: 'js',
                                files: [
                                    'js/controllers/system/tasktpl.js'
                                ]
                            }
                        ])
                    }
                }
            })
				   .state('system.s_availability', {
                url: '/s_availability',
                templateUrl: '/views/system/s_availability/list.html',
                resolve: {
                    loadPlugin: function($ocLazyLoad) {
                        return $ocLazyLoad.load ([
                            {
                                name: 'js',
                                files: [
                                    'js/controllers/system/tasktpl.js'
                                ]
                            }
                        ])
                    }
                }
            })

            //------------------------------
            // 监控中心
            //------------------------------
        
            .state ('monitoring', {
                url: '/monitoring',
                templateUrl: 'views/common-2.html'
            })

        	   .state('monitoring.m_resource', {
                url: '/m_resource',
                templateUrl: '/views/monitoring/m_resource/list.html',
                resolve: {
                    loadPlugin: function($ocLazyLoad) {
                        return $ocLazyLoad.load ([
                            {
                                name: 'js',
                                files: [
                                    'js/controllers/monitoring/serverlist.js',

                                    'vendors/sparklines/jquery.sparkline.min.js',
                                    'vendors/bower_components/jquery.easy-pie-chart/dist/jquery.easypiechart.min.js',
                                ]
                            }
                        ])
                    }
                }
            })

           	   .state('monitoring.m_apply', {
                url: '/m_apply',
                templateUrl: '/views/monitoring/m_apply/list.html',
                resolve: {
                    loadPlugin: function($ocLazyLoad) {
                        return $ocLazyLoad.load ([
                            {
                                name: 'js',
                                files: [
                                    'js/controllers/monitoring/tasktpl.js'
                                ]
                            }
                        ])
                    }
                }
            })
				   .state('monitoring.m_serve', {
                url: '/m_serve',
                templateUrl: '/views/monitoring/m_serve/list.html',
                resolve: {
                    loadPlugin: function($ocLazyLoad) {
                        return $ocLazyLoad.load ([
                            {
                                name: 'js',
                                files: [
                                    'js/controllers/monitoring/tasktpl.js'
                                ]
                            }
                        ])
                    }
                }
            })


            //------------------------------
            // 日志中心--------------------
        
            .state ('log', {
                url: '/log',
                templateUrl: 'views/common-2.html'
            })
            
             .state('log.l_system', {
                url: '/l_system',
                templateUrl: '/views/log/l_system/list.html',
                resolve: {
                    loadPlugin: function($ocLazyLoad) {
                        return $ocLazyLoad.load ([
                            {
                                name: 'js',
                                files: [
                                    'js/controllers/log/tasktpl.js'
                                ]
                            }
                        ])
                    }
                }
            })
            
            .state('log.l_apply', {
                url: '/l_apply',
                templateUrl: '/views/log/l_apply/list.html',
                resolve: {
                    loadPlugin: function($ocLazyLoad) {
                        return $ocLazyLoad.load ([
                            {
                                name: 'js',
                                files: [
                                    'js/controllers/log/tasktpl.js'
                                ]
                            }
                        ])
                    }
                }
            })
			   .state('log.l_gather', {
                url: '/l_gather',
                templateUrl: '/views/log/l_gather/list.html',
                resolve: {
                    loadPlugin: function($ocLazyLoad) {
                        return $ocLazyLoad.load ([
                            {
                                name: 'js',
                                files: [
                                    'js/controllers/log/tasktpl.js'
                                ]
                            }
                        ])
                    }
                }
            })

        
            //------------------------------
            // 用户中心
            //------------------------------
            .state ('user-interface', {
                url: '/user-interface',
                templateUrl: 'views/common-2.html'
            })

          .state('user-interface.users', {
                url: '/users',
                templateUrl: '/views/user-interface/users/list.html',
                resolve: {
                    loadPlugin: function($ocLazyLoad) {
                        return $ocLazyLoad.load ([
                            {
                                name: 'js',
                                files: [
                                    'js/controllers/user-interface/tasktpl.js'
                                ]
                            }
                        ])
                    }
                }
            })
			  .state('user-interface.role', {
                url: '/role',
                templateUrl: '/views/user-interface/role/list.html',
                resolve: {
                    loadPlugin: function($ocLazyLoad) {
                        return $ocLazyLoad.load ([
                            {
                                name: 'js',
                                files: [
                                    'js/controllers/user-interface/tasktpl.js'
                                ]
                            }
                        ])
                    }
                }
            })
			  .state('user-interface.jurisdiction', {
                url: '/jurisdiction',
                templateUrl: '/views/user-interface/jurisdiction/list.html',
                resolve: {
                    loadPlugin: function($ocLazyLoad) {
                        return $ocLazyLoad.load ([
                            {
                                name: 'js',
                                files: [
                                    'js/controllers/user-interface/tasktpl.js'
                                ]
                            }
                        ])
                    }
                }
            })
        
         
    });
