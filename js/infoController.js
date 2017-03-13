/**
 * Created by LeeKane on 17/3/7.
 */
var app = angular.module('mainAPP', ['chieffancypants.loadingBar', 'ngAnimate']);

app.config(['cfpLoadingBarProvider', function (cfpLoadingBarProvider) {
    cfpLoadingBarProvider.includeSpinner = true;
    cfpLoadingBarProvider.spinnerTemplate = '<div>Loading...</div>';
}]);

app.service('doubanServicesInJsonpCallback', function ($http) {
    var doRequest = function (bookId) {
        return $http({
            method: 'JSONP',
            url: 'https://api.douban.com/v2/book/' + bookId + '?callback=JSON_CALLBACK',
        })
    }
    var doRequestReviews = function (bookId) {
        return $http({
            method: 'JSONP',
            url: 'https://api.douban.com/v2/book/' + bookId + '/reviews' + '?callback=JSON_CALLBACK',
        });
    };
    return {
        events: function (bookId) {
            return doRequest(bookId, 'events');
        },
    };
});
app.service('doubanServicesInwinnerCallback', function ($http) {
    var doRequest = function (bookId) {
        return $http({
            method: 'JSONP',
            url: 'https://api.douban.com/v2/book/' + bookId + '?callback=winnerCallback'
        });
    }
    return {
        events: function (bookId) {
            return doRequest(bookId, 'events');
        },
    };
});
app.service('doubanServicesInchoosenCallBack', function ($http) {
    var doRequest = function (bookId) {
        return $http({
            method: 'JSONP',
            url: 'https://api.douban.com/v2/book/' + bookId + '?callback=choosenCallBack'
        });
    };

    var doRequestReviews = function (bookId) {
        return $http({
            method: 'JSONP',
            url: 'https://api.douban.com/v2/book/' + bookId + '/reviews' + '?callback=choosenReviewsCallBack'
        });
    };
    return {
        events: function (bookId) {
            return doRequest(bookId, 'events');
        },
        reviews: function (bookId) {
            return doRequestReviews(bookId, 'reviews')
        }
    };
});

app.directive('finish', function ($timeout) {
    return {
        restrict: 'A',
        link: function (scope) {
            if (scope.$last === true) {
                $timeout(function () {
                    scope.$emit('ngRepeatFinished');
                });
            }
        }
    };
});
app.directive('topProcess', function () {
    return {
        restrict: 'EA',
        template: '<div class="topProcess" id="loading-bar-container" style="height: 8px;background-color: #e50914;"></div>',
        link: function (scope, element, attr) {
            var topProcess = element.find('.topProcess').children();

        }
    };
});

app.directive("winnerContainer", ['doubanServicesInwinnerCallback', '$http', function ($http, doubanServicesInwinnerCallback) {
    var obj = {
        restrict: "AE",
        replace: true,
        scope: true,
        transclude: false,
        link: function ($scope, $http, scope, element, attrs) {
            //doubanServicesInwinnerCallback.events($scope.bookID);
        },
        controller: function ($scope, $http) {
            var url = 'localJson/' + $scope.bookID + '.json';
            $http.get(url).success(function (data) {
                $scope.winner = data;
                $scope.winnerImg = $scope.winner["images"]["large"];
                $scope.author = $scope.winner["author"].toString();
                $scope.rating = $scope.winner["rating"]["average"] / 2;
                var ratingElement = angular.element(".my-rating-1");
                ratingElement.starRating({
                    initialRating: $scope.rating,
                    readOnly: true,
                    totalStars: 5,
                    starSize: 12,
                    emptyColor: 'lightgray',
                    hoverColor: 'salmon',
                    activeColor: 'crimson',
                    useGradient: false
                });
            });

        },
        template: '<div class="winner" ng-show="showInfo==false">'
        + '<div class="leftaward">'
        + '<h2><div>{{award}}</div></h2>' +
        '<hr/>'
        + '<h4 style="margin: 0">{{winner["title"]}}</h4>' +
        '<div class="author">{{author}}</div>'
        + '<div>' +
        '<div class="author" style="float: left">{{winner["rating"]["average"]}} 分<span class="my-rating-1 rating"></span></div>'
        + '<span class="author" style="float: right">{{winner["rating"]["numRaters"]}} 人评价</span>' +
        '</div>'
        + '<div class="summary">{{winner["summary"]}}</div>' +
        '</div>'
        + '<div class="winnerInfo">'
        + '<img width="150" height="230" ng-src="{{winnerImg}}">'
        + '</div>',
    }
    return obj;
}]);

