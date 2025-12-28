'use strict';

const {config} = require('../config');
const {createDb} = require('../db/pouch');
const {UserRepo} = require('../repo/userRepo');
const {UserService, UserServ} = require('../serv/userServ');

function parseArgs(argv) {
    const out = {};
    for (const a of argv) {
        if (!a.startsWith('--')) continue;
        const [k, ...rest] = a.slice(2).split('=');
        out[k] = rest.join('=');
    }
    return out;
}

async function main() {
    const args = parseArgs(process.argv.slice(2));
   // console.log('argv:', process.argv.slice(2));

    const UserId = args.id;
    const name = args.name;
    const username = args.username;
    const platform = args.platform;
    const specdata = args.spec;

      if (!UserId) { 
        console.error('Usage: --id=123 --name="Name" [--username=x] [--platform=desktop] [--spec="text"]');
        process.exit(1); 
      }

    const db = createDb(config.pouchPath);
    const userRepo = new UserRepo(db);
    const userServ = new UserServ(userRepo);
    const doc = await userServ.newFromConsole({
        UserId,
        name,
        username,
        platform,
        specdata
    });

    console.log('user saved', doc);
    process.exit(0);
  


}

main().catch((e) =>{
    console.error(e);
    process.exit(1);
});