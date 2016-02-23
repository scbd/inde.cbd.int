define(['app', 'lodash',
  'css!./organizations',
  'scbd-branding/side-menu/scbd-side-menu',
  'scbd-branding/side-menu/scbd-menu-service',
  'scbd-angularjs-controls/km-inputtext-ml',
  'scbd-angularjs-controls/km-control-group',

  'scbd-angularjs-controls/km-select',
    'scbd-angularjs-controls/km-form-languages',
    'scbd-angularjs-controls/km-inputtext-list',
    'scbd-angularjs-services/locale',

], function(app, _) { //'scbd-services/utilities',

  // If you specify less than all of the keys, it will inherit from the
  // default shades

  app.controller("organizations", ['$scope', 'scbdMenuService', '$q', '$http','locale','$filter', //"$http", "$filter", "Thesaurus",
    function($scope, scbdMenuService, $q, $http,locale,$filter) { //, $http, $filter, Thesaurus

      $scope.locales = [locale];
      $scope.toggle = scbdMenuService.toggle;
      $scope.dashboard = scbdMenuService.dashboard;
      console.log('scbdMenuService', locale);

      $scope.options = {
          countries: function() {
              return $http.get("https://api.cbd.int/api/v2015/countries", {
                  cache: true
              }).then(function(o) {
                console.log('000000',o);
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

            $q.when( $http.get('/api/v2015/inde-orgs'))
           .then(function(response){
                $scope.faqSearch = response.data;
      console.log(response.data);
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