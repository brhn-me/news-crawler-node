var mongoose = require('mongoose');
var dbUrl = "mongodb://172.17.0.2:27017/newsdata";
mongoose.connect(dbUrl, {useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true});

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
    console.log("Connected to db");
});


module.exports = db;
