const JSON5 = require('json5');
// TODO : use JSON5 everywhere instead, in the future

const objectImport = (data) => {
    try {
        return {
            id: data.steam_appid,
            header_image: data.header_image,
            screenshots: JSON.parse(data.screenshots.replace(/'/g, '"')),
            background: data.background,
            movies: data.movies ? JSON5.parse(data.movies
                                .replace(/True/g, 'true')
                                .replace(/False/g, 'false')) : []
        }
    } catch (e) {
        console.log(data.movies);
        console.log(e);
    }
};

module.exports = { objectImport };

