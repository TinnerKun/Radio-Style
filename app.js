console.clear();

/* imports modules */
const express = require('express');
const axios = require('axios');
const gis = require('g-i-s');
const { Server } = require('socket.io');
const mysql = require('mysql2');

/* static variables */
const app = express();
const port = process.env.PORT || 80; // port of server
// static variables for radio
const host_header = "TinnerX Radio Proxy 0.0.3"; // header of icecast or shoutcast server
const host_radio = "xxx.xxx.xxx.xxx:xxxxx"; // ip:port of icecast or shoutcast server
const host_protocal = "http"; // http of icecast or shoutcast server
const host_sid = 1; // sid of icecast or shoutcast server
const host_password = "xxxxxx"; // password of icecast or shoutcast server
// static variables for database
const db_host = "xxx.xxx.xxx.xxx"; // host of database
const db_user = "xxxxxx"; // user of database
const db_pass = "xxxxxx"; // password of database
const db_name = "xxxxxx"; // name of database
// static variables for discord webhook
const discord_hook = "https://ptb.discord.com/api/webhooks/1081287201301733518/ByKK5txHcBYZAv6z4vOqybI9BwmfJkObftOZRxGiyguP9-AO5LZgLDpjSW-GpQIatpHN";

// check static variables is empty
if (host_radio == "" || host_protocal == "" || host_sid == "" || host_password == "" || db_host == "" || db_user == "" || db_pass == "" || db_name == "" || discord_hook == "") {
    console.log("[!] Please fill in all the static variables");
    // list of static variables null
    let list_null = [];
    if (host_radio == "") list_null.push("host_radio");
    if (host_protocal == "") list_null.push("host_protocal");
    if (host_sid == "") list_null.push("host_sid");
    if (host_password == "") list_null.push("host_password");
    if (db_host == "") list_null.push("db_host");
    if (db_user == "") list_null.push("db_user");
    if (db_pass == "") list_null.push("db_pass");
    if (db_name == "") list_null.push("db_name");
    if (discord_hook == "") list_null.push("discord_hook");
    // send webhook to discord
    console.log(`[!] ${list_null.join(", ")} is empty`);
    webhook_discord("Server Started", "[!] Please fill in all the static variables [" + list_null.join(", ") + "]", "ff0000");
    console.log("[@] Shutting down server in 5 seconds");
    setTimeout(() => {
        process.exit(1);
    }, 5000);
    return;
}

/* dynamic variables */
let getRadio_data = [], sound_name = "", data_json = {};

/* mysql create connection */
const connection = mysql.createConnection({
    host: db_host,
    user: db_user,
    password: db_pass,
    database: db_name
});

/* express settings */
app.disable("x-powered-by");
app.use((req, res, next) => {
    res.setHeader("x-powered-by", "php/7.4.3");
    next();
});
app.disable("etag");

app.set("view engine", "pug");
app.set("views", "./views");
app.use(express.static("public"));

/* functons start */
start();

function webhook_discord(title, description, color) {
    color = parseInt(color, 16);
    description = `\`\`\`\n${description}\n\`\`\`\nTime : <t:${Math.floor(Date.now() / 1000)}:R>`;
    axios.post(discord_hook, { content: null, embeds: [{ title: title, description: description, color: color, timestamp: new Date() }] }).then((res) => {
        console.log("[+] Webhook sent");
    }
    ).catch((err) => {
        console.log("[!] 429 ratelimit or webhook not found");
    });
}

/* connection database and check TABLE radio_source */
function start() {
    connection.connect((err) => {
        if (err) {
            console.log("[!] Database not connected");
            webhook_discord("Database Connected", "[!] Database not connected", "ff0000");
            console.log("[@] Shutting down server in 5 seconds");
            setTimeout(() => {
                process.exit(1);
            }, 5000);
            return;
        }
        console.log("[+] Database connected");
        webhook_discord("Database Connected", "[+] Connected to database", "a8fe99");
        connection.query("SELECT * FROM radio_source", (err, result) => {
            if (err) {
                console.log("[+] Table not created");
                connection.query("CREATE TABLE radio_source (id INT AUTO_INCREMENT PRIMARY KEY, title VARCHAR(255), image VARCHAR(255))", (err, result) => {
                    console.log("[+] Table created");
                    webhook_discord("Database Connected", "[+] Connected to database and table created", "a8fe99");
                });
            } else {
                console.log("[+] Table already created");
                webhook_discord("Database Connected", "[*] Connected to database and table already created", "43e8d8");
            }
            update_info();
        });
    });
}

