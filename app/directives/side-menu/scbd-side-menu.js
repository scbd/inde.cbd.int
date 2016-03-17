define(['app',
    'text!./scbd-side-menu.html',
    'lodash',
    'css!./scbd-side-menu',
    './menu-toggle',
    './menu-link',
    './scbd-menu-service',
    '../scbd-icon-button'
  ],
  function(app, template, _) {
    //============================================================
    //  angular implimentation of Pushy by scbd
    // Pushy - v0.9.2 - 2014-9-13
    //  github.com/christophery/pushy
    //============================================================
    app.directive('scbdSideMenu',['scbdMenuService','$document','authentication', function(scbdMenuService,$document,auth) {
      return {
        restrict: 'E',
        priority: 600, //parent has 0 priority
        template: template,
        scope: {
          sections: '=',

        },
        require:'^scbdSideMenu',
        transclude: true,
        //============================================================
        //
        //
        //============================================================
        link: function($scope, $element, $attr,scbdSideMenu,$window) {

          auth.getUser().then(function(user){

            $scope.user = user;
          });
          $scope.isOpen=false;
          if($attr.hasOwnProperty('fullScreenHeight')){
              $scope.fullScreenHeight = true;
              $element.find('.pushy').css('z-index','999');
          }else{
            $element.find('.pushy').css('z-index','500');
          }

          if($attr.bumpId)
            $scope.bumpId=$attr.bumpId;

          if($attr.hasOwnProperty('overlay'))
              $scope.overlay = true;

          if($attr.hasOwnProperty('open'))
              $scope.open=true;

          if($attr.hasOwnProperty('rightSide'))
            $scope.isRight=true;
          else
            $scope.isRight=false;

          $scope.navId=$attr.id;


          $element.find('.site-overlay').attr('id','site-overlay-'+$attr.id);




          $scope.$watch('sections',function(){
              if($scope.sections && $scope.sections.length>=2){
                  scbdSideMenu.init($attr.id,scbdSideMenu);
              }

          });

        },






        controller: ['$scope', '$element',  '$timeout', '$log', '$transclude','$window',
          function($scope, $element, $timeout, $log, $transclude,$window) {
                var pushy = $element.find('.pushy');
                $scope.isOpen=false;
                var isOpen=false;

                var

            		container = angular.element($document[0].body).find('#'+$scope.bumpId), //container css class
            		push = $element.find('.push'), //css class to add pushy capability
                containerWidth = $('.view').innerWidth() || $window.innerWidth,
            		// siteOverlay = $element.find('.site-overlay'), //site overlay
                // pushyClass = "pueft pushy-open", //menu position & menu open class
            		pushyClassLeft = "pushy-left pushy-open", //menu position & menu open class
            		pushyClassRight = "pushy-right pushy-open", //menu position & menu open class
            		pushyActiveClass = "pushy-active", //css class to toggle site overlay
            		// containerClass = "container-push", //container open class
            		// pushClass = "push-push", //css class to add pushy capability
            		// menuBtn = $('.menu-btn, .pushy a'), //css classes to toggle the menu
            		menuSpeed = 200; //jQuery fallback menu speed

                var resizeInProgress = false;
            		//menuWidth = pushy.width() + "px"; //jQuery fallback menu width

            //============================================================
            //  inseart transclude header
            //============================================================
            $element.find('section').append($transclude());
              $scope.close = function() {
              scbdMenuService.close($scope.id);
            };
//             function getStyleSheet(unique_title) {
//               for(var i=0; i<$document[0].styleSheets.length; i++) {
//                 var sheet = $document[0].styleSheets[i];
// console.log(sheet);
//                 if(sheet.title == unique_title) {
//                   return sheet;
//                 }
//               }
//             }

          function init(navId,scbdSideMenu){

                scbdMenuService.registerNavInstance(navId,scbdSideMenu);


                if($scope.fullScreenHeight)
                  pushy.css('position','fixed');

                if($scope.isRight){

                    pushy.toggleClass('pushy-right'); // if left must do this first
                    pushy.addClass('p-right');
                    pushy.css('display','none');
                  }
                else{
                  pushy.toggleClass('pushy-left');
                  pushy.css('display','block');
                }
                     // if left must do this first

                pushy.addClass($scope.sections[0].menuClass);
                //
                if($scope.open)
                    setTimeout(function(){togglePushy();},500);

                if($scope.bumpId)
                $($window).resize(function() {
                    resizeContainer();

                });

          }



            //============================================================
            //  toggle
            //============================================================
            function togglePushy(){

                  if($scope.isRight){
                    if($scope.isOpen)
                      closePushyRight();
                    else
                      openPushyRight();
                  }
                  else{ // is left side
                    if($scope.isOpen)
                      closePushyLeft();
                    else
                      openPushyLeft();
                  }
                  if($scope.overlay)
                    $element.toggleClass(pushyActiveClass);

          	}//togglePushy()

            //============================================================
            //
            //============================================================
            function openPushyRight(){
              pushy.css('display','block');
              $timeout(function(){
                pushy.toggleClass(pushyClassRight);
                pushContainerLeft();

              },100);

                $scope.isOpen=true;
                isOpen=true;

            }

            //============================================================
            //
            //============================================================
            function openPushyLeft(){
                pushy.toggleClass(pushyClassLeft);
                pushContainerRight();
                $scope.isOpen=true;
                isOpen=true;
            }// openPushyLeft

            //============================================================
            //
            //============================================================
            function closePushyRight(){

                pushy.toggleClass(pushyClassRight);
                resetContainer();
                $scope.isOpen=false;
                isOpen=false;

                $timeout(function(){pushy.css('display','none');},100);
            }// closePushyRight

            //============================================================
            //
            //============================================================
            function closePushyLeft(){
                pushy.toggleClass(pushyClassLeft);
                resetContainer();
                $scope.isOpen=false;
                isOpen=false;
            }//closePushyLeft

            //============================================================
            //
            //============================================================
            function pushContainerRight(){
              if(!$scope.bumpId)return;
              container = angular.element($document[0].body).find('#'+$scope.bumpId);
          		container.css('-webkit-transform','translate3d(240px,0,0)');
            	container.css('-moz-transform','translate3d(240px,0,0)');
              container.css('-ms-transform','translate3d(240px,0,0)');
              container.css('-o-transform','translate3d(240px,0,0)');
              container.css('transform','translate3d(240px,0,0)');
              containerWidth = container.css('width');
              resizeContainer();
          	}// pushContainerRight

            //============================================================
            //
            //============================================================
            function pushContainerLeft(){
              if(!$scope.bumpId)return;
              container = angular.element($document[0].body).find('#'+$scope.bumpId);
          		container.css('-webkit-transform','translate3d(0,0,0)');
            	container.css('-moz-transform','translate3d(0,0,0)');
              container.css('-ms-transform','translate3d(0,0,0)');
              container.css('-o-transform','translate3d(0,0,0)');
              container.css('transform','translate3d(0,0,0)');
              containerWidth = container.css('width');
              resizeContainer();
          	}//pushContainerLeft

            //============================================================
            //
            //============================================================
            function resetContainer(){
              if(!$scope.bumpId)return;
              container = angular.element($document[0].body).find('#'+$scope.bumpId);
          		container.css('-webkit-transform','translate3d(0,0,0)');
            	container.css('-moz-transform','translate3d(0,0,0)');
              container.css('-ms-transform','translate3d(0,0,0)');
              container.css('-o-transform','translate3d(0,0,0)');
              container.css('transform','translate3d(0,0,0)');
              containerWidth = $('.view').innerWidth() || $window.innerWidth;

var mLeft = container.css('margin-left');
var mRight = container.css('margin-right');

              containerWidth = containerWidth - Number(mLeft.slice(0, -2)) - Number(mRight.slice(0, -2));

              container.css('width',containerWidth);
          	}// resetContainer

            //============================================================
            //
            //============================================================
            function resizeContainer(){
                  if(!resizeInProgress){
                        resizeInProgress =true;

                            containerWidth = $('.view').innerWidth() || $window.innerWidth,
                            container.css('width',(containerWidth-278));
                            resizeInProgress =false;

                  }
          	}//resizeContainer

            //============================================================
            //  open fall back
            //============================================================
            function openPushyFallback(){
          		body.addClass(pushyActiveClass);
          		$scope.pushy.animate({left: "0px"}, menuSpeed);
          		container.animate({left: menuWidth}, menuSpeed);
          		push.animate({left: menuWidth}, menuSpeed); //css class to add pushy capability
          	}//openPushyFallback

            //============================================================
            //  open fall back
            //============================================================
            function closePushyFallback(){
          		body.removeClass(pushyActiveClass);
          		$scope.pushy.animate({left: "-" + menuWidth}, menuSpeed);
          		container.animate({left: "0px"}, menuSpeed);
          		push.animate({left: "0px"}, menuSpeed); //css class to add pushy capability
          	}//closePushyFallback


            //============================================================
            //
            //============================================================
            function closeAllToggles(sectionName) {
              $timeout(function() {
                _.each($scope.sections, function(section) {
                  if (sectionName !== section.name)
                    section.open = 0;
                });
              });
            } // closeAllToggles

            //============================================================
            //
            //============================================================
            function getId() {

                  return $scope.id;
            } // closeAllToggles


            //============================================================
            //   API
            //============================================================
            this.toggle=togglePushy;
            this.init=init;
            $scope.toggle=togglePushy;
            this.closeAllToggles = closeAllToggles;
            this.toggle=togglePushy;
            this.getId=getId;
            this.isOpen=isOpen;
          }
        ], //controller


      }; //return
    }]); //directive
  });