const layout = require('fs').readFileSync(require('path').join(__dirname, '..', 'app', '(tabs)', '_layout.tsx'), 'utf8');
describe('settings navigation', () => {
  it('exposes the accessible settings tab and protected nested routes', () => { expect(layout).toContain('name="settings"'); expect(layout).toContain("tabBarLabel: 'Paramètres'"); expect(layout).toContain("name=\"settings/backup\""); expect(layout).toContain("name=\"settings/security\""); expect(layout).toContain('minHeight: 56'); });
});
