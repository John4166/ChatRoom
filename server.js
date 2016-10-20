/**
 * Created by John on 2016/10/19.
 */
'use strict';
/**
 * 这段是配合前面的测试代码
 //var express = require('express'),
 //    app = express(),
 //    server = require('http').createServer(app),
 //    io = require('socket.io').listen(server);//引入socket.io模块并绑定到服务器
 //
 //app.use('/', express.static(__dirname));  //访问的网页固定在www这个文件夹当中，所以所有文件（js img文件都要放在这里）
 //server.listen(8090);
 //
 ////socket部分
 //io.on('connection', function (socket) {
//    socket.on('foo', function (data) {
//        console.log(data);
//    })
//})

 */



//服务器及页面部分
var express = require('express'),
    app = express(),
    server = require('http').createServer(app),
    io = require('socket.io').listen(server),
    users = [];//保存所有在线用户的昵称
app.use('/', express.static(__dirname));
server.listen(8090);


//socket部分
io.on('connection', function (socket) {
    //昵称设置
    socket.on('login', function (nickname) {
        //如果用户已经存在用户数字了，则调用nickExisted事件
        if (users.indexOf(nickname) > -1) {
            socket.emit('nickExisted');
        } else {
            socket.userIndex = users.length;
            socket.nickname = nickname;
            users.push(nickname);
            socket.emit('loginSuccess');
            //向所有连接到服务器的客户端发送当前登陆用户的昵称
            io.sockets.emit('system', nickname, users.length, 'login');
        }
        ;
    });
    //断开连接的事件
    socket.on('disconnect', function () {
        //将断开连接的用户从users中删除
        users.splice(socket.userIndex, 1);
        //通知除自己以外的所有人
        socket.broadcast.emit('system', socket.nickname, users.length, 'logout');
    });
    //接收新消息
    socket.on('postMsg', function (msg) {
        //将消息发送到除自己外的所有用户
        socket.broadcast.emit('newMsg', socket.nickname, msg);
    });
    //接收用户发来的图片
    socket.on('img', function (imgData) {
        //通过一个newImg事件分发到除自己外的每个用户
        socket.broadcast.emit('newImg', socket.nickname, imgData);
    });
});

/**需要解释一下的是，在connection事件的回调函数中，socket表示的是当前连接到服务器的那个客户端。
 * 所以代码socket.emit('foo')则只有自己收得到这个事件，
 * 而socket.broadcast.emit('foo')则表示向除自己外的所有人发送该事件，
 * 另外，上面代码中，io表示服务器整个socket连接
 * ，所以代码io.sockets.emit('foo')表示所有人都可以收到该事件。*/

