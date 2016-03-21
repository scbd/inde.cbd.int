define(['app', 'lodash','jquery',
  'css!./index', '../services/mongo-storage',
        'services/filters'
], function(app,_,$) {

    app.controller("home", ['$scope', '$http','$filter','$route','mongoStorage','$location','$element','$timeout','$window','$anchorScroll','authentication', //"$http", "$filter", "Thesaurus",
      function($scope,  $http,$filter,$route,mongoStorage,$location,$element,$timeout,$window,$anchorScroll,auth) { //, $http, $filter, Thesaurus

          $scope.loading=false;
          $scope.schema="inde-orgs";
          $scope.createURL='/manage/events/0';
          $scope.editURL='/manage/events/';

          $scope.sortReverse=0;
          $scope.listView=1;
          $scope.showArchived=0;

          $scope.statusFacits={};
          $scope.statusFacitsArcView={};
          $scope.statusFacitsArcView.all=0;

          var statuses=['published','request','canceled','rejected'];
          var statusesArchived=['deleted','archived'];
          $scope.docs=[];
          auth.getUser().then(function(user){

             $scope.user = user;
 //              console.log($scope.user);
           }).then(function(){init();});

          //=======================================================================
          //
          //=======================================================================
          function init(){
                  $scope.confrences=[];

                  $http.get('https://api.cbd.int/api/v2015/confrences?s={"start":1}').then(function(conf){
                        $scope.confrences=conf.data;
                        _.each($scope.confrences,function(c){

                                $http.get('https://api.cbd.int/api/v2015/venues?q={"_id":{"$oid":"'+c._id+'"}}').then(function(v){
                                      c.venueObj=v.data[0];
                                });

                                $http.get('https://api.cbd.int/api/v2015/inde-side-events?q={"document.confrence":"'+c._id+'","document.meta.status":{"$nin":["archived","deleted","request","draft","rejected"]}}').then(function(res){
                                      c.events=res.data;

                                });
                        });


                  });
                  //$scope.loadList ();
                  mongoStorage.getStatusFacits($scope.schema,$scope.statusFacits,statuses);
                  //mongoStorage.getStatusFacits($scope.schema,$scope.statusFacitsArcView,statusesArchived);
          }//init
          $scope.newMeetingFilter = function (doc) {
                var timestamp = Math.round((new Date()).getTime() / 1000);
                if (doc.start > timestamp || $scope.hasRole(['IndeAdministrator','Administrator']))
                return doc;
          };
          $scope.statusFilter = function (doc) {
            if (doc.meta.status === $scope.selectedChip)
            return doc;
            else if($scope.selectedChip==='all' || $scope.selectedChip==='')
            return doc;

          };
          //=======================================================================
          //
          //=======================================================================
          $scope.searchToggle= function (i){

            var serEl =$element.find('#ind-search'+i);
            serEl.toggleClass('ind-search-expanded');
            serEl.focus();
            var serElb =$element.find('#search-btn'+i);

            serElb.toggleClass('search-btn-expanded');

            $scope.sOpen=!$scope.sOpen;

          };// archiveOrg

          //============================================================
          //
          //
          //============================================================
          $scope.hasRole = function (roles) {
              if(!$scope.user)return false;

            return _.intersection(roles, $scope.user.roles).length>0;


          };//hasRole
          $scope.customSearch = function (doc) {

            if(!$scope.search || $scope.search==' ' || $scope.search.length<=2) return true;
            var temp = JSON.stringify(doc);
           return (temp.toLowerCase().indexOf($scope.search.toLowerCase())>=0);

          };

          $scope.gotoAnchor = function(x) {
                $anchorScroll(x);
            };

            //=======================================================================
            //
            //=======================================================================
            $scope.goTo = function (id){
              $location.url('/manage/events/new?m='+id);
            }// archiveOrg

      }]);
});