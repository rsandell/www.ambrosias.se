
var app = angular.module('ambrosiasApp', ['ngRoute', 'ngResource', 'ngSanitize']);

app.config(function($routeProvider) {
    $routeProvider
        .when('/home', {
            controller: "InfoController",
            templateUrl: "views/home.html"
        })
        .when('/info', {
            controller: "InfoController",
            templateUrl: "views/info.html"
        })
        .when('/blog', {
            controller: "BlogFeedController",
            templateUrl: "views/blog.html"
        })
        .when('/recept', {
            controller: "ReceptController",
            templateUrl: "views/recept-types.html"
        })
        .when('/recept/:typeId', {
            controller: "ReceptController",
            templateUrl: "views/recept-types.html"
        })
        .when('/recept/:typeId/:receptId', {
            controller: "ReceptController",
            templateUrl: "views/recept-types.html"
        })
        .when('/dresscode/', {
            controller: "DresscodeController",
            templateUrl: "views/dresscode/index.html"
        })
        .when('/dresscode/festklanningar', {
            controller: "DresscodeController",
            templateUrl: "views/dresscode/festklanningar.html"
        })
        .when('/dresscode/militar', {
            controller: "DresscodeController",
            templateUrl: "views/dresscode/militar.html"
        })
        .when('/dresscode/frack', {
            controller: "DresscodeController",
            templateUrl: "views/dresscode/frack.html"
        })
        .when('/dresscode/frackklanning', {
            controller: "DresscodeController",
            templateUrl: "views/dresscode/frackklanning.html"
        })
        .when('/dresscode/jackett', {
            controller: "DresscodeController",
            templateUrl: "views/dresscode/jackett.html"
        })
        .when('/dresscode/jackettkvinna', {
            controller: "DresscodeController",
            templateUrl: "views/dresscode/jackettkvinna.html"
        })
        .when('/dresscode/aftonklanning', {
            controller: "DresscodeController",
            templateUrl: "views/dresscode/aftonklanning.html"
        })
        .when('/dresscode/smoking', {
            controller: "DresscodeController",
            templateUrl: "views/dresscode/smoking.html"
        })
        .when('/dresscode/smokingklanning', {
            controller: "DresscodeController",
            templateUrl: "views/dresscode/smokingklanning.html"
        })
        .when('/dresscode/morkkostym', {
            controller: "DresscodeController",
            templateUrl: "views/dresscode/morkkostym.html"
        })
        .when('/dresscode/morkkostymkvinna', {
            controller: "DresscodeController",
            templateUrl: "views/dresscode/morkkostymkvinna.html"
        })
        .when('/dresscode/kavaj', {
            controller: "DresscodeController",
            templateUrl: "views/dresscode/kavaj.html"
        })
        .when('/dresscode/kavajkvinna', {
            controller: "DresscodeController",
            templateUrl: "views/dresscode/kavajkvinna.html"
        })
        .when('/dresscode/casual', {
            controller: "DresscodeController",
            templateUrl: "views/dresscode/casual.html"
        })
        .when('/dresscode/vardaglig', {
            controller: "DresscodeController",
            templateUrl: "views/dresscode/vardaglig.html"
        })
        .otherwise({redirectTo: "/home"});
});

app.factory('ReceptTypesFactory', function($resource) {
    return $resource('http://api.ambrosias.se/recept-types/:id', {id: "@typeId"});
});

app.factory('ReceptOfTypeFactory', function($resource) {
    return $resource('http://api.ambrosias.se/recept-types/:id/recept', {id: "@typeId"});
});

app.factory('ReceptFactory', function($resource) {
    return $resource('http://api.ambrosias.se/recept/:id', {id: "@id"});
});

app.factory('BlogPostsFactory', function($resource){
    return $resource('https://www.googleapis.com/blogger/v2/blogs/7591180733160102020/posts?key=AIzaSyA_5JiGlA2EC6rN9zuGgJnu0n-TNX3amBk&fields=items(id,title,url,selfLink,content,published,author)');
});

app.factory('OnePostFactory', function($resource){
    return $resource('https://www.googleapis.com/blogger/v2/blogs/7591180733160102020/posts/:postId/?key=AIzaSyA_5JiGlA2EC6rN9zuGgJnu0n-TNX3amBk&fields=id,content');
});

app.factory('StyrelseFactory', function($resource) {
    return $resource('http://api.ambrosias.se/styrelse');
});

app.controller("BlogFeedController", function($scope, $filter, BlogPostsFactory, OnePostFactory) {
    $scope.postsLimit=3;
    $scope.displayTitle = function(post) {
        if(post.title == "" || post.title == null) {
            return $filter('date')(new Date(post.published), 'mediumDate');
        } else {
            return post.title;
        }
    };
    $scope.posts = BlogPostsFactory.get({}, function(res){
        var limit = $scope.postsLimit;
        if(res.items.length < limit) {
            limit = res.items.length;
        }
        for(var i = 0; i < limit; i++) {
            OnePostFactory.get({postId: res.items[i].id}, function(post) {
                for (var j = 0; j < limit; j++) {
                    if (res.items[j].id == post.id) {
                        res.items[j].content = post.content;
                    }
                }
            });
        }
    });
    //$scope.thePost = OnePostFactory.get();
});

app.controller("InfoController", function($scope, StyrelseFactory) {
    $scope.styrelse = StyrelseFactory.get();
    //$scope.matrix = ["", ""]["", ""];
});

app.controller("DresscodeController", function($scope) {

});


app.controller("ReceptController", function($scope, $routeParams, ReceptTypesFactory, ReceptOfTypeFactory, ReceptFactory) {
    $scope.selectedType = $routeParams.typeId;
    $scope.receptId = $routeParams.receptId;
    $scope.types = ReceptTypesFactory.query();
    $scope.recept = [];
    $scope.selectedRecept = null;
    $scope.hasSelectedRecept = false;
    if ($scope.selectedType) {
        $scope.recept = ReceptOfTypeFactory.query({id: $scope.selectedType});

    }
    if ($scope.receptId) {
        $scope.selectedRecept = ReceptFactory.get({id: $scope.receptId});
        $scope.hasSelectedRecept = true;
    }
});

app.directive('activeTab', function ($location) {
    return {
      link: function postLink(scope, element, attrs) {
        scope.$on("$routeChangeSuccess", function (event, current, previous) {
            /*  designed for full re-usability at any path, any level, by using
                data from attrs
                declare like this: <li class="nav_tab"><a href="#/home"
                                   active-tab="1">HOME</a></li>
            */

            // this var grabs the tab-level off the attribute, or defaults to 1
            var pathLevel = attrs.activeTab || 1,
            // this var finds what the path is at the level specified
                pathToCheck = $location.path().split('/')[pathLevel],
            // this var finds grabs the same level of the href attribute
                tabLink = attrs.href.split('/')[pathLevel];
            // now compare the two:
            if (pathToCheck === tabLink) {
              element.parent().addClass("active");
            }
            else {
              element.parent().removeClass("active");
            }
        });
      }
    };
  });
app.filter("limit", function() {
    return function(input, limit) {
        if(Array.isArray(input)) {
            if (input.length <= limit) {
                return input;
            } else {
                var arr = new Array();
                for(var i = 0; i < limit; i++) {
                    arr[i] = input[i];
                }
                return arr;
            }
        } else {
            return input;
        }
    };
});
app.filter("brevtagg", function(){
    return function(arr) {
        var m = arr.join('');
        return "<a href='mailto:"+m+"'>"+m+"</a>"
    };
});