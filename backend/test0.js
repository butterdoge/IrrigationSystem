const fs = require('fs');


var linkInfo =
{
  "path": "COM6",
  "baudRate": 115200,
}

// 配置文件读取部分
fs.readFile('config.json', 'utf-8', (err, data) => {
  if (err) {
    console.log('读取失败');
    throw err;
  }
  const test = JSON.parse(data.toString());
  linkInfo.path = test.path;
  linkInfo.baudRate.test.baudRate;
  console.log('读取成功');
  console.log(linkInfo);
});
