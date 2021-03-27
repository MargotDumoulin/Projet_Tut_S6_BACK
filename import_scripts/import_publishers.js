const neatCsv = require('neat-csv');
const fs = require('fs');
const path = require('path');

async function parse() {
    const csvPath = path.resolve('../csv/steam.csv');
    const parserInfo = require('./steam.js');
    
    const publishersSet = new Set();
    const rawCsv = fs.readFileSync(csvPath, { encoding: 'utf8'});
    const csvData = await neatCsv(rawCsv);
    
    for (let data of csvData) {
        parserInfo.objectImport(data).publisher.forEach(publisher => {
            publishersSet.add(publisher);
        });
    }
    return Array.from(publishersSet).map(publisherName => ({ name: publisherName }));
}

const dbIndexScheme = {
    index: 'project_s6_publishers',
    body: {
        mappings: {
            properties: {
                name: { type: 'text' }
            }
        }
    } 
}

module.exports = { parse, dbIndexScheme };