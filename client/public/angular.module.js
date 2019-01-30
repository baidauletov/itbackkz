var app = angular.module('app', ['ngCookies', 
                                 'ui.router',  
                                 'profileModule']);

app.config(function($stateProvider, 
                    $urlRouterProvider, 
                    $locationProvider, 
                    $httpProvider) {
  $locationProvider.html5Mode(true);
  $urlRouterProvider.otherwise('/');

  var states = [
    {
      name: 'index',
      url: '/',
      component: 'profileComponent'
    }
  ];


  states.forEach(state => $stateProvider.state(state));
});