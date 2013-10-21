/**
 * Created by root on 17/10/13.
 */
var mongoose = require("mongoose");

var uristring =
    process.env.MONGOLAB_URI ||
        process.env.MONGOHQ_URL ||
        'mongodb://localhost:27017/myMangoDb1';

mongoose.connect(uristring, function (err, res) {
    if (err) {
        console.log ('ERROR connecting to: ' + uristring + '. ' + err);
    } else {
        console.log ('Succeeded connected to: ' + uristring);
    }
});

var Counters = new mongoose.Schema({
   _id:String,
    seq:Number
});

Counters.statics.findAndModify = function (query, sort, doc, options, callback) {
    this.collection.findAndModify(query, sort, doc, options, callback);
};

var dataSchema = new mongoose.Schema({
    userId:String,
    username:String,
    password:String,
    emailId:String,
    date:{type:Date, default: Date.now}
});

var messages = new mongoose.Schema({
   userId:String,
   tweet:String,
   date:{type:Date, default: Date.now}
});

var followSchema = new mongoose.Schema({
   username:String,
   followers:[String]
});

mongoose.model('UserDetails',dataSchema);

mongoose.model('UserIds',Counters);

mongoose.model('UserMessage', messages);

mongoose.model('FollowUsers', followSchema);

