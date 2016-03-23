define(['app', 'angular', 'lodash', 'jquery', 'text!./km-select.html'],
 function(app, angular, _, $, template) { 'use strict';
 app.factory("htmlUtility", function() {
 	return {
 		encode: function(srcText) {
 			return $('<div/>').text(srcText).html();
 		}
 	};
 });
 app.filter("truncate", function() {
	return function(text, maxSize, suffix) {

		if (!maxSize)
			return text;

		if (!suffix)
			suffix = "";

		if(!text)
			return "";

		if (text.length > maxSize)
			text = text.substr(0, maxSize) + suffix;

		return text;
	};
});
	app.directive('kmSelect', ["htmlUtility", function (html)
	{
		return {
			restrict: 'EAC',
			template: template,
			replace: true,
			transclude: false,
			require : "?ngModel",
			scope: {
				binding      : "=ngModel",
				itemsFn      : "&items",
				ngDisabledFn : "&ngDisabled",
				required     : "@",
				placeholder  : "@",
				bindingType  : "@",
				allowOther   : "@",
				minimumFn    : "&minimum",
				maximumFn    : "&maximum",
			},
			link: function ($scope, $element, $attrs, ngModelController)
			{
				$scope.identifier = null;
				$scope.rootItems  = null;
				$scope.attr       = $attrs;
				$scope.multiple   = $attrs.multiple   !== undefined && $attrs.multiple   !== null;
				$scope.watchItems = $attrs.watchItems !== undefined && $attrs.watchItems !== null;
				$scope.list       = $scope.multiple && !($attrs.list==="false")
				$scope.displayCount = ($scope.multiple && $scope.list) ? 0 : 3;
				$scope.electedItems = [];

				$scope.$watch('identifier', $scope.save);
				$scope.$watch('items',      $scope.load);

				$scope.$watch('binding', function(newBinding) {
					ngModelController.$setViewValue($scope.binding);
					if (newBinding)
						$scope.autoInit().then($scope.load);
				});

				if ($scope.watchItems)
					$scope.$watch($scope.itemsFn, function(items) {
						if (items)
							$scope.autoInit(true).then($scope.load);
					});

				$element.find('.dropdown-menu').click(function(event) {
					if ($scope.multiple && $scope.selectedItems.length!=0)// jshint ignore:line
						event.stopPropagation();
				});

				if ($scope.multiple){
					$element.find('.dropdown-toggle').popover({
						trigger: "hover",
						html : true,
						placement:"top",
						content: function() {
							var oNames = _.map($scope.getTitles(), function(o) {
								return html.encode(o);
							});

							if (!oNames || !oNames.length)
								return null;

							return "<ul><li style=\"width:500px;\">" + oNames.join("</li>\n<li>") + "</li></ul>";
						}
					}).on("show.bs.popover", function(){ $(this).data("bs.popover").tip().css("max-width", "400px"); });
				}
			},
			controller: ["$scope", "$q","$filter", "$timeout", function ($scope, $q, $filter, $timeout)
			{
				//==============================
				//
				//==============================
				function transform(data) {
					if (_.isArray(data)) {
						data = _.filter(data, _.isObject);
						data = _.map   (data, function(d) {
							return {
								identifier: d.identifier,
								title: d.title || d.name,
								children: transform(d.children || d.narrowerTerms),
								selected: false
							};
						});
					}

					return data;
				}

				//==============================
				//
				//==============================
				function flaten(subTree) {
					var oResult = [];

					_.each(subTree, function(o) {
						oResult.push(o);

						if (o.children)
							oResult = _.union(oResult, flaten(o.children));
					});

					return oResult;
				}

				//==============================
				//
				//==============================
				$scope.autoInit = function(forceReinit) {

					if (forceReinit){
						$scope.isInit = false;
						$scope.__loading = false;
					}

					var deferred = $q.defer();

					if ($scope.isInit) {
						$timeout(function() {
							if ($scope.allItems)
								deferred.resolve();
							else
								deferred.reject("Data not loaded");
						});
					}
					else {
						$scope.isInit = true;
						$scope.setError(null);
						$scope.__loading = true;

						$q.when($scope.itemsFn(),
							function(data) { // on success
								$scope.__loading = false;
								$scope.rootItems = transform(data); //clone values
								$scope.allItems  = flaten($scope.rootItems);

								deferred.resolve();
							}, function(error) { // on error
								$scope.__loading = false;
								$scope.setError(error);
								deferred.reject(error);
							});
					}

					return deferred.promise;
				};

				//==============================
				//
				//==============================
				$scope.getTitle = function(maxCount, truncate)
				{
					if ($scope.__loading)
						return "Loading...";

					if (maxCount === undefined || maxCount === null)
						maxCount = -1;

					var oNames = $scope.getTitles();

					if(truncate) {
						oNames = _.map(oNames, function(name) {
							return $filter('truncate')(name, 60, '...');
						});
					}

					if (oNames.length == 0)// jshint ignore:line
						return $scope.placeholder || "Nothing selected...";
					else if (maxCount<0 || oNames.length <= maxCount)
						return oNames.join(', ');

					return "" + oNames.length + " of "+$scope.allItems.length+" selected";
				};

				//==============================
				//
				//==============================
				$scope.getTitles = function()
				{
					return _.map($scope.selectedItems, function(o) {
						return $filter("lstring")(o.title || o.name, $scope.locale);
					});
				};

				//==============================
				//
				//==============================
				$scope.getMinimum = function()
				{
					var value = $scope.minimumFn();

					if (isNaN(value))
						value = 0;

					return Math.max(value, 0);
				};

				//==============================
				//
				//==============================
				$scope.getMaximum = function()
				{
					var value = $scope.maximumFn();

					if (isNaN(value))
						value = 2147483647;

					return Math.min(value, 2147483647);
				};

				//==============================
				// in tree order /deep first
				//==============================
				function updateSelectedItems() {
					$scope.selectedItems = _.where($scope.allItems||[], { selected : true });
				}

				//==============================
				//
				//==============================
				$scope.load = function()
				{
					if (!$scope.allItems) // Not initialized
						return;

					var oBinding = $scope.binding || [];

					if (!_.isArray(oBinding) && (_.isString(oBinding) || _.isObject(oBinding)))
						oBinding = [oBinding];

					if (!_.isArray(oBinding))
						throw "Value must be array";

					oBinding = _.map(oBinding, function(item) {
						return _.isString(item) ? { identifier: item } : item;
					});

					angular.forEach($scope.allItems, function(item) {
						item.selected = _.find(oBinding, function(o) { return o.identifier == item.identifier; })!==undefined;
					});

					updateSelectedItems();
				};

				//==============================
				//
				//==============================
				$scope.save = function()
				{
					updateSelectedItems();

					if (!$scope.allItems) // Not initialized
						return;


					var oBindings = _.map($scope.selectedItems, function(o) {
						return {
							identifier: o.identifier,
							customValue : o.customValue
						};
					});

					if ($scope.bindingType == "string" || $scope.bindingType == "string[]")
						oBindings = _.pluck(oBindings, 'identifier');

					if (!$scope.multiple)
						oBindings = _.first(oBindings);

					if ($.isEmptyObject(oBindings))
						oBindings = undefined;

					$scope.binding = oBindings;
				};

				//==============================
				//
				//==============================
				$scope.isRequired = function()
				{
					return $scope.required!=undefined;// jshint ignore:line
				};

				//==============================
				//
				//==============================
				$scope.setError = function(error) {
					if (!error) {
						$scope.error = null;
						return;
					}

					if (error.status == 404) $scope.error = "Items not found";
					else                     $scope.error = error.data || "unkown error";
				};

				//==============================
				//
				//==============================
				$scope.chooseOther = function() {
					alert("todo");
				};

				//==============================
				//
				//==============================
				$scope.clearSelection = function() {
					_.each($scope.allItems || [], function(item) {
						item.selected = false;
					});

					$scope.save();
				};

				//==============================
				//
				//==============================
				$scope.clearSelection = function() {
					_.each($scope.allItems || [], function(item) {
						item.selected = false;
					});

					$scope.save();
				};

				//==============================
				//
				//==============================
				$scope.itemEnabled = function(item) {

					if ( $scope.getMinimum() > 0 && $scope.selectedItems.length <= $scope.getMinimum())
						if (item == null || $scope.selectedItems.indexOf(item) >= 0)// jshint ignore:line
							return false;

					if ($scope.getMaximum() < $scope.allItems.length && $scope.selectedItems.length >= $scope.getMaximum())
						if (item != null && $scope.selectedItems.indexOf(item) < 0)// jshint ignore:line
							return false;
					return true;
				};

				//==============================
				//
				//==============================
				$scope.clicked = function(clickedItem) {

					if (!$scope.itemEnabled(clickedItem))
						return;

					if ($scope.multiple && clickedItem)
						clickedItem.selected = !clickedItem.selected;

					if (!$scope.multiple || !clickedItem) {
						_.each($scope.allItems||[], function(item) {
							item.selected = (item == clickedItem);
						});
					}

					$scope.save();
				};
			}]
		};
	}]);

});
