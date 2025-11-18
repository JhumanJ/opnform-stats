# OpnForm Docker Pull Stats

A customized version of Docker Pull Stats specifically adapted for tracking [OpnForm](https://opnform.com) project metrics.

This webapp tracks both Docker Hub pull statistics and GitHub stars for the OpnForm project, updating daily at 3 AM UTC. It displays:

- **Docker Hub pulls** for OpnForm API and Client containers
- **GitHub stars** from the [OpnForm repository](https://github.com/opnform/opnform)
- Historical charts and daily/hourly trends
- Combined statistics and individual repository breakdowns

## What's Different

This is a customized adaptation of the original [Docker Pull Stats](https://github.com/dickwolff/Docker-Pull-Stats) project with these changes:

- **OpnForm Integration**: Hardcoded to track OpnForm repositories (`jhumanj/opnform-api` and `jhumanj/opnform-client`)
- **GitHub Stars Tracking**: Added GitHub API integration to track repository stars alongside Docker pulls
- **Daily Updates**: Collects data daily at 3 AM UTC
- **Dual Charts**: Separate visualizations for Docker pulls and GitHub stars
- **Simplified Authentication**: Removed cron job authentication for public APIs
- **OpnForm Branding**: Updated UI with OpnForm branding and links

Currently it stores Docker `pull_count` and GitHub `stargazers_count` for each date. The app cannot get historical data from Docker Hub or GitHub - it creates its own history from the first time the cron job runs.

## Tech stack

- [Next.js](https://nextjs.org/) for the webapp/api
- [Prisma](https://prisma.io/) for database ORM
- [PostgreSQL](https://postgresql.org/) for data storage
- [Vercel](https://vercel.com/) for hosting and cron jobs
- [Docker Hub API](https://docs.docker.com/docker-hub/api/latest/) for pull statistics
- [GitHub API](https://docs.github.com/en/rest) for star counts
- [ApexCharts](https://apexcharts.com/) for data visualization

## How to deploy

### One click deploy via Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FJhumanJ%2Fopnform-docker-stats&project-name=opnform-docker-stats&stores=%5B%7B%22type%22%3A%22postgres%22%7D%5D&)

### Manual deployment

1. Fork this repository
2. Go to Vercel and click on 'Add new project' and import the repository from Git
3. Enter the ENV variables listed in the table below
4. After creating your project, go to 'Storage' and click 'Create Database' (use Postgres)
5. Redeploy the app from Vercel (as the newly added Postgres environment variables aren't propagated yet)

### Variables

| Variable               | Description                                               | Required (y/n) |
| ---------------------- | --------------------------------------------------------- | -------------- |
| TELEGRAM_BOT_TOKEN[^1] | Telegram Bot token, if you want daily updates in Telegram | No             |
| TELEGRAM_BOT_CHAT_ID   | Telegram chat id, if you want daily updates in Telegram   | No             |

**Note**: No Docker endpoints or authentication secrets are needed - the app is preconfigured for OpnForm repositories and uses public APIs.

## Data Tracked

The application automatically tracks:

### Docker Hub Metrics

- **OpnForm API** (`jhumanj/opnform-api`): Pull counts and daily increments
- **OpnForm Client** (`jhumanj/opnform-client`): Pull counts and daily increments

### GitHub Metrics

- **Repository Stars**: Total stars from [opnform/opnform](https://github.com/opnform/opnform)
- **Daily Star Growth**: New stars gained each day

### Update Frequency

- **Daily**: Data is collected every day at 3 AM UTC via Vercel cron jobs
- **Real-time**: Current stats are fetched live for display

## Database Schema

The app uses two main tables:

- `PullData`: Stores Docker Hub pull statistics per repository
- `GitHubStarsData`: Stores GitHub star counts and daily growth

## Credits

This project is based on the excellent [Docker Pull Stats](https://github.com/dickwolff/Docker-Pull-Stats) by [Dick Wolff](https://github.com/dickwolff), adapted specifically for the OpnForm project.

[^1]: Use the [Telegram bot instructions](https://core.telegram.org/bots/tutorial) to obtain the Telegram token and chatId.
