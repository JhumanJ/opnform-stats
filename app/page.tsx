import Link from "next/link";
import { Suspense } from "react";
import { Container, Loader2 } from "lucide-react";
import moment from "moment";

import { Menu } from "@/components/menu";
import { Button } from "@/components/ui/button";
import ChartComponent from "@/components/apexChartComponent";
import { Card, CardContent, CardFooter } from "@/components/ui/card";

import { getHubData } from "@/actions/getHubData";
import { getPullData } from "@/actions/getPullData";
import { getGitHubStarsData, getCurrentGitHubStars } from "@/actions/getGitHubStarsData";

export const revalidate = 0;

export default async function Home() {

  const hubDataArray = await getHubData();
  const repositoryPullCounts = hubDataArray.reduce((acc, hub) => {
    acc[hub.name] = hub.pullCount;
    return acc;
  }, {} as { [key: string]: number });
  
  const pullDataArray = await getPullData(repositoryPullCounts);
  
  // Get GitHub stars data
  const currentGitHubStars = await getCurrentGitHubStars();
  const gitHubStarsData = await getGitHubStarsData(currentGitHubStars);

  const totalPullCount = pullDataArray.reduce((sum, repo) => sum + repo.totalPullCount, 0);
  
  // Calculate average pulls per day (using last 30 days of data)
  const totalDailyPulls = pullDataArray.reduce((sum, repo) => {
    const dailyValues = Object.values(repo.pullsUnique);
    return sum + dailyValues.reduce((a, b) => a + (b as number), 0);
  }, 0);
  
  // Get the actual number of days with data (in case we have less than 30 days)
  const daysWithData = pullDataArray.length > 0 ? Object.keys(pullDataArray[0].pullsUnique).length : 30;
  const averagePullsPerDay = Math.round(totalDailyPulls / Math.max(daysWithData, 1));

  // Calculate today's stats
  const today = moment().format("YYYY-MM-DD");
  const pullsToday = pullDataArray.reduce((sum, repo) => {
    const todayPulls = repo.pullsUnique[today] || 0;
    return sum + todayPulls;
  }, 0);
  
  const starsToday = gitHubStarsData.starsUnique[today] || 0;

  // Create separate series for each repository
  const apiRepoData = pullDataArray.find(repo => repo.repository === 'opnform-api');
  const clientRepoData = pullDataArray.find(repo => repo.repository === 'opnform-client');

  const pullsChartParams = {
    chartName: "",
    chartValue: 0,
    primarySeries: {
      tooltipText: "OpnForm API",
      data: apiRepoData?.pullsAccumulated || {}
    },
    secondarySeries: {
      tooltipText: "OpnForm Client", 
      data: clientRepoData?.pullsAccumulated || {}
    }
  };

  const starsChartParams = {
    chartName: "", 
    chartValue: 0,
    primarySeries: {
      tooltipText: "Total Stars",
      data: gitHubStarsData.starsAccumulated
    },
    secondarySeries: {
      tooltipText: "Stars per Day",
      data: gitHubStarsData.starsUnique
    }
  };

  return (
    <div className="w-full flex justify-center flex-col">

      <header className="flex w-full">
        <div className="container flex h-20 max-w-(--breakpoint-xl) items-center flex-row">
          <img src="/logo.svg" alt="Logo" className="h-8 w-8 mr-3" />
          <Link href="/" className="space-x-2 flex text-xl">
            OpnForm - Stats
          </Link>
          <Menu />
        </div>
      </header>

      <div className="w-full p-4 flex-row">

        <div className="container p-4 flex flex-col lg:flex-row justify-center items-start max-w-(--breakpoint-xl) gap-6">

          {/* Repository Cards - Left Side */}
          <div className="flex flex-col gap-4 w-full lg:w-1/3">
            {hubDataArray.map((hubData, index) => (
              <Card key={hubData.name} className="w-full">
                <CardContent className="mt-6">
                  <h3 className="text-lg font-semibold mb-3">{hubData.name}</h3>
                  <div className="grid grid-cols-6">
                    <div className="col-span-3 md:col-span-2">User:</div>
                    <div className="col-span-3 md:col-span-4">{hubData.user}</div>
                    <div className="col-span-3 md:col-span-2">Pulls:</div>
                    <div className="col-span-3 md:col-span-4">{hubData.pullCount.toLocaleString()}</div>
                    <div className="col-span-3 md:col-span-2">Last updated:</div>
                    <div className="col-span-3 md:col-span-4">{hubData.lastUpdated.toLocaleDateString()}</div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Link href={`https://hub.docker.com/r/${hubData.user}/${hubData.name}`} target="_blank">
                    <Button>
                      <Container width={16} height={16} className="mr-3" />
                      Go to Docker Hub
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>

          {/* Chart Section - Right Side */}
          <div className="flex flex-col w-full lg:w-2/3">
            {/* Stats Above Charts */}
            <div className="mb-4 text-center lg:text-left">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                <div>
                  <h2 className="text-4xl font-bold text-gray-900 dark:text-slate-200">{totalPullCount.toLocaleString()}</h2>
                  <p className="text-lg font-normal text-gray-500 dark:text-gray-400">Total pulls</p>
                </div>
                <div>
                  <h2 className="text-4xl font-bold text-green-600 dark:text-green-400">+{pullsToday.toLocaleString()}</h2>
                  <p className="text-lg font-normal text-gray-500 dark:text-gray-400">Pulls today</p>
                </div>
                <div>
                  <h2 className="text-4xl font-bold text-gray-900 dark:text-slate-200">{averagePullsPerDay.toLocaleString()}</h2>
                  <p className="text-lg font-normal text-gray-500 dark:text-gray-400">Avg pulls/day</p>
                </div>
                <div>
                  <h2 className="text-4xl font-bold text-gray-900 dark:text-slate-200">{gitHubStarsData.totalStarsCount.toLocaleString()}</h2>
                  <p className="text-lg font-normal text-gray-500 dark:text-gray-400">GitHub Stars</p>
                </div>
                <div>
                  <h2 className="text-4xl font-bold text-yellow-500 dark:text-yellow-400">+{starsToday.toLocaleString()}</h2>
                  <p className="text-lg font-normal text-gray-500 dark:text-gray-400">Stars today</p>
                </div>
              </div>
            </div>
            
            {/* Charts */}
            <div className="flex flex-col gap-6">
              {/* Docker Pulls Chart */}
              <div className="flex-1">
                <Suspense fallback={<Loader2 className="w-6 h-6 animate-spin" />}>
                  <ChartComponent params={pullsChartParams} />
                </Suspense>
              </div>
              
              {/* GitHub Stars Chart */}
              <div className="flex-1">
                <Suspense fallback={<Loader2 className="w-6 h-6 animate-spin" />}>
                  <ChartComponent params={starsChartParams} />
                </Suspense>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* Footer */}
      <footer className="w-full mt-8 py-4">
        <div className="container mx-auto px-4 text-center">
          <p className="text-xs text-gray-500 dark:text-gray-500">
          <Link 
              href="https://github.com/dickwolff/Docker-Pull-Stats" 
              target="_blank" 
              className="text-black dark:text-white hover:underline"
            >
              Docker Pull Stats
            </Link> page originally created by{" "}
            <Link 
              href="https://github.com/dickwolff/" 
              target="_blank" 
              className="text-black dark:text-white hover:underline"
            >
              Dick Wolff
            </Link>
          </p>
        </div>
      </footer>
    </div >
  );
}
