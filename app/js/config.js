"use strict";

/**
 * Config module which defines Firebase URL.
 * @module myApp/config
 */
var app = angular.module("myApp.config", []);

// your Firebase URL goes here
var config = {
    apiKey: "AIzaSyATrephRZpug-hcuwhELSx5p4ZGj0xPfdA",
    authDomain: "elo-rating.firebaseapp.com",
    databaseURL: "https://elo-rating.firebaseio.com",
    storageBucket: "elo-rating.appspot.com",
    messagingSenderId: "332514913142"
};
firebase.initializeApp(config);

// double-check whether the app has been configured
//if (config.authDomain === "https://elo-rating.firebaseio.com") {
//    angular.element(document.body).html("<h1>Please configure app/js/config.js before running!</h1>");
//}