define(['app','lodash','linqjs'], function (app,_,Enumerable) {

  app.factory('Enumerable', [function() {

  	return Enumerable;
  }]);
app.factory('Thesaurus', ["Enumerable", function() {
	return {
		buildTree : function(terms) {
			var oTerms    = [];
			var oTermsMap = {};

			Enumerable.From(terms).ForEach(function(value) {
				var oTerm = {
					identifier : value.identifier,
					name       : value.name
				};

				oTerms.push(oTerm);
				oTermsMap[oTerm.identifier] = oTerm;
			});

			for (var i = 0; i < oTerms.length; ++i) {
				var oRefTerm = terms [i];
				var oBroader = oTerms[i];

				if (oRefTerm.narrowerTerms && oRefTerm.narrowerTerms.length > 0) {
					_.each(oRefTerm.narrowerTerms, function(identifier) {
						var oNarrower = oTermsMap[identifier];

						if (oNarrower) {
							oBroader.narrowerTerms = oBroader.narrowerTerms || [];
							oNarrower.broaderTerms = oNarrower.broaderTerms || [];

							oBroader.narrowerTerms.push(oNarrower);
							oNarrower.broaderTerms.push(oBroader);
						}
					}); //jshint ignore:line
				}
			}

			return Enumerable.From(oTerms).Where("o=>!o.broaderTerms").ToArray();
		}
	};
}]);
});