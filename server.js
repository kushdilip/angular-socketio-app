
/**
 * Module dependencies.
 */

 var express = require('express');
// var routes = require('./routes');
// var user = require('./routes/user');
var http = require('http');
var path = require('path');
var fs = require('fs');

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
app.use(express.cookieParser());
app.use(express.session({secret: '1234567890QWERTY'}));
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

// app.get('/', routes.index);
// app.get('/users', user.list);

server = http.createServer(app);
var io = require('socket.io').listen(server);

//Data variables
var playersFile = __dirname + '/data/players.json';
var questionFile = __dirname + '/data/questions.json';
//var players = [{empId: 'default1'}, {empId: 'default2'}];

app.get('/', function(req, res){
    res.sendFile('index.html');
});


app.get('/players', function (req, res) {
    fs.readFile(playersFile, 'utf8', function (err, players) {
        if (err) {
            console.log('Error: ' + err);
            return;
        }

        players = JSON.parse(players);
        res.contentType('application/json');
        res.send(players);
    });
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

    //Welcome test
    socket.emit('welcome', 'welcome to Tech-connect');

    //listener for starting a quiz.
    socket.on('startQuiz', function (data) {
        fs.readFile(questionFile, 'utf8', function (err, questions) {
            if (err) {
                console.log('Error: ' + err);
                return;
            }

            var questions = JSON.parse(questions);
            
            socket.broadcast.emit('quiz', JSON.stringify(questions[0]));   

            var questionsCount = questions.length -1;
            var i = 1;
            if(questionsCount > 0){
                var interval = setInterval(function () {
                    var serverjsonstr = JSON.stringify(questions[i]);
                    socket.broadcast.emit('quiz', JSON.stringify(questions[i]));
                    i++, questionsCount--;
                    if (questionsCount == 0) { clearInterval(interval);};
                }, 7000 );
            }
        });
    });

    //New player registered
    socket.on('register', function (newPlayer) {
        //players.push(data);
        var players = [];
        fs.readFile(playersFile, 'utf8', function (err, oldPlayers) {
            if (err) {
                console.log('Error: ' + err);
                return;

            }

            
            players = JSON.parse(oldPlayers);
            
            filteredPlayer = players.filter(function(player){
              return (player.empId == newPlayer.empId);
          }).length <= 0;

            if (filteredPlayer) {
                players.push(newPlayer);
                writeToPlayersFile(players, newPlayer);
            }            
        });

    });

    //function to write to players.json file
    var writeToPlayersFile = function (players, newPlayer) {
        fs.writeFile(playersFile, JSON.stringify(players, null, 4), 'utf8', function (err) {
            if (err) {
                console.log(err);
            } else {
                console.log("New players list generated");
                socket.broadcast.emit('register', newPlayer);

            }
        });
    };

    // var tempData = [];
    // writeToPlayersFile(tempData);
});