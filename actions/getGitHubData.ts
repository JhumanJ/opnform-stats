interface GitHubData {
    starsCount: number;
    lastUpdated: Date;
}

const GITHUB_API_URL = 'https://api.github.com/repos/opnform/opnform';

async function getGitHubData(): Promise<GitHubData> {
    const response = await fetch(GITHUB_API_URL, { cache: "no-cache" });
    
    if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status}`);
    }
    
    const repo = await response.json();
    
    return {
        starsCount: repo.stargazers_count,
        lastUpdated: new Date(repo.updated_at)
    };
}

export {
    getGitHubData
}