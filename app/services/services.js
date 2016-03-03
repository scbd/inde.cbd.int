

define(['app'], function (app) {

    //============================================================
    //
    //============================================================
    app.factory('schemaIcon', [function() {

      return function( schema ) {
        //return mapSchema(schema);

              if(!schema)
                return schema;
              if(schema.toLowerCase()=='inde-orgs') return {type:'md', name:'&#xE5CD;'};
              if(schema.toLowerCase()=='inde-side-events') return {type:'md', name:'&#xE5CD;'};
              if(schema.toLowerCase()=='confrences') return {type:'md', name:'&#xE407;'};
              if(schema.toLowerCase()=='venue') return {type:'md', name:'&#xE84F;'};
            };
      }]);

});