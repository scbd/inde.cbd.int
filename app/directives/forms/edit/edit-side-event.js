define(['app', 'lodash',
    'text!./edit-side-event.html',
    'moment',
    'text!directives/forms/edit/publish-dialog.html',
    'text!directives/forms/edit/dirty-form.html',
    'directives/forms/controls/scbd-select-list',
    'services/mongo-storage',
    'directives/forms/controls/scbd-file-upload',
    './edit-organization',
    './edit-link',
    'directives/link-list',
    'services/theasarus', 'ngDialog', 'ngSmoothScroll',
    'directives/fade-in-tab',
    'directives/bs-progress-bar',
    'services/filters',
    'ng-ckeditor',
    'ui.select',
    'filters/propsFilter',
    'directives/google-address',
    'services/reloader'
], function(app, _, template, moment, dialogTemplate) {
    app.directive("editSideEvent", [ '$q', '$http', '$filter', '$route', 'mongoStorage', '$location', 'authentication', '$window', 'ngDialog', '$compile', '$timeout', 'smoothScroll', 'history', '$rootScope', 'Thesaurus','$routeParams','reloader', //"$http", "$filter", "Thesaurus",
        function( $q, $http, $filter, $route, mongoStorage, $location, auth, $window, ngDialog, $compile, $timeout, smoothScroll, history, $rootScope, Thesaurus,$routeParams,reloader) {
            return {
                restrict: 'E',
                template: template,
                replace: true,
                transclude: false,
                scope: {},
                link: function($scope) {
                        var numHostOrgs =0;
                        $scope.status = "";
                        $scope._id = $route.current.params.id;

                        $scope.loading = true;
                        $scope.schema = "inde-side-events";
                        $scope.showOrgForm = 0;
                        $scope.isNew = true;
                        $scope.registerAlert = true;
                        $scope.doc = {};
                        $scope.doc.hostOrgs = [];
                        $scope.updateProfile = 'No';
                        $scope.ignoreDirtyCheck = false;

                        $scope.document = {};

                        $scope.errorMap={
                          title:{tab:'general',label:'Title'},
                          subjects:{tab:'general',label:'Subjects'},
                          description:{tab:'general',label:'Description'},
                          expNumPart:{tab:'logistics',label:'Expected Number of Participants'},
                          prefDateOne:{tab:'logistics',label:'First Date Preference'},
                          prefDateTwo:{tab:'logistics',label:'Second Date Preference'},
                          prefDateThree:{tab:'logistics',label:'Third Date Preference'},
                          prefTimeOne:{tab:'logistics',label:'First Time Preference'},
                          prefTimeTwo:{tab:'logistics',label:'Second Time Preference'},
                          prefTimeThree:{tab:'logistics',label:'Third Time Preference'},
                          firstName:{tab:'contact',label:'Contact Person First Name'},
                          lastName:{tab:'contact',label:'Contact Person Last Name'},
                          phone:{tab:'contact',label:'Contact Person Phone'},
                          city:{tab:'contact',label:'Contact Person City'},
                          emaill:{tab:'contact',label:'Contact Person Email'},
                          country:{tab:'contact',label:'Contact Person Country'},
                          responsibleLastName:{tab:'contact',label:'Responsible Person Last Name'},
                          responsibleEmail:{tab:'contact',label:'Responsible Person Email'},
                        };

                        $scope.editorOptions = {
                            language: 'en',
                            uiColor: '#069554'
                        };
                        $scope.patterns = {
                            facebook: /^http[s]?:\/\/(www.)?facebook.com\/.+/i,
                            twitter: /^http[s]?:\/\/twitter.com\/.+/i,
                            youtube: /^http[s]?:\/\/(www.)?youtube.com\/user\/.+/i,
                            phone: /^\+\d+(\d|\s|-|ext|#|\*)+$/i,
                            time: /^([0-1][0-9]|2[0-3]|[0-9]):[0-5][0-9]$/,
                            email: /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i
                        };


                        $scope.options = {};



                        $scope.tab = 'general';
                        $('#general-tab').tab('show');

                        init();

                        //============================================================
                        //
                        //============================================================
                        $scope.$watch('doc.conference', function() {
                            if ($scope.doc.conference)
                                    generateDates();

                        });


                        //============================================================
                        //
                        //============================================================
                        $scope.$watch('doc.hostOrgs', function() {
                            if ($scope.doc.hostOrgs && $scope.doc.hostOrgs.length > 0) {
                                $(document.getElementById('editForm.hostOrgs')).css('border-color', '#cccccc');
                                $(document.getElementById('hostOrg-error')).removeClass('has-error-div');
                                $(document.getElementById('hostOrgMsg')).css('display', 'none');
                                loadHostOrgs();
                                if(numHostOrgs < $scope.doc.hostOrgs.length){
                                  $scope.doc.validTabs.orgs=false;
                                  $scope.doc.validTabs.contact=false;
                                }else{
                                  $scope.doc.validTabs.orgs=true;
                                  if(validateResponsibleOrgs() && $scope.doc.validTabs.contact)
                                    $scope.doc.validTabs.contact=true;
                                }
                                _.each($scope.doc.hostOrgs, function(resOrg, key) {
                                    if(!_.isEmpty($scope.doc.responsibleOrgs) && $scope.doc.responsibleOrgs[key] && $scope.doc.responsibleOrgs[key] && !$scope.doc.responsibleOrgs[key].lastName && !$scope.doc.responsibleOrgs[key].email)
                                      $scope.doc.responsibleOrgs[key].sameAs='';
                                });

                                if($scope.doc.responsible && !$scope.doc.responsibleLastName && !$scope.doc.responsibleOrgsEmail)
                                  $scope.doc.responsible.sameAs='';

                            }
                        }, true);

                        //============================================================
                        //
                        //============================================================
                        function loadSubjects()
                        {
                            return $http.get("/api/v2013/thesaurus/domains/CBD-SUBJECTS/terms", {
                                cache: true
                            }).then(function(o) {
                              $scope.options.subjectsTree =Thesaurus.buildTree(o.data);
                              $scope.options.subjects = [];
                              $scope.options.subjects.push({identifier:' ',name:' '});
                              $scope.options.subjectsTree.forEach(function(s){
                                  s.group=true;
                                  $scope.options.subjects.push(s);

                                  s.narrowerTerms.forEach(function(s2){
                                    $scope.options.subjects.push(s2);
                                  });
                              });

                            }).catch(onError);
                        }

                        //============================================================
                        //
                        //============================================================
                        function loadTargets()
                        {
                            return $http.get("/api/v2013/thesaurus/domains/AICHI-TARGETS/terms", {
                                cache: true
                            }).then(function(o) {
                              $scope.options.targets = o.data;

                            }).catch(onError);
                        }

                        //============================================================
                        //
                        //============================================================
                        function onError (res) {

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
                            } else if (res.data && res.data.Message)
                                $scope.error = res.data.Message;
                            else
                                $scope.error = res.data || res;
                        }

                        //============================================================
                        //
                        //============================================================
                          function compareDates(a,b) {
                          if (moment(a.StartDate).isBefore(b.StartDate))
                            return 1;
                          if (moment(a.StartDate).isAfter(b.StartDate))
                            return -1;
                          return 0;
                        }

                        //============================================================
                        //
                        //============================================================
                        function loadConferences() {
                            return mongoStorage.loadConferences().then(function(o) {

                                $scope.options.conferences=o.sort(compareDates); //= $filter("orderBy")(o.data, "StartDate");

                            }).catch(onError);
                        }

                        //============================================================
                        //
                        //============================================================
                        $scope.$on('$locationChangeStart', function(event) {

                            if ($scope.editForm.$dirty && !$scope.ignoreDirtyCheck) {
                                var answer = confirm("Are you sure you want to leave this page, your data has not been saved?");
                                if (!answer)
                                    event.preventDefault();
                            }

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
                            $scope.ignoreDirtyCheck = true;
                            dialog.closePromise.then(function(ret) {

                                if (ret.value === 'draft') $scope.saveDoc().then(function() {
                                    $scope.goTo('/manage');
                                });
                                if (ret.value === 'publish') $scope.requestPublish().catch(onError);

                            });
                        };

                        //============================================================
                        //
                        //============================================================
                        $scope.sameAs = function(selectedValue, row) {

                            if (row === 'responsible')
                                sameAsResponisble(selectedValue);
                            else if (_.isNumber(row))
                                sameAsResponisbleOrg(selectedValue, row);
                        };

                        //============================================================
                        //
                        //============================================================
                        $scope.allSameAsOptionsInUse = function() {

                            return (_.find($scope.doc.responsibleOrgs, {
                                    sameAs: 'me'
                                }) &&
                                _.find($scope.doc.responsibleOrgs, {
                                    sameAs: 'contact'
                                }) &&
                                _.find($scope.doc.responsibleOrgs, {
                                    sameAs: 'principal'
                                })
                            );
                        };

                        //============================================================
                        //
                        //============================================================
                        $scope.isContactUsedInSameAs = function(index) {
                            if (!$scope.doc.responsibleOrgs) $scope.doc.responsibleOrgs = [];

                            return ((_.find($scope.doc.responsibleOrgs, {
                                        sameAs: 'contact'
                                    }) ||
                                    ($scope.doc.responsibleOrgs[index] && !!(_.find($scope.doc.responsibleOrgs, {
                                        email: $scope.doc.contact.email
                                    })))
                                ) &&
                                (!$scope.doc.responsibleOrgs[index] || ($scope.doc.responsibleOrgs[index] && ($scope.doc.responsibleOrgs[index].sameAs !== 'contact'))));


                        };

                        //============================================================
                        //
                        //============================================================
                        $scope.isMeUsedInSameAs = function(index) {
                            if (!$scope.doc.responsibleOrgs) $scope.doc.responsibleOrgs = [];

                            return ((_.find($scope.doc.responsibleOrgs, {
                                        sameAs: 'me'
                                    }) ||
                                    ($scope.doc.responsibleOrgs[index] && !!(_.find($scope.doc.responsibleOrgs, {
                                        email: $scope.me.email
                                    })))
                                ) &&
                                (!$scope.doc.responsibleOrgs[index] || ($scope.doc.responsibleOrgs[index] && ($scope.doc.responsibleOrgs[index].sameAs !== 'me'))));

                        };
                        //============================================================
                        //
                        //============================================================
                        $scope.numStepsCompleted = function() {
                              var count =0;
                              _.each($scope.doc.validTabs,function(tab,key){
                                if(tab && (key!=='links' || key!=='publications' || key!=='images' || key!=='videos' )) count++;
                              });
                              if($scope.doc.meta && ($scope.doc.meta.status==='published' || $scope.doc.meta.status==='request') && count===4)
                                count++;

                                return count;

                        };

                        //============================================================
                        //
                        //============================================================
                        function showProgress() {
                          $scope.showProg=true;
                              $timeout(function(){
                                if($scope.numStepsCompleted()===5)
                                  $scope.showProg = false;
                              },5000);
                        }

                        //============================================================
                        //
                        //============================================================
                        $scope.isPrincipalUsedInSameAs = function(index) {
                            if (!$scope.doc.responsibleOrgs) $scope.doc.responsibleOrgs = [];
                            return ((_.find($scope.doc.responsibleOrgs, {
                                        sameAs: 'principal'
                                    }) ||
                                    ($scope.doc.responsibleOrgs[index] && $scope.doc.responsible && !!(_.find($scope.doc.responsibleOrgs, {
                                        email: $scope.doc.responsible.email
                                    })))
                                ) &&
                                (!$scope.doc.responsibleOrgs[index] || ($scope.doc.responsibleOrgs[index] && ($scope.doc.responsibleOrgs[index].sameAs !== 'principal'))));

                        };

                        //============================================================
                        // load responsible person for SE with data
                        //============================================================
                        function sameAsResponisble(selectedValue) {
                            switch (selectedValue) {
                                case 'contact':
                                    $scope.doc.responsible.personalTitle = $scope.doc.contact.personalTitle || '';
                                    $scope.doc.responsible.firstName = $scope.doc.contact.firstName || '';
                                    $scope.doc.responsible.lastName = $scope.doc.contact.lastName || '';
                                    $scope.doc.responsible.email = $scope.doc.contact.email || '';
                                    break;
                                case 'me':
                                    auth.getUser().then(function(user) {
                                        $scope.me = user;
                                        var nameArray = user.name.split(" ");
                                        $scope.doc.responsible.lastName = nameArray[nameArray.length - 1] || '';
                                        if (nameArray.length >= 3)
                                            $scope.doc.responsible.personalTitle = nameArray[0] || '';
                                        else {
                                            $scope.doc.responsible.firstName = nameArray[0] || '';
                                            $scope.doc.responsible.personalTitle = '';
                                        }
                                        $scope.doc.responsible.email = user.email || '';
                                    }).catch(onError);
                                    break;
                            }
                        } // $scope.sameAsResponisble

                        //============================================================
                        // load responsible person for ORG with data
                        //============================================================
                        function sameAsResponisbleOrg(selectedValue, row) {

                            switch (selectedValue) {
                                case 'contact':
                                    $scope.doc.responsibleOrgs[row].personalTitle = $scope.doc.contact.personalTitle || '';
                                    $scope.doc.responsibleOrgs[row].firstName = $scope.doc.contact.firstName || '';
                                    $scope.doc.responsibleOrgs[row].lastName = $scope.doc.contact.lastName || '';
                                    $scope.doc.responsibleOrgs[row].email = $scope.doc.contact.email || '';
                                    break;
                                case 'me':
                                    auth.getUser().then(function(user) {
                                        var nameArray = user.name.split(" ");
                                        $scope.doc.responsibleOrgs[row].lastName = nameArray[nameArray.length - 1] || '';
                                        if (nameArray.length >= 3)
                                            $scope.doc.responsibleOrgs[row].personalTitle = nameArray[0] || '';
                                        else {
                                            $scope.doc.responsibleOrgs[row].firstName = nameArray[0] || '';
                                            $scope.doc.responsibleOrgs[row].personalTitle = '';
                                        }
                                        $scope.doc.responsibleOrgs[row].email = user.email || '';
                                    });
                                    break;
                                case 'principal':

                                    $scope.doc.responsibleOrgs[row].personalTitle = $scope.doc.responsible.personalTitle || '';
                                    $scope.doc.responsibleOrgs[row].firstName = $scope.doc.responsible.firstName || '';
                                    $scope.doc.responsibleOrgs[row].lastName = $scope.doc.responsible.lastName || '';
                                    $scope.doc.responsibleOrgs[row].email = $scope.doc.responsible.email || '';
                                    break;
                            }
                        } // $scope.sameAsResponisble
                        //============================================================
                        //
                        //============================================================
                        $scope.requestPublish = function() {

                            $scope.ignoreDirtyCheck = true;
                            $scope.doc.meta.status = 'request';
                            return mongoStorage.save($scope.schema, cleanDoc($scope.doc), $scope._id).then(function() {

                                $scope.$emit('showSuccess', 'Side Event ' + $scope.doc.id + ' is Now Registered as a Request');
                                _.each($scope.doc.hostOrgs, function(org) {

                                    if (org.length > 2)
                                        mongoStorage.loadDoc('inde-orgs', org).then(function(conf) {
                                            if (conf.meta.status !== 'published')
                                                mongoStorage.requestDoc('inde-orgs', conf, conf._id);
                                        }).catch(function onerror(response) {
                                            $scope.onError(response);
                                        });
                                });
                            }).catch(onError);
                        };
                        //=======================================================================
                        //
                        //=======================================================================
                        function isEditable() {
                            if($scope.doc.meta)
                            if (isAdmin() || $scope.doc.meta.status ==='draft' || $scope.doc.meta.status ==='published' || $scope.doc.meta.status ==='request')
                                return true;
                            else
                                return false;
                        }
                        $scope.isEditable = isEditable;

                        //=======================================================================
                        //
                        //=======================================================================
                        function showEdit() {

                            if ((_.isBoolean($scope.editIndex) && $scope.editIndex) || _.isNumber($scope.editIndex))
                                return true;
                            else
                                return false;
                        }
                        $scope.showEdit = showEdit;
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

                        function loadUser() {
                            return auth.getUser().then(function(user) {
                                $scope.me = user;
                            }).catch(onError);
                        }

                        function loadOrgs() {
                            return mongoStorage.loadOrgs().then(function(orgs) {
                                $scope.options.orgs = orgs;
                            }).catch(onError);
                        }

                        function showTab(validTabs){
                           var shownSelected = false;
                           if(_.isObject(validTabs))
                          _.each(validTabs,function(tab,key){
                                if(shownSelected) return;
                                if(!tab){

                                  $timeout(function(){$scope.tab = key;$('#'+key+'-tab').tab('show');});
                                  shownSelected=true;
                                }
                          });
                          else {

                            $timeout(function(){$scope.tab = validTabs;$('#'+validTabs+'-tab').tab('show');});
                          }

                        }
                        $scope.showTab=showTab;


                        //============================================================
                        //
                        //============================================================
                        function init() {


                            $scope.editIndex = false;

                            $q.all([loadUser(), loadCountries(), loadOrgs(),loadConferences(),loadSubjects(),loadTargets()]).then(function() {
                              showProgress();
                                if ($scope._id !== '0' && $scope._id !== 'new') {

                                    if (($scope._id.search('^[0-9A-Fa-f]{24}$') < 0))
                                        $location.url('/404');
                                    else
                                        mongoStorage.loadDoc($scope.schema, $scope._id).then(function(document) {

                                            $scope.loading = true;
                                            //$scope._id = document._id;
                                            $scope.doc = document;
                                            $scope.isNew = false;
                                            if (!$scope.doc.hostOrgs)
                                                $scope.doc.hostOrgs = [];
                                            if (!document.validTabs)
                                                $scope.doc.validTabs = {
                                                    'general': false,
                                                    'logistics': false,
                                                    'orgs': false,
                                                    'contact': false
                                                };
                                              showTab($scope.doc.validTabs);
                                            if (!$scope.doc.publications) $scope.doc.publications = [];
                                            if (!$scope.doc.images) $scope.doc.images = [];
                                            if (!$scope.doc.links) $scope.doc.links = [];
                                            if (!$scope.doc.videos) $scope.doc.videos = [];
                                            if(_.isArray($scope.doc.hostOrgs))
                                              numHostOrgs = $scope.doc.hostOrgs.length;
                                            else
                                                numHostOrgs = 0;
                                            if($scope.doc.subjects && $scope.doc.subjects.length)
                                              $scope.doc.subjects.forEach(function(item,index){

                                                      if(typeof item === 'object')
                                                        $scope.doc.subjects[index]=item.identifier;
                                              });

                                            $scope.loading=false;
                                            if($scope.doc.contact && $scope.me.email===$scope.doc.contact.email)
                                              $scope.preFill=true;
                                            else
                                              $scope.preFill=false;
                                        }).catch(onError);
                                } else {
                                            $scope.loading = true;
                                            $scope.doc = {};
                                            $scope.doc.meta={};
                                            $scope.doc.tempFile={};
                                            delete($scope._id);
                                            $scope.doc.logo = $scope.doc.logo = 'app/images/ic_event_black_48px.svg';
                                            //initProfile(true);

                                            $scope.doc.validTabs = {
                                                'general': false,
                                                'logistics': false,
                                                'orgs': false,
                                                'contact': false
                                            };
                                            $scope.isNew = true;

                                            if (!$scope.doc.hostOrgs) $scope.doc.hostOrgs = [];
                                            if (!$scope.doc.contact) $scope.doc.contact = {};
                                            if (!$scope.doc.publications) $scope.doc.publications = [];
                                            if (!$scope.doc.images) $scope.doc.images = [];
                                            if (!$scope.doc.links) $scope.doc.links = [];
                                            if (!$scope.doc.videos) $scope.doc.videos = [];
                                            if (!$scope.doc.prefDateTime)$scope.doc.prefDateTime={};
                                            if (!$scope.doc.prefDate)$scope.doc.prefDate={};


                                        $scope.doc.conference=$scope.options.conferences[0]._id;
                                        $scope.options.conferences[0].selected=true;

                                      $scope.preFill=false;
                                      $scope.loading=false;
                                }
                            }).catch(onError); // load orgs
                        } // init


                        //============================================================
                        // preselect meeting in data
                        //============================================================
                        function checkMeeting(index) {

                            var meeting = $scope.options.conferenceObj.meetings[index];
                            meeting.selected = !meeting.selected;
                            if (!$scope.doc.meetings) $scope.doc.meetings = [];
                            if (meeting.selected)
                                $scope.doc.meetings.push(meeting._id);
                            else
                                $scope.doc.meetings.splice($scope.doc.meetings.indexOf(meeting._id), 1);

                        } //
                        $scope.checkMeeting = checkMeeting;


                        //============================================================
                        //
                        //============================================================
                        function generateDates() {

                            if(!$scope.options.conferences) return;
                            var confr = $scope.options.conferenceObj = _.find($scope.options.conferences, {
                                _id: $scope.doc.conference
                            });

                            $scope.options.dates = [];

                            var diff = Number(moment(confr.EndDate).format('X')) - Number(moment(confr.StartDate).format('X'));

                            var numDays = Math.ceil(diff / 86400) + 1;

                            var startDate = moment(confr.StartDate);
                            if (!$scope.options) $scope.options = {};
                            if (!$scope.options.dates) $scope.options.dates = [];

                            for (var i = 0; i < numDays; i++) {
                                if(i && (moment(startDate).subtract(1, 'day').day()===0 || moment(startDate).subtract(1, 'day').day()===6)){
                                    i--;
                                }
                                if(startDate.day()===0 || startDate.day()===6){
                                    numDays--;
                                    startDate = startDate.add(1, 'day');
                                    continue;
                                }
                                $scope.options.dates.push(startDate.format("(dddd) YYYY/MM/DD"));
                                startDate = startDate.add(1, 'day');
                            }

                            _.each($scope.options.conferences, function(conf) {
                                if (conf._id === $scope.doc.conference || $scope.options.conferences.length===1)
                                    conf.selected = true;
                                //load selected meetings

                                _.each(conf.meetings, function(meet) {
                                    if ($scope.doc.meetings && $scope.doc.meetings.indexOf(meet._id) >= 0)
                                        meet.selected = true;
                                });
                            });
                        } // init


                        //============================================================
                        //
                        //============================================================
                        function initProfile(preFill) {


                                if(preFill)
                                return $http.get('/api/v2013/users/' + $scope.me.userID).then(function onsuccess(response) {
                                    if (!$scope.doc) $scope.doc = {};
                                    if (!$scope.doc.contact) $scope.doc.contact = {};

                                    $scope.doc.contact.email = response.data.Email;
                                    $scope.doc.contact.address = response.data.Address;
                                    $scope.doc.contact.city = response.data.City;
                                    $scope.doc.contact.country = {identifier:response.data.Country};

                                    $scope.doc.contact.personalTitle = response.data.Title;
                                    $scope.doc.contact.state = response.data.State;
                                    $scope.doc.contact.zip = response.data.Zip;
                                    $scope.doc.contact.phone = response.data.Phone;
                                    $scope.doc.contact.firstName = response.data.FirstName;
                                    $scope.doc.contact.lastName = response.data.LastName;
                                    $scope.doc.contact.jobTitle = response.data.Designation;

                                }).catch(onError);
                                else
                                  $scope.doc.contact = {};


                        } // initProfile()
                        $scope.initProfile=initProfile;

                        //============================================================
                        //
                        //============================================================
                        $scope.toggleIcon = function() {
                            if ($scope.doc.logo === 'app/images/ic_event_black_48px.svg')
                                $scope.doc.logo = '';
                            else
                                $scope.doc.logo = 'app/images/ic_event_black_48px.svg';
                        };



                        //=======================================================================
                        //
                        //=======================================================================
                        function loadCountries() {
                            return mongoStorage.getCountries().then(function(o) {
                                $scope.options.countries = $filter("orderBy")(o, "name.en");
                                $scope.options.countries =([{_id:' ',identifier:' ',name:' ',title:' '}]).concat($scope.options.countries);
                                return $scope.options.countries;
                            }).catch(onError);
                        }


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

                            $scope.doc.meta.status = 'draft';
                            numHostOrgs = $scope.doc.hostOrgs.length;
                            validateTabs();
                            if (!$scope.doc.id || !$scope._id) {

                                return mongoStorage.save($scope.schema, cleanDoc($scope.doc))
                                  .then(postSaveNewDoc)
                                    .catch(onError);
                            } else
                                return mongoStorage.save($scope.schema, cleanDoc($scope.doc), $scope._id).then(function() {
                                    $scope.$emit('showSuccess', 'Side Event ' + $scope.doc.id + ' Saved as Draft');
                                }).catch(onError);
                        };

                        //=======================================================================
                        //
                        //=======================================================================
                        function cleanDoc(doc) {
                            var cDoc = _.cloneDeep(doc);
                            delete(cDoc.subjectObjs);
                            delete(cDoc.conferenceObjs);
                            delete(cDoc.meetingObjs);
                            delete(cDoc.history);
                            return cDoc;
                        } //toggleListView

                        //=======================================================================
                        //
                        //=======================================================================
                        function postSaveNewDoc (result){
                          $scope._id=$scope.doc._id=result.data.id;
                          $scope.ignoreDirtyCheck=true;
                          mongoStorage.loadDoc('inde-side-events',$scope._id).then(
                            function(res){
                              //$location.url('/manage/events/'+$scope._id,true);
                              $scope.routeParams = $scope._id;
                              $location.url('/manage/events/'+$scope._id);
                              reloader.preventReload($scope, function(newParams) {
                                 $scope.routeParams = $scope._id;
                                 $routeParams=$scope._id;

                              });
                              $scope.doc=res;
                              var tempFile=getTempFile();

                                if(!_.isEmpty(tempFile))
                                      saveLogoNewDoc(tempFile);// move form temporary to perminant on S3
                                else
                                  $scope.$emit('showSuccess', 'New Side Event ' + $scope.doc.id + ' Created and Saved as Draft');

                            }
                          );

                      }// postSaveNewDoc

                      //=======================================================================
                      //
                      //=======================================================================
                      function getTempFile(){
                        if(!_.isEmpty($scope.doc.tempFile)){
                            var tempFile=$scope.doc.tempFile;
                            delete($scope.doc.tempFile);
                            return tempFile;
                        }else
                          return false;
                      }//getTempFile


                      //=======================================================================
                      //
                      //=======================================================================
                      function saveLogoNewDoc(tempFile) {
                          tempFile.metadata.docid = $scope._id;

                          if (tempFile.metadata.schema && tempFile.metadata.docid && tempFile.metadata.filename) {

                              return mongoStorage.moveTempFileToPermanent(tempFile, $scope._id).then(function() {

                                  mongoStorage.loadDoc($scope.schema, $scope._id).then(function(document) {
                                      $scope.doc = document;
                                      $scope.doc.logo = 'https://s3.amazonaws.com/mongo.document.attachments/';
                                      $scope.doc.logo += tempFile.metadata.schema + '/';
                                      $scope.doc.logo += tempFile.metadata.docid + '/';
                                      $scope.doc.logo +=   mongoStorage.awsFileNameFix(tempFile.metadata.filename);

                                      return $scope.saveDoc().then(function() {
                                          $location.url('/manage/events/' + $scope._id);
                                      });
                                  });
                              }).catch(onError);
                          } else
                              throw 'Error: Missing schema or id or filename to move file from temp to perminant';
                      } //saveLogoNewDoc


                        //=======================================================================
                        //
                        //=======================================================================
                        $scope.goTo = function(url) {

                            $location.url(url);
                        };


                        //=======================================================================
                        //
                        //=======================================================================
                        $scope.getOrgImgSource = function(id) {
                            var orgFound = false;
                            if (id.length !== 2) {

                                orgFound = _.find($scope.options.orgs, {
                                    _id: id
                                });
                                if (orgFound) return orgFound.logo;
                            }
                            return 'app/images/ic_business_black_48px.svg';
                        };

                        //=======================================================================
                        //
                        //=======================================================================
                        $scope.getOrgName = function(id) {
                            var orgFound = false;

                            if (id.length === 2) {
                                orgFound = _.find($scope.options.countries, {
                                    _id: id
                                });
                                if (orgFound) return orgFound.title;
                                else
                                    return;

                            } else {
                                orgFound = _.find($scope.options.orgs, {
                                    _id: id
                                });
                                if (orgFound) return orgFound.acronym;


                            }

                        };

                        //=======================================================================
                        //
                        //=======================================================================
                        $scope.submitForm = function(formData) {
                            $scope.submitted = true;
                            switch ($scope.tab) {
                                case 'general':
                                    submitGeneral(formData);
                                    break;
                                case 'logistics':
                                    submitLogistics(formData);
                                    break;
                                case 'orgs':
                                    submitOrgs(formData);
                                    break;

                                case 'contact':
                                    submitContact(formData);
                                    break;
                            }
                        };


                        //=======================================================================
                        //
                        //=======================================================================
                        function loadHostOrgs() {
                            _.each($scope.doc.hostOrgs, function(orgId) {
                                if (!_.find($scope.options.orgs, {
                                        _id: orgId
                                    })) {
                                    mongoStorage.loadDoc('inde-orgs', orgId).then(function(responce) {
                                        if (!_.find($scope.options.orgs, {
                                                _id: orgId
                                            }) && mongoStorage.isPublishable(responce))
                                            $scope.options.orgs.push(responce);
                                    }).catch(onError);
                                }
                            });
                        } //submitGeneral


                        //=======================================================================
                        //
                        //=======================================================================
                        function isOrgPublishable(orgId) {
                            var orgFound = _.find($scope.options.orgs, {
                                _id: orgId
                            });
                            return mongoStorage.isPublishable(orgFound);
                        } //submitGeneral
                        $scope.isOrgPublishable = isOrgPublishable;


                        //=======================================================================
                        //
                        //=======================================================================
                        function isOrgParty(orgId) {
                            var orgFound = _.find($scope.options.orgs, {
                                _id: orgId
                            });
                            return mongoStorage.isOrgParty(orgFound);
                        } //submitGeneral
                        $scope.isOrgParty = isOrgParty;


                        //=======================================================================
                        //
                        //=======================================================================
                        function validateTabs() {
                          var formData = $scope.editForm;
                            $scope.doc.validTabs.general = false;
                            $scope.doc.validTabs.logistics = false;
                            $scope.doc.validTabs.orgs = false;
                            $scope.doc.validTabs.contact = false;

                            if ( formData && formData.title.$valid && formData.description.$valid && formData.subjects.$valid)
                                $scope.doc.validTabs.general = true;

                            if (formData && formData.conference.$valid && formData.expNumPart.$valid && formData.prefDateOne.$valid &&
                                formData.prefTimeOne.$valid && formData.prefDateTwo.$valid && formData.prefTimeTwo.$valid &&
                                formData.prefDateThree.$valid && formData.prefTimeThree.$valid
                            )
                                $scope.doc.validTabs.logistics = true;

                            if (!_.isEmpty($scope.doc.hostOrgs) )
                                $scope.doc.validTabs.orgs = true;

                            var validRows = true;
                            _.each($scope.doc.hostOrgs, function(resOrg, key) {

                                if ((formData['email_' + key].$error.required || formData['email_' + key].$error.pattern || formData['email_' + key].$error.email) && $scope.submitted) {
                                    if (validRows) validRows = false;
                                }

                                if (formData['lastName_' + key].required && $scope.submitted) {
                                    if (validRows) validRows = false;
                                }
                                if($scope.doc.responsibleOrgs[key] && duplicateResponsibleOrgs(formData,$scope.doc.responsibleOrgs[key].email,key))
                                    validRows = false;

                                _.each($scope.doc.hostOrgs, function(resOrg, key) {
                                    if( $scope.doc.responsibleOrgs[key] && !$scope.doc.responsibleOrgs[key].lastName && !$scope.doc.responsibleOrgs[key].email)
                                      $scope.doc.responsibleOrgs[key].sameAs='';
                                });

                                if($scope.doc.responsible && !$scope.doc.responsibleLastName && !$scope.doc.responsibleOrgsEmail)
                                  $scope.doc.responsible.sameAs='';
                            });

                            if(isAdmin())validRows = true;
                            if (formData && formData.firstName.$valid && formData.lastName.$valid && formData.phone.$valid &&
                                formData.city.$valid && formData.country.$valid && formData.emaill.$valid && formData.responsibleLastName.$valid && formData.responsibleEmail.$valid && validRows
                            )
                              $scope.doc.validTabs.contact = true;

                        } //validateTabs
                        $scope.validateTabs = validateTabs;


                        //=======================================================================
                        //
                        //=======================================================================
                        function submitGeneral(formData) {
                            $scope.doc.validTabs.general = false;
                            $scope.doc.validTabs.logistics = false;

                            if (formData.title.$error.required && $scope.submitted)
                                findScrollFocus('editForm.title');

                            if (formData.description.$error.required && $scope.submitted)
                                findScrollFocus('editForm.description');

                            if (formData.subjects.$error.required && $scope.submitted)
                                findScrollFocus('editForm.subjects');

                            if (formData.title.$valid && formData.description.$valid && formData.subjects.$valid) {


                                resetForm(formData, ['title', 'description', 'subjects']);
                                $scope.doc.validTabs.general = true;
                                $scope.tab = 'logistics';
                                $timeout(function() {
                                    $scope.tab = 'logistics';
                                    $('#logistics-tab').tab('show');
                                });
                                if(!$scope.doc.conference)
                                    $scope.doc.conference='56f14b1e49a977d560a27ede';
                                $scope.saveDoc();
                            }
                        } //submitGeneral

                        //=======================================================================
                        //
                        //=======================================================================
                        function goToError(tab,field) {
                            showTab(tab);
                            $scope.focused=false;
                            $timeout(function(){findScrollFocus('editForm.'+field);},500);
                        }
                        $scope.goToError=goToError;

                        //=======================================================================
                        //
                        //=======================================================================
                        function submitLogistics(formData) {

                            $scope.doc.validTabs.logistics = false;
                            var ctrls = ['expNumPart', 'conference', 'prefDateOne', 'prefTimeOne', 'prefDateTwo', 'prefTimeTwo', 'prefDateThree', 'prefTimeThree'];
                            if (formData.conference.$error.required && $scope.submitted) {
                                findScrollFocus('formData.conference');
                                //  return;
                            }
                            if (formData.expNumPart.$error.required && $scope.submitted)
                                findScrollFocus('editForm.expNumPart');

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


                            if (formData.conference.$valid && formData.expNumPart.$valid && formData.prefDateOne.$valid &&
                                formData.prefTimeOne.$valid && formData.prefDateTwo.$valid && formData.prefTimeTwo.$valid &&
                                formData.prefDateThree.$valid && formData.prefTimeThree.$valid
                            ) {
                                $scope.doc.validTabs.logistics = true;
                                $scope.saveDoc();
                                resetForm(formData, ctrls);
                                $scope.doc.validTabs.logistics = true;
                                $timeout(function() {
                                    $scope.tab = 'orgs';
                                    $('#orgs-tab').tab('show');
                                });
                            }
                        } //submitGeneral


                        //=======================================================================
                        //
                        //=======================================================================
                        function submitOrgs(formData) {

                            var ctrls = ['hostOrgs'];
                            $scope.doc.validTabs.orgs = false;
                            if (!$scope.doc.hostOrgs || $scope.doc.hostOrgs.length === 0) {
                                formData.$valid = false;
                            } else {
                                formData.$valid = true;
                            }

                            if (!$scope.doc.hostOrgs || $scope.doc.hostOrgs.length === 0) {

                                if (!$scope.focused)
                                    smoothScroll(document.getElementById('hostOrg-error'));
                                if (!$scope.focused)
                                    $(document.getElementById('editForm.hostOrgs')).focus();
                                $(document.getElementById('editForm.hostOrgs')).addClass('has-error');
                                $(document.getElementById('hostOrg-error')).addClass('has-error-div');
                                $(document.getElementById('hostOrgMsg')).css('display', 'block');
                                $scope.focused = true;
                            } else {

                                resetForm(formData, ctrls);
                                $scope.doc.validTabs.orgs = true;
                                $timeout(function() {
                                    $scope.tab = 'contact';
                                    $('#contact-tab').tab('show');
                                });
                                $scope.saveDoc();
                            }
                        } //submitGeneral

                        //=======================================================================
                        //
                        //=======================================================================
                        function isAdmin(){
                           return (_.intersection(['Administrator', 'IndeAdministrator','IndeAdminNotify'], $scope.me.roles).length > 0);
                        }
                        $scope.isAdmin = isAdmin;

                        //=======================================================================
                        //
                        //=======================================================================
                        function isNeww(){
                           return (((!$scope._id ||  $scope._id==='new' ) || Number($scope.doc.id) > 2292) && moment($scope.doc.meta.status.createdOn).add(1,'day').isAfter());
                        }
                        $scope.isNeww=isNeww;

                        //=======================================================================
                        //
                        //=======================================================================
                        function submitContact(formData) {
                            $scope.doc.validTabs.contact = false;

                            var ctrls = ['firstName', 'lastName', 'phone', 'city', 'country', 'email'];

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
                            if ((formData.emaill.$error.required || formData.emaill.$error.pattern || formData.emaill.$error.email) && $scope.submitted)
                                findScrollFocus('editForm.email');

                            if ((formData.responsibleEmail.$error.required || formData.responsibleEmail.$error.pattern || formData.responsibleEmail.$error.email) && $scope.submitted)
                                findScrollFocus('editForm.responsibleEmail');

                            if ((formData.responsibleLastName.$error.required || formData.responsibleLastName.$error.pattern || formData.responsibleLastName.$error.email) && $scope.submitted)
                                findScrollFocus('editForm.responsibleLastName');

                            var validRows = true;
                            if(!isAdmin())
                            _.each($scope.doc.hostOrgs, function(resOrg, key) {

                                if ((formData['email_' + key].$error.required || formData['email_' + key].$error.pattern || formData['email_' + key].$error.email) && $scope.submitted) {
                                    findScrollFocus('email_' + key);
                                    if (validRows) validRows = false;
                                }

                                if (formData['firstName_' + key].$error.required && $scope.submitted) {
                                    findScrollFocus('firstName_' + key);
                                    if (validRows) validRows = false;
                                }
                                if (formData['lastName_' + key].required && $scope.submitted) {
                                    findScrollFocus('lastName_' + key);
                                    if (validRows) validRows = false;
                                }
                                if($scope.doc.responsibleOrgs[key] && duplicateResponsibleOrgs(formData,$scope.doc.responsibleOrgs[key].email,key))
                                    validRows = false;

                                _.each($scope.doc.hostOrgs, function(resOrg, key) {
                                    if( $scope.doc.responsibleOrgs[key] && !$scope.doc.responsibleOrgs[key].lastName && !$scope.doc.responsibleOrgs[key].email)
                                      $scope.doc.responsibleOrgs[key].sameAs='';
                                });

                                if($scope.doc.responsible && !$scope.doc.responsibleLastName && !$scope.doc.responsibleOrgsEmail)
                                  $scope.doc.responsible.sameAs='';
                            });
                            if(isAdmin())validRows = true;

                            if (formData.firstName.$valid && formData.lastName.$valid && formData.phone.$valid &&
                                formData.city.$valid && formData.country.$valid && formData.emaill.$valid && formData.responsibleLastName.$valid && formData.responsibleEmail.$valid && validRows
                            ) {

                                resetForm(formData, ctrls);
                                $scope.doc.validTabs.contact = true;
                                $timeout(function() {
                                    $scope.tab = 'documents';
                                    $('#documents-tab').tab('show');
                                });
                                $scope.saveDoc();

                            }else{
                               if($scope.doc.validTabs.contact){
                                $scope.doc.validTabs.contact = false;
                                $scope.saveDoc();
                              }
                            }
                        } //submitGeneral


                        //=======================================================================
                        //
                        //=======================================================================
                        function duplicateResponsibleOrgs (formData,email, key){
                            var duplicateFound = false;
                            _.each($scope.doc.hostOrgs, function(resOrg, k) {

                                if($scope.doc.responsibleOrgs[k] && $scope.doc.responsibleOrgs[k].email===email && k!=key)
                                {
                                      formData['email_' + key].$error.duplicate=true;
                                      formData['email_' + key].$invalid=true;
                                      formData.$invalid=true;
                                      findScrollFocus('email_' + key);
                                      duplicateFound = true;
                                }else{
                                  formData['email_' + key].$error.duplicate=false;
                                  formData['email_' + key].$invalid=false;
                                  formData.$invalid=false;
                                }
                            });
                            return duplicateFound;
                        }

                        //=======================================================================
                        //
                        //=======================================================================
                        function validateResponsibleOrgs (){
                          var isValid =true;
                          if(!$scope.doc.responsibleOrgs || _.isEmpty($scope.doc.responsibleOrgs)) isValid =false;
                          _.each($scope.doc.responsibleOrgs, function(resOrg) {
                              if(!resOrg.lastName || !resOrg.email)
                                isValid =false;
                          });
                          return isValid;
                        }


                        //=======================================================================
                        //
                        //=======================================================================
                        function resetForm(formData, ctrlsException) {
                            formData.$rollbackViewValue();
                            formData.$setPristine();
                            _.each(formData, function(ctrl, name) {
                                if ((name.indexOf('$') !== 0) && ctrlsException.indexOf(name) === -1)
                                    ctrl.$setValidity(name, true);
                            });
                        }

                        //=======================================================================
                        //
                        //=======================================================================
                        function isTabsValid() {
                            if (!$scope.doc.validTabs) return false;
                            return ($scope.doc.validTabs.general && $scope.doc.validTabs.logistics && $scope.doc.validTabs.orgs && $scope.doc.validTabs.contact);
                        }
                        $scope.isTabsValid = isTabsValid;


                        //=======================================================================
                        //
                        //=======================================================================
                        function findScrollFocus(id) {
                            if(id==='editForm.description')id='cke_editForm.description';
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
                        $scope.hasError = function() {
                            return !!$scope.error;
                        };
                        //=======================================================================
                        //
                        //=======================================================================
                        $scope.close = function() {
                            history.goBack();
                        };

                        //=======================================================================
                        //
                        //=======================================================================
                        $scope.resubmitWarning= function() {
                            if(!$scope.doc || !$scope.doc.meta) return false;
                            return (($scope.doc.meta.status==='request' || $scope.doc.meta.status==='published') && !isTabsValid());
                        };
                    } //link
            }; //return
        }
    ]);
});