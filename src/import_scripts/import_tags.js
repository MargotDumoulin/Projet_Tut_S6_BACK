const neatCsv = require('neat-csv');
const fs = require('fs');
const path = require('path');

async function parse() {
    const csvPath = path.resolve('csv/steam.csv');
    const parserInfo = require('./steam.js');
    
    const tagsSet = new Set();
    const rawCsv = fs.readFileSync(csvPath, { encoding: 'utf8'});
    const csvData = await neatCsv(rawCsv);
    
    for (let data of csvData) {
        parserInfo.objectImport(data).steamspy_tags.forEach(tag => {
            tagsSet.add(tag);
        });
    }
    return Array.from(tagsSet).map(tagName => ({ name: tagName }));
}

const dbIndexScheme = {
    index: 'project_s6_tags',
    body: {
        settings: {
            analysis: {
                normalizer: {
                    my_normalizer: {
                        type: "custom",
                        char_filter: [],
                        filter: "lowercase"
                    }
                }
            }
        },
        mappings: {
            properties: {
                name: { type: 'keyword', normalizer: "my_normalizer" }
            }
        }
    } 
}

module.exports = { parse, dbIndexScheme };