define(['app'], function(app) {
    'use strict';

    app.directive('mobiMenu', ['$document', '$timeout', function($document, $timeout) {
        return {
            restrict: 'A',
            scope: {
                onFileChange: "&onFile"
            },
            link: function($scope, $element) {
                var template = '<span class="visible-xs" ><button class="collapsed" type="button" data-toggle="collapse" data-target=".navbar-collapse1" ><i id="mobi-menu-icon" class="fa fa-bars" style="font-size:1.66em;"></i></button></span>';

                $scope.mobiMenuOpen = false;

                $element.prepend(angular.element(template));
                $element.mouseup(toggleMenu);

                var el = $element.find('#mobi-menu-icon');
                var menuEl = $document.find('.navbar-collapse1');


                $timeout(function() {
                    if (menuEl.hasClass('in')) {
                        el.removeClass('fa-bars');
                        el.addClass('fa-close');


                    } else {

                        el.removeClass('fa-close');
                        el.addClass('fa-bars');

                    }
                });


                function toggleMenu() {

                    $timeout(function() {
                        if (menuEl.hasClass('in')) {
                            el.removeClass('fa-bars');
                            el.addClass('fa-close');


                        } else {

                            el.removeClass('fa-close');
                            el.addClass('fa-bars');

                        }
                    }, 500);

                }
            }
        }; // return
    }]); //app.directive('searchFilterCountries
}); // define