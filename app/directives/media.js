define(['app'], function(app) {

  app.factory('scbdMedia',['$window','$timeout', function($window,$timeout) {

      var isXs;
      var isGtXs ;
      var isSm ;
      var isGtSm ;
      var isMd ;
      var isGtMd;
      var isLg;
      var isGtLg;

      angular.element($window).on('resize',setMedia);

      function setMedia(){

          if(!screen.width){
            isXs = ($window.innerWidth < 600);
            isGtXs = ($window.innerWidth >= 600);
            isSm = (600 <= Number($window.innerWidth) &&  Number($window.innerWidth) < 960);
            isGtSm = ($window.innerWidth >= 960);
            isMd = (960 <= Number($window.innerWidth) &&  Number($window.innerWidth)< 1280);
            isGtMd = ($window.innerWidth >= 1280);
            isLg = (1280 <= Number($window.innerWidth) &&  Number($window.innerWidth) < 1920 );
            isGtLg = ($window.innerWidth >= 1920);
          }else{
            isXs = (screen.width < 600);
            isGtXs = (screen.width >= 600);
            isSm = (600 <= Number(screen.width) && Number(screen.width) < 960);
            isGtSm = (screen.width >= 960);
            isMd = (960 <= Number(screen.width) && Number(screen.width)< 1280);
            isGtMd = (screen.width >= 1280);
            isLg = (1280 <= Number(screen.width) && Number(screen.width) < 1920 );
            isGtLg = (screen.width >= 1920);
          }

      }
      setMedia();

      return {
        isXs:isXs,
        isGtXs:isGtXs,
        isSm:isSm,
        isGtSm:isGtSm,
        isMd:isMd,
        isGtMd:isGtMd,
        isLg:isLg,
        isGtLg:isGtLg
      };
  }]);

  app.directive('hideXs', ['scbdMedia','$compile', function(scbdMedia,$compile) {
    return {
      priority: 600,
      terminal: true,
      restrict: 'A',
      link: function($scope, $element, $attr) {
            $element.attr('ng-if', !scbdMedia.isXs);
            console.log($element);
            $compile($element)($scope);
      } //end controller
    }; // return
  }]);
  app.directive('hideSm', ['scbdMedia','$compile', function(scbdMedia,$compile) {
    return {
      priority: 600,
      terminal: true,
      restrict: 'A',
      link: function($scope, $element, $attr) {
            $element.attr('ng-if', !scbdMedia.isSm);
            console.log($element);
            $compile($element)($scope);
      } //end controller
    }; // return
  }]);

  app.directive('hideMd', ['scbdMedia','$compile', function(scbdMedia,$compile) {
    return {
      priority: 600,
      terminal: true,
      restrict: 'A',
      link: function($scope, $element, $attr) {
            $element.attr('ng-if', !scbdMedia.isMd);
            console.log($element);
            $compile($element)($scope);
      } //end controller
    }; // return
  }]);

  app.directive('hideLg', ['scbdMedia','$compile', function(scbdMedia,$compile) {
    return {
      priority: 600,
      terminal: true,
      restrict: 'A',
      link: function($scope, $element, $attr) {
            $element.attr('ng-if', !scbdMedia.isLg);
            console.log($element);
            $compile($element)($scope);
      } //end controller
    }; // return
  }]);
  app.directive('hideGtSm', ['scbdMedia','$compile', function(scbdMedia,$compile) {
    return {
      priority: 600,
      terminal: true,
      restrict: 'A',
      link: function($scope, $element, $attr) {
            $element.attr('ng-if', !scbdMedia.isGtSm);
            console.log($element);
            $compile($element)($scope);
      } //end controller
    }; // return
  }]);

  app.directive('hideGtMd', ['scbdMedia','$compile', function(scbdMedia,$compile) {
    return {
      priority: 600,
      terminal: true,
      restrict: 'A',
      link: function($scope, $element, $attr) {
            $element.attr('ng-if', !scbdMedia.isGtMd);
            console.log($element);
            $compile($element)($scope);
      } //end controller
    }; // return
  }]);

  app.directive('hideGtLg', ['scbdMedia','$compile', function(scbdMedia,$compile) {
    return {
      priority: 600,
      terminal: true,
      restrict: 'A',
      link: function($scope, $element, $attr) {
            $element.attr('ng-if', !scbdMedia.isGtLg);
            console.log($element);
            $compile($element)($scope);
      } //end controller
    }; // return
  }]);


});