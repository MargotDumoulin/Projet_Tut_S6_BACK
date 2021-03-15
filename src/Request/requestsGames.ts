export const requestGamesByName = (page: number, nameGiven: string) => {
    return {
        index: 'project_s6_steam',
        body: {
            "from": ((page * 10) - 10),
            "size": 10,
            query: {
                match: {
                    name: {
                        query: nameGiven,
                        fuzziness: "AUTO"
                    }
                }
            }
        }  
    }
}

export const requestGames = (page: number) => {
    return {
        index: 'project_s6_steam',
        body: {
            "from": ((page * 10) - 10),
            "size": 10,
            sort: [
                {
                    release_date: { "order" : "desc" }
                }
            ]
        }  
    }
}

export const requestGameById = (id: number) => {
    return {
        index: [
            'project_s6_steam', 
            'project_s6_steam_description_data',
            'project_s6_steam_requirements_data',
            'project_s6_steam_media_data'
        ],
        body: {
            query: {
                match: {
                    id: id          
                }
            }
        }
    }
}