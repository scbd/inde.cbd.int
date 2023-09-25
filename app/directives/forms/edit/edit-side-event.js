define(['app', 'lodash',
    'text!./edit-side-event.html',
    'moment',
    'text!directives/forms/edit/publish-dialog.html',
    'text!directives/forms/edit/dirty-form.html',
    'directives/forms/controls/scbd-select-list',
    'services/mongo-storage',
    'directives/forms/controls/scbd-file-upload',
    './edit-organization',
    './edit-link',
    'directives/link-list',
    'services/theasarus', 'ngDialog', 'ngSmoothScroll',
    'directives/fade-in-tab',
    'directives/bs-progress-bar',
    'services/filters',
    'ng-ckeditor',
    'ui.select',
    'filters/propsFilter',
    'services/reloader'
], function(app, _, template, moment, dialogTemplate) {
    app.directive("editSideEvent", [ '$q', '$http', '$filter', '$route', 'mongoStorage', '$location', 'authentication', '$window', 'ngDialog', '$compile', '$timeout', 'smoothScroll', 'history', '$rootScope', 'Thesaurus','$routeParams','reloader', //"$http", "$filter", "Thesaurus",
        function( $q, $http, $filter, $route, mongoStorage, $location, auth, $window, ngDialog, $compile, $timeout, smoothScroll, history, $rootScope, Thesaurus,$routeParams,reloader) {
            return {
                restrict: 'E',
                template: template,
                replace: true,
                transclude: false,
                scope: {},
                link: function($scope) {
                        var numHostOrgs = 0;
                        var meetingInit = false;

                        $scope.onConferenceChange = onConferenceChange;

                        initScope($scope, $route, $location);
                        init();


                        var killWatch = $scope.$watch('doc.conference', function() {
                            if (!$scope.doc.conference) return 

                            generateDates();
                            killWatch();
                        });

                        $scope.$watch('doc.meetings', function() {
                            if ($scope.doc.meetings) generateDates();
                        });

                        $scope.$watch('doc.hostOrgs', function() {
                            if ($scope.doc.hostOrgs && $scope.doc.hostOrgs.length > 0) {
                                $(document.getElementById('editForm.hostOrgs')).css('border-color', '#cccccc');
                                $(document.getElementById('hostOrg-error')).removeClass('has-error-div');
                                $(document.getElementById('hostOrgMsg')).css('display', 'none');
                                loadHostOrgs();
                                if(numHostOrgs < $scope.doc.hostOrgs.length){
                                  if(!$scope.prevPublished){
                                    $scope.doc.validTabs.orgs=false;
                                    $scope.doc.validTabs.contact=false;
                                  }
                                }else{
                                  $scope.doc.validTabs.orgs=true;
                                  if(validateResponsibleOrgs() && $scope.doc.validTabs.contact)
                                    $scope.doc.validTabs.contact=true;
                                }
                                _.each($scope.doc.hostOrgs, function(resOrg, key) {
                                    if(!_.isEmpty($scope.doc.responsibleOrgs) && $scope.doc.responsibleOrgs[key] && $scope.doc.responsibleOrgs[key] && !$scope.doc.responsibleOrgs[key].lastName && !$scope.doc.responsibleOrgs[key].email)
                                      $scope.doc.responsibleOrgs[key].sameAs='';
                                });

                                if($scope.doc.responsible && !$scope.doc.responsibleLastName && !$scope.doc.responsibleOrgsEmail)
                                  $scope.doc.responsible.sameAs='';

                            }
                        }, true);

                        //============================================================
                        //
                        //============================================================
                        function loadSubjects()
                        {
                            return $http.get("/api/v2013/thesaurus/domains/CBD-SUBJECTS/terms", {
                                cache: true
                            }).then(function(o) {
                              $scope.options.subjectsTree =Thesaurus.buildTree(o.data);
                              $scope.options.subjects = [];
                              $scope.options.subjects.push({identifier:' ',name:' '});
                              $scope.options.subjectsTree.forEach(function(s){
                                  s.group=true;
                                  $scope.options.subjects.push(s);

                                  s.narrowerTerms.forEach(function(s2){
                                    $scope.options.subjects.push(s2);
                                  });
                              });

                            }).catch(onError);
                        }

                        //============================================================
                        //
                        //============================================================
                        function loadGbfTargets()
                        {
                            return $http.get("/api/v2013/thesaurus/domains/GBF-GOALS-TARGETS/terms", {
                                cache: true
                            }).then(function(o) {
                                $scope.options.gbfTargets = o.data;

                            }).catch(onError);
                        }

                        function loadLangs(){
                            return $http.get("/api/v2013/thesaurus/domains/ISO639-2/terms", {
                                cache: true
                            }).then(function(o) {
                              $scope.options.langs = o.data;

                            }).catch(onError);
                        }
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
                            } else if (res.data && res.data.Message)
                                $scope.error = res.data.Message;
                            else
                                $scope.error = res.data || res;
                        }

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
                        function loadConferences(selectedConference) {
                            return $http.get('/api/v2016/conferences', { 'params': findOpenRegsQuery() }).then(function(res) {
                                
                                const conferences = res.data.sort(compareDates).reverse();
                                const { meetingId } = $route.current.params || {};

                                $scope.options.conferences = isNew() && meetingId? [_.find(conferences, { MajorEventIDs: [ meetingId ] })] : res.data.sort(compareDates).reverse();

                                if(! selectedConference)
                                    return $scope.options.conferences
                            
                                $scope.options.conferences = $scope.options.conferences.filter(({ _id }) => _id === selectedConference);
                                setSelectedConference($scope.options.conferences[0])

                                return $scope.options.conferences
                                
                            })
                            .then(loadMeetingsData)
                            .catch(onError);
                        }

                        function setMeetingsInConf(res){
                            var meetings = res.data
                            var conferences = $scope.options.conferences
                            for (var j =0; j< meetings.length; j++)
                                for (var i = 0; i<conferences.length; i++) {
                                    const { excludedMeetings = [] } = conferences[i]?.schedule?.sideEvents || {}

                                    if(!conferences[i].meetings) conferences[i].meetings = []
                                    if(_.includes(conferences[i].MajorEventIDs,meetings[j]._id )){
                                        meetings[j].selected = false

                                        if(!excludedMeetings.includes(meetings[j]._id))
                                            conferences[i].meetings.push(meetings[j])
                                    }
                                }

                            if(conferences.length === 1)
                                $scope.options.conferenceObj = conferences[0]

                            if($scope.options.conferenceObj)
                                setMeetingsFilteredOption();

                        }

                        function onConferenceChange(_id){
                            allMeetingsNotSelected ();
                            $scope.options.conferenceObj.selected = false;
                            $scope.options.conferenceObj = getSelectedConference(_id);
                            setSelectedConference($scope.options.conferenceObj)
                            $scope.doc.meetings = [];
                            generateDates();
                            setMeetingsFilteredOption();
                            
                        }

                        function allMeetingsNotSelected (){
                            const { conferences = [] } = $scope.options;

                            for (const aConference of conferences){
                                for (const aMeeting of aConference.meetings){
                                    aMeeting.selected = false;
                                }
                            }
                        }


                        function setMeetingsFilteredOption(){
                            const { excludedMeetings = [] } = $scope?.options?.conferenceObj?.schedule?.sideEvents || {}

                            $scope.options.meetingsFiltered = $scope.options.conferenceObj.meetings.filter(({_id}) => !(excludedMeetings || [] ) .includes(_id));
                        }

                        function getSelectedConference(_id){
                            const { conferences = [] } = $scope.options;
                            const { meetingId } = $route.current.params || {};

                            if(conferences.length === 1) return conferences[0];

                            if(_id) return _.find(conferences, { _id });
                            if(!isNew() && $scope.doc.conference)
                            return _.find(conferences, { _id: $scope.doc.conference });

                            if(conferences.find(({ selected }) => selected)) return conferences.find(({ selected }) => selected);


                            if(isNew() && meetingId)
                                return _.find(conferences, { MajorEventIDs: [meetingId] });

                            if(conferences[0])
                                return conferences[0];

                            throw new Error('No conference found')
                        }

                        function setSelectedConference(confObj){
                            confObj.selected = true;
                            $scope.options.conferenceObj = confObj;
                            $scope.doc.conference = confObj._id;

                            return confObj
                        }

                        function loadMeetingsData(conferences){
                            var ids = getMeetingIds(conferences)
                            $http.get('/api/v2016/meetings', { 'params': meetingsQuery(ids) }).then(setMeetingsInConf)
                        }

                        function meetingsQuery(meetingIds){
                            return  {
                                        q:  { '_id': { '$in': meetingIds } },
                                        f: {titleShort:1, EVT_CD:1, EVT_TO_DT:1, EVT_FROM_DT:1},
                                        s: { EVT_FROM_DT: 1 }
                                    }
                        }

                        function getMeetingIds(conferences){
                            var meetingIds = []

                            if(!conferences || !Array.isArray(conferences) || !conferences.length) return meetingIds

                            for (var i = 0; i < conferences.length; i++) 
                                for (var j = 0; j < conferences[i].MajorEventIDs.length; j++) 
                                meetingIds.push({'$oid': conferences[i].MajorEventIDs[j]})

                            return meetingIds
                        }

                        function findOpenRegsQuery(){
                            const institution = { '$or': [ { institution: 'CBD' }, { institution: 'cbd' } ] };
                            const schedule    = { schedule: { $exists: true } };
                            const q = { $or: [
                                                { 'schedule.sideEvents.start': { $lte: { $date: moment.utc() } }, 'schedule.sideEvents.end': { $gt: { $date: moment.utc() } }, ...institution, ...schedule },// open side event reg
                                                { EndDate: { $gt: { $date: moment.utc() } }, ...institution, ...schedule } // future conference
                                            ] };

                            return { q, s: { 'schedule.sideEvents.start': 1 } }
                        }

                        //============================================================
                        //
                        //============================================================
                        $scope.$on('$locationChangeStart', function(event) {

                            if ($scope.editForm.$dirty && !$scope.ignoreDirtyCheck) {
                                var answer = confirm("Are you sure you want to leave this page, your data has not been saved?");
                                if (!answer)
                                    event.preventDefault();
                            }

                        });

                        //============================================================
                        //
                        //============================================================
                        $scope.publishRequestDial = function() {

                            var dialog = ngDialog.open({
                                template: dialogTemplate,
                                className: 'ngdialog-theme-default',
                                closeByDocument: false,
                                plain: true,
                                scope: $scope
                            });
                            $scope.ignoreDirtyCheck = true;
                            dialog.closePromise.then(function(ret) {

                                if (ret.value === 'draft') $scope.saveDoc().then(function() {
                                    $scope.goTo('/manage');
                                });
                                if (ret.value === 'publish') $scope.requestPublish().catch(onError);

                            });
                        };

                        //============================================================
                        //
                        //============================================================
                        $scope.sameAs = function(selectedValue, row) {

                            if (row === 'responsible')
                                sameAsResponisble(selectedValue);
                            else if (_.isNumber(row))
                                sameAsResponisbleOrg(selectedValue, row);
                        };

                        //============================================================
                        //
                        //============================================================
                        $scope.allSameAsOptionsInUse = function() {

                            return (_.find($scope.doc.responsibleOrgs, {
                                    sameAs: 'me'
                                }) &&
                                _.find($scope.doc.responsibleOrgs, {
                                    sameAs: 'contact'
                                }) &&
                                _.find($scope.doc.responsibleOrgs, {
                                    sameAs: 'principal'
                                })
                            );
                        };

                        //============================================================
                        //
                        //============================================================
                        $scope.isContactUsedInSameAs = function(index) {
                            if (!$scope.doc.responsibleOrgs) $scope.doc.responsibleOrgs = [];

                            return ((_.find($scope.doc.responsibleOrgs, {
                                        sameAs: 'contact'
                                    }) ||
                                    ($scope.doc.responsibleOrgs[index] && !!(_.find($scope.doc.responsibleOrgs, {
                                        email: $scope.doc.contact.email
                                    })))
                                ) &&
                                (!$scope.doc.responsibleOrgs[index] || ($scope.doc.responsibleOrgs[index] && ($scope.doc.responsibleOrgs[index].sameAs !== 'contact'))));


                        };

                        //============================================================
                        //
                        //============================================================
                        $scope.isMeUsedInSameAs = function(index) {
                            if (!$scope.doc.responsibleOrgs) $scope.doc.responsibleOrgs = [];

                            return ((_.find($scope.doc.responsibleOrgs, {
                                        sameAs: 'me'
                                    }) ||
                                    ($scope.doc.responsibleOrgs[index] && !!(_.find($scope.doc.responsibleOrgs, {
                                        email: $scope.me.email
                                    })))
                                ) &&
                                (!$scope.doc.responsibleOrgs[index] || ($scope.doc.responsibleOrgs[index] && ($scope.doc.responsibleOrgs[index].sameAs !== 'me'))));

                        };
                        //============================================================
                        //
                        //============================================================
                        $scope.numStepsCompleted = function() {
                              var count =0;
                              _.each($scope.doc.validTabs,function(tab,key){
                                if(tab && (key!=='links' || key!=='publications' || key!=='images' || key!=='videos' )) count++;
                              });
                              if($scope.doc.meta && ($scope.doc.meta.status==='published' || $scope.doc.meta.status==='request') && count===4)
                                count++;

                                return count;

                        };

                        //============================================================
                        //
                        //============================================================
                        function showProgress() {
                          $scope.showProg=true;
                              $timeout(function(){
                                if($scope.numStepsCompleted()===5)
                                  $scope.showProg = false;
                              },5000);
                        }

                        //============================================================
                        //
                        //============================================================
                        $scope.isPrincipalUsedInSameAs = function(index) {
                            if (!$scope.doc.responsibleOrgs) $scope.doc.responsibleOrgs = [];
                            return ((_.find($scope.doc.responsibleOrgs, {
                                        sameAs: 'principal'
                                    }) ||
                                    ($scope.doc.responsibleOrgs[index] && $scope.doc.responsible && !!(_.find($scope.doc.responsibleOrgs, {
                                        email: $scope.doc.responsible.email
                                    })))
                                ) &&
                                (!$scope.doc.responsibleOrgs[index] || ($scope.doc.responsibleOrgs[index] && ($scope.doc.responsibleOrgs[index].sameAs !== 'principal'))));

                        };

                        //============================================================
                        // load responsible person for SE with data
                        //============================================================
                        function sameAsResponisble(selectedValue) {
                            switch (selectedValue) {
                                case 'contact':
                                    $scope.doc.responsible.personalTitle = $scope.doc.contact.personalTitle || '';
                                    $scope.doc.responsible.firstName = $scope.doc.contact.firstName || '';
                                    $scope.doc.responsible.lastName = $scope.doc.contact.lastName || '';
                                    $scope.doc.responsible.email = $scope.doc.contact.email || '';
                                    break;
                                case 'me':
                                    auth.getUser().then(function(user) {
                                        $scope.me = user;
                                        var nameArray = user.name.split(" ");
                                        $scope.doc.responsible.lastName = nameArray[nameArray.length - 1] || '';
                                        if (nameArray.length >= 3)
                                            $scope.doc.responsible.personalTitle = nameArray[0] || '';
                                        else {
                                            $scope.doc.responsible.firstName = nameArray[0] || '';
                                            $scope.doc.responsible.personalTitle = '';
                                        }
                                        $scope.doc.responsible.email = user.email || '';
                                    }).catch(onError);
                                    break;
                            }
                        } // $scope.sameAsResponisble

                        //============================================================
                        // load responsible person for ORG with data
                        //============================================================
                        function sameAsResponisbleOrg(selectedValue, row) {

                            switch (selectedValue) {
                                case 'contact':
                                    $scope.doc.responsibleOrgs[row].personalTitle = $scope.doc.contact.personalTitle || '';
                                    $scope.doc.responsibleOrgs[row].firstName = $scope.doc.contact.firstName || '';
                                    $scope.doc.responsibleOrgs[row].lastName = $scope.doc.contact.lastName || '';
                                    $scope.doc.responsibleOrgs[row].email = $scope.doc.contact.email || '';
                                    break;
                                case 'me':
                                    auth.getUser().then(function(user) {
                                        var nameArray = user.name.split(" ");
                                        $scope.doc.responsibleOrgs[row].lastName = nameArray[nameArray.length - 1] || '';
                                        if (nameArray.length >= 3)
                                            $scope.doc.responsibleOrgs[row].personalTitle = nameArray[0] || '';
                                        else {
                                            $scope.doc.responsibleOrgs[row].firstName = nameArray[0] || '';
                                            $scope.doc.responsibleOrgs[row].personalTitle = '';
                                        }
                                        $scope.doc.responsibleOrgs[row].email = user.email || '';
                                    });
                                    break;
                                case 'principal':

                                    $scope.doc.responsibleOrgs[row].personalTitle = $scope.doc.responsible.personalTitle || '';
                                    $scope.doc.responsibleOrgs[row].firstName = $scope.doc.responsible.firstName || '';
                                    $scope.doc.responsibleOrgs[row].lastName = $scope.doc.responsible.lastName || '';
                                    $scope.doc.responsibleOrgs[row].email = $scope.doc.responsible.email || '';
                                    break;
                            }
                        } // $scope.sameAsResponisble
                        //============================================================
                        //
                        //============================================================
                        $scope.requestPublish = function() {

                            $scope.ignoreDirtyCheck = true;

                            if($scope.doc.meta.status==='published' || $scope.scheduled)
                              $scope.doc.meta.status = 'published';
                            else
                              $scope.doc.meta.status = 'request';

                            return mongoStorage.save($scope.schema, cleanDoc($scope.doc), $scope._id).then(function() {

                                $scope.$emit('showSuccess', 'Side Event ' + $scope.doc.id + ' is Now Registered as a Request');
                                _.each($scope.doc.hostOrgs, function(org) {

                                    if (org.length > 2)
                                        mongoStorage.loadDoc('inde-orgs', org).then(function(conf) {
                                            if (conf.meta.status !== 'published')
                                                mongoStorage.requestDoc('inde-orgs', conf, conf._id);
                                        }).catch(function onerror(response) {
                                            $scope.onError(response);
                                        });
                                });
                            }).catch(onError);
                        };
                        //=======================================================================
                        //
                        //=======================================================================
                        function isEditable() {

                            if($scope.doc.meta)
                            if (isAdmin() || $scope.doc.meta.status ==='draft' || $scope.doc.meta.status ==='published' || $scope.doc.meta.status ==='request' || $scope.doc.meta.status ==='scheduled')
                                return true;
                            else
                                return false;
                        }
                        $scope.isEditable = isEditable;

                        //=======================================================================
                        //
                        //=======================================================================
                        function showEdit() {

                            if ((_.isBoolean($scope.editIndex) && $scope.editIndex) || _.isNumber($scope.editIndex))
                                return true;
                            else
                                return false;
                        }
                        $scope.showEdit = showEdit;
                        //=======================================================================
                        //
                        //=======================================================================
                        $scope.selectMeeting = function(docObj) {
                            $timeout(function() {
                                _.each($scope.options.meetingsFiltered, function(meeting) {
                                    meeting.selected = false;
                                    if(docObj._id === meeting._id){
                                        meeting.selected = true;
                                        $scope.doc.meetings = [docObj._id]
                                    }
                                });
                            });
                        }; // archiveOrg

                        function loadUser() {
                            return auth.getUser().then(function(user) {
                                $scope.me = user;
                            }).catch(onError);
                        }

                        function loadOrgs() {
                            return mongoStorage.loadOrgs().then(function(orgs) {
                                $scope.options.orgs = orgs;
                            }).catch(onError);
                        }

                        function showTab(validTabs){
                           var shownSelected = false;
                           if(_.isObject(validTabs))
                          _.each(validTabs,function(tab,key){
                                if(shownSelected) return;
                                if(!tab){

                                  $timeout(function(){$scope.tab = key;$('#'+key+'-tab').tab('show');});
                                  shownSelected=true;
                                }
                          });
                          else {

                            $timeout(function(){$scope.tab = validTabs;$('#'+validTabs+'-tab').tab('show');});
                          }

                        }
                        $scope.showTab=showTab;


                        //============================================================
                        //
                        //============================================================
                        function init() {


                            $scope.editIndex = false;

                            $q.all([loadUser(), loadCountries(), loadOrgs(),loadConferences(),loadSubjects(),loadGbfTargets(), loadLangs()]).then(function() {
                                showProgress();
                                
                                if ($scope._id !== '0' && $scope._id !== 'new') {

                                    if (($scope._id.search('^[0-9A-Fa-f]{24}$') < 0))
                                        $location.url('/404');
                                    else
                                        mongoStorage.loadDoc($scope.schema, $scope._id).then(function(document) {

                                            $scope.loading = true;
                                            $scope.doc = document;

                                            if($scope.doc.conference)
                                                loadConferences($scope.doc.conference)

                                            
                                            
                                            $scope.options.conferenceObj = getSelectedConference($scope.doc.conference);
                                            setSelectedConference($scope.options.conferenceObj)

                                            setMeetingsFilteredOption();

                                            $timeout(()=>initSelectedDates(), 1000);

                                            if (!$scope.doc.hostOrgs)
                                                $scope.doc.hostOrgs = [];
                                            if (!document.validTabs)
                                                $scope.doc.validTabs = {
                                                    'general': false,
                                                    'logistics': false,
                                                    'orgs': false,
                                                    'contact': false
                                                };
                                            showTab($scope.doc.validTabs);
                                            if (!$scope.doc.publications) $scope.doc.publications = [];
                                            if (!$scope.doc.images) $scope.doc.images = [];
                                            if (!$scope.doc.links) $scope.doc.links = [];
                                            if (!$scope.doc.videos) $scope.doc.videos = [];
                                            if(_.isArray($scope.doc.hostOrgs))
                                              numHostOrgs = $scope.doc.hostOrgs.length;
                                            else
                                                numHostOrgs = 0;
                                            if($scope.doc.subjects && $scope.doc.subjects.length)
                                              $scope.doc.subjects.forEach(function(item,index){

                                                      if(typeof item === 'object')
                                                        $scope.doc.subjects[index]=item.identifier;
                                              });

                                            $scope.loading=false;
                                            if($scope.doc.contact && $scope.me.email===$scope.doc.contact.email)
                                              $scope.preFill=true;
                                            else
                                              $scope.preFill=false;

                                              $http.get('/api/v2016/' + 'inde-side-events/prev-published/'+$scope.doc._id, {}).then(
                                                function(res){
                                                  $scope.prevPublished=res.data;
                                                }
                                              );
                                              $http.get('/api/v2016/' + 'inde-side-events/scheduled/'+$scope.doc._id, {}).then(
                                                function(res){
                                                  if(res.data)
                                                    $scope.scheduled=true;
                                                  else
                                                    $scope.scheduled=false;

                                                }
                                              );

                                              $timeout(()=>initSelectedDates(), 500);
                                              

                                        }).catch(onError);
                                } else {
                                    $scope.loading = true;
                                    $scope.doc = {};
                                    $scope.doc.meta={status:'draft'};
                                    $scope.doc.tempFile={};
                                    delete($scope._id);
                                    $scope.doc.logo = $scope.doc.logo = 'app/images/ic_event_black_48px.svg';
                                    //initProfile(true);

                                    $scope.doc.validTabs = {
                                        'general': false,
                                        'logistics': false,
                                        'orgs': false,
                                        'contact': false
                                    };

                                    if (!$scope.doc.hostOrgs) $scope.doc.hostOrgs = [];
                                    if (!$scope.doc.contact) $scope.doc.contact = {};
                                    if (!$scope.doc.publications) $scope.doc.publications = [];
                                    if (!$scope.doc.images) $scope.doc.images = [];
                                    if (!$scope.doc.links) $scope.doc.links = [];
                                    if (!$scope.doc.videos) $scope.doc.videos = [];
                                    if (!$scope.doc.prefDateTime)$scope.doc.prefDateTime={};
                                    if (!$scope.doc.prefDate)$scope.doc.prefDate={};
                                    if(!$scope.doc.requirements) $scope.doc.requirements={}
                                    if(!$scope.doc.requirements.hybrid) $scope.doc.requirements.hybrid={}

                                    $scope.options.conferenceObj = getSelectedConference();
                                    setSelectedConference($scope.options.conferenceObj);

                                    $scope.preFill=false;
                                    $scope.loading=false;

                                    initSelectedDates();

                                    setMeetingsFilteredOption();
                                }




                            }).catch(onError); // load orgs
                        } // init


                        function initSelectedDates(){
                            
                            for (const aMeeting of ($scope.options.meetingsFiltered || [])) {
                                const isSelectedMeeting = ([...($scope.doc.meetings || []), $scope.meetingId].includes(aMeeting._id))

                                if(isSelectedMeeting)
                                    aMeeting.selected = true

                            }
                        }




                        //============================================================
                        //
                        //============================================================
                        function generateDates() {
                    
                            if(!$scope.options.conferences) return;

                            var confr = $scope.options.conferenceObj 

                            $scope.options.dates = [];

                            var diff = Number(moment(confr.EndDate).format('X')) - Number(moment(confr.StartDate).format('X'));

                            var numDays = Math.ceil(diff / 86400) + 1;

                            var startDate = moment(confr.schedule.startMain).utc();
                            if (!$scope.options) $scope.options = {};
                            if (!$scope.options.dates) $scope.options.dates = [];
                            const { sideEventVisibleDays } = $scope.options.conferenceObj.schedule.sideEvents;

                            for (var i = 0; i < numDays; i++) {

                                if(~sideEventVisibleDays.indexOf(startDate.day()) && isMeetingDay(startDate) && !startDate.isSame(moment('2018-11-24T00:00:00-05:00')))
                                    if(!isExcludedDay(startDate))
                                        $scope.options.dates.push(startDate.format("(dddd) YYYY/MM/DD"));

                                startDate = startDate.add(1, 'day');
                            }



                            if(!$scope.doc.meetings )    $scope.doc.meetings = [];


                            _.each($scope.options.conferences, function(conf) {
                                if (conf._id === $scope.doc.conference || $scope.options.conferences.length===1)
                                    conf.selected = true;
                            });



                            $scope.options.requirements = $scope.options.conferenceObj.schedule.sideEvents.requirements || {}


                            if(!$scope.doc?.requirements?.hybrid?.platform)
                                $scope.doc.requirements.hybrid.platform = $scope.options.requirements.selectedHybridPlatform
                        } // init

                        function isExcludedDay(day){
                            if(!$scope.options?.conferenceObj?.schedule?.sideEvents?.excludedDayTier) return false

                            const { excludedDayTier = [] } = $scope?.options?.conferenceObj?.schedule?.sideEvents || []

                            const days = excludedDayTier.filter(({tier}) => !tier).map(({day}) => moment(day).utc().startOf('day'))

                            for (const excludedDay of days)
                                if(excludedDay.utc().isSame(day.startOf('day'))) return true
                            
                            return false
                        }

                        $scope.isExcludedTier = isExcludedTier
                        function isExcludedTier(testDayName, tier){
                            if(!$scope?.doc?.prefDate) return false
                            const testDay = $scope.doc.prefDate[testDayName]
                            if(!$scope.options?.conferenceObj?.schedule?.sideEvents?.excludedDayTier) return false

                            const { excludedDayTier } = $scope.options.conferenceObj.schedule.sideEvents
                            const   days              = excludedDayTier.filter(({tier}) => tier).map(({day}) => (moment(day).utc().startOf('day')).format("(dddd) YYYY/MM/DD"))
                            const   tiers             = excludedDayTier.filter(({tier}) => tier).map(({tier}) => tier)

                            if(!days.includes(testDay)) return false

                            const dayIndex = days.indexOf(testDay)

                            return tiers[dayIndex].toLowerCase() === tier
                        }
                        //============================================================
                        //
                        //============================================================
                        function isMeetingDay(day) {

                            if(!$scope.options.conferenceObj)
                              $scope.options.conferenceObj = _.find($scope.options.conferences, {
                                  _id: $scope.doc.conference
                              });

                            if(!$scope.meetingObj)
                              if($scope.meetingId)
                                $scope.meetingObj =_.find($scope.options.conferenceObj.meetings, {
                                   _id: $scope.meetingId
                                });
                              else
                              if($scope.doc.meetings && $scope.doc.meetings.length && !isAdmin())
                                for (var i = 0; i < $scope.doc.meetings.length; i++) {
                                  $scope.meetingObj =_.find($scope.options.conferenceObj.meetings, {
                                     _id: $scope.doc.meetings[i]
                                  });
                                  if($scope.meetingObj) break;
                                }

                            if($scope.meetingObj)
                                return day.isBetween(moment($scope.meetingObj.EVT_FROM_DT), moment($scope.meetingObj.EVT_TO_DT).add(1, 'days'));
                            else if($scope.options.conferenceObj)
                                return day.isBetween(moment.utc($scope.options.conferenceObj.StartDate).subtract(1, 'days'), moment.utc($scope.options.conferenceObj.EndDate).add(1, 'days'));
                            else false
                        } // init

                        //============================================================
                        //
                        //============================================================
                        function initProfile(preFill) {


                                if(preFill)
                                return $http.get('/api/v2013/users/' + $scope.me.userID).then(function onsuccess(response) {
                                    if (!$scope.doc) $scope.doc = {};
                                    if (!$scope.doc.contact) $scope.doc.contact = {};

                                    $scope.doc.contact.email = response.data.Email;
                                    $scope.doc.contact.address = response.data.Address;
                                    $scope.doc.contact.city = response.data.City;
                                    $scope.doc.contact.country = response.data.Country;

                                    $scope.doc.contact.personalTitle = response.data.Title;
                                    $scope.doc.contact.state = response.data.State;
                                    $scope.doc.contact.zip = response.data.Zip;
                                    $scope.doc.contact.phone = response.data.Phone;
                                    $scope.doc.contact.firstName = response.data.FirstName;
                                    $scope.doc.contact.lastName = response.data.LastName;
                                    $scope.doc.contact.jobTitle = response.data.Designation;

                                }).catch(onError);
                                else
                                  $scope.doc.contact = {};


                        } // initProfile()
                        $scope.initProfile=initProfile;

                        //============================================================
                        //
                        //============================================================
                        $scope.toggleIcon = function() {
                            if ($scope.doc.logo === 'app/images/ic_event_black_48px.svg')
                                $scope.doc.logo = '';
                            else
                                $scope.doc.logo = 'app/images/ic_event_black_48px.svg';
                        };



                        //=======================================================================
                        //
                        //=======================================================================
                        function loadCountries() {
                            return mongoStorage.getCountries().then(function(o) {
                                $scope.options.countries = $filter("orderBy")(o, "name.en");
                                $scope.options.countries =([{_id:' ',identifier:' ',name:' ',title:' '}]).concat($scope.options.countries);
                                return $scope.options.countries;
                            }).catch(onError);
                        }


                        //=======================================================================
                        //
                        //=======================================================================
                        $scope.orgCallback = function() {
                            $scope.showOrgForm = 0;
                        };


                        //=======================================================================
                        //
                        //=======================================================================
                        $scope.saveDoc = function() {


                            $scope.doc.meta.status = 'draft';
                            if($scope.prevPublished)
                              $scope.doc.meta.status =  $scope.doc.meta.status || 'published';

                            numHostOrgs = $scope.doc.hostOrgs.length;
                            if(!$scope.prevPublished)
                              validateTabs();
                            if (!$scope.doc.id || !$scope._id) {

                                return mongoStorage.save($scope.schema, cleanDoc($scope.doc))
                                  .then(postSaveNewDoc)
                                    .catch(onError);
                            } else
                                return mongoStorage.save($scope.schema, cleanDoc($scope.doc), $scope._id).then(function() {
                                    $scope.$emit('showSuccess', 'Side Event ' + $scope.doc.id + ' Saved as Draft');
                                }).catch(onError);
                        };

                        //=======================================================================
                        //
                        //=======================================================================
                        function cleanDoc(doc) {
                            var cDoc = _.cloneDeep(doc);
                            delete(cDoc.subjectObjs);
                            delete(cDoc.conferenceObjs);
                            delete(cDoc.meetingObjs);
                            delete(cDoc.history);
                            return cDoc;
                        } //toggleListView

                        //=======================================================================
                        //
                        //=======================================================================
                        function postSaveNewDoc (result){
                          $scope._id=$scope.doc._id=result.data.id;
                          $scope.ignoreDirtyCheck=true;
                          mongoStorage.loadDoc('inde-side-events',$scope._id).then(
                            function(res){
                              //$location.url('/manage/events/'+$scope._id,true);
                              $scope.routeParams = $scope._id;
                              $location.url('/manage/events/'+$scope._id);
                              reloader.preventReload($scope, function(newParams) {
                                 $scope.routeParams = $scope._id;
                                 $routeParams=$scope._id;

                              });
                              $scope.doc=res;
                              var tempFile=getTempFile();

                                if(!_.isEmpty(tempFile))
                                      saveLogoNewDoc(tempFile);// move form temporary to perminant on S3
                                else
                                  $scope.$emit('showSuccess', 'New Side Event ' + $scope.doc.id + ' Created and Saved as Draft');

                            }
                          );

                      }// postSaveNewDoc

                      //=======================================================================
                      //
                      //=======================================================================
                      function getTempFile(){
                        if(!_.isEmpty($scope.doc.tempFile)){
                            var tempFile=$scope.doc.tempFile;
                            delete($scope.doc.tempFile);
                            return tempFile;
                        }else
                          return false;
                      }//getTempFile


                      //=======================================================================
                      //
                      //=======================================================================
                      function saveLogoNewDoc(tempFile) {
                          tempFile.metadata.docid = $scope._id;

                          if (tempFile.metadata.schema && tempFile.metadata.docid && tempFile.metadata.filename) {

                              return mongoStorage.moveTempFileToPermanent(tempFile, $scope._id).then(function() {

                                  mongoStorage.loadDoc($scope.schema, $scope._id).then(function(document) {
                                      $scope.doc = document;
                                      $scope.doc.logo = 'https://s3.amazonaws.com/mongo.document.attachments/';
                                      $scope.doc.logo += tempFile.metadata.schema + '/';
                                      $scope.doc.logo += tempFile.metadata.docid + '/';
                                      $scope.doc.logo +=   mongoStorage.awsFileNameFix(tempFile.metadata.filename);

                                      return $scope.saveDoc().then(function() {
                                          $location.url('/manage/events/' + $scope._id);
                                      });
                                  });
                              }).catch(onError);
                          } else
                              throw 'Error: Missing schema or id or filename to move file from temp to perminant';
                      } //saveLogoNewDoc


                        //=======================================================================
                        //
                        //=======================================================================
                        $scope.goTo = function(url) {

                            $location.url(url);
                        };


                        //=======================================================================
                        //
                        //=======================================================================
                        $scope.getOrgImgSource = function(id) {
                            var orgFound = false;
                            if (id.length !== 2) {

                                orgFound = _.find($scope.options.orgs, {
                                    _id: id
                                });
                                if (orgFound) return orgFound.logo;
                            }
                            return 'app/images/ic_business_black_48px.svg';
                        };

                        //=======================================================================
                        //
                        //=======================================================================
                        $scope.getOrgName = function(id) {
                            var orgFound = false;

                            if (id.length === 2) {
                                orgFound = _.find($scope.options.countries, {
                                    _id: id
                                });
                                if (orgFound) return orgFound.title;
                                else
                                    return;

                            } else {
                                orgFound = _.find($scope.options.orgs, {
                                    _id: id
                                });
                                if (orgFound) return orgFound.acronym;


                            }

                        };

                        //=======================================================================
                        //
                        //=======================================================================
                        $scope.submitForm = function(formData) {
                            $scope.submitted = true;
                            formData.$setSubmitted()
                            switch ($scope.tab) {
                                case 'general':
                                    submitGeneral(formData);
                                    break;
                                case 'logistics':
                                    submitLogistics(formData);
                                    break;
                                case 'orgs':
                                    submitOrgs(formData);
                                    break;

                                case 'contact':
                                    submitContact(formData);
                                    break;
                            }
                        };


                        //=======================================================================
                        //
                        //=======================================================================
                        function loadHostOrgs() {
                            _.each($scope.doc.hostOrgs, function(orgId) {
                                if (!_.find($scope.options.orgs, {
                                        _id: orgId
                                    })) {
                                    mongoStorage.loadDoc('inde-orgs', orgId).then(function(responce) {
                                        if (!_.find($scope.options.orgs, {
                                                _id: orgId
                                            }) && mongoStorage.isPublishable(responce))
                                            $scope.options.orgs.push(responce);
                                    }).catch(onError);
                                }
                            });
                        } //submitGeneral


                        //=======================================================================
                        //
                        //=======================================================================
                        function isOrgPublishable(orgId) {
                            var orgFound = _.find($scope.options.orgs, {
                                _id: orgId
                            });
                            return mongoStorage.isPublishable(orgFound);
                        } //submitGeneral
                        $scope.isOrgPublishable = isOrgPublishable;


                        //=======================================================================
                        //
                        //=======================================================================
                        function isOrgParty(orgId) {
                            var orgFound = _.find($scope.options.orgs, {
                                _id: orgId
                            });
                            return mongoStorage.isOrgParty(orgFound);
                        } //submitGeneral
                        $scope.isOrgParty = isOrgParty;


                        //=======================================================================
                        //
                        //=======================================================================
                        function validateTabs() {
                          var formData = $scope.editForm;
                            if(!$scope.prevPublished){
                                $scope.doc.validTabs.general = false;
                                $scope.doc.validTabs.logistics = false;
                                $scope.doc.validTabs.orgs = false;
                                $scope.doc.validTabs.contact = false;
                            }
                            if ( formData && formData.title.$valid && formData.description.$valid && formData.subjects.$valid)
                                $scope.doc.validTabs.general = true;

                            if (formData && formData.conference.$valid && formData.expNumPart.$valid && formData.prefDateOne.$valid &&
                                formData.prefTimeOne.$valid && formData.prefDateTwo.$valid && formData.prefTimeTwo.$valid &&
                                formData.prefDateThree.$valid && formData.prefTimeThree.$valid
                            )
                                $scope.doc.validTabs.logistics = true;

                            if (!_.isEmpty($scope.doc.hostOrgs) )
                                $scope.doc.validTabs.orgs = true;

                            var validRows = true;
                            // _.each($scope.doc.hostOrgs, function(resOrg, key) {
                            //
                            //     if ((formData['email_' + key].$error.required || formData['email_' + key].$error.pattern || formData['email_' + key].$error.email) && $scope.submitted) {
                            //         if (validRows) validRows = false;
                            //     }
                            //
                            //     if (formData['lastName_' + key].required && $scope.submitted) {
                            //         if (validRows) validRows = false;
                            //     }
                            //     if($scope.doc.responsibleOrgs[key] && duplicateResponsibleOrgs(formData,$scope.doc.responsibleOrgs[key].email,key))
                            //         validRows = false;
                            //
                            //     _.each($scope.doc.hostOrgs, function(resOrg, key) {
                            //         if( $scope.doc.responsibleOrgs[key] && !$scope.doc.responsibleOrgs[key].lastName && !$scope.doc.responsibleOrgs[key].email)
                            //           $scope.doc.responsibleOrgs[key].sameAs='';
                            //     });
                            //
                            //     if($scope.doc.responsible && !$scope.doc.responsibleLastName && !$scope.doc.responsibleOrgsEmail)
                            //       $scope.doc.responsible.sameAs='';
                            // });

                            if(isAdmin())validRows = true;
                            if (formData && formData?.firstName?.$valid && formData?.lastName?.$valid && formData?.phone?.$valid &&
                                formData?.city?.$valid && formData?.country?.$valid && formData?.emaill?.$valid && formData?.responsibleLastName?.$valid && formData?.responsibleEmail?.$valid && validRows
                            )
                              $scope.doc.validTabs.contact = true;

                        } //validateTabs
                        $scope.validateTabs = validateTabs;


                        //=======================================================================
                        //
                        //=======================================================================
                        function submitGeneral(formData) {
                            if(!$scope.prevPublished){
                              $scope.doc.validTabs.general = false;
                              $scope.doc.validTabs.logistics = false;
                            }
                            if (formData.title.$error.required && $scope.submitted)
                                findScrollFocus('editForm.title');

                            if (formData.description.$error.required && $scope.submitted)
                                findScrollFocus('editForm.description');

                            if (formData.subjects.$error.required && $scope.submitted)
                                findScrollFocus('editForm.subjects');

                            if (formData.title.$valid && formData.description.$valid && formData.subjects.$valid) {


                                resetForm(formData, ['title', 'description', 'subjects']);
                                $scope.doc.validTabs.general = true;
                                $scope.tab = 'logistics';
                                $timeout(function() {
                                    formData.$setPristine();
                                    $scope.tab = 'logistics';
                                    showTab('logistics')
                                });
                                $scope.saveDoc();
                                formData.$setPristine()
                            }
                        } //submitGeneral

                        //=======================================================================
                        //
                        //=======================================================================
                        function goToError(tab,field) {
                            showTab(tab);
                            $scope.focused=false;
                            $timeout(function(){findScrollFocus('editForm.'+field);},500);
                        }
                        $scope.goToError=goToError;

                        //=======================================================================
                        //
                        //=======================================================================
                        function submitLogistics(formData) {
                            if(!$scope.prevPublished)
                              $scope.doc.validTabs.logistics = false;

                            var ctrls = ['expNumPart', 'conference', 'prefDateOne', 'prefTimeOne', 'prefDateTwo', 'prefTimeTwo', 'prefDateThree', 'prefTimeThree'];
                            if (formData.conference.$error.required && $scope.submitted) {
                                findScrollFocus('formData.conference');
                                //  return;
                            }
                            if (formData.expNumPart.$error.required && $scope.submitted)
                                findScrollFocus('editForm.expNumPart');

                            if (formData.prefDateOne.$error.required && $scope.submitted)
                                findScrollFocus('editForm.prefDateOne');
                            if (formData.prefTimeOne.$error.required && $scope.submitted)
                                findScrollFocus('editForm.prefTimeOne');

                            if (formData.prefDateTwo.$error.required && $scope.submitted)
                                findScrollFocus('editForm.prefDateTwo');
                            if (formData.prefTimeTwo.$error.required && $scope.submitted)
                                findScrollFocus('editForm.prefTimeTwo');

                            if (formData.prefDateThree.$error.required && $scope.submitted)
                                findScrollFocus('editForm.prefDateThree');
                            if (formData.prefTimeThree.$error.required && $scope.submitted)
                                findScrollFocus('editForm.prefTimeThree');


                            if (formData.conference.$valid && formData.expNumPart.$valid && formData.prefDateOne.$valid &&
                                formData.prefTimeOne.$valid && formData.prefDateTwo.$valid && formData.prefTimeTwo.$valid &&
                                formData.prefDateThree.$valid && formData.prefTimeThree.$valid
                            ) {
                                $scope.doc.validTabs.logistics = true;
                                $scope.saveDoc();
                                resetForm(formData, ctrls);
                                $scope.doc.validTabs.logistics = true;
                                $timeout(function() {
                                    $scope.tab = 'orgs';
                                    formData.$setPristine();
                                    showTab('orgs')

                                });
                            }
                        } //submitGeneral


                        //=======================================================================
                        //
                        //=======================================================================
                        function submitOrgs(formData) {

                            var ctrls = ['hostOrgs'];
                            if(!$scope.prevPublished)
                              $scope.doc.validTabs.orgs = false;
                            if (!$scope.doc.hostOrgs || $scope.doc.hostOrgs.length === 0) {
                                formData.$valid = false;
                            } else {
                                formData.$valid = true;
                            }

                            if (!$scope.doc.hostOrgs || $scope.doc.hostOrgs.length === 0) {

                                if (!$scope.focused)
                                    smoothScroll(document.getElementById('hostOrg-error'));
                                if (!$scope.focused)
                                    $(document.getElementById('editForm.hostOrgs')).focus();
                                $(document.getElementById('editForm.hostOrgs')).addClass('has-error');
                                $(document.getElementById('hostOrg-error')).addClass('has-error-div');
                                $(document.getElementById('hostOrgMsg')).css('display', 'block');
                                $scope.focused = true;
                            } else {

                                resetForm(formData, ctrls);
                                $scope.doc.validTabs.orgs = true;
                                $timeout(function() {
                                    $scope.tab = 'contact';
                                    formData.$setPristine();
                                    showTab('contact')
                                });

                                $scope.saveDoc();
                            }
                        } //submitGeneral

                        //=======================================================================
                        //
                        //=======================================================================
                        function isAdmin(){
                           return (_.intersection(['Administrator', 'IndeAdministrator','IndeAdminNotify'], $scope.me.roles).length > 0);
                        }
                        $scope.isAdmin = isAdmin;

                        //=======================================================================
                        //
                        //=======================================================================
                        function isNew(){
                           return ((!$scope._id ||  $scope._id==='new' )  );
                        }
                        $scope.isNew=isNew;

                        //=======================================================================
                        //
                        //=======================================================================
                        function submitContact(formData) {
                            if(!$scope.prevPublished)
                              $scope.doc.validTabs.contact = false;

                            var ctrls = ['firstName', 'lastName', 'phone', 'city', 'country', 'email'];

                            if (formData.firstName.$error.required && $scope.submitted)
                                findScrollFocus('editForm.firstName');
                            if (formData.lastName.$error.required && $scope.submitted)
                                findScrollFocus('editForm.lastName');
                            if (formData.phone.$error.required && $scope.submitted)
                                findScrollFocus('editForm.phone');
                            if (formData.city.$error.required && $scope.submitted)
                                findScrollFocus('editForm.city');

                            if (formData.country.$error.required && $scope.submitted)
                                findScrollFocus('editForm.country');
                            if ((formData.emaill.$error.required || formData.emaill.$error.pattern || formData.emaill.$error.email) && $scope.submitted)
                                findScrollFocus('editForm.email');

                            if ((formData.responsibleEmail.$error.required || formData.responsibleEmail.$error.pattern || formData.responsibleEmail.$error.email) && $scope.submitted)
                                findScrollFocus('editForm.responsibleEmail');

                            if ((formData.responsibleLastName.$error.required || formData.responsibleLastName.$error.pattern || formData.responsibleLastName.$error.email) && $scope.submitted)
                                findScrollFocus('editForm.responsibleLastName');

                            var validRows = true;
                            // if(!isAdmin())
                            // _.each($scope.doc.hostOrgs, function(resOrg, key) {
                            //
                            //     if ((formData['email_' + key].$error.required || formData['email_' + key].$error.pattern || formData['email_' + key].$error.email) && $scope.submitted) {
                            //         findScrollFocus('email_' + key);
                            //         if (validRows) validRows = false;
                            //     }
                            //
                            //     if (formData['firstName_' + key].$error.required && $scope.submitted) {
                            //         findScrollFocus('firstName_' + key);
                            //         if (validRows) validRows = false;
                            //     }
                            //     if (formData['lastName_' + key].required && $scope.submitted) {
                            //         findScrollFocus('lastName_' + key);
                            //         if (validRows) validRows = false;
                            //     }
                            //     if($scope.doc.responsibleOrgs[key] && duplicateResponsibleOrgs(formData,$scope.doc.responsibleOrgs[key].email,key))
                            //         validRows = false;
                            //
                            //     _.each($scope.doc.hostOrgs, function(resOrg, key) {
                            //         if( $scope.doc.responsibleOrgs[key] && !$scope.doc.responsibleOrgs[key].lastName && !$scope.doc.responsibleOrgs[key].email)
                            //           $scope.doc.responsibleOrgs[key].sameAs='';
                            //     });
                            //
                            //     if($scope.doc.responsible && !$scope.doc.responsibleLastName && !$scope.doc.responsibleOrgsEmail)
                            //       $scope.doc.responsible.sameAs='';
                            // });
                            if(isAdmin())validRows = true;

                            if (formData.firstName.$valid && formData.lastName.$valid && formData.phone.$valid &&
                                formData.city.$valid && formData.country.$valid && formData.emaill.$valid && formData.responsibleLastName.$valid && formData.responsibleEmail.$valid && validRows
                            ) {

                                resetForm(formData, ctrls);
                              
                                $scope.doc.validTabs.contact = true;
                                $timeout(function() {
                                    $scope.tab = 'documents';
                                    formData.$setPristine();
                                    showTab('documents');
                                });
                                $scope.saveDoc();

                            }else{
                               if($scope.doc.validTabs.contact){
                                $scope.doc.validTabs.contact = false;
                                $scope.saveDoc();
                              }
                            }
                        } //submitGeneral



                        //=======================================================================
                        //
                        //=======================================================================
                        function validateResponsibleOrgs (){
                          var isValid =true;
                          if(!$scope.doc.responsibleOrgs || _.isEmpty($scope.doc.responsibleOrgs)) isValid =false;
                          _.each($scope.doc.responsibleOrgs, function(resOrg) {
                              if(!resOrg.lastName || !resOrg.email)
                                isValid =false;
                          });
                          return isValid;
                        }


                        //=======================================================================
                        //
                        //=======================================================================
                        function resetForm(formData, ctrlsException) {
                            formData.$rollbackViewValue();
                            formData.$setPristine();
                            _.each(formData, function(ctrl, name) {
                                if ((name.indexOf('$') !== 0) && ctrlsException.indexOf(name) === -1)
                                    ctrl.$setValidity(name, true);
                            });
                        }

                        //=======================================================================
                        //
                        //=======================================================================
                        function isTabsValid() {
                            if (!$scope.doc.validTabs) return false;
                            return ($scope.doc.validTabs.general && $scope.doc.validTabs.logistics && $scope.doc.validTabs.orgs && $scope.doc.validTabs.contact);
                        }
                        $scope.isTabsValid = isTabsValid;


                        //=======================================================================
                        //
                        //=======================================================================
                        function findScrollFocus(id) {
                            if(id==='editForm.description')id='cke_editForm.description';
                            var el = document.getElementById(id);


                            if (!$scope.focused) {

                                smoothScroll(el);
                                if ($(el).is("input") || $(el).is("select"))
                                    el.focus();
                                else {
                                    if ($(el).find('input').length === 0)
                                        $(el).find('textarea').focus();
                                    else
                                        $(el).find('input').focus();

                                }
                                $scope.focused = true;
                            }
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

                        //=======================================================================
                        //
                        //=======================================================================
                        $scope.resubmitWarning= function() {

                            if(!$scope.doc || !$scope.doc.meta || $scope.prevPublished) return false;
                            return (($scope.doc.meta.status==='request' || $scope.doc.meta.status==='published') && !isTabsValid());
                        };

                        const defaultLangs = ['lang-ar','lang-en','lang-es','lang-fr','lang-ru','lang-zh']

                        $scope.getNumberSelectedLanguages= function() {
                            let count = 0

                            if($scope.doc?.requirements?.hybrid?.interpretation?.langs)
                                for (const lang in $scope.doc.requirements.hybrid.interpretation.langs)
                                    if($scope.doc.requirements.hybrid.interpretation.langs[lang]) count++

                            return count
                        }

                        $scope.toggleLang= function(lang) {

                            if(!$scope.doc?.requirements?.hybrid?.interpretation?.langs || !lang) return

                            // if(!defaultLangs.includes(lang)) return delete($scope.doc.requirements.hybrid.interpretation.langs[lang])

                            if(isMaxLangsSelected() && !$scope.doc.requirements.hybrid.interpretation.langs[lang]) 
                                return alert(`maximum languages permited is ${$scope.options.requirements.hybridTranslationLanguageLimit}`)

                            if($scope.doc.requirements.hybrid.interpretation.langs[lang]) delete($scope.doc.requirements.hybrid.interpretation.langs[lang])
                            else $scope.doc.requirements.hybrid.interpretation.langs[lang] = true
                        }

                        $scope.addSelectedLang= function(lang, event) {
                            event.preventDefault();

                            if(!lang) return

                            if(isMaxLangsSelected()) return alert(`maximum languages permited is ${$scope.options.requirements.hybridTranslationLanguageLimit}`)
                            

                            if(!$scope.doc?.requirements?.hybrid?.interpretation?.langs ) $scope.doc.requirements.hybrid.interpretation.langs ={}

                            const [ locale ] = $scope.options.langs.filter((l) => l.identifier === lang)

                            $scope.doc.requirements.hybrid.interpretation.langs[lang]= true
                        }
                        $scope.getSelectedOtherLangs= function(g) {
                            
                            if(!$scope.doc?.requirements?.hybrid?.interpretation?.langs) $scope.doc.requirements.hybrid.interpretation.langs = {}

                            const langs = Object.keys($scope.doc.requirements.hybrid.interpretation.langs)

                            return Array.from(new Set([...langs, ...defaultLangs].sort(sortByName)))
                        }

                        function sortByName(a,b){
                            const nameA = $scope.languageNameEnglish(a).toUpperCase(); // ignore upper and lowercase
                            const nameB = $scope.languageNameEnglish(b).toUpperCase(); // ignore upper and lowercase

                            if (nameA < nameB)  return -1;

                            if (nameA > nameB) return 1;

                            return 0;
                        }

                        function isMaxLangsSelected() {
                            if(!$scope.options?.requirements?.hybridTranslationLanguageLimit) return false

                            return $scope.getNumberSelectedLanguages() == $scope.options.requirements.hybridTranslationLanguageLimit
                        }

                        $scope.languageNameEnglish= function(identifier) {
                            const [ locale ] = $scope.options.langs.filter((l) => l.identifier === identifier)

                            return locale.title.en
                        }

                        $scope.isLangSelected= function(identifier) {
                            if(!$scope.doc?.requirements?.hybrid.interpretation?.langs) return false

                            return $scope.doc.requirements.hybrid.interpretation.langs[identifier]
                        }

                        $scope.getUnselectedLang= function(){
                            const listToFilter = [...Object.keys($scope.doc.requirements.hybrid.interpretation.langs), ...defaultLangs]

                            return $scope.options.langs.filter((l) => !listToFilter.includes(l.identifier))
                        }
                    } //link
            }; //return
        }
    ]);
});


