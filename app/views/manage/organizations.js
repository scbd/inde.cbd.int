define(['app', 'lodash',
  'css!./organizations',
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

    '../../services/mongo-storage'

], function(app, _) { //'scbd-services/utilities',

  // If you specify less than all of the keys, it will inherit from the
  // default shades

  app.controller("organizations", ['$scope', 'scbdMenuService', '$q', '$http','$filter','$route','mongoStorage','$location', //"$http", "$filter", "Thesaurus",
    function($scope, scbdMenuService, $q, $http,$filter,$route,mongoStorage,$location) { //, $http, $filter, Thesaurus


      $scope._id = $route.current.params.id || false;
      $scope.loading=false;

      $scope.toggle = scbdMenuService.toggle;
      $scope.dashboard = scbdMenuService.dashboard;

      if($scope._id ){
          if($scope._id.search('^[0-9A-Fa-f]{24}$')<0)
            $location.url('/404');
          else
            mongoStorage.loadDoc('inde-orgs',$scope._id).then(function(document){
                  $scope.loading=true;
                  $scope._id=document[0];
                  $scope.doc=document[1];
                  console.log('$scope._id',$scope._id);
                  console.log('$scope.doc',$scope.doc);
            });
        }
      else
        $scope.doc=mongoStorage.createDoc();


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

        //delete($scope.doc.meta);

          mongoStorage.save('inde-orgs',$scope.doc,$scope._id).then(function(data){
                if(!$scope._id){ $scope._id=data.id;
                        $location.path($location.path()+'/'+$scope._id,false);
                }
          });
      };



      ///api/v2015/users?q={ "lastName" : "smith" }&f={ "email" : 1,"firstName" : 1,"lastName" : 1}
//&f={ "email" : 1,"firstName" : 1,"lastName" : 1}
//?q={ "lastName" : "smith" }&fo=1
//q={"_id":{"$oid":"56c52697c68ede024eef5da4"}&f={"document":1}

//q={"_id":{"$oid":"52000000cbd0316600000014"}&f={"treaties":1}

            $q.when( $http.get('/api/v2015/inde-orgs?q={"document.v": 3,"_id":{"$oid":"56c52697c68ede024eef5da4"}}&f={"document":1}'))
           .then(function(response){
              //  $scope.faqSearch = response.data;
      ///console.log(response.data.length);
              });
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

      $scope.organization = {};
      $scope.organization.facebook = "ddd";
      $scope.organization.title = "ddd";
      // $scope.$watch('organization',function(){console.log($scope.organizationForm.title.$error);},true);

    }
  ]);
});