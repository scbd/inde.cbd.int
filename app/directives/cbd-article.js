define(['app', 'text!./cbd-article.html','lodash', 'require', 'services/article-service'], function(app, template, _, require) {
	 'use strict';
	
	require(['css!https://www.cbd.int/management/app/dist/ckeditor5/style.css']);

	app.directive('cbdArticle', ['$sce', '$q', 'articleService', 'authentication', '$location',  function ($sce, $q, articleService, authentication, $location)
	{
		return {
			restrict: 'E',
			template : template,
			replace: true,
			scope: {
				query : '=query',
				onLoad: '&onLoad'
			},
			link: function ($scope, $element, $attr)
			{
				$scope.hideCoverImage = $attr.hideCoverImage||false;
				$scope.returnUrl	  = $location.absUrl();

				$scope.trustedHtml = function (plainText) {
					return $sce.trustAsHtml(plainText);
				}
				
				function loadArticle(){
					
					$q.when(articleService.query({ "ag" : JSON.stringify($scope.query) }))
					.then(function(article){
						if(article.length ==0 )
							$scope.article = {
								content : { en : 'No information is available for this link'}
							}
						else
							$scope.article = article[0];

						if(($scope.article.coverImage||{}).url)
							$scope.article.coverImage.url_1200  = $scope.article.coverImage.url.replace(/attachments\.cbd\.int\//, '$&1200x600/')
						
						$scope.onLoad({article: article[0]});
						
						$q.when(authentication.getUser())
						.then(function(user){
							if(user)
								$scope.showEdit = authentication.isInRole(user, ['oasisArticleEditor', 'Administrator']);
						})
					});
				}
				
				// $scope.$watch('query', function(newVal, oldVal){
				// 	if(newVal){
						loadArticle();
				// 	}
				// })
			}
		};
	}]);
});

