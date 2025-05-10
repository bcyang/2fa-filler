// Function to detect the current service and find the input
function detectServiceAndInput() {
    const hostname = window.location.hostname;

    // First check for actual service domains
    if (hostname.includes('okta.com')) {
        const input = document.querySelector('input[name="credentials.passcode"]');
        if (input) return { service: 'Okta', input };
    } else if (hostname.includes('microsoft.com') || hostname.includes('microsoftonline.com')) {
        const input = document.querySelector('input[name="otc"]');
        if (input) return { service: 'Microsoft', input };
    }

    // For our test page, check specific input names
    const oktaInput = document.querySelector('input[name="credentials.passcode"]');
    if (oktaInput) return { service: 'Okta', input: oktaInput };

    const microsoftInput = document.querySelector('input[name="otc"]');
    if (microsoftInput) return { service: 'Microsoft', input: microsoftInput };

    return { service: null, input: null };
}

// Function to fill the 2FA code
async function fill2FACode() {
    const { service, input } = detectServiceAndInput();
    console.log('Detected service:', service);  // allow us to see if this funciton is invoked as well

    if (!service || !input) {
        console.log('No supported service or input field detected');
        return;
    }

    // Request TOTP from background script
    chrome.runtime.sendMessage(
        { action: 'getTOTP', service },
        (response) => {
            if (response.success) {
                // console.log('Received TOTP code:', response.totp);
                input.value = response.totp;
                // Trigger input event to notify the page of the change
                input.dispatchEvent(new Event('input', { bubbles: true }));
                input.dispatchEvent(new Event('change', { bubbles: true }));
                // console.log('Successfully filled 2FA code');
            } else {
                console.error('Failed to get TOTP code:', response.error);
            }
        }
    );
}

// attempt to run on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        fill2FACode();
    });
} else {
    fill2FACode();
}

// as modern webpages are dynamic
new MutationObserver(() => {
    fill2FACode();
}).observe(document, { subtree: true, childList: true }); 