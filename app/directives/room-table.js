define(['app','text!./room-table.html', 'lodash',    'directives/sorter',      ], function(app,template,_) {
    'use strict';

    app.directive('roomTable', ['$http','$q',function($http,$q) {
        return {
            restrict: 'E',
            template: template,
            replace: false,
            scope: {
              confObj:'=confObj'
            },
            require: 'roomTable',

            link: function($scope, $element, $attr, $selfCtrl) {

                $scope.$watch('confObj',function(){
                    if($scope.confObj)
                      $selfCtrl.loadRooms().then($selfCtrl.loadRoomTypes);
                });

            }, //link

            controller: ["$scope", function($scope) {
                $scope.direction=true;
                $scope.sort={capacity:$scope.direction};
                //==============================
                //
                //==============================
                function loadRooms() {
                    return $http.get("/api/v2016/conferences/"+$scope.confObj._id+"/rooms", {
                        cache: true
                    }).then(function(res){
                      res.data.forEach(function(room){
                        room.capacity= parseFloat(room.capacity);
                        room.atTable= parseFloat(room.atTable);
                      });
                      $scope.rooms = res.data;
                    });

                }
                this.loadRooms=loadRooms;

                //============================================================
                //
                //============================================================
                function loadRoomTypes() {

                    var params = {
                        q: {
                            'schema': 'venue-rooms'
                        }
                    };

                    if(!$scope.roomTypes)
                        return $http.get('/api/v2016/types', {
                            'params': params
                        }).then(function(responce) {
                            $scope.roomTypes = [];
                            $scope.roomTypes=responce.data;
                            return $scope.roomTypes;
                        });
                    else return $q.resolve($scope.roomTypes);
                } //loadRoomTypes
                this.loadRoomTypes=loadRoomTypes;

                //============================================================
                //
                //============================================================
                function roomTypeTitle(id) {

                    if(!id || !$scope.roomTypes) return;

                    var room = _.find($scope.roomTypes,{'_id':id});

                    if(room)
                      return room.title;
                    else
                      return;

                } //roomTypeTitle
                $scope.roomTypeTitle=roomTypeTitle;

                //============================================================
                //
                //============================================================
                function getSort() {

                    return Object.keys($scope.sort)[0];

                } //getSort
                $scope.getSort=getSort;
            }],
        }; // return
    }]); //directive

}); // room-table