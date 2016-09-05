define(['text!./google-address.html', 'app','lodash' ], function(template, app,_) {
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
                var autoComplete;
                //=======================================================================
                //
                //=======================================================================
                function init() {
                  autoComplete = new google.maps.places.Autocomplete($element.find('#address')[0],{types: ['geocode']});
                  google.maps.event.addListener(autoComplete, 'place_changed', function() {
                    $scope.binding=$element.find('#address')[0].value;
                    var place = autoComplete.getPlace();
                  });
                  autoComplete.addListener('place_changed', fillInAddress);
                }// init
                this.init=init;

                //=======================================================================
                //
                //=======================================================================
                function fillInAddress() {
                    // Get the place details from the autocomplete object.
                    $timeout(function() {
                        var place = autoComplete.getPlace();

                        $scope.document.contact.address = '';
                        $scope.document.contact.city = '';
                        $scope.document.contact.state = '';
                        $scope.document.contact.country = '';
                        $scope.document.contact.zip = '';

                        place.address_components.forEach(function(component) {

                            if (component.types.indexOf('street_number') >= 0)
                                $scope.document.contact.address = component.long_name;

                            if (component.types.indexOf('route') >= 0)
                                $scope.document.contact.address += ' ' + component.long_name;

                            if (component.types.indexOf('sublocality') >= 0)
                                $scope.document.contact.city = component.long_name + ', ';

                            if (component.types.indexOf('locality') >= 0)
                                $scope.document.contact.city += component.long_name;

                            if (component.types.indexOf('administrative_area_level_1') >= 0)
                                $scope.document.contact.state = component.long_name;

                            if (component.types.indexOf('country') >= 0)
                                $scope.document.contact.country = component.short_name.toLowerCase();

                            if (component.types.indexOf('postal_code') >= 0)
                                $scope.document.contact.zip = component.long_name;

                        }, 100);
                    });

                }// fillInAddress
                this.fillInAddress=fillInAddress;

            }],
        }; // return
    }]);

}); // define