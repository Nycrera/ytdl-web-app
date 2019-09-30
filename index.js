const express = require('express');
const cors = require('cors');
const ytdl = require('ytdl-core');
const app = express();
const NET_PORT = 4000

const crypto = require('crypto');
const key = crypto.randomBytes(32);
const iv = crypto.randomBytes(16);
const validateString = "valid";

let availability = false;

app.use(express.static('static'))
app.use(cors()); // Cross-Origin Resource Sharing (Needed for cross youtube download redirection)
app.use(express.urlencoded({
    extended: true
}));
//app.enable('trust proxy'); // if Nginx Reverse Proxy used, we have to activate proxy trust.

app.listen(NET_PORT, () => {
    availability = true;
    console.log('Ytdl Server Works !!! At port 4000');
});

app.post('/download', (req, res) => {
    let URL = req.body.URL;
    if (!ytdl.validateURL(URL)) {
        ErrorHandler(1, "Invalid URL", res);
        return;
    }
    res.json({
        status: 0,
        requestData: encrypt(genData(req.ip, URL, req.body.type, req.body.name))
    });

});

app.get('/info', (req, res) => {
    let URL = req.query.URL;
    if (!ytdl.validateURL(URL)) {
        ErrorHandler(1, "Invalid URL", res);
        return;
    }
    ytdl.getInfo(URL, (err, info) => {
        if (err) {
            ErrorHandler(4, "Server Error", res);
            return;
        }
        let infoResponse = {
            name: info.player_response.videoDetails.title,
            id: info.player_response.videoDetails.videoId,
            length: info.player_response.videoDetails.lengthSeconds,
            author: info.player_response.videoDetails.author,
            formats: info.formats
        }
        res.json(infoResponse);
    });
});


app.post('/apiv1', (req, res) => {
    let requestData;
    if (!req.body.requestData || (!(requestData = decryptToObject(JSON.parse(req.body.requestData))))) { // variable assign in statement is intended.
        ErrorHandler(2, "Bad Request", res);
        return;
    }
    if (requestData.ip != req.ip) {
        ErrorHandler(3, "Unauthorized", res);
        return;
    }
    res.header('Content-Disposition', 'attachment; filename="' + requestData.name + '.mp4"');
    res.header('Content-Type', getMimeFromItag(requestData.type));
    serveYtdl(res, requestData.url, requestData.type);
});

app.get('/availability', (req, res) => {
    if (availability) res.send("1");
    else res.send("0");
});

function encrypt(text) {
    let cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key), iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return {
        iv: iv.toString('hex'),
        token: encrypted.toString('hex')
    };
}

function decryptToObject(text) {
    let iv = Buffer.from(text.iv, 'hex');
    let encryptedText = Buffer.from(text.token.replace(/(\r\n|\n|\r)/gm, ""), 'hex');
    let decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(key), iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    let str = decrypted.toString();
    if (str.slice(0, validateString.length) != validateString) {
        return false;
    } else {
        try {
            let obj = JSON.parse(str.slice(validateString.length));
            return obj;
        } catch (e) {
            return false; // If this happens either something wrong with the server or the validateString and key is compromised.
        }
    }
}

function genData(ip, url, type, vidName) {
    return validateString + JSON.stringify({
        ip: ip,
        url: url,
        type: type,
        name: vidName
    });
}

function serveYtdl(res, URL, type) {
    let gotSize = false;
    let media = ytdl(URL, {
        quality: parseInt(type),
        filter: getQualityOfItag(type)
    });
    media.on('progress', (chunkLength, downloaded, total) => {
        if (gotSize) return;
        res.header('Content-Length', total);
        media.pipe(res);
        gotSize = true;
    });
}

function ErrorHandler(code, errorString, res) {
    res.status(418);
    res.json({
        status: code,
        errorString: errorString
    });
}

function getQualityOfItag(itag) {
    switch (parseInt(itag)) {
        case 141: // m4a 256k
            return "audioonly";
        case 140: // m4a 128k
            return "audioonly";
        case 139: // m4a 48k
            return "audioonly";
        case 18: // mp4 360p
            return "audioandvideo";
        case 22: // mp4 720p
            return "audioandvideo";
        case 37: // mp4 1080p
            return "audioandvideo";
        case 38: // mp4 3072p
            return "audioandvideo";
    }
}

function getMimeFromItag(itag) {
    switch (parseInt(itag)) {
        case 141: // m4a 256k
            return "audio/mpeg"
        case 140: // m4a 128k
            return "audio/mpeg"
        case 139: // m4a 48k
            return "audio/mpeg"
        case 18: // mp4 360p
            return "video/mp4"
        case 22: // mp4 720p
            return "video/mp4"
        case 37: // mp4 1080p
            return "video/mp4"
        case 38: // mp4 3072p
            return "video/mp4"
    }
}