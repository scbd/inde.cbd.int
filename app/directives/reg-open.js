define(['app', 'text!./reg-open.html','lodash', 'moment',], loadGlobalModules)

// requirejs global modules
function loadGlobalModules(app, template, _, moment) {
  this.template = template
  this._        = _
  this.moment   = moment
	app.directive('regOpen', ['$http','$location', directive.bind(this) ]);
}

// angularJS directive definition
function directive($http, $location) {
  this.$http = $http
  this.$location = $location;
  return  {
            restrict: 'E',
            template: this.template,
            replace : true,
            scope:{},
            link    : link.bind(this)
          }
}

// angularJS directive link function
function link($scope, $element, $attr) {
  this.$scope = $scope

  passGlobalModules.bind(this)

  this.$http.get('/api/v2016/conferences', { 'params': findOpenRegsQuery() }).then(init)
}

/*=========================
= Public functions on $scope
============================*/


/*=========================
= Private functions
============================*/

function init(conferencesQueryResponse){

  var conferences = conferencesQueryResponse.data
  var props = {
                conferences:conferences,
                meetings: []
              }
  setScopeProps(props)
  loadMeetingsData(conferences)
  setRegistrationOpenFlag()
}

function passGlobalModules(){
  setScopeProp.bind(this)
  getMeetingIds.bind(this)
  loadMeetingsData.bind(this)
  setMeetings.bind(this)
  getConference.bind(this)
  setRegistrationOpenFlag.bind(this)
}

function setScopeProps (props){

  var propKeys = Object.keys(props)

  for (var i = 0; i < propKeys.length; i++) {
    var key = propKeys[i]
    this.$scope[key] = props[key]
  }
}

function findOpenRegsQuery(){

  return {
            q:  {
                  '$or'                      : [ { institution: 'CBD' }, { institution: 'cbd' }],
                  schedule                   : { $exists: true },
                  StartDate                  : { $gt: { $date: moment() } },
                  'schedule.sideEvents.start': { $lt: { $date: moment() } },
                  'schedule.sideEvents.end'  : { $gt: { $date: moment() } },
                },
            f:  { MajorEventIDs: 1, 'schedule.sideEvents.start': 1, 'schedule.sideEvents.end': 1 , 'schedule.sideEvents.hideDates': 1, 'schedule.sideEvents.excludedMeetings': 1 },
            s: { 'schedule.sideEvents.start': 1 }
          }
}

function meetingsQuery(meetingIds){
  return {
            q:  {
                  '_id': { '$in': meetingIds }
                },
            f: { titleShort:1, EVT_CD:1, EVT_TO_DT:1, EVT_FROM_DT:1, EVT_THM_CD:1 },
            s: { EVT_FROM_DT: 1 }
          }
}

function setRegistrationOpenFlag(){
  this.$scope.isRegistrationOpen = (this.$scope && this.$scope.conferences && this.$scope.conferences.length)
}

function getMeetingIds(conferences){
  var meetingIds = []

  if(!conferences || !Array.isArray(conferences) || !conferences.length) return meetingIds

  for (var i = 0; i < conferences.length; i++) {
    const { excludedMeetings = [] } = conferences[i]?.schedule?.sideEvents || {}

    for (var j = 0; j < conferences[i].MajorEventIDs.length; j++)
      if(!excludedMeetings.includes(conferences[i].MajorEventIDs[j]))
        meetingIds.push({'$oid': conferences[i].MajorEventIDs[j]})
  }
  return meetingIds
}

function loadMeetingsData(conferences){
  var ids = getMeetingIds(conferences)
  this.$http.get('/api/v2016/meetings', { 'params': meetingsQuery(ids) }).then(setMeetings)
}

function setMeetings(res){
  var meetings = res.data

  for (var i = meetings.length-1; i >=0; i--) {
    var parentConference = getConference(meetings[i]._id)
console.log('this.$location.host()', this.$location.host())
console.log('this.$location.host()', this.$location.path())

    const isProd = this.$location.host().includes('cbd.int') && this.$location.path().startsWith('/side-events')
    const base = !isProd? '/side-events' : ''
    const href = `${base}/manage/events/new?meetingId=${meetings[i]._id}`


    meetings[i] = this._.assign(meetings[i],{href,start:parentConference.schedule.sideEvents.start,end:parentConference.schedule.sideEvents.end, hideDates: parentConference.schedule.sideEvents.hideDates})
  }
  this.$scope.meetings = meetings
}

function getConference(meetingId) {

  return this._.findLast(this.$scope.conferences,function(c){

      var ids =c.MajorEventIDs 
      for (let i = 0; i < ids.length; i++) 
        if(meetingId === ids[i])
          return true

      return false
  } )
}

