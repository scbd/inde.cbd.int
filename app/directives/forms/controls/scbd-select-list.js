define([ 'app', 'lodash','text!./scbd-select-list.html',
'css!./scbd-select-list',
'../../../services/filters',
'../../../services/services',
    '../../../services/mongo-storage'
], function( app, _,template) { 'use strict';

app.directive('scbdSelectList', ["$location","$timeout",'mongoStorage','schemaIcon','$compile', function ($location,$timeout,mongoStorage,schemaIcon,$compile) {
	return {
		restrict   : 'E',
		template   : template,
		//replace    : true,
		transclude : false,
		scope      : {binding:"=ngModal",
    items:"=?"
  },
		link: function($scope, $element, $attrs) {


					$scope.name = $attrs.name;
					//==================================
					//
					//
					//==================================
					function init () {

								$scope.loadList ();
					}// init
					$scope.loading=false;
		      $scope.schema=$attrs.schema;
		      $scope.icon=schemaIcon($attrs.schema);

		      $scope.docs;

		      $scope.sortReverse=0;
		      $scope.listView=0;//list,tiles,details
					$scope.sOpen=0; //search open

					//=======================================================================
		      //
		      //=======================================================================
		      $scope.searchToggle= function (){
		        var serEl =$element.find('.search');
						serEl.toggleClass('search-expanded');
						serEl.focus();
						$scope.sOpen=!$scope.sOpen;
						$scope.search='';
		      };// archiveOrg
		      //=======================================================================
		      //
		      //=======================================================================
		      $scope.loadList = function (){
		        mongoStorage.loadDocs($scope.schema).then(function(response){
		           $scope.docs=response.data;
		         });
		      };// archiveOrg
		      //=======================================================================
		      //
		      //=======================================================================
		      $scope.toggleListView = function (docObj){
			        if($scope.listView===0)
			            $scope.listView=1;
			        else if($scope.listView===1)
			            $scope.listView=2;
			        else
			          $scope.listView=0;
		      };//toggleListView
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

		      };// archiveOrg


		      //=======================================================================
		      //
		      //=======================================================================
		      $scope.goTo = function (url){
		        $location.url(url);
		      }// archiveOrg


		init();
		}
	};
}]);
});
