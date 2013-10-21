
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var http = require('http');
var path = require('path');
var db = require('./db');
var fs = require('fs');
var mongoose = require('mongoose');

var counter = mongoose.model('UserIds');
var userDetails = mongoose.model('UserDetails');
var userMessages = mongoose.model('UserMessage');
var followers = mongoose.model('FollowUsers');

var app = express();

// all environments
app.set('port', process.env.PORT || 3001);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.cookieParser());
app.use(express.session({secret: "keyboard cat" }));
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', function(req,res)
{
    res.render('welcome');
});
var logedInUser;

app.post('/Signup',function(req,res)
{
    var userName = req.body.username;
    var passWord = req.body.password;
    var emailId = req.body.email;
    var id;

    console.log('userName :' +userName);
    console.log('password :' +passWord);
    console.log('emailId :' +emailId);

    counter.findAndModify({ _id: "UserDetails" }, [], { $inc: { next: 1 } }, {new: true, upsert: true, select: {next: 1}}, function (err,result) {
        if (err) console.log('error' +err);
        else
        {
            console.log('next :' +result.next);
            id = result.next;
            var userData = new userDetails({userId:id, username:userName, password: passWord, emailId:emailId,date:Date.now()})

            userData.save(function(err)
            {
                if(err)
                console.log('error on save UserData');
                else
                res.render('register');
            });
        }
    });

});

app.post('/Login',function(req,res)
{
    var username = req.body.username;
    var password = req.body.password;
    logedInUser = username;
    console.log('username :' +username);
    console.log('password :' +password);

    userDetails.findOne({"username":username},function(err,result) {
        if(!err)
        console.log('Username password match' +result.userId);

        if(result && result.password==password)
        {
            req.session.user_id=result.userId;
            res.render('home',{username:username});
        }
        else
        {
            res.send("Bad username or password");
        }
    });
});

app.post('/posttweet',function(req,res)
{
    var post = req.body.tweet;
    console.log('user_id'+req.session.user_id);

    var message = new userMessages({userId:req.session.user_id,tweet:req.body.status,date:Date.now()});

    message.save(function(err)
    {
        if(err)
        console.log('error on save');
        else
        {
            userMessages.find({},function(err,posts){

            userDetails.find({},function(err,doc){

            if(!err)
            {
            //console.log('username :' +posts.tweet);
            res.render('timeline',{posts:posts,doc:doc});
            }
            });
        });
        }
    });

});

app.get('/profile',function(req,res)
{
    var userInfo = req.query["u"];
    var info = userInfo.split(":");
    var userId = info[0];
    var username = info[1];
    var is_following;
    console.log('userId' +info);
    userMessages.find({userId:userId},function(err,posts){

    followers.count({followers:username},function(err,result){

    if(result>0)
        is_following=1;

    res.render('profile',{posts:posts,username:username,logedInUser:logedInUser,is_following:is_following});
    });
});
});

app.get('/follow',function(req,res){

    var followUser = req.query["u"];
    var flag = req.query["f"];
    console.log('followUser :' +followUser);
    var follower = new followers({username:logedInUser,followers:[followUser]});
    console.log('flag' +flag);
    if(flag==="1")
    {
    follower.save(function(err)
    {
        if(err)
        console.log('error on save');
        else
        {
        followers.find({},function(err,posts){
        //console.log('followers' +posts);
        });
        }
    });
    }
    else if(flag==="0")
    {

        followers.update({username:logedInUser},{$pull:{followers:followUser}},function(err,rem){

        if(err)
        console.log('error on save');

        else
        {
            followers.find({},function(err,posts){
                console.log('followers' +posts);
            });
        }
        });


    }

    });


http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
