/** Created by John on 2016/10/19.*/
'use strict';
window.onload = function () {
    //实例并初始化我们的hichat程序
    var hichat = new HiChat();
    hichat.init();
};

//定义我们的hichat类
var HiChat = function () {
    this.socket = null;
};

//向原型添加业务方法
HiChat.prototype = {
    init: function () {//此方法初始化程序
        var that = this;
        //console.log(this);//HiChat 原型链上的this指原型

        //建立到服务器的socket连接
        this.socket = io.connect();
        //监听socket的connect事件，此事件表示连接已经建立
        this.socket.on('connect', function () {
            //连接到服务器后，显示昵称输入框
            document.getElementById('info').textContent = 'get yourself a nickname :)';
            document.getElementById('nickWrapper').style.display = 'block';
            document.getElementById('nicknameInput').focus();
        });


        //昵称设置的确定按钮
        document.getElementById('loginBtn').addEventListener('click', function () {
            var nickName = document.getElementById('nicknameInput').value;
            //检查昵称输入框是否为空
            if (nickName.trim().length != 0) {
                //不为空，则发起一个login事件并将输入的昵称发送到服务器
                that.socket.emit('login', nickName);
            } else {
                //否则输入框获得焦点
                document.getElementById('nicknameInput').focus();
            }
            ;
        }, false);


        //昵称被占用提示事件
        this.socket.on('nickExisted', function () {
            document.getElementById('info').textContent = '!nickname is taken, choose another pls'; //显示昵称被占用的提示
        });

        //昵称未被占用，登录成功
        this.socket.on('loginSuccess', function () {
            document.title = 'hichat | ' + document.getElementById('nicknameInput').value;
            document.getElementById('loginWrapper').style.display = 'none';//隐藏遮罩层显聊天界面
            document.getElementById('messageInput').focus();//让消息输入框获得焦点
        });


        this.socket.on('system', function (nickName, userCount, type) {
            //判断用户是连接还是离开以显示不同的信息
            var msg = nickName + (type == 'login' ? ' joined' : ' left');
            //var p = document.createElement('p');
            //p.textContent = msg;
            //document.getElementById('historyMsg').appendChild(p);
            that._displayMsg('system', msg, 'red')
            //将在线人数显示到页面顶部
            document.getElementById('status').textContent = userCount + (userCount > 1 ? ' users' : ' user') + ' online';
        });


        document.getElementById('sendBtn').addEventListener('click', function () {
            var messageInput = document.getElementById('messageInput'),
                msg = messageInput.value,
                color = document.getElementById('colorStyle').value;
            messageInput.value = '';
            messageInput.focus();

            if (msg.trim().length != 0) {
                that.socket.emit('postMsg', msg); //把消息发送到服务器
                that._displayMsg('me', msg, color); //把自己的消息显示到自己的窗口中
            }
            ;
        }, false);

        //接受服务器发送来的newMsg事件
        this.socket.on('newMsg', function (user, msg) {
            that._displayMsg(user, msg);
        });
        //接受发送图片,利用js的FileReader()构造器获取图片的base64
        document.getElementById('sendImage').addEventListener('change', function () {
            //检查是否有文件被选中
            if (this.files.length != 0) {
                //获取文件并用FileReader进行读取
                var file = this.files[0],
                    reader = new FileReader();
                if (!reader) {
                    that._displayMsg('system', '!your browser doesn\'t support fileReader', 'red')
                    this.value = '';
                    return;
                }
                reader.onload = function (e) {
                    //读取成功，显示到页面并发送到服务器
                    this.value = '';
                    that.socket.emit('img', e.target.result);
                    that._displayImage('me', e.target.result);
                };
                reader.readAsDataURL(file);
            }
        }, false);

        this.socket.on('newImg', function (user, img) {
            that._displayImage(user, img);
        });
        //按键操作
        document.getElementById('nicknameInput').addEventListener('keyup', function(e) {
            if (e.keyCode == 13) {
                var nickName = document.getElementById('nicknameInput').value;
                if (nickName.trim().length != 0) {
                    that.socket.emit('login', nickName);
                };
            };
        }, false);
        document.getElementById('messageInput').addEventListener('keyup', function(e) {
            var messageInput = document.getElementById('messageInput'),
                msg = messageInput.value,
                color = document.getElementById('colorStyle').value;
            if (e.keyCode == 13 && msg.trim().length != 0) {
                messageInput.value = '';
                that.socket.emit('postMsg', msg);
                that._displayMsg('me', msg, color);
            };
        }, false);
    },
    _displayMsg: function (user, msg, color) {
        var container = document.getElementById('historyMsg'),
            msgToDisplay = document.createElement('p'),
            date = new Date().toTimeString().substr(0, 8);
        msgToDisplay.style.color = color || '#000';
        msgToDisplay.innerHTML = user + '<span class="timespan">(' + date + '):</span>' + '\n' + msg + '\n';
        container.appendChild(msgToDisplay);
        // 设置内容区的滚动条到底部
        container.scrollTop = container.scrollHeight;
    },

    _displayImage: function (user, imgData, color) {
        var container = document.getElementById('historyMsg'),
            msgToDisplay = document.createElement('p'),
            date = new Date().toTimeString().substr(0, 8);
        msgToDisplay.style.color = color || '#000';
        msgToDisplay.innerHTML = user + '<span class="timespan">(' + date + '): </span> <br/>' + '<a href="' + imgData + '" target="_blank"><img src="' + imgData + '"/></a>';
        container.appendChild(msgToDisplay);
        container.scrollTop = container.scrollHeight;
    }

};
/**有了这个显示消息的方法后，下面就开始实现用户之间的聊天功能了。
 做法也很简单，如果你掌握了上面所描述的emit发送事件，on接收事件，
 那么用户聊天消息的发送接收也就轻车熟路了。**/