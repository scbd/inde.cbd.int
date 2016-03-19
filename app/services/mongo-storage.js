define(['app','lodash','libs/js-sha256/build/sha256.min','scbd-angularjs-services/locale'], function (app,_) {

app.factory("mongoStorage", ['$http','authentication','$q','locale','$location', function($http,authentication,$q,locale,$location) {

        var user;
        authentication.getUser().then(function(u){
          user=u;
          if( _.intersection(['Administrator','IndeAdministrator'], user.roles).length>0)
          {
            deleteTempRecords('inde-orgs');
            deleteTempRecords('inde-side-events');
          }

        });
        var clientOrg = 0; // means cbd

        var statuses=['draft','published','request','deleted','archived','canceled','rejected'];


        //============================================================
        //
        //============================================================
        function save (schema,document,_id){

               var prevDoc    = _.cloneDeep(document.initialState) || {};
               var currentDoc = _.cloneDeep(document);
               var url        = '/api/v2015/'+schema;
               var params     = {};
               var data       = {};



                // update document
                if(_id){
                    if(_.isEmpty(prevDoc)) throw "Error: no previous state of document detected.  Usually a result of saving a document then not reloading the values";
                    params.id = _id;
                    delete(currentDoc.initialState);
                    return touch(currentDoc).then(function(){
                      url=url+'/'+_id;
                      data.document=currentDoc;
                      data.clientOrg=clientOrg;
                      data.$set  = {"document":currentDoc};
                      data.$push = {"history":prevDoc};
                      return $http.patch(url,data,params).then(function(res){
                        //deleteTempRecords(schema);
                        res.data._id=_id;
                        return res;
                      });
                    });
                } //update
                else{
                  return touch(currentDoc).then(function(){
                    data.document=currentDoc;
                    data.clientOrg=clientOrg;
                    return $http.post(url,data,params).then(function(res){
                      currentDoc.initialState=currentDoc;
                      return res;
                    });
                  });

                }  //create
        }


        //============================================================
        //
        //============================================================
        function deleteTempRecords(schema) {

            $http.get('/api/v2015/'+schema+'?q={"document.meta.v":0}&f={"_id":1}').then(function(res){
                  _.each(res.data,function(obj){
                        $http.delete('/api/v2015/'+schema+'/'+obj._id);
                  });
            });

        }

        //============================================================
        //
        //============================================================
        function loadDoc (schema,_id){
          //+'?q={"_id":{"$oid":"'+_id+'"},"clientOrganization":'+clientOrg+'}&f={"document":1}'
            if(!schema) throw "Error: failed to indicate schema mongoStorageService.loadDocument line:34";
            return $q.when( $http.get('/api/v2015/'+schema+'?q={"_id":{"$oid":"'+_id+'"}}&f={"document":1}'))//}&f={"document":1}'))
                   .then(
                        function(response){
                              if(response.data.length){
                                 response.data[0].document.initialState=_.cloneDeep(response.data[0].document);
                                 return [response.data[0]._id,response.data[0].document];
                              }
                           }
                  );
        }
        //============================================================
        //
        //============================================================
        function loadArchives (schema){
          //+'?q={"_id":{"$oid":"'+_id+'"},"clientOrganization":'+clientOrg+'}&f={"document":1}'
            if(!schema) throw "Error: failed to indicate schema loadArchives";

            return $q.when( $http.get('/api/v2015/'+schema+'?q={"document.meta.status":"archived"}&f={"document":1}'));//}&f={"document":1}'))

        }
        //============================================================
        //
        //============================================================
        function loadDocs (schema,status){
          //+'?q={"_id":{"$oid":"'+_id+'"},"clientOrganization":'+clientOrg+'}&f={"document":1}'
          var qStr='';
            if(!schema) throw "Error: failed to indicate schema loadOwnerDocs";
            if(!status)
              return $http.get('/api/v2015/'+schema+'?q={"document.meta.status":{"$nin":["archived","deleted"]},"document.meta.v":{"$ne":0}}&f={"document":1}');

            if(!_.isArray(status))
              return $http.get('/api/v2015/'+schema+'?q={"document.meta.status":"'+status+'","document.meta.v":{"$ne":0}}&f={"document":1}');
            else {
              _.each(status,function(stat,key){

                  qStr =  qStr+'"'+stat+'"';
                  if(status.length!==key+1)
                    qStr =qStr+',';
              });
              qStr= '{"$in":['+ qStr +']}';
              return $http.get('/api/v2015/'+schema+'?q={"document.meta.status":'+qStr+',"document.meta.v":{"$ne":0}}&f={"document":1}');
            }


        }
        //============================================================
        //
        //============================================================
        function loadOwnerDocs (schema){
          //+'?q={"_id":{"$oid":"'+_id+'"},"clientOrganization":'+clientOrg+'}&f={"document":1}'
            if(!schema) throw "Error: failed to indicate schema loadDocs";
            return  $q.when( authentication.getUser().then(function(u){
                      user=u;
                    }).then( function(){
                        return $http.get('/api/v2015/'+schema+'?q={"document.meta.status":{"$nin":["archived","deleted"]},"document.meta.v":{"$ne":0},"document.meta.createdBy":'+user.userID+'}&f={"document":1}');
                      }));
        }
        //=======================================================================
        // creates a doc with version  0 in order ot have a base doc for images
        //  ugly hack running out of time;
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
              docObj.document.initialState=_.cloneDeep(docObj.document);
              docObj.document.meta.status='archived';
              return save(schema,docObj.document,_id);
        }
        //=======================================================================
        //
        //=======================================================================
        function requestDoc(schema,docObj,_id){
              docObj.document.initialState=_.cloneDeep(docObj.document);
              docObj.document.meta.status='request';
              return save(schema,docObj.document,_id);
        }
        //=======================================================================
        //
        //=======================================================================
        function approveDoc(schema,docObj,_id){
              docObj.document.initialState=_.cloneDeep(docObj.document);
              docObj.document.meta.status='published';
              return save(schema,docObj.document,_id);
        }
        //=======================================================================
        //
        //=======================================================================
        function cancelDoc(schema,docObj,_id){
              docObj.document.initialState=_.cloneDeep(docObj.document);
              docObj.document.meta.status='canceled';
              return save(schema,docObj.document,_id);
        }
        //=======================================================================
        //
        //=======================================================================
        function rejectDoc(schema,docObj,_id){
              docObj.document.initialState=_.cloneDeep(docObj.document);
              docObj.document.meta.status='rejected';
              return save(schema,docObj.document,_id);
        }
        //=======================================================================
        //
        //=======================================================================
        function deleteDoc(schema,docObj,_id){
              docObj.document.initialState=_.cloneDeep(docObj.document);
              docObj.document.meta.status='deleted';
              return save(schema,docObj.document,_id);
        }

        //=======================================================================
        //
        //=======================================================================
        function unArchiveDoc(schema,docObj,_id){
              docObj.document.initialState=_.cloneDeep(docObj.document);
              docObj.document.meta.status='draft';
              return save(schema,docObj.document,_id);
        }

        //=======================================================================
        //
        //=======================================================================
        function getStatusFacits(schema,statusFacits,statArry,stat){
              statusFacits.all=0;
              if(!statArry)
                statArry=statuses;
              if(stat){
                $http.get('/api/v2015/'+schema+'?c=1&q={"document.meta.status":"'+stat+'","document.meta.v":{"$ne":0}}&f={"document":1}').then(
                  function(res){

                    statusFacits[stat]=res.data.count;
                    statusFacits['all']+=res.data.count;
                  }
                );
              }
              else
              _.each(statArry,function(status){

                    $http.get('/api/v2015/'+schema+'?c=1&q={"document.meta.status":"'+status+'","document.meta.v":{"$ne":0}}&f={"document":1}').then(
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
                              $http.get('/api/v2015/'+schema+'?c=1&q={"document.meta.status":"'+stat+'","document.meta.v":{"$ne":0},"document.meta.createdBy":'+user.userID+'}&f={"document":1}').then(
                                function(res){

                                  statusFacits[stat]=res.data.count;
                                  statusFacits['all']+=res.data.count;
                                }
                              );
                            }
                            else
                            _.each(statArry,function(status){

                                  $http.get('/api/v2015/'+schema+'?c=1&q={"document.meta.status":"'+status+'","document.meta.v":{"$ne":0},"document.meta.createdBy":'+user.userID+'}&f={"document":1}').then(
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


              return  $http.get('/api/v2015/inde-side-events?c=1&q={"document.meta.v":{"$ne":0}}');

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