app.directive("myCell", ['doubanServicesInwinnerCallback', function (doubanServicesInwinnerCallback) {
    var obj = {
        restrict: "AE",
        scope: {
            cellid: '@cellId',
            bookid: '@bookId',
            imgSrc: '@imgSrc',
            rating: '@rating',
            title: '@title',
            choosenBook: '='
        },
        replace: true,
        transclude: true,
        link: function (scope, element, attrs) {
            var bookId = scope.bookid;
            // doubanServicesInwinnerCallback.events(scope.bookid);
            scope.toggle = function (event) {
                if (scope.$parent.$parent.showInfo == true && scope.$parent.$parent.choosen != scope.cellid) {
                    scope.$parent.$parent.choosen = scope.cellid;
                    scope.$parent.$parent.selected = 1;
                    scope.$parent.$parent.choosenBook = scope.bookid;
                    scope.$parent.$parent.$broadcast('choosenBookChange', {"val": scope.bookid});

                }
                else {
                    scope.$parent.$parent.showInfo = !scope.$parent.$parent.showInfo;
                    scope.$parent.$parent.choosen = scope.cellid;
                    scope.$parent.$parent.$broadcast('choosenBookChange', {"val": scope.bookid});
                }

            };
        },
        template: '<a  href="javascript:void(0)" ng-click="toggle()">'
        + '<div class="topNum"> <span>{{rating}} </span> </div>'
        + '<div class="clipImg"><img ng-src={{imgSrc}}  width="80" height="120"></div>'
        + '<div class="buttomTitle">{{title}}</div></a>',

    }
    return obj;
}]);

app.directive("bookInfoContainer", ['doubanServicesInchoosenCallBack', 'cfpLoadingBar', function (doubanServicesInchoosenCallBack, cfpLoadingBar) {
    var obj = {
        restrict: "AE",
        replace: true,
        scope: false,
        transclude: true,
        link: function ($scope, scope, element, attrs) {
            scope.selected = 1;
        },
        template: '<div class="infoContainer" >' +
        '<a class="closeIcon h1" ng-click="closeInfo()">x</a>'
        + '<nav class="tab-nav">' +
        '<ul>'
        + "<li ng-class={'selected':selected==1} ng-click='selected=1'>总览</li>"
        + "<li ng-class={'selected':selected==2} ng-click='selected=2'>作者</li>"
        + "<li ng-class={'selected':selected==3} ng-click='selected=3'>评论</li>"
        + '</ul>' +
        '</nav>' +
        '<div class="titleInPanel"><h3 style="margin: 0">{{book["title"]}}</h3><span class="origin-title">{{book["origin_title"]}}</span></div>'
        + '<div class="textPanel" ng-class={"bounceInLeft":selected==1,"animated":selected==1} ng-show="selected==1">'
        + '<div class="author">{{bookAuthor}}</div>'
        + '<div class="author">{{book["rating"]["average"]}} 分<span class="my-rating-2 rating"></span><span class="author" style="float: right">{{book["rating"]["numRaters"]}} 人评价</span></div>'
        + '<div class="tags"><label ng-repeat="tag in tags" class="book-tag">{{tag["title"]}}</label></div>'
        + '<div class="summaryInPanel">{{book["summary"]}}</div>' +
        '</div>'
        + '<div class="textPanel" ng-class={"bounceInLeft":selected==2,"animated":selected==2} ng-show="selected==2">'
        + '<div class="author">{{bookAuthor}}</div>'
        + '<div class="summaryInPanel">{{book["author_intro"]}}</div>' +
        '</div>'
        + '<div class="textPanel" ng-class={"bounceInLeft":selected==3,"animated":selected==3} ng-show="selected==3">'
        + '<div class="comment">' +
        '<ul class="commentUl">' +
        '<li class="commentLi" ng-repeat="comment in reviewsList" finish>' +
        '<div class="commentContainer">' +
        '<div class="commentContent">{{comment["title"]}}</div>' +
        '<div class="commentInfo"><span style="float: left">{{comment["author"]["name"]}} {{comment["updated"]}}</span><span class="rating-{{$index}}" style="float: right"></span></div>' +
        '</div>' +
        '</li>' +
        '</ul>' +
        '</div>'
        + '</div>' +
        '<ng-transclude></ng-transclude></div>',

        controller: function ($scope) {
            $scope.$on('choosenBookChange', function (event, args) {
                cfpLoadingBar.start();
                doubanServicesInchoosenCallBack.events(args.val);
                doubanServicesInchoosenCallBack.reviews(args.val);
            });
            $scope.$on('ngRepeatFinished', function (event, args) {
                $scope.reviewsList.forEach(function (val, index, arr) {
                    var ratingClass = ".rating-" + index;
                    var ratingElement = angular.element(ratingClass);
                    ratingElement.starRating({
                        initialRating: arr[index]["rating"]["value"],
                        readOnly: true,
                        totalStars: 5,
                        starSize: 12,
                        emptyColor: 'lightgray',
                        hoverColor: 'salmon',
                        activeColor: 'crimson',
                        useGradient: false
                    });
                })
            });
        }

    }
    return obj;
}]);

