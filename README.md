
# Elo Rating System

* An implementation of the Elo rating system in JS.

## Demo

* https://elo-rating.firebaseapp.com/

## Formulas

R'a = Ra + K(Sa - Ea)

R'b = Rb + K(Sb - Eb)

* R'a/R'b - New ratings of player A and player b
* Ra/Rb - Old ratings of player A and player b
* K - "K factor" set it as 32 for now
* Sa/Sb = Actual score
* Ea/Eb = Expected score
    - Ea = 1/(1 + 10 ^ ((Rb-Ra) / 400) )
    - Eb = 1/(1 + 10 ^ ((Ra-Rb) / 400) ) 

## Dependencies

* [AngularFire 2.0.2](https://github.com/firebase/angularfire)
* [Google AngularJS 1.5.8](https://angularjs.org/)
* [Google Firebase 3.4.0](https://firebase.google.com)
* [Bootstrap 3.3.7](http://getbootstrap.com/)
* [JQuery 3.1.0](https://jquery.com/)

## Configuration

* Please configure Firebase URL in app/js/config.js before running.

```javascript
// your Firebase URL goes here
var config = {
    apiKey: "AIzaSyATrephRZpug-hcuwhELSx5p4ZGj0xPfdA",
    authDomain: "elo-rating.firebaseapp.com",
    databaseURL: "https://elo-rating.firebaseio.com",
    storageBucket: "elo-rating.appspot.com",
    messagingSenderId: "332514913142"
};
```

* Set up Email/Password authentication in Firebase.

    - Log in to [Firebase console](https://firebase.google.com/console/),  open the **Auth** section
    - On the **Sign in method** tab, enable the **Email/password** sign-in method and click **Save**.
    - Add email and password to **Users** tab

* Replace line 80 & 81 in app/js/controller.js with your own credentials you just set up.

```javascript
$scope.email = "admin@mydomain.com";
$scope.password = "password";
```

## Contributing

1. Fork it ( https://github.com/cdeng/elorating/fork )
2. Create your feature branch (`git checkout -b my-new-feature`)
3. Commit your changes (`git commit -am 'Add some feature'`)
4. Push to the branch (`git push origin my-new-feature`)
5. Create a new Pull Request

## License

Code released under [the MIT license](https://github.com/twbs/bootstrap/blob/master/LICENSE).
