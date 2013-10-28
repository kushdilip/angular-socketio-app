
/**
 * Module dependencies.
 */

var express = require('express');
// var routes = require('./routes');
// var user = require('./routes/user');
var http = require('http');
var path = require('path');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
// app.set('views', path.join(__dirname, 'views'));
// app.set('view engine', 'jade');
// app.use(express.favicon());
// app.use(express.logger('dev'));
// app.use(express.bodyParser());
// app.use(express.methodOverride());
// app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

// app.get('/', routes.index);
// app.get('/users', user.list);

server = http.createServer(app);
var io = require('socket.io').listen(server);

app.get('/', function(req, res){
    res.sendFile('index.html');
});



server.listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

var msgWrite = '';

// // use socket.io
// var io = require('socket.io').listen(server);

//turn off debug
io.set('log level', 1);

var serverjson = [
                 {"Product": "REL", "BBP": "10", "BSP": "10.2", "LTP": "10.1" }, 
				 {"Product": "BEL", "BBP": "20", "BSP": "20.4", "LTP": "20"    }, 
				 {"Product": "MTL", "BBP": "50", "BSP": "50.5", "LTP": "50.1"  }, 
				 {"Product": "BSL", "BBP": "100", "BSP": "101", "LTP": "100.2" }
				 ];

var quizes = [{
    "Question": "What is your name ?",
    "Answers": {
        "Opt1": "Option1",
        "Opt2": "Option2",
        "Opt3": "Option3",
        "Opt4": "Option4"
    }
}];

var quizes1 = [{
    "Question": "What is your name ?",
    "Answers": [
        {"Opt1": "Option1", "correct": false, "usrResponse":false},
        {"Opt2": "Option2", "correct": false, "usrResponse":false},
        {"Opt3": "Option3", "correct": false, "usrResponse":false},
        {"Opt4": "Option4", "correct": true,  "usrResponse":false}
    ]
}];


// define interactions with client
io.sockets.on('connection', function(socket){
    //send data to client
    setInterval(function(){
        
		for(i=0;i<serverjson.length;i++)
		{
			serverjson[i].BBP = Math.round((parseInt(serverjson[i].BBP) + Math.random())*100)/100;
			serverjson[i].BSP = Math.round((parseInt(serverjson[i].BSP) + Math.random())*100)/100;
			serverjson[i].LTP = Math.round((parseInt(serverjson[i].LTP) + Math.random())*100)/100;
		}
		
		var serverjsonstr = JSON.stringify(serverjson);
		
		socket.emit('msg', {'msg': serverjsonstr});
		socket.emit('msgWrite', msgWrite);
    }, 1000);

    //recieve client data
    socket.on('client_data', function(data){
        process.stdout.write(data.letter);
		msgWrite = msgWrite + data.letter;
    });

    socket.emit('welcome', 'welcome to Tech-connect');

    socket.on('startQuiz', function (data) {
    	var serverjsonstr = JSON.stringify(quizes1[0]);
    	console.log(serverjsonstr);
    	socket.broadcast.emit('quiz', serverjsonstr);
    })
});

