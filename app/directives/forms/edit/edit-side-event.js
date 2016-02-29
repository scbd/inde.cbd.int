define(['app', 'lodash',

  'text!./edit-side-event.html',
    'css!./edit-side-event',
  'scbd-branding/side-menu/scbd-side-menu',
  'scbd-branding/scbd-button',
  'scbd-branding/side-menu/scbd-menu-service',
  'scbd-angularjs-controls/km-inputtext-ml',
  'scbd-angularjs-controls/km-control-group',
  'scbd-angularjs-controls/km-date',
  'scbd-angularjs-controls/km-rich-textbox',

      'scbd-branding/scbd-icon-button',
    'scbd-branding/scbd-tooltip',
    'scbd-angularjs-controls/km-select',
    // 'scbd-angularjs-controls/km-form-languages',
    'scbd-angularjs-controls/km-inputtext-list',
'../controls/scbd-select-list',
    '../../../services/mongo-storage',
    '../controls/scbd-file-upload',
    './edit-organization'

], function(app, _,template) { //'scbd-services/utilities',


  app.directive("editSideEvent", ['scbdMenuService', '$q', '$http','$filter','$route','mongoStorage','$location','authentication', //"$http", "$filter", "Thesaurus",
      function(scbdMenuService, $q, $http,$filter,$route,mongoStorage,$location,auth) {
      return {
        restrict   : 'E',
        template   : template,
        replace    : true,
        transclude : false,
        scope      : {},
        link : function($scope) {//, $http, $filter, Thesaurus

              $scope._id = $route.current.params.id;
              $scope.loading=false;
              $scope.schema="inde-side-events";
              $scope.showOrgForm = 0;

              $scope.toggle = scbdMenuService.toggle;
              $scope.dashboard = scbdMenuService.dashboard;
              $scope.doc={};
              $scope.doc.hostOrgs=[];
              $scope.updateProfile=1;
              
              init();

              //============================================================
              //
              //
              //============================================================
              function init() {

                if($scope._id!=='0' ){
                    if($scope._id.search('^[0-9A-Fa-f]{24}$')<0)
                      $location.url('/404');
                    else
                      mongoStorage.loadDoc($scope.schema,$scope._id).then(function(document){

                            $scope.loading=true;
                            $scope._id=document[0];
                            $scope.doc=document[1];
                      });
                  }
                else{
                    mongoStorage.createDoc($scope.schema).then(
                            function(document){
                              $scope.loading=true;
                              $scope._id=document[0];
                              $scope.doc=document[1];
                              $scope.doc.logo=randomPic();
                              initProfile();
                            }
                    );
                }

              }// init
              //============================================================
              //
              //
              //============================================================
              function initProfile() {

auth.getUser().then(function(user){

  $scope.user=user;
  return $http.get('/api/v2013/users/' + $scope.user.userID).then(function onsuccess (response) {
      console.log('response.data',response.data);
      if(!$scope.doc)$scope.doc={};
      if(!$scope.doc.contact)$scope.doc.contact={};


       $scope.doc.contact.email = _.clone(response.data.Email);
       $scope.doc.contact.address= _.clone(response.data.Address);
       $scope.doc.contact.city= _.clone(response.data.City);
       $scope.doc.contact.country= _.clone(response.data.Country);
       $scope.doc.contact.personalTitle= _.clone(response.data.Title);
       $scope.doc.contact.state= _.clone(response.data.State);
       $scope.doc.contact.zip= _.clone(response.data.Zip);
       $scope.doc.contact.phone= _.clone(response.data.Phone);
       $scope.doc.contact.firstName= _.clone(response.data.FirstName);
       $scope.doc.contact.lastName= _.clone(response.data.LastName);
       $scope.doc.contact.jobTitle= _.clone(response.data.Designation);

  }).catch(function onerror (response) {

      $scope.error = response.data;
  });


});


              }// initProfile()

              //============================================================
              //
              //
              //============================================================
              function randomPic() {
                    var num = Math.floor((Math.random() * 12) + 1);
                    return 'https://s3.amazonaws.com/mongo.document.attachments/inde-config/56c4863bc0e5501192caa152/Avatar'+num+'.svg';

              }// initProfile()


              //============================================================
              //
              //
              //============================================================
              $scope.saveProfile = function() {

                  $scope.waiting = true;

                  $http.put('/api/v2013/users/' + $scope.user.userID, angular.toJson($scope.document)).success(function () {

                      $location.path('/profile/done');

                  }).error(function (data) {
                      $scope.waiting = false;
                      $scope.error = data;
                  });
              };

              $scope.options = {
                  hostOrgs: function() {
                      return mongoStorage.loadDocs('inde-orgs')
                      .then(function(o) {
                            _.each(o.data,function(docObj,key){
                                  if(docObj.document && docObj.document.title && docObj.document.title.en)
                                  docObj.title=docObj.document.title;
                                  else {
                                    delete o.data[key];
                                  }
                            })
                          return $filter("orderBy")(o.data, "title");
                      });
                  },

              };

              //=======================================================================
              //
              //=======================================================================
              $scope.orgCallback= function(newOrgId){
                    $scope.showOrgForm=0;

              };

              //=======================================================================
              //
              //=======================================================================
              $scope.toggleOrg= function(event){
                    $scope.showOrgForm=!$scope.showOrgForm;
                    event.stopPropagation();
              };

              //=======================================================================
              //
              //=======================================================================
              $scope.saveDoc = function(){

                //delete($scope.doc.meta);
                  console.log('saving',$scope.doc);
                  if($scope.doc.prefDate)
                    _.each($scope.doc.prefDate,function(pref,key){
                        if(pref)
                          $scope.doc.prefDate[key] = Number(toTimestamp(pref));
                  });



                  mongoStorage.save($scope.schema,$scope.doc,$scope._id).then(function(data){


                  });
              };
              //=======================================================================
              //
              //=======================================================================
             function toTimestamp(dateString){
                var newDate = dateString.split("-");
                return new Date(newDate[0],newDate[1],newDate[2]).getTime();
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