const dbIndexScheme = {
    index: 'project_s6_steam_media_data',
    body: {
        mappings: {
            properties: {
                id: { type: 'integer' },
                header_image: { type: 'text' },
                screenshots: { type: 'object' },
                background: { type: 'text' },
                movies: { type: 'text' }
            }
        }
    }
};

const objectImport = (data) => ({
    id: data.steam_appid,
    header_image: data.header_image,
    screenshots: JSON.parse(data.screenshots.replace(/'/g, '"')),
    background: data.background,
    movies: data.movies
});

module.exports = { objectImport, dbIndexScheme };