const { execFileSync } = require('node:child_process');
const path = require('node:path');
describe('real SQLite schema and onboarding migration', () => {
  test('validates fresh and legacy onboarding profiles plus all FTS entity triggers', () => {
    const output = execFileSync('python3', [path.join(__dirname, 'sqlite_onboarding_probe.py')], { encoding: 'utf8' });
    expect(JSON.parse(output)).toEqual({ fresh: true, legacy: true, fts_entities: true });
  });
});
