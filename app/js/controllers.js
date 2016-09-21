"use strict";

/**
 * Controllers module which defines controllers.
 * @module myApp/controllers
 */
var app = angular.module("myApp.controllers", []);

// Rating controller
app.controller("ratingCtrl", function ($scope, $firebaseObject, $firebaseArray) {

    var ref = firebase.database().ref();
    // download the data into local object
    var playerObj = $firebaseObject(ref.child("players"));
    $scope.results = $firebaseArray(ref.child("results"));
    
    $scope.playersArray = [];

    // Creates a three-way binding between scope and player obj in database
    playerObj.$bindTo($scope, "players").then(function () {
        // Covert player object to array in order to sort on rating page
        angular.forEach($scope.players, function (value, key) {
            if (angular.isObject(value)) {
                $scope.playersArray.push({name: key, stats: value});
            }
        });
    });

    // tab controller
    $scope.activeTab = "ranking";
    $scope.setActiveTab = function (tabToSet) {
        $scope.activeTab = tabToSet;
    };

}
);

// Login controller
app.controller("loginCtrl", function ($scope, $location, Auth) {

    // temporary email and password placeholder
    $scope.email = "admin@mydomain.com";
    $scope.password = "password";

    /**
     * Login into app and redirect to admin page
     */
    $scope.login = function () {

        $scope.authData = null;
        $scope.error = null;

        // change button to loading state
        var $btn = $("#loginButton").button("loading");

        // authentication using an email / password combination
        Auth.$signInWithEmailAndPassword(
                $scope.email,
                $scope.password
                ).then(function (authData) {
            // the data contains all auth info
            $scope.authData = authData;
            // redirect to result page after successful login
            $location.path("/admin");
            // reset button loading state
            $btn.button("reset");
        }).catch(function (error) {
            // catch and display error if login fails
            $scope.error = error;
            // reset button loading state
            $btn.button("reset");
        });

    };
}
);

