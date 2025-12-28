'use strict';

class UserRepo{
    constructor(db){
        this.db = db;
    }

    _id(userId){
        return `user: ${userId}`;
    }

    async getById(userId){
        try{
            return await this.db.get(this._id(userId));
        } catch(e) {
            if (e.status === 404){
                return null;
            }
            throw e;
        }
    }

    async put(doc) {
        const res = await this.db.put(doc);
        return {...doc, _rev: res.rev};
    }
}

module.exports = {UserRepo};