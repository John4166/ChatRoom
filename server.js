/**
 * Created by John on 2016/10/19.
 */
'use strict';
/**
 * ��������ǰ��Ĳ��Դ���
 //var express = require('express'),
 //    app = express(),
 //    server = require('http').createServer(app),
 //    io = require('socket.io').listen(server);//����socket.ioģ�鲢�󶨵�������
 //
 //app.use('/', express.static(__dirname));  //���ʵ���ҳ�̶���www����ļ��е��У����������ļ���js img�ļ���Ҫ�������
 //server.listen(8090);
 //
 ////socket����
 //io.on('connection', function (socket) {
//    socket.on('foo', function (data) {
//        console.log(data);
//    })
//})

 */



//��������ҳ�沿��
var express = require('express'),
    app = express(),
    server = require('http').createServer(app),
    io = require('socket.io').listen(server),
    users = [];//�������������û����ǳ�
app.use('/', express.static(__dirname));
server.listen(8090);


//socket����
io.on('connection', function (socket) {
    //�ǳ�����
    socket.on('login', function (nickname) {
        //����û��Ѿ������û������ˣ������nickExisted�¼�
        if (users.indexOf(nickname) > -1) {
            socket.emit('nickExisted');
        } else {
            socket.userIndex = users.length;
            socket.nickname = nickname;
            users.push(nickname);
            socket.emit('loginSuccess');
            //���������ӵ��������Ŀͻ��˷��͵�ǰ��½�û����ǳ�
            io.sockets.emit('system', nickname, users.length, 'login');
        }
        ;
    });
    //�Ͽ����ӵ��¼�
    socket.on('disconnect', function () {
        //���Ͽ����ӵ��û���users��ɾ��
        users.splice(socket.userIndex, 1);
        //֪ͨ���Լ������������
        socket.broadcast.emit('system', socket.nickname, users.length, 'logout');
    });
    //��������Ϣ
    socket.on('postMsg', function (msg) {
        //����Ϣ���͵����Լ���������û�
        socket.broadcast.emit('newMsg', socket.nickname, msg);
    });
    //�����û�������ͼƬ
    socket.on('img', function (imgData) {
        //ͨ��һ��newImg�¼��ַ������Լ����ÿ���û�
        socket.broadcast.emit('newImg', socket.nickname, imgData);
    });
});

/**��Ҫ����һ�µ��ǣ���connection�¼��Ļص������У�socket��ʾ���ǵ�ǰ���ӵ����������Ǹ��ͻ��ˡ�
 * ���Դ���socket.emit('foo')��ֻ���Լ��յõ�����¼���
 * ��socket.broadcast.emit('foo')���ʾ����Լ���������˷��͸��¼���
 * ���⣬��������У�io��ʾ����������socket����
 * �����Դ���io.sockets.emit('foo')��ʾ�����˶������յ����¼���*/

