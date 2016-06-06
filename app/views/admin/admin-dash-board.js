define(['app', 'lodash', 'moment','../../services/mongo-storage'], function(app, _, moment) { //'scbd-services/utilities',


  app.controller("adminDashBoard", ['$scope',  'authentication', '$location', '$timeout', 'mongoStorage', '$window', 'history', '$http', //"$http", "$filter", "Thesaurus",
    function($scope,  authentication, $location, $timeout, mongoStorage, $window, history, $http) { //, $http, $filter, Thesaurus


      $scope.conference = '';

      $scope.options = {};
      $scope.options.days = [];
      $scope.facets = {};
      $scope.facets.all = 0;
      $scope.facets.drafts = 0;
      $scope.facets.requests = 0;
      $scope.facets.published = 0;
      $scope.facets.canceled = 0;
      $scope.facets.rejected = 0;
      $scope.facets.archived = 0;
      $scope.facetsO = {};
      $scope.facetsO.all = 0;
      $scope.facetsO.drafts = 0;
      $scope.facetsO.requests = 0;
      $scope.facetsO.published = 0;
      $scope.facetsO.canceled = 0;
      $scope.facetsO.rejected = 0;
      $scope.facetsO.archived = 0;
      var statuses = ['draft', 'published', 'request', 'canceled', 'rejected', 'archived'];
      mongoStorage.getStatusFacits('inde-side-events', $scope.facets, statuses);
      mongoStorage.getStatusFacits('inde-orgs', $scope.facetsO, statuses);

      authentication.getUser().then(function(user) {
        $scope.isAuthenticated = user.isAuthenticated;
      }).then(function() {
        if (!$scope.isAuthenticated)
          $('#loginDialog').modal('show');
      });

      //=======================================================================
      //
      //=======================================================================
      $scope.goTo = function(path, search, count) {
          if (count)
            $location.path(path).search(search);
        }; // archiveOrg

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
      //============================================================
      //
      //============================================================
      $scope.loadSides = function(confId) {
        $scope.conferenceId = confId;
        var conf = _.find($scope.options.conferences, {
          '_id': confId
        });
        if (!conf) throw "Error no confrence found";
        loadReservations(conf.start, conf.end, conf.venue, 'Side Event').then(function(res) {

          $scope.sides = res;
          //  console.log($scope.sides);
        });
      };


      //============================================================
      //
      //============================================================
      function loadReservations(start, end, venue, type, reservations) {
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
            'type': type
          }
        };
        return $http.get('/api/v2016/reservations', {
          'params': params
        }).then(function(responce) {
          var conf = _.find($scope.options.conferences, {
            '_id': $scope.conferenceId
          });
          $scope.options.days = [];
          $scope.options.times = [];
          _.each(responce.data, function(res) {
            res.room = _.find($scope.rooms, {
              '_id': res.location.room
            });
            res.dayOfWeek = moment.utc(res.start).format('dddd');
            res.day = moment.utc(res.start).format('YYYY-MM-DD');
            res.time = moment.utc(res.start).format('LT');
            res.startSeconds = moment.utc(res.start).format('X');
            //var seconds = moment(res.day).format('X');
            //var diff = Math.abs(moment(res.day).diff(moment(res.start).hour(13).minute(15).second(0), 'seconds'));
            //var diff2 = Math.abs(moment(res.day).diff(moment(res.start).hour(18).minute(15).second(0), 'seconds'));
            var diff = moment.utc(res.start).format('X') - moment.utc(res.day).format('X');
            //  console.log('seconds',conf.seTiers);
            res.tier = _.find(conf.seTiers, {
              'seconds': diff
            });
            res.timeSeconds = diff;

            //console.log('conf',$scope.conferenceId);
            ///console.log(conf);
            if (!_.findWhere($scope.options.times, {
                'value': diff
              }))
              $scope.options.times.push({
                'value': diff,
                'title': res.tier.title
              });

            if (!_.findWhere($scope.options.days, {
                'value': moment.utc(res.day).format('X')
              }))
              $scope.options.days.push({
                'value': moment.utc(res.day).format('X'),
                'title': moment.utc(res.start).format('YYYY-MM-DD') + '  ' + moment.utc(res.start).format('dddd')
              });

            $scope.day = '';
          });
          mongoStorage.loadOrgs('inde-orgs').then(function(orgs) {
            allOrgs = orgs.data;

          }).then(function() {
            _.each(responce.data, function(res) {
              res.sideEvent.orgs = [];
              _.each(res.sideEvent.hostOrgs, function(org) {
                res.sideEvent.orgs.push(_.findWhere(allOrgs, {
                  '_id': org
                }));
              });
            }); // each
          });
          return responce.data;
        });

      } // loadDocs
      //============================================================
      //
      //============================================================
      function init() {
        $http.get("/api/v2016/conferences", {
          cache: true

        }).then(function(res) {


          $http.get("/api/v2016/venue-rooms", {
            cache: true
          }).then(function(res2) {
            $scope.rooms = res2.data;
            //  console.log('rooms',res2.data);
          }).then(function() {
            $scope.options.conferences = res.data;

          });

        }).catch(function onerror(response) {

          $scope.onError(response);

        });
      }

      init();
    }
  ]);
});