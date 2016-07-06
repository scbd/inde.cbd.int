define(['text!./link-list.html', 'app', ], function(template, app) {
    'use strict';

    app.directive('linkList', ['$http', '$sce', function($http, $sce) {
        return {
            restrict: 'E',
            template: template,
            replace: false,
            scope: {
                doc: '=document',
                documents: '=links',
                editIndex: '=index',
                save: '&save',
            },


            link: function($scope, $element, $attr) {

                if(!$attr.save)
                  $scope.viewOnly=true;

                if ($attr.name)
                    $scope.name = $attr.name;

                if ($attr.schema)
                    $scope.schema = $attr.schema;

                if ($attr.faClass)
                    $scope.faClass = $attr.faClass;

                if (!$scope.documents) $scope.documents = [];

                //  $scope.user=authentication.getUser();
            }, //link

            controller: ["$scope", function($scope) {

                //=======================================================================
                //
                //=======================================================================
                function saveLink() {

                    $scope.documents.push($scope.document);
                    $scope.save().catch(function(err) {
                        console.log(err);
                        $scope.error = err;
                        throw err;
                    });

                } // saveLink
                $scope.saveLink = saveLink;

                //=======================================================================
                //
                //=======================================================================
                function remove(index) {
                    if (confirm('Are you sure you want to delete ' + $scope.documents[index].title + ' from ' + $scope.name)) {
                        $scope.documents.splice(index, 1);
                        $scope.save();
                    }
                } // saveLink
                $scope.remove = remove;

                //=======================================================================
                //
                //=======================================================================
                function getFileName(url)
                {
                    if (url)
                    {
                        return url.substring(url.lastIndexOf("/") + 1, url.lastIndexOf("."));
                    }
                    return "";
                }
                $scope.getFileName=getFileName;


                //=======================================================================
                //
                //=======================================================================
                function edit(index) {
                    $scope.editIndex = index;

                } // saveLink
                $scope.edit = edit;

                //=======================================================================
                //
                //=======================================================================
                function isMovie(uri) {
                    if (!uri) return false;

                    var parser = document.createElement('a');
                    var fileExtension = uri.substring((uri.lastIndexOf('.') + 1));
                    parser.href = uri;

                    if (parser.hostname.toLowerCase() === 'www.youtube.com') return true;
                    if (fileExtension.toLowerCase() === 'mp4') return true;
                    if (fileExtension.toLowerCase() === 'ogg') return true;
                    if (fileExtension.toLowerCase() === 'webm') return true;
                    return false;
                } // saveLink
                $scope.isMovie = isMovie;
                //=======================================================================
                //
                //=======================================================================
                function isYoutube(uri) {
                    if (!uri) return false;

                    var parser = document.createElement('a');
                    parser.href = uri;

                    if (parser.hostname.toLowerCase() === 'www.youtube.com') return true;
                    return false;
                } // saveLink
                $scope.isYoutube = isYoutube;
                //=======================================================================
                //
                //=======================================================================
                function trustSrc(src) {
                    return $sce.trustAsResourceUrl(src);
                }
                $scope.trustSrc = trustSrc;
            }],
        }; // return
    }]); //app.directive('searchFilterCountries

    app.filter('capitalize', function() {
        return function(input) {
            return (!!input) ? input.charAt(0).toUpperCase() + input.substr(1).toLowerCase() : '';
        };
    });
    app.filter('explode', function() {
        return function(input) {
            return (!!input) ? input.replace(/,/g, ', ') : '';
        };
    });

}); // define