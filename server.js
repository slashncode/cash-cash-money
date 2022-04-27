const express = require('express');
const path = require('path');

const app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

const indexRouter = require('./routes/index');

// use routers
app.use('/', indexRouter);

// ######################
// #### Start server ####
// ######################
app.listen(3000, function () {
    console.log('listening on port 3000');
});
