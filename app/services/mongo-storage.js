define(['app','lodash','libs/js-sha256/build/sha256.min','scbd-angularjs-services/locale'], function (app,_) {

app.factory("mongoStorage", ['$http','authentication','$q','locale','$location', function($http,authentication,$q,locale,$location) {

        var user;
        authentication.getUser().then(function(u){
          user=u;
        });
        var clientOrg = 0;



        //============================================================
        //
        //============================================================
        function save (schema,document,_id){

               var prevDoc    = _.cloneDeep(document.initialState) || {};
               var currentDoc = _.cloneDeep(document);
               var url        = '/api/v2015/'+schema;
               var params     = {};
               var data       = {};

// console.log('saving doc',prevDoc );
// console.log('saving doc',currentDoc);


                // update document
                if(_id){
                    if(_.isEmpty(prevDoc)) throw "Error: no previous state of document detected.  Usually a result of saving a document then not reloading the values";
                    params.id = _id;
                    delete(currentDoc.initialState);
                    touch(currentDoc);
                    url=url+'/'+_id;
                    data.document=currentDoc;
                    data.clientOrg=clientOrg;
                    data.$set  = {"document":currentDoc};
                    data.$push = {"history":prevDoc};

                    return $http.patch(url,data,params);


                } //update
                else{
                  touch(currentDoc);
                  data.document=currentDoc;
                  data.clientOrg=clientOrg;
//console.log('saving doc',currentDoc);
                  return $http.post(url,data,params).then(function(res){
                    currentDoc.initialState=currentDoc;
                    document=currentDoc;

                    //$location.path($location.path()+'/'+res.data.id,false);
                    return res.data;
                  });
                }  //create
        }

        //============================================================
        //
        //============================================================
        function deleteRecord (schema,id) {
          return;

        }

        //============================================================
        //
        //============================================================
        function loadDoc (schema,_id){
          //+'?q={"_id":{"$oid":"'+_id+'"},"clientOrganization":'+clientOrg+'}&f={"document":1}'
            if(!schema) throw "Error: failed to indicate schema mongoStorageService.loadDocument line:34";
            if(!_id) throw "Error: failed to indicate _id mongoStorageService.loadDocument line:35";
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



        //=======================================================================
        //
        //=======================================================================
        function createDoc (){
            return {
                  meta:{
                    locales:[_.clone(locale)],
                    v:0,
                    status: 'draft'
                  }
            };
        }

        //=======================================================================
        //
        //=======================================================================
        function touch(doc){
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
        } // touch

        return{
          loadDoc:loadDoc,
          createDoc:createDoc,
          save:save
        };
}]);

});