define(['text!./ouical.html', 'app','moment','ouical'], function(template, app,moment) {
    'use strict';
    app.directive('ouical', [function() {
        return {
            restrict: 'E',
            template: template,
            scope: {
                res:'=',
                rooms:'=',
                room:'='
            },

          link: function($scope, $elem) {
              var durationMinutes =moment($scope.res.end).diff($scope.res.start,'minutes')+1;
              var title = $scope.res.title;
              var description =$scope.res.description;
              if($scope.res.sideEvent){
                title = 'Side-event '+$scope.res.sideEvent.id;
                 description =$scope.res.title;
              } else if($scope.res.id){
                 title = 'Side-event '+$scope.res.id;
                 description =$scope.res.title;
              }
              if(!_.isEmpty($scope.rooms)){
                  var room = _.find($scope.rooms,{'_id':$scope.res.location.room});
                  var location = room.title+', '+room.location;
              }else {
                var location = $scope.room.title+', '+$scope.room.location;
              }
              var myCalendar = createCalendar({
                    options: {
                      class: 'my-class',
                      id: 'my-id'
                    },
                    data: {
                      // Event title
                      title: title,
                      // Event start date
                      start: new Date($scope.res.start),
                      // Event duration (IN MINUTES)
                      duration: durationMinutes,
                      // You can also choose to set an end time
                      // If an end time is set, this will take precedence over duration
                      end: new Date($scope.res.end),
                      // Event Address
                      address: location,
                      // Event Description
                      description: description
                    }
                    });

                    $elem.find('#place-where-I-want-this-calendar').append(myCalendar);
                    //$elem.find('#place-where-I-want-this-calendar').appendChild(myCalendar);
            }
    };}]);
}); // define