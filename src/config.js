'use strict';

require('dotenv').config();
const path = require('path');

const config = {
    port: Number(process.env.port || 3020),
    pouchPath: path.join(process.cwd(), process.env.pouch_path || './data/usersdb'),
    tg_token: process.env.tg_token || '',
    poll_ms: Number(process.env.poll_ms || 2000),
    adminIds: (process.env.tg_admin || '').split(',').map(s => s.trim()).filter(Boolean).map(Number).filter(Number.isFinite)
};

module.exports = {
    config
};

