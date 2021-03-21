type IncompleteGameInfo = {
    id: number,
    name: string,
    release_date: Date, 
    english: boolean,
    developer: string[],
    publisher: string[],
    platforms: string[],
    required_age: number, 
    categories: string[],
    genres: string[],
    steamspy_tags: string[],
    achievements: number,
    positive_ratings: number,
    negative_ratings: number,
    average_playtime: number,
    median_playtime: number,
    owners: string,
    price: number
}

type Screenshot = {
    id: number,
    path_thumbnail: string,
    path_full: string
}

type CompleteGameInfo = {
    id: number,
    name: string,
    release_date: Date, 
    english: boolean,
    developer: string[],
    publisher: string[],
    platforms: string[],
    required_age: number, 
    categories: string[],
    genres: string[],
    steamspy_tags: string[],
    achievements: number,
    positive_ratings: number,
    negative_ratings: number,
    average_playtime: number,
    median_playtime: number,
    owners: string,
    price: number,
    detailed_description: string,
    about_the_game: string,
    short_description: string,
    pc_requirements?: string,
    mac_requirements?: string,
    linux_requirements?: string,
    minumum: string,
    recommended: string,
    header_image: string,
    screenshots: Screenshot[]
} | {};

type DateFilter = {
    gte?: Date;
    gt?: Date;
    lt?: Date;
    lte?: Date;
};

type RatingFilter = {
    gte?: Date;
    gt?: Date;
    lt?: Date;
    lte?: Date;
};

type Filters = {
    name: string | undefined,
    release_date: DateFilter | undefined,
    developer: [] | undefined,
    publisher: [] | undefined,
    platforms: [] | undefined,
    categories: [] | undefined,
    genres: [] | undefined,
    steamspy_tags: [] | undefined,
    required_age: [] | undefined,
    positive_rating_percent: RatingFilter | undefined
}