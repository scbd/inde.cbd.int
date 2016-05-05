define(['app', 'lodash'], function(app, _) {
    app.filter('fileSize', function() {
        return function(size) {
            if (size < 1024)
                return Math.ceil(size) + ' B';
            else if (size < 1048576)
                return Math.ceil((Number(size) / 1024)) + ' KB';
            else
                return Math.ceil((Number(size) / 1048576)) + ' MB';
        };
    });

    return ['mongoStorage', '$route', '$http','$sce', function(mongoStorage, $route, $http,$sce) {

        var _ctrl = this;
        _ctrl.hasError = hasError;
        _ctrl.trustSrc =trustSrc;
        load();
        return this;

        //==============================
        //
        //==============================
        function load() {
            var _id = $route.current.params.id;
            $http.get('/api/v2016/conferences?s={"start":1}').then(function(conf) {
                _ctrl.conferences = conf.data;

            });
            _ctrl.subjects = $http.get("/api/v2013/thesaurus/domains/CBD-SUBJECTS/terms", {
                cache: true
            });
            mongoStorage.loadDoc('inde-side-events', _id).then(function(se) {
                _ctrl.doc = se;
                _ctrl.doc.orgs = [];

                _ctrl.doc.conferenceObj = _.find(_ctrl.conferences, {
                    '_id': _ctrl.doc.confrence
                });

                _.each(_ctrl.doc.hostOrgs, function(org) {
                    mongoStorage.loadDoc('inde-orgs', org).then(function(res) {
                        _ctrl.doc.orgs.push(res);
                    }).catch(onError);

                });
                _ctrl.doc.subjectObjs = [];
                _ctrl.subjects.then(function(res) {
                    _.each(_ctrl.doc.subjects, function(subj) {

                        _ctrl.doc.subjectObjs.push(_.find(res.data, {
                            'identifier': subj.identifier
                        }));

                    });

                }).catch(onError);

            }).catch(onError);
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
        function trustSrc (src) {
            return $sce.trustAsResourceUrl(src);
        };
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