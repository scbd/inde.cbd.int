define(['app', 'lodash','jquery',
  'css!./index', '../services/mongo-storage'], function(app,_,$) {

    app.controller("home", ['$scope', '$http','$filter','$route','mongoStorage','$location','$element','$timeout','$window', //"$http", "$filter", "Thesaurus",
      function($scope,  $http,$filter,$route,mongoStorage,$location,$element,$timeout,$window) { //, $http, $filter, Thesaurus



          $scope.loading=false;
          $scope.schema="inde-orgs";
          $scope.createURL='/manage/events/0';
          $scope.editURL='/manage/events/';



          $scope.sortReverse=0;
          $scope.listView=0;
          $scope.showArchived=0;

          $scope.statusFacits={};
          $scope.statusFacits.all=0
          $scope.statusFacitsArcView={};
          $scope.statusFacitsArcView.all=0;
          $scope.selectedChip;
          var statuses=['published','request','canceled','rejected'];
          var statusesArchived=['deleted','archived'];
          $scope.docs=[];


          //=======================================================================
          //
          //=======================================================================
          function init(){
                  $scope.confrences={};
                  $http.get('https://api.cbd.int/api/v2015/confrences?f={"document":1}').then(function(conf){
                        $scope.confrences=conf.data;
                        _.each($scope.confrences,function(c){
                                $http.get('https://api.cbd.int/api/v2015/venues?q={"_id":{"$oid":"'+c.document.venue+'"}}&f={"document":1}').then(function(v){
                                      c.document.venueObj=v.data[0].document;
                                });

                                $http.get('https://api.cbd.int/api/v2015/inde-side-events?q={"document.confrence":"'+c._id+'"}&f={"document":1}').then(function(res){
                                      c.document.events=res.data;
console.log($scope.confrences);
                                });
                        });


                  });
                  //$scope.loadList ();
                  mongoStorage.getStatusFacits($scope.schema,$scope.statusFacits,statuses);
                  //mongoStorage.getStatusFacits($scope.schema,$scope.statusFacitsArcView,statusesArchived);
          }//init

          $scope.statusFilter = function (doc) {
            if (doc.document.meta.status === $scope.selectedChip)
            return doc;
            else if($scope.selectedChip==='all' || $scope.selectedChip==='')
            return doc;

          };

          $scope.customSearch = function (doc) {

            if(!$scope.search || $scope.search==' ' || $scope.search.length<=2) return true;
            var temp = JSON.stringify(doc);
           return (temp.toLowerCase().indexOf($scope.search.toLowerCase())>=0);

          };
//           $scope.customSearch = function (doc) {
// console.log('sssss');
//             if(!$scope.search || $scope.search==' ' || $scope.search.length<=2) return true;
//             var temp = JSON.stringify(doc);
//            return (temp.toLowerCase().indexOf($scope.search.toLowerCase())>=0);
//
//           };
          //=======================================================================
          //
          //=======================================================================
          $scope.approveDoc = function (docObj){
            console.log('sssss');
            mongoStorage.approveDoc($scope.schema,docObj,docObj._id).then(function(){
              mongoStorage.getStatusFacits($scope.schema,$scope.statusFacits,statuses);
              mongoStorage.getStatusFacits($scope.schema,$scope.statusFacitsArcView,statusesArchived);
              //$scope.loadList ();
            });
          };// archiveOrg
          //=======================================================================
          //
          //=======================================================================
          $scope.cancelDoc = function (docObj){
            mongoStorage.cancelDoc($scope.schema,docObj,docObj._id).then(function(){
              mongoStorage.getStatusFacits($scope.schema,$scope.statusFacits,statuses);
              mongoStorage.getStatusFacits($scope.schema,$scope.statusFacitsArcView,statusesArchived);
              //$scope.loadList ();
            });
          };// archiveOrg
          //=======================================================================
          //
          //=======================================================================
          $scope.rejectDoc = function (docObj){
            mongoStorage.rejectDoc($scope.schema,docObj,docObj._id).then(function(){
              mongoStorage.getStatusFacits($scope.schema,$scope.statusFacits,statuses);
              mongoStorage.getStatusFacits($scope.schema,$scope.statusFacitsArcView,statusesArchived);
              //$scope.loadList ();
            });
          };// archiveOrg
          //=======================================================================
          //
          //=======================================================================
          $scope.archiveList = function (){
            mongoStorage.loadArchives($scope.schema).then(function(response){
              $scope.docs=response.data;
            });
          };// archiveOrg

          //=======================================================================
          //
          //=======================================================================
          $scope.selectChip= function (chip){
            $element.find('.chip').removeClass('chip-active');
            $element.find('#chip-'+chip).addClass('chip-active');
            if(chip==='all')
              $scope.selectedChip='';
            else
              $scope.selectedChip=chip;
          };// archiveOrg

          //=======================================================================
          //
          //=======================================================================
          $scope.searchToggle= function (id){
            var serEl =$element.find('#'+id);
            serEl.toggleClass('search-expanded');
            serEl.focus();
            $scope.sOpen=!$scope.sOpen;


          };// archiveOrg
          // //=======================================================================
          // //
          // //=======================================================================
          // $scope.loadList = function (){
          //   mongoStorage.loadDocs('inde-side-events',['published']).then(function(response){
          //      $scope.docs=response.data;
          //    });
          // };// archiveOrg

          //=======================================================================
          //
          //=======================================================================
          $scope.toggleListView = function (docObj){

            if($scope.listView===0)
                $scope.listView=1;
            else if($scope.listView===1)
                $scope.listView=2;
            else
              $scope.listView=0;
          };//toggleListView

          //=======================================================================
          //
          //=======================================================================
          $scope.toggleArchived = function (docObj){

            if(!$scope.showArchived)
                $scope.archiveList();
            else
                $scope.loadList();
            $scope.showArchived=!$scope.showArchived;
          };// archiveOrg

          //=======================================================================
          //
          //=======================================================================
          $scope.archiveDoc = function (docObj){
              mongoStorage.archiveDoc($scope.schema,docObj,docObj._id).then(function(){
                    _.remove($scope.docs,function(obj){return obj._id===docObj._id;});
              });

          };// archiveOrg

          //=======================================================================
          //
          //=======================================================================
          $scope.deleteDoc = function (docObj){
              mongoStorage.deleteDoc($scope.schema,docObj,docObj._id).then(function(){
                    _.remove($scope.docs,function(obj){return obj._id===docObj._id;});
              });

          };// archiveOrg

          //=======================================================================
          //
          //=======================================================================
          $scope.unArchiveDoc = function (docObj){
              mongoStorage.unArchiveDoc($scope.schema,docObj,docObj._id).then(function(){
                    _.remove($scope.docs,function(obj){return obj._id===docObj._id;});
              });
          };// archiveOrg

          //=======================================================================
          //
          //=======================================================================
          $scope.goTo = function (url){
            $location.url(url);
          }// archiveOrg

          //=======================================================================
          //
          //=======================================================================
          $scope.edit = function (id){
            $location.url($scope.editURL+id);
          }// archiveOrg
          init();


          //=======================================================================
          //
          //=======================================================================
          $.fn.parallax = function () {
            var window_width = $(window).width();

            // Parallax Scripts
            return this.each(function(i) {
              var $this = $(this);
              $this.addClass('parallax');

              function updateParallax(initial) {

                var container_height;
                if (window_width < 601) {
                  container_height = ($this.height() > 0) ? $this.height() : $this.children("img").height();
                }
                else {
                  container_height = ($this.height() > 0) ? $this.height() : 500;
                }
                var $img = $this.children("img").first();
                var img_height = $img.height();
                var parallax_dist = img_height - container_height;
                var bottom = $this.offset().top + container_height;
                var top = $this.offset().top;
                var scrollTop = $(window).scrollTop();
                var windowHeight = window.innerHeight;
                var windowBottom = scrollTop + windowHeight;
                var percentScrolled = (windowBottom - top) / (container_height + windowHeight);
                var parallax = Math.round((parallax_dist * percentScrolled));
                //var scrim = $element.find('.scrim');
                if (initial) {
                  $img.css('display', 'block');
                  $img.css('transform', "translate3D(-50%," + parallax + "px, 0)");
                }
                if ((bottom > scrollTop) && (top < (scrollTop + windowHeight))) {
                  $img.css('transform', "translate3D(-50%," + parallax + "px, 0)");
                  // scrim.toggle('scrim');
                  // scrim.toggle('scrim');
                }

              }

              // Wait for image load
              $this.children("img").one("load", function() {
                updateParallax(true);
              }).each(function() {
                if(this.complete) $(this).load();
              });



              $(window).scroll(function() {

                window_width = $(window).width();
                updateParallax(false);
              });

              $(window).resize(function() {
                window_width = $(window).width();
                updateParallax(false);
              });
            });

          };


// $scope.init=$timeout(function(){
// $element.find('.parallax').parallax();
// });
var pEl=$element.find('.parallax');

var kill = setInterval(function(){
    pEl=$element.find('.parallax');

    if(pEl.length!==0){
       pEl.parallax();
       clearInterval(kill);
    }

}, 600);
// setTimeout(function(){
// $element.find('.parallax').parallax();
//
// }, 500);

          // $(document).ready(function(){
          //   console.log($('.parallax'));
          //   $('.parallax').parallax();
          // });

      }]);
});