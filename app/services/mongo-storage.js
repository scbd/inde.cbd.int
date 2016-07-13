define(['app', 'lodash', 'moment', 'services/locale'], function(app, _, moment) {

    app.factory("mongoStorage", ['$http', 'authentication', '$q', 'locale', '$filter','devRouter', function($http, authentication, $q, locale, $filter,devRouter) {

        var user;
        var clientOrg = 0; // means cbd

        authentication.getUser().then(function(u) {
            user = u;
        });

        //============================================================
        //
        //============================================================
        function save(schema, document, _id) {
            var url = '/api/v2016/' + schema;
            if (_id) {

                var params = {};
                params.id = _id;
                url = url + '/' + _id;

                if (!document.meta.clientOrg) document.meta.clientOrg = clientOrg;

                if (_.isNumber(document.meta.createdOn))
                    document.meta.createdOn = new Date(moment.utc(document.meta.createdOn));

                if (_.isNumber(document.meta.modifiedOn))
                    document.meta.modifiedOn = new Date(moment.utc(document.meta.modifiedOn));

                return $http.put(url, document, params).then(function(){
                  authentication.getUser().then(function(user) {
                      var statuses = ['draft', 'published', 'request', 'canceled', 'rejected', 'archived'];
                      getStatusFacits(schema, statuses,'all', user.userID,true);
                      getStatusFacits(schema, statuses,'all',true);
                  });
                });
            } else {
                if (!document.meta) document.meta = {
                    'clientOrg': clientOrg
                };
                if (!document.meta.clientOrg) document.meta.clientOrg = clientOrg;
                return $http.post(url, document).then(function(res) {
                  authentication.getUser().then(function(user) {
                      var statuses = ['draft', 'published', 'request', 'canceled', 'rejected', 'archived'];
                      getStatusFacits(schema, statuses,'all', user.userID,true);
                      getStatusFacits(schema, statuses,'all',true);
                  });
                    return res;
                });
            } //create
        }


        //============================================================
        //
        //============================================================
        function loadOrgs(force) {

            return isModified('inde-orgs').then(
                function(isModified) {

                    var params = {};
                    if (!localStorage.getItem('allOrgs') || isModified || force) {
                        params = {
                            q: {
                              'meta.status': 'published',
                              'meta.v': {
                                  $ne: 0
                              }
                            }
                        };
                        return $http.get('/api/v2016/inde-orgs', {
                            'params': params
                        }).then(function(res) {

                            return countries().then(function(data) {
                                var orgsAndParties = _.union(res.data, data);
                                localStorage.setItem('allOrgs-' + user.userID, JSON.stringify(orgsAndParties));
                                params = {
                                    q: {

                                        'meta.createdBy': user.userID,
                                        'meta.status': {
                                            $in: ['draft', 'request']
                                        },
                                        'meta.v': {
                                            $ne: 0
                                        }
                                    }
                                };

                                return $http.get('/api/v2016/inde-orgs', {
                                    'params': params
                                }).then(function(res) {
                                    orgsAndParties = _.union(res.data, orgsAndParties);
                                    return orgsAndParties;
                                });
                            });
                        });
                    } else {
                        params = {
                            q: {

                                'meta.createdBy': user.userID,
                                'meta.status': {
                                    $in: ['draft', 'request']
                                },
                                'meta.v': {
                                    $ne: 0
                                }
                            }
                        };
                        return $http.get('/api/v2016/inde-orgs', {
                            'params': params
                        }).then(function(res) {
                            return _.union(res.data, JSON.parse(localStorage.getItem('allOrgs-' + user.userID)));
                        });

                    }

                });
        } // loadDocs


        //============================================================
        //
        //============================================================
        function countries() {

            if (!localStorage.getItem('countries'))
                return $http.get("https://api.cbd.int/api/v2015/countries", {
                    cache: true
                }).then(function(o) {
                    var countries = $filter("orderBy")(o.data, "name.en");

                    _.each(countries, function(c) {
                        c.title = c.name.en;
                        c.identifier = c.code.toLowerCase();
                        c._id = c.identifier;
                    });
                    localStorage.setItem('countries', JSON.stringify(countries));
                    return countries;
                });
            else
                return $q(function(resolve) {
                    return resolve(JSON.parse(localStorage.getItem('countries')));
                });

        }


        //============================================================
        //
        //============================================================
        function loadDoc(schema, _id) {


            return $q.when($http.get('/api/v2016/' + schema + '/' + _id)) //}&f={"document":1}'))
                .then(

                    function(response) {
                        if (!_.isEmpty(response.data))
                            return response.data;
                        else
                        return false;

                });
        }


        //============================================================
        //
        //============================================================
        function loadArchives(schema) {

            if (!schema) throw "Error: failed to indicate schema loadArchives";
            var params = {
                q: {
                    'meta.status': 'archived'
                },

            };
            return $q.when($http.get('/api/v2016/' + schema, {
                'params': params
            }));

        }


        //============================================================
        //
        //============================================================
        function loadOwnerArchives(schema) {

            if (!schema) throw "Error: failed to indicate schema loadArchives";
            return $q.when(authentication.getUser().then(function(u) {
                user = u;
            }).then(function() {

                var params = {
                    q: {
                        'meta.status': 'archived',
                        'meta.createdBy': user.userID,
                    },

                };
                return $q.when($http.get('/api/v2016/' + schema, {
                    'params': params
                }));
            }));
        }


        //============================================================
        //
        //============================================================
        function loadDocs(schema, status) {
            var params = {};
            if (!schema) throw "Error: failed to indicate schema loadDocs";
            if (!status) {
                params = {
                    q: {
                        'meta.status': {
                            $nin: ['archived', 'deleted']
                        },
                        'meta.version': {
                            $ne: 0
                        }
                    },

                };
                return $http.get('/api/v2016/' + schema, {
                    'params': params
                });
            }
            if (!_.isArray(status)) {
                params = {
                    q: {
                        'meta.status': status,
                        'meta.version': {
                            $ne: 0
                        }
                    },

                };
                return $http.get('/api/v2016/' + schema, {
                    'params': params
                });
            } else {
                params = {
                    q: {
                        'meta.status': {
                            $in: status
                        },
                        'meta.version': {
                            $ne: 0
                        }
                    },

                };
                return $http.get('/api/v2016/' + schema, {
                    'params': params
                });
            }
        }


        //============================================================
        //
        //============================================================
        function loadOwnerDocs(schema) {

            if (!schema) throw "Error: failed to indicate schema loadDocs";
            return $q.when(authentication.getUser().then(function(u) {
                user = u;
            }).then(function() {
                var params = {
                    q: {
                        'meta.status': {
                            $nin: ['archived', 'deleted']
                        },
                        'meta.createdBy': user.userID,
                        'meta.version': {
                            $ne: 0
                        }
                    }
                };
                return $http.get('/api/v2016/' + schema, {
                    'params': params
                });
            }));
        }


        //=======================================================================
        // creates a doc with version  0 in order to have a base doc for images
        //
        //=======================================================================
        function createDoc(schema) {
            var obj = {
                meta: {
                    locales: [_.clone(locale)],
                    status: 'draft',
                    clientOrg: clientOrg
                },

            };

            return save(schema, obj).then(function(res) {
                return loadDoc(schema, res.data.id);
            });
        }


        //=======================================================================
        //
        //=======================================================================
        function archiveDoc(schema, docObj, _id) {
            docObj.initialState = _.cloneDeep(docObj.document);
            if (docObj.initialState)
                delete(docObj.initialState.history);
            docObj.meta.status = 'archived';
            return save(schema, docObj, _id);
        }


        //=======================================================================
        //
        //=======================================================================
        function requestDoc(schema, docObj, _id) {
            docObj.initialState = _.cloneDeep(docObj.document);
            if (docObj.initialState)
                delete(docObj.initialState.history);
            docObj.meta.status = 'request';
            return save(schema, docObj, _id);
        }


        //=======================================================================
        //
        //=======================================================================
        function approveDoc(schema, docObj, _id) {
            docObj.initialState = _.cloneDeep(docObj.document);
            if (docObj.initialState)
                delete(docObj.initialState.history);
            docObj.meta.status = 'published';
            return save(schema, docObj, _id);
        }

        //=======================================================================
        //
        //=======================================================================
        function cancelDoc(schema, docObj, _id) {
            docObj.initialState = _.cloneDeep(docObj.document);
            if (docObj.initialState)
                delete(docObj.initialState.history);
            docObj.meta.status = 'canceled';
            return save(schema, docObj, _id);
        }

        //============================================================
        //                    sk: pageNumber,
        // l: pageLength,
        // c: count
        //============================================================
        function getReservations(start, end, location, type, page, text) {

            var params = {};
            params = {
                q: {

                    'meta.status': {
                        $nin: ['archived', 'deleted']
                    },
                    'sideEvent.meta.status': {
                        $nin: ['archived', 'deleted']
                    }
                }
            };
            if (text)
                params.q.$text = {
                    '$serch': text
                };

            if (page) {
                params.sk = page.pageNumber;
                params.l = page.pageLength;
                params.c = page.count;
            }
            if (location) {
                params.q.location = {};
                params.q.location.venue = location.venue;
                params.q.location.room = location.room;
            }
            if (start && end) {
                params.q.$and = [{
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
                }];
            } else if (start) {
                params.q.start = {
                    '$gt': {
                        '$date': start
                    }
                };
            } else if (end) {
                params.q.start = {
                    '$lt': {
                        '$date': end
                    }
                };
            }

            //TODO search if parent and if yes search for parent or children
            if (type && _.isString(type)) {
                return getChildrenTypes(type).then(function(typeArr) {
                    if (!params.q.$and) params.q.$and = [];
                    params.q.$and.push({
                        'type': {
                            '$in': typeArr
                        }
                    });
                    return $http.get('/api/v2016/reservations', {
                        'params': params
                    });
                });
            } else
                return $http.get('/api/v2016/reservations', {
                    'params': params
                });
        } // getDocs


        //============================================================
        //                    sk: pageNumber,
        // l: pageLength,
        // c: count
        //============================================================
        function getLatestConfrences() {

            var params = {};
            params = {
                q: {

                }
            };
            params.q.end = {
                '$lt': {
                    '$date': new Date().toISOString()
                }
            };
            return $http.get('/api/v2016/event-groups', {
                'params': params
            });
        } // getDocs


        //============================================================
        //
        //============================================================
        function getChildrenTypes(type) {
            var types = [];
            types.push(type);
            var params = {
                q: {
                    'parent': type
                }
            };
            return $http.get('/api/v2016/reservation-types', {
                'params': params
            }).then(function(responce) {
                _.each(responce.data, function(t) {
                    types.push(t._id);
                });
                return types;
            });

        } //loadSideEventTypes


        //=======================================================================
        //
        //=======================================================================
        function rejectDoc(schema, docObj, _id) {
            docObj.initialState = _.cloneDeep(docObj.document);
            if (docObj.initialState)
                delete(docObj.initialState.history);
            docObj.meta.status = 'rejected';
            return save(schema, docObj, _id);
        }


        //=======================================================================
        //
        //=======================================================================
        function deleteDoc(schema, docObj, _id) {
            docObj.initialState = _.cloneDeep(docObj.document);
            if (docObj.initialState)
                delete(docObj.initialState.history);
            docObj.meta.status = 'deleted';
            return save(schema, docObj, _id);
        }


        //=======================================================================
        //
        //=======================================================================
        function unArchiveDoc(schema, docObj, _id) {
            docObj.initialState = _.cloneDeep(docObj.document);
            if (docObj.initialState)
                delete(docObj.initialState.history);
            docObj.meta.status = 'draft';
            return save(schema, docObj, _id);
        }

        //=======================================================================
        //
        //=======================================================================
        function isModified(schema) {
            var isModified = true;
            var modifiedSchemas = localStorage.getItem('modifiedSchemas');

            if (modifiedSchemas)
                modifiedSchemas = JSON.parse(modifiedSchemas);

            return $q(function(resolve, reject) {

                $http.get('/api/v2016/' + schema + '/last-modified').then(function(lastModified) {

                    if (!lastModified.data) reject('Error: no date returned');

                    if (!modifiedSchemas || lastModified.data !== modifiedSchemas[schema]) {
                        if (!modifiedSchemas) modifiedSchemas = {};

                        modifiedSchemas[schema] = lastModified.data;
                        localStorage.setItem('modifiedSchemas', JSON.stringify(modifiedSchemas));
                        resolve(isModified);
                    } else {

                        isModified = false;
                        resolve(isModified);
                    }
                }).catch(function(err) {
                    reject(err);
                });

            });
        }


        //=======================================================================
        //
        //=======================================================================
        function getStatusFacits(schema, statArry, set, ownersOnly,force) {

            if(_.isBoolean(ownersOnly))force=true;

            var statusFacits = {};
            var allPromises = [];

            if (ownersOnly)
                statusFacits = JSON.parse(localStorage.getItem(schema + 'Facits' + set + ownersOnly));
            else
                statusFacits = JSON.parse(localStorage.getItem(schema + 'Facits' + set));

            isModified(schema).then(
                function(isModified) {
                    if(schema==='inde-orgs') loadOrgs(true);
                    if (!statusFacits || isModified || force) {
                        if (!statusFacits) statusFacits = {};
                        statusFacits.all = 0;
                        var params = {};
                        _.each(statArry, function(status) {
                            params = {
                                c: 1,
                                q: {
                                    'meta.status': status,
                                }
                            };
                            if (ownersOnly)
                                params.q['meta.createdBy'] = ownersOnly;

                            allPromises.push($http.get('/api/v2016/' + schema, {
                                'params': params
                            }).then(
                                function(res) {
                                    statusFacits[status] = res.data.count;
                                    statusFacits.all += res.data.count;
                                }
                            ));
                        });
                    } else {
                        if (ownersOnly && !_.isBoolean(ownersOnly))
                            statusFacits = JSON.parse(localStorage.getItem(schema + 'Facits' + set + ownersOnly));
                        else
                            statusFacits = JSON.parse(localStorage.getItem(schema + 'Facits' + set));

                        allPromises.push($q(function(resolve) {
                            resolve(statusFacits);
                        }));
                    }
                }
            );

            return $q(function(resolve, reject) {
                var time;
                var timeOut = setInterval(function() {
                    time = time + 10;
                    if (statArry.length === allPromises.length || (allPromises.length === 1 && (!statusFacits || isModified)))
                        $q.all(allPromises).then(function() {
                            clearInterval(timeOut);
                            if (ownersOnly)
                                localStorage.setItem(schema + 'Facits' + set + ownersOnly, JSON.stringify(statusFacits));
                            else
                                localStorage.setItem(schema + 'Facits' + set, JSON.stringify(statusFacits));
                            resolve(statusFacits);
                        });
                    else if (time === 5000) {
                        clearInterval(timeOut);

                        reject('Error: getting facits timed out for schema: ' + schema);
                    }
                }, 100);

            });
        } //getStatusFacits


        //=======================================================================
        //
        //=======================================================================
        function uploadDocAtt(schema, _id, file) {
            if (!schema) throw "Error: no schema set to upload attachment";
            if (!_id) throw "Error: no docId set to upload attachment";

            var postData = {
                filename: file.name,
                //amazon messes with camel case and returns objects with hyphen in property name in accessible in JS
                // hence no camalized and no hyphanized meta names
                metadata: {
                    createdby: user.userID,
                    createdon: Date.now(),
                    schema: schema,
                    docid: _id,
                    filename: file.name,
                }
            };
            return $http.post('/api/v2015/temporary-files', postData).then(function(res) {
                // Create a temp file location to upload to
                return res.data;
            }).then(function(target) {
                // upload file to temp area
                return $http.put(target.url, file, {
                    headers: {
                        'Content-Type': target.contentType
                    }
                }).then(function() {
                    // move temp file form temp to its proper home schema/is/filename

                    return $http.get("/api/v2016/mongo-document-attachment/" + target.uid, {
                        params: {
                            dev: devRouter.isDev()
                        }
                    });
                });
            });
        } // touch

        //=======================================================================
        //
        //=======================================================================
        function isArchived (doc){

            if(doc && doc.meta && doc.meta.status==='archived')
            return true;
            else return false;
        }
        //=======================================================================
        //
        //=======================================================================
        function isDeleted(doc){

            if(doc && doc.meta && doc.meta.status==='deleted')
            return true;
            else return false;
        }
        //=======================================================================
        //
        //=======================================================================
        function isCanceled(doc){

            if(doc && doc.meta && doc.meta.status==='canceled')
            return true;
            else return false;
        }
        //=======================================================================
        //
        //=======================================================================
        function isRejected(doc){

            if(doc && doc.meta && doc.meta.status==='rejected')
            return true;
            else return false;
        }
        //=======================================================================
        //
        //=======================================================================
        function isDraft(doc){

            if(doc && doc.meta && doc.meta.status==='draft')
            return true;
            else return false;
        }

        //=======================================================================
        //
        //=======================================================================
        function isPublished(doc){

            if(doc && doc.meta && doc.meta.status==='published')
            return true;
            else return false;
        }

        //=======================================================================
        //
        //=======================================================================
        function isUnderReview(doc){

            if(doc && doc.meta && doc.meta.status==='published')
            return true;
            else return false;
        }

        //=======================================================================
        //
        //=======================================================================
        function isRequest(doc){

            if(doc && doc.meta && doc.meta.status==='request')
            return true;
            else return false;
        }

        //=======================================================================
        //
        //=======================================================================
        function isNotPublishable(doc){

            if(isRejected(doc) || isCanceled(doc) || isDeleted(doc) || isArchived (doc))
            return true;
            else return false;
        }
        //=======================================================================
        //
        //=======================================================================
        function isPublishable(doc){

            if(isDraft(doc) || isRequest(doc) || isPublished(doc))
            return true;
            else return false;
        }
        return {
            getCountries: countries,
            getLatestConfrences: getLatestConfrences,
            getReservations: getReservations,
            loadOrgs: loadOrgs,
isPublishable:isPublishable,

            isNotPublishable:isNotPublishable,
            isArchived: isArchived,
            isDeleted: isDeleted,
            isCanceled: isCanceled,
            isRejected: isRejected,
            isDraft:isDraft,
            isPublished:isPublished,
            isUnderReview:isUnderReview,
            isRequest:isRequest,

            requestDoc: requestDoc,
            rejectDoc: rejectDoc,
            approveDoc: approveDoc,
            cancelDoc: cancelDoc,

            getStatusFacits: getStatusFacits,
            deleteDoc: deleteDoc,
            loadDoc: loadDoc,
            loadOwnerDocs: loadOwnerDocs,
            createDoc: createDoc,
            save: save,
            uploadDocAtt: uploadDocAtt,
            archiveDoc: archiveDoc,
            loadArchives: loadArchives,
            loadDocs: loadDocs,
            unArchiveDoc: unArchiveDoc,
            loadOwnerArchives: loadOwnerArchives
        };
    }]);

});