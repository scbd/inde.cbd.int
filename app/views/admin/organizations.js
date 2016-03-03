define(['app', 'lodash',
  'css!./organizations',
  'scbd-branding/side-menu/scbd-side-menu',
  'scbd-branding/scbd-button',
  './menu',
  'scbd-branding/scbd-icon-button',
  '../../services/mongo-storage',
  '../../directives/scbd-tip'
], function(app, _) {

  app.controller("organizations", ['$scope', 'adminMenu', '$q', '$http','$filter','$route','mongoStorage','$location','$element', //"$http", "$filter", "Thesaurus",
    function($scope, adminMenu, $q, $http,$filter,$route,mongoStorage,$location,$element) { //, $http, $filter, Thesaurus


      $scope.loading=false;
      $scope.schema="inde-orgs";
      $scope.createURL='/manage/organizations/0';
      $scope.editURL='/manage/organizations/';

      $scope.toggle = adminMenu.toggle;
      $scope.sections = adminMenu.getMenu('admin');

      $scope.sortReverse=0;
      $scope.listView=0;
      $scope.showArchived=0;

      $scope.docs=[];


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
          $scope.docs=response.data;
        });
      };// archiveOrg

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
                _.remove($scope.docs,function(obj){return obj._id===docObj._id;});
          });

      };// archiveOrg

      //=======================================================================
      //
      //=======================================================================
      $scope.deleteDoc = function (docObj){
          mongoStorage.deleteDoc($scope.schema,docObj,docObj._id).then(function(){
                _.remove($scope.docs,function(obj){return obj._id===docObj._id;});
          });

      };// archiveOrg

      //=======================================================================
      //
      //=======================================================================
      $scope.unArchiveDoc = function (docObj){
          mongoStorage.unArchiveDoc($scope.schema,docObj,docObj._id).then(function(){
                _.remove($scope.docs,function(obj){return obj._id===docObj._id;});
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
        $location.url($scope.editURL+id);
      }// archiveOrg
      init();

    }
  ]);
});