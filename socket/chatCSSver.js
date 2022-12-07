var express = require("express");
const { send } = require("process");
var app = express();
var http = require("http").Server(app);
var io = require("socket.io")(http);

app.get("/", function(req,res){
    console.log("client");
    res.sendFile(__dirname + "/chatCSSver.html");
});

var list = {};


io.on("connection", function(socket){
    console.log("connected: ", socket.id);
    socket.on("info2", function(data){
        list[socket.id] = data.nickname;
        // socket의 id가 key가 되고 data.nickname이 value가 되는 것.

        io.emit("notice", data.nickname + "님이 입장하셨습니다.");
        io.emit("list", list);
    });
    
    socket.on("send", function(data){
        console.log("client message : ", data.msg);
        data["is_dm"] = false;
        data["nickname"] = list[socket.id];
        if(data.to == "전체") {
            // socket.emit("send", {msg:msg, to:nick});에서 data.to로 받은 nick
            io.emit("newMessage", data);
        } else {
            data["is_dm"] = true;
            // list안의 key만 불러.
            let socketID = Object.keys(list).find((key)=> { return list[key] === data.to; });
            io.to(socketID).emit("newMessage", data);
            socket.emit("newMessage", data);
        }
    });

    socket.on("disconnect", function(){
        io.emit("notice", list[socket.id] + "님이 퇴장하셨습니다.");
        delete list[socket.id];
    });

    socket.on("chatList", (data) => {
        chatList = data;
        let msg = chatList[chatList.length - 1];
        if (msg.room == currentRoomNo) addChat(msg.sendId, msg.chatContent);
    });

    
    
});

http.listen( 8000, function(){
    console.log("server port : ", 8000);
});