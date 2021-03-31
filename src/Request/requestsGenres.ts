export const requestGenres = (page: number) => {
    return {
        index: 'project_s6_genres',
        body: {
            "from": ((page * 10) - 10),
            "size": 10
        }  
    }
}