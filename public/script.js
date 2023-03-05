let data_old = "", title_set = "", image_set = "";

fetch('/info')
    .then(response => response.json())
    .then(data => {
        document.getElementById("soundtitle").href = `https://www.google.com/search?q=${data.songtitle}`;
        document.getElementById("soundtitle").target = "_blank";
        document.getElementById("soundtitle").rel = "noopener noreferrer";
        for (let i = 0; i < data.songtitle.length; i++) {
            setTimeout(() => {
                document.getElementById("soundtitle").innerHTML = 'Now Playing: ' + data.songtitle.substring(0, i + 1);
                document.title = data.songtitle.substring(0, i + 1) + ' - TinnerX Radio Proxy';
            }, 50 * i);
        }
        document.getElementsByTagName("img")[0].src = "/proxy-image?url=" + data.image;
        title_set = data.songtitle;
    });

document.getElementsByTagName("audio")[0].src = "/radio";
document.getElementsByTagName("audio")[0].autoplay = true;
document.getElementsByTagName("audio")[0].controls = true;

const socket = io();
socket.on('connect', () => {
    console.log('Connected to server');
});
socket.on('disconnect', () => {
    console.log('Disconnected from server');
});

socket.on('data', (data) => {
    document.getElementById("soundtitle").href = `https://www.google.com/search?q=${data.songtitle}`;
    document.getElementById("soundtitle").target = "_blank";
    document.getElementById("soundtitle").rel = "noopener noreferrer";
    if (title_set !== data.songtitle) {
        for (let i = 0; i < title_set.length; i++) {
            setTimeout(() => {
                document.getElementById("soundtitle").innerHTML = 'Now Playing: ' + title_set.substring(0, (title_set.length - i) - 1);
                document.title = title_set.substring(0, (title_set.length - i) - 1) + ' - TinnerX Radio Proxy';
                if (i === title_set.length - 1) {
                    newtitle();
                }
            }, 50 * i);
        }
    }

    function newtitle() {
        for (let i = 0; i < data.songtitle.length; i++) {
            setTimeout(() => {
                document.getElementById("soundtitle").innerHTML = 'Now Playing: ' + data.songtitle.substring(0, i + 1);
                document.title = data.songtitle.substring(0, i + 1) + ' - TinnerX Radio Proxy';
            }, 50 * i);
        }
        // image update overlay
        if (image_set !== data.image) {
            for (let i = 0; i < 10; i++) {
                setTimeout(() => {
                    document.getElementsByTagName("img")[0].style.opacity = 1 - (i / 10);
                }, 50 * i);

                setTimeout(() => {
                    document.getElementsByTagName("img")[0].src = "/proxy-image?url=" + data.image;
                    document.getElementsByTagName("img")[0].style.opacity = 0;
                }, 1000);
            }

            for (let i = 0; i < 10; i++) {
                setTimeout(() => {
                    document.getElementsByTagName("img")[0].style.opacity = i / 10;
                }, 1000 + (50 * i));
            }
        }
        image_set = data.image;
        title_set = data.songtitle;
        console.log('received: %s', JSON.stringify(data));
    }
});