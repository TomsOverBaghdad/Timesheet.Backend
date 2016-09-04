(function () {
    'use strict';

    angular.module('aviProject')
		.controller('homeCtrl', homeController);

    homeController.$inject = ['homeService'];
    function homeController(homeService) {
        var vm = this;

    }

}());