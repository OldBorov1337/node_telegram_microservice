'use strict';

const {nanoid} = require('nanoid');



class UserServ {
    constructor(UserRepo){
        this.UserRepo = UserRepo; 
    }

    _normalizePlatform(platform) {
        const p = String(platform || 'unknown').toLowerCase();
        if (['desktop', 'web','ios', 'android', 'unknown'].includes(p))return p;
        return 'unknown';
    }

    _NewUser({UserId, name, username, platform, specdata, source}){
        const now = Date.now();
        return {
            _id: `user: ${UserId}`,
            UserId,
            name: String(name || 'unknown'),
            username: username ? String(username) : null,
            randId: nanoid(12),
            platform: this._normalizePlatform(platform),
            specdata: specdata ?? null,
            createdAt: now,
            uptadetAt: now,
            lastViewAt: now,
            status: 'active',
            tags: [],
            source: String(source),
            version: 1,
        };


    }

    async newFromConsole({UserId, name, username, platform, specdata}){
        const id = Number(UserId);
        const existing = await this.UserRepo.getById(id);
        const now = Date.now();
        if(!existing) {
            const doc = this._NewUser({
                UserId: id,
                name, 
                username,
                platform,
                specdata,
                source: 'console'
            });
            return await this.UserRepo.put(doc);
        }
        const updated = {
            ...existing,
            name: String(name || existing.name),
            username: username === undefined ? existing.username : (username ? String(username) : null),
            platform: platform === undefined ? existing.platform : this._normalizePlatform(platform),
            specdata: specdata === undefined ? existing.specdata : specdata,
            uptadetAt: now,
            lastViewAt: now,
            source: existing.source || 'console',
        };
        return await this.UserRepo.put(updated);

    }

    _nameBuildTG(user){
        const first = user.first_name || 'null';
        // const last = user.last_name || 'null';
        // const fullname = `${first} ${last}`.trim();
        return first || 'unknown';
    }

    async upsertTgUser(user){
        const id = Number(user.id);
        const existing = await this.UserRepo.getById(id);
        const now = Date.now();
        if(!existing) {
            const doc = this._NewUser({
                UserId: id,
                name: this._nameBuildTG(user),
                username: user.username ? String(user.username) : null,
                platform: 'unknown',
                specdata: null,
                source: 'telegram'
            });
            return await this.UserRepo.put(doc);
        }
        const updated = {
            ...existing,
            name: this._nameBuildTG(user),
            username: user.username ? String(user.username): null,
            lastViewAt: now,
            uptadetAt: now,
            source: existing.source || 'telegram'
        };
        return await this.UserRepo.put(updated);

    }

    async setNewStatus(UserId, status){
        const id = Number(UserId);
        const existing = await this.UserRepo.getById(id);
        if(!existing) return null;

        const now = Date.now();
        const updated = {
            ...existing,
            status,
            uptadetAt: now,
            lastViewAt: now,
        };
        return await this.UserRepo.put(updated);


    }

    async addTag(UserId, tag) {
        const id = Number(UserId);
        const t = String(tag || '').trim();
        const existing = await this.UserRepo.getById(id);
        if(!existing) return null;
        const now = Date.now();
        const tags = Array.isArray(existing.tags) ? existing.tags : [];
        const next = tags.includes(t) ? tags : [...tags, t];
        const updated = {
            ...existing,
            tags: next,
            uptadetAt: now
        };

        return await this.UserRepo.put(updated);

    }

    async deleteTag(UserId, tag){
        const id = Number(UserId);
        const t = String(tag || '').trim();
        const existing = await this.UserRepo.getById(id);
        if(!existing) return null;
        const now = Date.now();
        const tags = Array.isArray(existing.tags) ? existing.tags : [];
        const next = tags.filter(x => x !== t);
        const updated = {
            ...existing,
            tags: next,
            uptadetAt: now
        };

        return await this.UserRepo.put(updated);
    }

    async setPlatform(UserId, platform) {
        const id = Number(UserId);
        const existing = await this.UserRepo.getById(id);
        const now = Date.now();
        const updated = {
            ...existing,
            platform: this._normalizePlatform(platform),
            uptadetAt: now,
            lastViewAt: now
        };
        return await this.UserRepo.put(updated);
    }

    async SetSpec(UserId, specdata){
        const id = Number(UserId);
        const existing = await this.UserRepo.getById(id);
        const now = Date.now();
        const updated = {
            ...existing,
            specdata: specdata ?? null,
            uptadetAt: now,
            lastViewAt: now
        };

        return await this.UserRepo.put(updated);
    }

    async delete(UserId){
        return await this.setNewStatus(UserId, 'deleted');
    }


}

module.exports = {
    UserServ
}