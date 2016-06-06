define(['app','lodash','services/locale'], function (app,_) {

app.factory("mongoStorage", ['$http','authentication','$q','locale', function($http,authentication,$q,locale) {

        var user;
        authentication.getUser().then(function(u){
          user=u;
          if( _.intersection(['Administrator','IndeAdministrator'], user.roles).length>0)
          {
            deleteTempRecords('inde-orgs');
            deleteTempRecords('inde-side-events');
            //
          }

        });
        var clientOrg = 0; // means cbd



        //============================================================
        //
        //============================================================
        function save (schema,document,_id){
               var url        = '/api/v2016/'+schema;
               var prevDoc    = _.cloneDeep(document.initialState) || {};
               var currentDoc = _.cloneDeep(document);
               var data={};

               var params     = {};

               delete(prevDoc.history);
               delete(currentDoc.initialState);
                if(_id){
                    params.id = _id;
                    url=url+'/'+_id;

                      delete(currentDoc._id);
                      delete(currentDoc.history);
                      if(currentDoc.meta && currentDoc.meta.version ===0)currentDoc.meta.version=1;
                      if(currentDoc.meta && (typeof currentDoc.meta.createdOn ==='number'))currentDoc.meta.createdOn=new Date(currentDoc.meta.createdOn).toUTCString();
                      if(currentDoc.meta && (typeof currentDoc.meta.modifiedOn ==='number'))currentDoc.meta.modifiedOn=new Date(currentDoc.meta.modifiedOn).toUTCString();
                      if(!currentDoc.clientOrg)currentDoc.clientOrg=clientOrg;
                      data=_.cloneDeep(currentDoc);
                      data.$set  = currentDoc;
                      data.$push = {"history":prevDoc};

                      return $http.patch(url,data,params);

                }
                else{
                      currentDoc.meta={};
                      currentDoc.meta.version=0;

                      if(!currentDoc.clientOrg)currentDoc.clientOrg=clientOrg;

                      return $http.post(url,currentDoc,params).then(function(res){
                        currentDoc.initialState=data;
                        delete(currentDoc.initialState.history);
                        return res;
                      });


                }  //create
        }

        //============================================================
        //
        //============================================================
        function loadOrgs (){

              var params = {q:{'meta.status':'published'}};

              if(!localStorage.getItem('allOrgs'))
                    return $http.get('/api/v2016/inde-orgs',{params:params, cache:false}).then(function(res){
                            localStorage.setItem('allOrgs',JSON.stringify(res.data));
                    });
              else
                return $q(function(resolve) {
                      return resolve(JSON.parse(localStorage.getItem('allOrgs')));
                  });


        }// loadDocs
        //============================================================
        //
        //============================================================
        function deleteTempRecords(schema) {
            var oneDay = Math.round(new Date().getTime()/1000)+86400;
            var params = {
                            q:{'meta.version':0,'meta.createdOn':{'$gt':oneDay}},
                            cache:false
                          };
            $http.get('/api/v2016/'+schema,{'params':params}).then(function(res){
                  _.each(res.data,function(obj){
                        $http.delete('/api/v2016/'+schema+'/'+obj._id);
                  });
            });

        }

        //============================================================
        //
        //============================================================
        function loadDoc (schema,_id){
          //+'?q={"_id":{"$oid":"'+_id+'"},"clientOrganization":'+clientOrg+'}&f={"document":1}'
            if(!schema) throw "Error: failed to indicate schema mongoStorageService.loadDocument";
            // var params = {
            //               q:{_id:{$oid:_id}}
            //             };
            return $q.when( $http.get('/api/v2016/'+schema+'/'+_id))//}&f={"document":1}'))
                   .then(

                        function(response){
                            if(!_.isEmpty(response.data)){
                                response.data.initialState=_.cloneDeep(response.data);
                                delete(response.data.initialState.history);
                                return  response.data;
                            }
                            else
                              return false;
                        }
                  );
        }
        //============================================================
        //
        //============================================================
        function loadArchives (schema){
          //+'?q={"_id":{"$oid":"'+_id+'"},"clientOrganization":'+clientOrg+'}&f={"document":1}'
            if(!schema) throw "Error: failed to indicate schema loadArchives";
            var params = {
                          q:{'meta.status':'archived'},

                        };
            return $q.when( $http.get('/api/v2016/'+schema,{'params':params}));

        }
        //============================================================
        //
        //============================================================
        function loadOwnerArchives (schema){
          //+'?q={"_id":{"$oid":"'+_id+'"},"clientOrganization":'+clientOrg+'}&f={"document":1}'
            if(!schema) throw "Error: failed to indicate schema loadArchives";
            return $q.when( authentication.getUser().then(function(u){
                      user=u;
                    }).then( function(){

                        var params = {
                                      q:{'meta.status':'archived', 'meta.createdBy':user.userID,},

                                    };
                        return $q.when( $http.get('/api/v2016/'+schema,{'params':params}));
                    }));
        }
        //============================================================
        //
        //============================================================
        function loadDocs (schema,status){
          //+'?q={"_id":{"$oid":"'+_id+'"},"clientOrganization":'+clientOrg+'}&f={"document":1}'

            var params={};
            if(!schema) throw "Error: failed to indicate schema loadDocs";
            if(!status){
              params = {
                          q:{'meta.status':{$nin:['archived','deleted']},
                              'meta.version':{$ne:0}
                            },

                        };
              return $http.get('/api/v2016/'+schema,{'params':params});
            }
            if(!_.isArray(status)){
              params = {
                          q:{'meta.status':status,
                          'meta.version':{$ne:0}
                            },

                        };
              return $http.get('/api/v2016/'+schema,{'params':params});
            }
            else {
                params = {
                            q:{'meta.status':{$in:status},
                            'meta.version':{$ne:0}
                              },

                          };
              return $http.get('/api/v2016/'+schema,{'params':params});
            }


        }
        //============================================================
        //
        //============================================================
        function loadOwnerDocs (schema){

            if(!schema) throw "Error: failed to indicate schema loadDocs";
            return  $q.when( authentication.getUser().then(function(u){
                      user=u;
                    }).then( function(){
                      var params = {
                                  q:{'meta.status':{$nin:['archived','deleted']},
                                     'meta.createdBy':user.userID,
                                     'meta.version':{$ne:0}
                                    }
                                };
                        return $http.get('/api/v2016/'+schema,{'params':params});
                      }));
        }
        //=======================================================================
        // creates a doc with version  0 in order to have a base doc for images
        //
        //=======================================================================
        function createDoc (schema){
              var obj = {
                      meta:{
                        locales:[_.clone(locale)],
                        v:-1,
                        status: 'draft'
                      },
                      clientOrg:clientOrg
                  };

              return save(schema,obj).then(function(res){
                  return loadDoc (schema,res.data.id);
              });
        }

        //=======================================================================
        //
        //=======================================================================
        function archiveDoc(schema,docObj,_id){
              docObj.initialState=_.cloneDeep(docObj.document);
              if(docObj.initialState)
                delete(docObj.initialState.history);
              docObj.meta.status='archived';
              return save(schema,docObj,_id);
        }
        //=======================================================================
        //
        //=======================================================================
        function requestDoc(schema,docObj,_id){
              docObj.initialState=_.cloneDeep(docObj.document);
              if(docObj.initialState)
                delete(docObj.initialState.history);
              docObj.meta.status='request';
              return save(schema,docObj,_id);
        }
        //=======================================================================
        //
        //=======================================================================
        function approveDoc(schema,docObj,_id){
              docObj.initialState=_.cloneDeep(docObj.document);
              if(docObj.initialState)
                delete(docObj.initialState.history);
              docObj.meta.status='published';
              return save(schema,docObj,_id);
        }
        //=======================================================================
        //
        //=======================================================================
        function cancelDoc(schema,docObj,_id){
              docObj.initialState=_.cloneDeep(docObj.document);
              if(docObj.initialState)
                delete(docObj.initialState.history);
              docObj.meta.status='canceled';
              return save(schema,docObj,_id);
        }

        //============================================================
      //                    sk: pageNumber,
                          // l: pageLength,
                          // c: count
      //============================================================
      function getReservations(start, end, location, type,page,text) {

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
          if(text)
            params.q.$text={'$serch':text};

          if(page){
            params.sk=page.pageNumber;
            params.l=page.pageLength;
            params.c=page.count;
          }
          if(location){
            params.q.location={};
            params.q.location.venue=location.venue;
            params.q.location.room=location.room;
          }
          if(start && end){
              params.q.$and= [{
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
          } else if(start){
            params.q.start={
                '$gt': {
                    '$date': start
                }
            };
          }else if(end){
            params.q.start={
                '$lt': {
                    '$date': end
                }
            };
          }

          //TODO search if parent and if yes search for parent or children
          if (type && _.isString(type)) {
              return getChildrenTypes(type).then(function(typeArr) {
                 if(!params.q.$and)params.q.$and=[];
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
    function getLatestConfrences () {

        var params = {};
        params = {
            q: {

            }
        };

          params.q.end={
              '$lt': {
                  '$date': new Date().toISOString()
              }
          };



        return $http.get('/api/v2016/conferences', {
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
        function rejectDoc(schema,docObj,_id){
              docObj.initialState=_.cloneDeep(docObj.document);
              if(docObj.initialState)
                delete(docObj.initialState.history);
              docObj.meta.status='rejected';
              return save(schema,docObj,_id);
        }
        //=======================================================================
        //
        //=======================================================================
        function deleteDoc(schema,docObj,_id){
              docObj.initialState=_.cloneDeep(docObj.document);
              if(docObj.initialState)
                delete(docObj.initialState.history);
              docObj.meta.status='deleted';
              return save(schema,docObj,_id);
        }

        //=======================================================================
        //
        //=======================================================================
        function unArchiveDoc(schema,docObj,_id){
              docObj.initialState=_.cloneDeep(docObj.document);
              if(docObj.initialState)
                delete(docObj.initialState.history);
              docObj.meta.status='draft';
              return save(schema,docObj,_id);
        }

        //=======================================================================
        //
        //=======================================================================
        function getStatusFacits(schema,statusFacits,statArry,stat){
              statusFacits.all=0;
              if(!statArry)
                statArry=statuses;
              if(stat){
                $http.get('/api/v2016/'+schema+'?c=1&q={"meta.status":"'+stat+'","meta.version":{"$ne":0}}').then(
                  function(res){

                    statusFacits[stat]=res.data.count;
                    statusFacits.all+=res.data.count;
                  }
                );
              }
              else
              _.each(statArry,function(status){

                    $http.get('/api/v2016/'+schema+'?c=1&q={"meta.status":"'+status+'","meta.version":{"$ne":0}}').then(
                      function(res){
                        statusFacits[status]=res.data.count;
                        statusFacits.all+=res.data.count;
                      }
                    );

              });
        }//getStatusFacits
        //=======================================================================
        //
        //=======================================================================
        function getOwnerFacits(schema,statusFacits,statArry,stat){
          statusFacits.draft=0;
          statusFacits.deleted=0;
          statusFacits.approved=0;
          statusFacits.rejected=0;
          statusFacits.canceled=0;
          statusFacits.archived=0;
          statusFacits.all=0;
          return  $q.when( authentication.getUser().then(function(u){
                            user=u;
                          }).then( function(){
                            statusFacits.all=0;
                            if(!statArry)
                              statArry=statuses;
                            if(stat){
                              $http.get('/api/v2016/'+schema+'?c=1&q={"meta.status":"'+stat+'","meta.version":{"$ne":0},"meta.createdBy":'+user.userID+'}').then(
                                function(res){

                                  statusFacits[stat]=res.data.count;
                                  statusFacits.all+=res.data.count;
                                }
                              );
                            }
                            else
                            _.each(statArry,function(status){

                                  $http.get('/api/v2016/'+schema+'?c=1&q={"meta.status":"'+status+'","meta.version":{"$ne":0},"meta.createdBy":'+user.userID+'}').then(
                                    function(res){
                                      statusFacits[status]=res.data.count;
                                      statusFacits.all+=res.data.count;
                                    }
                                  );
                            });
                          })
                  );
        }//getStatusFacits
        //=======================================================================
        //
        //=======================================================================
        function generateEventId(){
              var params = {};
              params.f={'id':1};
              params.s={ 'id' : -1 };
              params.l=1;
              return  $http.get('/api/v2016/inde-side-events',{'params':params});

        }//getStatusFacits


        //=======================================================================
        //
        //=======================================================================
        function uploadDocAtt(schema,_id,file){
              if(!schema)throw "Error: no schema set to upload attachment";
              if(!_id)throw "Error: no docId set to upload attachment";

              var postData = {
                filename: file.name,
                //amazon messes with camel case and returns objects with hyphen in property name in accessible in JS
                // hence no camalized and no hyphanized meta names
                metadata:{
                    createdby:user.userID,
                    createdon:Date.now(),
                    schema:schema,
                    docid:_id,
                    filename:file.name,
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
                    return $http.get("/api/v2016/mongo-document-attachment/"+target.uid, { });
                  });
              });
        } // touch

        return{
          getLatestConfrences:getLatestConfrences,
          getReservations:getReservations,
          loadOrgs:loadOrgs,
          getOwnerFacits:getOwnerFacits,
          requestDoc:requestDoc,
          rejectDoc:rejectDoc,
          approveDoc:approveDoc,
          cancelDoc:cancelDoc,
          generateEventId:generateEventId,
          getStatusFacits:getStatusFacits,
          deleteDoc:deleteDoc,
          loadDoc:loadDoc,
          loadOwnerDocs:loadOwnerDocs,
          createDoc:createDoc,
          save:save,
          uploadDocAtt:uploadDocAtt,
          archiveDoc:archiveDoc,
          loadArchives:loadArchives,
          loadDocs:loadDocs,
          unArchiveDoc:unArchiveDoc,
          loadOwnerArchives:loadOwnerArchives
        };
}]);

});