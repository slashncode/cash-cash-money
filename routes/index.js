const express = require('express');
const ensureLogIn = require('connect-ensure-login').ensureLoggedIn;
const db = require('../db');
const router = express.Router();
const ensureLoggedIn = ensureLogIn();

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

module.exports = router;
