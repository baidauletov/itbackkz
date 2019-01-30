angular
  .module('profileModule')
  .component('profileComponent', {
    controller: function($scope,
                         $cookies,
                         $timeout,
                         $http,
                         $rootScope) {

      // $scope.showAddModalFlag = false;
      // $rootScope.searchNav = false;

      $scope.users = [];
      $scope.loading = false;

      $scope.checkboxModel = {
        value1: true,
        value2: false,
        value3: false
      }

      $scope.search = (language, location, checkBox) => {
        
        $scope.loading = true;        
        let data = {
          language,
          location
        }
        console.log('search data ', data);
        console.log('$scope.loading', $scope.loading)

        // which algoritms must be send to check ttf (github: true, fl: true, upwork: false);
        // let cbox = '';

        // for (let key in checkBox) {
        //   if(checkBox[key]){cbox = cbox+'t';}
        //   else {cbox = cbox+'f'; } 
        // }

        cbox = JSON.stringify(checkBox);

        console.log('cbox ',cbox);

        $http.get('/api/search'+ '?language=' + language + '&location=' + location + '&checkbox=' + cbox + '&turn=' + 1) 
             .then(response => {
                if (response.status === 200) {
                  $scope.users = $scope.users.concat(response.data.users);
                  $scope.loading = false;
                }
                console.log('response ', response);
             })
             .catch( err => {
                console.log('error ', err);
             });

        $http.get('/api/search'+ '?language=' + language + '&location=' + location + '&checkbox=' + cbox + '&turn=' + 2) 
             .then(response => {
                if (response.status === 200) {
                  $scope.users = $scope.users.concat(response.data.users);
                  $scope.loading = false;
                  console.log('second respond')
                }
                console.log('response ', response);
             })
             .catch( err => {
                console.log('error ', err);
             });
        
        console.log('$scope.loading', $scope.loading)        
      }
    

    },
    templateUrl: '/profile/profile.html'
  })