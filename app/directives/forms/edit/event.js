define(['text!./event.html', 'app', 'lodash'], function(template, app, _) { 'use strict';

app.directive('editEvent', ["$http", function ($http) {
	return {
		restrict   : 'E',
		template   : template,
		replace    : true,
		transclude : false,
		scope      : {},
		link : function($scope) {

			$scope.status   = "";
			$scope.error    = null;
			$scope.document = null;
			$scope.tab      = 'general';
			$scope.review   = { locale : "en" };

			// Ensure user as signed in
			//navigation.securize();

			//==================================
			//
			//==================================
			$scope.init = function() {

				if ($scope.document)
					return;

				$scope.status = "loading";

				var promise = null;
				var schema  = "event";
//				var qs = $route.current.params;


				// if(qs.uid) { // Load
				// 	promise = editFormUtility.load(qs.uid, schema);
				// }
				// else { // Create
        //
				// 	promise = $q.when(guid()).then(function(identifier) {
				// 		return storage.drafts.security.canCreate(identifier, schema).then(function(isAllowed) {
        //
				// 			if (!isAllowed)
				// 				throw { data: { error: "Not allowed" }, status: "notAuthorized" };
        //
				// 			return identifier;
				// 		});
				// 	}).then(function(identifier) {
        //
				// 		return {
				// 			header: {
				// 				identifier: identifier,
				// 				schema   : schema,
				// 				languages: ["en"]
				// 			}
				// 		};
				// 	});
				// }

				// promise.then(function(doc) {
        //
				// 	if(!$scope.options) {
        //
				// 		$scope.options  = {
			  //           	aichiTargets	: $http.get("/api/v2013/index", { params: { q:"schema_s:aichiTarget", fl:"identifier_s,title_t,number_d",  sort:"number_d ASC", rows:999999 }}).then(function(o) { return _.map(o.data.response.docs, function(o) { return { identifier:o.identifier_s, title : o.number_d  +" - "+ o.title_t }; });}).then(null, $scope.onError),
				// 			subjects		: $http.get("/api/v2013/thesaurus/domains/CBD-SUBJECTS/terms",								{ cache: true }).then(function(o){ return Thesaurus.buildTree(o.data); }),
				// 			docLanguages	: $http.get("/api/v2013/thesaurus/domains/ISO639-2/terms",									{ cache: true }).then(function(o){ return $filter('orderBy')(o.data, 'name'); }),
				// 			scales			: $http.get("/api/v2013/thesaurus/domains/96FCD864-D388-4148-94DB-28B484047BA5/terms",      { cache: true }).then(function(o){ return o.data; }),
				// 			statuses		: $http.get("/api/v2013/thesaurus/domains/Capacity%20Building%20Project%20Status/terms",    { cache: true }).then(function(o){ return o.data; }),
				// 			regions			: $http.get("/api/v2013/thesaurus/domains/regions/terms",   								{ cache: true }).then(function(o){ return $filter('orderBy')(o.data, 'name'); }),
				// 	      	countries		: $http.get("/api/v2013/thesaurus/domains/countries/terms", 								{ cache: true }).then(function (o) { return $filter('orderBy')(o.data, 'title|lstring'); })
				// 		};
				// 	}
        //
				// 	return doc;
        //
				// }).then(function(doc) {
        //
				// 	$scope.status = "ready";
				// 	$scope.document = doc;
        //
				// }).catch(function(err) {
        //
				// 	$scope.onError(err.data, err.status);
				// 	throw err;
        //
				// });
			};


			// //==================================
			// //
			// //==================================
			// $scope.getCleanDocument = function(document) {
			// 	document = document || $scope.document;
      //
			// 	if (!document)
			// 		return;
      //
			// 	document = angular.fromJson(angular.toJson(document));
      //
			// 	if (/^\s*$/g.test(document.notes))
			// 		document.notes = undefined;
      //
			// 	return document;
			// };

			// //==================================
			// //
			// //==================================
			// $scope.validate = function() {
      //
			// 	$scope.validationReport = null;
      //
			// 	var oDocument = $scope.reviewDocument = $scope.getCleanDocument();
      //
			// 	return storage.documents.validate(oDocument).then(function(success) {
      //
			// 		$scope.validationReport = success.data;
			// 		return !!(success.data && success.data.errors && success.data.errors.length);
      //
			// 	}).catch(function(error) {
      //
			// 		$scope.onError(error.data);
			// 		return true;
      //
			// 	});
			// };

			//==================================
			//
			//==================================
			$scope.$watch('tab', function(tab) {
				if (tab == 'review')
					$scope.validate();
			});

			//==================================
			//
			//==================================
			$scope.onPreSaveDraft = function() {
			};

			//==================================
			//
			//==================================
			$scope.onPrePublish = function() {
				return $scope.validate().then(function(hasError) {
					if (hasError)
						$scope.tab = "review";
					return hasError;
				});
			};

			//==================================
			//
			//==================================
			$scope.onPostWorkflow = function() {
				$rootScope.$broadcast("onPostWorkflow", "Publishing request sent successfully.");
				gotoManager();
			};

			//==================================
			//
			//==================================
			$scope.onPostPublish = function() {
				$rootScope.$broadcast("onPostPublish", "Record is being published, please note the publishing process could take up to 1 minute before your record appears.");
				gotoManager();
			};

			//==================================
			//
			//==================================
			$scope.onPostSaveDraft = function() {
				$rootScope.$broadcast("onSaveDraft", "Draft record saved.");
			};

			//==================================
			//
			//==================================
			$scope.onPostClose = function() {
				$rootScope.$broadcast("onPostClose", "Record closed.");
				gotoManager();
			};
			//==================================
			//
			//==================================
			function gotoManager() {
				$location.url("/submit/caseStudy");
			}
			//==================================
			//
			//==================================
			$scope.onError = function(error, status)
			{
				$scope.status = "error";

				if (status == "notAuthorized") {
					$scope.status = "hidden";
					$scope.error  = "You are not authorized to modify this record";
				}
				else if (status == 404) {
					$scope.status = "hidden";
					$scope.error  = "Record not found.";
				}
				else if (status == "badSchema") {
					$scope.status = "hidden";
					$scope.error  = "Record type is invalid.";
				}
				else if (error.Message)
					$scope.error = error.Message;
				else
					$scope.error = error;
			};

			// //==================================
			// //
			// //==================================
			// $scope.loadRecords = function(identifier, schema) {
      //
			// 	if (identifier) { //lookup single record
      //
			// 		return storage.drafts.get(identifier, { info : "", cache:true }).then(function(r) {
			// 			return r.data;
			// 		}).catch(function(e) {
      //
			// 			if (!e || !e.status || e.status != 404)
			// 				throw e;
      //
			// 			return storage.documents.get(identifier, { info : "", cache:true }).then(function(r) {
			// 				return r.data;
			// 			});
			// 		});
			// 	}
      //
			// 	//Load all record of specified schema;
      //
			// 	var sQuery = "type eq '" + encodeURI(schema) + "'";
      //
			// 	var qDocs   = storage.documents.query(sQuery, null, { cache: true });
			// 	var qDrafts = storage.drafts   .query(sQuery, null, { cache: true });
      //
			// 	return $q.all([qDocs, qDrafts]).then(function(results) {
      //
			// 		var oDocs      = results[0].data.Items;
			// 		var oDrafts    = results[1].data.Items;
			// 		var oDraftUIDs = _.pluck(oDrafts, "identifier");
      //
			// 		oDocs = _.filter(oDocs, function(o) { return !_.contains(oDraftUIDs, o.identifier);});
      //
			// 		return _.union(oDocs, oDrafts);
			// 	});
			// };

			$scope.init();
		}
	};
}]);
});
