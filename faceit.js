const Discord = require("discord.js");
const client = new Discord.Client();

const request = require('request');
const jimp = require('jimp');
const gen_uuid = require('uuid/v4');
const fs = require('fs');

const api_key = fs.readFileSync('facerect_api_token').toString();
const generate_options = img_url => ({
    method: 'GET',
    url: 'https://apicloud-facerect.p.rapidapi.com/process-url.json',
    qs: {
        url: img_url
    },
    headers: {
        'x-rapidapi-host': 'apicloud-facerect.p.rapidapi.com',
        'x-rapidapi-key': api_key,
    }
});

client.on("message", message => {
    if (message.author.bot || message.attachments.size === 0) return;

    const img_url = message.attachments.first().url;
    const filename = gen_uuid() + ".png";

    request(generate_options(img_url), (err, a, body) => {
        if (err) return;

        const {faces: [face, ..._rest]} = JSON.parse(body);

        jimp.read(img_url)
            .then(jimp_img => jimp_img.crop(face.x, face.y, face.width, face.height).writeAsync(filename))
            .then(_ => message.channel.send("", { files: [filename] }))
            .then(_ => fs.unlinkSync(filename))
            .catch(console.log);
    });
});

client.login(fs.readFileSync('faceit_token').toString());