define(['angular','angular-animate','angular-loading-bar','ng-file-upload','text-angular'], function(angular) { 'use strict';

    var deps = ['ngRoute','ngAnimate','chieffancypants.loadingBar','LocalStorageModule','angular-messages','ngFileUpload','textAngular'];

    angular.defineModules(deps);

    var app = angular.module('app', deps);
//change me
    app.value('realm', '');

    app.config(['$httpProvider', function($httpProvider){

        $httpProvider.useApplyAsync(true);
        $httpProvider.interceptors.push('authenticationHttpIntercepter');
        $httpProvider.interceptors.push('realmHttpIntercepter');
    }]);

    app.factory('realmHttpIntercepter', ["realm", function(realm) {

		return {
			request: function(config) {
				var trusted = /^http:\/\/localhost\//i .test(config.url)||
                              /^https:\/\/api.cbd.int\//i .test(config.url) ||
							  /^\/api\//i                 .test(config.url);

                //exception if the APi call needs to be done for different realm
                if(trusted && realm && config.params && config.params.realm && config.params.realm != realm) {
                      config.headers = angular.extend(config.headers || {}, { realm : config.params.realm });
                }
                else if(trusted && realm ) {
                    config.headers = angular.extend(config.headers || {}, { realm : realm });
                }

                return config;
			}
		};
	}]);

    return app;
});