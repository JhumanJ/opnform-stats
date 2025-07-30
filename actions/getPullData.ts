import moment from "moment";
import prismadb from "@/lib/prismadb";
import { PullData } from "@prisma/client";

interface RepositoryPullData {
    repository: string;
    totalPullCount: number;
    pullsAccumulated: { [key: string]: number };
    pullsUnique: { [key: string]: number };
}

export async function getPullData(repositoryPullCounts?: { [key: string]: number }): Promise<RepositoryPullData[]> {
    const repositories = ['opnform-api', 'opnform-client'];
    
    const repositoryData = await Promise.all(repositories.map(async (repository) => {
        let pullData = await prismadb.pullData.findMany({ 
            where: { repository },
            orderBy: { date: 'asc' } 
        });

        // When pullCountToday was provided, try and replace the value in the data retrieved from the database.
        const totalPullCountToday = repositoryPullCounts?.[repository];
        if (totalPullCountToday) {
            pullData = insertLivePullCount(pullData, totalPullCountToday, repository);
        }

        const totalPullCount = totalPullCountToday ? totalPullCountToday : (pullData.length === 0 ? 0 : pullData[pullData.length - 1]?.pullsTotal || 0);
        const pullsAccumulated = getAccumulatedPulls(pullData);
        const pullsUnique = getUniquePulls(pullData);

        return {
            repository,
            totalPullCount,
            pullsAccumulated,
            pullsUnique
        };
    }));

    return repositoryData;
}

function insertLivePullCount(pullData: PullData[], totalPullCountToday: number, repository: string): PullData[] {

    // Look if there is a value for today. If so, overwrite the total pull count by the given value.
    let pullDataTodayIndex = pullData.findIndex(pd => moment(pd.date).format("YYYY-MM-DD") == moment(new Date()).format("YYYY-MM-DD"));
    if (pullDataTodayIndex >= 0) {
        pullData[pullDataTodayIndex].pullsTotal = totalPullCountToday!;
    }
    else {

        // Add a new entry for today.
        pullData.push({
            date: new Date(),
            pullsToday: 0,
            pullsTotal: totalPullCountToday,
            id: moment().date().toString(),
            repository: repository
        });

        // Also set the index to the last index (which was just added).
        pullDataTodayIndex = pullData.length - 1;
    }

    // Calculate the difference between yesterday and today.
    const previousDayIndex = pullDataTodayIndex > 0 ? pullDataTodayIndex - 1 : 0;
    pullData[pullDataTodayIndex].pullsToday = totalPullCountToday - pullData[previousDayIndex].pullsTotal;

    return pullData;
}

function getAccumulatedPulls(pullData: PullData[]) {
    const pullsAccumulatedDict: { [key: string]: number; } = {};

    pullData.forEach((element) => {
        const dictKey = moment(element.date).format("YYYY-MM-DD");
        pullsAccumulatedDict[dictKey] = element.pullsTotal;
    });

    const pullsAccumulated = summarizeByDay(pullsAccumulatedDict);
    return pullsAccumulated;
}

function getUniquePulls(pullData: PullData[]) {
    const pullsUniqueDict: { [key: string]: number; } = {};

    pullData.forEach((element) => {
        const dictKey = moment(element.date).format("YYYY-MM-DD");
        pullsUniqueDict[dictKey] = element.pullsToday;
    });

    const pullsUnique = summarizeByDay(pullsUniqueDict);
    return pullsUnique;
}

function summarizeByDay(pullsByDate: { [key: string]: number } = {}) {
    const pullsByDateGapsFilled = fillDataGaps(pullsByDate);

    for (let key in pullsByDateGapsFilled) {
        const value = pullsByDateGapsFilled[key];
        pullsByDateGapsFilled[key] = value;
    }

    return pullsByDateGapsFilled;
}

function fillDataGaps(data: { [key: string]: number } = {}) {

    // Get the keys as categories.
    let categories = Object.keys(data) || [];

    // Generate up to 30 days as categories, if there isn't 30 days of data.
    for (let day = 29; day >= 0; day--) {
        const date = moment().subtract(day, 'days').format("YYYY-MM-DD");
        if (!categories.includes(date)) {
            categories.push(date);
        }
    }
    categories = categories.sort();

    // Fill gaps for dates without values.
    Object.values(categories).forEach(date => {
        if (!(date in data)) {
            data[date] = 0;
        }
    });

    // Sort by date asc.
    data = Object.keys(data).sort().reduce(
        (obj: any, key) => {
            obj[key] = data[key];
            return obj;
        },
        {});

    return data;
}
