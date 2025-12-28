"use strict";

function newBot({token, pollMS, userServ, adminIds}){
    let offset = 0;
    let timer = null;

    async function tg(method, params) {
        const url = `https://api.telegram.org/bot${token}/${method}`;
        const res = await fetch(url, {
            method: 'POST',
            headers: {'content-type': 'application/json'},
            body: JSON.stringify(params || {})
        });
        return await res.json();
    }

    async function handleUpdate(update) {
        const msg = update.message;
        if (!msg) return;
        const text = (msg.text || '').trim();
        const chatId = msg.chat.id;
        const from = msg.from;
        const isAdmin = Array.isArray(adminIds) && adminIds.includes(Number(from.id));

        if (!text) return;

        const parts = text.split(' ');
        const cmd = parts[0];
        const rest = parts.slice(1);

        if (text.startsWith('/start')){
            const doc = await userServ.upsertTgUser(from);
            await tg('sendMessage', {
                chat_id: chatId,
                text: `created/updated profile \nname: ${doc.name}\nusername: ${doc.username || '-'}\nId: ${doc.randomId}`
            });
            return;



        }

        if(text.startsWith('/me')){
          const doc = await userServ.UserRepo.getById(Number(from.id));
          await tg('sendMessage', {
            chat_id: chatId,
            text: doc ? JSON.stringify(doc, null, 2) : 'no profile, write: /start'
          });
          return;
        }

        if(cmd === '/setplatform'){
            const value = rest[0];
            if(!value){
                await tg('sendMessage', {
                    chat_id: chatId,
                    text: 'usage: /setplatform desktop|web|ios|android|unknown'
                    });
                    return;
            }
            const doc = await userServ.setPlatform(Number(from.id), value);
            await tg('sendMessage', {
                chat_id: chatId, 
                text: doc ? `platform: ${doc.platform}` : 'profile not found, use /start'
            });
            return;
        }

        if (cmd === '/setspec') {
            const value = rest.join(' ').trim();
            if(!value) {
                await tg('sendMessage', {
                    chat_id: chatId,
                    text: 'usage: /setspec <text>'
                });
                return;
            }

            const doc = await userServ.SetSpec(Number(from.id), value);
            await tg('sendMessage', {
                chat_id: chatId,
                text: doc ? 'specdata updated successfull' : 'no acc, use /start'
            });
            return;
        }
        

        if(cmd === '/delete' ) {
            const doc = await userServ.delete(Number(from.id));
            await tg('sendMessage', {
                chat_id: chatId,
                text: doc ? 'deleted' : 'no acc, use /start'
            });
            return;
        }

        if (cmd === '/ban' || cmd ==='/unban' ){
            if (!isAdmin){
                await tg('sendMessage', {
                    chat_id: chatId,
                    text: 'u dont have permission to do this'
                });
                return;
            }
            const targetId = Number(rest[0]);
            if(!Number.isFinite(targetId)){
                await tg('sendMessage', {
                    chat_id: chatId,
                    text: 'usage: /ban <UserId> OR /unban <UserId>'
                });
                return;
            }

            const status = cmd ==='/ban' ? 'blocked' : 'active';
            const doc = await userServ.setNewStatus(targetId, status);
            await tg('sendMessage', {
                chat_id: chatId,
                text: doc ? `ok: ${targetId} -> ${status}` : 'user not found, use /start'
            });
            return;
        }

        if(cmd === '/tag'){
            if(!isAdmin){
                await tg('sendMessage', {
                    chat_id: chatId,
                    text: 'u dont have permission'
                });
                return;
            }

            const action = rest[0];
            const targetId = Number(rest[1]);
            const tag = rest.slice(2).join(' ').trim();
            if(!['add', 'rm'].includes(action) || !Number.isFinite(targetId) || !tag){
                await tg('sendMessage', {
                    chat_id: chatId,
                    text: 'usage: /tag add <UserId> <tag> OR /tag rm <UserId> <tag>'
                });
                return;
            }

            const doc = action === 'add' ? await userServ.addTag(targetId, tag) : await userServ.deleteTag(targetId, tag);
            await tg('sendMessage', {
                chat_id: chatId,
                text: doc ? `tags: ${doc.tags.join(', ')}` : 'user not found'
            });
            return;


        }

    }


        async function pollOnce() {
            const resp = await tg('getUpdates', {offset, timeout: 0});
            if (!resp.ok) return;
            const updates = resp.result || [];
            for (const u of updates) {
                await handleUpdate(u);
                if(typeof u.update_id === 'number' && u.update_id >= offset){
                    offset = u.update_id +1;
                }
            }
        }

        function start(){
            if(timer) return;
            timer = setInterval(() => {
                pollOnce().catch(console.error);
            }, pollMS);
        }
        

        function stop() {
            if(!timer) return;
            clearInterval(timer);
            timer = null;
        }

        return {start, stop};
    

    
    }

module.exports = { newBot};