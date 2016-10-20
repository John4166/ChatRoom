/** Created by John on 2016/10/19.*/
'use strict';
window.onload = function () {
    //ʵ������ʼ�����ǵ�hichat����
    var hichat = new HiChat();
    hichat.init();
};

//�������ǵ�hichat��
var HiChat = function () {
    this.socket = null;
};

//��ԭ�����ҵ�񷽷�
HiChat.prototype = {
    init: function () {//�˷�����ʼ������
        var that = this;
        //console.log(this);//HiChat ԭ�����ϵ�thisָԭ��

        //��������������socket����
        this.socket = io.connect();
        //����socket��connect�¼������¼���ʾ�����Ѿ�����
        this.socket.on('connect', function () {
            //���ӵ�����������ʾ�ǳ������
            document.getElementById('info').textContent = 'get yourself a nickname :)';
            document.getElementById('nickWrapper').style.display = 'block';
            document.getElementById('nicknameInput').focus();
        });


        //�ǳ����õ�ȷ����ť
        document.getElementById('loginBtn').addEventListener('click', function () {
            var nickName = document.getElementById('nicknameInput').value;
            //����ǳ�������Ƿ�Ϊ��
            if (nickName.trim().length != 0) {
                //��Ϊ�գ�����һ��login�¼�����������ǳƷ��͵�������
                that.socket.emit('login', nickName);
            } else {
                //����������ý���
                document.getElementById('nicknameInput').focus();
            }
            ;
        }, false);


        //�ǳƱ�ռ����ʾ�¼�
        this.socket.on('nickExisted', function () {
            document.getElementById('info').textContent = '!nickname is taken, choose another pls'; //��ʾ�ǳƱ�ռ�õ���ʾ
        });

        //�ǳ�δ��ռ�ã���¼�ɹ�
        this.socket.on('loginSuccess', function () {
            document.title = 'hichat | ' + document.getElementById('nicknameInput').value;
            document.getElementById('loginWrapper').style.display = 'none';//�������ֲ����������
            document.getElementById('messageInput').focus();//����Ϣ������ý���
        });


        this.socket.on('system', function (nickName, userCount, type) {
            //�ж��û������ӻ����뿪����ʾ��ͬ����Ϣ
            var msg = nickName + (type == 'login' ? ' joined' : ' left');
            //var p = document.createElement('p');
            //p.textContent = msg;
            //document.getElementById('historyMsg').appendChild(p);
            that._displayMsg('system', msg, 'red')
            //������������ʾ��ҳ�涥��
            document.getElementById('status').textContent = userCount + (userCount > 1 ? ' users' : ' user') + ' online';
        });


        document.getElementById('sendBtn').addEventListener('click', function () {
            var messageInput = document.getElementById('messageInput'),
                msg = messageInput.value,
                color = document.getElementById('colorStyle').value;
            messageInput.value = '';
            messageInput.focus();

            if (msg.trim().length != 0) {
                that.socket.emit('postMsg', msg); //����Ϣ���͵�������
                that._displayMsg('me', msg, color); //���Լ�����Ϣ��ʾ���Լ��Ĵ�����
            }
            ;
        }, false);

        //���ܷ�������������newMsg�¼�
        this.socket.on('newMsg', function (user, msg) {
            that._displayMsg(user, msg);
        });
        //���ܷ���ͼƬ,����js��FileReader()��������ȡͼƬ��base64
        document.getElementById('sendImage').addEventListener('change', function () {
            //����Ƿ����ļ���ѡ��
            if (this.files.length != 0) {
                //��ȡ�ļ�����FileReader���ж�ȡ
                var file = this.files[0],
                    reader = new FileReader();
                if (!reader) {
                    that._displayMsg('system', '!your browser doesn\'t support fileReader', 'red')
                    this.value = '';
                    return;
                }
                reader.onload = function (e) {
                    //��ȡ�ɹ�����ʾ��ҳ�沢���͵�������
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
        //��������
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
        // �����������Ĺ��������ײ�
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
/**���������ʾ��Ϣ�ķ���������Ϳ�ʼʵ���û�֮������칦���ˡ�
 ����Ҳ�ܼ򵥣������������������������emit�����¼���on�����¼���
 ��ô�û�������Ϣ�ķ��ͽ���Ҳ���ᳵ��·�ˡ�**/