/**
 * Created by LeeKane on 17/3/8.
 */
var callbackId = 0;
angular.module("mainAPP", ['ngRoutingnum'])
    .config(function ($httpProvider) {
        $httpProvider.interceptors.push('jsonpInterceptor');
    })

    .service('doubanServicesInMyCallback', function ($http) {
        var doRequest = function (bookId) {
            return $http({
                method: 'JSONP',
                url: 'https://api.douban.com/v2/book/' + bookId + '?callback=MyCallback'
            });
        }
        return {
            events: function (bookId) {
                return doRequest(bookId, 'events');
            },
        };
    })

    .service('doubanServicesInJSONPCALLBACK', function ($http) {
        var doRequest = function (bookId) {
            return $http({
                method: 'JSONP',
                url: 'https://api.douban.com/v2/book/' + bookId + '?callback=JSON_CALLBACK'
            });
        }
        return {
            events: function (bookId) {
                return doRequest(bookId, 'events');
            },
        };
    })

    .controller('mainController', function ($scope) {

    })

    .controller('concernedController', function ($scope, $http, doubanServicesInMyCallback, doubanServicesInJSONPCALLBACK) {
        $scope.showInfo = false;
        $scope.choosen = -1;
        $scope.selected = 1;
        $scope.bookID = 26698660;
        $scope.items = [
            {bookID: 26698660, imgSrc: "https://img3.doubanio.com/mpic/s28668834.jpg", rating: '9.0', title: "巨人的陨落"},
            {
                bookID: 26831234,
                imgSrc: "https://img1.doubanio.com/mpic/s28872219.jpg",
                rating: '8.6',
                title: "不属于我们的世纪"
            },
            {bookID: 26761696, imgSrc: "https://img3.doubanio.com/mpic/s28588315.jpg", rating: '7.7', title: "精进"},
            {
                bookID: 26768309,
                imgSrc: "https://img3.doubanio.com/mpic/s28671476.jpg",
                rating: '8.1',
                title: "查令十字街84号"
            },
            {
                bookID: 26789567,
                imgSrc: "https://img3.doubanio.com/mpic/s29283432.jpg",
                rating: '7.6',
                title: "如何有效阅读一本书"
            },
            {
                bookID: 26816981,
                imgSrc: "https://img3.doubanio.com/mpic/s28811898.jpg",
                rating: '8.5',
                title: "十二幅地图中的世界史"
            },
            {bookID: 26729776, imgSrc: "https://img3.doubanio.com/mpic/s28976471.jpg", rating: '8.2', title: "雪人"},
            {bookID: 26356515, imgSrc: "https://img3.doubanio.com/mpic/s28813569.jpg", rating: '8.2', title: "S."}
        ];
        $scope.closeInfo = function () {
            $scope.showInfo = false;
            $scope.choosen = -1;
            $scope.selected = 1;
        }
    })

    .factory('jsonpInterceptor', function ($timeout, $window) {
        return {
            'request': function (config) {
                if (config.method === 'JSONP') {
                    var callbackId = angular.callbacks.counter.toString(36);
                    config.callbackName = 'angular_callbacks_' + callbackId;
                    config.url = config.url.replace('JSON_CALLBACK', config.callbackName);

                    $timeout(function () {
                        $window[config.callbackName] = angular.callbacks['_' + callbackId];
                    }, 0, false);
                }

                return config;
            },

            'response': function (response) {
                var config = response.config;
                if (config.method === 'JSONP') {
                    delete $window[config.callbackName]; // cleanup
                }

                return response;
            },

            'responseError': function (rejection) {
                var config = rejection.config;
                if (config.method === 'JSONP') {
                    delete $window[config.callbackName]; // cleanup
                }

                return $q.reject(rejection);
            }
        };
    })
