let code_fill_str = ["000000", "00000", "0000", "000", "00", "0", ""];
let code = '' + parseInt(Math.random()*1000000);
code = code_fill_str[code.length] + code;

const path = {
    voicePath: "http://172.15.8.6:8502",
    wsPath: `ws://172.15.8.6:8503/websocket/${code}`,
    //语音播放接口
    speechPath:"http://172.15.8.6:8400/",
    sendM:'http://172.15.8.6:8503/fligh-message/fligh/sendMessage2',
    messageService:'172.15.8.6'
}
