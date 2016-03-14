define([ 'app', 'lodash','text!./scbd-select-list.html',
'../../../services/filters',
'../../../services/services',
    '../../../services/mongo-storage'
], function( app, _,template) { 'use strict';

app.directive('scbdSelectList', ["$location","$timeout",'mongoStorage','schemaIcon','$compile','$http', function ($location,$timeout,mongoStorage,schemaIcon,$compile,$http) {
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

					$scope.loading=false;
          if($attrs.schema)
		      $scope.schema=$attrs.schema;
		      $scope.icon=schemaIcon($attrs.schema);

		      $scope.docs;
          $scope.atCapacity=0;
		      $scope.sortReverse=0;
		      $scope.listView=0;//list,tiles,details
					$scope.sOpen=0; //search open

          $scope.$watch('binding',function(){
              //if($scope.binding && $scope.binding.length >0)
                  setChips();
          },true);
          $scope.$watch('items',function(){
              if(!$scope.schema && $scope.items  && $scope.items.length > 0 ){
                  $scope.docs=$scope.items;
              }

          },true);
          //==================================
					//
					//
					//==================================
					function init () {

                if($scope.schema)
								       $scope.loadList();

					}// init

          //==================================
					//
					//
					//==================================
					function setChips () {
								if($scope.binding){
                      if($scope.single){
                        if($scope.binding.length===2){
                          _.each($scope.docs,function(doc){
                                if(doc.code===$scope.binding.toUpperCase()){
                                    doc.selected=true;
                                  $scope.search=doc.title.en;
                                }

                          });
                        }else
                          _.each($scope.docs,function(doc){
                                if(doc._id===$scope.binding){
                                  doc.selected=true;
                                  if(doc.document.title && doc.document.title.en)
                                      $scope.search=doc.document.title.en;

                                }

                          });
                      }
                    else {
                      _.each($scope.docs,function(doc){
                        _.each($scope.binding,function(id){
                            if(doc._id===id)
                              doc.selected=true;
                        });
                      });
                    }
              }
              $scope.atCapacity=$scope.checkCapacity();
					}// init
          //=======================================================================
		      //
		      //=======================================================================
		      $scope.checkCapacity= function (capacity){
              if($scope.binding && $scope.single)
                    if($scope.binding)
                      return true;
                    else
                      return false;
               else if($scope.binding && !$scope.single){

                  if(!capacity)return false;
                  if($scope.binding && $scope.binding.length>= capacity)
                      return true;
                  else
                      return false;
            }//if
            return false;
		      };// archiveOrg


          //=======================================================================
          //
          //=======================================================================
          $scope.searchToggle= function (){
            var serEl =$element.find('.search');
            serEl.toggleClass('search-expanded');
            serEl.focus();
            var serElb =$element.find('.search-btn');
            serElb.toggleClass('search-btn-expanded');

            $scope.sOpen=!$scope.sOpen;
            $scope.search='';
          };// archiveOrg

		      //=======================================================================
		      //
		      //=======================================================================
		      $scope.loadList = function (){
            $http.get('https://api.cbd.int/api/v2015/inde-orgs?q={"document.meta.status":{"$nin":["archived","deleted","request","draft","rejected"]}}&f={"document":1}').then(function(res){
                  $scope.docs=res.data;
                   setChips();
            });
  //           .then(function(response){
  // //console.log(response.data);
  // $scope.docs=response.data;
  //              setChips();
	// 	         });
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
            if($scope.atCapacity  && !docObj.selected) return;

            $timeout(function(){

              docObj.selected=!docObj.selected;
              if($scope.single){
                if(docObj.selected){
                    $scope.binding=docObj._id;
                    if(docObj.code)$scope.binding=docObj.code;
                    if(docObj.document.title.en)
                      $scope.search=docObj.document.title.en;

                }

                else{
                    $scope.binding='';
                    $scope.search='';
                }


              }else {
                if(!_.isArray($scope.binding))$scope.binding=[];

                if(docObj.selected)
                  $scope.binding.push(docObj._id);
                else
                  _.remove($scope.binding,function(obj){return obj===docObj._id;});
              }

              $scope.atCapacity=$scope.checkCapacity();


            });


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
