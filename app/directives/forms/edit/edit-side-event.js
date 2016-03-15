define(['app', 'lodash',

  'text!./edit-side-event.html',
    'moment',
    'text!directives/forms/edit/publish-dialog.html',
      'css!libs/ng-dialog/css/ngDialog.css',
    'css!libs/ng-dialog/css/ngDialog-theme-default.min.css',
        // 'css!./edit-side-event',
  '../../side-menu/scbd-side-menu',

  'scbd-angularjs-controls/km-inputtext-ml',
  'scbd-angularjs-controls/km-control-group',
  'scbd-angularjs-controls/km-date',

    'scbd-angularjs-controls/km-inputtext-list',
'../controls/scbd-select-list',
    '../../../services/mongo-storage',
    '../controls/scbd-file-upload',
    './edit-organization'



], function(app, _,template,moment,dialogTemplate) { //'scbd-services/utilities',


  app.directive("editSideEvent", ['scbdMenuService', '$q', '$http','$filter','$route','mongoStorage','$location','authentication','$window','ngDialog','$compile','$timeout', //"$http", "$filter", "Thesaurus",
      function(scbdMenuService, $q, $http,$filter,$route,mongoStorage,$location,auth,$window,ngDialog,$compile,$timeout) {
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
              $scope.isNew=true;
              // $scope.toggle = scbdMenuService.toggle;
              // $scope.dashboard = scbdMenuService.dashboard;
              $scope.doc={};
              $scope.doc.hostOrgs=[];
              $scope.updateProfile='No';

              var data ={}; //catch for profile data

              $scope.$watch('doc.confrence',function(){
                if($scope.doc.confrence){
                  //generateEventId($scope.doc.confrence);
                  generateDates();
                }
              });
              $scope.$watch('doc.hostOrgs',function(){
                if($scope.showOrgForm && doc.hostOrgs && doc.hostOrgs.length){
                  $scope.showOrgForm=false;

                }
              });

                  $http.get("https://api.cbd.int/api/v2015/confrences", {
                      cache: true
                  }).then(function(o) {
                      $scope.options.confrences= $filter("orderBy")(o.data, "title");

                  });


            //============================================================
            //
            //============================================================
            $scope.publishRequestDial = function () {

                  ngDialog.open({ template: dialogTemplate, className: 'ngdialog-theme-default',plain: true ,scope:$scope,preCloseCallback:$scope.close});


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

                      if(conf[1].meta.status!=='request')
                       mongoStorage.requestDoc('inde-orgs',{document:conf[1]},conf[0]);
                    });
                });
              });
            };

              init();


              //=======================================================================
              //
              //=======================================================================
              $scope.select = function (docObj){

                $timeout(function(){
                    docObj.selected=!docObj.selected;
                    if(true){
                      if(docObj.selected){
                          $scope.doc.confrence=docObj._id;
                      }
                      else{
                          $scope.doc.confrence='';
                          $scope.search='';
                      }
                  }

                });


              };// archiveOrg

              //============================================================
              //
              //============================================================
              function init() {

                if($scope._id!=='0' && $scope._id!=='new'){

                    if(($scope._id.search('^[0-9A-Fa-f]{24}$')<0 ))
                      $location.url('/404');
                    else
                      mongoStorage.loadDoc($scope.schema,$scope._id).then(function(document){

                            $scope.loading=true;
                            $scope._id=document[0];
                            $scope.doc=document[1];
                            $scope.isNew=false;

                      });
                  }
                else{
                    mongoStorage.createDoc($scope.schema).then(
                            function(document){
                              $scope.loading=true;
                              $scope._id=document[0];
                              $scope.doc=document[1];
                              $scope.doc.logo=randomPic();
                              initProfile(true);
                              $scope.isNew=true;
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
                           $scope.doc.confrenceObj=confr[1];
                          var diff = Number(confr[1].end)-Number(confr[1].start);
                          var numDays = Math.ceil(diff/86400);
                          if(!$scope.options)$scope.options={};
                          if(!$scope.options.dates)$scope.options.dates=[];
                          for (var i = 0; i < numDays; i++) {
                              $scope.options.dates[i]=moment.unix(Number(confr[1].start)).format("YYYY/MM/DD");
                              confr[1].start=confr[1].start+86400;
                          }


                    });
                    _.each($scope.options.confrences,function(conf){
                          if(conf._id===$scope.doc.confrence)
                            conf.selected=true;
                    })

              }// init

              //============================================================
              //
              //============================================================
              function initProfile(newDoc) {
                  var userId;
                  auth.getUser().then(function(user){
                    if(newDoc){
                      $scope.user=user;
                      userId=$scope.user.userID;
                    }
                    else {
                      userId = $scope.doc.meta.createdBy;
                    }


                    return $http.get('https://api.cbd.int/api/v2013/users/' + userId).then(function onsuccess (response) {
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
              //  app/images/ic_event_black_48px.svg
              //============================================================
              function randomPic() {
                    var num = Math.floor((Math.random() * 12) + 1);
                    return 'https://s3.amazonaws.com/mongo.document.attachments/inde-config/56c4863bc0e5501192caa152/Avatar'+num+'.svg';

              }

              $scope.randomPic = function (){
                $scope.doc.logo=randomPic();
              }

              //============================================================
              //
              //============================================================
              $scope.toggleIcon= function() {
                  if($scope.doc.logo==='app/images/ic_event_black_48px.svg')
                      $scope.doc.logo=randomPic();
                  else
                      $scope.doc.logo='app/images/ic_event_black_48px.svg';
              }

              //============================================================
              //
              //============================================================
              function generateEventId(confId) {

                return mongoStorage.generateEventId(confId).then(function(res){
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
                  countries: function() {
                      return $http.get("https://api.cbd.int/api/v2015/countries", {
                          cache: true
                      }).then(function(o) {
                        $scope.countries =  $filter("orderBy")(o.data, "name.en");

                        _.each($scope.countries, function(c){
                            c.title=c.name;

                            c.identifier=c.code.toLowerCase();

                        });
                        return $scope.countries;
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
                  var tempMobile;
                  if(!$scope.doc.confrence) throw "Error no confrence selected";
                  generateEventId($scope.doc.confrence).then(
                    function(res){
                      if(Number(res.data.count)===0 )
                        $scope.doc.id= 1000;
                      else if (Number(res.data.count)<1000)
                        $scope.doc.id=Number(res.data.count)+1000;
                      else
                        $scope.doc.id=Number(res.data.count)+2;

                        if($scope.doc.contact.mobile)
                          tempMobile = _.clone($scope.doc.contact.mobile);

                        _.each($scope.doc.hostOrgs,function(orgId){

                              mongoStorage.loadDoc('inde-orgs',orgId).then(function(orgObj){

                                  if(orgObj[1].meta.status==='draft'){
                                        orgObj[1].meta.status='request';
                                        mongoStorage.save('inde-orgs',orgObj[1],orgObj._id);
                                  }
                              });
                        });
                        mongoStorage.save($scope.schema,$scope.doc,$scope._id).then(function(){

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
