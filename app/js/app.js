"use strict";

/**
 * App level module which depends on filters, services and so on.
 * @module myApp
 */
var app = angular.module("myApp", [
    "firebase", "ui.bootstrap", "myApp.config", "myApp.filters", "myApp.services",
    "myApp.directives", "myApp.controllers"
]);

// configure views
app.config(["$routeProvider",
    function ($routeProvider) {
        
        $routeProvider.when("/intro", {
            templateUrl: "partials/intro.html",
            controller: "introCtrl"
        });

        $routeProvider.when("/rating", {
            templateUrl: "partials/rating.html",
            controller: "ratingCtrl"
        });

        $routeProvider.when("/login", {
            templateUrl: "partials/login.html",
            controller: "loginCtrl"
        });

        $routeProvider.when("/admin", {
            templateUrl: "partials/admin.html",
            controller: "adminCtrl",
            resolve: {
                // controller will not be loaded until $requireAuth resolves
                "currentAuth": ["Auth", function (Auth) {
                        // $requireAuth returns a promise so the resolve waits for it to complete
                        return Auth.$requireSignIn();
                    }]
            }
        });

        $routeProvider.otherwise({redirectTo: "/intro"});

    }
]);

// redirect the user back to the intro page if auth error is catched
app.run(["$rootScope", "$location", "Auth",
    function ($rootScope, $location, Auth) {

        // any time auth status updates, add auth data to rootScope
        Auth.$onAuthStateChanged(function (authData) {
            $rootScope.authData = authData;
        });

        $rootScope.logout = function () {
            Auth.$signOut();
            $location.path("/intro");
        };

        // show nav menu in highlight when it's active
        $rootScope.isActive = function (viewLocation) {
            return viewLocation === $location.path();
        };

        $rootScope.$on("$routeChangeError", function (event, next, previous, error) {
            if (error === "AUTH_REQUIRED") {
                $location.path("/intro");
            }
        });
    }
]);