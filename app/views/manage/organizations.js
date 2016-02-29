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

  app.controller("organizations", ['$scope', 'scbdMenuService', '$q', '$http','$filter','$route','mongoStorage','$location','$element', //"$http", "$filter", "Thesaurus",
    function($scope, scbdMenuService, $q, $http,$filter,$route,mongoStorage,$location,$element) { //, $http, $filter, Thesaurus



      $scope.loading=false;
      $scope.schema="inde-orgs";

      $scope.toggle = scbdMenuService.toggle;
      $scope.dashboard = scbdMenuService.dashboard;

      $scope.orgs;

      $scope.sortReverse=0;
      $scope.listView=0;//list,tiles,details
      $scope.showArchived=0;

      // $scope.options = {
      //     countries: function() {
      //         return $http.get("https://api.cbd.int/api/v2015/countries", {
      //             cache: true
      //         }).then(function(o) {
      //             return $filter("orderBy")(o.data, "name");
      //         });
      //     },
      //     organizationTypes: function() {
      //         return $http.get("https://api.cbd.int/api/v2013/thesaurus/domains/Organization%20Types/terms", {
      //             cache: true
      //         }).then(function(o) {
      //             return o.data;
      //         });
      //     }
      // };

      //=======================================================================
      //
      //=======================================================================
      function init(){

//               $q.when( $http.get('/api/v2015/inde-orgs?f={"document":1}'))
//              .then(function(response){
// console.log(response.data);
//                 $scope.orgs=response.data;
//
//               });
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
      $scope.searchToggle= function (){
        var serEl =$element.find('.search');
console.log(serEl );
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
           $scope.orgs=response.data;
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
      $scope.archiveOrg = function (docObj){
          mongoStorage.archiveDoc('inde-orgs',docObj,docObj._id).then(function(){
                _.remove($scope.orgs,function(obj){return obj._id===docObj._id;});
          });

      };// archiveOrg
      //=======================================================================
      //
      //=======================================================================
      $scope.unArchiveOrg = function (docObj){

        docObj.document.meta.status="draft";
          mongoStorage.unArchiveDoc('inde-orgs',docObj,docObj._id).then(function(){
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
        $location.url('/manage/organizations/'+id);
      }// archiveOrg
init();

      ///api/v2015/users?q={ "lastName" : "smith" }&f={ "email" : 1,"firstName" : 1,"lastName" : 1}
//&f={ "email" : 1,"firstName" : 1,"lastName" : 1}
//?q={ "lastName" : "smith" }&fo=1
//q={"_id":{"$oid":"56c52697c68ede024eef5da4"}&f={"document":1}

//q={"_id":{"$oid":"52000000cbd0316600000014"}&f={"treaties":1}

      //       $q.when( $http.get('/api/v2015/inde-orgs?q={"document.v": 3,"_id":{"$oid":"56c52697c68ede024eef5da4"}}&f={"document":1}'))
      //      .then(function(response){
      //         //  $scope.faqSearch = response.data;
      // ///console.log(response.data.length);
      //         });
      //=======================================================================
        //
        //=======================================================================
        // $http.get('https://api.cbd.int/api/v2015/countries', {
        //   cache: true,
        //   params: {
        //     f: {
        //       code: 1,
        //       name: 1
        //     }
        //   }
        // }).then(function(res) {
        //
        //   res.data.forEach(function(c) {
        //     c.code = c.code.toLowerCase();
        //     c.name = c.name[locale];
        //     c.cssClass='flag-icon-'+c.code;
        //   });
        //   $scope.countries = res.data;
        //   console.log($scope.countries);
        // });


      // $scope.$watch('organization',function(){console.log($scope.organizationForm.title.$error);},true);

    }
  ]);
});