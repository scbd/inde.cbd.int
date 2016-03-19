define(['app', 'lodash',

  './menu',
  'directives/scbd-icon-button',
  '../../services/mongo-storage',
      '../../services/filters'
], function(app, _) {

  app.controller("events", ['$scope', 'dashMenu', '$q', '$http','$filter','$route','mongoStorage','$location','$element','$timeout','$window','authentication','history',//"$http", "$filter", "Thesaurus",
    function($scope, dashMenu, $q, $http,$filter,$route,mongoStorage,$location,$element,$timeout,$window,authentication,history) { //, $http, $filter, Thesaurus

      authentication.getUser().then(function (user) {
        $scope.isAuthenticated=user.isAuthenticated;
      }).then(function(){
        if(!$scope.isAuthenticated)
            $window.location.href='https://accounts.cbd.int/signin?returnUrl=';
      });

      $scope.loading=false;
      $scope.schema="inde-side-events";
      $scope.createURL='/manage/events/0';
      $scope.editURL='/manage/events/';

      $scope.toggle = dashMenu.toggle;
      // $scope.sections = dashMenu.getMenu('dashboard');
      $scope.sectionsOptions = dashMenu.getMenu('options');

      var sec = _.findWhere($scope.sectionsOptions, {name:'Sort'});
      sec.path=sortOrder;
      sec = _.findWhere($scope.sectionsOptions, {name:'Archives'});
      sec.path=toggleArchived;
      sec = _.findWhere($scope.sectionsOptions[5].pages, {name:'All'});
      sec.path=selectChipAll;
      sec = _.findWhere($scope.sectionsOptions[5].pages, {name:'Drafts'});
      sec.path=selectChipDraft;
      sec = _.findWhere($scope.sectionsOptions[5].pages, {name:'Requests'});
      sec.path=selectChipRequest;
      sec = _.findWhere($scope.sectionsOptions[5].pages, {name:'Approved'});
      sec.path=selectChipApproved;
      sec = _.findWhere($scope.sectionsOptions[5].pages, {name:'Canceled'});
      sec.path=selectChipCanceled;
      sec = _.findWhere($scope.sectionsOptions[6].pages, {name:'Card View'});
      sec.path=cardView;
      sec = _.findWhere($scope.sectionsOptions[6].pages, {name:'List View'});
      sec.path=listView;
      // sec = _.findWhere($scope.sectionsOptions[5].pages, {name:'Detail View'});
      // sec.path=detailView;


      // if(dashMenu.history.length===1)
      //   $timeout(function(){
      //         dashMenu.toggle('dashboard');
      //       $timeout(function(){
      //         dashMenu.toggle('dashboard');
      //       },500);
      //   },500);
      $scope.sortReverse=0;
      $scope.listView=0;
      $scope.showArchived=0;
      $scope.statusFacits={};
      $scope.statusFacits.all=0;
      $scope.statusFacitsArcView={};
      $scope.statusFacitsArcView.all=0;
      $scope.selectedChip;

      $scope.docs=[];
      var statuses=['draft','published','request','canceled','rejected'];
      var statusesArchived=['deleted','archived'];

      //=======================================================================
      //
      //=======================================================================
      function init(){
        registerToolTip();

              $scope.loadList ();
              mongoStorage.getOwnerFacits($scope.schema,$scope.statusFacits,statuses);
              mongoStorage.getOwnerFacits($scope.schema,$scope.statusFacitsArcView,statusesArchived);
      }//init
      $scope.statusFilter = function  (doc) {
        if (doc.document.meta.status === $scope.selectedChip)
        return doc;
        else if($scope.selectedChip==='all' || $scope.selectedChip==='')
        return doc;

      };


      function registerToolTip(){
        $timeout(function(){
          $(document).ready(function(){
          $('[data-toggle="tooltip"]').tooltip();
          });

          $('[data-toggle="tooltip"]').on('shown.bs.tooltip', function () {
              var that = $(this);

              var element = that[0];
              if(element.myShowTooltipEventNum == null){
                  element.myShowTooltipEventNum = 0;
              }else{
                  element.myShowTooltipEventNum++;
              }
              var eventNum = element.myShowTooltipEventNum;

              setTimeout(function(){
                  if(element.myShowTooltipEventNum == eventNum){
                      that.tooltip('hide');
                  }
                  // else skip timeout event
              }, 1000);
          });
        },2000);
      }

      function  sortOrder () {
        console.log('here');
        $scope.sortReverse=!$scope.sortReverse;

        $scope.toggle('options');
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
        mongoStorage.approveDoc($scope.schema,docObj,docObj._id).then(function(){
            _.each(docObj.document.hostOrgs,function(org,key){
                mongoStorage.loadDoc('inde-orgs',org).then(function(conf){
                  if(conf[1].meta.status!=='published')
                   mongoStorage.approveDoc('inde-orgs',{document:conf[1]},conf[0]);
                });
            });
          mongoStorage.getOwnerFacits($scope.schema,$scope.statusFacits,statuses);
          mongoStorage.getOwnerFacits($scope.schema,$scope.statusFacitsArcView,statusesArchived);
          //$scope.loadList ();
        });
      };// archiveOrg
      //=======================================================================
      //
      //=======================================================================
      $scope.cancelDoc = function (docObj){
        mongoStorage.cancelDoc($scope.schema,docObj,docObj._id).then(function(){
          mongoStorage.getOwnerFacits($scope.schema,$scope.statusFacits,statuses);
          mongoStorage.getOwnerFacits($scope.schema,$scope.statusFacitsArcView,statusesArchived);
          //$scope.loadList ();
        });
      };// archiveOrg
      //=======================================================================
      //
      //=======================================================================
      $scope.rejectDoc = function (docObj){
        mongoStorage.rejectDoc($scope.schema,docObj,docObj._id).then(function(){
          mongoStorage.getOwnerFacits($scope.schema,$scope.statusFacits,statuses);
          mongoStorage.getOwnerFacits($scope.schema,$scope.statusFacitsArcView,statusesArchived);
          //$scope.loadList ();
        });
      };// archiveOrg
      //=======================================================================
      //
      //=======================================================================
      $scope.toTitleCase =  function(str)
      {
          return str.replace(/\w+/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
      };
      //=======================================================================
      //
      //=======================================================================
      function archiveList (){
        mongoStorage.loadArchives($scope.schema).then(function(response){
          $scope.docs=response.data;

        });
      };// archiveOrg

      //=======================================================================
      //
      //=======================================================================
      function selectChip (chip){
        $element.find('.chip').removeClass('chip-active');
        $element.find('#chip-'+chip).addClass('chip-active');

        if(chip==='all')
          $scope.selectedChip='';
        else
          $scope.selectedChip=chip;
      };// archiveOrg
      $scope.selectChip = selectChip;




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
      $scope.loadList = function (docObj){
        mongoStorage.loadOwnerDocs($scope.schema,['draft','published','request','canceled','rejected']).then(function(response){
           $scope.docs=response.data;

           _.each($scope.docs,function(doc){

                   mongoStorage.loadDoc('confrences',doc.document.confrence).then(function(conf){
                      doc.document.confrenceObj=conf[1];
                   });
                   doc.document.orgs=[];
                   _.each(doc.document.hostOrgs,function(org,key){
                       mongoStorage.loadDoc('inde-orgs',org).then(function(conf){
                          doc.document.orgs.push(conf[1]);
                       });
                   });

                  $http.get('https://api.cbd.int/api/v2013/users/' + doc.document.meta.createdBy).then(function onsuccess (response) {
                        doc.document.contact=response.data;
                  });
           });
         });
      };// archiveOrg

      //=======================================================================
      //
      //=======================================================================
      function toggleListView  (docObj){
        $timeout(function(){
          if($scope.listView===0)
              $scope.listView=1;
          // else if($scope.listView===1)
          //     $scope.listView=2;
          else
            $scope.listView=0;
        });
        registerToolTip();
      };//toggleListView
      $scope.toggleListView = toggleListView ;

      //=======================================================================
      //
      //=======================================================================
      function listView  (docObj){
            $scope.listView=0;
            $scope.toggle('options');
            registerToolTip();
      };//toggleListView
      //=======================================================================
      //
      //=======================================================================
      function cardView  (docObj){
            $scope.listView=1;
            $scope.toggle('options');
            registerToolTip();
      };//toggleListView
      //=======================================================================
      //
      //=======================================================================
      function detailView  (docObj){
            $scope.listView=2;
            $scope.toggle('options');
            registerToolTip();
      };//toggleListView

      //=======================================================================
      //
      //=======================================================================
      $scope.archiveDoc = function (docObj){
          mongoStorage.archiveDoc($scope.schema,docObj,docObj._id).then(function(){
                _.remove($scope.docs,function(obj){return obj._id===docObj._id;});
                mongoStorage.getOwnerFacits($scope.schema,$scope.statusFacits,statuses);
                mongoStorage.getOwnerFacits($scope.schema,$scope.statusFacitsArcView,statusesArchived);
          });

      };// archiveOrg

      //=======================================================================
      //
      //=======================================================================
      $scope.deleteDoc = function (docObj){
          mongoStorage.deleteDoc($scope.schema,docObj,docObj._id).then(function(){
                _.remove($scope.docs,function(obj){return obj._id===docObj._id;});
                mongoStorage.getOwnerFacits($scope.schema,$scope.statusFacits,statuses);
                mongoStorage.getOwnerFacits($scope.schema,$scope.statusFacitsArcView,statusesArchived);
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
      //=======================================================================
      //
      //=======================================================================
      function selectChipAll (){
        selectChip('all');
        $scope.toggle('options');
      };// archiveOrg

      //=======================================================================
      //
      //=======================================================================
      function selectChipDraft (){
        selectChip('draft');
        $scope.toggle('options');
      };// archiveOrg

      //=======================================================================
      //
      //=======================================================================
      function selectChipRequest (){
        selectChip('request');
        $scope.toggle('options');
      };// archiveOrg

      //=======================================================================
      //
      //=======================================================================
      function selectChipApproved (){
        selectChip('published');
        $scope.toggle('options');
      };// archiveOrg

      //=======================================================================
      //
      //=======================================================================
      function selectChipCanceled (){
        selectChip('canceled');
        $scope.toggle('options');
      };// archiveOrg

      //=======================================================================
      //
      //=======================================================================
      function toggleArchived  (docObj){
        $timeout(function(){
          if(!$scope.showArchived){
            mongoStorage.getOwnerFacits($scope.schema,$scope.statusFacitsArcView,statusesArchived);
            archiveList();
          }

          else{
            mongoStorage.getOwnerFacits($scope.schema,$scope.statusFacits,statuses);
            $scope.loadList();
          }

          $scope.showArchived=!$scope.showArchived;


          $scope.toggle('options');
          selectChip('archived');
          registerToolTip();
        });
        $timeout(function(){

          if($scope.selectedChip==='archived')
              $scope.selectedChip='all';
          else
            $scope.selectedChip='archived';

        },500);
      }// archiveOrg
      //=======================================================================
      //
      //=======================================================================
      $scope.close = function(){

        history.goBack();
      };
      //=======================================================================
      //
      //=======================================================================
      $scope.prev = history.getPrevPath();
      
      init();
      $scope.selectChip('all');
    }
  ]);
});