/**
 * Created on 2018/4/26
 * @fileoverview 请填写简要的文件说明.
 * @author westwood (Chen Hua)
 */
const compression = require('compression');
const express = require('express');
const path = require('path');
const app = express();

app.use(compression());

app.use(express.static(path.join(__dirname, 'build')));

app.get('/*', function (req, res) {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

const port = process.env.WEBUI_UI_PORT || 3000;



app.listen(port, function () {
    console.log(`app listening on port `, port);
});

process.on('uncaughtException', (err) => {
    console.error(new Date(), new Error(err));
});

process.on('rejectionHandled', (err) => {
    console.error(new Date(), new Error(err));
});
