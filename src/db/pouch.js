'use strict';

const pouchdb = require('pouchdb');

function createDb(pouchPath){
    return new pouchdb(pouchPath);
}

module.exports = {
    createDb
};
