const sessionStructure = {
    secret: "blabla",
    resave: true,
    saveUninitialized : true,
    secure: false,
};

exports.structure = sessionStructure;
exports.middlewares = {
    auth: (req, res, next) => {
        return (!req.session.isLogged) ? res.redirect('/login') : next();
    },
    notAuth: (req, res, next) => {
        return (req.session.isLogged) ? res.redirect('/') : next();
    }
}