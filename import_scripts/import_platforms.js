const neatCsv = require('neat-csv');
const fs = require('fs');
const path = require('path');

async function parse() {
    const csvPath = path.resolve('../csv/steam.csv');
    const parserInfo = require('./steam.js');
    
    const platformsSet = new Set();
    const rawCsv = fs.readFileSync(csvPath, { encoding: 'utf8'});
    const csvData = await neatCsv(rawCsv);
    
    for (let data of csvData) {
        parserInfo.objectImport(data).platforms.forEach(platform => {
            platformsSet.add(platform);
        });
    }
    return Array.from(platformsSet).map(platformName => ({ name: platformName }));
}

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