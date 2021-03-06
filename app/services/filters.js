
define(['app','moment','lodash'], function (app,moment,_) {
  //============================================================
  //
  //============================================================
  app.filter('characters', function () {
      return function (input, chars, breakOnWord) {
          if (isNaN(chars)) return input;
          if (chars <= 0) return '';
          if (input && input.length > chars) {
              input = input.substring(0, chars);

              if (!breakOnWord) {
                  var lastspace = input.lastIndexOf(' ');
                  //get last space
                  if (lastspace !== -1) {
                      input = input.substr(0, lastspace);
                  }
              }else{
                  while(input.charAt(input.length-1) === ' '){
                      input = input.substr(0, input.length -1);
                  }
              }
              return input + ' …';
          }
          return input;
      };
  });
  var decodeEntities = (function() {
  // this prevents any overhead from creating the object each time
  var element = document.createElement('div');

  function decodeHTMLEntities (str) {
    if(str && typeof str === 'string') {
      // strip script/html tags
      str = str.replace(/<script[^>]*>([\S\s]*?)<\/script>/gmi, '');
      str = str.replace(/<\/?\w(?:[^"'>]|"[^"]*"|'[^']*')*>/gmi, '');
      element.innerHTML = str;
      str = element.textContent;
      element.textContent = '';
    }

    return str;
  }

  return decodeHTMLEntities;
})();
  app.filter('htmlToPlaintext', function() {
      return function(text) {
        return  text ? decodeEntities(text) : '';
      };
    }
  );


//============================================================
//
//============================================================
app.filter('schemaName', [function() {

  return function( schema ) {
    //return mapSchema(schema);

          if(!schema)
            return schema;
          if(schema.toLowerCase()=='inde-orgs') return 'Organizations';
          if(schema.toLowerCase()=='inde-side-events') return 'Side Events';
          if(schema.toLowerCase()=='conferences') return 'conferences';
          if(schema.toLowerCase()=='venue') return 'Venues';
        };
  }]);
  //============================================================
  //
  //============================================================
  app.filter('schemaNameSingular', [function() {

    return function( schema ) {
      //return mapSchema(schema);

            if(!schema)
              return schema;
            if(schema.toLowerCase()=='inde-orgs') return 'Organization';
            if(schema.toLowerCase()=='inde-side-events') return 'Side Event';
            if(schema.toLowerCase()=='conferences') return 'Confrence';
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
            if(schema.toLowerCase()=='conferences') return 'md';
            if(schema.toLowerCase()=='venue') return 'md';
          };
    }]);



    //============================================================
    //
    //============================================================
    app.filter('futureConferences', [function() {

              return function( conf, existingConf) {

                if(!conf ) return false;


                return _.filter(conf,function(c){
                  if(c._id === existingConf) return true;
                  return (moment(c.EndDate).format('X')  > moment.utc().format('X'));
                });
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
              if(schema.toLowerCase()=='conferences') return '&#xE407;';
              if(schema.toLowerCase()=='venue') return '&#xE84F;';
            };
      }]);

      app.filter('rawHtml', ['$sce', function($sce){
        return function(val) {
          return $sce.trustAsHtml(val);
        };
      }]);
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
});