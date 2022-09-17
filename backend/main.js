const http = require('http');
const ws = require('ws');
const fs = require('fs');
const { SerialPort } = require("serialport");

// 声明对象
var upData = {
  "systa": 2,
  "temp": 26,
  "hum": 85,
  "valve": false
}
var linkInfo =
{
  "path": "null",
  "baudRate": null,
}



// 配置文件读取部分
var configData = fs.readFileSync('config.json');
configData = JSON.parse(configData.toString());
linkInfo.path = configData.path;
linkInfo.baudRate = configData.baudRate;



// 串口连接部分
var port = new SerialPort({
  path: linkInfo.path,
  baudRate: linkInfo.baudRate,
  autoOpen: false,
})

port.open(function (err) {
  if (err) {
    console.log('连接失败');
    upData.systa = 2;
    return console.log('err:', err.message);
  }
  upData.systa = 0;
  port.write('main screen turn on')
})

port.on('data', function (data) {
  data = data.toString()
  upData.temp = data[0] + data[1]
  upData.hum = data[5] + data[6]
  console.log(upData);
})



// websocket连接部分
const wss = new ws.Server({ noServer: true });

// 请求头的预拦截。
function accept (req, res) {
  // all incoming requests must be websockets
  if (!req.headers.upgrade || req.headers.upgrade.toLowerCase() != 'websocket') {
    res.end();
    return;
  }

  // can be Connection: keep-alive, Upgrade
  if (!req.headers.connection.match(/\bupgrade\b/i)) {
    res.end();
    return;
  }

  //   接受请求的回调函数
  wss.handleUpgrade(req, req.socket, Buffer.alloc(0), onConnect);
}


function onConnect (ws) {
  // 接受到消息后就发出信息。
  ws.on('message', function (message) {
    let name = "testInfo";
    setInterval(() => {
      console.log(upData);
      ws.send(JSON.stringify(upData))
    }, 3000);
    ws.onmessage = (event) => {
      console.log(event.data);
      webDataAccept(JSON.parse(event.data));
    };

  });

}

if (!module.parent) {
  http.createServer(accept).listen(2333);
} else {
  exports.accept = accept;
}


// 业务部分
function webDataAccept (webData) {
  if (webData.key == 'valvestate') {
    console.log('valvestate');
    valveAlter(webData.states)
  } else if (webData.key == 'portdata') {
    console.log('portdata');
    portInfo(webData.portPata, webData.baudRate)
  }
}

function valveAlter (states) {
  if (states == false) {
    port.write(Buffer.from([0x32, 0x33, 0x33, 0x0d, 0x0a]))
    upData.valve = states
  } else if (states == true) {
    port.write(Buffer.from([0x32, 0x33, 0x33, 0x0d, 0x0a]))
    upData.valve = states
  }
}

function portInfo (portPata, baudRate) {
  linkInfo.path = portPata;
  linkInfo.baudRate = baudRate;
  const data = JSON.stringify(linkInfo)
  fs.writeFile('config.json', data, (err) => {
    if (err) {
      console.log('写入出错');
      throw err;
    }
    console.log("JSON data is saved.");
  });
}