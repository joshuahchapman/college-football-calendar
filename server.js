const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = 3000;

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }
  
  // Serve calendar files
  if (pathname.startsWith('/calendars/')) {
    const filename = pathname.replace('/calendars/', '');
    const filepath = path.join(__dirname, 'calendars', filename);
    
    if (fs.existsSync(filepath)) {
      res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.writeHead(200);
      fs.createReadStream(filepath).pipe(res);
    } else {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Calendar not found');
    }
  } else if (pathname === '/') {
    // Serve a simple index page
    res.setHeader('Content-Type', 'text/html');
    res.writeHead(200);
    res.end(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>College Football Calendars</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; }
          .calendar-link { display: block; margin: 10px 0; padding: 10px; background: #f0f0f0; text-decoration: none; color: #333; border-radius: 5px; }
          .calendar-link:hover { background: #e0e0e0; }
        </style>
      </head>
      <body>
        <h1>College Football Calendars</h1>
        <p>Click on any calendar below to subscribe in your calendar app:</p>
        
        <a href="/calendars/college-football-top-25.ics" class="calendar-link">
          🏈 College Football Top 25
        </a>
        
        <a href="/calendars/college-football-top-25-matchups.ics" class="calendar-link">
          🏈 College Football Top 25 Matchups
        </a>
        
        <a href="/calendars/notre-dame-football.ics" class="calendar-link">
          🏈 Notre Dame Football
        </a>
        
        <a href="/calendars/ohio-state-football.ics" class="calendar-link">
          🏈 Ohio State Football
        </a>
        
        <a href="/calendars/oklahoma-football.ics" class="calendar-link">
          🏈 Oklahoma Football
        </a>
        
        <h2>How to Subscribe</h2>
        <p>To subscribe to these calendars in your calendar app:</p>
        <ul>
          <li><strong>Apple Calendar:</strong> Copy the URL and add it as a subscribed calendar</li>
          <li><strong>Google Calendar:</strong> Go to "Add calendar" → "From URL" and paste the URL</li>
          <li><strong>Outlook:</strong> Go to "Add calendar" → "From internet" and paste the URL</li>
        </ul>
        
        <p><strong>Note:</strong> This server is running locally. For production use, you would need to deploy this to a web server.</p>
      </body>
      </html>
    `);
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not found');
  }
});

server.listen(PORT, () => {
  console.log(`Calendar server running at http://localhost:${PORT}`);
  console.log(`Available calendars:`);
  console.log(`  - http://localhost:${PORT}/calendars/college-football-top-25.ics`);
  console.log(`  - http://localhost:${PORT}/calendars/college-football-top-25-matchups.ics`);
  console.log(`  - http://localhost:${PORT}/calendars/notre-dame-football.ics`);
  console.log(`  - http://localhost:${PORT}/calendars/ohio-state-football.ics`);
  console.log(`  - http://localhost:${PORT}/calendars/oklahoma-football.ics`);
});
