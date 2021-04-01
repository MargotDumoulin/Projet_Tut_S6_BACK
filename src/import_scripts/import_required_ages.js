const neatCsv = require('neat-csv');
const fs = require('fs');
const path = require('path');

async function parse() {
    const csvPath = path.resolve('csv/steam.csv');
    const parserInfo = require('./steam.js');
    
    const agesSet = new Set();
    const rawCsv = fs.readFileSync(csvPath, { encoding: 'utf8'});
    const csvData = await neatCsv(rawCsv);
    
    for (let data of csvData) {
        agesSet.add(parserInfo.objectImport(data).required_age)
    }
    return Array.from(agesSet).map(requiredAge => ({ age: requiredAge }));
}

const dbIndexScheme = {
    index: 'project_s6_required_ages',
    body: {
        mappings: {
            properties: {
                age: { type: 'integer' }
            }
        }
    } 
}

module.exports = { parse, dbIndexScheme };