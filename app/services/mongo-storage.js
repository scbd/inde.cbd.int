define(['app','lodash','libs/js-sha256/build/sha256.min','scbd-angularjs-services/locale'], function (app,_) {

app.factory("mongoStorage", ['$http','authentication','$q','locale','$location', function($http,authentication,$q,locale,$location) {

        var user;
        authentication.getUser().then(function(u){
          user=u;
          // if( _.intersection(['Administrator','IndeAdministrator'], user.roles).length>0)
          // {
          //   deleteTempRecords('inde-orgs');
          //   deleteTempRecords('inde-side-events');
          // }

        });
        var clientOrg = 0; // means cbd

        var statuses=['draft','published','request','deleted','archived','canceled','rejected'];


        //============================================================
        //
        //============================================================
        function save (schema,document,_id){
               var url        = '/api/v2015/'+schema;
               var params     = {};
               var data       = (document||{});

                if(_id){
                    params.id = _id;
                    url=url+'/'+_id;
                    data.clientOrg = clientOrg;
                    return touch(data).then(function(){return $http.put(url,data,params);});

                }
                else{
                    data.clientOrg=clientOrg;
                    return touch(data).then(function(){return $http.post(url,data,params);});
                }  //create
        }


        // //============================================================
        // //
        // //============================================================
        // function deleteTempRecords(schema) {
        //
        //     var params = {
        //                     q:{'meta.v':0},
        //                     cache:false
        //                   };
        //     $http.get('/api/v2015/'+schema,{'params':params}).then(function(res){
        //           _.each(res.data,function(obj){
        //                 $http.delete('/api/v2015/'+schema+'/'+obj._id);
        //           });
        //     });
        //
        // }

        //============================================================
        //
        //============================================================
        function loadDoc (schema,_id){
          //+'?q={"_id":{"$oid":"'+_id+'"},"clientOrganization":'+clientOrg+'}&f={"document":1}'
            if(!schema) throw "Error: failed to indicate schema mongoStorageService.loadDocument";
            var params = {
                          q:{_id:{$oid:_id}}
                        };
            return $q.when( $http.get('/api/v2015/'+schema,{'params':params}))//}&f={"document":1}'))
                   .then(
                        function(response){
                            if(response.data.length)
                                return  response.data[0];
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
            return $q.when( $http.get('/api/v2015/'+schema,{'params':params}));

        }
        //============================================================
        //
        //============================================================
        function loadDocs (schema,status){
          //+'?q={"_id":{"$oid":"'+_id+'"},"clientOrganization":'+clientOrg+'}&f={"document":1}'

            var params={};
            if(!schema) throw "Error: failed to indicate schema loadOwnerDocs";
            if(!status){
              params = {
                          q:{'meta.status':{$nin:['archived','deleted']},
                              'meta.v':{$ne:0}
                            },

                        };
              return $http.get('/api/v2015/'+schema,{'params':params});
            }
            if(!_.isArray(status)){
              params = {
                          q:{'meta.status':status,
                          'meta.v':{$ne:0}
                            },

                        };
              return $http.get('/api/v2015/'+schema,{'params':params});
            }
            else {
                params = {
                            q:{'meta.status':{$in:status},
                            'meta.v':{$ne:0}
                              },

                          };
              return $http.get('/api/v2015/'+schema,{'params':params});
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
                                     'meta.v':{$ne:0}
                                    }
                                };
                        return $http.get('/api/v2015/'+schema,{'params':params});
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
                      }
                  };

              return save(schema,obj).then(function(res){
                  return loadDoc (schema,res.data.id);
              });
        }

        //=======================================================================
        //
        //=======================================================================
        function archiveDoc(schema,docObj,_id){

              docObj.meta.status='archived';
              return save(schema,docObj,_id);
        }
        //=======================================================================
        //
        //=======================================================================
        function requestDoc(schema,docObj,_id){

              docObj.meta.status='request';
              return save(schema,docObj,_id);
        }
        //=======================================================================
        //
        //=======================================================================
        function approveDoc(schema,docObj,_id){

              docObj.meta.status='published';
              return save(schema,docObj,_id);
        }
        //=======================================================================
        //
        //=======================================================================
        function cancelDoc(schema,docObj,_id){

              docObj.meta.status='canceled';
              return save(schema,docObj,_id);
        }
        //=======================================================================
        //
        //=======================================================================
        function rejectDoc(schema,docObj,_id){

              docObj.meta.status='rejected';
              return save(schema,docObj,_id);
        }
        //=======================================================================
        //
        //=======================================================================
        function deleteDoc(schema,docObj,_id){

              docObj.meta.status='deleted';
              return save(schema,docObj,_id);
        }

        //=======================================================================
        //
        //=======================================================================
        function unArchiveDoc(schema,docObj,_id){

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
                $http.get('/api/v2015/'+schema+'?c=1&q={"meta.status":"'+stat+'","meta.v":{"$ne":0}}').then(
                  function(res){

                    statusFacits[stat]=res.data.count;
                    statusFacits['all']+=res.data.count;
                  }
                );
              }
              else
              _.each(statArry,function(status){

                    $http.get('/api/v2015/'+schema+'?c=1&q={"meta.status":"'+status+'","meta.v":{"$ne":0}}').then(
                      function(res){
                        statusFacits[status]=res.data.count;
                        statusFacits['all']+=res.data.count;
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
                              $http.get('/api/v2015/'+schema+'?c=1&q={"meta.status":"'+stat+'","meta.v":{"$ne":0},"meta.createdBy":'+user.userID+'}').then(
                                function(res){

                                  statusFacits[stat]=res.data.count;
                                  statusFacits['all']+=res.data.count;
                                }
                              );
                            }
                            else
                            _.each(statArry,function(status){

                                  $http.get('/api/v2015/'+schema+'?c=1&q={"meta.status":"'+status+'","meta.v":{"$ne":0},"meta.createdBy":'+user.userID+'}').then(
                                    function(res){
                                      statusFacits[status]=res.data.count;
                                      statusFacits['all']+=res.data.count;
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
              return  $http.get('/api/v2015/inde-side-events',{'params':params});

        }//getStatusFacits



        //=======================================================================
        //
        //=======================================================================
        function touch(doc){
          return authentication.getUser().then(function(u){
            user=u;

              if(!user.userID) throw "Error no userID to touch record";
              if(!doc.meta) throw "Error mongo document contains no meta data";

              if(!doc.meta.status) doc.meta.status='draft';

              if(!doc.meta.createdBy && !doc.meta.createdOn){
                doc.meta.createdBy = doc.meta.modifiedBy = user.userID;
                doc.meta.createdOn  = doc.meta.modifiedOn = Date.now();
              }else if (doc.meta.createdBy && doc.meta.createdOn){
                doc.meta.modifiedBy = user.userID;
                doc.meta.modifiedOn = Date.now();
              }
              doc.meta.v=Number(doc.meta.v)+1;

              doc.meta.hash=sha256(JSON.stringify(doc));  //jshint ignore:line
          });
        } // touch

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
                    return $http.get("/api/v2015/mongo-document-attachment/"+target.uid, { });
                  });
              });
        } // touch

        return{
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
          unArchiveDoc:unArchiveDoc
        };
}]);

});