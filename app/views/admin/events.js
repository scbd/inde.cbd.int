define(['app', 'lodash',
    'text!./delete-dialog.html',
    './menu',
    'services/mongo-storage',
    'services/filters',
    'services/dev-router',
    'ngDialog',
    'directives/mobi-menu'
], function(app, _, deleteDialog) {

    app.controller("adminEvents", ['$scope', 'adminMenu', '$q', '$http', 'mongoStorage', '$location', '$element', '$timeout', 'authentication', 'history', 'ngDialog',
        function($scope, dashMenu, $q, $http, mongoStorage, $location, $element, $timeout, authentication, history, ngDialog) {

            $scope.loading = true;
            $scope.schema = "inde-side-events";
            $scope.selectedChip = 'all';
            $scope.docs = [];


            init();


            //=======================================================================
            //
            //=======================================================================
            function init() {
                initSlideMenu();
                authentication.getUser().then(function(user) {
                    $scope.selectChip('all');
                    $scope.user = user;
                    $scope.loadList()
                        .then(getFacits);
                });

            } //init


            //=======================================================================
            //
            //=======================================================================
            function initSlideMenu() {

                $scope.menu = dashMenu.getMenu('adminOptions');
                $scope.toggle = dashMenu.toggle;

                dashMenu.setPathOfLink($scope.menu, 'Sort', sortOrder);
                dashMenu.setPathOfLink($scope.menu, 'Archives', toggleArchived);
                dashMenu.setPathOfLink($scope.menu, 'All', function() {
                    selectChip('all');
                });
                dashMenu.setPathOfLink($scope.menu, 'Drafts', function() {
                    selectChip('draft');
                });
                dashMenu.setPathOfLink($scope.menu, 'Requests', function() {
                    selectChip('request');
                });
                dashMenu.setPathOfLink($scope.menu, 'Under Review', function() {
                    selectChip('approved');
                });
                dashMenu.setPathOfLink($scope.menu, 'Canceled', function() {
                    selectChip('canceled');
                });
                dashMenu.setPathOfLink($scope.menu, 'Rejected', function() {
                    selectChip('rejected');
                });
                dashMenu.setPathOfLink($scope.menu, 'List View', listView);
            }


            //============================================================
            //
            //============================================================
            function setLoading($last) {

                $timeout(function() {
                    $scope.loading = !$last;
               });
            }
            $scope.setLoading = setLoading;


            //============================================================
            //
            //============================================================
            function getFacits(time) {
                var statuses = ['draft', 'published', 'request', 'canceled', 'rejected', 'archived'];
                $timeout(function() {
                    if ($location.absUrl().indexOf('manage') > -1) {
                        mongoStorage.getStatusFacits($scope.schema, statuses, $scope.user.userID).then(function(facits) {
                            $scope.statusFacits = facits;
                        }).catch(onError);
                    } else {
                        mongoStorage.getStatusFacits($scope.schema, statuses).then(function(facits) {
                            $scope.statusFacits = facits;
                        }).catch(onError);
                    }
                }, time);
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
                else if (!$scope.selectedChip || $scope.selectedChip === 'all' || $scope.selectedChip === '' )
                    return doc;
            };


            //============================================================
            //
            //============================================================
            function sortOrder() {
                $scope.sortReverse = !$scope.sortReverse;
                $scope.toggle('adminOrgOptions');
            }


            //============================================================
            //
            //============================================================
            $scope.customSearch = function(doc) {
                if (!$scope.search || $scope.search == ' ' || $scope.search.length <= 2)
                    return true;

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

                    });
                    $scope.$emit('showSuccess', 'Side Event #' + docObj.id + ' is now Under Review');
                    getFacits(1000);
                }).catch(onError);
            }; // archiveOrg


            //=======================================================================
            //
            //=======================================================================
            $scope.cancelDoc = function(docObj) {
                docObj.meta.status = 'canceled';
                mongoStorage.cancelDoc($scope.schema, cleanDoc(docObj), docObj._id)
                    .then(function() {
                        $scope.$emit('showSuccess', 'Side Event #' + docObj.id + ' is now canceled');
                        getFacits(1000);
                    }).catch(onError);
            }; // archiveOrg


            //=======================================================================
            //
            //=======================================================================
            $scope.rejectDoc = function(docObj) {
                docObj.meta.status = 'rejected';
                mongoStorage.rejectDoc($scope.schema, cleanDoc(docObj), docObj._id)
                    .then(function() {
                        $scope.$emit('showSuccess', 'Side Event #' + docObj.id + ' is now Rejected');
                        getFacits(1000);
                    }).catch(onError);
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
                return $q.all([loadOrgs(), loadConfrences()]).then(function() {


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

                if ( !chip || chip === 'all' || chip==='chip')
                    $scope.selectedChip = '';
                else
                    $scope.selectedChip = chip;
            } // selectChip
            $scope.selectChip = selectChip;


            //=======================================================================
            //
            //=======================================================================
            function isLoading() {
                return $scope.loading;
            } // archiveOrg
            $scope.isLoading = isLoading;


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
                $scope.loading = true;

                return $q.all([loadOrgs(), loadConfrences()]).then(function() {
                    var srch = $location.search();
                    if (!_.isEmpty(srch)) {
                        if (srch.chip === 'archived')
                            toggleArchived();
                        else
                            $timeout(function() {
                                selectChip(srch.chip);
                            }, 10);
                    } else {
                        $timeout(function() {
                            selectChip('all');
                        }, 1000);
                    }
                    var loadDocsFunc = mongoStorage.loadDocs;

                    if ($location.absUrl().indexOf('manage') > -1)
                        loadDocsFunc = mongoStorage.loadOwnerDocs;

                    loadDocsFunc($scope.schema, ['draft', 'published', 'request', 'canceled', 'rejected']).then(function(response) {
                        $scope.docs = response.data;
                        _.each($scope.docs, function(doc) {
                            doc.orgs = [];
                            var foundOrg;
                            loadHostOrgs(doc).then(function() {
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

                    });
                });
            }; // archiveOrg


            //=======================================================================
            //
            //=======================================================================
            function loadHostOrgs(doc) {
                return $q.all([loadOrgs()]).then(function() {
                    _.each(doc.hostOrgs, function(orgId) {
                        if (!_.find($scope.orgs, {
                                _id: orgId
                            })) {
                            mongoStorage.loadDoc('inde-orgs', orgId).then(function(responce) {
                              if (!_.find($scope.orgs, {
                                      _id: orgId
                                  }) && mongoStorage.isPublishable(responce))
                                $scope.orgs.push(responce);

                            }).catch(onError);
                        }

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
            } //listView


            //=======================================================================
            //
            //=======================================================================
            $scope.archiveDoc = function(docObj) {
                mongoStorage.archiveDoc($scope.schema, cleanDoc(docObj), docObj._id).then(function() {
                    _.remove($scope.docs, function(obj) {
                        return obj._id === docObj._id;
                    });
                    $scope.$emit('showSuccess', 'Side Event #' + docObj.id + ' is now archived');
                    getFacits(1000);
                }).catch(onError);
            }; // archiveDoc


            //=======================================================================
            //
            //=======================================================================
            $scope.deleteDoc = function(docObj) {
                return mongoStorage.deleteDoc($scope.schema, cleanDoc(docObj), docObj._id).then(function() {
                    _.remove($scope.docs, function(obj) {
                        return obj._id === docObj._id;
                    });
                    $scope.$emit('showSuccess', 'Side Event #' + docObj.id + ' is deleted permanently');
                    getFacits(1000);
                }).catch(onError);
            }; // deleteDoc


            //=======================================================================
            //
            //=======================================================================
            $scope.unArchiveDoc = function(docObj) {
                mongoStorage.unArchiveDoc($scope.schema, cleanDoc(docObj), docObj._id).then(function() {
                    _.remove($scope.docs, function(obj) {
                        return obj._id === docObj._id;
                    });
                    $scope.$emit('showSuccess', 'Side Event #' + docObj.id + ' is unarchived and saved as a draft');
                    getFacits(1000);
                }).catch(onError);
            }; //unArchiveDoc


            //=======================================================================
            //
            //=======================================================================
            $scope.goTo = function(url) {
                $location.url(url);
            }; //goTo


            //=======================================================================
            //
            //=======================================================================
            $scope.edit = function(id) {
                $location.url('/manage/events/' + id);
            }; //edit


            //=======================================================================
            //
            //=======================================================================
            function toggleArchived() {
                $scope.showArchived = !$scope.showArchived;
                selectChip('archived');
                archiveList();
                if (dashMenu.isOpen('adminOptions'))
                    $scope.toggle('adminOptions');
            } //toggleArchived


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
                } else if (res.data.Message)
                    $scope.error = res.data.Message;
                else
                    $scope.error = res.data;
            }
            $scope.onError=onError;


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