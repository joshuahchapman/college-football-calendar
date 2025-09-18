# College Football Calendar Generator

This project generates iCal calendar feeds for college football games using ESPN's API. It can generate team-specific feeds, a top 25 feed, or a top 25 matchups feed.

## Features

- **Team Calendars**: Generate calendars for specific teams (Notre Dame, Ohio State, Oklahoma, etc.)
- **Top 25 Calendar**: All games involving ranked teams
- **Top 25 Matchups**: Only games between two ranked teams
- **Local File Generation**: Saves calendars as `.ics` files locally
- **HTTP Server**: Optional local server to serve calendars

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Generate calendars:
   ```bash
   node index.js
   ```

3. (Optional) Start local server:
   ```bash
   node server.js
   ```

## Generated Calendars

The script generates the following calendar files in the `calendars/` directory:

- `college-football-top-25.ics` - All games with ranked teams
- `college-football-top-25-matchups.ics` - Games between two ranked teams
- `notre-dame-football.ics` - Notre Dame's full schedule
- `ohio-state-football.ics` - Ohio State's full schedule
- `oklahoma-football.ics` - Oklahoma's full schedule

## Using the Calendars

### Local Testing
1. Run `node server.js` to start a local server
2. Open http://localhost:3000 in your browser
3. Click on any calendar link to download or subscribe

### Calendar App Subscription
To subscribe to these calendars in your calendar app:

- **Apple Calendar**: Copy the URL and add it as a subscribed calendar
- **Google Calendar**: Go to "Add calendar" → "From URL" and paste the URL
- **Outlook**: Go to "Add calendar" → "From internet" and paste the URL

### Production Deployment
For production use, you would need to:
1. Deploy the calendar files to a web server
2. Set up the script to run on a schedule (e.g., using cron or AWS Lambda)
3. Update the calendar URLs in the generated files

## Technical Details

- Uses ESPN's public API to fetch game data
- Generates iCal format calendar files
- Handles team rankings and game times
- Includes TV network information and scores
- Filters games based on team rankings

## Original Project

This is a fixed and updated version of the original project by Benjamin Hathaway. The original project was designed to run on AWS Lambda and upload calendars to S3, but this version generates files locally for easier testing and development.

## License

MIT License - see LICENSE file for details.