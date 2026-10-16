const { test } = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const { spawnSync } = require('node:child_process');

function load(request) {
  const sandbox = {
    require: name => name === 'request-promise' ? request : require(name),
    exports: {}, module: {}, __dirname: require('node:path').resolve(__dirname, '..'),
    console: { log() {} }
  };
  vm.runInNewContext(fs.readFileSync('index.js', 'utf8'), sandbox);
  return sandbox.exports.schedule;
}

test('weekly schedule requests individual days and deduplicates games', async () => {
  const urls = [];
  const schedule = load(async options => {
    urls.push(options.uri);
    return JSON.stringify({ events: [{ id: '123' }] });
  });
  const result = JSON.parse(await schedule.get_weekly_schedule());
  assert.ok(urls.length >= 2 && urls.length <= 8);
  for (const url of urls) {
    assert.match(url, /site\.api\.espn\.com/);
    assert.match(url, /dates=\d{8}&groups=80&limit=1000$/);
  }
  assert.deepEqual(result.events, [{ id: '123' }]);
});

test('schedule and game request failures reject instead of producing partial feeds', async () => {
  const schedule = load(async () => { throw new Error('HTTP 400'); });
  await assert.rejects(schedule.get_weekly_schedule(), /HTTP 400/);
  await assert.rejects(schedule.get_game('123'), /HTTP 400/);
});

test('invalid schedule payload does not become an empty calendar', async () => {
  const schedule = load(async () => '{}');
  await assert.rejects(schedule.get_weekly_schedule(), /Missing ESPN events/);
});

test('calendar event identity remains stable across regeneration', () => {
  const schedule = load();
  const game = { id: '123', time: '2026-10-17T16:00:00Z', network: 'ABC',
    line: '', over_under: '', home: { name: 'Home', rank: '5', score: '' },
    visitor: { name: 'Away', rank: '4', score: '' } };
  for (let i = 0; i < 2; i++) {
    assert.match(schedule.build_calendar('Test', [game]), /UID:espn-college-football-123/);
  }
});

test('CLI exits unsuccessfully when generation fails', () => {
  const script = `
    const Module = require('module');
    const original = Module._load;
    Module._load = function(name, ...args) {
      if (name === 'request-promise') return () => Promise.reject(new Error('ESPN unavailable'));
      return original.call(this, name, ...args);
    };
    process.argv[1] = require('path').resolve('index.js');
    require('module').runMain();
  `;
  const result = spawnSync(process.execPath, ['-e', script], { encoding: 'utf8' });
  assert.equal(result.status, 1);
  assert.match(result.stderr, /ESPN unavailable/);
});
