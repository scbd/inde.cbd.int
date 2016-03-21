define(['app',
    'iconate',
    'lodash',
    'css!./scbd-icon-button',
    'css!iconateCSS',

    './waves'
  ],
  function(app, iconate, _) {

    app.directive('scbdIconButton', ['$timeout', 'wavesService', '$document', function($timeout, wavesService, $document) {
      return {
        restrict: 'E',
        replace: true,
        transclude: true,
        //type from to to
        scope: {
          active: '=',
        },
        template: '<i class="scbd-icon" ng-click="click();">{{iconName}}<ng-transclude></ng-transclude></i>',
        link: function($scope, $element, $attr) {

            var iconName;
            var toIconName;
            var options; // inimation-transform options
            // $scope.on = ($attr.hasOwnProperty('on') &&  )|| 0;
            // if($scope.on)transform();
            $scope.now = new Date().getTime();
            $element.addClass('btn-icon');
            if ($attr.hasOwnProperty('waves') && $attr.waves !== 'false' && $attr.waves !== '0') {
              wavesService.init();
              wavesService.attach($element, ['waves-effect', 'waves-circle']); //,'waves-circle'
            }
            if ($attr.hasOwnProperty('wavesLight') && $attr.waves !== 'false' && $attr.waves !== '0') {
              wavesService.init();
              wavesService.attach($element, ['waves-effect', 'waves-circle', 'waves-light']); //,'waves-circle'
            }

            if ($attr.type === 'fa') {
              $element.addClass('fa fa-fw');
              $element.addClass($attr.iconName);
            } else if ($attr.type === 'md') {
              $element.addClass('material-icons');
              $scope.iconName = $attr.iconName;
            }

            if ($attr.hasOwnProperty('badge')) {
              if ($attr.type === 'fa')
                $element.addClass('fa-badge fa-badge--overlap');
              else if ($attr.type === 'md')
                $element.addClass('md-badge md-badge--overlap');
            }


            if ($attr.ani && $attr.type === 'fa') {
              transformInit();
            }

            $scope.click = function() {
              if ($attr.ani && $attr.type === 'fa')
                $scope.toggle();
            };
            //============================================================
            //
            //============================================================
            function transformInit() {
              iconName = _.clone($attr.iconName);
              toIconName = _.clone($attr.toIconName);

              $scope.on = 0;
              $scope.ignoreWatch = 0;

              $scope.toggle = function() {
                $scope.ignoreWatch = 1;
                if ($scope.on)
                  transformBack();
                else
                  transform();

                $scope.on = !$scope.on;

              };

              $scope.$watch('active', function(newValue, oldValue) {
                if (typeof $scope.active != 'undefined')
                  $timeout(function() {
                    if (!$scope.ignoreWatch) $scope.toggle();
                    else $scope.ignoreWatch = 0;
                  }, 500);
              });


            } //transfor

            //============================================================
            //
            //============================================================
            function transform() {
              options = {
                from: iconName,
                to: toIconName, //toIconName,
                animation: $attr.ani
              };
              iconate($element[0], options);
            } //transform

            //============================================================
            //
            //============================================================
            function transformBack() {
              options = {
                from: toIconName,
                to: iconName, //toIconName,
                animation: $attr.ani
              };
              iconate($element[0], options);
            } //transform

            //============================================================
            //
            //============================================================
            function addCSSRule(sheet, selector, rules, index) {
              if ("insertRule" in sheet) {
                sheet.insertRule(selector + "{" + rules + "}", index);
              } else if ("addRule" in sheet) {
                sheet.addRule(selector, rules, index);
              }
            }

          } //link
      }; //return
    }]); //directive

  }); //define