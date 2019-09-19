var currentVideo = {
    url: null,
    name: null,
    author: null,
    imageUrl: null
};

function getAjax(url, success, err) {
    var xhr = window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject('Microsoft.XMLHTTP');
    xhr.open('GET', url);
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            if (xhr.status == 200) success(xhr.responseText);
            else err(xhr.status);
        }
    };
    xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
    xhr.send();
    return xhr;
}

function postAjax(url, data, success, err) {
    var xhr = window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject('Microsoft.XMLHTTP');
    xhr.open('POST', url);
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            if (xhr.status == 200) success(xhr.responseText);
            else err(xhr.status);
        }
    };
    xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
    xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    xhr.send(data);
    return xhr;
}

function getMediaToken(type) {
    postAjax("download", "URL=" + encodeURIComponent(currentVideo.url) + "&name=" + encodeURIComponent(currentVideo
        .name) + "&type=" + type.toString(), function (data) {
        data = JSON.parse(data);
        downloadMedia(data.requestData, getExtension(type));
    }, function () {
        alert("Request to Server Failed");
    });
}

function getExtension(type) {
    switch (parseInt(type)) {
        case 141: // MP3 256k
            return "mp3";
        case 140: // MP3 128k
            return "mp3";
        case 139: // MP3 48k
            return "mp3";
        case 18: // mp4 360p
            return "mp4";
        case 22: // mp4 720p
            return "mp4";
        case 37: // mp4 1080p
            return "mp4";
        case 38: // mp4 3072p
            return "mp4";
    }
}

function downloadMedia(data, extension) {
    var startTime;
    var downloadedLength = 0;
    var req = window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject('Microsoft.XMLHTTP');
    var progressBar = document.getElementById("progressBar");
    var progressBarContent = document.getElementById("progressBarContent");
    var fileSize = 0;

    var updatePercentage = function (percentage) {
        progressBarContent.style.width = percentage.toString() + "%"
        progressBarContent.setAttribute("data-filled", "Downloading " + percentage.toString() + "% " + getDownloadSpeed());
    }

    var getDownloadSpeed = function () {
        var now = (new Date()).getTime();
        var speed = downloadedLength / (now - startTime);
        return readableByes(speed) + "/S"
    }
    var readableByes = function (bytes) {
        var i = Math.floor(Math.log(bytes) / Math.log(1024)),
            sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

        return (bytes / Math.pow(1024, i)).toFixed(2) * 1 + ' ' + sizes[i];
    }

    req.open("POST", "apiv1", true);
    req.responseType = "blob";
    req.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    req.onprogress = function (e) {
        if (e.lengthComputable) {
            fileSize = e.total;
            downloadedLength = e.loaded;
            updatePercentage(Math.floor(downloadedLength / fileSize * 100));
        }
    };
    req.onloadstart = function (e) {
        updatePercentage(0)
    };
    req.onload = function (event) {
        var blob = req.response;
        var fileName = null;
        var contentType = req.getResponseHeader("content-type");
        fileName = currentVideo.name + "." + extension;
        if (window.navigator.msSaveOrOpenBlob) {
            // Internet Explorer
            window.navigator.msSaveOrOpenBlob(new Blob([blob], {
                type: contentType
            }), fileName);
        } else {
            var el = document.getElementById("target");
            el.href = window.URL.createObjectURL(blob);
            el.download = fileName;
            el.click();
        }
        progressBarContent.setAttribute("data-filled", "Download Completed");

    };
    startTime = (new Date()).getTime();
    req.send("requestData=" + encodeURIComponent(JSON.stringify(data)));
    progressBar.style.display = "block";
}



function isUrlValid(url) {
    var regex = RegExp(
        'http(?:s?):\\/\\/(?:www\\.)?youtu(?:be\\.com\\/watch\\?v=|\\.be\\/)([\\w\\-\\_]*)(&(amp;)?‌​[\\w\\?‌​=]*)?'
    );
    return regex.test(url)
}

function loadVidImage(url) {
    document.getElementById("vidImg").src = url;
}

function typeParser(types) {
    var el = document.getElementById("downloads");
    var got = [];
    for (var i = 0; i < types.length; i++) {
        var type = types[i];
        if (got.includes(type.itag)) continue;
        switch (parseInt(type.itag)) {
            case 141: // M4A 256k but we will just serve it as mp3 ;) sorry tho :( this is bad practice.
                addTypeButton(el, "Sound MP3 256k", 141);
                got.push(type.itag);
                break;
            case 140: // M4A 128k 
                addTypeButton(el, "Sound MP3 128k", 140);
                got.push(type.itag);
                break;
            case 139: // M4A 48k 
                addTypeButton(el, "Sound MP3 48k", 139);
                got.push(type.itag);
                break;
            case 18: // MP4 360p
                addTypeButton(el, "Video/Sound MP4 360p", 18);
                got.push(type.itag);
                break;
            case 22: // MP4 720p
                addTypeButton(el, "Video/Sound MP4 720p", 22);
                got.push(type.itag);
                break;
            case 37: // MP4 1080p
                addTypeButton(el, "Video/Sound MP4 1080p", 37);
                got.push(type.itag);
                break;
            case 38: // MP4 3072p
                addTypeButton(el, "Video/Sound MP4 3072p", 38);
                got.push(type.itag);
                break;
        }
    }
}

function addTypeButton(parent, text, type) {
    parent.innerHTML += text + '&nbsp;&nbsp;<button type="' + type.toString() +
        '"class="btn btn-success" onclick="getMediaToken(\'' + type + '\')">Download Now!</button><br><br>';
}




function loadVidInfo(url) {
    var infoCard = document.getElementById("infocard");
    var loader = document.getElementById("loading");
    infoCard.style.display = "none";
    loader.style.display = "block";
    document.getElementById("progressBar").style.display = "none";
    getAjax("info?URL=" + encodeURIComponent(url), function (data) {
        var data = JSON.parse(data);
        currentVideo.url = url;
        currentVideo.name = data.name;
        currentVideo.author = data.author;
        document.getElementById("vidname").innerText = data.name + " / " + data.author;
        currentVideo.imageUrl = "https://i1.ytimg.com/vi/" + data.id + "/mqdefault.jpg";
        loadVidImage(currentVideo.imageUrl);
        document.getElementById("downloads").innerHTML = "";
        typeParser(data.formats);
        loader.style.display = "none";
        infoCard.style.display = "block";
    }, function () {
        loader.style.display = "none";
        alert("Request to Server Failed");
    });
}

document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("nextButton").addEventListener("click", function () {
        if (!isUrlValid(document.getElementById("vidUrl").value)) {
            setTimeout(function () {
                var input = document.getElementById("vidUrl");
                input.style.borderColor = '#f44336';
            }, 150)
        } else {
            setTimeout(function () {
                var input = document.getElementById("vidUrl");
                input.style.borderColor = "#4caf50";
                loadVidInfo(document.getElementById("vidUrl").value);
            }, 150)
        }
    });
});