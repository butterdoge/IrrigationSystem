const { SerialPort } = require("serialport");
var upData = {
  "systa": 0,
  "temp": 00,
  "hum": 00,
  "valve": false
}

var test = 1

var port = new SerialPort({
  path: 'COM7',
  baudRate: 115200,
  autoOpen: false,
})

port.open(function (err) {
  if (err) {
    console.log('连接失败');
    upData.systa = 0;
    return console.log('err:', err.message);
  }
  upData.systa = 1;
  port.write('main screen turn on')
})

port.on('data', function (data) {
  data = data.toString()
  console.log(data);
  upData.temp = data[0] + data[1]
  upData.hum = data[5] + data[6]
  //console.log(upData);
})

setInterval(() => {
  port.write(Buffer.from([0x30, 0x39, 0x30, 0x0d, 0x0a]));
  console.log('test');
}, 3000);