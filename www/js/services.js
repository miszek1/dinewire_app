var baseURL= 'http://localhost:3000/api/v1';
angular.module('starter.services', [])
.factory('MealsService', function ($resource,$localstorage) {
	var token = $localstorage.get('auth');
    return $resource(baseURL + '/meals/:id',{id: "@id"},{
        query: 	{ method: 'GET', isArray: true, headers: {'authentication': token}},
        get: 	{ method: 'GET', headers: {'authentication': token}},
        remove: { method: 'DELETE', headers: {'authentication': token}},
    	update: {
                method: 'PUT',
                transformRequest: formDataObject,
                headers: {'authentication': token, 'Content-Type':undefined, enctype:'multipart/form-data'}
            },
    	save: {
                method: 'POST',
                transformRequest: formDataObject,
                headers: {'authentication': token, 'Content-Type':undefined, enctype:'multipart/form-data'}
            }
    });
})
.factory('MessageService', function ($resource,$localstorage) {
	var token = $localstorage.get('auth');
    return $resource(baseURL + '/messages/:id',{id: "@id"}, {
        query: 	{ method: 'GET', isArray: true, headers: {'authentication': token}},
        get: 	{ method: 'GET', headers: {'authentication': token}},
        save: 	{ method: 'POST', headers: {'authentication': token}},
        remove: { method: 'DELETE', headers: {'authentication': token}}

    });
})
.factory('LoginService', function ($resource) {
    return $resource(baseURL + '/sessions');
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

function formDataObject (data) {
	var fd = new FormData();
	angular.forEach(data, function(value, key) {
		console.log(value,key);
	    fd.append(key, value);
	});
	return fd;
}