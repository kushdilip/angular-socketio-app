'use strict';

//var myApp = angular.module('myApp', []);

/* App Module */
var app = angular.module('app', []);

app.config(['$routeProvider',
	function($routeProvider) {
		$routeProvider
			.when('/stockList', {
				templateUrl: 'views/stockList.html'
				,controller: 'StockListCtrl'
			})
			.when('/quiz', {
				templateUrl: 'views/quiz.html',
				controller: 'QuizController'
			})
            .when('/master', {
                templateUrl: 'views/master.html', 
                controller: 'MasterCtrl'
            })
			.otherwise({
				redirectTo: '/quiz'
			});
	}
]);

/* Controllers */

app.controller('StockListCtrl', function ($scope, socket) { 
  $scope.stocks = [];
  
  socket.on('msg', function(data) {
		$scope.stocks = JSON.parse(data.msg);
		//$scope.notes.push(data);
	});
  
});

app.controller('MasterCtrl', function ($scope, socket) {
    $scope.startQuiz = function(){
        socket.emit('startQuiz', 'Start the quiz');
    }
})

app.controller('QuizController',['$scope','$timeout', 'socket', 
    function ($scope, $timeout, socket) {
	


    socket.on('quiz', function (data) {
        $scope.quiz = (JSON.parse(data));
        
        $scope.counter = 5;
        $scope.onTimeout = function(){
            mytimeout = $timeout($scope.onTimeout,1000);
            $scope.counter--;
        }
        var mytimeout = $timeout($scope.onTimeout,1000);

        $timeout(function () {
            $scope.quiz = null;
            $timeout.cancel(mytimeout);
            $scope.counter = null;
        }, 5000);


        //$scope.quiz.Question = "#";
        //console.log($scope.quiz);
        // $scope.welcome = data;
    });

    socket.on('welcome', function (data) {
		console.log(data);
		$scope.welcome = data;

	});

    $scope.check_answer = function () {
        var correct = true;
        angular.forEach($scope.quiz.Answers, function(answer){
            if(answer.correct != answer.usrResponse){
                correct = false;
            }
        });
        if(correct)
            alert("Congratulations! Correct Answer");
    }

}]);

app.factory('socket', function($rootScope) {
        var socket = io.connect();
        return {
                on: function(eventName, callback) {
                        socket.on(eventName, function() {
                                var args = arguments;
                                $rootScope.$apply(function() {
                                        callback.apply(socket, args);
                                });
                        });
                },
                emit: function(eventName, data, callback) {
                        socket.emit(eventName, data, function() {
                                var args = arguments;
                                $rootScope.$apply(function() {
                                        if(callback) {
                                                callback.apply(socket, args);
                                        }
                                });
                        });
                }
        };
});




