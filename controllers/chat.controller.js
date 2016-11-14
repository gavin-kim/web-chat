"use strict";

angular
    .module("app.chat")
    .controller("ChatController", [
        "$scope", "chatService", "$http", "$location", "$timeout",
        ChatController]);

function ChatController($scope, chatService, $http, $location, $timeout) {

    var ctrl = this;
    var reconnectCount = 0;
    var statusModal;
    var MAX_COUNT = 3;
    var RECONNECT_DELAY = 1000 * 10;

    // http post request
    var requestUserInfo = function() {

        $http.post("/chat").then(
            function(success) {

                var data = success.data;

                if (data.user && data.user.stompConnected) {

                    chatService.reason = "You already connected the chat server.";
                    $location.path("/error");
                }
                else if (data.user && data.rooms) {

                    // set user data
                    chatService.rooms = data.rooms;
                    chatService.selectRoom(Object.keys(chatService.rooms)[0]);

                    // connect WebSocket(Stomp)
                    connectStomp(data.sessionId, "/room");

                } else {
                    // connect WebSocket(Stomp)
                    connectStomp(data.sessionId, "/form");
                }
            },
            function(error) {
                chatService.reason = "can not receive response from the server.";
                $location.path("/chat/error");
            }
        )
    };

    // connect stomp over websocket
    var connectStomp = function(sessionId, path) {

        // connect when index.html is loaded
        chatService.connect(sessionId).then(
            function(success) {
                reconnectCount = 0;
                $location.path(path);
            }
        )
    };

    // show status modal when connecting
    var showStatusModal = function() {

        statusModal = $("#status-modal").modal({
            backdrop: "static", // doesn't close on click
            keyboard: false
        });

    };

    // hide status modal
    var hideStatusModal = function() {
        if (statusModal)
            $("#status-modal").modal("hide");
    };

    // broadcast message with roomId(Event name) => $on(roomId, message)
    var init = function() {

        $scope.$on("stompConnection", function(event, connected) {

            // connected
            if (connected) {
                hideStatusModal();
            }
            // disconnected: reconnect
            else if (!connected && (reconnectCount < MAX_COUNT)) {

                if (!statusModal)
                    showStatusModal();

                reconnectCount++;
                // reconnect after 10 secs
                $timeout(function() {
                    requestUserInfo();
                }, RECONNECT_DELAY);

            } else { // redirect to the error page

                chatService.reason = "can not connect to the chat server.";

                if (statusModal) {
                    $(statusModal).on("hidden.bs.modal", function (e) {
                        $location.path("/error");
                        $scope.$apply(); // external API event needs angular apply
                    });
                    $(statusModal).modal("hide");
                }
                else
                    $location.path("/error");
            }
        });

        requestUserInfo();
    };

    init();
}