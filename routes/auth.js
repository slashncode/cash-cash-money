const express = require('express');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const validator = require('email-validator');
const crypto = require('crypto');
const bdb = require('../db');

const router = express.Router();

/**
 * regex for password
 *
 * at least 1 of each:
 * - lower case letter
 * - upper case letter
 * - number
 * - special character
 *
 * at least 8 characters
 */
const validPassword =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*?[!"§$%&/()=?^`´°*+'#-])[A-Za-z\d!"§$%&/()=?^`´°*+'#-]{8,}$/;

/*
 * Configure password authentication strategy.
 */
passport.use(
    new LocalStrategy(
        {
            usernameField: 'username',
            passwordField: 'password',
        },
        function verify(username, password, cb) {
            let user = bdb
                .prepare('SELECT rowid AS id, * FROM users WHERE username = ?')
                .get([`${username}`]);

            if (user == undefined) {
                return cb(null, false, {
                    message: 'Inkorrekter Benutzername oder Passwort.',
                });
            }

            crypto.pbkdf2(
                password,
                user.salt,
                310000,
                32,
                'sha256',
                function (err, hashedPassword) {
                    if (err) {
                        return cb(err);
                    }
                    if (
                        !crypto.timingSafeEqual(
                            user.hashed_password,
                            hashedPassword
                        )
                    ) {
                        return cb(null, false, {
                            message: 'Inkorrekter Benutzername oder Passwort.',
                        });
                    }
                    return cb(null, user);
                }
            );
        }
    )
);

/*
 * Configure session management.
 */
passport.serializeUser(function (user, cb) {
    process.nextTick(function () {
        cb(null, {
            id: user.id,
            email: user.email,
            firstname: user.firstname,
            lastname: user.lastname,
        });
    });
});

passport.deserializeUser(function (user, cb) {
    process.nextTick(function () {
        return cb(null, user);
    });
});

/* GET /login
 *
 * Prompts the user to log in.
 *
 */
router.get('/login', function (req, res, next) {
    res.render('login');
});

/* POST /login/password
 *
 * Authenticates the user by verifying a username and password.
 * Uses password authentication strategy.
 *
 */
router.post(
    '/login',
    passport.authenticate('local', {
        successReturnToOrRedirect: '/',
        failureRedirect: '/login',
        failureMessage: true,
    })
);

/* GET /logout
 *
 * Logs the user out.
 */
router.get('/logout', function (req, res, next) {
    req.logout();
    res.redirect('/');
});

/* GET /anmeldung
 *
 * Prompts the user to sign up.
 *
 */
router.get('/registrierung', function (req, res, next) {
    res.render('registrierung');
});

/* POST /registrierung
 *
 * Creates new user account.
 * Form input validation.
 *
 */
router.post('/registrierung', function (req, res, next) {
    if (
        req.body.username == undefined ||
        req.body.email == undefined ||
        req.body.password == undefined ||
        req.body.passwordcheck == undefined ||
        req.body.firstname == undefined ||
        req.body.lastname == undefined
    ) {
        res.render('registrierung', {
            error: 'Fülle alle Felder aus.',
        });
    } else if (req.body.username.length < 3) {
        res.render('registrierung', {
            error: 'Gebe mindestens 4 Zeichen für deinen Benutzernamen ein.',
        });
    } else if (!validator.validate(req.body.email)) {
        res.render('registrierung', {
            error: 'Gebe eine gültige Email ein.',
        });
    } else if (req.body.password !== req.body.passwordcheck) {
        res.render('registrierung', {
            error: 'Die Passwörter müssen übereinstimmen.',
        });
    } else if (!validPassword.test(req.body.password)) {
        res.render('registrierung', {
            error: 'Das Passwort muss mindestens aus jeweils 1 Groß-, Kleinbuchstaben, Sonderzeichen und Ziffern bestehen und mindestens 8 Zeichen lang sein.',
        });
    } else if (validator.validate(req.body.email)) {
        let user = bdb
            .prepare('SELECT email from users WHERE email = ?')
            .get([`${req.body.email}`]);

        if (user != undefined) {
            res.render('registrierung', {
                error: 'Es gibt bereis einen Account mit dieser E-Mail.',
            });
        } else {
            const salt = crypto.randomBytes(16);
            crypto.pbkdf2(
                req.body.password,
                salt,
                310000,
                32,
                'sha256',
                function (err, hashedPassword) {
                    let lastStmt;
                    if (err) {
                        return next(err);
                    }
                    try {
                        const stmt = bdb.prepare(
                            'INSERT INTO users (username, email, hashed_password, salt, firstname, lastname) VALUES (?, ?, ?, ?, ?, ?)'
                        );
                        lastStmt = stmt.run([
                            req.body.username,
                            req.body.email,
                            hashedPassword,
                            salt,
                            req.body.firstname,
                            req.body.lastname,
                        ]);
                    } catch (err) {
                        return next(err);
                    }

                    const user = {
                        id: lastStmt.lastInsertRowid,
                        email: req.body.email,
                        firstname: req.body.firstname,
                        lastname: req.body.lastname,
                    };

                    req.login(user, function (err) {
                        if (err) {
                            return next(err);
                        }
                        res.redirect('/');
                    });
                }
            );
        }
    }
});


/* POST /einstellungen
 *
 * Changes data for the user logged in
 * Form input validation.
 *
 */
router.post('/change-settings', function (req, res, next) {

    if (req.body.email == "" &&
        req.body.password == "" &&
        req.body.passwordcheck == "" &&
        req.body.firstname == "" &&
        req.body.lastname == ""
    ) {
        res.render('einstellungen', {
            error: 'Fülle mindestens ein Feld aus.',
            user: req.user,});
    } else if ( req.body.email != "" &&
                !validator.validate(req.body.email)) {
        res.render('einstellungen', {
            error: 'Gebe eine gültige Email ein.',
            user: req.user,});
    } else if ( req.body.password != "" && 
                req.body.password !== req.body.passwordcheck) {
        res.render('einstellungen', {
            error: 'Die Passwörter müssen übereinstimmen.',
            user: req.user,});
    } else if ( req.body.password != "" && 
                !validPassword.test(req.body.password)) {
        res.render('einstellungen', {
            error: 'Das Passwort muss mindestens aus jeweils 1 Groß-, Kleinbuchstaben, Sonderzeichen und Ziffern bestehen und mindestens 8 Zeichen lang sein.',
            user: req.user,});
    } else if ( req.body.email != "" && 
                validator.validate(req.body.email)) {
        let user = bdb
            .prepare('SELECT email from users WHERE email = ?')
            .get([`${req.body.email}`]);

        if (user != undefined) {
            res.render('einstellungen', {
                error: 'Es gibt bereis einen Account mit dieser E-Mail.',
                user: req.user,});
        }
    } 

    if ((typeof error )== 'undefined'){

        const user = {
        id: req.user.id,
        email: req.user.email,
        firstname: req.user.firstname,
        lastname: req.user.lastname,
        };
        
        if ( req.body.password != ""){
            const salt = crypto.randomBytes(16);
            crypto.pbkdf2(
                req.body.password,
                salt,
                310000,
                32,
                'sha256',
                function (err, hashedPassword) {
                    if (err) {
                        return next(err);
                    }
                    try {
                        bdb.prepare(
                            'UPDATE users SET hashed_password = ?, salt = ? WHERE userID = ?'
                        ).run([
                            hashedPassword,
                            salt,
                            req.user.id,
                        ]);
                    } catch (err) {
                        console.log(err);
                        return next(err);
                    }

                }
            );}
            
            if ( req.body.firstname != ""){
                bdb.prepare(
                    'UPDATE users SET firstname = ? WHERE userID = ?'
                ).run([
                    req.body.firstname,
                    req.user.id,
                ]);
                user.firstname = req.body.firstname;
            }
            
            if ( req.body.lastname != ""){
                bdb.prepare(
                    'UPDATE users SET lastname = ? WHERE userID = ?'
                ).run([
                    req.body.lastname,
                    req.user.id,
                ]);
                user.lastname = req.body.lastname;
            }
            
            if ( req.body.email != ""){
                bdb.prepare(
                    'UPDATE users SET email = ? WHERE userID = ?'
                ).run([
                    req.body.email,
                    req.user.id,
                ]);
                user.email = req.body.email;
            }

            req.login(user, function (err) {
                if (err) {
                    console.log(err);
                    return next(err);
                }
                res.redirect('/einstellungen');
            });
        }
    }
);


module.exports = router;
