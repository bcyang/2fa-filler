
function uint8ArrayToHex(uint8Array) {
    let hexString = ''; // Placeholder for hex string

    for (let byte of uint8Array) {
        // Convert each byte to a two-digit hex value and concatenate
        hexString += ('0' + byte.toString(16)).slice(-2);
    }

    return hexString;
}

// https://en.wikipedia.org/wiki/Time-based_one-time_password
function generateTOTP(secret) {

    const keyArray = base32ToArrayBuffer(secret);

    // counter (epoch in seconds / 30), big endian
    let counter = Math.floor(Date.now() / 30000);
    let counterArray = new Uint8Array(8).fill(0);
    for (let i = 7; i >= 0; i--) {
        counterArray[i] = counter & 0xff; // Get the last 8 bits
        counter >>= 8; // Shift right 8 bits
    }

    // basically hash it decide which part to use
    const keyBuffer = keyArray.buffer;
    return crypto.subtle.importKey(
        'raw',
        keyBuffer,
        { name: 'HMAC', hash: 'SHA-1' },
        false,
        ['sign']
    ).then(keyBuffer => {
        return crypto.subtle.sign('HMAC', keyBuffer, counterArray);
    }).then(signature => {
        const hmacResult = new Uint8Array(signature);
        const offset = hmacResult[hmacResult.length - 1] & 0xf;
        const code = ((hmacResult[offset] & 0x7f) << 24 |
            (hmacResult[offset + 1] & 0xff) << 16 |
            (hmacResult[offset + 2] & 0xff) << 8 |
            (hmacResult[offset + 3] & 0xff)) % 1000000;
        return code.toString().padStart(6, '0');
    });
}

// Convert base32 to ArrayBuffer
function base32ToArrayBuffer(encoded) {
    const padding = encoded.length % 8;
    if (padding) {
        encoded += '='.repeat(8 - padding);
    }

    const base32chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    const base32lookup = {};
    for (let i = 0; i < base32chars.length; i++) {
        base32lookup[base32chars[i]] = i;
    }

    let bits = 0;
    let value = 0;
    let index = 0;
    const bytes = [];

    for (let i = 0; i < encoded.length; i++) {
        const char = encoded[i];
        if (char === '=') break; // Stop at padding

        value = (value << 5) | base32lookup[char];
        bits += 5;

        if (bits >= 8) {
            bytes[index++] = (value >>> (bits - 8)) & 255;
            bits -= 8;
        }
    }

    return new Uint8Array(bytes);
}

// Listen for messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'getTOTP') {
        chrome.storage.sync.get('secrets', async (result) => {
            const secrets = result.secrets || {};
            const secret = secrets[request.service];

            if (secret) {
                try {
                    const totp = await generateTOTP(secret);
                    sendResponse({ success: true, totp });
                } catch (error) {
                    console.error('Error generating TOTP:', error);
                    sendResponse({ success: false, error: error.message });
                }
            } else {
                sendResponse({ success: false, error: 'No secret found for this service' });
            }
        });
        return true; // Required for async sendResponse
    }
}); 