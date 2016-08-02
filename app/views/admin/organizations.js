define(['app', 'lodash',
    'text!./delete-dialog.html',
    'directives/side-menu/scbd-side-menu',
    './menu-orgs',
    'services/mongo-storage',
    'services/filters',
    'ngDialog',
    'directives/mobi-menu'
], function(app, _, deleteDialog) {

    app.controller("adminOrganizations", ['$scope', 'adminOrgMenu', '$q', '$http', '$filter', '$route', 'mongoStorage', '$location', '$element', '$timeout', '$window', 'authentication', 'history', 'ngDialog', //"$http", "$filter", "Thesaurus",
        function($scope, dashMenu, $q, $http, $filter, $route, mongoStorage, $location, $element, $timeout, $window, authentication, history, ngDialog) { //, $http, $filter, Thesaurus


            $scope.loading = true;
            $scope.schema = "inde-orgs";
            $scope.selectedChip = 'all';
            $scope.docs = [];

            init();


            //=======================================================================
            //
            //=======================================================================
            function init() {
              initSlideMenu() ;
                authentication.getUser().then(function(u) {
                    $scope.selectChip('all');
                    $scope.user = u;
                    $scope.loadList().catch(onError);
                    getFacits();
                });
            } //init


            //=======================================================================
            //
            //=======================================================================
            function initSlideMenu() {

                $scope.menu = dashMenu.getMenu('adminOrgOptions');
                $scope.toggle = dashMenu.toggle;

                dashMenu.setPathOfLink($scope.menu, 'Sort', sortOrder);
                dashMenu.setPathOfLink($scope.menu, 'Organizations', toggleArchived);
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



            //=======================================================================
            //
            //=======================================================================
            function getFacits(time) {
              var statuses = ['draft', 'published', 'request', 'canceled', 'rejected', 'archived'];
              return $timeout(function(){ // time out prevent an additional call for facits as they are force updated by save
                if ($location.absUrl().indexOf('manage') > -1) {
                    return mongoStorage.getStatusFacits($scope.schema, statuses, $scope.user.userID).then(function(facits) {
                        $scope.statusFacits = facits;
                    }).catch(onError);
                } else {
                    return mongoStorage.getStatusFacits($scope.schema, statuses).then(function(facits) {
                        $scope.statusFacits = facits;
                    }).catch(onError);
                }
              },time);
            }

            //=======================================================================
            //
            //=======================================================================
            $scope.isAdmin = function() {

                return _.intersection($scope.user.roles, ['Administrator', 'IndeAdministrator']).length > 0;
            };


            //=======================================================================
            //
            //=======================================================================
            function cleanDoc(doc) {
                var cDoc = _.cloneDeep(doc);
                delete(cDoc.contact);
                return cDoc;
            } //toggleListView


            //=======================================================================
            //
            //=======================================================================
            $scope.statusFilter = function(doc) {
                if (doc.meta.status === $scope.selectedChip)
                    return doc;
                else if ($scope.selectedChip === 'all' || $scope.selectedChip === '')
                    return doc;
            };


            //=======================================================================
            //
            //=======================================================================
            function sortOrder() {
                $scope.sortReverse = !$scope.sortReverse;
                $scope.toggle('orgOptions');
            }


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
                    if (ret.value === 'yes') $scope.deleteDoc(doc).then($scope.close);
                });
            };


            //=======================================================================
            //
            //=======================================================================
            $scope.customSearch = function(doc) {

                if (!$scope.search || $scope.search == ' ' || $scope.search.length <= 2) return true;
                var temp = JSON.stringify(doc);

                return (temp.toLowerCase().indexOf($scope.search.toLowerCase()) >= 0);
            };


            //=======================================================================
            //
            //=======================================================================
            $scope.approveDoc = function(docObj) {
                docObj.meta.status = 'published';
                mongoStorage.approveDoc($scope.schema, cleanDoc(docObj), docObj._id).then(function() {
                    getFacits(1000);
                }).catch(onError);
            }; // approveDoc


            //=======================================================================
            //
            //=======================================================================
            $scope.cancelDoc = function(docObj) {
                docObj.meta.status = 'canceled';
                mongoStorage.cancelDoc($scope.schema, cleanDoc(docObj), docObj._id).then(function() {
                    getFacits(1000);
                }).catch(onError);
            }; // cancelDoc


            //=======================================================================
            //
            //=======================================================================
            $scope.rejectDoc = function(docObj) {
                docObj.meta.status = 'rejected';
                mongoStorage.rejectDoc($scope.schema, cleanDoc(docObj), docObj._id).then(function() {
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
                var loadDocsFunc = mongoStorage.loadArchives;

                if ($location.absUrl().indexOf('manage') > -1)
                    loadDocsFunc = mongoStorage.loadOwnerArchives;

                return loadDocsFunc($scope.schema).then(function(response) {
                    $scope.docs = response.data;
                }).catch(onError);
            } // archiveOrg


            //=======================================================================
            //
            //=======================================================================
            function selectChip(chip) {
                $element.find('.chip').removeClass('chip-active');
                $element.find('#chip-' + chip).addClass('chip-active');

                if (!chip || chip === 'all' || chip === '' )
                    $scope.selectedChip = '';
                else
                    $scope.selectedChip = chip;
            } // archiveOrg
            $scope.selectChip = selectChip;


            //=======================================================================
            //
            //=======================================================================
            $scope.loadList = function() {
                $scope.loading=true;
                var loadDocsFunc = mongoStorage.loadDocs;

                if ($location.absUrl().indexOf('manage') > -1)
                    loadDocsFunc = mongoStorage.loadOwnerDocs;

                return loadDocsFunc($scope.schema, ['draft', 'published', 'request', 'canceled', 'rejected']).then(function(response) {
                    $scope.docs = response.data;

                    if ($scope.isAdmin)
                        _.each($scope.docs, function(doc) {

                            $http.get('/api/v2013/users/' + doc.meta.createdBy, {
                                cache: true
                            }).then(function onsuccess(response) {
                                doc.contact = response.data;
                            }).catch(onError);
                        });
                          $scope.loading=false;
                }).then(function() {
                    var srch = $location.search();
                    if (!_.isEmpty(srch)) {
                        if (srch.chip === 'archived') {
                            $scope.showArchived = !$scope.showArchived;
                            getFacits(1000);
                            archiveList().then(function() {
                                $timeout(function() {
                                  $scope.loading=false;
                                    selectChip(srch.chip);
                                }, 1000).catch(onError);
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
                }).catch(onError);
            }; // loadList


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
                $scope.toggle('orgOptions');
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
                    getFacits(1000);
                }).catch(onError);

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
                    getFacits(1000);
                }).catch(onError);

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
                    getFacits(1000);
                }).catch(onError);
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
            }; //


            //=======================================================================
            //
            //=======================================================================
            function toggleArchived() {
                $timeout(function() {
                    if (!$scope.showArchived) {
                        selectChip('archived');
                        getFacits(1000);
                        archiveList().catch(onError);
                    } else {
                        selectChip('all');
                        getFacits(1000);
                        $scope.loadList().catch(onError);
                    }

                    $scope.showArchived = !$scope.showArchived;


                    $scope.toggle('adminOrgOptions');
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
            function onError(res)  {

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