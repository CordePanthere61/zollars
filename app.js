const createError = require('http-errors');
const express = require('express');
const sess = require('express-session')
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const indexRouter = require('./routes/index');
const profileRouter = require('./routes/profile');
const walletsRouter = require('./routes/wallets');
const apiRouter = require('./routes/api');
const transferRouter = require('./routes/transfer.js');
const session = require('./utils/session');
const flash = require('connect-flash');
require('dotenv').config()

const app = express();

//express base stuff
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '/public')));

//added stuff
app.use(sess(session.structure));
app.use(flash());
app.use((req, res, next) => {
    res.locals.successMessages = req.flash('successMessages');
    res.locals.errorMessages = req.flash('errorMessages');
    res.locals.user = req.session.user ?? null
    next();
});
app.use('/', indexRouter);
app.use('/profile', profileRouter);
app.use('/wallets', walletsRouter);
app.use('/api', apiRouter);
app.use('/transfer', transferRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    next(createError(404));
});
// error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});
module.exports = app;

