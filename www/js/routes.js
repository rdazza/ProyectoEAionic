angular.module('app.routes', [])

.config(function($stateProvider, $urlRouterProvider) {

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider



    .state('login', {
      url: '/login',
      templateUrl: 'templates/login.html',
      controller: 'loginCtrl'
    })


    .state('registro', {
      url: '/register',
      templateUrl: 'templates/registro.html',
      controller: 'registerCtrl'
    })
    .state('edit', {
      url: '/edit',
      params:{
        'objectPlayer': "player"
      },
      templateUrl: 'templates/editar.html',
      controller: 'editarCtrl'
    })
    .state('profile', {
      url: '/page12',
      params:{
        'objectPlayer': "player"
      },
      templateUrl: 'templates/perfil.html',
      controller: 'perfilCtrl'
    })
    .state('ranking', {
      url: '/ranking',
      templateUrl: 'templates/ranking.html',
      controller: 'rankingCtrl'
    })
    .state('menu', {
      url: '/side-menu21',
      abstract:true,
      templateUrl: 'templates/menu.html',
      controller:'menuCtrl'
    })


    .state('menu.torneos', {
      url: '/torneos',
      views: {
        'side-menu21': {
          templateUrl: 'templates/torneos.html',
          controller: 'torneosCtrl'
        }
      }
    })
    .state('menu.mistorneos', {
    url: '/mistorneos',
    views: {
      'side-menu21': {
        templateUrl: 'templates/mistorneos.html',
        controller: 'mistorneosCtrl'
      }
    }
  })
    .state('menu.reservas', {
      url: '/reservas',
      views: {
        'side-menu21': {
          templateUrl: 'templates/reservas.html',
          controller: 'reservasCtrl'
        }
      }
    })
    .state('menu.misreservas', {
      url: '/misreservas',
      views: {
        'side-menu21': {
          templateUrl: 'templates/misreservas.html',
          controller: 'misReservasCtrl'
        }
      }
    })
    .state('menu.close', {
      views: {
        'side-menu21': {
          controller: 'closeCtrl'
        }
      }
    })


    ;

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/login');

});
