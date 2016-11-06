define(['app', 'lodash', 'moment', 'directives/mobi-menu','ngSmoothScroll','scroll-directive',
    'filters/propsFilter',
    'filters/moment',
    'filters/truncate',
    'services/filters',
    'directives/pagination',
    'directives/room-table',
    'ui.select',
    'directives/mobi-menu',
], function(app, _, moment) {

    return ['$scope','mongoStorage', '$route', '$http', '$timeout','$q','$location','$templateCache',function($scope,mongoStorage, $route, $http,$timeout,$q,$location,$templateCache) {

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
        _ctrl.roomDisplay=  roomDisplay;
        _ctrl.hasImage=hasImage;
        _ctrl.filter={};
        _ctrl.filter.status = 'all';
        _ctrl.sort={'start': 1};
        _ctrl.advanced=false;
        _ctrl.toggleAdvanced=toggleAdvanced;
        load();
        return this;

        //==============================
        //
        //==============================
        function toggleAdvanced() {
            _ctrl.search='';
            _ctrl.hostOrgsSelected=[];
            _ctrl.advanced=!_ctrl.advanced;
        }

        //==============================
        //
        //==============================
        function load() {
            $("head > title").text("CBD Side-events ");
            $templateCache.put("bootstrap/select-multiple.tpl.html","<div class=\"ui-select-container ui-select-multiple ui-select-bootstrap dropdown form-control\" ng-class=\"{open: $select.open}\"><div><div class=\"ui-select-match\"></div><input type=\"search\" autocomplete=\"off\" autocorrect=\"off\" autocapitalize=\"off\" spellcheck=\"false\" class=\"ui-select-search input-xs\" placeholder=\"{{$selectMultiple.getPlaceholder()}}\" ng-disabled=\"$select.disabled\" ng-click=\"$select.activate()\" ng-model=\"$select.search\" ng-model=\"$select.search\" ng-model-options=\"{debounce: 1000}\" role=\"combobox\" aria-label=\"{{ $select.baseTitle }}\" ondrop=\"return false;\"></div><div class=\"ui-select-choices\"></div><div class=\"ui-select-no-choice\"></div></div>");

            loadList(0).then(initWatches);
        }

        //==============================
        //
        //==============================
        function roomDisplay(id,property) {
            if(!_ctrl.rooms)return;
            return  _.find(_ctrl.rooms,{'_id':id})[property];

        }

        //==============================
        //
        //==============================
        function hasImage(logo) {

            if(!logo || logo==='app/images/ic_event_black_48px.svg'  || logo.indexOf('mongo.document.attachments.temporary')>0)
              return false;
            else
            return true;

        }

        //==============================
        //
        //==============================
        function loadSubjects() {

           if(!_ctrl.subjects)
            return $http.get("/api/v2013/thesaurus/domains/CBD-SUBJECTS/terms", {
                cache: true
            }).then(function(res){_ctrl.subjects = res; });
          else
            return $q.resolve(_ctrl.subjects);
        }

        //==============================
        //
        //==============================
        function loadRooms() {

          if(!_ctrl.rooms)
            return $http.get("/api/v2016/conferences/"+_ctrl.confObj._id+"/rooms", {
                cache: true
            }).then(function(res){_ctrl.rooms = res.data; });
          else
            return $q.resolve(_ctrl.rooms);
        }

        //==============================
        //
        //==============================
        function loadVenue() {
          if(!_ctrl.venueObj)
            return $http.get("/api/v2016/venues/"+_ctrl.confObj.venueId, {
                cache: true
            }).then(function(res){_ctrl.venueObj = res.data; });
            else
              return $q.resolve(_ctrl.venueObj);
        }

        //============================================================
        //
        //============================================================
        function initWatches() {
            $scope.$watch('indexCtrl.hostOrgsSelected', function() {

                if(typeof _ctrl.hostOrgsSelected !== "undefined")
                  loadList(0);
            });
            $scope.$watch('indexCtrl.search', function() {
                if(typeof _ctrl.search !== "undefined")
                  loadList(0);
            });
            $scope.$watch('indexCtrl.conference', function() {
                if(typeof _ctrl.conference !== "undefined"){
                  _ctrl.confObj = _.find(_ctrl.conferences,{'_id':_ctrl.conference});
                  delete(_ctrl.rooms);
                  delete(_ctrl.venueObj);
                  loadRooms();
                  loadVenue();
                  loadList(0);
                }
            });
            $scope.$watch('indexCtrl.selectedTime', function() {
                if(typeof _ctrl.selectedTime !== "undefined")
                  loadList(0);
            });
        }

        //============================================================
        //
        //============================================================
        function loadOrgs() {
            if(!_ctrl.allOrgs || _.isEmpty(_ctrl.allOrgs))
              return  mongoStorage.loadOrgs().then(function(orgs) {
                          _ctrl.allOrgs = orgs;
                          $timeout(function(){
                            _.each(_ctrl.allOrgs, function(org) {
                                var image = new Image();
                                if(org.logo && org.logo.indexOf('mongo.document.attachments.temporary')==-1){
                                    image.src = org.logo;
                                    _ctrl.preLoadImages.push(image);
                                }
                            });
                          });

                      });
            else return $q.resolve(_ctrl.allOrgs);
        }



        //==============================
        //
        //==============================
        function isPastConfrence(id) {

            var c = _.find(_ctrl.conferences,{'_id':id});
            if(!c) throw "error: conference not found";

            if(moment.tz(c.EndDate,_ctrl.confObj.timezone).add(2,'weeks').isBefore(moment.tz(moment(),_ctrl.confObj.timezone)))
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
            if(pageCount<5) end++;
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

            _ctrl.itemsPerPage=Number(_ctrl.itemsPerPage);

            return $q.all([loadSideEventTypes(),loadOrgs(), loadConferences(),loadSubjects(),mongoStorage.getCountries()]).then(function() {
                var q = buildQuery ();

                return mongoStorage.loadDocs('reservations',_.clone(q), (pageIndex * Number(_ctrl.itemsPerPage)),Number(_ctrl.itemsPerPage),1,_ctrl.sort).then(function(response) {

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
                  _ctrl.conferences=o.sort(compareDates); //= $filter("orderBy")(o.data, "StartDate");


                  if(!_ctrl.conference){
                    _ctrl.conference=_ctrl.conferences[0]._id;
                    _ctrl.conferences[0].selected=true;
                  }
              }).then(loadDates).catch(onError);

            else return $q.resolve(_ctrl.conferences);
        }

        //============================================================
        //
        //============================================================
        function loadDates() {
            if(!_ctrl.confObj){
              _ctrl.confObj = _.find(_ctrl.conferences,{'_id':_ctrl.conference});
              loadRooms();
            }

            var numDays = moment.tz(_ctrl.confObj.EndDate,_ctrl.confObj.timezone).diff(_ctrl.confObj.StartDate,'days');

            _ctrl.sideEventTimes=[{title:'All Days',value:'all', selected:true}];
            if(typeof _ctrl.selectedTime ==="undefined")
              _ctrl.selectedTime='all';

            for(var i=1; i<=numDays; i++)
            {
              _ctrl.sideEventTimes.push({title:moment.tz(_ctrl.confObj.StartDate,_ctrl.confObj.timezone).startOf().add(i,'days').add(_ctrl.confObj.seTiers[0],'seconds').format('dddd MMM Do @ HH:mm'),value:moment.tz(_ctrl.confObj.StartDate,_ctrl.confObj.timezone).startOf().add(i,'days').add(_ctrl.confObj.seTiers[0],'seconds').format()});
              _ctrl.sideEventTimes.push({title:moment.tz(_ctrl.confObj.StartDate,_ctrl.confObj.timezone).startOf().add(i,'days').add(_ctrl.confObj.seTiers[1],'seconds').format('dddd MMM Do @ HH:mm'),value:moment.tz(_ctrl.confObj.StartDate,_ctrl.confObj.timezone).startOf().add(i,'days').add(_ctrl.confObj.seTiers[1],'seconds').format()});
            }

        }

        //=======================================================================
        //
        //=======================================================================
        function buildQuery () {
            var q = {};

            q.start={'$exists':1};
            q.start={'$ne':null};
            if(_ctrl.conference) q['location.conference']=_ctrl.conference;

            if($location.search().search){
                _ctrl.search = $location.search().search;
                $location.search('search','');
            }
            if(_ctrl.search ){
                if(_ctrl.search && _ctrl.search.length>0 && !Number(_ctrl.search))
                  q['$text'] = {'$search':_ctrl.search};  // jshint ignore:line
                else if(_ctrl.search.length>0 && Number(_ctrl.search))
                  q['sideEvent.id'] = Number(_ctrl.search);  // jshint ignore:line
            }

            if(_ctrl.selectedTime && _ctrl.selectedTime!=='all')
                q['$and']= [{
                    'start': {
                        '$gte': {
                            '$date': _ctrl.selectedTime
                        }
                    }
                }, {
                    'end': {
                        '$lt': {
                            '$date': moment.tz(_ctrl.selectedTime,_ctrl.confObj.timezone).add(4,'hours')
                        }
                    }
                }];
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
            if(!_ctrl.seTypes || _.isEmpty(_ctrl.seTypes))
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
            else return $q.resolve(_ctrl.seTypes);

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