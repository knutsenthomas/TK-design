const assert = require('assert');

function validateDomain(rawUrl) {
    const parsed = new URL(rawUrl);
    if (parsed.protocol !== 'https:') {
        return false;
    }

    const validDomains = ['firebasestorage.googleapis.com', 'googleapis.com'];
    const isValidDomain = validDomains.some(domain =>
        parsed.hostname === domain || parsed.hostname.endsWith(`.${domain}`)
    );

    return isValidDomain;
}

assert.strictEqual(validateDomain('https://firebasestorage.googleapis.com/test.pdf'), true);
assert.strictEqual(validateDomain('https://googleapis.com/test.pdf'), true);
assert.strictEqual(validateDomain('https://sub.googleapis.com/test.pdf'), true);
assert.strictEqual(validateDomain('https://attacker-googleapis.com/test.pdf'), false);
assert.strictEqual(validateDomain('http://googleapis.com/test.pdf'), false);
assert.strictEqual(validateDomain('https://example.com/test.pdf'), false);

console.log("All tests passed!");
