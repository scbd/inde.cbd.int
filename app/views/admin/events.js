define(['app', 'lodash',
    'text!./delete-dialog.html',
    './menu',
    'services/mongo-storage',
    'services/filters',
    'services/dev-router',
    'ngDialog'
], function(app, _, deleteDialog) {

    app.controller("adminEvents", ['$scope', 'adminMenu', '$q', '$http', '$filter', '$route', 'mongoStorage', '$location', '$element', '$timeout', '$window', 'authentication', 'history', 'ngDialog',
        function($scope, dashMenu, $q, $http, $filter, $route, mongoStorage, $location, $element, $timeout, $window, authentication, history, ngDialog) {

            $scope.loading = false;
            $scope.schema = "inde-side-events";
            $scope.createURL = '/manage/events/new';
            $scope.editURL = '/manage/events/';

            $scope.toggle = dashMenu.toggle;
            $scope.sections = dashMenu.getMenu('admin');
            $scope.sectionsOptions = dashMenu.getMenu('adminOptions');



            var sec = _.findWhere($scope.sectionsOptions, {
                name: 'Sort'
            });
            sec.path = sortOrder;
            sec = _.findWhere($scope.sectionsOptions, {
                name: 'Archives'
            });
            sec.path = toggleArchived;
            sec = _.findWhere($scope.sectionsOptions[5].pages, {
                name: 'All'
            });
            sec.path = selectChipAll;
            sec = _.findWhere($scope.sectionsOptions[5].pages, {
                name: 'Drafts'
            });
            sec.path = selectChipDraft;
            sec = _.findWhere($scope.sectionsOptions[5].pages, {
                name: 'Requests'
            });
            sec.path = selectChipRequest;
            sec = _.findWhere($scope.sectionsOptions[5].pages, {
                name: 'Approved'
            });
            sec.path = selectChipApproved;
            sec = _.findWhere($scope.sectionsOptions[5].pages, {
                name: 'Canceled'
            });
            sec.path = selectChipCanceled;
            sec = _.findWhere($scope.sectionsOptions[5].pages, {
                name: 'Rejected'
            });
            sec.path = selectChipRejected;
            sec = _.findWhere($scope.sectionsOptions[6].pages, {
                name: 'Card View'
            });
            sec.path = cardView;
            sec = _.findWhere($scope.sectionsOptions[6].pages, {
                name: 'List View'
            });
            sec.path = listView;
            sec = _.findWhere($scope.sectionsOptions[6].pages, {
                name: 'Detail View'
            });
            sec.path = detailView;


            $scope.sortReverse = 0;
            $scope.listView = 0;
            $scope.showArchived = 0;
            $scope.statusFacits = {};
            $scope.statusFacits.all = 0;
            $scope.statusFacitsArcView = {};
            $scope.statusFacitsArcView.all = 0;
            $scope.selectedChip = {};

            $scope.docs = [];
            var statuses = ['draft', 'published', 'request', 'canceled', 'rejected'];
            var statusesArchived = ['deleted', 'archived'];

            init();


            //=======================================================================
            //
            //=======================================================================
            function init() {

                authentication.getUser().then(function(user) {
                    $scope.selectChip('all');
                    $scope.user = user;
                    $scope.loadList();
                    getFacits();
                });

            } //init


            //============================================================
            //
            //============================================================
            function getFacits() {
                if ($location.absUrl().indexOf('manage') > -1) {
                    mongoStorage.getStatusFacits($scope.schema, statuses, 'all', $scope.user.userID).then(function(facits) {
                        $scope.statusFacits = facits;
                    });
                    mongoStorage.getStatusFacits($scope.schema, statusesArchived, 'archived', $scope.user.userID).then(function(arcFacits) {
                        $scope.statusFacitsArcView = arcFacits;
                    });
                } else {
                    mongoStorage.getStatusFacits($scope.schema, statuses, 'all').then(function(facits) {
                        $scope.statusFacits = facits;
                    });
                    mongoStorage.getStatusFacits($scope.schema, statusesArchived, 'archived').then(function(arcFacits) {
                        $scope.statusFacitsArcView = arcFacits;
                    });
                }
            }


            //============================================================
            //
            //============================================================
            $scope.isAdmin = function() {

                return _.intersection($scope.user.roles, ['Administrator', 'IndeAdministrator']).length > 0;
            };


            //============================================================
            //
            //============================================================
            $scope.statusFilter = function(doc) {
                if (doc.meta.status === $scope.selectedChip)
                    return doc;
                else if ($scope.selectedChip === 'all' || $scope.selectedChip === '')
                    return doc;
            };


            //============================================================
            //
            //============================================================
            function sortOrder() {

                $scope.sortReverse = !$scope.sortReverse;

                $scope.toggle('adminOptions');
            }


            //============================================================
            //
            //============================================================
            $scope.customSearch = function(doc) {

                if (!$scope.search || $scope.search == ' ' || $scope.search.length <= 2) return true;
                var temp = JSON.stringify(doc);

                return (temp.toLowerCase().indexOf($scope.search.toLowerCase()) >= 0);

            };


            //============================================================
            //
            //============================================================
            $scope.deleteDial = function(doc) {

                var dialog = ngDialog.open({
                    template: deleteDialog,
                    className: 'ngdialog-theme-default',
                    closeByDocument: false,
                    plain: true,
                    scope: $scope
                });

                dialog.closePromise.then(function(ret) {
                    if (ret.value === 'no') $scope.close();
                    if (ret.value === 'yes') $scope.deleteDoc(doc);
                });
            };


            //=======================================================================
            //
            //=======================================================================
            $scope.approveDoc = function(docObj) {
                docObj.meta.status = 'published';
                mongoStorage.approveDoc($scope.schema, cleanDoc(docObj), docObj._id).then(function() {
                    _.each(docObj.hostOrgs, function(org) {
                        mongoStorage.loadDoc('inde-orgs', org).then(function(conf) {
                            if (conf.meta.status !== 'published')
                                mongoStorage.approveDoc('inde-orgs', conf, conf._id);
                        });
                        getFacits();
                        //$scope.loadList ();
                    });
                });
            }; // archiveOrg


            //=======================================================================
            //
            //=======================================================================
            $scope.cancelDoc = function(docObj) {
                docObj.meta.status = 'canceled';
                mongoStorage.cancelDoc($scope.schema, cleanDoc(docObj), docObj._id).then(function() {
                    getFacits();
                });
            }; // archiveOrg


            //=======================================================================
            //
            //=======================================================================
            $scope.rejectDoc = function(docObj) {
                docObj.meta.status = 'rejected';
                mongoStorage.rejectDoc($scope.schema, cleanDoc(docObj), docObj._id).then(function() {
                    getFacits();
                });
            }; // archiveOrg


            //=======================================================================
            //
            //=======================================================================
            $scope.toTitleCase = function(str) {
                return str.replace(/\w+/g, function(txt) {
                    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
                });
            };


            //=======================================================================
            //
            //=======================================================================
            function archiveList() {
                return  $q.all([loadOrgs(), loadConfrences()]).then(function() {


                    var loadDocsFunc = mongoStorage.loadArchives;

                    if ($location.absUrl().indexOf('manage') > -1)
                        loadDocsFunc = mongoStorage.loadOwnerArchives;

                    loadDocsFunc($scope.schema).then(function(response) {
                        $scope.docs = response.data;
                        _.each($scope.docs, function(doc) {
                            doc.orgs = [];
                            var foundOrg;
                            _.each(doc.hostOrgs, function(org) {
                                foundOrg = _.find($scope.orgs, {
                                    _id: org
                                });
                                if (foundOrg)
                                    doc.orgs.push(foundOrg);
                            });
                        });
                    });

                });
            } // archiveOrg

            //=======================================================================
            //
            //=======================================================================
            function selectChip(chip) {
                $element.find('.chip').removeClass('chip-active');
                $element.find('#chip-' + chip).addClass('chip-active');

                if (chip === 'all')
                    $scope.selectedChip = '';
                else
                    $scope.selectedChip = chip;
            } // archiveOrg
            $scope.selectChip = selectChip;


            //=======================================================================
            //
            //=======================================================================
            $scope.searchToggle = function() {
                var serEl = $element.find('.search');
                serEl.toggleClass('search-expanded');
                serEl.focus();
                var serElb = $element.find('.search-btn');
                serElb.toggleClass('search-btn-expanded');

                $scope.sOpen = !$scope.sOpen;
                $scope.search = '';
            }; // archiveOrg


            //============================================================
            //
            //============================================================
            function loadOrgs() {
                return mongoStorage.loadOrgs().then(function(orgs) {
                    $scope.orgs = orgs;
                });
            }


            //==============================
            //
            //==============================
            function loadConfrences() {

                return $http.get('/api/v2016/conferences?s={"StartDate":1}', {
                    cache: true
                }).then(function(conf) {
                    $scope.conferences = conf.data;

                }).then(function() {
                    _.each($scope.conferences, function(conf, key) {
                        var oidArray = [];
                        if (!_.isArray(conf.MajorEventIDs)) conf.MajorEventIDs = [];

                        _.each(conf.MajorEventIDs, function(id) {
                            oidArray.push({
                                '$oid': id
                            });
                        });

                        $http.get("/api/v2016/meetings", {
                            params: {
                                q: {
                                    _id: {
                                        $in: oidArray
                                    }
                                }
                            }
                        }, {
                            cache: true
                        }).then(function(m) {
                            $scope.conferences[key].meetings = m.data;

                        });
                    });

                });
            }


            //=======================================================================
            //
            //=======================================================================
            $scope.loadList = function() {


                $q.all([loadOrgs(), loadConfrences()]).then(function() {

                    var loadDocsFunc = mongoStorage.loadDocs;

                    if ($location.absUrl().indexOf('manage') > -1)
                        loadDocsFunc = mongoStorage.loadOwnerDocs;

                    loadDocsFunc($scope.schema, ['draft', 'published', 'request', 'canceled', 'rejected']).then(function(response) {
                        $scope.docs = response.data;
                        _.each($scope.docs, function(doc) {
                            doc.orgs = [];
                            var foundOrg;
                            loadHostOrgs(doc).then(function(){
                              _.each(doc.hostOrgs, function(org) {
                                  foundOrg = _.find($scope.orgs, {
                                      _id: org
                                  });
                                  if (foundOrg)
                                      doc.orgs.push(foundOrg);
                              });
                            });

                            doc.conferenceObj = _.find($scope.conferences, {
                                '_id': doc.conference
                            });

                            doc.meetingObjs = [];
                            _.each(doc.meetings, function(meeting) {
                                doc.meetingObjs.push(_.find(doc.conferenceObj.meetings, {
                                    '_id': meeting
                                }));
                            });

                        });

                    }).then(function() {
                        var srch = $location.search();
                        if (!_.isEmpty(srch)) {
                            if (srch.chip === 'archived') {
                                $scope.showArchived = !$scope.showArchived;
                                mongoStorage.getStatusFacits($scope.schema, $scope.statusFacitsArcView, statusesArchived);
                                archiveList().then(function() {
                                    selectChip(srch.chip);
                                });
                            } else
                                $timeout(function() {
                                    selectChip(srch.chip);
                                }, 1000);
                        } else {
                            $timeout(function() {
                                selectChip('all');
                            }, 1000);
                        }
                    });
                });
            }; // archiveOrg

            //=======================================================================
            //
            //=======================================================================
            function loadHostOrgs(doc) {
                return $q(function(resolve, reject) {
                    if (_.isEmpty(doc.hostOrgs)) resolve(true);
                    _.each(doc.hostOrgs, function(orgId) {
                        if (!_.find($scope.orgs, {
                                _id: orgId
                            })) {
                            mongoStorage.loadDoc('inde-orgs', orgId).then(function(responce) {
                                if (!_.find($scope.orgs, {
                                        _id: orgId
                                    }) && mongoStorage.isPublishable(responce))
                                    $scope.orgs.push(responce);
                                    resolve(true);
                            }).catch(function(){
                              reject(false);
                            });
                        } else
                            resolve(true);

                    });
                });
            } //submitGeneral

            //=======================================================================
            //
            //=======================================================================
            function cleanDoc(doc) {
                var cDoc = _.cloneDeep(doc);
                delete(cDoc.orgs);
                delete(cDoc.confrenceObj);
                return cDoc;
            } //toggleListView


            //=======================================================================
            //
            //=======================================================================
            function toggleListView() {
                $timeout(function() {
                    if ($scope.listView === 0)
                        $scope.listView = 1;
                    else
                        $scope.listView = 0;
                });

            } //toggleListView
            $scope.toggleListView = toggleListView;


            //=======================================================================
            //
            //=======================================================================
            function listView() {
                $scope.listView = 0;
                $scope.toggle('adminOptions');
            } //toggleListView


            //=======================================================================
            //
            //=======================================================================
            function cardView() {
                $scope.listView = 1;
                $scope.toggle('adminOptions');
            } //toggleListView


            //=======================================================================
            //
            //=======================================================================
            function detailView() {
                $scope.listView = 2;
                $scope.toggle('adminOptions');
            } //toggleListView


            //=======================================================================
            //
            //=======================================================================
            $scope.archiveDoc = function(docObj) {
                docObj.meta.status = 'archived';
                mongoStorage.archiveDoc($scope.schema, cleanDoc(docObj), docObj._id).then(function() {
                    _.remove($scope.docs, function(obj) {
                        return obj._id === docObj._id;
                    });
                    getFacits();
                });
            }; // archiveOrg


            //=======================================================================
            //
            //=======================================================================
            $scope.deleteDoc = function(docObj) {
                docObj.meta.status = 'deleted';
                return mongoStorage.deleteDoc($scope.schema, cleanDoc(docObj), docObj._id).then(function() {
                    _.remove($scope.docs, function(obj) {
                        return obj._id === docObj._id;
                    });
                    getFacits();
                });
            }; // archiveOrg


            //=======================================================================
            //
            //=======================================================================
            $scope.unArchiveDoc = function(docObj) {
                docObj.meta.status = 'draft';
                mongoStorage.unArchiveDoc($scope.schema, cleanDoc(docObj), docObj._id).then(function() {
                    _.remove($scope.docs, function(obj) {
                        return obj._id === docObj._id;
                    });
                    getFacits();
                });
            }; // archiveOrg


            //=======================================================================
            //
            //=======================================================================
            $scope.goTo = function(url) {
                $location.url(url);
            }; // archiveOrg


            //=======================================================================
            //
            //=======================================================================
            $scope.edit = function(id) {
                $location.url($scope.editURL + id);
            }; // archiveOrg


            //=======================================================================
            //
            //=======================================================================
            function selectChipAll() {
                selectChip('all');
                $scope.toggle('adminOptions');
            } // archiveOrg


            //=======================================================================
            //
            //=======================================================================
            function selectChipRejected() {
                selectChip('rejected');
                $scope.toggle('adminOptions');
            } // archiveOrg


            //=======================================================================
            //
            //=======================================================================
            function selectChipDraft() {
                selectChip('draft');
                $scope.toggle('adminOptions');
            } // archiveOrg


            //=======================================================================
            //
            //=======================================================================
            function selectChipRequest() {
                selectChip('request');
                $scope.toggle('adminOptions');
            } // archiveOrg


            //=======================================================================
            //
            //=======================================================================
            function selectChipApproved() {
                selectChip('published');
                $scope.toggle('adminOptions');
            } // archiveOrg


            //=======================================================================
            //
            //=======================================================================
            function selectChipCanceled() {
                selectChip('canceled');
                $scope.toggle('adminOptions');
            } // archiveOrg


            //=======================================================================
            //
            //=======================================================================
            function toggleArchived() {
                $timeout(function() {
                    if (!$scope.showArchived) {
                        getFacits();
                        archiveList();
                    } else {
                        getFacits();
                        $scope.loadList();
                    }

                    $scope.showArchived = !$scope.showArchived;


                    $scope.toggle('adminOptions');
                    selectChip('archived');
                });
                $timeout(function() {

                    if ($scope.selectedChip === 'archived')
                        $scope.selectedChip = 'all';
                    else
                        $scope.selectedChip = 'archived';

                }, 500);

            } // archiveOrg


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
        }
    ]);

});