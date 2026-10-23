const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { buildStyles } = require('../scripts/build-styles.cjs');

test('deployed stylesheet is generated from the ordered editable source files', () => {
  assert.equal(fs.readFileSync(path.join(__dirname, '../style.css'), 'utf8'), buildStyles());
});

test('legacy asset aliases resolve to the canonical source', () => {
  for (const file of ['documents.js', 'privacy-consent.js', 'firebase-config.js', 'firebase-client.js', 'contact-page.js', 'cookies.js']) {
    assert.equal(fs.realpathSync(path.join(__dirname, '../public/js', file)), fs.realpathSync(path.join(__dirname, '../js', file)));
  }
});
