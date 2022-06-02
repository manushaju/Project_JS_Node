//including dependancies
var express = require('express');
var path = require('path');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const session = require('express-session');
const datetime = require('./public/js/datetime');
const fileUpload = require('express-fileupload');


const {
    check,
    validationResult
} = require('express-validator');

var myapp = express();
//setting the paths for ejs and public folders
myapp.set('views', path.join(__dirname, 'views'));
myapp.set('view engine', 'ejs');

myapp.use(express.static(__dirname + '/public'));
myapp.use(express.urlencoded({
    extended: false
}));
myapp.use(bodyParser.urlencoded({
    extended: true
}));
myapp.use(fileUpload());
myapp.use(session({
    secret: 'mysecret',
    resave: false,
    saveUninitialized: true,
}));

const databaseConn = 'mongodb://localhost:27017/blogDB';
// To connect to the database - todoDB
mongoose.connect(databaseConn, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const posts = [];

// Creating a Schema for the BLOG
const blogPostSchema = new mongoose.Schema({
    postTitle: String,
    postBody: String,
    postTime: String
});

const userDataSchema = new mongoose.Schema({
    username: String,
    password: String,
});

// Model for the Blog post
const blogPost = mongoose.model('Post', blogPostSchema);
const userData = mongoose.model('User', userDataSchema);


const homeStartingContent = "Below are the blogs available for viewing";


myapp.get('/', (req, res) => {
    var curPosts = [];
    blogPost.find((err, data) => {
        if (err) {
            console.log(err);
        } else {
            curPosts = data;
            var returnObj = {
                homeStartContent: homeStartingContent,
                currentPosts: curPosts,
                sessionInfo: req.session,
            };
            res.render('home', returnObj);
        }
    });
});

myapp.get('/about', (req, res) => {
    res.render('about', {
        aboutContent: aboutContent
    });
});

myapp.get('/contact', (req, res) => {
    res.render('contact', {
        contactContent: contactContent
    });
});

myapp.get('/post/:id', (req, res) => {
    var id = req.params.id;
    blogPost.findOne({
        _id: id
    }, (err, data) => {
        if (!err) {
            res.render('post', {
                postDet: data,
                sessionInfo: req.session,
            });
        }
    });
});


myapp.get("/compose", (req, res) => {

    if (req.session.userLoggedIn) {
        res.render('compose', {
            sessionInfo: req.session,
            post: {
                postTitle: "",
                postBody: "",
            }
        });
    } else {
        res.render('login', {
            sessionInfo: req.session
        });
    }
});

myapp.get('/posts', (req, res) => {
    if (req.session.userLoggedIn) {
        blogPost.find((err, data) => {
            if (err) {
                console.log(err);
            } else {
                var returnObj = {
                    homeStartContent: homeStartingContent,
                    posts: data,
                    sessionInfo: req.session,
                };
                res.render('posts', returnObj);
            }
        });
    } else {
        res.render('login', {
            sessionInfo: req.session
        });
    }
});

myapp.get('/login', (req, res) => {
    res.render('login', {
        sessionInfo: req.session
    });
});

myapp.get('/post/edit/:id', (req, res) => {
    if (req.session.userLoggedIn) {
        blogPost.findOne({
            _id: req.params.id
        }, (err, data) => {
            if (data) {
                console.log('data available');
                res.render('edit', {
                    sessionInfo: req.session,
                    post: data,
                })
            }
        });
    } else {
        res.render('login', {
            sessionInfo: req.session
        });
    }
});

myapp.post('/edit/:id', (req, res) => {
    blogPost.findOne({
        _id: req.params.id
    }, (err, data) => {
        if (data) {
            data.postTitle = req.body.blogTitle;
            data.postBody = req.body.blogContent;
            data.save((err) => {
                if (!err) {
                    console.log("Data updated..");
                }
            });
        }
    });
    res.redirect('/posts');
});

myapp.get('/post/delete/:id', (req, res) => {
    blogPost.findByIdAndRemove({
        _id: req.params.id
    }).exec((err, data) => {
        res.redirect('/posts');
    })
})



myapp.get('/logout', (req, res) => {
    req.session.username = "";
    req.session.userLoggedIn = false;
    res.redirect('/');
})

// Post Routes 

myapp.post('/compose', (req, res) => {
    var currentTime = datetime.convertTimeZone(5.5);

    const newPost = new blogPost({
        postTitle: req.body.blogTitle,
        postBody: req.body.blogContent,
        postTime: currentTime,
    });
    newPost.save().then(() => {
        console.log('Post added to database..');
    })
    res.redirect('/posts');

});

myapp.post('/login', (req, res) => {
    req.session.userLoggedIn = false;
    req.session.username = "";
    userData.findOne({
        username: req.body.userName,
        password: req.body.password
    }, (err, data) => {
        if (data) {
            if (data.username == req.body.userName && data.password == req.body.password) {
                req.session.userLoggedIn = true;
                req.session.username = req.body.userName;
                res.redirect('/posts');
            } else {
                res.redirect('/login');
            }

        } else {
            res.redirect('/login');
        }
    });
})

myapp.listen(8080, () => {
    console.log("Server started at port 8080.\nGo to http://localhost:8080");
});