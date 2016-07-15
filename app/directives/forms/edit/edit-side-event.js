define(['app', 'lodash',
    'text!./edit-side-event.html',
    'moment',
    'text!directives/forms/edit/publish-dialog.html',
    'rangy-core',
    'text!directives/forms/edit/dirty-form.html',
    'directives/side-menu/scbd-side-menu',
    'directives/km-select',
    'directives/forms/controls/scbd-select-list',
    'services/mongo-storage',
    'directives/forms/controls/scbd-file-upload',
    './edit-organization',
    './edit-link',
    'directives/link-list',
    'services/theasarus', 'ngDialog', 'ngSmoothScroll',
], function(app, _, template, moment, dialogTemplate, rangy) {
    app.directive("editSideEvent", ['scbdMenuService', '$q', '$http', '$filter', '$route', 'mongoStorage', '$location', 'authentication', '$window', 'ngDialog', '$compile', '$timeout', 'smoothScroll', 'history', '$rootScope', 'Thesaurus', //"$http", "$filter", "Thesaurus",
        function(scbdMenuService, $q, $http, $filter, $route, mongoStorage, $location, auth, $window, ngDialog, $compile, $timeout, smoothScroll, history, $rootScope, Thesaurus) {
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

                        $scope.loading = false;
                        $scope.schema = "inde-side-events";
                        $scope.showOrgForm = 0;
                        $scope.isNew = true;
                        $scope.registerAlert = true;
                        $scope.doc = {};
                        $scope.doc.hostOrgs = [];
                        $scope.updateProfile = 'No';
                        $scope.ignoreDirtyCheck = false;
                        $scope.tab = 'general';
                        $scope.document = {};

                        $scope.patterns = {
                            facebook: /^http[s]?:\/\/(www.)?facebook.com\/.+/i,
                            twitter: /^http[s]?:\/\/twitter.com\/.+/i,
                            youtube: /^http[s]?:\/\/(www.)?youtube.com\/user\/.+/i,
                            phone: /^\+\d+(\d|\s|-|ext|#|\*)+$/i,
                            time: /^([0-1][0-9]|2[0-3]|[0-9]):[0-5][0-9]$/,
                            email: /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i
                        };
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
                                  if(validateResponsibleOrgs())
                                    $scope.doc.validTabs.contact=true;
                                }

                            }
                        }, true);


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

                            }).catch(function onerror(response) {
                                $scope.onError(response);
                            });
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

                                if (ret.value == 'draft') $scope.saveDoc().then(function() {
                                    $scope.close();
                                });
                                if (ret.value == 'publish') $scope.requestPublish().then(function() {
                                    $scope.close();
                                }).catch(function onerror(response) {

                                    $scope.onError(response);

                                });

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
                                    });
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
                            return mongoStorage.save($scope.schema, $scope.doc, $scope._id).then(function() {

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
                            });
                        };
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
                            });
                        }

                        function loadOrgs() {
                            return mongoStorage.loadOrgs().then(function(orgs) {
                                $scope.options.orgs = orgs;
                            });
                        }
                        //============================================================
                        //
                        //============================================================
                        function init() {
                            rangy.init();
                            window.rangy = rangy;

                            $scope.editIndex = false;

                            $q.all([loadUser(), loadCountries(), loadOrgs(),loadConferences()]).then(function() {
                                if ($scope._id !== '0' && $scope._id !== 'new') {

                                    if (($scope._id.search('^[0-9A-Fa-f]{24}$') < 0))
                                        $location.url('/404');
                                    else
                                        mongoStorage.loadDoc($scope.schema, $scope._id).then(function(document) {

                                            $scope.loading = true;
                                            $scope._id = document._id;
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
                                            if (!$scope.doc.publications) $scope.doc.publications = [];
                                            if (!$scope.doc.images) $scope.doc.images = [];
                                            if (!$scope.doc.links) $scope.doc.links = [];
                                            if (!$scope.doc.videos) $scope.doc.videos = [];
                                            if(_.isArray($scope.doc.hostOrgs))
                                              numHostOrgs = $scope.doc.hostOrgs.length;
                                            else
                                                numHostOrgs = 0;

                                        }).catch(function onerror(response) {

                                            $scope.onError(response);

                                        });
                                } else {

                                    mongoStorage.createDoc($scope.schema).then(
                                        function(document) {
                                            $scope.conferenceId = $route.current.params.c;
                                            $scope.loading = true;
                                            $scope._id = document._id;
                                            $scope.id = document.id;
                                            $scope.doc = document;
                                            $scope.doc.logo = $scope.doc.logo = 'app/images/ic_event_black_48px.svg';
                                            initProfile(true);
                                            $scope.doc.conference = $scope.conferenceId;
                                            $scope.doc.validTabs = {
                                                'general': false,
                                                'logistics': false,
                                                'orgs': false,
                                                'contact': false
                                            };
                                            $scope.isNew = true;
                                            if (!$scope.doc.hostOrgs) $scope.doc.hostOrgs = [];
                                            if (!$scope.doc.publications) $scope.doc.publications = [];
                                            if (!$scope.doc.images) $scope.doc.images = [];
                                            if (!$scope.doc.links) $scope.doc.links = [];
                                            if (!$scope.doc.videos) $scope.doc.videos = [];
                                            $scope.$emit('showSuccess', 'Side Event ' + $scope.id + ' Created and Saved as Draft');
                                        }
                                    ).catch(function onerror(response) {
                                        $scope.onError(response);
                                    }).then(function(){
                                      if($location.search().c)
                                      _.each($scope.options.conferences, function(conf) {
                                          if (conf._id === $location.search().c)
                                              conf.selected = true;
                                          else
                                              conf.selected = false;
                                          $scope.doc.conference=conf._id;
                                      });
                                      else{
                                        $scope.doc.conference=$scope.options.conferences[0]._id;
                                        $scope.options.conferences[0].selected=true;
                                      }
                                    });
                                }
                            }); // load orgs
                        } // init


                        //============================================================
                        //
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
                        //
                        //============================================================
                        $scope.toggleIcon = function() {
                            if ($scope.doc.logo === 'app/images/ic_event_black_48px.svg')
                                $scope.doc.logo = '';
                            else
                                $scope.doc.logo = 'app/images/ic_event_black_48px.svg';
                        };


                        //============================================================
                        //
                        //============================================================
                        $scope.options = {
                            subjects: $http.get("/api/v2013/thesaurus/domains/CBD-SUBJECTS/terms", {
                                cache: true
                            }).then(function(o) {
                                return Thesaurus.buildTree(o.data);
                            })


                        };


                        //=======================================================================
                        //
                        //=======================================================================
                        function loadCountries() {
                            return mongoStorage.getCountries().then(function(o) {
                                $scope.options.countries = $filter("orderBy")(o, "name.en");
                                return $scope.options.countries;
                            }).catch(function onerror(response) {
                                $scope.onError(response);
                            });
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
                            if (!$scope.doc.id) {
                                return mongoStorage.save($scope.schema, $scope.doc, $scope._id).then(function() {
                                    $scope.$emit('showSuccess', 'New Side Event ' + $scope.doc.id + ' Created and Saved as Draft');
                                }).catch(function onerror(response) {
                                    $scope.onError(response);
                                });
                            } else
                                return mongoStorage.save($scope.schema, $scope.doc, $scope._id).then(function() {
                                    $scope.$emit('showSuccess', 'Side Event ' + $scope.doc.id + ' Saved as Draft');
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
                        $scope.getOrgImgSource = function(id) {
                            var orgFound = false;
                            if (id.length !== 2) {

                                orgFound = _.find($scope.options.orgs, {
                                    _id: id
                                });
                                if (orgFound) return orgFound.logo;
                                else
                                    return;

                            }
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

                                    });
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
                        function submitGeneral(formData) {
                            $scope.doc.validTabs.general = false;
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

                            var validRows = true;
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
                            });

                            if (formData.firstName.$valid && formData.lastName.$valid && formData.phone.$valid &&
                                formData.city.$valid && formData.country.$valid && formData.emaill.$valid && validRows
                            ) {

                                resetForm(formData, ctrls);
                                $scope.doc.validTabs.contact = true;
                                $timeout(function() {
                                    $scope.tab = 'documents';
                                    $('#documents-tab').tab('show');
                                });
                                $scope.saveDoc();
                            }
                        } //submitGeneral


function validateResponsibleOrgs (){
  var isValid =true;
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
                            } else if (res.data && res.data.Message)
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