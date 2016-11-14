"use strict";

angular
    .module("app.chat")
    .component("chatLayout", {
        bindings: {
            layoutBody: "@" // from routeProvider
        },
        templateUrl: "layout/chat-layout.html",
        controllerAs: "ctrl",
        controller: ["$scope", "chatService",
            ChatLayoutController
        ]
    });

function ChatLayoutController($scope, chatService) {

    var ctrl = this;

    var init = function() {

    };
    init();
}