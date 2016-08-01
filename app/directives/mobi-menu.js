define(['app'], function(app) {
  'use strict';

  app.directive('mobiMenu',['$document' ,function($document) {
    return {
      restrict: 'A',
      scope: {
          onFileChange : "&onFile"
      },
      link: function($scope, $element) {
        var  template='<span class="visible-xs" ><button class="collapsed" type="button" data-toggle="collapse" data-target=".navbar-collapse1" ><i id="mobi-menu-icon" class="fa fa-bars" style="font-size:1.66em;"></i></button></span>';

          $scope.mobiMenuOpen=false;

          $element.prepend(angular.element(template));
          $element.click(toggleMenu);

          if($document.find('.navbar-collapse1').hasClass('in')) toggleMenu();

            function toggleMenu(){
              var el = $element.find('#mobi-menu-icon');
              el.toggleClass('fa-bars');
              el.toggleClass('fa-close');
            }
      }
    }; // return
  }]); //app.directive('searchFilterCountries
}); // define
