const neatCsv = require('neat-csv');
const fs = require('fs');
const path = require('path');

async function parse() {
    const csvPath = path.resolve('../csv/steam.csv');
    const parserInfo = require('./steam.js');
    
    const developersSet = new Set();
    const rawCsv = fs.readFileSync(csvPath, { encoding: 'utf8'});
    const csvData = await neatCsv(rawCsv);
    
    for (let data of csvData) {
        parserInfo.objectImport(data).developer.forEach(developer => {
            developersSet.add(developer);
        });
    }
    return Array.from(developersSet).map(developerName => ({ name: developerName }));
}

const dbIndexScheme = {
    index: 'project_s6_developers',
    body: {
        mappings: {
            properties: {
                name: { type: 'text' }
            }
        }
    } 
}

module.exports = { parse, dbIndexScheme };