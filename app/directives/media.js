define(['app'], function(app) {
  app.directive('scbdMedia', ['$animate', function($animate) {
    return {
      multiElement: true,
      transclude: 'element',
      priority: 600,
      terminal: true,
      restrict: 'A',

      link: function($scope, $element, $attr, ctrl, $transclude) {

        var block, childScope, previousElements;

                  $scope.isXs = (window.innerWidth < 600);
                  $scope.isGtXs = (window.innerWidth >= 600);
                  $scope.isSm = (600 <= window.innerWidth < 960);
                  $scope.isGtSm = (window.innerWidth >= 960);
                  $scope.isMd = (960 <= window.innerWidth < 1280);
                  $scope.isGtMd = (window.innerWidth >= 1280);
                  $scope.isLg = (1280 <= window.innerWidth < 1920 );
                  $scope.isGtLg = (window.innerWidth >= 1920);

                  if (value) {
                    if (!childScope) {
                      $transclude(function(clone, newScope) {
                        childScope = newScope;
                        clone[clone.length++] = document.createComment(' end ScbdMedia:  ');
                        // Note: We only need the first/last node of the cloned nodes.
                        // However, we need to keep the reference to the jqlite wrapper as it might be changed later
                        // by a directive with templateUrl when its template arrives.
                        block = {
                          clone: clone
                        };
                        $animate.enter(clone, $element.parent(), $element);
                      });
                    }
                  } else {
                    if (previousElements) {
                      previousElements.remove();
                      previousElements = null;
                    }
                    if (childScope) {
                      childScope.$destroy();
                      childScope = null;
                    }
                    if (block) {
                      previousElements = getBlockNodes(block.clone);
                      $animate.leave(previousElements).then(function() {
                        previousElements = null;
                      });
                      block = null;
                    }
                  }



      } //end controller
    }; // return



  }]);

});