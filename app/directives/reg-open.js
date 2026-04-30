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
            f:  { 'Title.en':1, MajorEventIDs: 1, 'schedule.sideEvents.start': 1, 'schedule.sideEvents.end': 1 , 'schedule.sideEvents.hideDates': 1, 'schedule.sideEvents.excludedMeetings': 1 },
            s: { 'schedule.sideEvents.start': 1 }
          }
}

function meetingsQuery(meetingIds){
  return {
            q:  {
                  '_id': { '$in': meetingIds }
                },
            f: { titleShort:1, EVT_CD:1, EVT_TO_DT:1, EVT_FROM_DT:1, EVT_THM_CD:1, 'agenda.prefix':1 },
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
  const meetings = res.data

  for (let i = meetings.length-1; i >=0; i--) {
    const parentConference = getConference(meetings[i]._id)

    const prefix   = meetings[i].agenda && meetings[i].agenda.prefix
    const classKey = prefix && prefix.toUpperCase()
    const panelMap = { CBD:'panel-cbd', CP:'panel-cp', NP:'panel-np', SBI:'panel-sbi', SBSTTA:'panel-sbstta' }
    const btnMap   = { CBD:'btn-cbd',   CP:'btn-cp',   NP:'btn-np',   SBI:'btn-sbi',   SBSTTA:'btn-sbstta' }
    
    meetings[i].panelClass = panelMap[classKey] || 'panel-info'
    meetings[i].btnClass   = btnMap[classKey]   || 'btn-info'

    const isProd = this.$location.host().includes('cbd.int') && this.$location.path().startsWith('/side-events')
    const base = !isProd? '/side-events' : ''
    const href = `${base}/manage/events/new?meetingId=${meetings[i]._id}`


    meetings[i] = this._.assign(meetings[i],{href,conferenceId:parentConference._id,start:parentConference.schedule.sideEvents.start,end:parentConference.schedule.sideEvents.end, hideDates: parentConference.schedule.sideEvents.hideDates})
  }
  this.$scope.meetings = meetings
  this.$scope.conferenceGroups = buildConferenceGroups.call(this, meetings)
}

function buildConferenceGroups(meetings){
  const groups = []

  for (var i = 0; i < this.$scope.conferences.length; i++) {
    const conference = this.$scope.conferences[i]
    const groupMeetings = this._.filter(meetings, { conferenceId: conference._id })

    if(groupMeetings.length) groups.push({ conference: conference, meetings: groupMeetings })
  }

  return groups
}

function getConference(meetingId) {

  return this._.findLast(this.$scope.conferences,function(c){

      const ids =c.MajorEventIDs 
      for (let i = 0; i < ids.length; i++) 
        if(meetingId === ids[i])
          return true

      return false
  } )
}

