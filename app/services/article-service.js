define(['app', 'angular-cache'], function (app) {

    app.factory("articleService", ['$http', 'CacheFactory', function ($http, CacheFactory) {
            var httpCache = CacheFactory.get('articlesHttpCache');
            if (!httpCache) {
                httpCache = CacheFactory.createCache('articlesHttpCache', {
                    deleteOnExpire: 'aggressive',
                    recycleFreq   : 10000,
                    maxAge        : 5 * 60 * 1000,
                    storageMode   : 'localStorage',
                    storagePrefix : 'httpCache_'
                });
            }
            
            function query(qs){
                
                return $http.get('/api/v2017/articles', { params: qs, cache:httpCache})
                        .then(function(data){
                            return data.data;
                        });
                
            }
            function get(articleId){
                
                return $http.get('/api/v2017/articles/' + encodeURIComponent(articleId), {cache:httpCache})
                        .then(function(data){
                            return data.data;
                        });                
            }

            return {
                get    : get,
                query  : query
            }

    }]);

});
