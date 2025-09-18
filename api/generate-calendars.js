// Vercel API route to generate calendars on-demand
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Run the calendar generation script
    exec('node index.js', (error, stdout, stderr) => {
      if (error) {
        console.error('Error generating calendars:', error);
        return res.status(500).json({ error: 'Failed to generate calendars' });
      }

      console.log('Calendars generated successfully');
      res.status(200).json({ 
        success: true, 
        message: 'Calendars generated successfully',
        output: stdout 
      });
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
