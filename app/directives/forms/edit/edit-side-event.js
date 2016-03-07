define(['app', 'lodash',

  'text!./edit-side-event.html',
    'moment',
    'text!/app/directives/forms/edit/publish-dialog.html',
      'css!/app/libs/ng-dialog/css/ngDialog.css',
    'css!/app/libs/ng-dialog/css/ngDialog-theme-default.min.css',
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
    './edit-organization',
  'scbd-branding/scbd-media',


], function(app, _,template,moment,dialogTemplate) { //'scbd-services/utilities',


  app.directive("editSideEvent", ['scbdMenuService', '$q', '$http','$filter','$route','mongoStorage','$location','authentication','$window','ngDialog','$compile', //"$http", "$filter", "Thesaurus",
      function(scbdMenuService, $q, $http,$filter,$route,mongoStorage,$location,auth,$window,ngDialog,$compile) {
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
              var data ={}; //catch for profile data

              $scope.$watch('doc.confrence',function(){
                if($scope.doc.confrence){
                  //generateEventId($scope.doc.confrence);
                  generateDates();
                }
              });


            $http.get("https://api.cbd.int/api/v2015/countries", {
                cache: true
            }).then(function(o) {

                $scope.countries =  $filter("orderBy")(o.data, "name.en");
                _.each($scope.countries, function(c){
                    c.title=c.name;
                    //c._id=c.code;

                });
            });
            //============================================================
            //
            //============================================================
            $scope.publishRequestDial = function () {
              //dialogTemplate = $compile(dialogTemplate,$scope);
               if($scope.doc.meta.status!=='published')
                  ngDialog.open({ template: dialogTemplate, className: 'ngdialog-theme-default',plain: true ,scope:$scope,preCloseCallback:$scope.close});
                else
                  $scope.saveDoc();

            };
            //============================================================
            //
            //============================================================
            $scope.requestPublish = function () {
              //dialogTemplate = $compile(dialogTemplate,$scope);

              $scope.doc.meta.status='request';
              mongoStorage.save($scope.schema,$scope.doc,$scope._id).then(function(){
                _.each($scope.doc.hostOrgs,function(org){
                    mongoStorage.loadDoc('inde-orgs',org).then(function(conf){
                      console.log('conf',conf);
                      if(conf[1].meta.status!=='request')
                       mongoStorage.requestDoc('inde-orgs',{document:conf[1]},conf[0]);
                    });
                });
              });
            };

              init();

              //============================================================
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
                            initProfile();
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

              //=======================================================================
              //
              //=======================================================================
              $scope.toTitleCase =  function(str)
              {
                  return str.replace(/\w+/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
              };
              //============================================================
              //
              //============================================================
              function generateDates() {
                    mongoStorage.loadDoc('confrences',$scope.doc.confrence).then(function(confr){

                          var diff = Number(confr[1].end)-Number(confr[1].start);
                          var numDays = Math.ceil(diff/86400);
                          if(!$scope.options)$scope.options={};
                          if(!$scope.options.dates)$scope.options.dates=[];
                          for (var i = 0; i < numDays; i++) {
                              $scope.options.dates[i]=moment.unix(Number(confr[1].start)).format("YYYY/MMM/DD");
                              confr[1].start=confr[1].start+86400;
                          }


                    });


              }// init
              //============================================================
              //
              //============================================================
              function saveProfile() {

                  var tempMobile;
                  var isChange = 0;

                  if(data.Email !== $scope.doc.contact.email){


                    data.Email = _.clone($scope.doc.contact.email);
                    isChange='email';
                  }
                  if(data.Address !== $scope.doc.contact.address){
                    data.Address = _.clone($scope.doc.contact.address);
                    isChange='address';
                  }

                  if(data.City !== $scope.doc.contact.city){
                    data.City = _.clone($scope.doc.contact.city);
                    isChange='city';
                  }

                  if(data.Country !== $scope.doc.contact.country){
                    data.Country = _.clone($scope.doc.contact.country);
                    isChange='country';
                  }
                  if(data.Title !== $scope.doc.contact.personalTitle){
                    data.Title = _.clone($scope.doc.contact.personalTitle);
                    isChange='personaltitle';
                  }
                  if(data.State !== $scope.doc.contact.state){
                    data.State = _.clone($scope.doc.contact.state);
                    isChange='state';
                  }
                  if(data.Zip !== $scope.doc.contact.zip){
                    data.Zip = _.clone($scope.doc.contact.zip);
                    isChange='zip';
                  }
                  if(data.Phone !== $scope.doc.contact.phone){
                    data.Phone = _.clone($scope.doc.contact.phone);
                    isChange='phone';
                  }

                  if(data.FirstName !== $scope.doc.contact.firstName){
                    data.FirstName = _.clone($scope.doc.contact.firstName);
                    isChange='firestname';
                  }
                  if(data.LastName !== $scope.doc.contact.lastName){
                    data.LastName = _.clone($scope.doc.contact.lastName);
                    isChange='lastName';
                  }
                  if(data.Designation !== $scope.doc.contact.jobTitle){
                    data.Designation = _.clone($scope.doc.contact.jobTitle);
                    isChange='Designation';
                  }

                  data.UserID=$scope.user.userID;

                if($scope.doc.contact.mobile)
                  tempMobile = _.clone($scope.doc.contact.mobile);
                delete($scope.doc.contact);
                $scope.doc.contact={};
                $scope.doc.contact.mobile=tempMobile;


                if(isChange)
                $http.put('https://api.cbd.int/api/v2013/users/' + $scope.user.userID, angular.toJson(data)).success(function () {

                    //$location.path('/profile/done');

                }).error(function (data) {
                    $scope.waiting = false;
                    $scope.error = data;
                });

              }// initProfile()

              //============================================================
              //
              //============================================================
              function initProfile() {
                  auth.getUser().then(function(user){
                    $scope.user=user;
                    return $http.get('https://api.cbd.int/api/v2013/users/' + $scope.user.userID).then(function onsuccess (response) {
                        data=response.data;
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
              ///app/images/ic_event_black_48px.svg
              //============================================================
              function randomPic() {
                    var num = Math.floor((Math.random() * 12) + 1);
                    return 'https://s3.amazonaws.com/mongo.document.attachments/inde-config/56c4863bc0e5501192caa152/Avatar'+num+'.svg';

              }// initProfile()

              $scope.randomPic = function (){
                $scope.doc.logo=randomPic();
              }

              //============================================================
              //
              //============================================================
              $scope.toggleIcon= function() {
                  if($scope.doc.logo==='/app/images/ic_event_black_48px.svg')
                      $scope.doc.logo=randomPic();
                  else
                      $scope.doc.logo='/app/images/ic_event_black_48px.svg';
              }// initProfile()

              //============================================================
              //
              //============================================================
              function generateEventId(confId) {

                return mongoStorage.generateEventId(confId).then(function(res){

                    console.log(res);
                      return res;
                });
              }// generateEventId



              //============================================================
              //
              //============================================================
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

                  if(!$scope.doc.confrence) throw "Error no confrence selected";
                  generateEventId($scope.doc.confrence).then(
                    function(res){
                      if(Number(res.data.count)===0 )
                        $scope.doc.id= 1000;
                      else if (Number(res.data.count)<1000)
                        $scope.doc.id=Number(res.data.count)+1000;
                      else
                        $scope.doc.id=Number(res.data.count)+2;

                      mongoStorage.save($scope.schema,$scope.doc,$scope._id).then(function(){
                        saveProfile();
                      });
                  });
              };
              //=======================================================================
              //
              //=======================================================================
            //  function toTimestamp(dateString){
            //     var newDate = dateString.split("-");
            //     return new Date(newDate[0],newDate[1],newDate[2]).getTime();
            //   }

              //=======================================================================
              //
              //=======================================================================
              $scope.goTo = function(url){

                  $location.url(url);
              };

              //=======================================================================
              //
              //=======================================================================
              $scope.close = function(){

                  $window.history.back();
              };
        }//link
      };//return
  }]);
});