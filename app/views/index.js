define(['app', 'lodash', 'jquery', 'moment',
    'css!./index', '../services/mongo-storage',
    'services/filters'
], function(app, _, $, moment) {

    app.controller("home", ['$scope', '$http', '$filter', '$route', 'mongoStorage', '$location', '$element', '$timeout', '$window', '$anchorScroll',
        function($scope, $http, $filter, $route, mongoStorage, $location, $element, $timeout, $window, $anchorScroll) {
            var allOrgs;

            $scope.showDescriptions = 0;

            $scope.docs = [];

            init();

            //=======================================================================
            //
            //=======================================================================
            function init() {

                $scope.conferences = [];
                $scope.options = {};
                var query = {
                    timezone: { $exists: true },
                    venueId:  { $exists: true }, // TMP for compatibility with coference collection;
                    StartDate: {'$gt':{'$date':moment.utc()}}
                };
                loadAllOrgsAndImages().then(
                    $http.get('/api/v2016/event-groups', { params : { q : query, s : { StartDate : -1 } } }).then(function(conf) {
                        $scope.conferences = $scope.options.conferences = conf.data;
                        loadSideEventTypes().then(function() {

                            $http.get("/api/v2016/venue-rooms", {
                                cache: true
                            }).then(function(res2) {

                                $scope.rooms = res2.data;
                                //                    var countCyc = 0;
                                _.each($scope.conferences, function(c) {
                                    loadReservations(c.StartDate, c.EndDate, c.venueId, '570fd0a52e3fa5cfa61d90ee', c._id).then(function(res) {
                                        c.reservations = res;
                                        if (allOrgs && allOrgs.length > 0) {
                                            _.each(c.reservations, function(res) {
                                                res.showDes = false;
                                                if (res.sideEvent) {
                                                    res.sideEvent.orgs = [];
                                                    _.each(res.sideEvent.hostOrgs, function(org) {
                                                        res.sideEvent.orgs.push(_.findWhere(allOrgs, {
                                                            '_id': org
                                                        })); // findWhere

                                                    }); // each
                                                }
                                            }); // each
                                        }
                                    }); // loadReservations

                                }); //each conference
                            }); // then on load venues
                        });
                    }).catch(function onerror(response) {
                        $scope.onError(response);
                    })
                ); // then on load org
            } //init

            function loadAllOrgsAndImages() {
                return mongoStorage.loadOrgs('inde-orgs').then(function(orgs) {
                    allOrgs = orgs;
                });
            }
            //============================================================
            //
            //============================================================
            function loadSideEventTypes() {

                var params = {
                    q: {
                        'parent': '570fd0a52e3fa5cfa61d90ee'
                    }
                };
                return $http.get('/api/v2016/reservation-types', {
                    'params': params
                }).then(function(responce) {
                    $scope.seTypes = [];
                    $scope.seTypes.push('570fd0a52e3fa5cfa61d90ee');
                    _.each(responce.data, function(type) {
                        $scope.seTypes.push(type._id);
                    });
                    $scope.seTypes.push('572bcfa4240149400a234903');
                });

            } //loadSideEventTypes


            //============================================================
            //
            //============================================================
            function loadReservations(start, end, venue, type, conferenceId) {

                var params = {
                    q: {
                        'location.venue': venue,
                        "$and": [{
                            'start': {
                                '$gt': {
                                    '$date': start
                                }
                            }
                        }, {
                            'end': {
                                '$lt': {
                                    '$date': end
                                }
                            }
                        }],
                        'meta.status': {
                            $nin: ['archived', 'deleted']
                        },
                        'sideEvent.meta.status': {
                            $nin: ['archived', 'deleted']
                        },
                        'type': {
                            '$in': $scope.seTypes
                        }
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

                        _.each(conf.seTiers, function(tier, key) {
                            if (diff >= tier.seconds) {
                                if (conf.seTiers[key + 1])
                                    if (diff < conf.seTiers[key + 1].seconds)
                                        res.tier = tier;
                                    else
                                        res.tier = conf.seTiers[key + 1];
                            }
                        });

                        res.timeSeconds = diff;
                        res.conf = conf;
                        if (res.link && res.link._id && res.sideEvent && res.sideEvent.meta.status === 'published') {

                            if (!_.findWhere(conf.times, {
                                    'title': res.tier.title
                                }))

                                conf.times.push({
                                    'seconds':diff,
                                    'value': res.tier.title,
                                    'title': res.tier.title
                                });

                            if (!_.findWhere(conf.days, {
                                    'value': res.daySeconds
                                }))
                                conf.days.push({
                                    'value': res.daySeconds,
                                    'title': res.day + '  ' + res.dayOfWeek
                                });
                        }
                        $scope.day = '';
                    });

                    return responce.data;
                });

            } // loadDocs


            //=======================================================================
            //
            //=======================================================================
            $scope.newMeetingFilter = function(doc) {
                var timestamp = Math.round((new Date()).getTime() / 1000);
                if (doc.end > timestamp)
                    return doc;
            };

            //=======================================================================
            //
            //=======================================================================
            $scope.updateDesc = function(showDesc) {
                $timeout(function() {
                    $scope.showDescriptions = showDesc;
                });
            };

            //=======================================================================
            //
            //=======================================================================
            $scope.dayFilter = function(doc) {

                if (doc.daySeconds === doc.conf.day || !doc.conf.day) return true;
                else return false;

            };

            //=======================================================================
            //
            //=======================================================================
            $scope.futureFilter = function(doc) {

                if (doc.conf.day || doc.conf.time)
                    return true;

                if (moment(doc.end).format('X') > moment.utc().subtract(4, 'hours').format('X')) return true;
                else return false;

            };

            //=======================================================================
            //
            //=======================================================================
            $scope.timeFilter = function(doc) {
                if (doc.tier.title === doc.conf.time || !doc.conf.time) return true;
                else return false;

            };

            //=======================================================================
            //
            //=======================================================================
            $scope.statusFilter = function(doc) {
                if (doc.meta.status === $scope.selectedChip)
                    return doc;
                else if ($scope.selectedChip === 'all' || $scope.selectedChip === '')
                    return doc;

            };


            //============================================================
            //
            //
            //============================================================
            $scope.hasRole = function(roles) {
                if (!$scope.user) return false;

                return _.intersection(roles, $scope.user.roles).length > 0;


            }; //hasRole

            //=======================================================================
            //
            //=======================================================================
            $scope.customSearch = function(docc) {

                var doc = _.clone(docc);
                delete(doc.conf);
                if (!$scope.search || $scope.search == ' ' || $scope.search.length <= 2) return true;
                var temp = JSON.stringify(doc);

                if (_.isString(temp))
                    return (temp.toLowerCase().indexOf($scope.search.toLowerCase()) >= 0);
                else
                    return false;
            };

            //=======================================================================
            //
            //=======================================================================
            $scope.gotoAnchor = function(x) {
                $anchorScroll(x);
            };

            //=======================================================================
            //
            //=======================================================================
            $scope.registerNew = function(id) {
                    $location.url('/manage/events/new?c=' + id);
            }; // archiveOrg

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