const express = require('express');
const ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn;
const db = require('../db');
const router = express.Router();

function fetchData(req, res, next) {
    /**
     * TODO
     * this function will fetch user specific data (income and expenses)
     */
}

// GET home page
router.get(
    '/',
    function (req, res, next) {
        // if user is not logged in, render index.ejs with links to signup or login
        if (!req.user) {
            return res.render('index');
        }
        // if user is logged in, go to next function and render app
        next();
    },
    // fetchData,
    function (req, res, next) {
        res.render('app', { user: req.user });
    }
);

// GET settings page
router.get(
    '/einstellungen',
    // if user is not logged in, save request to /einstellungen,
    // send user to /login and after he logs in send user
    // back to /einstellungen
    ensureLoggedIn('/login'),
    function (req, res, next) {
        res.render('einstellungen', { user: req.user });
    }
);

module.exports = router;

router.get(
    '/app',
    function (req, res) {
        res.render('app')
    }
)

router.get(
    '/eingaben',
    function (req, res) {
        res.render('eingaben')
    }
)

router.get(
    '/ausgaben',
    function (req, res) {
        res.render('ausgaben')
    }
)
