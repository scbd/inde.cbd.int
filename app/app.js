define(['angular','dragula','angular-animate','angular-loading-bar','ngFileUpload','ui.select','720kb.socialshare'], function(angular,angularDragula) { 'use strict';

    var deps = ['ngRoute','ngAnimate','chieffancypants.loadingBar','ngFileUpload','ui.select','ngDialog','smoothScroll','scroll-animate-directive', angularDragula(angular),'toastr','ngCkeditor','720kb.socialshare', 'angular-cache'];

    angular.defineModules(deps);

    var app = angular.module('app', deps);
//change me
    app.value('realm', '');

    app.config(['$httpProvider', function($httpProvider){

        // $httpProvider.useApplyAsync(true);
        $httpProvider.interceptors.push('authenticationHttpIntercepter');
        $httpProvider.interceptors.push('realmHttpIntercepter');
        $httpProvider.interceptors.push('apiRebase');
    }]);

      app.config(['toastrConfig', function(toastrConfig) {
        angular.extend(toastrConfig, {
          autoDismiss: true,
          containerId: 'toast-container',
          newestOnTop: true,
          closeButton: true,
          positionClass: 'toast-top-right',
          iconClasses: {
            error: 'alert-danger',
            info: 'toast-info',
            success: 'toast-success',
            warning: 'alert-warning'
          },
          target: 'body',
          timeOut: 5000,
          progressBar: true,
        });
      }]);
    app.factory('realmHttpIntercepter', ["realm", function(realm) {

		return {
			request: function(config) {
				var trusted = /^http:\/\/localhost\//i .test(config.url)||
                      /^http:\/\/randy.local\//i .test(config.url)||
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
  app.factory('apiRebase', ["$location", function($location) {

  		return {
  			request: function(config) {

                  var rewrite = config  .url   .toLowerCase().indexOf('/api/')===0 &&
                               $location.host().toLowerCase() == 'www.cbd.int';

  				if(rewrite)
                      config.url = 'https://api.cbd.int' + config.url;

  				return config;
  			}
  		};
  	}]);

    return app;
});