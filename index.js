const request = require('request-promise');
const cheerio = require('cheerio');
const ical = require('ical-generator');
const moment = require('moment');
const fs = require('fs');
const path = require('path');

const game_url_base = "https://www.espn.com/college-football/game/_/gameId/";
const team_url_base = "https://www.espn.com/college-football/team/_/id/";

// ESPN API endpoints
const espn_api_base = "https://site.web.api.espn.com/apis/site/v2/sports/football/college-football";

var schedule = {
  slugify: function (text){
    return text.toString().toLowerCase()
      .replace(/\s+/g, '-')           // Replace spaces with -
      .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
      .replace(/\-\-+/g, '-')         // Replace multiple - with single -
      .replace(/^-+/, '')             // Trim - from start of text
      .replace(/-+$/, '');            // Trim - from end of text
  },

  get_weekly_schedule: function () {
    // Get current week's schedule from ESPN API - get a range of dates
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    
    // Get games from a week range (7 days)
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - 3); // Start 3 days ago
    const endDate = new Date(today);
    endDate.setDate(today.getDate() + 3); // End 3 days from now
    
    const startYear = startDate.getFullYear();
    const startMonth = String(startDate.getMonth() + 1).padStart(2, '0');
    const startDay = String(startDate.getDate()).padStart(2, '0');
    
    const endYear = endDate.getFullYear();
    const endMonth = String(endDate.getMonth() + 1).padStart(2, '0');
    const endDay = String(endDate.getDate()).padStart(2, '0');
    
    return request(`${espn_api_base}/scoreboard?dates=${startYear}${startMonth}${startDay}-${endYear}${endMonth}${endDay}&limit=100`);
  },

  get_team_schedule: function (team_id) {
    return request(`${espn_api_base}/teams/${team_id}/schedule`);
  },

  find_games: function (api_data) {
    const data = JSON.parse(api_data);
    return data.events.map(event => event.id);
  },

  find_team_games: function (api_data) {
    const data = JSON.parse(api_data);
    return data.events.map(event => event.id);
  },

  get_game: function (game_id) {
    console.log("Getting game " + game_url_base + game_id);
    return request(`${espn_api_base}/summary?event=${game_id}`)
      .then(function (api_data) {
        const data = JSON.parse(api_data);
        
        const header = data.header;
        const competition = header.competitions[0];
        
        if (!competition) {
          console.log(`Missing competition data for game ${game_id}`);
          return null;
        }
        
        // Extract team information from competition
        const homeTeam = competition.competitors.find(team => team.homeAway === 'home');
        const awayTeam = competition.competitors.find(team => team.homeAway === 'away');
        
        if (!homeTeam || !awayTeam) {
          console.log(`Missing team data for game ${game_id}`);
          return null;
        }
        
        // Get rankings if available
        const homeRank = homeTeam.rank ? homeTeam.rank.toString() : '';
        const awayRank = awayTeam.rank ? awayTeam.rank.toString() : '';
        
        // Get scores
        const homeScore = homeTeam.score || '';
        const awayScore = awayTeam.score || '';
        
        // Get game time
        const gameTime = competition.date ? new Date(competition.date).toISOString() : '';
        
        // Get TV network
        const network = competition.broadcasts && competition.broadcasts.length > 0 ? competition.broadcasts[0].media.shortName : '';
        
        const gameData = {
          id: game_id,
          network: network,
          time: gameTime,
          line: data.odds && data.odds.length > 0 ? data.odds[0].spread : '',
          over_under: data.odds && data.odds.length > 0 ? data.odds[0].overUnder : '',
          home: {
            name: homeTeam.team.displayName,
            rank: homeRank,
            score: homeScore
          },
          visitor: {
            name: awayTeam.team.displayName,
            rank: awayRank,
            score: awayScore
          }
        };
        
        // console.log(`Processed game ${game_id}:`, gameData);
        return gameData;
      })
      .catch(function(error) {
        console.log(`Error getting game ${game_id}:`, error.message);
        return null;
      });
  },

  build_calendar: function (name, games) {
    console.log(`Building calendar for ${name} with ${games.length} games`);
    var events = games.filter(game => game && game.time && game.time !== '').map(function (game) {
      var summary = String.fromCodePoint(127944) + " ";
      if (game.visitor.rank !== '') {
        summary += "#" + game.visitor.rank + " ";
      }
      summary += game.visitor.name;

      summary += " at ";
      if (game.home.rank !== '') {
        summary += "#" + game.home.rank + " ";
      }
      summary += game.home.name;

      var description = '';
      if (game.line !== '') {
        description += game.line + "\n";
      }
      if (game.over_under !== '') {
        description += game.over_under + "\n";
      }

      var location = '';
      if (game.visitor.score !== '' || game.home.score !== '') {
          location = 'FINAL: ' +
            game.visitor.name + ' ' + game.visitor.score +
            ', ' +
            game.home.name + ' ' + game.home.score;
      }
      else {
        if (game.network !== '') {
          location = 'Watch on ' + game.network;
        }
      }

      // Parse the game time properly
      var gameTime = moment(game.time);
      if (!gameTime.isValid()) {
        console.log(`Invalid time for game ${game.id}: ${game.time}`);
        return null;
      }

      return {
        start: gameTime,
        end: gameTime.clone().add(3.5, 'hour'),
        timestamp: moment(),
        summary: summary,
        location: location,
        url: game_url_base + game.id,
        description: description
      };
    }).filter(event => event !== null);

    var calendar = ical({
      name: name,
      url: 'https://hathaway.cc/calendars/' + schedule.slugify(name),
      domain: 'hathaway.cc',
      prodId: { company: 'hathaway.cc', product: 'college-football-calendar' },
      events: events,
      ttl: 60 * 60 * 24
    }).toString();
    // console.log(calendar);
    return calendar;
  },

  save_calendar: function (name, calendar_data) {
    const filename = schedule.slugify(name) + '.ics';
    const filepath = path.join(__dirname, 'calendars', filename);
    
    // Create calendars directory if it doesn't exist
    const calendarsDir = path.join(__dirname, 'calendars');
    if (!fs.existsSync(calendarsDir)) {
      fs.mkdirSync(calendarsDir, { recursive: true });
    }
    
    fs.writeFileSync(filepath, calendar_data);
    console.log(`Saved calendar: ${filepath}`);
    return Promise.resolve();
  },

  is_top_25_matchup: function (game) {
    return game.visitor.rank != '' && game.home.rank != '';
  },

  is_top_25: function (game) {
    return game.visitor.rank != '' || game.home.rank != '';
  }
};