app.controller('mainController', function ($scope) {

});

app.controller('concernedController', function ($scope, $http, cfpLoadingBar) {
    $scope.showInfo = false;
    $scope.choosen = -1;
    $scope.choosenBook = 0;
    $scope.selected = 1;
    $scope.bookID = 26698660;
    $scope.award = "最受关注图书";
    $scope.winner = {};
    $scope.book = {};

    $http.get('localJson/concerned.json').success(function (data) {
        $scope.items = data;
    });
    $scope.closeInfo = function () {
        $scope.showInfo = false;
        $scope.choosen = -1;
        $scope.selected = 1;
    }

    $scope.start = function () {
        cfpLoadingBar.start();
    };

    $scope.complete = function () {
        cfpLoadingBar.complete();
    }
    // $scope.$watch('choosenBook', function (newVal, oldVal) {
    //     if (newVal != oldVal) {
    //         $scope.$broadcast('choosenBookChange', {"val": newVal})
    //     }
    // });

});

app.controller('topScoerController', function ($scope, $http, cfpLoadingBar) {
    $scope.showInfo = false;
    $scope.choosen = -1;
    $scope.choosenBook = 0;
    $scope.selected = 1;
    $scope.bookID = 26697350;
    $scope.award = "高分图书";
    $scope.winner = {};
    $scope.book = {};
    $http.get('localJson/topScoer.json').success(function (data) {
        $scope.items = data;
    });
    $scope.closeInfo = function () {
        $scope.showInfo = false;
        $scope.choosen = -1;
        $scope.selected = 1;
    }

    $scope.start = function () {
        cfpLoadingBar.start();
    };

    $scope.complete = function () {
        cfpLoadingBar.complete();
    }
});
app.controller('chinaController', function ($scope, $http, cfpLoadingBar) {
    $scope.showInfo = false;
    $scope.choosen = -1;
    $scope.choosenBook = 0;
    $scope.selected = 1;
    $scope.bookID = 26821461;
    $scope.award = "优秀中国文学";
    $scope.winner = {};
    $scope.book = {};
    $http.get('localJson/china.json').success(function (data) {
        $scope.items = data;
    });
    $scope.closeInfo = function () {
        $scope.showInfo = false;
        $scope.choosen = -1;
        $scope.selected = 1;
    }

    $scope.start = function () {
        cfpLoadingBar.start();
    };

    $scope.complete = function () {
        cfpLoadingBar.complete();
    }
});
app.controller('foreignController', function ($scope, $http, cfpLoadingBar) {
    $scope.showInfo = false;
    $scope.choosen = -1;
    $scope.choosenBook = 0;
    $scope.selected = 1;
    $scope.bookID = 26425831;
    $scope.award = "优秀外国文学";
    $scope.winner = {};
    $scope.book = {};
    $http.get('localJson/foreign.json').success(function (data) {
        $scope.items = data;
    });
    $scope.closeInfo = function () {
        $scope.showInfo = false;
        $scope.choosen = -1;
        $scope.selected = 1;
    }

    $scope.start = function () {
        cfpLoadingBar.start();
    };

    $scope.complete = function () {
        cfpLoadingBar.complete();
    }
});
app.controller('shortstoryController', function ($scope, $http, cfpLoadingBar) {
    $scope.showInfo = false;
    $scope.choosen = -1;
    $scope.choosenBook = 0;
    $scope.selected = 1;
    $scope.bookID = 26681991;
    $scope.award = "优秀短篇小说";
    $scope.winner = {};
    $scope.book = {};
    $http.get('localJson/shortstory.json').success(function (data) {
        $scope.items = data;
    });
    $scope.closeInfo = function () {
        $scope.showInfo = false;
        $scope.choosen = -1;
        $scope.selected = 1;
    }

    $scope.start = function () {
        cfpLoadingBar.start();
    };

    $scope.complete = function () {
        cfpLoadingBar.complete();
    }
});
app.controller('historyController', function ($scope, $http, cfpLoadingBar) {
    $scope.showInfo = false;
    $scope.choosen = -1;
    $scope.choosenBook = 0;
    $scope.selected = 1;
    $scope.bookID = 25986748;
    $scope.award = "优秀历史／传记";
    $scope.winner = {};
    $scope.book = {};
    $http.get('localJson/history.json').success(function (data) {
        $scope.items = data;
    });
    $scope.closeInfo = function () {
        $scope.showInfo = false;
        $scope.choosen = -1;
        $scope.selected = 1;
    }

    $scope.start = function () {
        cfpLoadingBar.start();
    };

    $scope.complete = function () {
        cfpLoadingBar.complete();
    }
});


