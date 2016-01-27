require.config({
    waitSeconds: 120,
    baseUrl : 'app/',
    paths: {
        'authentication'   : 'factories/authentication',
        'angular'          : 'libs/angular-flex/angular-flex',
        'angular-route'    : 'libs/angular-route/angular-route',
        'text'             : 'libs/requirejs-text/text',
        'bootstrap'        : 'libs/bootstrap/dist/js/bootstrap',
        'lodash'           : 'libs/lodash/lodash',
        'jquery'           : 'libs/jquery/dist/jquery',
        'URIjs'               : 'libs/uri.js/src',
        'linqjs'              : 'libs/linqjs/linq.min',
        'guid'                : 'libs/ui-guid-generator/dist/ui-guid-generator.min',
        'moment'              : 'libs/moment/moment',
        'css'                 : 'libs/require-css/css.min',
        'shim'                : 'libs/require-shim/src/shim'
    },
    shim: {
        'libs/angular/angular'     : { deps: ['jquery'] },
        'angular'                  : { deps: ['libs/angular/angular'] },
        'angular-route'            : { deps: ['angular'] },
        'bootstrap'                : { deps: ['jquery'] },
        'guid'                     : { exports: 'ui_guid_generator' },
    },

});

// BOOT

require(['angular', 'app', 'bootstrap', 'authentication', 'routes', 'template'], function(ng, app) {

    ng.element(document).ready(function () {
         ng.bootstrap(document, [app.name]);
    });
});

// Fix IE Console
(function(a){a.console||(a.console={});for(var c="log info warn error debug trace dir group groupCollapsed groupEnd time timeEnd profile profileEnd dirxml assert count markTimeline timeStamp clear".split(" "),d=function(){},b=0;b<c.length;b++)a.console[c[b]]||(a.console[c[b]]=d)})(window); //jshint ignore:line
