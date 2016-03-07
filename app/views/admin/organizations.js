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
      $scope.statusFacits={};
      $scope.statusFacits.all=0
      $scope.statusFacitsArcView={};
      $scope.statusFacitsArcView.all=0;
      $scope.selectedChip;
      var statuses=['published','request','canceled','rejected'];
      var statusesArchived=['deleted','archived'];
      $scope.docs=[];


      //=======================================================================
      //
      //=======================================================================
      function init(){

              $scope.loadList ();
              mongoStorage.getStatusFacits($scope.schema,$scope.statusFacits,statuses);
              mongoStorage.getStatusFacits($scope.schema,$scope.statusFacitsArcView,statusesArchived);
      }//init

      $scope.statusFilter = function (doc) {
        if (doc.document.meta.status === $scope.selectedChip)
        return doc;
        else if($scope.selectedChip==='all' || $scope.selectedChip==='')
        return doc;

      };

      $scope.customSearch = function (doc) {

        if(!$scope.search || $scope.search==' ' || $scope.search.length<=2) return true;
        var temp = JSON.stringify(doc);
       return (temp.toLowerCase().indexOf($scope.search.toLowerCase())>=0);

      };

      //=======================================================================
      //
      //=======================================================================
      $scope.approveDoc = function (docObj){
        console.log('sssss');
        mongoStorage.approveDoc($scope.schema,docObj,docObj._id).then(function(){
          mongoStorage.getStatusFacits($scope.schema,$scope.statusFacits,statuses);
          mongoStorage.getStatusFacits($scope.schema,$scope.statusFacitsArcView,statusesArchived);
          //$scope.loadList ();
        });
      };// archiveOrg
      //=======================================================================
      //
      //=======================================================================
      $scope.cancelDoc = function (docObj){
        mongoStorage.cancelDoc($scope.schema,docObj,docObj._id).then(function(){
          mongoStorage.getStatusFacits($scope.schema,$scope.statusFacits,statuses);
          mongoStorage.getStatusFacits($scope.schema,$scope.statusFacitsArcView,statusesArchived);
          //$scope.loadList ();
        });
      };// archiveOrg
      //=======================================================================
      //
      //=======================================================================
      $scope.rejectDoc = function (docObj){
        mongoStorage.rejectDoc($scope.schema,docObj,docObj._id).then(function(){
          mongoStorage.getStatusFacits($scope.schema,$scope.statusFacits,statuses);
          mongoStorage.getStatusFacits($scope.schema,$scope.statusFacitsArcView,statusesArchived);
          //$scope.loadList ();
        });
      };// archiveOrg
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
      $scope.selectChip= function (chip){
        $element.find('.chip').removeClass('chip-active');
        $element.find('#chip-'+chip).addClass('chip-active');
        if(chip==='all')
          $scope.selectedChip='';
        else
          $scope.selectedChip=chip;
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
        mongoStorage.loadDocs($scope.schema,['published','request','canceled','rejected']).then(function(response){
           $scope.docs=response.data;
           _.each($scope.docs,function(doc){
                  $http.get('https://api.cbd.int/api/v2013/users/' + doc.document.meta.createdBy).then(function onsuccess (response) {
                        doc.document.contact=response.data;
                  });
           });
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
      $scope.selectChip('all');
    }
  ]);
});