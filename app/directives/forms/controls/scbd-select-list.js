define(['app', 'lodash', 'text!./scbd-select-list.html',
      'css!./scbd-select-list.css',
      '../../../services/filters',
      '../../../services/mongo-storage'
    ], function(app, _, template) {
      'use strict';



app.directive('scbdSelectList', ["$location","$timeout",'mongoStorage','$http','authentication',function ($location,$timeout,mongoStorage,$http,authentication) {

	return {
		restrict   : 'E',
		template   : template,
		//replace    : true,
    priority:600,
		transclude : false,
		scope      : {binding:"=ngModal",
    showOrgForm:"=?",doc:"=doc"
  },
		link: function($scope, $element, $attrs) {

          if(typeof $scope.showOrgForm === 'undefined')
            $scope.showOrgForm = 0;

					$scope.name = $attrs.name;

          if($attrs.hasOwnProperty('single'))
            $scope.single=true;
          else {
            $scope.single=false;
          }

          $scope.now=0;

					$scope.loading=true;
          if($attrs.schema)
		        $scope.schema=$attrs.schema;

		      $scope.docs=[];

          $scope.$watch('showOrgForm',function(){

              if(typeof $scope.doc !== 'undefined')
                $scope.loadList();

          },true);
          $scope.$watch('doc',function(){
              if(typeof $scope.doc !== 'undefined')
                $scope.loadList();

          });
          //==================================
					//
					//
					//==================================
					function init () {

					     //$scope.loadList();

					}// init

          //==================================
					//
					//
					//==================================
					function setChips () {
            $timeout(function(){
              if($scope.binding)
  								if($scope.binding.length>0){
                        $scope.loading=false;
                        _.each($scope.docs,function(doc){
                          _.each($scope.binding,function(id){

                              if(doc._id===id){
                                doc.selected=!doc.selected;

                                //$scope.select(doc);
                              }
                          });
                        });
                  }
            },500);
					}// set chips


          //=======================================================================
          //
          //=======================================================================
          $scope.searchToggle= function (){
            var serEl =$element.find('.lst-search');
            serEl.toggleClass('lst-search-expanded');
            serEl.focus();
            var serElb =$element.find('.search-lbtn');
            serElb.toggleClass('search-lbtn-expanded');

            $scope.sOpen=!$scope.sOpen;
            $scope.search='';
          };// archiveOrg
          //=======================================================================
          //
          //=======================================================================
          $scope.noEnter= function (event){
            if(event.keyCode === 13) {   // '13' is the key code for enter
                event.preventDefault();
            }
          };// archiveOrg
          //=======================================================================
		      //
		      //=======================================================================
		      $scope.loadList = function (){
            $scope.atCapacity=false;
            var createdByParams ={'meta.status':'published','meta.v':{$ne:0}};
            authentication.getUser().then(function (user) {

              if($scope.doc.meta && $scope.doc.meta.createdBy)
                createdByParams = {'meta.createdBy':$scope.doc.meta.createdBy,'meta.status':{$in:['draft','request']},'meta.v':{$ne:0}};
              var params = {
                          q:{$or:[{'meta.status':'published','meta.v':{$ne:0}},
                                  {'meta.createdBy':user.userID,'meta.status':{$in:['draft','request']},'meta.v':{$ne:0}},
                                  createdByParams
                                ]
                            },
                        };
              $http.get('https://api.cbd.int/api/v2015/inde-orgs',{'params':params}).then(function(res){
                        $scope.docs=res.data;

                }).then(function(){setChips();});
              });

          };


					//=======================================================================
		      //
		      //=======================================================================
		      $scope.select = function (docObj,reload){

            docObj.selected=!docObj.selected;

              if(!_.isArray($scope.binding))$scope.binding=[];

              if(docObj.selected)
                $scope.binding.push(docObj._id);
              else
                _.remove($scope.binding,function(obj){return obj===docObj._id;});

              if(reload)
                $scope.loadList();
		      };// select
		}
	};
}]);
});
