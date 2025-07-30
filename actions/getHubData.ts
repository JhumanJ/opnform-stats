
interface Hubdata {
    name: string;
    user: string;
    pullCount: number;
    starCount: number;
    dateRegistered: Date;
    lastUpdated: Date;
}

const DOCKER_ENDPOINTS = {
    'opnform-api': 'https://hub.docker.com/v2/repositories/jhumanj/opnform-api',
    'opnform-client': 'https://hub.docker.com/v2/repositories/jhumanj/opnform-client'
};

async function getHubData(): Promise<Hubdata[]> {
    const repositories = Object.keys(DOCKER_ENDPOINTS);
    
    const hubDataPromises = repositories.map(async (repoName) => {
        const hubDataResponse = await fetch(DOCKER_ENDPOINTS[repoName as keyof typeof DOCKER_ENDPOINTS]);
        const hubData = await hubDataResponse.json();

        return {
            name: hubData.name,
            user: hubData.user,
            pullCount: hubData.pull_count,
            starCount: hubData.star_count,
            dateRegistered: new Date(hubData.date_registered),
            lastUpdated: new Date(hubData.last_updated),
        };
    });

    return Promise.all(hubDataPromises);
}

export {
    getHubData,
    DOCKER_ENDPOINTS
}
