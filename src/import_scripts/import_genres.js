const neatCsv = require('neat-csv');
const fs = require('fs');
const path = require('path');


async function parse() {
    const csvPath = path.resolve('csv/steam.csv');
    const parserInfo = require('./steam.js');
    
    const genresSet = new Set();
    const rawCsv = fs.readFileSync(csvPath, { encoding: 'utf8'});
    const csvData = await neatCsv(rawCsv);
    
    for (let data of csvData) {
        parserInfo.objectImport(data).genres.forEach(genre => {
            genresSet.add(genre);
        });
    }
    return Array.from(genresSet).map(genreName => ({ name: genreName }));
}


const dbIndexScheme = {
    index: 'project_s6_genres',
    body: {
        mappings: {
            properties: {
                name: { type: 'text' }
            }
        }
    } 
}

module.exports = { parse, dbIndexScheme };