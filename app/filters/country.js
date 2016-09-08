define(['app','lodash','services/locale'], function(app,_) {
  var countries, inProgress;
  app.filter("country",['mongoStorage','locale', function(mongoStorage,locale) {
    inProgress = mongoStorage.getCountries().then(function(data){
      countries=data;
      inProgress = false;
    });
  	return function(text) {

  		if(!text)
  			return '';

          var country;
          if(_.isObject(text))
            country = _.find(countries,text);
          else
            country = _.find(countries,{identifier:text});

          if(!countries) throw 'Error no countries loaded';
          if(country)
              return country.name[locale];
          else
            return 'NO COUNTRY FOUND';
  	};
  }]);
});