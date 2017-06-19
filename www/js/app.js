// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
//var _base = "http://localhost:3000";
var _base = "http://172.20.10.2:3000";
angular.module('app', ['ionic', 'app.controllers', 'app.routes', 'app.services', 'ngCordovaOauth','ngCordova','ngStorage'])

  .run(function ($ionicPlatform, $rootScope, $ionicLoading, $location, $timeout) {
    $ionicPlatform.ready(function () {
      // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
      // for form inputs)
      if (window.cordova && window.cordova.plugins.Keyboard) {
        cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      }
      if (window.StatusBar) {
        // org.apache.cordova.statusbar required
        StatusBar.styleDefault();
      }
    });
    $rootScope.authktd = false;

    $rootScope.showLoading = function (msg) {
      $ionicLoading.show({
        template: msg || 'Loading',
        animation: 'fade-in',
        showBackdrop: true,
        maxWidth: 200,
        showDelay: 0
      });
    }

    $rootScope.hideLoading = function () {
      $ionicLoading.hide();
    };

    $rootScope.toast = function (msg) {
      $rootScope.showLoading(msg);
      $timeout(function () {
        $rootScope.hideLoading();
      }, 2999);
    };

  }).factory('API', ['$http', '$rootScope', function ($http, $rootScope) {


  var _api = {

    login: function (user) {
      return $http.post(_base + '/users/login', user);
    },
    signup: function (user) {
      return $http.post(_base + '/users/adduser', user);
    },
    signup_oauth: function (user) {
      return $http.post(_base + '/users/register-oauth', user);
    },
    editUser: function (user) {
      return $http.put(_base + '/users/' + $rootScope.idplayer, user);
    },
    getUser: function (iduser) {
      return $http.get(_base + '/users/' + iduser);
    },
    getTorneos: function () {
      return $http.get(_base + '/torneos/alltorneos');
    },
    getReservas: function () {
      return $http.get(_base + '/reservas/allreservas');
    },
    getallUsers: function () {
      return $http.get(_base + '/users/allusers');
    },
    addReserva: function (reserva) {
      return $http.post(_base + '/reservas/addreserva', reserva);
    },
    registerTorneo: function (torneo) {
      return $http.put(_base + '/users/registro-torneo/' + $rootScope.idplayer, torneo);
    },
    AddParticipanteTorneo: function (data) {
      console.log (data)
      var player={
        idplayer:  $rootScope.idplayer
      }
      return $http.put(_base + '/users/addparticipante-torneo/'+data.torneo._id, player);
    },

  };
  return _api;
}]).controller('loginCtrl', ['$rootScope', '$state', '$scope',  'API', '$http', '$ionicModal', '$ionicHistory','$cordovaOauth','$localStorage', function ($rootScope, $state, $scope, api, $http, $ionicModal, $ionicHistory,$cordovaOauth,$localStorage) {


  $scope.login = {
    email: '',
    password: ''
  }
  $scope.loginUser = function () {
    $ionicHistory.clearCache();
    $ionicHistory.clearHistory();
    $rootScope.showLoading("Autenticando..");
    api.login($scope.login).success(function (data) {
      console.log(data)
      $rootScope.idplayer = data.player._id;
      $state.go("menu.torneos");
      $rootScope.hideLoading();
    }).error(function (data) {
      $rootScope.hideLoading();
      $rootScope.toast('Usuario o password incorrecto');
    })

  }


  $scope.register = function () {
    $state.go("registro");
  }
  $scope.loginFacebook = function () {
    $scope.showProfileFacebook= function () {
      $http.get("https://graph.facebook.com/v2.2/me", {
        params: {
          access_token: $localStorage.accessToken,
          fields: "id,name,gender,location,birthday,website,relationship_status,email",
          format: "json"
        }
      }).then(function (result) {
        console.log (result)
        var nb = result.data.name;
        var name = nb.split(/\s+/g);
        console.log(name)
        if (result.data.email==null){
          var idprov= result.data.id.substring(0, 3);
          result.data.email= name[0]+name[1]+idprov+"@upc.es"
          result.data.email = result.data.email.toLowerCase()
        }
        var player = {
          email: result.data.email,
          password: 'soytorbe',
          apellidos: name[1],
          nombre: name[0],
          imageUrl: "https://graph.facebook.com/" + result.data.id + "/picture?type=large",
          idProvider: result.data.id,
        }

        api.signup_oauth(player).success(function (result) {
          console.log(result)
          $scope.login = {
            email: result.email,
            password: 'soytorbe'
          }
          $scope.loginUser($scope.userLogin);
        }).error(function (data, status) {
          $rootScope.hideLoading()
          if (status != 0) {
            $scope.userLogin = {
              email: data.email,
              password: 'soytorbe'
            };
            $scope.loginUser($scope.userLogin);
          }
          else {


          }
        })
      }, function (error) {
        console.log("There was a problem getting your profile.  Check the logs for details.");
      });

    }



    if ($localStorage.hasOwnProperty("accessToken") === true) {
      $scope.showProfileFacebook();
    } else {
      $cordovaOauth.facebook('462983140704904', ["email", "user_website", "user_location", "user_birthday", "user_relationships"]).then(function (result) {
        console.log(result.access_token);
        $localStorage.accessToken = result.access_token;
        $scope.showProfileFacebook();
      }, function (error) {
        console.log(error);
      });
    }

  }

}]).controller('registerCtrl', ['$rootScope', '$state', '$scope', '$cordovaOauth', 'API', '$http', function ($rootScope, $state, $scope, $cordovaOauth, api, $http) {

  $scope.goBack = function () {
    $state.go("login");
  };

  $scope.user = {
    nombre: '',
    apellidos: '',
    email: '',
    password: '',
    dni: '',
    phone: '',
    fechanac: ''

  }


  $scope.registerUser = function () {

    $rootScope.showLoading("Registrando..");
    api.signup($scope.user).success(function (data) {
      console.log(data);
      $rootScope.hideLoading();
      $state.go('login')
    }).error(function (data) {
      $rootScope.hideLoading();
      $rootScope.toast('El usuario ya existe');

    })
  }


}]).controller('torneosCtrl', function ($rootScope,$scope, $ionicLoading, API,$ionicPopup,$state) {

  API.getTorneos().success(function (data) {
    console.log(data);
    for (var i=0; i<data.length; i++){
      var fecha = data[i].fecha.split("T");
        console.log (fecha)
        data[i].fecha= fecha[0];
    }
    $scope.torneos = data;
  }).error(function (data) {
  })
  var myPopup;
  function addInscripcion(){
    console.log ("metermela")
    var torneo= {
      torneo: $scope.torneo
    }
    API.registerTorneo(torneo).success(function (data) {
      console.log (data)
      API.AddParticipanteTorneo(torneo).success(function (data) {
        console.log (data)
        API.getTorneos().success(function (data) {
          console.log(data);
          for (var i=0; i<data.length; i++){
            var fecha = data[i].fecha.split("T");
            console.log (fecha)
            data[i].fecha= fecha[0];
          }
          $scope.torneos = data;
          myPopup.close();
        }).error(function (data) {
        })

      }).error(function (data) {

      })



    }).error(function (data) {


    })
  }
    // When button is clicked, the popup will be shown...
    $scope.showPopup = function(torneo) {
      $scope.showAlert=false;
      var locate=false;
      $scope.torneo = torneo
      console.log ($scope.torneo)
      console.log ( $rootScope.idplayer)
      // Custom popup
      myPopup=  $ionicPopup.show({
        title: torneo.nombre,
        templateUrl: 'registro-torneo.html',
        subTitle: '¿Estás seguro que quieres inscribirte a este torneo?',
        scope: $scope,

        buttons: [
          { text: 'No' }, {
            text: '<b>Sí</b>',
            type: 'button-positive',
            onTap: function(e) {
              console.log ()
              if ($scope.torneo.participantes.length>0) {
                for (var i=0; i<$scope.torneo.participantes.length; i++){
                  if ($scope.torneo.participantes[i].participante._id== $rootScope.idplayer){
                    console.log ("encontrado");
                    locate=true;
                    $scope.torneo["locate"]=true;
                    $scope.showAlert=true;
                    $scope.alert="!!Ya esta registrado en este torneo!!"
                    break;

                  }
                }
                if (locate==false){
                  addInscripcion()
                }
                e.preventDefault();
                //don't allow the user to close unless he enters model...

              }
              else if ($scope.torneo.participantes.length==0){
                addInscripcion()
              }

            }
          }
        ]
      });

    };





}).controller('menuCtrl', ['$rootScope', '$state', '$scope', '$http', 'API', function ($rootScope, $state, $scope, $http, api) {

  $scope.goBack = function () {
    $state.go("menu.posicion");
  };



  api.getUser($rootScope.idplayer).success(function (data) {
    console.log(data)
    $rootScope.player= data;


  }).error(function (data) {

  })
  $scope.seeProfile = function () {
    console.log($scope.player)
    $state.go("profile", {
      objectPlayer: $scope.player
    })
  }

  $scope.editUser = function () {
    $state.go("editar", {
      id: id
    })
  }


}]).controller('mistorneosCtrl', ['$rootScope', '$state', '$scope', 'API', function ($rootScope, $state, $scope, api) {
  $scope.goRanking = function (torneo) {
    $rootScope.idtorneo= torneo._id
    $state.go('ranking')
  }
  api.getTorneos().success(function (data) {
    console.log(data);
    for (var i=0; i<data.length; i++){
      var fecha = data[i].reserva.split("T");
      console.log (fecha)
      data[i].fecha= fecha[0];
    }
    var mistorneos=[]
    for (var i=0; i<data.length; i++){
      console.log("data "+i, data[i]);

      for (var j=0; j<data[i].participantes.length; j++){
        console.log (data[i].participantes[j].participante._id)
        console.log ($rootScope.idplayer)
        if (data[i].participantes[j].participante._id== $rootScope.idplayer){
          mistorneos.push(data[i])
        }
      }
    }
    $scope.torneos = mistorneos;
  }).error(function (data) {
  })

}]).controller('misReservasCtrl', ['$rootScope', '$http', '$state', '$scope', 'API', '$stateParams', function ($rootScope, $http, $state, $scope, api, $stateParams) {

  api.getReservas().success(function (data) {
    console.log (data)
    data= data.filter(function(obj){
      console.log(obj.nombre)
      return obj.nombre._id==$rootScope.idplayer;

    })


    $scope.reservas =data;


  }).error(function (data) {
  })

}]).controller('reservasCtrl', ['$rootScope', '$http', '$state', '$scope', 'API', '$stateParams', function ($rootScope, $http, $state, $scope, api, $stateParams) {
  var days_reg=[];
  var today= new Date();
  var day_1 = new Date();
  day_1.setDate(today.getDate()+1);
  days_reg.push(day_1);
  var day_2 = new Date();
  day_2.setDate(day_1.getDate()+1);
  days_reg.push(day_2);
  var day_3 = new Date();
  day_3.setDate(day_2.getDate()+1);
  days_reg.push(day_3);
  var day_4 = new Date();
  day_4.setDate(day_3.getDate()+1);
  days_reg.push(day_4);
  var day_5 = new Date();
  day_5.setDate(day_4.getDate()+1);
  days_reg.push(day_5);
  var day_6 = new Date();
  day_6.setDate(day_5.getDate()+1);
  days_reg.push(day_6);
  var day_7 = new Date();
  day_7.setDate(day_6.getDate()+1);
  days_reg.push(day_7);
  for (var i=0; i<days_reg; i++){
    days_reg[i]["checked"]=false
  }
  $scope.days_reg= days_reg
  var j;
  api.getReservas().success(function (data) {
    console.log (data)
    $scope.reservas =data;
    for (var i=0; i<$scope.reservas.length; i++){
      var reserva= new Date($scope.reservas[i].fecha).getDate() + '/' + (new Date($scope.reservas[i].fecha).getMonth()+1) + '/' + new Date($scope.reservas[i].fecha).getFullYear()
      console.log (reserva)
      for (j=0; j<days_reg.length; j++){
        var day= new Date(days_reg[j]).getDate() + '/' + (new Date(days_reg[j]).getMonth()+1) + '/' + new Date(days_reg[j]).getFullYear()
        console.log (day)
        if (reserva==day){
          console.log ("encontrado")
          days_reg.splice(j,1)
          break
          j=0;
        }
      }
    }
  }).error(function (data) {
  })

  $scope.selReserva = function (day) {
    $rootScope.dayReg= day;
    console.log ($rootScope.dayReg)
  }
  $scope.addReserva = function (nplayers) {
    console.log (nplayers)
    var reserva={
      nombre: $rootScope.idplayer,
      participantes: nplayers,
      reserva: $rootScope.dayReg
    }
   api.addReserva(reserva).success(function (data) {
    }).error(function (data) {
    })
  }
  $scope.updateSelection = function(position,checked) {
    for (var i=0; i<days_reg.length; i++){
      if (i==position){
        days_reg[position].checked= checked
        $scope.checked = checked;
        $rootScope.dayReg= days_reg[position];
      }
      else{
        days_reg[i].checked= false
      }
    }
  }

}]).controller('rankingCtrl', ['$rootScope', '$state', '$scope', 'API', '$http', '$stateParams', '$ionicHistory', function ($rootScope, $state, $scope, api, $http, $stateParams, $ionicHistory) {

  api.getallUsers().success(function (data) {
    console.log (data);
    console.log ($rootScope.idtorneo);
    var datos=[];
    for (var i=0; i<data.length; i++){
      var data_aux= data[i].torneos.filter(function(obj){
        console.log (obj.torneo._id)
        return obj.torneo._id==$rootScope.idtorneo;
      })
      if (data_aux.length>0){
        if (data_aux[0].resultado!=undefined){
          var user={
            nombre: data[i].nombre,
            apellidos: data[i].apellidos,
            email:data[i].email,
            resultado: data_aux[0].resultado,
          }
          datos.push(user);
        }
        else{
          var user={
            nombre: data[i].nombre,
            apellidos: data[i].apellidos,
            email:data[i].email,
            resultado: 0,
          }
          datos.push(user);
        }
      }


    }
    console.log (datos)
    $scope.rankings= datos

  }).error(function (data) {

  })

  $scope.goBack = function () {
    $state.go("menu.mistorneos");
  };
}]).controller('closeCtrl', ['$rootScope', '$state', '$scope', '$location', '$ionicHistory', function ($rootScope, $state, $scope, $location, $ionicHistory) {


  window.localStorage.clear();

  $ionicHistory.clearCache();
  $ionicHistory.clearHistory();
  $state.go('login', {}, {reload: true});


}]).controller('perfilCtrl', ['$rootScope', '$state', '$scope', '$location', '$ionicHistory', '$stateParams', function ($rootScope, $state, $scope, $location, $ionicHistory, $stateParams) {

  $scope.player = $stateParams.objectPlayer;
  console.log($scope.player);
  $scope.goBack = function () {
    $state.go("menu.posicion");
  };

  $scope.editUser = function () {
    $state.go("edit", {
      objectPlayer: $scope.player
    });
  };
  $scope.goBack = function () {
    $state.go('menu.torneos');
  };

}]).controller('editarCtrl', ['$rootScope', '$state', '$scope', '$http', 'API', '$ionicModal', '$stateParams', function ($rootScope, $state, $scope, $http, api, $ionicModal, $stateParams) {

  $scope.player = $stateParams.objectPlayer;
  console.log($scope.player)
  $scope.editUser = function () {

    $rootScope.showLoading("Actualizando Perfil..");
    api.editUser($scope.player).success(function (data) {
      console.log(data);
      $rootScope.hideLoading();
      $state.go('menu.posicion')
    }).error(function (data) {
      $rootScope.hideLoading();

    })
  }
  $scope.goBack = function () {
    $state.go('profile', {
      objectPlayer: $scope.player
    })
  }


}]);


