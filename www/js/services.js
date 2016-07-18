angular.module('starter.services', [])
.factory('MealsService', function ($resource,$localstorage,authService) {
    return $resource(baseURL +'/meals/:id',{id: "@id"},{
        my_query:  { method: 'GET', isArray: true, params:{my_meals:true}},
        query: 	{ method: 'GET', isArray: true},
        get: 	{ method: 'GET'},
        remove: { method: 'DELETE'},
    	update: {
                method: 'PUT',
                transformRequest: formDataObject,
                headers: {'Content-Type':undefined, enctype:'multipart/form-data'}
            },
    	save: {
                method: 'POST',
                transformRequest: formDataObject,
                headers: {'Content-Type':undefined, enctype:'multipart/form-data'}
            }
    });
})
.factory('MessageService', function ($resource,$localstorage) {
    return $resource(baseURL + '/messages/:id',{id: "@id"}, {
        query: 	{ method: 'GET', isArray: true},
        get: 	{ method: 'GET'},
        save: 	{ method: 'POST'},
        remove: { method: 'DELETE'}

    });
})
.factory('LoginService', function ($resource) {
    return $resource(baseURL + '/sessions');
})
.factory('authService', function ($http,$resource,$localstorage) {
    return {
        setAuth: function(auth){
            $resource.defaults.headers.common['authentication'] = auth;
            console.log($http.defaults.headers);
            $localstorage.set('auth',auth);
            $http.defaults.headers.common.authentication = auth;

        },
        getAuth:function(){
            return $localstorage.get('auth');
        }
    }
})
.factory('$localstorage', ['$window', function($window) {
  return {
    set: function(key, value) {
      $window.localStorage[key] = value;
    },
    get: function(key, defaultValue) {
      return $window.localStorage[key] || defaultValue;
    },
    setObject: function(key, value) {
      $window.localStorage[key] = JSON.stringify(value);
    },
    getObject: function(key) {
      return JSON.parse($window.localStorage[key] || '{}');
    },
    deleteItem: function (key) {
      $window.localStorage.removeItem(key);
    },
    getAll: function () {
      return $window.localStorage;
    }
  }
}]);
function formDataObject (data,headersGetter) {
    var fd = new FormData();
    angular.forEach(data, function(value, key) {
        fd.append(key, value);
    });
    return fd;
}