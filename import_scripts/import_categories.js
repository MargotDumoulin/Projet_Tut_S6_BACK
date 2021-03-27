const neatCsv = require('neat-csv');
const fs = require('fs');
const path = require('path');


async function parse() {
    const csvPath = path.resolve('../csv/steam.csv');
    const parserInfo = require('./steam.js');
    
    const categoriesSet = new Set();
    const rawCsv = fs.readFileSync(csvPath, { encoding: 'utf8'});
    const csvData = await neatCsv(rawCsv);
    
    for (let data of csvData) {
        parserInfo.objectImport(data).categories.forEach(categorie => {
            categoriesSet.add(categorie);
        });
    }
    return Array.from(categoriesSet).map(categorieName => ({ name: categorieName }));
}


const dbIndexScheme = {
    index: 'project_s6_categories',
    body: {
        mappings: {
            properties: {
                name: { type: 'text' }
            }
        }
    } 
}

module.exports = { parse, dbIndexScheme };