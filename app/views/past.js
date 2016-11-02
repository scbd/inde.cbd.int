define(['app', 'lodash', 'moment', 'directives/mobi-menu','ngSmoothScroll','scroll-directive',
    'filters/propsFilter',
    'filters/moment',
    'filters/truncate',
    'services/filters',
    'directives/pagination',
    'ui.select',
    'directives/mobi-menu',
], function(app, _, moment) {

    return ['$scope','mongoStorage', '$route', '$http', '$timeout','$q',function($scope,mongoStorage, $route, $http,$timeout,$q) {

        var _ctrl = this;
        _ctrl.hasError = hasError;
        // _ctrl.customSearch = customSearch;
        // _ctrl.loadReservations = loadReservations;
        _ctrl.allOrgs = [];
        _ctrl.confrences = [];
        _ctrl.preLoadImages = [];

        _ctrl.itemsPerPage=10;
        _ctrl.currentPage=0;
        _ctrl.pages=[];
        _ctrl.onPage      = loadList;
        _ctrl.isPastConfrence=isPastConfrence;
        _ctrl.filter={};
        _ctrl.filter.status = 'all';
        _ctrl.sort={'start': 1};

        load();
        return this;



        //==============================
        //
        //==============================
        function load() {
            $("head > title").text("Past Side Events");
            loadList(0).then(initWatches);
        }

        //==============================
        //
        //==============================
        function loadSubjects() {
            return $http.get("/api/v2013/thesaurus/domains/CBD-SUBJECTS/terms", {
                cache: true
            }).then(function(res){_ctrl.subjects = res; });

        }

        //============================================================
        //
        //============================================================
        function initWatches() {
            $scope.$watch('pastCtrl.hostOrgsSelected', function() {

                if(typeof _ctrl.hostOrgsSelected !== "undefined")
                  loadList(0);
            });
            $scope.$watch('pastCtrl.search', function() {
              if(typeof _ctrl.search !== "undefined")
                loadList(0);
            });
            // $scope.$watch('pastCtrl.conference', function() {
            //   if(typeof _ctrl.conference !== "undefined")
            //     loadList(0);
            // });
            $scope.$watch('pastCtrl.conference', function() {
                if(typeof _ctrl.conference !== "undefined"){
                  _ctrl.confObj = _.find(_ctrl.conferences,{'_id':_ctrl.conference});
                  loadList(0);
                }
            });
        }

        //============================================================
        //
        //============================================================
        function loadOrgs() {
            return  mongoStorage.loadOrgs().then(function(orgs) {
                        _ctrl.allOrgs = orgs;
                        // _.each(_ctrl.allOrgs, function(org) {
                        //     var image = new Image();
                        //     image.src = org.logo;
                        //     _ctrl.preLoadImages.push(image);
                        // });
                    });
        }


        //==============================
        //
        //==============================
        function isPastConfrence(id,conferences) {
            if(!conferences)conferences=_ctrl.conferences;
            var c = _.find(conferences,{'_id':id});
            if(!c) throw "error: conference not found";

            if(moment(c.EndDate).isAfter(new Date()))
                return false;
            else
               return true;

        }
        //======================================================
        //
        //
        //======================================================
        function refreshPager(currentPage)
        {
          currentPage = currentPage || 0;

          var pageCount = Math.ceil(Math.max(_ctrl.count||0, 0) / Number(_ctrl.itemsPerPage))-1;

          var pages     = [];
          var start = 0;
          var end = (pageCount<5)? pageCount:5;

          if(currentPage > 0 && currentPage <=pageCount && (pageCount>=5)){
            start = currentPage-2;
            end = currentPage+2;
            if(end>pageCount)
              end = pageCount;

            for (var i = start; i <= end; i++) {
                pages.push({ index : i, text : i+1 });
            }
          }else{
            for (var i = start; i < end; i++) {  //jshint ignore:line
                pages.push({ index : i, text : i+1 });
            }
          }

            _ctrl.currentPage = currentPage;
            _ctrl.pages       = pages;
            _ctrl.pageCount   = pageCount ;
        }

        //=======================================================================
        //
        //=======================================================================
        $scope.changePage = function(index) {
            _ctrl.prevDate=false;
            _ctrl.currentPage=index;
        };
        //=======================================================================
        //
        //=======================================================================
        function loadList  (pageIndex) {
            _ctrl.loading = true;
            if(!pageIndex) pageIndex=0;

            return $q.all([loadSideEventTypes(),loadOrgs(), loadConferences(),loadSubjects(),mongoStorage.getCountries()]).then(function() {
                var q = buildQuery ();
                return mongoStorage.loadDocs('reservations',_.clone(q), (pageIndex * _ctrl.itemsPerPage),_ctrl.itemsPerPage,1,_ctrl.sort).then(function(response) {

                    loadListPostProcess (response);
                    refreshPager(pageIndex);
                    _ctrl.loading=false;
                });
            });
        } // archiveOrg
        //=======================================================================
        //
        //=======================================================================
        function loadListPostProcess (response) {

                  _ctrl.reservations  = response.data;
                  _ctrl.count = response.count;

                  injectOrgData(_ctrl.reservations);

                  if(_.isEmpty(_ctrl.allOrgs))
                      loadOrgs(buildQuery);

        } // loadListPostProcess

        //=======================================================================
        //
        //=======================================================================
        function injectOrgData(docs) {

              _.each(docs, function(doc) {
                  doc.orgs = [];

                  var foundOrg;
                  loadHostOrgs(doc).then(function() {

                      _.each(doc.sideEvent.hostOrgs, function(org) {
                          foundOrg = _.find(_ctrl.allOrgs, {
                              _id: org
                          });
                          if (foundOrg){
                              doc.orgs.push(foundOrg);
                          }
                      });
                  });
                  doc.subjectObjs=[];
                  _.each(doc.subjects,function(subj){
                      var subjObj = _.find(_ctrl.subjects,{'identifier': subj.identifier});
                      if(subjObj)
                        doc.subjectObjs.push(subjObj);
                  });

                  doc.conferenceObj = _.find(_ctrl.conferences, {
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
        } //

        //=======================================================================
        //
        //=======================================================================
        function loadHostOrgs(doc) {
            var allPromises=[];
                _.each(doc.hostOrgs, function(orgId) {
                    if (!_.find(_ctrl.allOrgs, {
                            _id: orgId
                        })) {
                        allPromises.push(mongoStorage.loadDoc('inde-orgs', orgId).then(function(responce) {
                          if (!_.find(_ctrl.allOrgs, {
                                  _id: orgId
                              }) && mongoStorage.isPublishable(responce))
                            _ctrl.allOrgs.push(responce);
                        }).catch(onError));
                    }

                });
              return $q.all(allPromises);
        } //submitGeneral

        //============================================================
        //
        //============================================================
        function loadConferences() {
          if(!_ctrl.conferences || _.isEmpty(_ctrl.conferences))
            return mongoStorage.loadConferences().then(function(o) {
              _ctrl.conferences=[];
                var conferences=_.cloneDeep(o).sort(compareDates); //= $filter("orderBy")(o.data, "StartDate");
                  conferences=conferences.splice(0,2);

                _.each(conferences,function(conf,index){

                      if(conf && !isPastConfrence(conf._id,conferences))

                        conferences.splice(index,1);


                });

                _ctrl.conferences=conferences;

                if(!_ctrl.conference){
                  _ctrl.conference=_ctrl.conferences[0]._id;
                  _ctrl.conferences[0].selected=true;
                }
            }).catch(onError);
        }

        //=======================================================================
        //
        //=======================================================================
        function buildQuery () {
            var q = {};


            q.start={'$exists':1};
            q.start={'$ne':null};
            if(_ctrl.conference) q['location.conference']=_ctrl.conference;

            if(_ctrl.search){
                if(_ctrl.search && _ctrl.search.length>0 && !Number(_ctrl.search))
                  q['$text'] = {'$search':_ctrl.search};  // jshint ignore:line
                else
                  q.id = Number($scope.search);  // jshint ignore:line
            }

            if(!_.isEmpty(_ctrl.hostOrgsSelected))  {
              q['$and']=[];// jshint ignore:line
              _ctrl.hostOrgsSelected.forEach(

                function(item){
                    q['$and'].push({'sideEvent.hostOrgs':item});// jshint ignore:line
                }
              );
            }
            q['meta.status']={'$nin':[ 'deleted', 'archived']};
            q.type={'$in':_ctrl.seTypes};
            return q;
        }
        //============================================================
        //
        //============================================================
        function loadSideEventTypes() {

            var params = {
                q: {
                    'parent': '570fd0a52e3fa5cfa61d90ee',
                    'schema': 'reservations'
                }
            };
            return $http.get('/api/v2016/types', {
                'params': params
            }).then(function(responce) {
                _ctrl.seTypes = [];
                _ctrl.seTypes.push('570fd0a52e3fa5cfa61d90ee');
                _.each(responce.data, function(type) {
                    _ctrl.seTypes.push(type._id);
                });
                _ctrl.seTypes.push('572bcfa4240149400a234903');
                return responce.data;
            });

        } //loadSideEventTypes
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

        //=======================================================================
        //
        //=======================================================================
        // function customSearch(docc) {
        //
        //     var doc = _.clone(docc);
        //     delete(doc.conf);
        //     if (!_ctrl.search || _ctrl.search == ' ' || _ctrl.search.length <= 2) return true;
        //     var temp = JSON.stringify(doc);
        //
        //     if (_.isString(temp))
        //         return (temp.toLowerCase().indexOf(_ctrl.search.toLowerCase()) >= 0);
        //     else
        //         return false;
        // }

        //============================================================
        //
        //============================================================
        function hasError() {
            return !!_ctrl.error;
        }

        //============================================================
        //
        //============================================================
        function onError(res) {

            _ctrl.status = "error";
            if (res.status === -1) {
                _ctrl.error = "The URI " + res.config.url + " could not be resolved.  This could be caused form a number of reasons.  The URI does not exist or is erroneous.  The server located at that URI is down.  Or lastly your internet connection stopped or stopped momentarily. ";
                if (res.data && res.data.message)
                    _ctrl.error += " Message Detail: " + res.data.message;
            }
            if (res.status == "notAuthorized") {
                _ctrl.error = "You are not authorized to perform this action: [Method:" + res.config.method + " URI:" + res.config.url + "]";
                if (res.data.message)
                    _ctrl.error += " Message Detail: " + res.data.message;
            } else if (res.status == 404) {
                _ctrl.error = "The server at URI: " + res.config.url + " has responded that the record was not found.";
                if (res.data.message)
                    _ctrl.error += " Message Detail: " + res.data.message;
            } else if (res.status == 500) {
                _ctrl.error = "The server at URI: " + res.config.url + " has responded with an internal server error message.";
                if (res.data.message)
                    _ctrl.error += " Message Detail: " + res.data.message;
            } else if (res.status == "badSchema") {
                _ctrl.error = "Record type is invalid meaning that the data being sent to the server is not in a  supported format.";
            } else if (res.data && res.data.Message)
                _ctrl.error = res.data.Message;
            else
                _ctrl.error = res.data;
        }
    }];


});