"use strict";

angular
    .module("app.chat")
    .component("chatHeader", {

        templateUrl: "components/chat-header.html",
        controllerAs: "ctrl",
        controller: ["$scope", "chatService",
            ChatHeaderController
        ]
    });

function ChatHeaderController($scope, chatService) {
    var ctrl = this;

    ctrl.connected = chatService.isConnected();

    var init = function() {

        $scope.$on("stompConnection", function(event, connected) {
            ctrl.connected = connected;
            $scope.$apply();
        })
    };

    init();
}