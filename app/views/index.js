define(['app', 'lodash', 'moment','text!./ouical-dialog.html', 'directives/mobi-menu','ngSmoothScroll','scroll-directive','directives/cbd-article',
    'filters/propsFilter',
    'filters/moment',
    'filters/truncate',
    'services/filters',
    'directives/pagination',
    'directives/tool-tip',
    'directives/room-table',
    'ui.select',
    'directives/mobi-menu',
    'directives/share',
    'ouical',
    'directives/ouical',
    'ngDialog',
    'directives/reg-open',
], function(app, _, moment,ouicalDialog) {

    return ['$scope','mongoStorage', '$route', '$http', '$timeout','$q','$location','$templateCache','ngDialog',function($scope,mongoStorage, $route, $http,$timeout,$q,$location,$templateCache,ngDialog) {

        var _ctrl = this;
        _ctrl.hasError = hasError;
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
        _ctrl.aichiLink=aichiLink;
        _ctrl.aichiImgLink=aichiImgLink;
        _ctrl.calDialog=calDialog;
        _ctrl.isChromeIOS = isChromeIOS;
        _ctrl.goTo=goTo;
        _ctrl.isRegistrationOpen=isRegistrationOpen
        load();
        return this;


        //==============================
        //
        //==============================
        function getArticle() {
          $scope.articleQuery = getArticleQuery();

          $scope.onArticleLoad = function(article){               
              
              $scope.article = article;
              $scope.isLoading = false;
          } 

        }
        
        //==============================
        //
        //==============================
        function getArticleQuery(indeNotice){
          let ag   = []
          let tags = []
         
          tags[0] = encodeURIComponent('inde-side-events')
          
          if(indeNotice)
            tags[1] = encodeURIComponent('inde-side-events-notice') 
          let match = { 'adminTags.title.en' : { $all: tags }}

          ag.push({'$match'   : match })
          ag.push({'$project' : { title:1, summary:1, content:1, coverImage:1}})
          ag.push({'$sort'    : { 'meta.updatedOn':-1}})
          ag.push({'$limit'   : 1 })

          return ag
        }
        
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
            getArticle()
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
        function isChromeIOS(){

          if(/CriOS/i.test(navigator.userAgent) &&
              /iphone|ipod|ipad/i.test(navigator.userAgent)){
                  return true;
              }else{
                  return false;
              }
        }

        //==============================
        //
        //==============================
        function isRegistrationOpen(){
          var sideEvents

          if(_ctrl.confObj && _ctrl.confObj.schedule && _ctrl.confObj.schedule.sideEvents)
            sideEvents = _ctrl.confObj.schedule.sideEvents
          else
            return false


          var isAfter  = moment(Date.now()).isAfter(moment.tz(sideEvents.start,_ctrl.confObj.timezone))
          var isBefore = moment(Date.now()).isBefore(moment.tz(sideEvents.end,_ctrl.confObj.timezone))

          if( isAfter && isBefore )
            return true
          else
            return false

        }

        //============================================================
        //
        //============================================================
        function calDialog (res) {

            $scope.dialogRes=res;
            $scope.rooms=_ctrl.rooms;
            $scope.isChromeIOS = isChromeIOS;

            ngDialog.open({
                template: ouicalDialog,
                className: 'ngdialog-theme-default',
                closeByDocument: true,
                plain: true,
                scope: $scope
            });

        }; //$scope.roomDialog

        //==============================
        //
        //==============================
        function hasImage(logo) {

            if(!logo || logo==='app/images/ic_event_black_48px.svg'  || logo.indexOf('mongo.document.attachments.temporary')>0 || logo.includes('cbd.documents.temporary'))
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

                if((typeof _ctrl.hostOrgsSelected !== "undefined") )
                  loadList(0);
            });
            $scope.$watch('indexCtrl.search', function() {
                if((typeof _ctrl.search !== "undefined" ))
                  loadList(0);
            });
            $scope.$watch('indexCtrl.conference', function() {

                if((typeof _ctrl.conference !== "undefined") ){
                  _ctrl.confObj = _.find(_ctrl.conferences,{'_id':_ctrl.conference});

                  delete(_ctrl.rooms);
                  delete(_ctrl.venueObj);

                  loadVenue();
                  loadRooms();
                }
            });
            $scope.$watch('indexCtrl.selectedTime', function(prev) {
                var selectedT=null;

                if(typeof _ctrl.selectedTime ==="undefined" ){
                  if(!_ctrl.confObj) return
                    var sideEvents = _ctrl.confObj.schedule.sideEvents

                    if(sideEvents && moment(moment.utc()).isBefore(moment.tz(sideEvents.search.start,_ctrl.confObj.timezone))){
                      _ctrl.selectedTime='all'
                      selectedT='all';
                      _ctrl.itemsPerPage=50;
                    }
                    else
                      _ctrl.selectedTime=_ctrl.sideEventTimes[1]?.value //moment.tz(Date.now(),_ctrl.confObj.timezone)
                }
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
                        //   $timeout(function(){
                        //     _.each(_ctrl.allOrgs, function(org) {
                        //         var image = new Image();
                        //         if(org.logo && org.logo.indexOf('mongo.document.attachments.temporary')==-1){
                        //             image.src = org.logo;
                        //             _ctrl.preLoadImages.push(image);
                        //         }
                        //     });
                        //   });

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

        var inProgress = false;
        //============================================================
        //
        //============================================================
        function aichiLink(target) {
            if(!target)return '';
            var number = Number(target.substring(target.length-2));
            return 'https://www.cbd.int/aichi-targets/target/'+number;
        }

        //============================================================
        //
        //============================================================
        function aichiImgLink(target) {
            if(!target)return '';
            var number = Number(target.substring(target.length-2));
            return 'https://www.cbd.int/app/images/aichi-targets/abt-'+number+'-96.png';
        }
        //=======================================================================
        //
        //=======================================================================
        function loadList  (pageIndex) {
          if(inProgress)return $q.defer();
            inProgress = true;
            _ctrl.loading = true;
            if(!pageIndex) pageIndex=0;

            _ctrl.itemsPerPage=Number(_ctrl.itemsPerPage);

            return $q.all([loadSideEventTypes(),loadOrgs(), loadConferences(1),loadSubjects(),mongoStorage.getCountries()]).then(function() {
                var q = buildQuery ();
                var f =  {'sideEvent.targets':1,start:1,end:1,title:1,description:1,'sideEvent.title':1,'sideEvent.description':1,'sideEvent.id':1,'sideEvent.hostOrgs':1,'location.room':1};

                return mongoStorage.loadDocs('reservations',_.clone(q), (pageIndex * Number(_ctrl.itemsPerPage)),Number(_ctrl.itemsPerPage),1,_ctrl.sort,f,false).then(function(response) {

                    loadListPostProcess (response);
                    refreshPager(pageIndex);
                    _ctrl.loading=false;
                    inProgress = false;
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
                    if(doc.sideEvent)
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
              return mongoStorage.loadConferences(1).then(function(o) {
                
                  _ctrl.conferences = o;
                  loadMultipleSideEventsPublished();

                  if(!_ctrl.conference)selectConference();

              }).then(loadDates).catch(onError);

            else return $q.resolve(_ctrl.conferences);
        }

        function selectConference() {

          const force = _ctrl.multipleSideEventsPublished;

          for (const aConference of _ctrl.conferences) {
              const { sideEvents } = aConference?.schedule || {};

              if(force){
                _ctrl.conference = aConference._id;
                _ctrl.confObj = aConference;
                _ctrl.confObj.selected = true;
                break;
              }

              if(!sideEvents || !aConference.active ) continue;

              _ctrl.conference = aConference._id;
              _ctrl.confObj = aConference;
              _ctrl.confObj.selected = true;

              break;
          }
      }
        function loadMultipleSideEventsPublished(){
          _ctrl.conferencesSideEventsPublished = _ctrl.conferencesSideEventsPublished || []

          for (const aConference of _ctrl.conferences) {
            const { sideEventsPublished } = aConference?.schedule?.sideEvents || {};

            if(!sideEventsPublished) continue;

            _ctrl.conferencesSideEventsPublished.push(aConference)
          }

          _ctrl.conferencesSideEventsPublished.reverse();
          _ctrl.multipleSideEventsPublished = (_ctrl.conferencesSideEventsPublished?.length || 0) > 1;

        }

        //============================================================
        //
        //============================================================
        function loadDates() {

            if(!_ctrl.confObj){
              console.log(_ctrl.conference,_ctrl.conferences)
              _ctrl.confObj = _.find(_ctrl.conferences,{'_id':_ctrl.conference});
            }

            generateDays()

            _ctrl.sideEventTimes = getSideEventTimeIntervals( _ctrl.confObj.timeObjects);

            
        }

        function generateDays() {
          if(!_ctrl.confObj) throw new Error('Conference not found', _ctrl.conference);
          const { StartDate, EndDate, timezone, timezoneLink } = _ctrl.confObj

          const tz = timezoneLink || timezone

          if(timezoneLink) moment.tz.link(`${timezone}|${timezoneLink}`)

          const startDate = moment.utc(moment.tz(StartDate,tz)).startOf();
          const endDate   = moment.utc(moment.tz(EndDate,tz))  .startOf();

          const totalDays = moment(endDate).diff(startDate,'days')

          const days        = []
          const timeObjects = { days, totalDays, endDate, startDate, tz }

          for (let i = 0; i < totalDays; i++) {

            const date = moment.utc(moment.tz(startDate,tz)).add(i,'days');

            if(!isExcludedDay(date))
              days.push(date);
          }

          _ctrl.confObj.timeObjects = timeObjects

          timeObjects.sideEventTimeIntervals = getSideEventTimeIntervals(timeObjects)

          
        }

        function isExcludedDay(date){
          const {  timezone, timezoneLink, schedule } = _ctrl.confObj

          const tz = timezoneLink || timezone

          const excludedDays = (schedule?.sideEvents?.excludedDayTier || []).filter(({ tier })=> !tier)

          for (const { day } of excludedDays) {
            const theDay = moment.utc(moment.tz(day,tz)).startOf();

            if(theDay.isSame(date, 'day')) return true
          }
          
          return false
        }

        function getSideEventTimeIntervals({ tz, days }){
          const { seTiers }              = _ctrl.confObj?.schedule?.sideEvents || {}
          const   sideEventTimeIntervals = [{ title:'All Days', value:'all', selected:true }]

          for (const day of days)
            for (const tier of seTiers) {
              const now      = moment().tz(tz).subtract(90,'minutes')
              const interval = moment.tz(day, tz).startOf('day').add(tier.seconds,'seconds')
              const isM27    = moment.tz(day, tz).startOf('day').isSame('2022-03-27T00:00:00+01:00')

              if(isM27) interval.subtract(1, 'hour')

              if(now.isBefore(interval))
                sideEventTimeIntervals.push({title: interval.format('dddd MMM Do  HH:mm'),value:interval.format()})
              
            }
            
          return sideEventTimeIntervals
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
                  q['$text'] = {'$search':'"'+_ctrl.search+'"'};  // jshint ignore:line
                else if(_ctrl.search.length>0 && Number(_ctrl.search))
                  q['sideEvent.id'] = Number(_ctrl.search);  // jshint ignore:line
            }

            if(_ctrl.selectedTime && _ctrl.selectedTime!=='all'){
              q.start=  {
                      '$gte': {
                          '$date': moment.tz(_ctrl.selectedTime,_ctrl.confObj.timezone)
                      }
                  }

                // q.end= {
                //         '$lt': {
                //             '$date': moment.tz(_ctrl.selectedTime,_ctrl.confObj.timezone).add(4,'hours')
                //         }
                //     }
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
        function goTo(url) {
            return $location.url(url);
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
