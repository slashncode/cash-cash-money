const express = require('express');
const path = require('path');
const createError = require('http-errors');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const passport = require('passport');

// pass the session to the connect sqlite3 module
// allowing it to inherit from session.Store
const SQLiteStore = require('connect-sqlite3')(session);

const app = express();

const indexRouter = require('./routes/index');
const authRouter = require('./routes/auth');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// parse json, urlencoded, parse cookies,
// set public directory, establish sessions,
// csrf, authenticate sessions
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(
    session({
        secret: 'very secret session key',
        resave: false,
        saveUninitialized: false,
        store: new SQLiteStore({ db: 'sessions.db', dir: 'var/db' }),
    })
);
app.use(passport.authenticate('session'));
app.use(function (req, res, next) {
    const msgs = req.session.messages || [];
    res.locals.messages = msgs;
    res.locals.hasMessages = !!msgs.length;
    req.session.messages = [];
    next();
});

// use routers
app.use('/', indexRouter);
app.use('/', authRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

// ######################
// #### Start server ####
// ######################
app.listen(3000, function () {
    console.log('listening on port 3000');
});
