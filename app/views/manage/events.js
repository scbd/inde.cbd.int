define(['app',
    'lodash',
    './menu',
    'directives/scbd-icon-button',
    '../../services/mongo-storage',
    '../../services/filters'
], function(app, _) {

    app.controller("events", ['$scope', 'dashMenu', '$q', '$http', '$filter', '$route', 'mongoStorage', '$location', '$element', '$timeout', '$window', 'authentication', 'history',
        function($scope, dashMenu, $q, $http, $filter, $route, mongoStorage, $location, $element, $timeout, $window, authentication, history) {

            authentication.getUser().then(function(user) {
                $scope.isAuthenticated = user.isAuthenticated;
            }).then(function() {

                if (!$scope.isAuthenticated)
                    $window.location.href = 'https://accounts.cbd.int/signin?returnUrl=';
            });

            $scope.loading = false;
            $scope.schema = "inde-side-events";
            $scope.createURL = '/manage/events/0';
            $scope.editURL = '/manage/events/';

            $scope.toggle = dashMenu.toggle;
            $scope.sectionsOptions = dashMenu.getMenu('options');

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
            sec = _.findWhere($scope.sectionsOptions[6].pages, {
                name: 'Card View'
            });
            sec.path = cardView;
            sec = _.findWhere($scope.sectionsOptions[6].pages, {
                name: 'List View'
            });
            sec.path = listView;

            $scope.sortReverse = 0;
            $scope.listView = 0;
            $scope.showArchived = 0;
            $scope.statusFacits = {};
            $scope.statusFacits.all = 0;
            $scope.statusFacitsArcView = {};
            $scope.statusFacitsArcView.all = 0;
            $scope.selectedChip = 'all';

            $scope.docs = [];
            var statuses = ['draft', 'published', 'request', 'canceled', 'rejected'];
            var statusesArchived = ['deleted', 'archived'];

            //=======================================================================
            //
            //=======================================================================
            function init() {
                registerToolTip();

                $scope.loadList();
                mongoStorage.getOwnerFacits($scope.schema, $scope.statusFacits, statuses);
                mongoStorage.getOwnerFacits($scope.schema, $scope.statusFacitsArcView, statusesArchived);
            } //init

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
            function cleanDoc(doc) {
                var cDoc = _.cloneDeep(doc);
                delete(cDoc.orgs);
                delete(cDoc.confrenceObj);
                return cDoc;
            } //toggleListView

            function registerToolTip() {
                $timeout(function() {
                    $(document).ready(function() {
                        $('[data-toggle="tooltip"]').tooltip();
                    });

                    $('[data-toggle="tooltip"]').on('shown.bs.tooltip', function() {
                        var that = $(this);

                        var element = that[0];
                        if (element.myShowTooltipEventNum === null) {
                            element.myShowTooltipEventNum = 0;
                        } else {
                            element.myShowTooltipEventNum++;
                        }
                        var eventNum = element.myShowTooltipEventNum;

                        setTimeout(function() {
                            if (element.myShowTooltipEventNum == eventNum) {
                                that.tooltip('hide');
                            }
                            // else skip timeout event
                        }, 1000);
                    });
                }, 2000);
            }

            function sortOrder() {
                console.log('here');
                $scope.sortReverse = !$scope.sortReverse;

                $scope.toggle('options');
            }

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
                    _.each(docObj.hostOrgs, function(org) {
                        mongoStorage.loadDoc('inde-orgs', org).then(function(conf) {
                            if (conf[1].meta.status !== 'published')
                                mongoStorage.approveDoc('inde-orgs',
                                    conf,
                                    conf._id);
                        });
                    });
                    mongoStorage.getOwnerFacits($scope.schema, $scope.statusFacits, statuses);
                    mongoStorage.getOwnerFacits($scope.schema, $scope.statusFacitsArcView, statusesArchived);
                    //$scope.loadList ();
                });
            }; // archiveOrg
            //=======================================================================
            //
            //=======================================================================
            $scope.cancelDoc = function(docObj) {
                docObj.meta.status = 'canceled';
                mongoStorage.cancelDoc($scope.schema, cleanDoc(docObj), docObj._id).then(function() {
                    mongoStorage.getOwnerFacits($scope.schema, $scope.statusFacits, statuses);
                    mongoStorage.getOwnerFacits($scope.schema, $scope.statusFacitsArcView, statusesArchived);
                    //$scope.loadList ();
                });
            }; // archiveOrg
            //=======================================================================
            //
            //=======================================================================
            $scope.rejectDoc = function(docObj) {
                docObj.meta.status = 'rejected';
                mongoStorage.rejectDoc($scope.schema, cleanDoc(docObj), docObj._id).then(function() {
                    mongoStorage.getOwnerFacits($scope.schema, $scope.statusFacits, statuses);
                    mongoStorage.getOwnerFacits($scope.schema, $scope.statusFacitsArcView, statusesArchived);
                    //$scope.loadList ();
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
                $location.search('chip', null);
                return mongoStorage.loadOwnerArchives($scope.schema).then(function(response) {
                    $scope.docs = response.data;
                    _.each($scope.docs, function(doc) {
                        mongoStorage.loadDoc('conferences', doc.confrence).then(function(conf) {
                            doc.confrenceObj = conf;
                        });
                        doc.orgs = [];

                        _.each(doc.hostOrgs, function(org) {
                            mongoStorage.loadDoc('inde-orgs', org).then(function(conf) {
                                doc.orgs.push(conf);
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
                $element.find('div#chip-' + chip).addClass('chip-active');

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
            }; //$scope.searchToggle

            //=======================================================================
            //
            //=======================================================================
            $scope.loadList = function() {
                mongoStorage.loadOwnerDocs($scope.schema, ['draft', 'published', 'request', 'canceled', 'rejected']).then(function(response) {
                    $scope.docs = response.data;

                    _.each($scope.docs, function(doc) {

                        mongoStorage.loadDoc('conferences', doc.confrence).then(function(conf) {
                            doc.confrenceObj = conf;
                        });
                        doc.orgs = [];
                        _.each(doc.hostOrgs, function(org) {
                            mongoStorage.loadDoc('inde-orgs', org).then(function(conf) {
                                doc.orgs.push(conf);
                            });
                        });

                        // $http.get('https://api.cbd.int/api/v2013/users/' + doc.meta.createdBy).then(function onsuccess(response) {
                        //   doc.contact = response.data;
                        // });
                    });
                }).then(function() {
                    var srch = $location.search();

                    if (!_.isEmpty(srch)) {
                        if (srch.chip === 'archived') {
                            $scope.showArchived = !$scope.showArchived;
                            mongoStorage.getOwnerFacits($scope.schema, $scope.statusFacitsArcView, statusesArchived);
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
            }; // archiveOrg

            //=======================================================================
            //
            //=======================================================================
            function toggleListView() {
                $timeout(function() {
                    if ($scope.listView === 0)
                        $scope.listView = 1;
                    // else if($scope.listView===1)
                    //     $scope.listView=2;
                    else
                        $scope.listView = 0;
                });
                registerToolTip();
            } //toggleListView
            $scope.toggleListView = toggleListView;

            //=======================================================================
            //
            //=======================================================================
            function listView() {
                $scope.listView = 0;
                $scope.toggle('options');
                registerToolTip();
            } //toggleListView
            //=======================================================================
            //
            //=======================================================================
            function cardView() {
                $scope.listView = 1;
                $scope.toggle('options');
                registerToolTip();
            } //toggleListView
            //=======================================================================
            //
            //=======================================================================
            function detailView() {
                $scope.listView = 2;
                $scope.toggle('options');
                registerToolTip();
            } //detailView(docObj)

            //=======================================================================
            //
            //=======================================================================
            $scope.archiveDoc = function(docObj) {
                docObj.meta.status = 'archived';
                mongoStorage.archiveDoc($scope.schema, cleanDoc(docObj), docObj._id).then(function() {
                    _.remove($scope.docs, function(obj) {
                        return obj._id === docObj._id;
                    });
                    mongoStorage.getOwnerFacits($scope.schema, $scope.statusFacits, statuses);
                    mongoStorage.getOwnerFacits($scope.schema, $scope.statusFacitsArcView, statusesArchived);
                });

            }; // archiveOrg

            //=======================================================================
            //
            //=======================================================================
            $scope.deleteDoc = function(docObj) {
                docObj.meta.status = 'deleted';
                mongoStorage.deleteDoc($scope.schema, cleanDoc(docObj), docObj._id).then(function() {
                    _.remove($scope.docs, function(obj) {
                        return obj._id === docObj._id;
                    });
                    mongoStorage.getOwnerFacits($scope.schema, $scope.statusFacits, statuses);
                    mongoStorage.getOwnerFacits($scope.schema, $scope.statusFacitsArcView, statusesArchived);
                });

            }; // $scope.deleteDoc

            //=======================================================================
            //
            //=======================================================================
            $scope.unArchiveDoc = function(docObj) {
                docObj.meta.status = 'draft';
                mongoStorage.unArchiveDoc($scope.schema, cleanDoc(docObj), docObj._id).then(function() {
                    _.remove($scope.docs, function(obj) {
                        return obj._id === docObj._id;
                    });
                });
            }; //$scope.unArchiveDoc

            //=======================================================================
            //
            //=======================================================================
            $scope.goTo = function(url) {
                $location.url(url);
            }; //$scope.goTo

            //=======================================================================
            //
            //=======================================================================
            $scope.edit = function(id) {
                $location.url($scope.editURL + id);
            }; // $scope.edit

            //=======================================================================
            //
            //=======================================================================
            function selectChipAll() {
                selectChip('all');
                $scope.toggle('options');
            } //selectChipAll

            //=======================================================================
            //
            //=======================================================================
            function selectChipDraft() {
                selectChip('draft');
                $scope.toggle('options');
            } // selectChipDraft

            //=======================================================================
            //
            //=======================================================================
            function selectChipRequest() {
                selectChip('request');
                $scope.toggle('options');
            } // selectChipRequest

            //=======================================================================
            //
            //=======================================================================
            function selectChipApproved() {
                selectChip('published');
                $scope.toggle('options');
            } // selectChipApproved

            //=======================================================================
            //
            //=======================================================================
            function selectChipCanceled() {
                selectChip('canceled');
                $scope.toggle('options');
            } // selectChipCanceled

            //=======================================================================
            //
            //=======================================================================
            function toggleArchived() {
                $timeout(function() {
                    if (!$scope.showArchived) {
                        mongoStorage.getOwnerFacits($scope.schema, $scope.statusFacitsArcView, statusesArchived);
                        archiveList();
                    } else {
                        mongoStorage.getOwnerFacits($scope.schema, $scope.statusFacits, statuses);
                        $scope.loadList();
                    }

                    $scope.showArchived = !$scope.showArchived;


                    $scope.toggle('options');
                    selectChip('archived');
                    registerToolTip();
                });
                $timeout(function() {

                    if ($scope.selectedChip === 'archived')
                        $scope.selectedChip = 'all';
                    else
                        $scope.selectedChip = 'archived';

                }, 500);
            } // archiveOrg
            //=======================================================================
            //
            //=======================================================================
            $scope.close = function() {

                history.goBack();
            };

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
            $scope.prev = history.getPrevPath();

            init();
            $scope.selectChip('all');
        }
    ]);
});