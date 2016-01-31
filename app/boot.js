require.config({
    waitSeconds: 120,
    baseUrl : 'app/',
    paths: {

        'angular'                  : 'libs/angular-flex/angular-flex',
        'angular-route'            : 'libs/angular-route/angular-route',
        'text'                     : 'libs/requirejs-text/text',
        'css'                      : 'libs/require-css/css.min',
        'bootstrap'                : 'libs/bootstrap/dist/js/bootstrap',
        'lodash'                   : 'libs/lodash/lodash',
        'jquery'                   : 'libs/jquery/dist/jquery',
        'URIjs'                    : 'libs/uri.js/src',
        'linqjs'                   : 'libs/linqjs/linq.min',
        'moment'                   : 'libs/moment/moment',
        'shim'                     : 'libs/require-shim/src/shim',
        'ng-breadcrumbs'           : 'libs/ng-breadcrumbs/dist/ng-breadcrumbs.min',
        'font-awsome-css'          : 'libs/font-awesome/css/font-awesome.min',
        'flag-icon-css'            : 'libs/flag-icon-css/css/flag-icon.min',
        'outdated-browser-css'     : 'libs/outdated-browser/outdatedbrowser/outdatedbrowser.min',
        'app-css'                  : 'css/main',
        //'scbd-ajs-components'       : 'libs/scbd-ajs-services/scbd-services',
    },
    shim: {
        'libs/angular/angular'     : { deps: ['jquery'] },
        'angular'                  : { deps: ['libs/angular/angular'] },
        'angular-route'            : { deps: ['angular'] },
        'bootstrap'                : { deps: ['jquery'] },
        'guid'                     : { exports: 'ui_guid_generator' },
        'ng-breadcrumbs'              : { deps: ['angular'] },
    },
    packages: [
      { name: 'scbd-services', main: 'main', location : 'libs/scbd-ajs-components/services' },
      { name: 'scbd-directives', main: 'main', location : 'libs/scbd-ajs-components/directives' },
      { name: 'scbd-header-dir', main: 'header', location : 'libs/scbd-ajs-components/directives/header' },
      { name: 'scbd-css', main: 'main', location : 'libs/scbd-ajs-components/css' },
      { name: 'scbd-form-controls-dir', main: 'main', location : 'libs/scbd-ajs-components/formControlDirectives' },
    ]
});

// BOOT

require(['angular', 'app', 'bootstrap','text','css', 'routes', 'template','scbd-services/authentication'], function(ng, app) {

    ng.element(document).ready(function () {
         ng.bootstrap(document, [app.name]);
    });
});

// Fix IE Console
(function(a){a.console||(a.console={});for(var c="log info warn error debug trace dir group groupCollapsed groupEnd time timeEnd profile profileEnd dirxml assert count markTimeline timeStamp clear".split(" "),d=function(){},b=0;b<c.length;b++)a.console[c[b]]||(a.console[c[b]]=d)})(window); //jshint ignore:line
