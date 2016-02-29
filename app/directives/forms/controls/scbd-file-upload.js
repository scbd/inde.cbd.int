define([ 'app', 'lodash','text!./scbd-file-upload.html'], function( app, _,template) { 'use strict';

app.directive('scbdFileUpload', ["$http","Upload","$timeout",'mongoStorage', function ($http,Upload,$timeout,mongoStorage) {
	return {
		restrict   : 'E',
		template   : template,
		//replace    : true,
		transclude : false,
		scope      : {binding:"=ngModal"},
		link : function($scope, $element, $attrs) {

					//==================================
					//
					//
					//==================================
					$scope.init = function() {

								$scope.$watch('files', function () {
						        $scope.upload($scope.files);
						    });
						    $scope.$watch('file', function () {
						        if ($scope.file != null) {
						            $scope.files = [$scope.file];
						        }
						    });
					}// init

					//==================================
					//
					//
					//==================================
			    $scope.upload = function(files) {

				        if (files && files.length)
										_.each(files,function(file){
												if (!file.$error)
														mongoStorage.uploadDocAtt($attrs.schema,$attrs.docId,file).then(function(){
										
																$scope.binding='https://s3.amazonaws.com/mongo.document.attachments'+'/'+$attrs.schema+'/'+$attrs.docId+'/'+file.name;
														});
												else
													throw file.$error;
										});
					}//upload

			$scope.init();
		}
	};
}]);
});
