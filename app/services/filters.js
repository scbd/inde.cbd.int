
define(['app'], function (app) {

//============================================================
//
//============================================================
app.filter('schemaName', [function() {

  return function( schema ) {
    //return mapSchema(schema);

          if(!schema)
            return schema;
          if(schema.toLowerCase()=='inde-orgs') return 'Organization';
          if(schema.toLowerCase()=='inde-side-events') return 'Side Events';
          if(schema.toLowerCase()=='confrences') return 'Confrences';
          if(schema.toLowerCase()=='venue') return 'Venue';
        };
  }]);

  //============================================================
  //
  //============================================================
  app.filter('schemaIconType', [function() {

    return function( schema ) {

            if(!schema)
              return schema;
            if(schema.toLowerCase()=='inde-orgs') return 'md';
            if(schema.toLowerCase()=='inde-side-events') return 'md';
            if(schema.toLowerCase()=='confrences') return 'md';
            if(schema.toLowerCase()=='venue') return 'md';
          };
    }]);
    
    //============================================================
    //
    //============================================================
    app.filter('schemaIconName', [function() {

      return function( schema ) {
              if(!schema)
                return schema;

              if(schema.toLowerCase()=='inde-orgs') return '&#xE0AF;';
              if(schema.toLowerCase()=='inde-side-events') return '&#xE878;';
              if(schema.toLowerCase()=='confrences') return '&#xE407;';
              if(schema.toLowerCase()=='venue') return '&#xE84F;';
            };
      }]);



});