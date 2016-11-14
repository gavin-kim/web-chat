"use strict";

angular
    .module("app.chat")
    .config(chatConfig);

chatConfig.$inject = [
    "$locationProvider",
    "$routeProvider"
];

function chatConfig($locationProvider, $routeProvider) {

    // $locationProvider default hash prefix is "!"
    $locationProvider.html5Mode({enabled: true, requireBase: true});

    $routeProvider
        .when("/room", {
            template: "<chat-layout layout-body='layout-body-chat'></chat-layout>"
        })
        .when("/form", {
            template: "<chat-layout layout-body='layout-body-form'></chat-layout>"
        })
        .when("/error", {
            templateUrl: "templates/chat-error.html",
            controllerAs: "ctrl",
            controller: ["chatService", function(chatService) {
                var ctrl = this;
                ctrl.reason = chatService.reason;
            }]
        })
        .otherwise({
            redirectTo: "/"
        });
}