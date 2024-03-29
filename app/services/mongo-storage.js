define(['app', 'lodash',  'services/locale'], function(app, _ ){

    app.factory("mongoStorage", ['$http', 'authentication', '$q', 'locale', '$filter', 'devRouter','$timeout', function($http, authentication, $q, locale, $filter, devRouter,$timeout) {

        var user;
        var clientOrg = 0; // means cbd
        loadUser() ;

        //============================================================
        //
        //============================================================
        function loadUser() {
            return authentication.getUser().then(function(u) {
                user = u;
                return user;
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

                delete(document.history);
                return $http.patch(url, cleanDoc(document), params).then(function(res) {
                    authentication.getUser().then(function(user) {
                        var statuses = ['draft', 'scheduled','published', 'request', 'canceled', 'rejected', 'archived'];
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
                return $http.post(url, cleanDoc(document)).then(function(res) {
                    authentication.getUser().then(function(user) {
                        var statuses = ['draft', 'scheduled','published', 'request', 'canceled', 'rejected', 'archived'];
                        getStatusFacits(schema, statuses, user.userID, true);
                        getStatusFacits(schema, statuses, true);

                    });

                    return res;
                });
            } //create
        }

        var types = {};
        //============================================================
        //
        //============================================================
        function loadTypes(schema,force) {
            var allPromises = [];
            var numPromises= 1;
            var modified = true;

            allPromises[0] = isModified('types').then(
                function(isModified) {

                    modified = Boolean(!localStorage.getItem(schema+'-types') | isModified | force);
                    var params = {};
                    if (modified) {
                        params = {
                            q: {'schema':schema,'meta.status':{'$nin':['deleted','archived']}}
                          };
                        numPromises++;
                        allPromises[1]= $http.get('/api/v2016/types', {
                            'params': params
                        }).then(function(res) {

                              types[schema]=res.data;
                              _.each(types[schema], function(type, key) {
                                  type.showChildren = true;
                                  if (type.parent) {
                                      var parentObj = _.find(types[schema], {'_id': type.parent});

                                      if (!parentObj) throw "error ref to parent res type not found.";

                                      if (!parentObj.children) parentObj.children = [];
                                      parentObj.children.push(type);
                                      delete(types[schema][key]);
                                  }
                              });
                        });
                    } else if(!_.isEmpty(types[schema])){
                            numPromises++;
                            return allPromises.push($q(function(resolve) {resolve(types[schema]);}));
                    }else{
                            types[schema]=JSON.parse(localStorage.getItem(schema+'-types'));
                            numPromises++;
                            return allPromises.push($q(function(resolve) {resolve(types[schema]);}));
                    }
                });
                return $q.all(allPromises).then(function() {
                            if(modified && types[schema])
                                localStorage.setItem(schema+'-types', JSON.stringify(types[schema]));
                    //  console.log('retunr',localStorage.getItem(schema+'-types'));
                            return types[schema];
                        });

        } // loadTypes

        var conferences = [];
        //============================================================
        //
        //============================================================
        function loadConferences(force) {
            var allPromises = [];
            var numPromises= 1;
            var modified = true;

            allPromises[0] = isModified('conferences').then(
                function(isModified) {
                    modified = (!localStorage.getItem('allConferences') || isModified || force);
                    var params = {};
                    if (modified) {
                        params = { 
                            s: { StartDate: -1 },
                            q: { 
                                    $and: [
                                        {$or: [ {institution:'CBD'}, {institution:'cbd'} ]},
                                        {$or: [
                                        { ['schedule.sideEvents.seTiers']: { $exists: true } }
                                        ]}
                                    ]
                        } };

                        numPromises++;
                        allPromises[1]= $http.get('/api/v2016/conferences', { params: params })
                        .then(function(res) {
                              var oidArray = [];
                              conferences=res.data;
                              numPromises+=conferences.length;
                              _.each(conferences,function(conf){
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
                                              },
                                              f:{titleShort:1,EVT_CD:1,EVT_THM_CD:1,EVT_FROM_DT:1,EVT_TO_DT:1}
                                          }
                                      }).then(function(m) {
                                          conf.meetings = m.data;
                                      }));
                              });

                          });

                    } else{
                            if(_.isEmpty(conferences))
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

                    if (!localStorage.getItem('allOrgs') || isModified || true) {
                        params = {
                            q: {
                                'meta.status': 'published',
                                'meta.v': {
                                    $ne: 0
                                }
                            },
                            f:{acronym:1,title:1}
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
                      return $q.all([countries(),loadUser()]).then(function() {
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
                      });
                    }

                });

                return loadOrgsInProgress;
        } // loadDocs

        var countriesData;
        //============================================================
        //
        //============================================================
        function countries() {
            if (countriesData) return $q(function(resolve) {
                return resolve(countriesData);
            });

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
                    countriesData =countries;
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
        function loadDocs(schema,q, pageNumber,pageLength,count,sort,fields,all) {

            var params = {};
            if(!sort)
              sort={'meta.modifiedOn':-1};

            if (!schema) throw "Error: failed to indicate schema loadDocs";
            if(!fields)fields=null;

            params = {
                q: q,
                sk: pageNumber,
                l: pageLength,
                s:sort,//{'meta':{'modifiedOn':1}}//{'meta.modifiedOn':1},
                f:fields
            };


           if(!count)
              return $http.get('/api/v2016/' + schema, {'params': params});
           else
              return injectCount(schema,params,all);
        }

        //============================================================
        //
        //============================================================
        function injectCount(schema,params,all) {

            var promises=[];

            promises[0]=$http.get('/api/v2016/' + schema, {'params':_.clone(params)});
            params.c=1;
            params.f={_id:1};
            promises[1]=$http.get('/api/v2016/' + schema, {'params': params});

           if((!params.q['meta.status'] || _.isObject(params.q['meta.status'])) && all)
              _.each(['draft','scheduled','request','published','canceled','rejected','archived'], function(status) {
                  var tempP = _.cloneDeep(params);
                  tempP.q['meta.status']=status;
                  promises.push($http.get('/api/v2016/' + schema, {'params': tempP}));
              });

            return $q.all(promises).then(function(res){
                 res[0].count=res[1].data.count;
                 res[0].facits={all:res[1].data.count};
                  var count=2;
                  if((!params.q['meta.status'] || _.isObject(params.q['meta.status'])) && all)
                    _.each(['draft','scheduled','request','published','canceled','rejected','archived'], function(status) {
                        res[0].facits[status]=res[count].data.count;
                        count++;
                    });
                  else
                    res[0].facits[params.q['meta.status']]=res[1].data.count;

                  return res[0];
            });
        }

        //============================================================
        //
        //============================================================
        function loadOwnerDocs(schema,q, pageNumber,pageLength,count,sort) {

          return $q.when(loadUser()).then(function(user){
              q['meta.createdBy']=user.userID;
            return loadDocs(schema,q, pageNumber,pageLength,count,sort);
          });

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
                    'sideEvent': {
                        $exists: true
                    }
                },
                f:{start:1,end:-1,title:1,description:1,'sideEvent.id':1,'sideEvent.hostOrgs':1,'location.room':1}
            };
            if (text)
                params.q.$text = {
                    '$search': text
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
                    'parent': type,
                    'schema':'reservations'
                }
            };
            return $http.get('/api/v2016/reservations', {
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
        //=======================================================================
        //
        //=======================================================================
        function cleanDoc(docObj) {
            delete(docObj.history);
            delete(docObj.conferenceObj);
            delete(docObj.meetingObjs);
            delete(docObj.subjectObjs);
            if(docObj.logo && docObj.logo.indexOf('mongo.document.attachments.temporary')>-1)
                    docObj.logo = 'app/images/ic_event_black_48px.svg';

            return docObj;
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
                                },
                                f:{_id:1}
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

            if(id) params.docid = id;

          return $http.get("https://api.cbd.int/api/v2016/mongo-document-attachment/" + encodeURIComponent(target.uid), {
              params:params
          });
        } // touch
        //=======================================================================
        //
        //=======================================================================
        function uploadDocAtt(schema, _id, file) {
            if (!schema) throw "Error: no schema set to upload attachment";
            if (!_id) throw "Error: no docId set to upload attachment";

            return uploadTempFile(schema, file, { '_id': _id }).then(function(response) {
                return moveTempFileToPermanent(response.data);
            });
        } // touch
        //=======================================================================
        //
        //=======================================================================
        function uploadTempFile(schema, file, options) {
            if (!schema) throw "Error: no schema set to upload attachment";
            if(!options) options = {};
            var postData = {
                filename: replaceAllSpaces(file.name),
                //amazon messes with camel case and returns objects with hyphen in property name in accessible in JS
                // hence no camalized and no hyphanized meta names
                metadata: {
                    createdby: user.userID,
                    createdon: Date.now(),
                    schema: schema,
                    docid: options._id,
                    filename: replaceAllSpaces(file.name),
                }
            };
            return $http.post('https://api.cbd.int/api/v2015/temporary-files', postData)
            .then(function(response) {
              
              return $http.put(response.data.url, file, { headers: { 'Content-Type': response.data.contentType } })
                .then(function(){
                  return $http.get('https://api.cbd.int/api/v2015/temporary-files/'+encodeURIComponent(response.data.uid))
                });
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
            loadOwnerArchives: loadOwnerArchives,
            loadTypes:loadTypes
        };
    }]);

});
