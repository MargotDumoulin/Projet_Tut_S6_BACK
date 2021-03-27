const { Client } = require('@elastic/elasticsearch');
const publishersImport = require('./import_publishers.js');
const developersImport = require('./import_developers.js');
const categoriesImport = require('./import_categories.js');
const genresImport = require('./import_genres.js');
const platformsImport = require('./import_platforms.js');
const tagsImport = require('./import_tags.js');
const gamesImport = require('./import_games.js');
const { parserInfo } = require('./steam.js');

const client = new Client({ node: 'http://localhost:9200' });

const imports = [
    gamesImport,
    publishersImport,
    developersImport,
    categoriesImport,
    genresImport,
    platformsImport,
    tagsImport
];

// Inserts data into ElasticSearch
async function insertData(dataset, dbIndexScheme) {
    await client.indices.create(dbIndexScheme, { ignore: [400] })

    const body = dataset.flatMap(doc => [{ index: { _index: dbIndexScheme.index } }, doc])
    const { body: bulkResponse } = await client.bulk({ refresh: true, body })
    
    if (bulkResponse.errors) {
        const erroredDocuments = []
        // The items array has the same order of the dataset we just indexed.
        // The presence of the `error` key indicates that the operation
        // that we did for the document has failed.
        bulkResponse.items.forEach((action, i) => {
            const operation = Object.keys(action)[0]
            if (action[operation].error) {
                erroredDocuments.push({
                    // If the status is 429 it means that you can retry the document,
                    // otherwise it's very likely a mapping error, and you should
                    // fix the document before to try it again.
                    status: action[operation].status,
                    error: action[operation].error,
                    operation: body[i * 2],
                    document: body[i * 2 + 1]
                })
            }
        })
        console.log(erroredDocuments)
    }
}


(async () => {
    for (let importData of imports) {
        const datasetName = importData.dbIndexScheme.index.split('_').reverse()[0].toUpperCase();

        console.log(`------ Parsing ${datasetName} CSV...`);
        const dataset = await importData.parse();
        console.log(`------ ${datasetName} parsed, inserting into Elasticsearch...`);
        
        // If the dataset is small enough, we can insert it directly into Elasticsearch
        // Else we do be slicin the data in multiple parts, because otherwise the Elasticsearch is sous l'eau
        if (dataset.length < 100) {
            await insertData(dataset, importData.dbIndexScheme).catch(console.error);
        } else {
            const NUMBER_OF_PARTS = 20;
            for (let i = 0; i < NUMBER_OF_PARTS; i++) {
                const percentage = 1 / NUMBER_OF_PARTS;
                const dataChunk = dataset.slice(dataset.length * (percentage * i), dataset.length * (percentage * (i+1)));
                await insertData(dataChunk, importData.dbIndexScheme).catch(console.error);
            }
        }

        console.log(`------ ${datasetName} inserted!\n`);
    }

    console.log('++++++ Done.\n');
})();
