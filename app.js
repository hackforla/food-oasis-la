var express = require('express');
var app = express();
var port = process.env.PORT || 3000;

app.listen(port, function(){
  console.log("listening on port " + port);
});

//routing

var route = require('./route/route.js');

// app.use('/', route);

app.set('view engine', 'ejs');

app.use(express.static(__dirname + '/public'));




app.get('/', function(req,res){
  res.render('index');
});





module.exports = app;


