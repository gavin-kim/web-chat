"use strict";

angular
    .module("app.chat")
    .factory("chatService", [
        "$rootScope", "$q",
        chatService
    ]);

function chatService($rootScope, $q) {

    var service = {};

    // stomp server url
    var serverUrl = "//" + window.location.host + "/stomp";
    var userId = null;       // user stomp session id
    var subscriptions = {};  // topic subscriptions
    var stomp;               // stomp socket
    var deferred;            // $q
    var connected = false;
    var currentRoomId = null;

    // message type
    var TYPE = {
        ACCEPT: "ACCEPT",
        ERROR: "ERROR",
        ROOM_INFO: "ROOM_INFO",
        USER_JOIN: "USER_JOIN",
        USER_LEAVE: "USER_LEAVE",
        MESSAGE: "MESSAGE"
    };

    // message destinations
    var DST = {
        CREATE: "/chat/create",
        JOIN: "/chat/join",
        LEAVE: "/chat/leave",
        ROOM_INFO: "/chat/roomInfo",
        SET_USER_NAME: "/chat/setUserName",
        SET_ICON: "/chat/setIcon",
        TOPIC_SERVER: "/topic/server",
        TOPIC_ROOM: "/topic/room/",
        QUEUE_SERVER: "/user/" + userId + "/queue/server"
    };

    // global values

    service.rooms = {};
    service.unreadCounts = {};
    service.messages = {};


    var topicHandler = function (frame) {

        var message = JSON.parse(frame.body);
        var roomId = message.roomId;

        switch (message.type) {

            case TYPE.ROOM_INFO:
                updateRoomInfo(message.room);
                $rootScope.$apply();
                return;
                break;

            case TYPE.USER_JOIN:
                updateRoomInfo(message.room);

                message.color = "#006c84";
                updateMessage(roomId, message);
                break;

            case TYPE.USER_LEAVE:
                updateRoomInfo(message.room);

                message.color = "#006c84";
                updateMessage(roomId, message);
                break;

            case TYPE.MESSAGE:

                updateMessage(roomId, message);
                break;
        }
        $rootScope.$apply();
    };

    var updateRoomInfo = function(room) {
        service.rooms[room.roomId] = room;
        $rootScope.$broadcast("roomUpdated", service.rooms[room.roomId]);
    };

    var updateMessage = function(roomId, message) {

        message.timeStamp = new Date();
        service.messages[roomId].push(message); // push a new message

        // save message in the local storage
        localStorage.setItem(roomId, JSON.stringify(service.messages[roomId]));

        if (currentRoomId != roomId) {
            service.unreadCounts[roomId]++;
            // save unread counts in the local storage
            localStorage.setItem("uc", JSON.stringify(service.unreadCounts));
        }
    };

    var queueHandler = function(frame) {

        var message = JSON.parse(frame.body);

        switch (message.type) {
            case TYPE.ACCEPT:
                deferred.resolve(message);
                break;
            case TYPE.ERROR:
                deferred.reject(message);
                break;
            case TYPE.ROOM_INFO:
                updateRoomInfo(message.room);
                break;
        }
    };

    var connectCallback = function () {

        // get unread message counts
        var uc = JSON.parse(localStorage.getItem("uc"));

        // subscribe rooms
        angular.forEach(service.rooms, function(room, roomId) {
            service.subscribe(roomId);

            // get massages from the local storage
            var data = localStorage.getItem(roomId);
            service.messages[roomId] = data ? JSON.parse(data) : [];
            service.unreadCounts[roomId] = uc && (roomId in uc) ? uc[roomId] : 0;
        });

        stomp.subscribe(DST.QUEUE_SERVER, queueHandler);

        stomp.subscribe(DST.TOPIC_SERVER, function (frame) {
        });

        $rootScope.$broadcast("stompConnection", connected = true);
        deferred.resolve();
    };

    var errorCallback = function (error) {

        $rootScope.$broadcast("stompConnection", connected = false);
        deferred.reject();
    };

    service.subscribe = function (roomId) {

        // subscribe
        subscriptions[roomId] =
            stomp.subscribe(DST.TOPIC_ROOM + roomId, topicHandler);
        service.messages[roomId] = [];     // initialize message array
        service.unreadCounts[roomId] = 0;  // initialize unreadCounts
    };

    service.unsubscribe = function (roomId) {

        if (roomId in subscriptions) {
            subscriptions[roomId].unsubscribe();  // unsubscribe
            delete subscriptions[roomId];         // delete subscription
            delete service.rooms[roomId];         // delete room
            delete service.messages[roomId];      // delete messages
            delete service.unreadCounts[roomId];
        }
    };

    service.createRoom = function (roomId, password, userName) {

        stomp.send(DST.CREATE, {
            roomId: roomId,
            password: password,
            userName: userName
        });

        deferred = $q.defer();
        return deferred.promise;
    };

    service.joinRoom = function (roomId, password, userName) {

        stomp.send(DST.JOIN, {
            roomId: roomId,
            password: password,
            userName: userName
        });

        deferred = $q.defer();
        return deferred.promise;
    };

    service.leaveRoom = function (roomId) {

        stomp.send(DST.LEAVE, {
            roomId: roomId
        });

        deferred = $q.defer();
        return deferred.promise;
    };

    service.getRoomInfo = function (roomId) {
        stomp.send(DST.ROOM_INFO, {
            roomId: roomId
        }, "");

        deferred = $q.defer();
        return deferred.promise;
    };

    service.setUserName = function(userName) {

        stomp.send(DST.SET_USER_NAME, {
            userId: userId,
            roomId: currentRoomId,
            userName: userName
        }, "");

        deferred = $q.defer();
        return deferred.promise;
    };

    service.setIcon = function (index) {

        stomp.send(DST.SET_ICON, {
            userId: userId,
            roomId: currentRoomId,
            iconIndex: index
        }, "");

        $q.defer().promise.then(
            function(success) {
                service.rooms[currentRoomId].users[userId].iconIndex = index;
            }
        );
    };

    service.getUserIconIndex = function(roomId) {
        return service.rooms[roomId].users[userId].iconIndex;
    };

    service.topicMessage = function (roomId, message) {

        message.sender = userId;                            // session id
        message.user = service.rooms[roomId].users[userId]; // user info
        message.roomId = roomId;                            // room id
        message.type = TYPE.MESSAGE;                // a type of message

        stomp.send(DST.TOPIC_ROOM + roomId, {}, JSON.stringify(message));

    };

    service.countRooms = function() {
        return Object.keys(service.rooms).length;
    };

    service.selectRoom = function(roomId) {

        currentRoomId = roomId;           // update current roomId
        service.unreadCounts[roomId] = 0; // reset unread count
        $rootScope.$broadcast("roomSelected", currentRoomId);
    };

    service.getCurrentRoomId = function() {
        return currentRoomId;
    };

    service.getUserId = function() {
        return userId;
    };

    service.isConnected = function() {
        return connected;
    };

    service.connect = function (sessionId) {

        // userId = http session id
        userId = sessionId;
        DST.QUEUE_SERVER = "/user/" + userId + "/queue/server";

        var socket = new SockJS(serverUrl, {}, {sessionId: function () {
                return userId;  // use the user id for stomp session id
            }
        });

        stomp = Stomp.over(socket);
        stomp.debug = null; // disable debug mode
        stomp.connect({}, connectCallback, errorCallback);

        deferred = $q.defer();
        return deferred.promise;
    };

    return service;
}

