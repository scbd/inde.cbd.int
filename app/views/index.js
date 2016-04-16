define(['app', 'lodash', 'jquery', 'moment',
  'css!./index', '../services/mongo-storage',
  'services/filters'
], function(app, _, $, moment) {

  app.controller("home", ['$scope', '$http', '$filter', '$route', 'mongoStorage', '$location', '$element', '$timeout', '$window', '$anchorScroll', 'authentication', //"$http", "$filter", "Thesaurus",
    function($scope, $http, $filter, $route, mongoStorage, $location, $element, $timeout, $window, $anchorScroll, auth) { //, $http, $filter, Thesaurus

      $scope.loading = false;
      $scope.schema = "inde-orgs";
      $scope.createURL = '/manage/events/0';
      $scope.editURL = '/manage/events/';

      $scope.sortReverse = 0;
      $scope.listView = 1;
      $scope.showArchived = 0;

      $scope.statusFacits = {};
      $scope.statusFacitsArcView = {};
      $scope.statusFacitsArcView.all = 0;
  $scope.preLoadImages=[];
    $scope.showDescriptions=0;
      // var statuses=['published','request','canceled','rejected'];
      // var statusesArchived=['deleted','archived'];
      $scope.docs = [];
      auth.getUser().then(function(user) {

        $scope.user = user;
        //              console.log($scope.user);
      }).catch(function onerror(response) {

        $scope.onError(response);
      });
      init();
      //=======================================================================
      //
      //=======================================================================
      function init() {
          var allOrgs;
        $scope.conferences = [];
        $scope.options = {};
        mongoStorage.loadOrgs('inde-orgs').then(function(orgs) {
          allOrgs = orgs.data;
          _.each(allOrgs,function(org){
            var image = new Image();
            image.src= org.logo;
                $scope.preLoadImages.push(image);
          });
        }).then(
        $http.get('/api/v2016/conferences?s={"start":1}').then(function(conf) {
          $scope.conferences = $scope.options.conferences = conf.data;
          _.each($scope.conferences,function(conf,key){
                // conf.showDescriptions = 0;
                // $scope.$watch('conferences['+key+'].showDescriptions',function(newValue, oldValue){
                //         console.log('newValue',newValue);
                //         if(newValue!==oldValue)
                //         $timeout(function(){
                //             _.each(conf.reservations,function(res){
                //                   res.showDes = newValue;
                //             });
                //         });
                //             console.log(conf.reservations);
                // });
          });
          $http.get("/api/v2016/venue-rooms", {
            cache: true
          }).then(function(res2) {
                $scope.rooms = res2.data;
                //console.log('rooms',res2.data);
                var countCyc=0;
              _.each($scope.conferences, function(c) {
                    loadReservations(c.start, c.end, c.venue, '570fd0a52e3fa5cfa61d90ee', c._id).then(function(res) {
                        c.reservations = res;
                        var cancelOrgLoad = setInterval(function(){
                           if(allOrgs && length >0 ){
                                  _.each(c.reservations, function(res) {
                                    res.sideEvent.orgs = [];
                                    _.each(res.sideEvent.hostOrgs, function(org) {
                                      res.sideEvent.orgs.push(_.findWhere(allOrgs, {
                                        '_id': org
                                      })); // findWhere
                                    });// each
                                  }); // each
                                  countCyc++;
                            }
                            if(countCyc===5)// hack
                              clearInterval(cancelOrgLoad);
                        },1000);//interval

                    }); // loadReservations
              });//each conference
            });// then on load venues

        }).catch(function onerror(response) {
          $scope.onError(response);
        })
      );// then on load org
      } //init

      //============================================================
      //
      //============================================================
      function loadReservations(start, end, venue, type, conferenceId) {
        var allOrgs;
        var params = {};

        params = {
          q: {
            'location.venue': venue,
            'start': {
              '$gt': {
                '$date': (start * 1000)
              }
            },
            'end': {
              '$lt': {
                '$date': end * 1000
              }
            },
            'type': {'$oid':type}
          }
        };
        return $http.get('/api/v2016/reservations', {
          'params': params
        }).then(function(responce) {
          var conf = _.find($scope.options.conferences, {
            '_id': conferenceId
          });
          //  conf.options={};
          //  console.log(conf);
          conf.days = [];
          conf.times = [];

          _.each(responce.data, function(res) {
            res.room = _.find($scope.rooms, {
              '_id': res.location.room
            });
            res.dayOfWeek = moment.utc(res.start).format('dddd');
            res.day = moment.utc(res.start).format('YYYY-MM-DD');
            res.time = moment.utc(res.start).format('LT');
            res.startSeconds = moment.utc(res.start).format('X');
            res.daySeconds = moment.utc(res.day).format('X');

            var diff = moment.utc(res.start).format('X') - moment.utc(res.day).format('X');

            res.tier = _.find(conf.seTiers, {
              'seconds': diff
            });
            res.timeSeconds = diff;
            res.conf = conf;
            mongoStorage.loadDoc('inde-side-events',res.sideEvent._id).then(function(se){
                  res.sideEvent=se;
            });


            if (!_.findWhere(conf.times, {
                'value': diff
              }))
              conf.times.push({
                'value': diff,
                'title': res.tier.title
              });

            if (!_.findWhere(conf.days, {
                'value': res.daySeconds
              }))
              conf.days.push({
                'value': res.daySeconds,
                'title': res.day + '  ' + res.dayOfWeek
              });

            $scope.day = '';
          });

          return responce.data;
        });

      } // loadDocs
      $scope.newMeetingFilter = function(doc) {
        var timestamp = Math.round((new Date()).getTime() / 1000);
        if (doc.start > timestamp || $scope.hasRole(['IndeAdministrator', 'Administrator']))
          return doc;
      };
      $scope.updateDesc = function(showDesc) {
            $timeout(function(){$scope.showDescriptions = showDesc;});
      };
      $scope.dayFilter = function(doc) {

        if (doc.daySeconds === doc.conf.day || !doc.conf.day) return true;
        else return false;

      };
      $scope.timeFilter = function(doc) {


        if (Number(doc.timeSeconds) === Number(doc.conf.time) || !doc.conf.time) return true;
        else return false;

      };
      $scope.statusFilter = function(doc) {
        if (doc.meta.status === $scope.selectedChip)
          return doc;
        else if ($scope.selectedChip === 'all' || $scope.selectedChip === '')
          return doc;

      };
      //=======================================================================
      //
      //=======================================================================
      $scope.searchToggle = function(i) {

        var serEl = $element.find('#ind-search' + i);
        serEl.toggleClass('ind-search-expanded');
        serEl.focus();
        var serElb = $element.find('#search-btn' + i);

        serElb.toggleClass('search-btn-expanded');

        $scope.sOpen = !$scope.sOpen;

      }; // archiveOrg

      //============================================================
      //
      //
      //============================================================
      $scope.hasRole = function(roles) {
        if (!$scope.user) return false;

        return _.intersection(roles, $scope.user.roles).length > 0;


      }; //hasRole
      $scope.customSearch = function(doc) {

        if (!$scope.search || $scope.search == ' ' || $scope.search.length <= 2) return true;
        var temp = JSON.stringify(doc);
        return (temp.toLowerCase().indexOf($scope.search.toLowerCase()) >= 0);

      };

      $scope.gotoAnchor = function(x) {
        $anchorScroll(x);
      };

      //=======================================================================
      //
      //=======================================================================
      $scope.goTo = function(id) {
          $location.url('/manage/events/new?m=' + id);
        } // archiveOrg
        //============================================================
        //
        //============================================================
      $scope.hasError = function() {
        return !!$scope.error;
      };
      //============================================================
      //
      //============================================================
      $scope.onError = function(res) {

        $scope.status = "error";
        if (res.status === -1) {
          $scope.error = "The URI " + res.config.url + " could not be resolved.  This could be caused form a number of reasons.  The URI does not exist or is erroneous.  The server located at that URI is down.  Or lastly your internet connection stopped or stopped momentarily. ";
          if (res.data && res.data.message)
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
          $scope.error = res.data;
      };
    }
  ]);
});