function update_info() {
    setInterval(() => {
        axios.get(`${host_protocal}://${host_radio}/stats?sid=${host_sid}&pass=${host_password}&json=1`).then((response) => {
            if (data_json.title === response.data.songtitle) return;
            let title = Buffer.from(response.data.songtitle).toString("base64");
            connection.query(`SELECT * FROM radio_source WHERE title = ?`, [title], (err, result) => {
                if (result.length == 0) {
                    gis(response.data.songtitle, logResults);
                    function logResults(error, results) {
                        results = results.filter((item) => { return item.url.match(/(https?:\/\/.*\.(?:png|jpg|jpeg))/i) });
                        results = results.map((item) => { return { url: item.url.replace(/\\u003d/g, "=").replace(/\\u0026/g, "&") } });
                        if (error) {
                            console.log(error);
                        } else {
                            if (sound_name != response.data.songtitle) {
                                if (process.env.pm_id == 0) {
                                connection.query("INSERT INTO radio_source (title, image) VALUES (?, ?)", [title, results[0] ? results[0].url : "/radio.jpg"], (err, result) => {
                                    if (err) throw err;
                                    console.log("[+] Inserted - " + response.data.songtitle);
                                    data_json = {
                                        title: response.data.songtitle,
                                        image: results[0].url
                                    }
                                    send_data(data_json);
                                });
                                } else {
                                    console.log("[*] Already exists - " + response.data.songtitle);
                                    data_json = {
                                        title: response.data.songtitle,
                                        image: results[0] ? results[0].url : "/radio.jpg"
                                    }
                                    send_data(data_json);
                                }
                                sound_name = response.data.songtitle;
                            }
                        }
                    }
                } else {
                    console.log("[*] Already exists - " + response.data.songtitle);
                    data_json = {
                        title: response.data.songtitle,
                        image: result[0].image
                    }
                    send_data(data_json);
                }
            })
        });
    }, 1000);
}

const server = app.listen(port, () => {
    webhook_discord("Server Started", `[+] Server started on port ${port}`, "a8fe99");
    console.log(`[+] Server started on port ${port}`);
});

const io = new Server(server);

function send_data(data) {
    data = {
        songtitle: data.title,
        image: data.image
    }
    io.sockets.emit("data", data);
}

app.get("/radio", async (req, res) => {
    res.writeHead(200, { "Content-Type": "audio/mpeg" });
    axios.get(`${host_protocal}://${host_radio}/;`, { responseType: "stream", headers: { "user-agent": host_header } }).then((response) => {
        response.data.pipe(res);
    });
});

app.get("/", async (req, res) => {
    res.render("index", {
        title: "Sychan Radio Proxy"
    });
});

app.get("/info", async (req, res) => {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ songtitle: data_json.title, image: data_json.image }));

});

app.get("/proxy-image", async (req, res) => {
    connection.query("SELECT * FROM radio_source WHERE image = ?", [req.query.url], (err, row) => {
        if (row !== undefined) {
            res.writeHead(200, { "Content-Type": "image/jpeg" });
            axios.get(req.query.url, { responseType: "stream", headers: { "user-agent": host_header } }).then((response) => {
                response.data.pipe(res);
            }).catch((err) => {
                res.render("error", {
                    title: "TinnerX Radio Proxy",
                    message: "Image not found. Please contact the administrator. (NEXT#8233)",
                });
            });
        } else {
            res.render("error", {
                title: "TinnerX Radio Proxy",
                message: "Protected image Payload detected. Please contact the administrator. (NEXT#8233)",
            });
        }
    })
});

app.use((req, res) => {
    res.status(404).render("error", {
        title: "TinnerX Radio Proxy",
        message: `404 - Page not found ${req.url.length > 10 ? req.url.slice(0, 10) + "..." + req.url.length : req.url}`,
    });
});

process.on('uncaughtException', (err) => {
    webhook_discord("Server Error", `[!] Uncaught exception: ${err}`, "ff0000");
    console.log('[!] Uncaught exception: ', err);
    process.exit(1);
});
process.on('unhandledRejection', (err) => {
    webhook_discord("Server Error", `[!] Unhandled rejection: ${err}`, "ff0000");
    console.log('[!] Unhandled rejection: ', err);
    process.exit(1);
});
