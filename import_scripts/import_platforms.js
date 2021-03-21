const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');

const parse = new Promise((resolve) => {
    const csvPath = path.resolve('../csv/steam.csv');
    const parserInfo = require('./steam.js');
    
    const platformsSet = new Set();
    fs
        .createReadStream(csvPath)
        .pipe(csv())
        .on('data', data => {
            parserInfo.objectImport(data).platforms.forEach(platform => {
                platformsSet.add(platform);
            });
        })
        .on('end', () => {
            resolve(Array.from(platformsSet).map(platformName => ({ name: platformName })));
        });
});

const dbIndexScheme = {
    index: 'project_s6_platforms',
    body: {
        mappings: {
            properties: {
                name: { type: 'text' }
            }
        }
    } 
}

module.exports = { parse, dbIndexScheme };