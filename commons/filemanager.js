const fs = require('fs');
require('dotenv').config({ path: './init/variables.env' });

function writeOrAppendData(data, filename, ws) {
    if (!fs.existsSync(filename)) {
        fs.writeFileSync(filename, data);
        ws.send(JSON.stringify({status: 'first part received'}));
    } else {
        fs.appendFileSync(filename, data);
        ws.send(JSON.stringify({status: 'part received'}));
    }
}

exports.upload = function (ws, name, type) {
    const filename = process.env.UPLOAD_PATH + '/' + name + '.' + type;
    ws.on('message', function(data) {
        if (data instanceof Buffer) { writeOrAppendData(data, filename, ws); }
        else { ws.send(data); };
    }); 
};

exports.download = async function (req, res, name, type) {
    const filename = process.env.UPLOAD_PATH + '/' + name + '.' + type;

    const stat = fs.statSync(filename);
    if (!stat.isFile()) { return; }
  
    //await res.writeHead(206, { 
    //  'Connection':'keep-alive',
    //  'Content-Type':'video/webm',
    //  'Transfer-Encoding':'chunked'
    //  });
  
    const stream = fs.createReadStream(filename);
    stream.pipe(res);
}