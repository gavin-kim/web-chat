angular
    .module("app.chat")
    .component("chatNav", {
        bindings: {
            refresh: "&"    // bind refresh() from chat-layout component
        },
        templateUrl: "components/chat-nav.html",
        controllerAs: "ctrl",
        controller: ["$scope", "$timeout", "chatService", "$uibModal", "$location",
            ChatNavController
        ]
    });

function ChatNavController($scope, $timeout, chatService, $uibModal, $location) {

    var MODAL_WIDTH = 320;
    var MODAL_HEIGHT = 200;
    var CONFIRM_WIDTH = 200;
    var CONFIRM_HEIGHT = 133;

    var ctrl = this;

    ctrl.userId = chatService.getUserId();
    ctrl.currentRoomId = chatService.getCurrentRoomId();
    ctrl.rooms = {};
    ctrl.users = {};
    ctrl.unreadCounts = {};

    // show a form modal to create / join a room
    ctrl.showFormModal = function() {

        var modal = $uibModal.open({
            animation: true,
            templateUrl: "chatForm.modal",
            controllerAs: "ctrl",
            controller: ["chatService", "$location", "$uibModalInstance",
                ChatFormController
            ]
        });

        modal.rendered.then(function() {

            var dialog = document.querySelector(".modal-dialog");
            dialog.style.margin = 0;
            dialog.style.width = MODAL_WIDTH +'px';
            dialog.style.height = MODAL_HEIGHT + 'px';
            dialog.style.left = ((window.innerWidth - MODAL_WIDTH) / 2 ) + 'px';
            dialog.style.top = ((window.innerHeight - MODAL_HEIGHT) / 2 ) + 'px';

        });

        modal.result.then(
            function(roomId){
                ctrl.selectRoom(roomId); // get roomId and select a room
            },
            function(onDismiss) {
                // modal error
            }
        );
    };

    // show confirm modal when a user leaves a room
    ctrl.showConfirmModal = function(roomId) {

        var modal = $uibModal.open({
            animation: true,
            templateUrl: "confirm.modal",
            controllerAs: "mCtrl",
            controller: ["$uibModalInstance", function($uibModalInstance) {

                var mCtrl = this;

                mCtrl.roomId = roomId;

                mCtrl.yes = function() {

                    chatService.leaveRoom(mCtrl.roomId).then(
                        function (success) {
                            chatService.unsubscribe(mCtrl.roomId);
                            countRooms();
                            $uibModalInstance.close();
                        },
                        function (error) {
                            $uibModalInstance.close();
                        }
                    );
                };

                mCtrl.no = function() {
                    $uibModalInstance.dismiss();
                }
            }]

        });
        modal.rendered.then(function() {

            var dialog = document.querySelector(".modal-dialog");
            dialog.style.margin = 0;
            dialog.style.width = CONFIRM_WIDTH +'px';
            dialog.style.height = CONFIRM_HEIGHT + 'px';
            dialog.style.left = ((window.innerWidth - CONFIRM_WIDTH) / 2 ) + 'px';
            dialog.style.top = ((window.innerHeight - CONFIRM_HEIGHT) / 2 ) + 'px';
        });
        modal.result.then(
            function(success) {
                if (ctrl.count(ctrl.rooms))
                    ctrl.selectRoom();
            }
        )
    };

    // select a room. if no room is selected, the first item is selected
    ctrl.selectRoom = function(roomId) {

        if (!roomId)
            roomId = Object.keys(ctrl.rooms)[0];

        // chat service broadcasts selected room id
        chatService.selectRoom(roomId);
        ctrl.currentRoomId = roomId;
        ctrl.users = ctrl.rooms[roomId].users;
    };

    // count the number of objects
    ctrl.count = function(object) {
        return Object.keys(object).length;
    };

    // load data asynchronously
    var loadData = function() {

        // room data loaded
        if (chatService.countRooms()) {

            ctrl.currentRoomId = chatService.getCurrentRoomId();
            ctrl.rooms = chatService.rooms;
            ctrl.users = ctrl.rooms[ctrl.currentRoomId].users;
            ctrl.unreadCounts = chatService.unreadCounts;

        } else { // check again after 0.5 sec

            $timeout(function () {
                loadData();
            }, 500);
        }
    };

    var countRooms = function() {
        if (chatService.countRooms() > 0 && $location.path() != "/room")
            $location.path("/room");
        else if (chatService.countRooms() <= 0 && $location.path() != "/form")
            $location.path("/form");
    };

    // Controller is instantiated after html is on its place
    var init = function() {

        $scope.$on("roomUpdated", function(event, room) {

            if (ctrl.currentRoomId == room.roomId) {
                ctrl.users = room.users;
            }
        });

        loadData();
    };

    init();
}