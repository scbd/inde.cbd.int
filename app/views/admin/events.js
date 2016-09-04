define(['app', 'lodash',
    'text!./delete-dialog.html',
    'moment',
    './menu',
    'services/mongo-storage',
    'services/filters',
    'services/dev-router',
    'ngDialog',
    'directives/mobi-menu',
    'directives/sorter',
    'services/filters',
    'filters/truncate',
    'filters/country',
    'filters/propsFilter',
    'directives/pagination',
    'ui.select'
], function(app, _, deleteDialog, moment) {

    app.controller("adminEvents", ['$scope', 'adminMenu', '$q', '$http', 'mongoStorage', '$location', '$element', '$timeout', 'authentication', 'history', 'ngDialog',
        function($scope, dashMenu, $q, $http, mongoStorage, $location, $element, $timeout, authentication, history, ngDialog) {

            $scope.loading = true;
            $scope.schema = "inde-side-events";
            $scope.selectedChip = 'all';
            $scope.docs = [];
            $scope.options={};
            $scope.options.filter={};
            $scope.itemsPerPage=10;
            $scope.currentPage=0;
            $scope.onPage      = loadList;
            $scope.filter={};
            $scope.filter.status = 'all';
            $scope.sort={'meta.modifiedOn': -1};
            $scope.expandAll= false;
            $scope.options.filter.hostOrgs = [];
            $scope.options.filter.hostOrgsSelected=[];
            init();

            $scope.$watch('sort',function(newValue, oldValue){
              if(JSON.stringify(oldValue)!==JSON.stringify(newValue))
                 $scope.onPage($scope.currentPage);

            });
            //
            $scope.$watch('options.filter.hostOrgsSelected',function(){
              if(_.isArray($scope.options.filter.hostOrgsSelected) && !_.isEmpty($scope.options.filter.hostOrgs)){
                $scope.onPage(0);

              }
            },true);
            //=======================================================================
            //
            //=======================================================================
            function init() {

                initSlideMenu();

                authentication.getUser().then(function(user) {
                    $scope.user = user;
                    var srch = $location.search();
                    if(srch && srch.chip)
                      $scope.selectChip(srch.chip).then(function(){if($scope.isAdmin())$scope.detailView=true;});
                    else
                      $scope.selectChip('all').then(function(){if($scope.isAdmin())$scope.detailView=true;});
                });
                $timeout(function(){
                  $('.ui-select-search').addClass('form-control');
                  $('.ui-select-container').removeClass('form-control');
              },100);
            } //init


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
                $scope.pageCount   = pageCount ;
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
            $scope.expandDesc = function () {
                $scope.expandAll= !$scope.expandAll;
                _.each($scope.docs,function(doc){
                  if($scope.expandAll)
                    doc.truncate=10000;
                  else
                    doc.truncate=300;
                });


            };

            //=======================================================================
            //
            //=======================================================================
            function initSlideMenu() {

                $scope.menu = dashMenu.getMenu('adminOptions');
                $scope.toggle = dashMenu.toggle;

                dashMenu.setPathOfLink($scope.menu, 'Sort', sortOrder);
                // dashMenu.setPathOfLink($scope.menu, 'Side Events', toggleArchived);
                // dashMenu.setPathOfLink($scope.menu, 'Archives', toggleArchived);
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
            $scope.isAdmin = function() {

                return _.intersection($scope.user.roles, ['Administrator', 'IndeAdministrator']).length > 0;
            };


            //============================================================
            //
            //============================================================
            $scope.statusFilter = function(doc) {
                if(!doc ) return false;
                if (doc.meta && doc.meta.status === $scope.selectedChip)
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
                    loadList($scope.currentPage);
                    $scope.$emit('showSuccess', 'Side Event #' + docObj.id + ' is now Under Review');
                }).catch(onError);
            }; // archiveOrg


            //=======================================================================
            //
            //=======================================================================
            $scope.cancelDoc = function(docObj) {
                docObj.meta.status = 'canceled';
                mongoStorage.cancelDoc($scope.schema, cleanDoc(docObj), docObj._id)
                    .then(function() {
                      loadList($scope.currentPage);
                        $scope.$emit('showSuccess', 'Side Event #' + docObj.id + ' is now canceled');
                    }).catch(onError);
            }; // archiveOrg


            //=======================================================================
            //
            //=======================================================================
            $scope.rejectDoc = function(docObj) {
                docObj.meta.status = 'rejected';
                mongoStorage.rejectDoc($scope.schema, cleanDoc(docObj), docObj._id)
                    .then(function() {
                      loadList($scope.currentPage);
                        $scope.$emit('showSuccess', 'Side Event #' + docObj.id + ' is now Rejected');
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

                if ( !chip || chip === 'all' || chip==='chip')
                    $scope.selectedChip = '';
                else
                    $scope.selectedChip = chip;
                $scope.filter.status=chip;
                return loadList(0);
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

            //============================================================
            //
            //============================================================
            function loadConferences() {
                return mongoStorage.loadConferences().then(function(o) {
                    $scope.options.conferences=o.sort(compareDates); //= $filter("orderBy")(o.data, "StartDate");


                    if(!$scope.filter.conference){
                      $scope.filter.conference=$scope.options.conferences[0]._id;
                      $scope.options.conferences[0].selected=true;
                    }
                }).catch(onError);
            }


            //=======================================================================
            //
            //=======================================================================
            function loadList  (pageIndex) {
                $scope.loading = true;

                return $q.all([loadOrgs(), loadConferences(),loadSubjects(),mongoStorage.getCountries()]).then(function() {
                    var loadDocsFunc = mongoStorage.loadDocs;

                    if ($location.absUrl().indexOf('manage') > -1)
                        loadDocsFunc = mongoStorage.loadOwnerDocs;


                    var q = {
                      conference:$scope.filter.conference,
                      'meta.status':$scope.filter.status,
                    };

                    if($scope.search)  q['$text']= {'$search':$scope.search};  // jshint ignore:line

                    if(!_.isEmpty($scope.options.filter.hostOrgsSelected))  {
                      q['$and']=[];// jshint ignore:line
                      $scope.options.filter.hostOrgsSelected.forEach(

                        function(item){
                            q['$and'].push({'hostOrgs':item});// jshint ignore:line
                        }
                      );
                    //  q['$and']= {'$and':$scope.options.filter.hostOrgsSelected};  // jshint ignore:line

                    }

                    if($scope.filter.status==='all')
                      q['meta.status']={'$in':['draft', 'published', 'request', 'canceled', 'rejected']};


                    return loadDocsFunc($scope.schema,_.clone(q), (pageIndex * $scope.itemsPerPage),$scope.itemsPerPage,1,$scope.sort).then(function(response) {

                      $scope.docs = response.data;
                      $scope.count = response.count;
                      if($scope.isAdmin()){
                        if(!$scope.users) $scope.users=[];

                         _.each($scope.docs, function(doc) {
                              $scope.users.push(doc.meta.createdBy);
                              $scope.users.push(doc.meta.modifiedBy);
                        });
                        $scope.users=_.uniq($scope.users);
                        $http.get('/api/v2013/userinfos?query='+JSON.stringify({userIDs:$scope.users})).then(function(res){
                            _.each($scope.docs, function(doc) {
                                 if(!_.find(res.data,{userID:doc.meta.createdBy})) throw 'User not found : '+doc.meta.createdBy;
                                 doc.meta.createdByObj=_.find(res.data,{userID:doc.meta.createdBy});

                                 if(!_.find(res.data,{userID:doc.meta.modifiedBy})) throw 'User not found : '+doc.meta.modifiedBy;
                                 doc.meta.modifiedByObj=_.find(res.data,{userID:doc.meta.modifiedBy});
                           });
                       });
                        //'UserID'
                      }

                        populateDocsWithOrgObjs();

                        if(_.isEmpty($scope.options.filter.hostOrgs))
                          loadOrgsFilter(loadDocsFunc,q);


                        $scope.statusFacits =  response.facits;
                        refreshPager(pageIndex);
                        $scope.loading=false;
                    });
                });
            } // archiveOrg

            //=======================================================================
            //
            //=======================================================================
            function populateDocsWithOrgObjs() {

                  _.each($scope.docs, function(doc) {
                      doc.orgs = [];

                      var foundOrg;
                      loadHostOrgs(doc).then(function() {

                          _.each(doc.hostOrgs, function(org) {
                              foundOrg = _.find($scope.orgs, {
                                  _id: org
                              });
                              if (foundOrg){
                                  doc.orgs.push(foundOrg);
                              }
                          });
                      });
                      doc.subjectObjs=[];
                      _.each(doc.subjects,function(subj){
                          var subjObj = _.find($scope.options.subjects,{'identifier': subj.identifier});
                          if(subjObj)
                            doc.subjectObjs.push(subjObj);
                      });

                      doc.conferenceObj = _.find($scope.options.conferences, {
                          '_id': doc.conference
                      });

                      doc.meetingObjs = [];

                    if(doc.meetings)
                      doc.meetings.forEach(function(meeting) {
                          doc.meetingObjs.push(_.find(doc.conferenceObj.meetings, {
                              '_id': meeting
                          }));
                      });
                  });
            } //toggleListView
            //=======================================================================
            //
            //=======================================================================
            function loadOrgsFilter(loadDocsFunc,q) {
                  loadDocsFunc($scope.schema,_.clone(q), 0,1000000,1,$scope.sort).then(
                    function(r){

                      if(!$scope.options.filter.hostOrgs)$scope.options.filter.hostOrgs=[];
                      _.each(r.data, function(doc) {

                          var foundOrg;
                          _.each(doc.hostOrgs, function(org) {
                              foundOrg = _.find($scope.orgs, {
                                  _id: org
                              });
                              if (foundOrg && !_.find($scope.options.filter.hostOrgs,{'_id':foundOrg._id}))
                                  $scope.options.filter.hostOrgs.push(foundOrg);
                          });
                    });
                  });
            } //toggleListView
            //=======================================================================
            //
            //=======================================================================
            $scope.getNumberPages = function() {
                if($scope.count && $scope.itemsPerPage && ($scope.count > $scope.itemsPerPage))
                  return new Array(Math.floor($scope.count/$scope.itemsPerPage)+1);
                else
                    return new Array(1);

            };

            //=======================================================================
            //
            //=======================================================================
            $scope.setSort = function(name,direction) {

                $scope.sort= {name:direction};
            };
            //=======================================================================
            //
            //=======================================================================
            function loadHostOrgs(doc) {
                var allPromises=[];
                    _.each(doc.hostOrgs, function(orgId) {
                        if (!_.find($scope.orgs, {
                                _id: orgId
                            })) {
                            allPromises.push(mongoStorage.loadDoc('inde-orgs', orgId).then(function(responce) {
                              if (!_.find($scope.orgs, {
                                      _id: orgId
                                  }) && mongoStorage.isPublishable(responce))
                                $scope.orgs.push(responce);

                            }).catch(onError));
                        }

                    });
                  return $q.all(allPromises);
            } //submitGeneral


            //=======================================================================
            //
            //=======================================================================
            function cleanDoc(doc) {
                var cDoc = _.cloneDeep(doc);
                delete(cDoc.orgs);
                delete(cDoc.confrenceObj);
                delete(cDoc.meta.modifiedByObj);
                delete(cDoc.meta.createdByObj);
                return cDoc;
            } //toggleListView




            //=======================================================================
            //
            //=======================================================================
            $scope.archiveDoc = function(docObj) {
                mongoStorage.archiveDoc($scope.schema, cleanDoc(docObj), docObj._id).then(function() {
                    _.remove($scope.docs, function(obj) {
                        return obj._id === docObj._id;
                    });
                    $scope.$emit('showSuccess', 'Side Event #' + docObj.id + ' is now archived');
                    loadList($scope.currentPage);
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
                    loadList($scope.currentPage);
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
                    loadList($scope.currentPage);
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
                } else  if (res.data && res.data.Message)
                    $scope.error = res.data.Message;
                else
                    $scope.error = res.data || res;
            }
            $scope.onError=onError;


            //============================================================
            //
            //============================================================
            $scope.hasError = function() {
                return !!$scope.error;
            };

            //==============================
            //
            //==============================
            function loadSubjects() {

                return $http.get("/api/v2013/thesaurus/domains/CBD-SUBJECTS/terms", {
                    cache: true
                }).then(function(res) {
                    $scope.options.subjects=res.data;
                }).catch(onError);
            }

            //=======================================================================
            //
            //=======================================================================
            $scope.close = function() {
                history.goBack();
            };
        }
    ]);

});