"use strict";

angular
    .module("app.chat")
    .component("chatForm", {
        templateUrl: "components/chat-form.html",
        controllerAs: "ctrl",
        controller: ["chatService", "$location",
            ChatFormController
        ]
    });

function ChatFormController(chatService, $location, $uibModalInstance) {

    var ctrl = this;

    // for error message
    ctrl.error = "";

    ctrl.createRoom = function(roomId, password, userName) {

        if (!validateInput(roomId, userName))
            return;

        chatService.createRoom(roomId, password, userName).then(

            function(response) {

                chatService.rooms[roomId] = response.room;
                chatService.subscribe(response.roomId);
                chatService.selectRoom(response.roomId);

                if ($uibModalInstance) {  // check modal binding
                    $uibModalInstance.close(roomId);
                }

                if ($location.path() != "/room")
                    $location.path("/room");
            },
            function(error) {
                // modal message
                ctrl.error = error.body;
            });

    };

    ctrl.joinRoom = function(roomId, password, userName) {

        if (!validateInput(roomId, userName))
            return;

        chatService.joinRoom(roomId, password, userName).then(
            function(response) {

                chatService.rooms[roomId] = response.room;
                chatService.subscribe(response.roomId);
                chatService.selectRoom(response.roomId);

                if ($uibModalInstance)  // check modal binding
                    $uibModalInstance.close(roomId);

                if ($location.path() != "/room")
                    $location.path("/room");
            },
            function(error) {
                // modal message
                ctrl.error = error.body;
            });

    };

    var validateInput = function(roomId, userName) {


        if (!(roomId && roomId.match("^\\w{4,16}$"))) {
            ctrl.error = "Please enter 4 ~ 16 letters or numbers for the room name.";
            return false;
        }

        if (!(userName && userName.match("^\\w{2,16}$"))) {
            ctrl.error = "Please enter 2 ~ 16 letters or numbers for the user name.";
            return false;
        }

        return true;
    };

    var init = function() {

    };

    init();
}