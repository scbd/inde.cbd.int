define(['app', 'lodash', 'moment'], function(app, _, moment) {

    return ['mongoStorage', '$route', '$http', '$timeout',function(mongoStorage, $route, $http,$timeout) {

        var _ctrl = this;
        _ctrl.hasError = hasError;
        _ctrl.customSearch = customSearch;
        _ctrl.loadReservations = loadReservations;
        var allOrgs = [];
        _ctrl.preLoadImages = [];
        var countCyc = 0;
        load();
        return this;

        //==============================
        //
        //==============================
        function load() {

            $("head > title").text("Past Side Events");

            _ctrl.subjects = $http.get("/api/v2013/thesaurus/domains/CBD-SUBJECTS/terms", {
                cache: true
            });

            mongoStorage.loadOrgs('inde-orgs').then(function(orgs) {
                allOrgs = orgs;
                _.each(allOrgs, function(org) {
                    var image = new Image();
                    image.src = org.logo;
                    _ctrl.preLoadImages.push(image);
                });
            }).then(
                loadReservations()
            );
        }

        //=======================================================================
        //
        //=======================================================================
        function loadReservations() {

            mongoStorage.getReservations('', '', '', '570fd0a52e3fa5cfa61d90ee', _ctrl.search).then(function(res) {
                _ctrl.reservations = res.data;
                var cancelOrgLoad = setInterval(function() {
                    if (allOrgs && length > 0) {
                        _.each(_ctrl.reservations, function(res) {
                            res.dayOfWeek = moment.utc(res.start).format('dddd');
                            res.day = moment.utc(res.start).format('YYYY-MM-DD');
                            res.time = moment.utc(res.start).format('LT');
                            res.startSeconds = moment.utc(res.start).format('X');
                            res.daySeconds = moment.utc(res.day).format('X');

                            res.sideEvent.orgs = [];
                            _.each(res.sideEvent.hostOrgs, function(org) {
                                res.sideEvent.orgs.push(_.findWhere(allOrgs, {
                                    '_id': org
                                })); // findWhere
                            }); // each
                        }); // each
                        countCyc++;
                    }
                    if (countCyc === 5 || allOrgs.length > 0) // hack
                        clearInterval(cancelOrgLoad);
                }, 1000); //interval
                $timeout(function(){clearInterval(cancelOrgLoad);},5000);
            }).catch(function onerror(response) {
              onError(response);
            });
        }

        //=======================================================================
        //
        //=======================================================================
        function customSearch(docc) {

            var doc = _.clone(docc);
            delete(doc.conf);
            if (!_ctrl.search || _ctrl.search == ' ' || _ctrl.search.length <= 2) return true;
            var temp = JSON.stringify(doc);

            if (_.isString(temp))
                return (temp.toLowerCase().indexOf(_ctrl.search.toLowerCase()) >= 0);
            else
                return false;
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