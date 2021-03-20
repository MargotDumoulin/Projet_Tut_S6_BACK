export const requestPublishersByName = (page: number, nameGiven: string) => {
    return {
        index: 'project_s6_publishers',
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

export const requestPublishers = (page: number) => {
    return {
        index: 'project_s6_publishers',
        body: {
            "from": ((page * 10) - 10),
            "size": 10
        }  
    }
}