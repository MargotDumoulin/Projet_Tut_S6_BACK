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
    console.log(dbIndexScheme.index);
    const { body: count } = await client.count({ index: dbIndexScheme.index })
    console.log("Documents inserted: ", count)
}

imports.forEach(async importData => {
    const dataset = await importData.parse;

    // We do be slicin the data in 4 parts, because otherwise the Elasticsearch is sous l'eau
    await insertData(dataset.slice(0, dataset.length * 0.25), importData.dbIndexScheme).catch(console.error);
    await insertData(dataset.slice(dataset.length * 0.25, dataset.length * 0.5), importData.dbIndexScheme).catch(console.error);
    await insertData(dataset.slice(dataset.length * 0.5, dataset.length * 0.75), importData.dbIndexScheme).catch(console.error);
    await insertData(dataset.slice(dataset.length * 0.75, dataset.length), importData.dbIndexScheme).catch(console.error);
})


// We do be slicin the data in 4 parts, because otherwise the Elasticsearch is sous l'eau
// await insertData(publishers.slice(0, publishers.length * 0.25), parserInfo).catch(console.error);
// await insertData(publishers.slice(publishers.length * 0.25, publishers.length * 0.5), parserInfo).catch(console.error);
// await insertData(publishers.slice(publishers.length * 0.5, publishers.length * 0.75), parserInfo).catch(console.error);
// await insertData(publishers.slice(publishers.length * 0.75, publishers.length), parserInfo).catch(console.error);



// let gamesObject = {};

// csvNames.forEach((csvName) => {
//     const csvPath = path.resolve('../csv/' + csvName + '.csv');
//     const parserInfo = require('./' + csvName + '.js');
//     const objectData = [];

//     fs
//         .createReadStream(csvPath)
//         .pipe(csv())
//         .on('data', data => {
//             // console.log(parserInfo);
//             objectData.push(parserInfo.objectImport(data));
//         })
//         .on('end', () => {
//             console.log(objectData.length);
//             objectData.forEach(game => {
//                 const mergingObject = {};
//                 mergingObject[game.id] = Object.assign({}, gamesObject[game.id], game);
//                 gamesObject = Object.assign(gamesObject, mergingObject);
//             });

//             console.log("Mabite", Object.values(gamesObject)[0]);
//             // We do be slicin the data in 4 parts, because otherwise the Elasticsearch is sous l'eau
//             // await insertData(objectData.slice(0, objectData.length * 0.25), parserInfo).catch(console.error);
//             // await insertData(objectData.slice(objectData.length * 0.25, objectData.length * 0.5), parserInfo).catch(console.error);
//             // await insertData(objectData.slice(objectData.length * 0.5, objectData.length * 0.75), parserInfo).catch(console.error);
//             // await insertData(objectData.slice(objectData.length * 0.75, objectData.length), parserInfo).catch(console.error);
//         });
// })
