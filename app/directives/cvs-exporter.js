define(['app'], function(app) {
  'use strict';

  app.directive('cvsExporter',['$timeout','$window','$q', function($timeout,$window,$q) {
  return {
   restrict: 'A',
   scope:{ buildFile:'&?'},
   link: function($scope, $element,$attrs) {

        //=======================================================================
        //
        //=======================================================================
        function downloadCvs (cvsData) {

                if(!cvsData) throw 'Error, no cvs data passed for downlaod';

                var fileName = $attrs.fileName || 'export.cvs';
                var linkEl = angular.element('<a/>');
                var aElAttr = {
                                href: 'data:attachment/csv;base64,' + $window.btoa(unescape(encodeURIComponent(cvsData))),
                                target: '_blank',
                                download: fileName
                              };

                linkEl.attr(aElAttr)[0].click();
                // $timeout(function(){
                //   linkEl.remove();
                // }, 50);
                //$scope.$apply();

        }

        //=======================================================================
        //
        //=======================================================================
        function isPromise (cvsData) {
            return (!!cvsData &&
                   (typeof cvsData === 'object' || typeof cvsData === 'function') &&
                   typeof cvsData.then === 'function'
                 );
        }

        $element.bind('click', function() {
            if($scope.buildFile && (typeof $scope.buildFile == 'function'))
                return $scope.buildFile().then(downloadCvs);

            if(isPromise($attrs.cvsData))
                $q.when($attrs.cvsData).then(downloadCvs);
            else
                downloadCvs($attrs.cvsData);
         });


     }//link
   };//return
  }]);
});// define