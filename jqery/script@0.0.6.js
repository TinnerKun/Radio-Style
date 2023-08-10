document.body.innerHTML = `
    <div class="card">
        <div class="card-body">
            <h1>Radio Stream</h1>
            <a id="soundtitle"></a>
            <audio></audio>
            <a id="play">Play</a>
            <img src="radio.webp" alt="Radio" style="width: 100%;">
        </div>
    </div>
    <footer>
        <p>
            <a href="https://github.com/TinnerKun" target="_blank">TinnerKun</a>
            &copy; 2023 All Rights Reserved.
        </p>
    </footer>
`

document.head.innerHTML = `
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Radio Stream</title>
    <link rel="stylesheet" href="style.css">
`

const data = "https://radio-main.oiioioiiioooioio.download/api/nowplaying/1"
const sorces = "https://radio-main.oiioioiiioooioio.download/listen/radio-sso/radio.mp3"

let data_store = null
let check_update = null
document.getElementById("play").style.display = "none"

document.getElementsByTagName("audio")[0].volume = 0.1

document.getElementsByTagName("audio")[0].src = sorces
document.getElementsByTagName("audio")[0].autoplay = true;
document.getElementsByTagName("audio")[0].controls = true;

setInterval(() => {
    fetch(data)
        .then(response => response.json())
        .then(data => {
            if (check_update != data['now_playing']['played_at']) {
                console.log(data['now_playing'])
                data_store = data['now_playing']
                check_update = data['now_playing']['played_at']
                document.getElementById("soundtitle").innerHTML = data_store['song']['title']
                document.getElementById("soundtitle").href = `https://www.youtube.com/results?search_query=${data_store['song']['title']}`
                document.getElementsByTagName("img")[0].src = data_store['song']['art']
            }
        })
}, 1000)

document.getElementsByTagName("audio")[0].addEventListener("pause", () => {
    if (document.getElementsByTagName("audio")[0].src == sorces) {
    document.getElementsByTagName("audio")[0].src = ""
    document.getElementsByTagName("audio")[0].controls = false;
    document.getElementsByTagName("audio")[0].autoplay = false;
    document.getElementById("play").style.display = "block"
    }
})

document.getElementById("play").addEventListener("click", () => {
    document.getElementsByTagName("audio")[0].src = sorces
    document.getElementsByTagName("audio")[0].controls = true;
    document.getElementsByTagName("audio")[0].autoplay = true;
    document.getElementById("play").style.display = "none"
})