function initScope($scope, $route, $location){
    $scope.status = ''
    $scope._id = $route.current.params.id
    $scope.meetingId = $location.search().meetingId
    $scope.loading = true;
    $scope.schema = 'inde-side-events'
    $scope.showOrgForm = 0
    $scope.registerAlert = true
    $scope.doc = {}
    $scope.doc.hostOrgs = []
    $scope.updateProfile = 'No'
    $scope.ignoreDirtyCheck = false
    $scope.doc.meetings = []
    $scope.document = {}

    $scope.errorMap={
      title:{tab:'general',label:'Title'},
      subjects:{tab:'general',label:'Subjects'},
      description:{tab:'general',label:'Description'},
      expNumPart:{tab:'logistics',label:'Expected Number of Participants'},
      prefDateOne:{tab:'logistics',label:'First Date Preference'},
      prefDateTwo:{tab:'logistics',label:'Second Date Preference'},
      prefDateThree:{tab:'logistics',label:'Third Date Preference'},
      prefTimeOne:{tab:'logistics',label:'First Time Preference'},
      prefTimeTwo:{tab:'logistics',label:'Second Time Preference'},
      prefTimeThree:{tab:'logistics',label:'Third Time Preference'},
      firstName:{tab:'contact',label:'Contact Person First Name'},
      lastName:{tab:'contact',label:'Contact Person Last Name'},
      phone:{tab:'contact',label:'Contact Person Phone'},
      city:{tab:'contact',label:'Contact Person City'},
      emaill:{tab:'contact',label:'Contact Person Email'},
      country:{tab:'contact',label:'Contact Person Country'},
      responsibleLastName:{tab:'contact',label:'Responsible Person Last Name'},
      responsibleEmail:{tab:'contact',label:'Responsible Person Email'},
    };

    $scope.editorOptions = {
        language: 'en',
        uiColor: '#069554'
    };
    $scope.patterns = {
        facebook: /^http[s]?:\/\/(www.)?facebook.com\/.+/i,
        twitter: /^http[s]?:\/\/twitter.com\/.+/i,
        youtube: /^http[s]?:\/\/(www.)?youtube.com\/user\/.+/i,
        phone: /^\+\d+(\d|\s|-|ext|#|\*)+$/i,
        time: /^([0-1][0-9]|2[0-3]|[0-9]):[0-5][0-9]$/,
        email: /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i
    };


    $scope.options = {};



    $scope.tab = 'general';
    $('#general-tab').tab('show');
}