define(['app', 'lodash',

  'text!./edit-organization.html',
    'css!./edit-organization',
  'scbd-branding/side-menu/scbd-side-menu',
  'scbd-branding/scbd-button',
  'scbd-branding/side-menu/scbd-menu-service',
  'scbd-angularjs-controls/km-inputtext-ml',
  'scbd-angularjs-controls/km-control-group',

    'scbd-branding/scbd-icon-button',
    'scbd-branding/scbd-tooltip',
    'scbd-angularjs-controls/km-select',
    'scbd-angularjs-controls/km-form-languages',
    'scbd-angularjs-controls/km-inputtext-list',

    '../../../services/mongo-storage',
    '../controls/scbd-file-upload'

], function(app, _,template) { //'scbd-services/utilities',


  app.directive("editOrganization", ['scbdMenuService', '$q', '$http','$filter','$route','mongoStorage','$location','$window', //"$http", "$filter", "Thesaurus",
      function(scbdMenuService, $q, $http,$filter,$route,mongoStorage,$location,$window) {
      return {
        restrict   : 'E',
        template   : template,
        replace    : true,
        transclude : false,
        scope      : {hide:"=", selectedOrgs:"="},
        link : function($scope,$element,$attrs) {//, $http, $filter, Thesaurus


              $scope.loading=false;
              $scope.schema="inde-orgs";
              $scope.shortForm =($attrs.short !== undefined && $attrs.short !== null);
              if(!$scope.shortForm)
                $scope._id = $route.current.params.id;
              $scope.toggle = scbdMenuService.toggle;
              $scope.dashboard = scbdMenuService.dashboard;
              $scope.doc={};



              if(!$scope._id || $scope._id==='0'){
                mongoStorage.createDoc('inde-orgs').then(
                        function(document){
                          $scope.loading=true;
                          $scope._id=document[0];
                          $scope.doc=document[1];
                          $scope.doc.logo='/app/images/ic_business_black_48px.svg';
                        }
                );

                }
              else{
                if($scope._id.search('^[0-9A-Fa-f]{24}$')<0)
                  $location.url('/404');
                else
                  mongoStorage.loadDoc('inde-orgs',$scope._id).then(function(document){

                        $scope.loading=true;
                        $scope._id=document[0];
                        $scope.doc=document[1];
                        if(!$scope.doc.logo)
                          $scope.doc.logo='/app/images/ic_business_black_48px.svg';
                  });
              }



                $scope.dropzoneConfig = {
                  'options': { // passed into the Dropzone constructor
                    'url': '/api/v2015/temporary-files',
                    'method':'post'
                  },
                  'eventHandlers': {
                    'sending': function (file, xhr, formData) {
                      console.log('sending');
                    },
                    'success': function (file, response) {
                      console.log('response form sending');
                    }
                  }
                };

              $scope.options = {
                  countries: function() {
                      return $http.get("https://api.cbd.int/api/v2015/countries", {
                          cache: true
                      }).then(function(o) {
                          return $filter("orderBy")(o.data, "name");
                      });
                  },
                  organizationTypes: function() {
                      return $http.get("https://api.cbd.int/api/v2013/thesaurus/domains/Organization%20Types/terms", {
                          cache: true
                      }).then(function(o) {
                          return o.data;
                      });
                  }
              };

              //=======================================================================
              //
              //=======================================================================
              $scope.saveDoc = function(){

                  mongoStorage.save('inde-orgs',$scope.doc,$scope._id).then(function(res){

                        if(!($scope.hide  !== undefined && $scope.hide !== null)){
                                $scope._id=res.data._id;
                                $window.history.back();
                        } else{
                          $scope.hide=0;

                          if(!$scope.selectedOrgs)$scope.selectedOrgs=[];
                          $scope.selectedOrgs.push({'identifier':res.data._id});
                        }
                  });
              };
              //============================================================
              //
              //============================================================
              $scope.toggleIcon= function() {
                      $scope.doc.logo='/app/images/ic_business_black_48px.svg';
              }// initProfile()
                //=======================================================================
                //
                //=======================================================================
                $scope.close = function(){

                    $window.history.back();
                };

              //=======================================================================
              //
              //=======================================================================
              $scope.goTo = function(url){

                  $location.url(url);
              };
        }//link
      };//return
  }]);
});