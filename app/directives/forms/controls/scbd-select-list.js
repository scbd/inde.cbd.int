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



					$scope.name = $attrs.name;

          if($attrs.hasOwnProperty('single'))
            $scope.single=true;
          else {
            $scope.single=false;
          }

					$scope.loading=true;
          if($attrs.schema)
		      $scope.schema=$attrs.schema;
		    //  $scope.icon=schemaIcon($attrs.schema);

		      $scope.docs;



          $scope.$watch('binding',function(){

              if($scope.binding && $scope.binding.length >0 && $scope.loading)
                  setChips();
          },true);
          $scope.$watch('items',function(){

              init();
          });
          //==================================
					//
					//
					//==================================
					function init () {

					     $scope.loadList();

					}// init

          //==================================
					//
					//
					//==================================
					function setChips () {
								if($scope.binding.length>0){
                      $scope.loading=false;
                      _.each($scope.docs,function(doc){
                        _.each($scope.binding,function(id){

                            if(doc._id===id){
                              $scope.select(doc);
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
//"document.meta.createdBy":'+user.userID+',"document.meta.status":"draft"
              $http.get('https://api.cbd.int/api/v2015/inde-orgs?q={"document.meta.status":{"$nin":["archived","deleted","request","draft","rejected"]},"document.meta.v":{"$ne":0}}&f={"document":1}').then(function(res){
                        $scope.docs=res.data;
                $http.get('https://api.cbd.int/api/v2015/inde-orgs?q={"document.meta.createdBy":'+user.userID+',"document.meta.status":"draft","document.meta.v":{"$ne":0}}&f={"document":1}').then(function(res2){

                      $scope.docs = $scope.docs.concat(res2.data);

                }).then(function(){setChips();});
              });
            });

          };


					//=======================================================================
		      //
		      //=======================================================================
		      $scope.select = function (docObj){
            //if($scope.atCapacity  && !docObj.selected) return;

            $timeout(function(){

              docObj.selected=!docObj.selected;

                if(!_.isArray($scope.binding))$scope.binding=[];

                if(docObj.selected)
                  $scope.binding.push(docObj._id);
                else
                  _.remove($scope.binding,function(obj){return obj===docObj._id;});

            });


		      };// archiveOrg




	//	init();
		}
	};
}]);
});
