define(['app', 'lodash',
    'text!./delete-dialog.html',
    'directives/side-menu/scbd-side-menu',
    './menu-orgs',
    'services/mongo-storage',
    'services/filters',
    'ngDialog'
], function(app, _, deleteDialog) {

    app.controller("adminOrganizations", ['$scope', 'adminOrgMenu', '$q', '$http', '$filter', '$route', 'mongoStorage', '$location', '$element', '$timeout', '$window', 'authentication', 'history', 'ngDialog', //"$http", "$filter", "Thesaurus",
        function($scope, adminMenu, $q, $http, $filter, $route, mongoStorage, $location, $element, $timeout, $window, authentication, history, ngDialog) { //, $http, $filter, Thesaurus


            $scope.loading = false;
            $scope.schema = "inde-orgs";
            $scope.createURL = '/manage/organizations/new';
            $scope.editURL = '/manage/organizations/';
            $timeout(function() {
                $scope.toggle = adminMenu.toggle;

                $scope.sectionsOptions = adminMenu.getMenu('adminOrgOptions');
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
                sec.path = function(){selectChip('all');};

                sec = _.findWhere($scope.sectionsOptions[5].pages, {
                    name: 'Drafts'
                });
                sec.path = function(){selectChip('draft');};

                sec = _.findWhere($scope.sectionsOptions[5].pages, {
                    name: 'Requests'
                });
                sec.path = function(){selectChip('request');};

                sec = _.findWhere($scope.sectionsOptions[5].pages, {
                    name: 'Approved'
                });
                sec.path = function(){selectChip('approved');};

                sec = _.findWhere($scope.sectionsOptions[5].pages, {
                    name: 'Canceled'
                });
                sec.path = function(){selectChip('canceled');};

                sec = _.findWhere($scope.sectionsOptions[6].pages, {
                    name: 'Card View'
                });
                sec.path = cardView;
                sec = _.findWhere($scope.sectionsOptions[6].pages, {
                    name: 'List View'
                });
                sec.path = listView;
            }, 2000);



            $scope.sortReverse = 0;
            $scope.listView = 0;
            $scope.showArchived = 0;
            $scope.statusFacits = {};
            $scope.statusFacits.all = 0;
            $scope.statusFacitsArcView = {};
            $scope.statusFacitsArcView.all = 0;
            $scope.selectedChip = '';

            $scope.docs = [];
            var statuses = ['draft', 'published', 'request', 'canceled', 'rejected', 'archived'];

            init();


            //=======================================================================
            //
            //=======================================================================
            function init() {
                authentication.getUser().then(function(u) {
                    $scope.selectChip('all');
                    $scope.user = u;
                    $scope.loadList();
                    getFacits();
                });
            } //init

            //============================================================
            //
            //============================================================
            $scope.$watch('statusFacits', function() {
                if(!$scope.statusFacits[$scope.selectedChip])
                selectChip('all');
            },true);

            //=======================================================================
            //
            //=======================================================================
            function getFacits(time) {

              $timeout(function(){ // time out prevent an additional call for facits as they are force updated by save
                if ($location.absUrl().indexOf('manage') > -1) {
                    mongoStorage.getStatusFacits($scope.schema, statuses, $scope.user.userID).then(function(facits) {
                        $scope.statusFacits = facits;
                    });
                } else {
                    mongoStorage.getStatusFacits($scope.schema, statuses).then(function(facits) {
                        $scope.statusFacits = facits;
                    });
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
                });
            }; // approveDoc


            //=======================================================================
            //
            //=======================================================================
            $scope.cancelDoc = function(docObj) {
                docObj.meta.status = 'canceled';
                mongoStorage.cancelDoc($scope.schema, cleanDoc(docObj), docObj._id).then(function() {
                    getFacits(1000);
                });
            }; // cancelDoc


            //=======================================================================
            //
            //=======================================================================
            $scope.rejectDoc = function(docObj) {
                docObj.meta.status = 'rejected';
                mongoStorage.rejectDoc($scope.schema, cleanDoc(docObj), docObj._id).then(function() {
                    getFacits(1000);
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
                var loadDocsFunc = mongoStorage.loadArchives;

                if ($location.absUrl().indexOf('manage') > -1)
                    loadDocsFunc = mongoStorage.loadOwnerArchives;

                return loadDocsFunc($scope.schema).then(function(response) {
                    $scope.docs = response.data;
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
            $scope.loadList = function() {

                var loadDocsFunc = mongoStorage.loadDocs;

                if ($location.absUrl().indexOf('manage') > -1)
                    loadDocsFunc = mongoStorage.loadOwnerDocs;

                loadDocsFunc($scope.schema, ['draft', 'published', 'request', 'canceled', 'rejected']).then(function(response) {
                    $scope.docs = response.data;

                    if ($scope.isAdmin)
                        _.each($scope.docs, function(doc) {

                            $http.get('/api/v2013/users/' + doc.meta.createdBy, {
                                cache: true
                            }).then(function onsuccess(response) {
                                doc.contact = response.data;
                            });
                        });
                }).then(function() {
                    var srch = $location.search();
                    if (!_.isEmpty(srch)) {
                        if (srch.chip === 'archived') {
                            $scope.showArchived = !$scope.showArchived;
                            getFacits(1000);
                            archiveList().then(function() {
                                $timeout(function() {
                                    selectChip(srch.chip);
                                }, 1000);
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
            function cardView() {
                $scope.listView = 1;
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
                    getFacits(1000);
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
                    getFacits(1000);
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
            }; //


            //=======================================================================
            //
            //=======================================================================
            function selectChipAll() {
                selectChip('all');
                $scope.toggle('orgOptions');
            } //


            //=======================================================================
            //
            //=======================================================================
            function selectChipDraft() {
                selectChip('draft');
                $scope.toggle('orgOptions');
            } //


            //=======================================================================
            //
            //=======================================================================
            function selectChipRequest() {
                selectChip('request');
                $scope.toggle('orgOptions');
            } //


            //=======================================================================
            //
            //=======================================================================
            function selectChipApproved() {
                selectChip('published');
                $scope.toggle('orgOptions');
            } //


            //=======================================================================
            //
            //=======================================================================
            function selectChipCanceled() {
                selectChip('canceled');
                $scope.toggle('orgOptions');
            } //


            //=======================================================================
            //
            //=======================================================================
            function toggleArchived() {
                $timeout(function() {
                    if (!$scope.showArchived) {
                        getFacits(1000);
                        archiveList();
                    } else {
                        getFacits(1000);
                        $scope.loadList();
                    }

                    $scope.showArchived = !$scope.showArchived;


                    $scope.toggle('orgOptions');
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