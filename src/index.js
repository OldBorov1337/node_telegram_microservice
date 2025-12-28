'use strict';

const express = require('express');
const {config} = require('./config');
// console.log('tg_token loaded:', Boolean(config.tg_token));

const {createDb} = require('./db/pouch');
const {UserRepo} = require('./repo/userRepo');
const {UserServ} = require('./serv/userServ');
const {newBot} = require('./telegram/teleBot');

async function main() {

    const db = createDb(config.pouchPath);
    const userRepo = new UserRepo(db);
    const userServ = new UserServ(userRepo);

    const app = express();

    app.use(express.json());

    app.get('/health', (req, res) => {
        return res.status(200).json({ ok: true });
    });

    app.listen(config.port, () =>{
      console.log(`port: ${config.port}`);
      console.log(`pouch path: ${config.pouchPath}`);
    });

    const info = await db.info();
    console.log('db info (name)', info.db_name);

    if(!config.tg_token){
        console.log('token is empty');
        return;
    }

    const bot = newBot({
        token: config.tg_token,
        pollMS: config.poll_ms,
        userServ,
        adminIds: config.adminIds
    });

    bot.start();
    console.log(`telegram polling started each ${config.tgPollMs}ms`);




}

main().catch(console.error);