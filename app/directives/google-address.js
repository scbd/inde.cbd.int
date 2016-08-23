define(['text!./google-address.html', 'app', ], function(template, app) {
    'use strict';

    app.directive('googleAddress', ['$timeout', function($timeout) {
        return {
            restrict: 'EA',
            template: template,
            replace: true,
            require:['^ngModel','googleAddress'],
            scope: {
                binding: '=ngModel',
document:'=document',
                form:'=form'
            },

            link: function($scope,$element,$attrs,ctrl) {
              $scope.form.$addControl(ctrl[0]);
              ctrl[1].init();
            },

            controller: ['$scope','$element', function($scope,$element) {

                //=======================================================================
                //
                //=======================================================================
                function init() {
                  var autoComplete = new google.maps.places.Autocomplete($element.find('#address')[0]);
                  google.maps.event.addListener(autoComplete, 'place_changed', function() {
                    $scope.binding=$element.find('#address')[0].value;
                   var place = autoComplete.getPlace();
                   var parsedUrl = parseURL(place.url);
                   $timeout(function(){$scope.document.googleMaps=parsedUrl.protocol+'://'+parsedUrl.host+'/?q='+parsedUrl.params['?q']+'/@'+place.geometry.location.lat()+','+place.geometry.location.lng()+',18z/&ftid='+parsedUrl.params.ftid;
                         $scope.document.geoLocation={
                             lat : parseFloat(place.geometry.location.lat()),
                             lng : parseFloat(place.geometry.location.lng())
                          };
                 });
                });
              }// init
              this.init=init;
              //=======================================================================
              //
              //=======================================================================
              function parseURL(url) {
                  var a =  document.createElement('a');
                  a.href = url;
                  return {
                      source: url,
                      protocol: a.protocol.replace(':',''),
                      host: a.hostname,
                      port: a.port,
                      query: a.search,
                      params: (function(){
                          var ret = {},
                              seg = a.search.replace('/^?/','').split('&'),
                              len = seg.length, i = 0, s;
                          for (;i<len;i++) {
                              if (!seg[i]) { continue; }
                              s = seg[i].split('=');
                              ret[s[0]] = s[1];
                          }
                          return ret;
                      })(),
                      file: a.pathname ,
                      hash: a.hash.replace('#',''),
                      path: a.pathname,
                      segments: a.pathname.split('/')
                  };
              }

            }],
        }; // return
    }]);

}); // define