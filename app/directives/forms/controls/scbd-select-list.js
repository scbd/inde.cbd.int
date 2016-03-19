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
		transclude : false,
		scope      : {binding:"=ngModal",
    items:"=?"
  },
		link: function($scope, $element, $attrs) {

          $scope.showOrgForm = false;

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

		      $scope.docs={};

          $scope.$watch('showOrgForm',function(){

              $scope.loadList();

          },true);

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
		      $scope.loadList = function (){
            $scope.atCapacity=false;
            authentication.getUser().then(function (user) {

              var params = {
                          q:{$or:[{'document.meta.status':'published','document.meta.v':{$ne:0}},
                                  {'document.meta.createdBy':user.userID,'document.meta.status':{$in:['draft','request']},'document.meta.v':{$ne:0}}]
                            },
                          f:{document:1}
                        };
              $http.get('https://api.cbd.int/api/v2015/inde-orgs',{'params':params}).then(function(res){
                        $scope.docs=res.data;
                }).then(function(){setChips();});
              });

          };


					//=======================================================================
		      //
		      //=======================================================================
		      $scope.select = function (docObj){

            docObj.selected=!docObj.selected;

              if(!_.isArray($scope.binding))$scope.binding=[];

              if(docObj.selected)
                $scope.binding.push(docObj._id);
              else
                _.remove($scope.binding,function(obj){return obj===docObj._id;});
		      };// select
		}
	};
}]);
});
