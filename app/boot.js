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
        'ngFileUpload'             : 'libs/ng-file-upload/ng-file-upload',
        'ngDialog'                 : 'libs/ng-dialog/js/ngDialog.min',
        'ngRoute'                  : 'libs/angular-route/angular-route.min',
        'ngSmoothScroll'           : 'libs/ngSmoothScroll/lib/angular-smooth-scroll',
        'scroll-directive'         : 'libs/scroll-animate-directive/src/scroll-animate-directive',
        'rangy-core'               : 'libs/rangy/rangy-core',
        'rangy-saveselection'      : 'libs/rangy/rangy-selectionsaverestore',
        'text-angular-rangy'       : 'libs/textAngular/dist/textAngular-rangy.min',
        'text-angular-setup'       : 'libs/textAngular/dist/textAngularSetup',
        'text-angular'             : 'libs/textAngular/dist/textAngular',
        'text-angular-sanitize'    : 'libs/textAngular/dist/textAngular-sanitize',
        'toastr'                   : 'libs/angular-toastr/dist/angular-toastr.tpls.min',
        'text'                     : 'libs/requirejs-text/text'
    },
    shim: {
        'libs/angular/angular'      : { deps: ['jquery'] },
        'angular'                   : { deps: ['libs/angular/angular'] },
        'angular-route'             : { deps: ['angular'] },
        'ngRoute'                   : { deps: ['angular'] },
        'angular-sanitize'          : { 'deps': ['angular'] },
        'guid'                      : { exports: 'ui_guid_generator' },
        'angular-animate'           : { deps: ['angular']},
        'angular-loading-bar'       : { deps: ['angular'] },
        'bootstrap'                 : { deps:[ 'jquery']},
        'ngFileUpload'              : { deps:[ 'angular']},
        'ngSmoothScroll'            : { deps:[ 'angular']},
        'scroll-directive'          : { deps:[ 'angular']},
        'dragula'                   : { deps: ['angular','jquery'] },
        'linqjs'                    : { deps: [], exports : 'Enumerable' },
        'rangy-core'                : { deps: ['jquery']},
        'text-angular-rangy'        : { deps: ['angular']},
        'text-angular-setup'        : { deps: ['angular','text-angular-rangy' ]},
        'text-angular-sanitize'      : { deps: ['angular']},
        'text-angular'              : { deps: ['angular','css!libs/textAngular/dist/textAngular.css','rangy-core','rangy-saveselection','text-angular-rangy','text-angular-setup','text-angular-sanitize'] },
        'toastr'                     : { deps: ['angular']}
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
