require.config({
    waitSeconds: 120,
    baseUrl : 'app/',
    IESelectorLimit: true,
    paths: {
        'angular'                  : 'libs/angular-flex/angular-flex',
        'angular-animate'          : 'libs/angular-animate/angular-animate.min',
        'angular-loading-bar'      : 'libs/angular-loading-bar/src/loading-bar',
        'angular-route'            : 'libs/angular-route/angular-route',
        'angular-sanitize'         : 'libs/angular-sanitize/angular-sanitize.min',
        'angular-messages'         : 'libs/angular-messages/angular-messages.min',
        'app-css'                  : 'css/main',
        'bootstrap'                : 'https://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/js/bootstrap.min',
        'css'                      : 'libs/require-css/css.min',
        'dragula'                  : 'libs/angular-dragula/dist/angular-dragula',
        'flag-icon-css'            : 'libs/flag-icon-css/css/flag-icon.min',
        'font-awsome-css'          : 'libs/font-awesome/css/font-awesome.min',
        'jquery'                   : 'libs/jquery/dist/jquery',
        'linqjs'                   : 'libs/linqjs/linq.min',
        'lodash'                   : 'libs/lodash/lodash',
        'moment'                   : 'libs/moment/moment',
        'ngFileUpload'           :'libs/ng-file-upload/ng-file-upload.min',
        'ng-file-upload-shim'      :'libs/ng-file-upload/ng-file-upload.shim.min',
        'ngDialog'                 :'libs/ng-dialog/js/ngDialog.min',
        'ngRoute'                  : 'libs/angular-route/angular-route.min',
        'ngSmoothScroll'           : 'libs/ngSmoothScroll/lib/angular-smooth-scroll',
        'scroll-directive'         :'libs/scroll-animate-directive/src/scroll-animate-directive',
        'text'                     : 'libs/requirejs-text/text'
    },
    shim: {
        'libs/angular/angular'      : { deps: ['jquery'] },
        'angular'                   : { deps: ['libs/angular/angular'] },
        'angular-route'             : { deps: ['angular'] },
        'ngRoute'             : { deps: ['angular'] },
        'angular-sanitize'          : { 'deps': ['angular'] },
        'guid'                      : { exports: 'ui_guid_generator' },
        'angular-animate'           : { deps: ['angular']},
        'angular-loading-bar'       : { deps: ['angular'] },
        'bootstrap'                 : { deps:[ 'jquery']},
        'ngFileUpload'            : { deps:[ 'angular']},
        'ngSmoothScroll'            : { deps:[ 'angular']},
        'scroll-directive'          : { deps:[ 'angular']},
        'dragula'                   : { deps: ['angular','jquery'] },
        'linqjs'                   : { deps: [], exports : 'Enumerable' },
    }

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
