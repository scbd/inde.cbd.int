define(['app', 'lodash', 'moment', 'services/locale'], function(app, _, moment) {

    app.factory("mongoStorage", ['$http', 'authentication', '$q', 'locale', '$filter', 'devRouter','$timeout', function($http, authentication, $q, locale, $filter, devRouter,$timeout) {

        var user;
        var clientOrg = 0; // means cbd
        loadUser() ;

        //============================================================
        //
        //============================================================
        function loadUser() {
            return authentication.getUser().then(function(u) {
                return user = u;
            });
        }

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

                return $http.put(url, document, params).then(function(res) {
                    authentication.getUser().then(function(user) {
                        var statuses = ['draft', 'published', 'request', 'canceled', 'rejected', 'archived'];
                        getStatusFacits(schema, statuses, user.userID, true);
                        getStatusFacits(schema, statuses, true);

                    });
                    return res;
                });
            } else {
                if (!document.meta) document.meta = {
                    'clientOrg': clientOrg
                };
                if (!document.meta.clientOrg) document.meta.clientOrg = clientOrg;
                return $http.post(url, document).then(function(res) {
                    authentication.getUser().then(function(user) {
                        var statuses = ['draft', 'published', 'request', 'canceled', 'rejected', 'archived'];
                        getStatusFacits(schema, statuses, user.userID, true);
                        getStatusFacits(schema, statuses, true);

                    });

                    return res;
                });
            } //create
        }
        //============================================================
        //
        //============================================================
        function loadConferences(force) {
            var allPromises = [];
            var conferences =[];
            var numPromises= 1;
            var modified = true;

            allPromises[0] = isModified('conferences').then(
                function(isModified) {
                    modified = (!localStorage.getItem('allConferences') || isModified || force);
                    var params = {};
                    if (modified) {
                        params = {
                            q: {}
                          };
                        numPromises++;
                        allPromises[1]= $http.get('/api/v2016/conferences', {
                            'params': params
                        }).then(function(res) {
                              var oidArray = [];
                              conferences=res.data;
                              numPromises+=conferences.length;
                              _.each(conferences,function(conf,key){
                                oidArray=[];
                                      _.each(conf.MajorEventIDs, function(id) {
                                          oidArray.push({
                                              '$oid': id
                                          });
                                      });

                                      allPromises.push($http.get("/api/v2016/meetings", {
                                          params: {
                                              q: {
                                                  _id: {
                                                      $in: oidArray
                                                  }
                                              }
                                          }
                                      }).then(function(m) {
                                          conferences[key].meetings = m.data;
                                      }));
                              });
                          });

                    } else{
                            conferences=JSON.parse(localStorage.getItem('allConferences'));
                            numPromises++;
                            allPromises.push($q(function(resolve) {resolve(conferences);}));
                    }
                });
                return $q(function(resolve, reject) {
                    var timeOut = setInterval(function() {
                        if ((allPromises.length === 2 && !modified) || (modified && numPromises === allPromises.length && allPromises.length > 2) )
                            $q.all(allPromises).then(function() {
                                clearInterval(timeOut);
                                if(modified)
                                  localStorage.setItem('allConferences', JSON.stringify(conferences));
                                resolve(conferences);
                            });

                    }, 100);
                    $timeout(function(){
                      clearInterval(timeOut);
                      reject('Error: getting conferences timed out 5 seconds');
                    },5000);
                });
        } // loadDocs

        var loadOrgsInProgress=null;
        //============================================================
        //
        //============================================================
        function loadOrgs(force) {

            if(loadOrgsInProgress) return loadOrgsInProgress;

            loadOrgsInProgress = isModified('inde-orgs').then(
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

                        return  $http.get('/api/v2016/inde-orgs', {
                            'params': params
                        }).then(function(res) {

                            return $q.all([countries(),loadUser()]).then(function(data) {
                                var orgsAndParties = _.union(res.data, data[0]);

                                localStorage.setItem('allOrgs', JSON.stringify(orgsAndParties));
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
                                    loadOrgsInProgress=null;
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
                            loadOrgsInProgress = null;
                            return _.union(res.data, JSON.parse(localStorage.getItem('allOrgs')));
                        });

                    }

                });

                return loadOrgsInProgress;
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
            docObj.meta.status = 'archived';
            return save(schema, docObj, _id);
        }


        //=======================================================================
        //
        //=======================================================================
        function requestDoc(schema, docObj, _id) {
            docObj.meta.status = 'request';
            return save(schema, docObj, _id);
        }


        //=======================================================================
        //
        //=======================================================================
        function approveDoc(schema, docObj, _id) {
            docObj.meta.status = 'published';
            return save(schema, docObj, _id);
        }

        //=======================================================================
        //
        //=======================================================================
        function cancelDoc(schema, docObj, _id) {
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
            docObj.meta.status = 'rejected';
            return save(schema, docObj, _id);
        }


        //=======================================================================
        //
        //=======================================================================
        function deleteDoc(schema, docObj, _id) {
            docObj.meta.status = 'deleted';
            return save(schema, docObj, _id);
        }


        //=======================================================================
        //
        //=======================================================================
        function unArchiveDoc(schema, docObj, _id) {
            docObj.meta.status = 'draft';
            return save(schema, docObj, _id);
        }

        var isModifiedInProgress =null;
        //=======================================================================
        //
        //=======================================================================
        function isModified(schema) {

          if(isModifiedInProgress)
           return isModifiedInProgress;

            var isModified = true;

            var modifiedSchemas = localStorage.getItem('modifiedSchemas');

            if (modifiedSchemas)
                modifiedSchemas = JSON.parse(modifiedSchemas);




            isModifiedInProgress= $q(function(resolve, reject) {

                $http.get('/api/v2016/' + schema + '/last-modified').then(function(lastModified) {

                    if (!lastModified.data) reject('Error: no date returned');

                    if (!modifiedSchemas || lastModified.data !== modifiedSchemas[schema]) {
                        if (!modifiedSchemas) modifiedSchemas = {};

                        modifiedSchemas[schema] = lastModified.data;
                        localStorage.setItem('modifiedSchemas', JSON.stringify(modifiedSchemas));
                        isModifiedInProgress=null;
                        resolve(isModified);
                    } else {

                        isModified = false;
                        isModifiedInProgress=null;
                        resolve(isModified);

                    }
                }).catch(function(err) {
                    isModifiedInProgress=null;
                    reject(err);
                });

            });
            return isModifiedInProgress;
        }

//todo inprogress stringify query as key in array
        //=======================================================================
        //
        //=======================================================================
        function getStatusFacits(schema, statArry, ownersOnly, force) {

            if (ownersOnly && _.isBoolean(ownersOnly) && !force) force = true;

            var statusFacits = {};
            var allPromises = [];
            var loacalStorageName = schema + 'Facits';

            if (ownersOnly && !_.isBoolean(ownersOnly))
                loacalStorageName = schema + 'Facits' + ownersOnly;


            statusFacits = JSON.parse(localStorage.getItem(loacalStorageName));

            isModified(schema).then(
                function(isModified) {

                    if (!statusFacits || isModified || force) {

                        if (!statusFacits) statusFacits = {};
                        statusFacits.all = 0;
                        statusFacits.allNoArchived = 0;
                        var params = {};
                        _.each(statArry, function(status) {
                            params = {
                                c: 1,
                                q: {
                                    'meta.status': status,
                                }
                            };
                            if (ownersOnly && !_.isBoolean(ownersOnly))
                                params.q['meta.createdBy'] = ownersOnly;

                            allPromises.push($http.get('/api/v2016/' + schema, {
                                'params': params
                            }).then(
                                function(res) {
                                    statusFacits[status] = res.data.count;
                                    if (status !== 'archived')
                                        statusFacits.allNoArchived += res.data.count;

                                    statusFacits.all += res.data.count;
                                }
                            ));
                        });
                    } else {
                        if (ownersOnly && !_.isBoolean(ownersOnly))
                            statusFacits = JSON.parse(localStorage.getItem(schema + 'Facits' + ownersOnly));
                        else
                            statusFacits = JSON.parse(localStorage.getItem(schema + 'Facits'));

                        allPromises.push($q(function(resolve) {
                            resolve(statusFacits);
                        }));
                    }
                }
            );

            return $q(function(resolve, reject) {
                var time;
                var timeOut = setInterval(function() {
                    time = time + 100;
                    if (statArry.length === allPromises.length || (allPromises.length === 1 && (!statusFacits || isModified)))
                        $q.all(allPromises).then(function() {
                            clearInterval(timeOut);
                            if (ownersOnly && !_.isBoolean(ownersOnly))
                                localStorage.setItem(schema + 'Facits' + ownersOnly, JSON.stringify(statusFacits));
                            else
                                localStorage.setItem(schema + 'Facits', JSON.stringify(statusFacits));
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
        function moveTempFileToPermanent(target,id) {
            var params={};
            if(devRouter.isDev())
              params.dev=true;

            if(id)
              params.docid=id;

          return $http.get("/api/v2016/mongo-document-attachment/" + target.uid, {
              params:params
          });
        } // touch
        //=======================================================================
        //
        //=======================================================================
        function uploadDocAtt(schema, _id, file) {
            if (!schema) throw "Error: no schema set to upload attachment";
            if (!_id) throw "Error: no docId set to upload attachment";

            return uploadTempFile(schema, file, {'_id':_id}).then(function(target) {
                  return moveTempFileToPermanent(target.data);
            });
        } // touch
        //=======================================================================
        //
        //=======================================================================
        function uploadTempFile(schema, file, options) {
            if (!schema) throw "Error: no schema set to upload attachment";
            if(!options)options={};
            var postData = {
                filename: replaceAllSpaces(file.name),
                mongo:true,
                //amazon messes with camel case and returns objects with hyphen in property name in accessible in JS
                // hence no camalized and no hyphanized meta names
                public:options.public,
                metadata: {
                    createdby: user.userID,
                    createdon: Date.now(),
                    schema: schema,
                    docid: options._id,
                    filename: replaceAllSpaces(file.name),
                }
            };
            return $http.post('/api/v2015/temporary-files', postData).then(function(res) {
                return $http.put(res.data.url, file, {
                    headers: {
                        'Content-Type': res.data.contentType
                    }
                }).then(function(){console.log(res);return res;});
            });
        } // touch


        //=======================================================================
        //
        //=======================================================================
      function replaceAllSpaces(string) {

          return string.split(' ').reduce(function(prev, curr, index) {
              if (index === 0) return curr;
              else return prev + '-' + curr;
          }, '');

      }
        //=======================================================================
        //
        //=======================================================================
      function awsFileNameFix(string) {
          string = encodeURIComponent(string);
          return string.split('%20').reduce(function(prev, curr, index) {
              curr = curr.replace("'", '%27');
              if (index === 0) return curr;
              else return prev + '-' + curr;
          }, '');

      }
        //=======================================================================
        //
        //=======================================================================
        function isArchived(doc) {

            if (doc && doc.meta && doc.meta.status === 'archived')
                return true;
            else return false;
        }
        //=======================================================================
        //
        //=======================================================================
        function isDeleted(doc) {

            if (doc && doc.meta && doc.meta.status === 'deleted')
                return true;
            else return false;
        }
        //=======================================================================
        //
        //=======================================================================
        function isCanceled(doc) {

            if (doc && doc.meta && doc.meta.status === 'canceled')
                return true;
            else return false;
        }
        //=======================================================================
        //
        //=======================================================================
        function isRejected(doc) {

            if (doc && doc.meta && doc.meta.status === 'rejected')
                return true;
            else return false;
        }
        //=======================================================================
        //
        //=======================================================================
        function isDraft(doc) {

            if (doc && doc.meta && doc.meta.status === 'draft')
                return true;
            else return false;
        }

        //=======================================================================
        //
        //=======================================================================
        function isPublished(doc) {

            if (doc && doc.meta && doc.meta.status === 'published')
                return true;
            else return false;
        }

        //=======================================================================
        //
        //=======================================================================
        function isUnderReview(doc) {

            if (doc && doc.meta && doc.meta.status === 'published')
                return true;
            else return false;
        }

        //=======================================================================
        //
        //=======================================================================
        function isRequest(doc) {

            if (doc && doc.meta && doc.meta.status === 'request')
                return true;
            else return false;
        }

        //=======================================================================
        //
        //=======================================================================
        function isNotPublishable(doc) {

            if (isRejected(doc) || isCanceled(doc) || isDeleted(doc) || isArchived(doc))
                return true;
            else return false;
        }
        //=======================================================================
        //
        //=======================================================================
        function isPublishable(doc) {
            if(!doc) return false;
            if (isDraft(doc) || isRequest(doc) || isPublished(doc) || doc._id.length===2)
                return true;
            else return false;
        }
        //=======================================================================
        //
        //=======================================================================
        function isOrgParty(doc) {

            if (doc && doc.code && doc.code.length === 2 && doc.identifier && doc.identifier.length === 2)
                return true;
            else return false;
        }
        return {
          awsFileNameFix:awsFileNameFix,
            getCountries: countries,
            getLatestConfrences: getLatestConfrences,
            getReservations: getReservations,
            loadOrgs: loadOrgs,
            loadConferences:loadConferences,
            isPublishable: isPublishable,
            isOrgParty: isOrgParty,
            isNotPublishable: isNotPublishable,
            isArchived: isArchived,
            isDeleted: isDeleted,
            isCanceled: isCanceled,
            isRejected: isRejected,
            isDraft: isDraft,
            isPublished: isPublished,
            isUnderReview: isUnderReview,
            isRequest: isRequest,
            moveTempFileToPermanent:moveTempFileToPermanent,
            requestDoc: requestDoc,
            rejectDoc: rejectDoc,
            approveDoc: approveDoc,
            cancelDoc: cancelDoc,
            uploadTempFile:uploadTempFile,
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