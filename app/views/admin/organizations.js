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
            $scope.options={};
            $scope.itemsPerPage=20;
            $scope.currentPage=0;
            $scope.onPage      = loadList;
            $scope.filter={};
            $scope.filter.status = 'all';
            init();


            //=======================================================================
            //
            //=======================================================================
            function init() {
              initSlideMenu() ;
                authentication.getUser().then(function(u) {
                  $scope.user = u;
                  var srch = $location.search();
                  if(srch && srch.chip)
                    $scope.selectChip(srch.chip);
                  else
                    $scope.selectChip('all');
                });
                $scope.editURL='/manage/organizations/';
            } //init


            //=======================================================================
            //
            //=======================================================================
            function initSlideMenu() {

                $scope.menu = dashMenu.getMenu('adminOrgOptions');
                $scope.toggle = dashMenu.toggle;

                dashMenu.setPathOfLink($scope.menu, 'Sort', sortOrder);
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
            }
            //======================================================
            //
            //
            //======================================================
            function refreshPager(currentPage)
            {
                currentPage = currentPage || 0;

                var pageCount = Math.ceil(Math.max($scope.count||0, 0) / Number($scope.itemsPerPage));

                var pages     = [];
                var start = 0;
                var end = (pageCount<9)? pageCount:9;
                if(currentPage > 8 && (pageCount<9)){
                  start = currentPage-4;
                  end = currentPage+4;
                  if(end>pageCount)
                    end = pageCount;
                }

                for (var i = start; i < end; i++) {
                    pages.push({ index : i, text : i+1 });
                }

                $scope.currentPage = currentPage;
                $scope.pages       = pages;
                $scope.pageCount=pageCount ;

            }

            //=======================================================================
            //
            //=======================================================================
            $scope.changePage = function(index) {
                $scope.prevDate=false;
                $scope.currentPage=index;
            };

            //=======================================================================
            //
            //=======================================================================
            $scope.isActive = function(index) {
                return ($scope.currentPage===(index));
            };


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
                    if (ret.value === 'yes') $scope.deleteDoc(doc);
                });
            };


            //=======================================================================
            //
            //=======================================================================
            $scope.approveDoc = function(docObj) {
                docObj.meta.status = 'published';
                mongoStorage.approveDoc($scope.schema, cleanDoc(docObj), docObj._id).then(function() {
                  loadList ($scope.currentPage);
                }).catch(onError);
            }; // approveDoc


            //=======================================================================
            //
            //=======================================================================
            $scope.cancelDoc = function(docObj) {
                docObj.meta.status = 'canceled';
                mongoStorage.cancelDoc($scope.schema, cleanDoc(docObj), docObj._id).then(function() {
                  loadList ($scope.currentPage);
                }).catch(onError);
            }; // cancelDoc


            //=======================================================================
            //
            //=======================================================================
            $scope.rejectDoc = function(docObj) {
                docObj.meta.status = 'rejected';
                mongoStorage.rejectDoc($scope.schema, cleanDoc(docObj), docObj._id).then(function() {
                  loadList ($scope.currentPage);
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
            function selectChip(chip) {
                $element.find('.chip').removeClass('chip-active');
                $element.find('#chip-' + chip).addClass('chip-active');

                if (!chip || chip === 'all' || chip === '' )
                    $scope.selectedChip = '';
                else
                    $scope.selectedChip = chip;
                $scope.filter.status=chip;
                loadList (0);
            } // archiveOrg
            $scope.selectChip = selectChip;

            //=======================================================================
            //
            //=======================================================================
            function loadList (pageIndex) {
                $scope.loading=true;
                var loadDocsFunc = mongoStorage.loadDocs;
                var q ={};
                if ($location.absUrl().indexOf('manage') > -1)
                    loadDocsFunc = mongoStorage.loadOwnerDocs;
                    if($scope.filter.status) q['meta.status']=$scope.filter.status;// jshint ignore:line


                    if($scope.search)
                        q['$text'] = {'$search':$scope.search};  // jshint ignore:line
                      //q['$or'] = [{'acronym':{'$regex': $scope.search}},{'title':{'$regex': '/'+$scope.search+'/'}}];  // jshint ignore:line


                   if($scope.filter.status==='all')
                     q['meta.status']={'$in':['draft', 'published', 'request', 'canceled', 'rejected']}; // jshint ignore:line

                return loadDocsFunc($scope.schema,_.clone(q), (pageIndex * $scope.itemsPerPage),$scope.itemsPerPage,1).then(function(response) {
                    $scope.docs = response.data;

                    $scope.count = response.count;
                    $scope.statusFacits =  response.facits;

                    if ($scope.isAdmin)
                        _.each($scope.docs, function(doc) {

                            $http.get('/api/v2013/users/' + doc.meta.createdBy, {
                                cache: true
                            }).then(function onsuccess(response) {
                                doc.contact = response.data;
                            }).catch(onError);
                        });
                        refreshPager(pageIndex);
                        $scope.loading=false;
                }).catch(onError);
            }; // loadList





            //=======================================================================
            //
            //=======================================================================
            $scope.archiveDoc = function(docObj) {
                docObj.meta.status = 'archived';
                mongoStorage.archiveDoc($scope.schema, cleanDoc(docObj), docObj._id).then(function() {
                    _.remove($scope.docs, function(obj) {
                        return obj._id === docObj._id;
                    });

                }).catch(onError);
                loadList($scope.currentPage);
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
                    loadList($scope.currentPage);
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
                    loadList($scope.currentPage);
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
                } else  if (res.data && res.data.Message)
                    $scope.error = res.data.Message;
                else
                    $scope.error = res.data || res;
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