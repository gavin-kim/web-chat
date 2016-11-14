"use strict";

angular
    .module("app.chat")
    .component("chatBody", {
        templateUrl: "components/chat-body.html",
        controllerAs: "ctrl",
        controller: ["$scope", "chatService",
            ChatMainController
        ]
    });

function ChatMainController($scope, chatService) {

    var ctrl = this;

    var iconChooser;       // iconChooser plugin
    var validationTooltip; // tooltip

    ctrl.name = "";            // to change a user name
    ctrl.showNameForm = false; // check if name form is shown

    ctrl.messages = chatService.messages;           // message data
    ctrl.roomId = chatService.getCurrentRoomId();   // current room id
    ctrl.iconIndex = chatService.getUserIconIndex(ctrl.roomId); // index of selected icon

    ctrl.send = function(event) {
        // send message
        if (ctrl.inputMessage) {

            chatService.topicMessage(ctrl.roomId, {
                body: ctrl.inputMessage,
                color: ctrl.color
            });
            ctrl.inputMessage  = "";
        }
    };

    // show a modal to change a user name
    ctrl.showNameInput = function() {
        ctrl.showNameForm = true;
    };

    ctrl.changeName = function() {

        // validate a new name
        if (validateName()) {

            chatService.setUserName(ctrl.name).then(
                function (success) {

                },
                function (error) {

                }
            );
            ctrl.cancel();
        }
    };

    ctrl.cancel = function() {
        ctrl.name = "";
        ctrl.showNameForm = false;
    };

    ctrl.openFileChooser = function() {
        var chooser = document.querySelector("#file-chooser");
        chooser.click();
    };

    var popoverContent = function() {

        var table = document.createElement("table");
        var index = 1;

        for (var i = 0; i < 5; i++) {

            var row = document.createElement("tr");

            for (var j = 0; j < 5; j++) {

                var cell = document.createElement("td");
                var img = document.createElement("img");

                cell.appendChild(img);
                img.setAttribute("id", "input-icon-img");
                img.setAttribute("class", "img-circle");
                img.setAttribute("index", "" + index);
                img.setAttribute("src", "icons/" + index++ + ".png");

                // click event
                cell.addEventListener("click", function (event) {

                    var index = event.target.getAttribute("index");
                    chatService.setIcon(index);
                    ctrl.iconIndex = index;

                    $(iconChooser).popover("hide");
                });

                row.appendChild(cell);
            }
            table.appendChild(row);
        }

        var el = document.createElement("div");
        el.appendChild(table);

        return el;
    };


    var validateName = function() {

        if (ctrl.name.match("^\\w{2,16}$")) {
            $(validationTooltip).tooltip("hide");
            return true;
        }
        else {
            $(validationTooltip).tooltip("show");
            return false;
        }

    };

    var init = function() {

        $scope.$on("roomSelected", function(event, roomId) {
            ctrl.roomId = roomId;
            ctrl.iconIndex = chatService.getUserIconIndex(roomId);
        });

        iconChooser = $("#input-icon-chooser").popover({
            placement: "top",    // position
            container: 'body',   // append the popover to a specific element.
            html: true,          // allow to insert HTML in the content
            content: popoverContent()
        });

        // register tooltip for validation
        validationTooltip = $("#input-change-name").tooltip({
            placement: "top",
            title: "Please enter 2 ~ 16 letters or numbers for the user name.",
            trigger: "manual"
        });
    };

    init();
}