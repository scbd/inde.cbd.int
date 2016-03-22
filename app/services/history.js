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

          if(history.length===1)
            $location.url('/manage');
          else
            $location.url(_.last(history).from);
        }

        //============================================================
        //
        //============================================================
        function getPrevPath() {

          if(_.last(history).from===$location.url())return false;
          else
            return _.last(history).from;
        }


          return  {
            getHistory:getHistory,
            goBack: goBack,
            getPrevPath:getPrevPath
          };

      }]);

});