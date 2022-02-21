//if(/Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent)) { console.log = function(){}; }
var gitVersion = document.documentElement.attributes['git-version'].value;
const cdnHost     = 'https://cdn.jsdelivr.net'

require.config({
    waitSeconds: 120,
    baseUrl : 'app/',
    IESelectorLimit: true,
    paths: {
      'ng': cdnHost + '/npm/angular@1.4.9/angular.min',
      'angular'                  : cdnHost + '/gh/scbd/angular-flex@1.0.1/angular-flex.min',
      'angular-animate'          : cdnHost + '/npm/angular-animate@1.4.8/angular-animate.min',
      'ngRoute'                  : cdnHost + '/npm/angular-route@1.4.8/angular-route.min',// maybe 1.4.8
      'angular-sanitize'         : cdnHost + '/npm/angular-sanitize@1.4.8/angular-sanitize.min',
      'angular-cache'            : cdnHost + '/npm/angular-cache@4.6.0/dist/angular-cache.min',
        'app-css'                  : 'css/main',
        'bootstrap'                : 'https://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/js/bootstrap.min',
        // 'css'                      : 'libs/require-css/css.min',
        'dragula'                  : 'libs/angular-dragula/dist/angular-dragula',
        'flag-icon-css'            : 'libs/flag-icon-css/css/flag-icon.min',
        'font-awsome-css'          : 'libs/font-awesome/css/font-awesome.min',
        'jquery'                   : 'libs/jquery/dist/jquery',
        'linqjs'                   : 'libs/linqjs/linq.min',
        'lodash'                   : 'libs/lodash/lodash',
        'moment'                   : cdnHost + '/npm/moment@2.29.1/moment',
        'moment-timezone'          : cdnHost + '/npm/moment-timezone@0.5.34/builds/moment-timezone-with-data.min',
        'ngFileUpload'             : 'libs/ng-file-upload/ng-file-upload',
        'ngDialog'                 : 'libs/ng-dialog/js/ngDialog.min',
        'ngRoute'                  : 'libs/angular-route/angular-route.min',
        'ngSmoothScroll'           : 'libs/ngSmoothScroll/lib/angular-smooth-scroll',
        'scroll-directive'         : 'libs/scroll-animate-directive/src/scroll-animate-directive',
        'toastr'                   : 'libs/angular-toastr/dist/angular-toastr.tpls.min',
        'text'                     : 'libs/requirejs-text/text',
        'ng-ckeditor'              : 'libs/ng-ckeditor/ng-ckeditor',
        'ckeditor'                 : 'libs/ng-ckeditor/libs/ckeditor/ckeditor',
        '720kb.socialshare'        : 'libs/angular-socialshare/dist/angular-socialshare.min',
        'ui.select'                : 'libs/angular-ui-select/dist/select',
        'ouical'                   : 'services/ouical',
        'angular-loading-bar'       : 'libs/angular-loading-bar/build/loading-bar.min'
    },
    shim: {
        'ng'      : { deps: ['jquery'] },
        'angular'                   : { deps: ['ng'] },
        'angular-route'             : { deps: ['angular'] },
        'ngRoute'                   : { deps: ['angular'] },
        'ui.select'                 : { deps: ['angular'] },
        'angular-animate'           : { deps: ['angular']},
        'angular-loading-bar'       : { deps: ['angular'] },
        'bootstrap'                 : { deps:[ 'jquery']},
        'angular-select-ui'         : { deps:[ 'angular','bootstrap']},
        'ngFileUpload'              : { deps:[ 'angular']},
        'ngSmoothScroll'            : { deps:[ 'angular']},
        'scroll-directive'          : { deps:[ 'angular','angular-animate']},
        'dragula'                   : { deps: ['angular','jquery'] },
        'linqjs'                    : { deps: [], exports : 'Enumerable' },
        'toastr'                    : { deps: ['angular']},
        'ng-ckeditor'               : { deps: ['angular','ckeditor']},
        '720kb.socialshare'         : { deps: ['angular']},
        'services/article-service': { deps: ['angular-cache']}

    },
    urlArgs: 'v=' + gitVersion

});
define("_slaask", window._slaask);
// BOOT

require(['angular', 'app', 'text', 'routes', 'template','bootstrap'], function(ng, app) {

    ng.element(document).ready(function () {
         ng.bootstrap(document, [app.name]);
    });
});

// Fix IE Console
(function(a){a.console||(a.console={});for(var c="log info warn error debug trace dir group groupCollapsed groupEnd time timeEnd profile profileEnd dirxml assert count markTimeline timeStamp clear".split(" "),d=function(){},b=0;b<c.length;b++)a.console[c[b]]||(a.console[c[b]]=d)})(window); //jshint ignore:line
