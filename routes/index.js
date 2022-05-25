const express = require('express');
const ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn;
const bdb = require('../db');
const router = express.Router();
const dayjs = require('dayjs');
require('dayjs/locale/de');
dayjs.locale('de');

function fetchData(req, res, next) {
    console.log(req.query);
    let data = {};
    if (req.query.filterData == 'positive') {
        data = bdb
            .prepare(
                'SELECT * FROM entries WHERE entry_userID = ? AND entry_value > 0 ORDER BY entry_date DESC'
            )
            .all(req.user.id);
    } else if (req.query.filterData == 'negative') {
        data = bdb
            .prepare(
                'SELECT * FROM entries WHERE entry_userID = ? AND entry_value <= 0 ORDER BY entry_date DESC'
            )
            .all(req.user.id);
    } else {
        data = bdb
            .prepare(
                'SELECT * FROM entries WHERE entry_userID = ? ORDER BY entry_date DESC'
            )
            .all(req.user.id);
    }

    if (
        req.query.startDate &&
        req.query.startDate != '' &&
        req.query.endDate &&
        req.query.endDate != ''
    ) {
        data = data.filter((item) => {
            return (
                item.entry_date >= req.query.startDate &&
                item.entry_date <= req.query.endDate
            );
        });
    } else if (req.query.startDate && req.query.startDate != '') {
        data = data.filter((item) => {
            return item.entry_date >= req.query.startDate;
        });
    } else if (req.query.endDate && req.query.endDate != '') {
        data = data.filter((item) => {
            return item.entry_date <= req.query.endDate;
        });
    }

    next(data);
}

function addEntry(req) {
    bdb.prepare(
        'INSERT INTO entries (entry_name, entry_date, entry_tags, entry_value, entry_userID) VALUES (?, ?, ?, ?, ?)'
    ).run(
        req.body.entry_name,
        dayjs().format('YYYY-MM-DD'),
        '',
        req.body.changeSign ? req.body.entry_value * -1 : req.body.entry_value,
        req.user.id
    );
}

function fetchAllUsers(req, res, next) {
    let data = bdb.prepare('SELECT * from users').all();
    next(data);
}

/*
Reihe (rows) von dem SELECT
{"entry_name": "Lidl Einkauf", "entry_value": "12,23", ...}

data-Objekt das wir mit den Reihen befüllen
{
    1: {
        "entry_name": "Lidl Einkauf",
        "entry_value": "12,23",
        ...
    }
}
*/

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
    function (req, res, next) {
        fetchData(req, res, function (data) {
            res.render('app', {
                user: req.user,
                entries: data,
                dayjs: dayjs,
                buttonPressed: req.query.filterData,
                startDate: req.query.startDate,
                endDate: req.query.endDate,
            });
        });
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
        if (req.user.userrole == 'admin') {
            fetchAllUsers(req, res, function (data) {
                res.render('einstellungen', {
                    user: req.user,
                    userrole: req.user.userrole,
                    allUsers: data,
                });
            });
        } else {
            res.render('einstellungen', {
                user: req.user,
                userrole: req.user.userrole,
            });
        }
    }
);

// POST add entry
router.post('/hinzufuegen', function (req, res, next) {
    if (req.body.entry_name != undefined && req.body.entry_value != undefined) {
        console.log('HALLO?!');
        addEntry(req);
    } else {
        console.log('FEHLER?!');
    }
    return res.end('done');
});

module.exports = router;

router.get('/app', function (req, res) {
    res.render('app');
});

router.get('/eingaben', function (req, res) {
    res.render('eingaben');
});

router.get('/ausgaben', function (req, res) {
    res.render('ausgaben');
});
