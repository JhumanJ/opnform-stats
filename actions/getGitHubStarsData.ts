import moment from "moment";
import prismadb from "@/lib/prismadb";
import { GitHubStarsData } from "@prisma/client";
import { getGitHubData } from "./getGitHubData";

interface GitHubStarsChartData {
    totalStarsCount: number;
    starsAccumulated: { [key: string]: number };
    starsUnique: { [key: string]: number };
}

export async function getGitHubStarsData(currentStarsCount?: number): Promise<GitHubStarsChartData> {
    let starsData = await prismadb.gitHubStarsData.findMany({ 
        orderBy: { date: 'asc' } 
    });

    // If current stars count is provided, try to add/update today's data
    if (currentStarsCount) {
        starsData = insertLiveStarsCount(starsData, currentStarsCount);
    }

    const totalStarsCount = currentStarsCount ? currentStarsCount : (starsData.length === 0 ? 0 : starsData[starsData.length - 1]?.starsTotal || 0);
    const starsAccumulated = getAccumulatedStars(starsData);
    const starsUnique = getUniqueStars(starsData);

    return {
        totalStarsCount,
        starsAccumulated,
        starsUnique
    };
}

function insertLiveStarsCount(starsData: GitHubStarsData[], totalStarsCountToday: number): GitHubStarsData[] {
    // Look if there is a value for today. If so, overwrite the total stars count by the given value.
    let starsDataTodayIndex = starsData.findIndex(sd => moment(sd.date).format("YYYY-MM-DD") == moment(new Date()).format("YYYY-MM-DD"));
    if (starsDataTodayIndex >= 0) {
        starsData[starsDataTodayIndex].starsTotal = totalStarsCountToday;
    } else {
        // If no data for today, create a new entry
        const lastEntry = starsData[starsData.length - 1];
        const lastTotalStars = lastEntry ? lastEntry.starsTotal : 0;
        
        starsData.push({
            id: 'temp-today',
            date: new Date(),
            starsToday: totalStarsCountToday - lastTotalStars,
            starsTotal: totalStarsCountToday
        });
    }

    return starsData;
}

function getAccumulatedStars(starsData: GitHubStarsData[]): { [key: string]: number } {
    const accumulated: { [key: string]: number } = {};
    
    starsData.forEach(data => {
        const dateKey = moment(data.date).format("YYYY-MM-DD");
        accumulated[dateKey] = data.starsTotal;
    });
    
    return accumulated;
}

function getUniqueStars(starsData: GitHubStarsData[]): { [key: string]: number } {
    const unique: { [key: string]: number } = {};
    
    starsData.forEach(data => {
        const dateKey = moment(data.date).format("YYYY-MM-DD");
        unique[dateKey] = data.starsToday;
    });
    
    return unique;
}

// Function to get current GitHub stars count for real-time display
export async function getCurrentGitHubStars(): Promise<number> {
    try {
        const gitHubData = await getGitHubData();
        return gitHubData.starsCount;
    } catch (error) {
        console.error('Failed to fetch current GitHub stars:', error);
        // Fallback to latest database entry
        const latestEntry = await prismadb.gitHubStarsData.findFirst({
            orderBy: { date: 'desc' }
        });
        return latestEntry?.starsTotal || 0;
    }
}