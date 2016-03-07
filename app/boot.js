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
        'angular-storage'          : 'libs/angular-local-storage/dist/angular-local-storage.min',
        'angular-messages'         : 'libs/angular-messages/angular-messages.min',
        'app-css'                  : 'css/main',
        'bootstrap'                : 'libs/bootstrap/dist/js/bootstrap.min',
        'css'                      : 'libs/require-css/css.min',
        'flag-icon-css'            : 'libs/flag-icon-css/css/flag-icon.min',
        'font-awsome-css'          : 'libs/font-awesome/css/font-awesome.min',
        'iconate'                  : 'libs/iconate/dist/iconate',
        'iconateCSS'               : 'libs/iconate/dist/iconate.min',
        'ionsound'                 : 'libs/ionsound/js/ion.sound.min',
        'jquery'                   : 'libs/jquery/dist/jquery',
        'linqjs'                   : 'libs/linqjs/linq.min',
        'lodash'                   : 'libs/lodash/lodash',
        'moment'                   : 'libs/moment/moment',
        'ng-file-upload'           :'libs/ng-file-upload/ng-file-upload.min',
        'ng-file-upload-shim'      :'libs/ng-file-upload/ng-file-upload.shim.min',
        'ngDialog':'libs/ng-dialog/js/ngDialog.min',
        'outdated-browser-css'     : 'libs/outdated-browser/outdatedbrowser/outdatedbrowser.min',
        'shim'                     : 'libs/require-shim/src/shim',
        'text'                     : 'libs/requirejs-text/text',
        'text-angular-sanitize' : 'libs/textAngular/dist/textAngular-sanitize.min',
        'text-angular'          : 'libs/textAngular/dist/textAngular.min',
        'socket.io'             : 'libs/socket.io-1.4.5/index'
//        'URIjs'                    : 'libs/uri.js/src',
    },
    shim: {
        'libs/angular/angular'    : { deps: ['jquery'] },
        'angular'                 : { deps: ['libs/angular/angular'] },
        'angular-route'           : { deps: ['angular'] },
        'angular-sanitize'              : { 'deps': ['angular'] },
        'guid'                    : { exports: 'ui_guid_generator' },
        'angular-animate'         : { deps: ['angular']},
        'angular-loading-bar'     : { deps: ['angular'] },
        'bootstrap'               : { deps:[ 'jquery']},
        'ng-file-upload'          : { deps:[ 'angular']},
        'text-angular'                  : { 'deps': ['text-angular-sanitize', 'angular'] },
        'text-angular-sanitize'         : { 'deps': ['angular', 'angular-sanitize']},
    },
    packages: [
      { name: 'scbd-angularjs-services', location : 'libs/scbd-angularjs-services/services' },
      { name: 'scbd-branding', location : 'libs/scbd-branding/directives' },
      { name: 'scbd-filters',  location : 'libs/scbd-filters/filters' },
      { name: 'scbd-angularjs-filters',  location : 'libs/scbd-angularjs-services/filters' },
      { name: 'scbd-angularjs-controls', location : 'libs/scbd-angularjs-controls/form-control-directives' },

    ]
});

// BOOT

require(['angular', 'app', 'text', 'routes', 'template','bootstrap'], function(ng, app) {

    ng.element(document).ready(function () {
         ng.bootstrap(document, [app.name]);
    });
});

// Fix IE Console
(function(a){a.console||(a.console={});for(var c="log info warn error debug trace dir group groupCollapsed groupEnd time timeEnd profile profileEnd dirxml assert count markTimeline timeStamp clear".split(" "),d=function(){},b=0;b<c.length;b++)a.console[c[b]]||(a.console[c[b]]=d)})(window); //jshint ignore:line
