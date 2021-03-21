const dbIndexScheme = {
    index: 'project_s6_games',
    body: {
        mappings: {
            properties: {
                id: { type: 'integer' },
                name: { type: 'text' },
                release_date: { type: 'date' },
                english: { type: 'boolean' },
                developer: { type: 'text' },
                publisher: { type: 'text' },
                platforms: { type: 'text' },
                required_age: { type: 'byte' },
                categories: { type: 'text' },
                genres: { type: 'text' },
                steamspy_tags: { type: 'text' },
                achievements: { type: 'short' },
                positive_ratings: { type: 'integer' },
                negative_ratings: { type: 'integer' },
                average_playtime: { type: 'integer' },
                median_playtime: { type: 'integer' },
                owners: { type: 'text' },
                price: { type: 'float' }
            }
        }
    }
};

const objectImport = (data) => ({
    id: data.appid,
    name: data.name,
    release_date: data.release_date,
    english: data.english === '1',
    developer: data.developer.split(';'),
    publisher: data.publisher.split(';'),
    platforms: data.platforms.split(';'),
    required_age: data.required_age,
    categories: data.categories.split(';'),
    genres: data.genres.split(';'),
    steamspy_tags: data.steamspy_tags.split(';'),
    achievements: data.achievements,
    positive_ratings: data.positive_ratings,
    negative_ratings: data.negative_ratings,
    average_playtime: data.average_playtime,
    median_playtime: data.median_playtime,
    owners: data.owners,
    price: data.price
});

module.exports = { objectImport, dbIndexScheme };