// var winnerCallback = function (data) {
//     var alt=data["alt"].toString();
//     var bookid=alt.slice(-9,-1);
//     var scope = find(bookid);
//     scope.winner = data;
//     scope.winnerImg = scope.winner["images"]["large"];
//     scope.author = scope.winner["author"].toString();
//     scope.rating = scope.winner["rating"]["average"]/2;
//     var ratingElement=angular.element(".my-rating-1");
//     ratingElement.starRating({
//         initialRating: scope.rating,
//         readOnly: true,
//         totalStars: 5,
//         starSize: 12,
//         emptyColor: 'lightgray',
//         hoverColor: 'salmon',
//         activeColor: 'crimson',
//         useGradient: false
//     });
//
// };
var sectionid = 1;
var choosenCallBack = function (data) {
    var alt = data["alt"].toString();
    var bookid = alt.slice(-9, -1);
    var scope = findByBookClass(bookid);
    scope.complete();
    choosenToDo(data);
};
var choosenReviewsCallBack = function (data) {

    var scope = findBySectionId(sectionid);
    scope.reviewsList = data["reviews"];

}


var choosenToDo = function (data) {
    var alt = data["alt"].toString();
    var bookid = alt.slice(-9, -1);
    var scope = findByBookClass(bookid);
    scope.book = data;
    scope.bookAuthor = scope.book["author"].toString();
    scope.bookRating = scope.book["rating"]["average"] / 2;
    scope.tags = scope.book["tags"];
    angular.element(".my-rating-2").starRating({
        initialRating: scope.bookRating,
        readOnly: true,
        totalStars: 5,
        starSize: 12,
        emptyColor: 'lightgray',
        hoverColor: 'salmon',
        activeColor: 'crimson',
        useGradient: false
    });
}
// var winnerToDo = function (data) {
//     var scope = find();
//     scope.winner = data;
//     scope.winnerImg = scope.winner["images"]["large"];
//     scope.author = scope.winner["author"].toString();
//     scope.rating = scope.winner["rating"]["average"]/2;
//     var ratingElement=angular.element(".my-rating-1");
//     ratingElement.starRating({
//         initialRating: scope.rating,
//         readOnly: true,
//         totalStars: 5,
//         starSize: 12,
//         emptyColor: 'lightgray',
//         hoverColor: 'salmon',
//         activeColor: 'crimson',
//         useGradient: false
//     });
// };
// var find = function (bookid) {
//     var elementid="#"+bookid;
//     var appElement = document.querySelector('[ng-controller=topScoerController]');
//     var element = angular.element(elementid)[0];
//     var controllerId=element.attributes[2].nodeValue;
//     sectionid=controllerId;
//     var $scope = angular.element(appElement).scope();
//     var i=1;
//     for(i;i<controllerId;i++){
//         $scope=$scope.$$nextSibling;
//     }
//     return $scope;
// };

var findByBookClass = function (bookid) {
    var elementclass = "." + bookid;
    var element = angular.element(elementclass);
    sectionid = element[0].parentNode.parentNode.parentNode.parentNode.attributes[2].nodeValue;
    var $scope = element.scope().$parent;
    return $scope;
}
var findBySectionId = function (sectionid) {
    var appElement = document.querySelector('[ng-controller=topScoerController]');
    var $scope = angular.element(appElement).scope();
    var i = 1;
    for (i; i < sectionid; i++) {
        $scope = $scope.$$nextSibling;
    }
    return $scope;
};