function build_top_25_calendar(name = 'College Football Top 25') {
  console.log("Building " + name);
  return schedule.get_weekly_schedule()
    .then(schedule.find_games)
    .then(function(gameIds) {
      return Promise.all(gameIds.map(schedule.get_game));
    })
    .then(function (games) {
      return games.filter(game => game !== null).filter(schedule.is_top_25);
    })
    .then(function (games) {
      return schedule.build_calendar(name, games);
    })
    .then(function (calendar_data) {
      return schedule.save_calendar(name, calendar_data);
    });
}

function build_top_25_matchup_calendar(name = 'College Football Top 25 Matchups') {
  console.log("Building " + name);
  return schedule.get_weekly_schedule()
    .then(schedule.find_games)
    .then(function(gameIds) {
      return Promise.all(gameIds.map(schedule.get_game));
    })
    .then(function (games) {
      return games.filter(game => game !== null).filter(schedule.is_top_25_matchup);
    })
    .then(function (games) {
      return schedule.build_calendar(name, games);
    })
    .then(function (calendar_data) {
      return schedule.save_calendar(name, calendar_data);
    });
}

function build_team_calendar(name = 'Notre Dame Football', team_id = 87) {
  console.log("Building " + name);
  return schedule.get_team_schedule(team_id)
    .then(schedule.find_team_games)
    .then(function(gameIds) {
      return Promise.all(gameIds.map(schedule.get_game));
    })
    .then(function (games) {
      return games.filter(game => game !== null);
    })
    .then(function (games) {
      return schedule.build_calendar(name, games);
    })
    .then(function (calendar_data) {
      return schedule.save_calendar(name, calendar_data);
    });
}

exports.handler = (event, context, callback) => {
  console.log("Received event: ", event);
  build_top_25_calendar().then(function (result) {
    build_top_25_matchup_calendar().then(function (result) {
      build_team_calendar().then(function (result) {
        build_team_calendar('Ohio State Football', 194).then(function (result) {
          callback(null, 'Success');
        });
      });
    });
  });
};



// For testing locally
if (require.main === module) {
  console.log("Starting college football calendar generation...");
  
  build_top_25_calendar()
    .then(() => build_top_25_matchup_calendar())
    .then(() => build_team_calendar())
    .then(() => build_team_calendar('Ohio State Football', 194))
    .then(() => build_team_calendar('Oklahoma Football', 201))
    .then(() => {
      console.log("All calendars generated successfully!");
    })
    .catch(error => {
      console.error("Error generating calendars:", error);
    });
}
