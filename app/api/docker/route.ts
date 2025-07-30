import moment from "moment";
import type { NextRequest } from "next/server";

import TelegramBot from "node-telegram-bot-api";

import prismadb from "@/lib/prismadb";
import { DOCKER_ENDPOINTS } from "@/actions/getHubData";
import { getGitHubData } from "@/actions/getGitHubData";

export async function GET(request: NextRequest) {
    const repositories = Object.keys(DOCKER_ENDPOINTS);
    const newDataArray = [];

    for (const repository of repositories) {
        // Get the stats from Docker hub.
        const dockerResponse = await fetch(DOCKER_ENDPOINTS[repository as keyof typeof DOCKER_ENDPOINTS], { cache: "no-cache" });
        const dockerData = await dockerResponse.json();

        // Get the last entry for known pull data (so yesterday) for this repository.
        const lastEntries = await prismadb.pullData.findMany({
            where: { repository },
            orderBy: {
                date: "desc",
            },
            take: 1
        });

        // Get the pull count (or 0 if none present).
        var lastTotalPullCount = lastEntries.length === 0 ? 0 : lastEntries[0].pullsTotal;

        // Add todays pull count.
        const newData = {
            repository,
            date: moment().subtract(1, "day").toDate(),
            pullsToday: dockerData.pull_count - lastTotalPullCount,
            pullsTotal: dockerData.pull_count
        }

        // Add entry to database.
        await prismadb.pullData.create({
            data: newData
        });

        newDataArray.push(newData);
    }

    // Fetch and save GitHub stars data
    try {
        const gitHubData = await getGitHubData();
        
        // Get the last GitHub stars entry
        const lastGitHubEntry = await prismadb.gitHubStarsData.findFirst({
            orderBy: {
                date: "desc",
            }
        });
        
        const lastTotalStars = lastGitHubEntry ? lastGitHubEntry.starsTotal : 0;
        
        // Save GitHub stars data
        const gitHubStarsData = {
            date: moment().subtract(1, "day").toDate(),
            starsToday: gitHubData.starsCount - lastTotalStars,
            starsTotal: gitHubData.starsCount
        };
        
        await prismadb.gitHubStarsData.create({
            data: gitHubStarsData
        });
        
    } catch (error) {
        console.error('Failed to fetch GitHub stars data:', error);
    }

    // Get Telegram bot config. If given, also send the update to Telegram.
    const telegramBotToken = process.env.TELEGRAM_BOT_TOKEN;
    const telegramChatId = process.env.TELEGRAM_BOT_CHAT_ID;

    if (telegramBotToken && telegramChatId) {
        const bot = new TelegramBot(telegramBotToken, { polling: false });
        
        for (const data of newDataArray) {
            await bot.sendMessage(
                telegramChatId,
                `${data.repository}\n${moment(data.date).format("dddd D MMMM YYYY")}\nToday: ${data.pullsToday}\nTotal: ${data.pullsTotal}`,
                { parse_mode: "Markdown", disable_web_page_preview: true });
        }
    }

    // Return 200 with new pull data.
    return Response.json({ success: true, data: newDataArray });
}
