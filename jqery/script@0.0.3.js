document.body.innerHTML='\n    <div class="card">\n        <div class="card-body">\n            <h1>Radio Stream</h1>\n            <a id="soundtitle"></a>\n            <audio></audio>\n            <a id="play">Play</a>\n            <img src="radio.webp" alt="Radio" style="width: 100%;">\n        </div>\n    </div>\n    <footer>\n        <p>\n            <a href="https://github.com/TinnerKun" target="_blank">TinnerKun</a>\n            &copy; 2023 All Rights Reserved.\n        </p>\n    </footer>\n',document.head.innerHTML='\n    <meta charset="UTF-8">\n    <meta http-equiv="X-UA-Compatible" content="IE=edge">\n    <meta name="viewport" content="width=device-width, initial-scale=1.0">\n    <title>Radio Stream</title>\n    <link rel="stylesheet" href="style.css">\n';const e="https://radio.oiioioiiioooioio.download/api/nowplaying/1",t="https://radio.oiioioiiioooioio.download:8000/radio.mp3";let n=null,o=null;document.getElementById("play").style.display="none",document.getElementsByTagName("audio")[0].volume=.1,document.getElementsByTagName("audio")[0].src=t,document.getElementsByTagName("audio")[0].autoplay=!0,document.getElementsByTagName("audio")[0].controls=!0,setInterval((()=>{fetch(e).then((e=>e.json())).then((e=>{o!=e.now_playing.played_at&&(n=e.now_playing,o=e.now_playing.played_at,document.getElementById("soundtitle").innerHTML=n.song.title,document.getElementById("soundtitle").href=`https://www.youtube.com/results?search_query=${encodeURIComponent(n.song.title)}`,document.getElementsByTagName("img")[0].src=n.song.art)}))}),1e3),document.getElementsByTagName("audio")[0].addEventListener("pause",(()=>{document.getElementsByTagName("audio")[0].src==t&&(document.getElementsByTagName("audio")[0].src="",document.getElementsByTagName("audio")[0].controls=!1,document.getElementsByTagName("audio")[0].autoplay=!1,document.getElementById("play").style.display="block")})),document.getElementById("play").addEventListener("click",(()=>{document.getElementsByTagName("audio")[0].src=t,document.getElementsByTagName("audio")[0].controls=!0,document.getElementsByTagName("audio")[0].autoplay=!0,document.getElementById("play").style.display="none"}));