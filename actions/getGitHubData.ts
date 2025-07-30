interface GitHubData {
    starsCount: number;
    lastUpdated: Date;
}

const GITHUB_API_URL = 'https://api.github.com/search/repositories?q=jhumanj/opnform';

async function getGitHubData(): Promise<GitHubData> {
    const response = await fetch(GITHUB_API_URL, { cache: "no-cache" });
    const data = await response.json();
    
    if (!data.items || data.items.length === 0) {
        throw new Error('OpnForm repository not found');
    }
    
    const repo = data.items[0];
    
    return {
        starsCount: repo.stargazers_count,
        lastUpdated: new Date(repo.updated_at)
    };
}

export {
    getGitHubData
}