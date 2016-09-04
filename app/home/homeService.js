(function () {
    'use strict';
    
    angular.module('pdApp')
        .factory('homeService', homeService);
    
    homeService.$inject = ['$http', '$q'];
    function homeService($http, $q) {
        return {
            AdminCheck: function () {
                return $http({
                    method: 'GET',
                    withCredentials: true,
                    url: './api/PDAuth/AdminCheck'
                }).then(function (response) {
                    return response.data;
                }, function (response) {
                    return $q.reject(false);
                });
            },
            GetRequests: function () {
                return $http.get('./api/Requests/GetRequests/')
                    .then(function (response) {
                        return response.data;
                    }, function (response) {
                        return $q.reject(response);
                    });
            }            
        }
    }

}());