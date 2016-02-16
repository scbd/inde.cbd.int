define(['app', 'lodash', './edit.js',  '/app/js/common.js'], function(app, _) {

    app.controller("editAuthority", ["$scope", "$http", "$filter", "Thesaurus", "$q", "$controller", "Enumerable", "$location", "IStorage", "commonjs",
     function($scope, $http, $filter, Thesaurus, $q, $controller, Enumerable, $location, storage, commonjs) {
        $controller('editController', {
            $scope: $scope
        });

        $scope.path = $location.path();
        //$scope.documentUID = "NEW";


        _.extend($scope.options, {
            organizationTypes: function() {
                return $http.get("/api/v2013/thesaurus/domains/Organization%20Types/terms", {
                    cache: true
                }).then(function(o) {
                    return o.data;
                });
            },
            cbdSubjects: function() {
                return $http.get("/api/v2013/thesaurus/domains/CBD-SUBJECTS/terms", {
                    cache: true
                }).then(function(o) {
                    return o.data;
                });
            },
            jurisdictions: function() {
                return $q.all([
                    $http.get("/api/v2013/thesaurus/domains/D7BD5BDE-A6B9-4261-B788-16839CCC4F7E/terms", {
                        cache: true
                    }),
                    $http.get("/api/v2013/thesaurus/terms/5B6177DD-5E5E-434E-8CB7-D63D67D5EBED", {
                        cache: true
                    })
                ]).then(function(o) {
                    var jurisdictions = o[0].data;
                    jurisdictions.push(o[1].data);
                    return jurisdictions;
                });
            },
            absGeneticResourceTypes: function() {
                return $http.get("/api/v2013/thesaurus/domains/20945FA8-C24C-4AF6-B3D9-367592AFDF48/terms", {
                    cache: true
                }).then(function(o) {
                    return o.data;
                });
            },
            absGeneticResourceAreas: function() {
                return $http.get("/api/v2013/thesaurus/domains/545CD54C-CFF3-41E8-A003-FDD278426A3A/terms", {
                    cache: true
                }).then(function(o) {
                    return o.data;
                });
            },
            cpbFunctions: function() {
                return $http.get("/api/v2013/thesaurus/domains/Subject Areas/terms", {
                    cache: true
                }).then(function(o) {
                    return o.data;
                });
            },
            cpbOrganismTypes: function() {
                return $http.get("/api/v2013/thesaurus/domains/TypeOfOrganisms/terms", {
                    cache: true
                }).then(function(o) {
                    return o.data;
                });
            },
            absFunctions: function() {
                return $http.get("/api/v2013/thesaurus/domains/8102E184-E282-47F7-A49F-4C219B0EE235/terms", {
                    cache: true
                }).then(function(o) {
                    return o.data;
                });
            },
            keywords: function() {
                return $http.get("/api/v2013/thesaurus/domains/1A22EAAB-9BBC-4543-890E-DEF913F59E98/terms", {
                    cache: true
                }).then(function(o) {
                    return Thesaurus.buildTree(o.data);
                });
            },
            measures: function() {
                return commonjs.loadSchemaDocumentsForDropdown('measure');
            },
        });
        $scope.showResponsibleforAllMsg = function() {

            //TODO: you need to gain access to the promise in order to do this correctly.a Otherwise the document won't be loaded when angular evaluated the ng-show.
            if (!$scope.document || (!$scope.document.absResponsibleForAll || !$scope.validationReport))
                return false;

            return Enumerable.from($scope.validationReport.errors).any(function(error) {
                return error.property == 'absResponsibleForAllNot';
            });
            //

            return true;
        };

        //   $scope.ac_jurisdictions = function() {
        //   };

        //==================================
        //
        //==================================
        $scope.getCleanDocument = function(document) {

            document = document || $scope.document;

            if (!document)
                return undefined;

            //document = angular.fromJson(angular.toJson(document));

            if (!document.consentGranted) {
                document.consentInformation = undefined;
                document.consentDocuments = undefined;
            }

            if (!document.mutuallyAgreedTermsEstablished) {
                document.mutuallyAgreedTermsInformation = undefined;
                document.mutuallyAgreedTermsDocuments = undefined;
            }

            if (document.gisFiles && document.gisFiles.length === 0) {
                document.gisFiles = undefined;
            }

            if (document.amendedPermits && document.amendedPermits.length === 0) {
                document.amendedPermits = undefined;
            }

            if (!document.amendedPermits) {
                document.consentedAmendment = undefined;
                document.amendmentsDescription = undefined;
            }
            if (document.providerConfidential) {
                document.providers = undefined;
            }
            if (document.informedConsentConfidential) {
                document.informedConsents = undefined;
            }
            if (document.geneticResourcesConfidential) {
                document.geneticResources = undefined;
                document.specimen = undefined;
                document.taxonomy = undefined;
                document.gisFiles = undefined;
                document.gisMapCenter = undefined;
            }
            if (document.absResponsibleForAll) {
                document.responsibilities = undefined;
                document.absJurisdiction = undefined;
                document.absJurisdictionName = undefined;
                document.absGeneticResourceTypes = undefined;
            }
            else{
                if(!$scope.showJurisdictionName())
                    document.absJurisdictionName = undefined;
            }

            if (/^\s*$/g.test(document.notes))
                document.notes = undefined;

            return document;
        };
        $scope.setDocument({
            libraries: [{
                identifier: "cbdLibrary:abs-ch"
            }]
        });


    }]);
});
