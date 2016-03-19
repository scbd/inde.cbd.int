define(['app','lodash'],function(app,_) {
'use strict';
  app.factory('history', [
      '$location','$timeout','$q','$rootScope',

      function ($location,$timeout,$q,$rootScope) {

        var history=[];

        $rootScope.$on('$locationChangeSuccess', function(event, url, oldUrl, state, oldState){
            var parser = document.createElement('a'),
            parser2 = document.createElement('a');
            parser.href = oldUrl;
            parser2.href = url;
            history.push({'from':parser.pathname,'to':parser2.pathname});
        });


        //============================================================
        //
        //============================================================
        function getHistory() {
              return history;
        }

        //============================================================
        //
        //============================================================
        function goBack() {
          $location.url(_.last(history).from);
        }




          return  {
            getHistory:getHistory,
            goBack: goBack,
          };

      }]);

});