// Admin controller
app.controller("adminCtrl", function ($scope, $firebaseArray, $firebaseObject) {

    var ref = firebase.database().ref();

    // Download data into local object
    var playerObj = $firebaseObject(ref.child("players"));
    $scope.results = $firebaseArray(ref.child("results"));

    $scope.playersArray = [];

    // Creates a three-way binding between scope and player obj in database
    playerObj.$bindTo($scope, "players").then(function () {
        // Covert player object to array in order to sort on rating page
        angular.forEach($scope.players, function (value, key) {
            if (angular.isObject(value)) {
                $scope.playersArray.push({name: key, stats: value});
            }
        });
    });

    // Set default value to variables
    $scope.p1Rating = 1000;
    $scope.p2Rating = 1000;
    $scope.ratingChange = 0;

    $scope.timestamp = new Date().getTime();

    $scope.gameData = {
        "p1Name": "",
        "p2Name": "",
        "result": 0.5
    };

    // Hide success information/alert
    $scope.addResultSuccessInfo = false;
    $scope.addPlayerSuccessInfo = false;

    // Open add game result modal dialog
    $scope.addGameResult = function () {
        $("#addGameResultDialog").modal("show");
    };

    /**
     * Get rating if player exists, otherwise get initial rating 1000
     * @param {String} name - Player name
     * @returns {Number} currentRating - Current rating
     */
    $scope.getCurrentRating = function (name) {
        if (name) {
            if ($scope.players && $scope.players[name]) {
                return $scope.players[name].rating;
            } else {
                return 1000;
            }
        }
    };

    /**
     * Get number of game played if player exists, otherwise get 0
     * @param {String} name - Player name
     * @returns {Number} numberOfGamePlayed - Number of game played
     */
    $scope.getNumberOfGamePlayed = function (name) {
        if ($scope.players && $scope.players[name]) {
            return $scope.players[name].gamePlayed;
        } else {
            return 0;
        }
    };

    /**
     * Get the rating change of players based on game result
     * Formulas:
     * R' = R + K(S - E)
     *  -R': New rating of Player 1 or Player 2
     *  -R: Current/old rating of Player 1 or Player 2
     *  -K: "K factor" K is set to 32 for now
     *  -S: Actual game score
     *  -E: Expected game score
     *      Ea = 1/(1 + 10^((Rb - Ra) / 400))
     *      Eb = 1/(1 + 10^((Ra - Rb) / 400))
     * @param {Number} p1Rating - Player 1 current rating
     * @param {Number} p2Rating - Player 2 current rating
     * @param {Number} result - Game result (1 for win, 0.5 for draw, 0 for loss)
     * @returns {Number} ratingChange - Rating change
     */
    $scope.getRatingChange = function (p1Rating, p2Rating, result) {
        var expectedScore = 1 / (1 + Math.pow(10, (p2Rating - p1Rating) / 400));
        return Math.round(32 * (result - expectedScore));
    };

    /**
     * Get new rating based on current rating and rating change
     * @param {Number} currentRating
     * @param {Number} ratingChange
     * @returns {Number} newRating
     */
    $scope.getNewRating = function (currentRating, ratingChange) {
        return currentRating + ratingChange;
    };

    // update ratings once $scope.gameData is changed
    $scope.$watch("gameData", function () {

        $scope.p1Rating = $scope.getCurrentRating($scope.gameData.p1Name);
        $scope.p2Rating = $scope.getCurrentRating($scope.gameData.p2Name);

        $scope.ratingChange = $scope.getRatingChange(
                $scope.p1Rating, $scope.p2Rating, $scope.gameData.result);

        $scope.p1NewRating = $scope.getNewRating($scope.p1Rating, $scope.ratingChange);
        $scope.p2NewRating = $scope.getNewRating($scope.p2Rating, -$scope.ratingChange);
    }, true);

    /**
     * Get game result object, ready for the push
     * @param {Object} gameData - $scope.gameData
     * @returns {Object} gameResultObj
     */
    $scope.getGameResultObj = function (gameData) {
        var gameResultObj = {};

        gameResultObj = {
            "timestamp": $scope.timestamp,
            "p1": {
                "name": gameData.p1Name,
                "result": gameData.result,
                "currentRating": $scope.p1Rating,
                "ratingChange": $scope.ratingChange,
                "newRating": $scope.p1NewRating
            },
            "p2": {
                "name": gameData.p2Name,
                "result": 1 - gameData.result,
                "currentRating": $scope.p2Rating,
                "ratingChange": -$scope.ratingChange,
                "newRating": $scope.p2NewRating
            }
        };

        return gameResultObj;
    };

    // Add player stats into database if player doesn't exist
    $scope.addPlayerStats = function (playerStats) {
        var playerStatsObj = {};
        var data = playerStats;
        var peakRating;
        var winDrawLoss = [];

        // Get new peak rating
        if (data.newRating > 1000) {
            peakRating = data.newRating;
        } else {
            peakRating = 1000;
        }

        // Get number of wins, draws and losses
        switch (data.result) {
            case 0:
                winDrawLoss = [0, 0, 1];
                break;
            case 0.5:
                winDrawLoss = [0, 1, 0];
                break;
            case 1:
                winDrawLoss = [1, 0, 0];
                break;
            default:
                break;
        }

        playerStatsObj = {
            "rating": data.newRating,
            "peakRating": peakRating,
            "gamePlayed": 1,
            "wins": winDrawLoss[0],
            "draws": winDrawLoss[1],
            "losses": winDrawLoss[2]
        };

        // Push data into Database
        $scope.players[data.name] = playerStatsObj;
    };

    // Update player stats in database if player already exists
    $scope.updatePlayerStats = function (playerStats) {
        var data = playerStats;
        var old = $scope.players[data.name];
        var newPlayerStats = {};
        var peakRating;
        var winDrawLoss = [];

        // Get new peak rating
        if (old.peakRating >= data.newRating) {
            peakRating = old.peakRating;
        } else {
            peakRating = data.newRating;
        }

        // Get number of wins, draws and losses
        switch (data.result) {
            case 0:
                winDrawLoss = [old.wins, old.draws, old.losses + 1];
                break;
            case 0.5:
                winDrawLoss = [old.wins, old.draws + 1, old.losses];
                break;
            case 1:
                winDrawLoss = [old.wins + 1, old.draws, old.losses];
                break;
            default:
                break;
        }

        newPlayerStats = {
            "rating": data.newRating,
            "peakRating": peakRating,
            "gamePlayed": old.gamePlayed + 1,
            "wins": winDrawLoss[0],
            "draws": winDrawLoss[1],
            "losses": winDrawLoss[2]
        };

        // Update data in Database
        $scope.players[data.name] = newPlayerStats;
    };

    // Push Player stats into database
    $scope.pushPlayerStats = function (playerStats) {

        // Check whether the player already exists
        if ($scope.players && $scope.players[playerStats.name]) {
            // Update player stats
            $scope.updatePlayerStats(playerStats);
        } else {
            // Add player stats
            $scope.addPlayerStats(playerStats);
        }
    };

    // Push game result into database
    $scope.pushGameResult = function (gameResultObj) {
        // Change button to loading state
        var $btn = $("#addButton").button("loading");

        // Push data to Firebase
        $scope.results.$add(gameResultObj).then(function () {
            // Dismiss add game result modal dialog
            $("#addGameResultDialog").modal("hide");
            // Reset button loading state
            $btn.button("reset");
            // Show success information/alert
            $scope.addResultSuccessInfo = true;
            // Reset gameData
            $scope.gameData = {
                "p1Name": "",
                "p2Name": "",
                "result": 0.5
            };
        });
    };

    // Save result into database
    $scope.saveResult = function () {

        var gameResultObj = $scope.getGameResultObj($scope.gameData);

        // Push player stats into database
        $scope.pushPlayerStats(gameResultObj.p1);
        $scope.pushPlayerStats(gameResultObj.p2);

        // Push game result into databse
        $scope.pushGameResult(gameResultObj);
    };

}
);