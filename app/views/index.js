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

          // var statuses=['published','request','canceled','rejected'];
          // var statusesArchived=['deleted','archived'];
          $scope.docs=[];
          auth.getUser().then(function(user){

             $scope.user = user;
 //              console.log($scope.user);
           }).catch(function onerror(response) {

             $scope.onError(response);
           });
init();
          //=======================================================================
          //
          //=======================================================================
          function init(){
                  $scope.conferences=[];

                  $http.get('/api/v2016/conferences?s={"start":1}').then(function(conf){
                        $scope.conferences=conf.data;
                        _.each($scope.conferences,function(c){

                                $http.get('https://api.cbd.int/api/v2016/venues?q={"_id":{"$oid":"'+c._id+'"}}').then(function(v){
                                      c.venueObj=v.data[0];

                                });

                                // $http.get('https://api.cbd.int/api/v2016/inde-side-events?q={"document.confrence":"'+c._id+'","document.meta.status":{"$nin":["archived","deleted","request","draft","rejected"]}}').then(function(res){
                                //       c.events=res.data;
                                //
                                // });
                        });


                  }).catch(function onerror(response) {

                    $scope.onError(response);
                  });
                  //$scope.loadList ();
                  //mongoStorage.getStatusFacits($scope.schema,$scope.statusFacits,statuses);
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
            //============================================================
            //
            //============================================================
            $scope.hasError = function() {
              return !!$scope.error;
            };
            //============================================================
            //
            //============================================================
            $scope.onError = function(res) {

              $scope.status = "error";
              if (res.status === -1) {
                $scope.error = "The URI " + res.config.url + " could not be resolved.  This could be caused form a number of reasons.  The URI does not exist or is erroneous.  The server located at that URI is down.  Or lastly your internet connection stopped or stopped momentarily. ";
                if (res.data && res.data.message)
                  $scope.error += " Message Detail: " + res.data.message;
              }
              if (res.status == "notAuthorized") {
                $scope.error = "You are not authorized to perform this action: [Method:" + res.config.method + " URI:" + res.config.url + "]";
                if (res.data.message)
                  $scope.error += " Message Detail: " + res.data.message;
              } else if (res.status == 404) {
                $scope.error = "The server at URI: " + res.config.url + " has responded that the record was not found.";
                if (res.data.message)
                  $scope.error += " Message Detail: " + res.data.message;
              } else if (res.status == 500) {
                $scope.error = "The server at URI: " + res.config.url + " has responded with an internal server error message.";
                if (res.data.message)
                  $scope.error += " Message Detail: " + res.data.message;
              } else if (res.status == "badSchema") {
                $scope.error = "Record type is invalid meaning that the data being sent to the server is not in a  supported format.";
              } else if (res.data && res.data.Message)
                $scope.error = res.data.Message;
              else
                $scope.error = res.data;
            };
      }]);
});