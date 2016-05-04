define(['app', 'lodash',
  'text!./edit-side-event.html',
  'moment',
  'text!directives/forms/edit/publish-dialog.html',
  'text!directives/forms/edit/dirty-form.html',
  'css!libs/ng-dialog/css/ngDialog.css',
  'css!libs/ng-dialog/css/ngDialog-theme-default.min.css',
  '../../side-menu/scbd-side-menu',
  'scbd-filters/l-string',
  'directives/km-select',
  '../controls/scbd-select-list',
  '../../../services/mongo-storage',
  '../controls/scbd-file-upload',
  './edit-organization',
  'app/services/theasarus.js'
], function(app, _, template, moment, dialogTemplate) {
  app.directive("editSideEvent", ['scbdMenuService', '$q', '$http', '$filter', '$route', 'mongoStorage', '$location', 'authentication', '$window', 'ngDialog', '$compile', '$timeout', 'smoothScroll', 'history', '$rootScope','Thesaurus',//"$http", "$filter", "Thesaurus",
    function(scbdMenuService, $q, $http, $filter, $route, mongoStorage, $location, auth, $window, ngDialog, $compile, $timeout, smoothScroll, history, $rootScope,Thesaurus) {
      return {
        restrict: 'E',
        template: template,
        replace: true,
        transclude: false,
        scope: {},
        link: function($scope) {
            $scope.status = "";
            $scope._id = $route.current.params.id;
            $scope.loading = false;
            $scope.schema = "inde-side-events";
            $scope.showOrgForm = 0;
            $scope.isNew = true;
            $scope.registerAlert=true;
            $scope.doc = {};
            $scope.doc.hostOrgs = [];
            $scope.updateProfile = 'No';
            $scope.ignoreDirtyCheck=false;


            $scope.$watch('doc.confrence', function() {
              if ($scope.doc.confrence)
                generateDates($scope.doc.confrence);
            });

            $scope.$watch('doc.hostOrgs', function() {
              if ($scope.doc.hostOrgs && $scope.doc.hostOrgs.length > 0) {
                $(document.getElementById('editForm.hostOrgs')).css('border-color', '#cccccc');
                $(document.getElementById('hostOrg-error')).removeClass('has-error-div');
                $(document.getElementById('hostOrgMsg')).css('display', 'none');
              }
            }, true);

            $http.get("/api/v2016/conferences", {
              cache: true
            }).then(function(o) {

              $scope.options.conferences = $filter("orderBy")(o.data, "start");
              _.each($scope.options.conferences, function(conf) {
                if (conf._id === $location.search().m)
                  conf.selected = true;
                else
                  conf.selected = false;
              });

            }).then($timeout(function() {
                if ($location.search().m) $scope.doc.confrence = $location.search().m;
            }, 1000)).catch(function onerror(response) {
                $scope.onError(response);
            });

            init();
            //============================================================
            //
            //============================================================
            $scope.$on('$locationChangeStart', function( event ) {
                    if($scope.editForm.$dirty && !$scope.ignoreDirtyCheck){
                    var answer = confirm("Are you sure you want to leave this page, your data has not been saved?");
                       if (!answer)
                          event.preventDefault();
                    }
              // if($scope.editForm.$dirty && !$scope.cloaseWithoutSaving){
              //
              //   var dialog = ngDialog.open({
              //     template: dirtyDialog,
              //     className: 'ngdialog-theme-default',
              //     closeByDocument: false,
              //     plain: true,
              //     scope: $scope
              //   });
              //
              //   dialog.closePromise.then(function(ret) {
              //
              //     if (ret.value == 'close') {$scope.cloaseWithoutSaving=true;$scope.close();}
              //     if (ret.value == 'save') $scope.saveDoc().then($scope.close).catch(function onerror(response) {
              //       $scope.onError(response);
              //     });
              //
              //   });
              // }

            });
            //============================================================
            //
            //============================================================
            $scope.publishRequestDial = function() {

              var dialog = ngDialog.open({
                template: dialogTemplate,
                className: 'ngdialog-theme-default',
                closeByDocument: false,
                plain: true,
                scope: $scope
              });
              $scope.ignoreDirtyCheck=true;
              dialog.closePromise.then(function(ret) {

                if (ret.value == 'draft') $scope.close();
                if (ret.value == 'publish') $scope.requestPublish().then($scope.close).catch(function onerror(response) {

                  $scope.onError(response);

                });

              });
            };



            //============================================================
            //
            //============================================================
            $scope.requestPublish = function() {
              //dialogTemplate = $compile(dialogTemplate,$scope);
              $scope.ignoreDirtyCheck=true;
              $scope.doc.meta.status = 'request';
              return mongoStorage.save($scope.schema, $scope.doc, $scope._id).then(function() {
                _.each($scope.doc.hostOrgs, function(org) {
                  mongoStorage.loadDoc('inde-orgs', org).then(function(conf) {

                    if (conf.meta.status !== 'published')
                      mongoStorage.requestDoc('inde-orgs',conf, conf._id);
                  }).catch(function onerror(response) {
                    $scope.onError(response);
                  });
                });
              });
            };




            //=======================================================================
            //
            //=======================================================================
            $scope.selectMeeting = function(docObj) {
              $timeout(function() {
                _.each($scope.options.conferences, function(meeting) {
                  meeting.selected = false;
                });

                docObj.selected = !docObj.selected;
                if (true) {
                  if (docObj.selected) {
                    $scope.doc.confrence = docObj._id;
                  } else {
                    $scope.doc.confrence = '';
                    $scope.search = '';
                  }
                }
              });
            }; // archiveOrg

            //============================================================
            //
            //============================================================
            function init() {

              if ($scope._id !== '0' && $scope._id !== 'new') {

                if (($scope._id.search('^[0-9A-Fa-f]{24}$') < 0))
                  $location.url('/404');
                else
                  mongoStorage.loadDoc($scope.schema, $scope._id).then(function(document) {

                    $scope.loading = true;
                    $scope._id = document._id;
                    $scope.doc = document;
                    $scope.isNew = false;
                  }).catch(function onerror(response) {

                    $scope.onError(response);

                  });
              } else {
                mongoStorage.createDoc($scope.schema).then(
                  function(document) {

                    $scope.loading = true;
                    $scope._id = document._id;
                    $scope.doc = document;
                    $scope.doc.logo = randomPic();
                    initProfile(true);
                    $scope.isNew = true;

                  }
                ).catch(function onerror(response) {

                  $scope.onError(response);

                });
              }

            } // init

            //============================================================
            //
            //============================================================
            function generateDates() {

              mongoStorage.loadDoc('conferences', $scope.doc.confrence).then(function(confr) {
                $scope.options.dates=[];
                var diff = Number(confr.end) - Number(confr.start);

                var numDays = Math.ceil(diff / 86400)+1;

                if (!$scope.options) $scope.options = {};
                if (!$scope.options.dates) $scope.options.dates = [];
                for (var i = 0; i < numDays; i++) {
                  $scope.options.dates[i] = moment.unix(Number(confr.start)).format("YYYY/MM/DD");
                  confr.start = confr.start + 86400;
                }
              }).catch(function onerror(response) {

                $scope.onError(response);

              });
              _.each($scope.options.conferences, function(conf) {
                if (conf._id === $scope.doc.confrence)
                  conf.selected = true;
              });

            } // init

            //============================================================
            //
            //============================================================
            function initProfile(newDoc) {
              var userId;
              auth.getUser().then(function(user) {
                if (newDoc) {
                  $scope.user = user;
                  userId = $scope.user.userID;
                } else {
                  userId = $scope.doc.meta.createdBy;
                }


                return $http.get('/api/v2013/users/' + userId).then(function onsuccess(response) {
                  //data = response.data;
                  if (!$scope.doc) $scope.doc = {};
                  if (!$scope.doc.contact) $scope.doc.contact = {};


                  $scope.doc.contact.email = _.clone(response.data.Email);
                  $scope.doc.contact.address = _.clone(response.data.Address);
                  $scope.doc.contact.city = _.clone(response.data.City);
                  $scope.doc.contact.country = _.clone(response.data.Country);
                  $scope.doc.contact.personalTitle = _.clone(response.data.Title);
                  $scope.doc.contact.state = _.clone(response.data.State);
                  $scope.doc.contact.zip = _.clone(response.data.Zip);
                  $scope.doc.contact.phone = _.clone(response.data.Phone);
                  $scope.doc.contact.firstName = _.clone(response.data.FirstName);
                  $scope.doc.contact.lastName = _.clone(response.data.LastName);
                  $scope.doc.contact.jobTitle = _.clone(response.data.Designation);

                }).catch(function onerror(response) {

                  $scope.onError(response);

                });
              });
            } // initProfile()

            //============================================================
            //  app/images/ic_event_black_48px.svg
            //============================================================
            function randomPic() {
              var num = Math.floor((Math.random() * 12) + 1);
              return 'https://s3.amazonaws.com/mongo.document.attachments/inde-config/56c4863bc0e5501192caa152/Avatar' + num + '.svg';

            }

            $scope.randomPic = function() {
              $scope.doc.logo = randomPic();
            };

            //============================================================
            //
            //============================================================
            $scope.toggleIcon = function() {
              if ($scope.doc.logo === 'app/images/ic_event_black_48px.svg')
                $scope.doc.logo = randomPic();
              else
                $scope.doc.logo = 'app/images/ic_event_black_48px.svg';
            };

            //============================================================
            //
            //============================================================
            // function generateEventId(confId) {
            //   return mongoStorage.generateEventId(confId).then(function(res) {
            //     return res;
            //   }).then(null, function(err) {
            //     $scope.onError(err);
            //   });
            // } // generateEventId

            //============================================================
            //
            //============================================================
            $scope.options = {
              subjects		: $http.get("/api/v2013/thesaurus/domains/CBD-SUBJECTS/terms",								{ cache: true }).then(function(o){ return Thesaurus.buildTree(o.data); }),
              countries: function() {
                return $http.get("https://api.cbd.int/api/v2015/countries", {
                  cache: true
                }).then(function(o) {
                  $scope.countries = $filter("orderBy")(o.data, "name.en");

                  _.each($scope.countries, function(c) {
                    c.title = c.name;

                    c.identifier = c.code.toLowerCase();

                  });
                  return $scope.countries;
                });
              },

            };

            //=======================================================================
            //
            //=======================================================================
            $scope.orgCallback = function() {
              $scope.showOrgForm = 0;
            };

            //=======================================================================
            //
            //=======================================================================
            $scope.saveDoc = function() {
                $scope.doc.meta.status='draft';
               if(!$scope.doc.id){
                        mongoStorage.save($scope.schema, $scope.doc, $scope._id).then(null, function(err) {
                          $scope.onError(err);
                        }).catch(function onerror(response) {

                          $scope.onError(response);
                        });
                }
                else
                    mongoStorage.save($scope.schema, $scope.doc, $scope._id).then(null, function(err) {
                      $scope.onError(err);
                    }).catch(function onerror(response) {

                      $scope.onError(response);
                    });
            };


            //=======================================================================
            //
            //=======================================================================
            $scope.goTo = function(url) {

              $location.url(url);
            };

            //=======================================================================
            //
            //=======================================================================
            $scope.submitForm = function(formData) {
              $scope.submitted = true;

              if (!$scope.doc.hostOrgs || $scope.doc.hostOrgs.length === 0) {
                formData.$valid = false;
              }

              if (formData.$valid) {
                $scope.saveDoc();
                $scope.publishRequestDial();
              }
              else {


                if (formData.meeting.$error.required && $scope.submitted) {
                  findScrollFocus('editForm.meeting');
                //  return;
                }
                if (formData.exp_num_participants.$error.required && $scope.submitted)
                  findScrollFocus('editForm.exp_num_participants');

                if (formData.title.$error.required && $scope.submitted)
                  findScrollFocus('editForm.title');

                if (formData.title.$error.required && $scope.submitted)
                  findScrollFocus('editForm.title');

                if (formData.description.$error.required && $scope.submitted)
                  findScrollFocus('editForm.description');

                  if (formData.subjects.$error.required && $scope.submitted)
                    findScrollFocus('editForm.subjects');

                if (!$scope.doc.hostOrgs || $scope.doc.hostOrgs.length === 0) {

                  if (!$scope.focused)
                    smoothScroll(document.getElementById('hostOrg-error'));
                  if(!$scope.focused)
                      $(document.getElementById('editForm.hostOrgs')).focus();
                  $(document.getElementById('editForm.hostOrgs')).addClass('has-error');
                  $(document.getElementById('hostOrg-error')).addClass('has-error-div');
                  $(document.getElementById('hostOrgMsg')).css('display', 'block');
                  $scope.focused = true;
                }

                if (formData.firstName.$error.required && $scope.submitted)
                  findScrollFocus('editForm.firstName');
                if (formData.lastName.$error.required && $scope.submitted)
                  findScrollFocus('editForm.lastName');
                if (formData.phone.$error.required && $scope.submitted)
                  findScrollFocus('editForm.phone');
                if (formData.city.$error.required && $scope.submitted)
                  findScrollFocus('editForm.city');
                if (formData.country.$error.required && $scope.submitted)
                  findScrollFocus('editForm.country');
                if (formData.email.$error.required && $scope.submitted)
                  findScrollFocus('editForm.email');

                if (formData.prefDateOne.$error.required && $scope.submitted)
                  findScrollFocus('editForm.prefDateOne');
                if (formData.prefTimeOne.$error.required && $scope.submitted)
                  findScrollFocus('editForm.prefTimeOne');

                if (formData.prefDateTwo.$error.required && $scope.submitted)
                  findScrollFocus('editForm.prefDateTwo');
                if (formData.prefTimeTwo.$error.required && $scope.submitted)
                  findScrollFocus('editForm.prefTimeTwo');

                if (formData.prefDateThree.$error.required && $scope.submitted)
                  findScrollFocus('editForm.prefDateThree');
                if (formData.prefTimeThree.$error.required && $scope.submitted)
                  findScrollFocus('editForm.prefTimeThree');


              }

              $scope.focused = false;

            }; //

            //=======================================================================
            //
            //=======================================================================
            function findScrollFocus(id) {

              var el = document.getElementById(id);

              if (!$scope.focused) {

                smoothScroll(el);
                if ($(el).is("input") || $(el).is("select"))
                  el.focus();
                else {
                  if ($(el).find('input').length === 0)
                    $(el).find('textarea').focus();
                  else
                    $(el).find('input').focus();

                }
                $scope.focused = true;
              }
            }


            //============================================================
            //
            //============================================================
            $scope.onError = function(res) {

              $scope.status = "error";
              if (res.status === -1) {
                $scope.error = "The URI " + res.config.url + " could not be resolved.  This could be caused form a number of reasons.  The URI does not exist or is erroneous.  The server located at that URI is down.  Or lastly your internet connection stopped or stopped momentarily. ";
                if (res.data.message)
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
              } else if (res.data.Message)
                $scope.error = res.data.Message;
              else
                $scope.error = res.data;
            };
            //============================================================
            //
            //============================================================
            $scope.hasError = function() {
              return !!$scope.error;
            };
            //=======================================================================
            //
            //=======================================================================
            $scope.close = function() {

              history.goBack();
            };
          } //link
      }; //return
    }
  ]);
});