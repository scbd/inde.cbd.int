define(['app', 'lodash',
  'css!./organizations',
  'scbd-branding/side-menu/scbd-side-menu',
  'scbd-branding/scbd-button',
  'scbd-branding/side-menu/scbd-menu-service',
  '../../directives/scbd-localizer',
    'scbd-branding/scbd-icon-button',
    'scbd-branding/scbd-tooltip',
    '../../services/mongo-storage'

], function(app, _) { //'scbd-services/utilities',

  // If you specify less than all of the keys, it will inherit from the
  // default shades

  app.controller("events", ['$scope', 'scbdMenuService', '$q', '$http','$filter','$route','mongoStorage','$location', //"$http", "$filter", "Thesaurus",
    function($scope, scbdMenuService, $q, $http,$filter,$route,mongoStorage,$location) { //, $http, $filter, Thesaurus



      $scope.loading=false;
      $scope.schema="inde-side-events";

      $scope.toggle = scbdMenuService.toggle;
      $scope.dashboard = scbdMenuService.dashboard;

      $scope.orgs;

      $scope.sortReverse=0;
      $scope.listView=0;//list,tiles,details
      $scope.showArchived=0;



      //=======================================================================
      //
      //=======================================================================
      function init(){

              $scope.loadList ();
      }//init
      //=======================================================================
      //
      //=======================================================================
      $scope.archiveList = function (){
        mongoStorage.loadArchives($scope.schema).then(function(response){
          $scope.orgs=response.data;
        });
      };// archiveOrg

      //=======================================================================
      //
      //=======================================================================
      $scope.loadList = function (docObj){
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
      $scope.toggleArchived = function (docObj){

        if(!$scope.showArchived)
            $scope.archiveList();
        else
            $scope.loadList();
        $scope.showArchived=!$scope.showArchived;

      };// archiveOrg

      //=======================================================================
      //
      //=======================================================================
      $scope.archiveDoc = function (docObj){
          mongoStorage.archiveDoc($scope.schema,docObj,docObj._id).then(function(){
                _.remove($scope.orgs,function(obj){return obj._id===docObj._id;});
          });

      };// archiveOrg

      //=======================================================================
      //
      //=======================================================================
      $scope.goTo = function (url){
        $location.url(url);
      }// archiveOrg
      //=======================================================================
      //
      //=======================================================================
      $scope.edit = function (id){
        $location.url('/manage/events/'+id);
      }// archiveOrg

init();


    }// link
  ]);//directive
});// require