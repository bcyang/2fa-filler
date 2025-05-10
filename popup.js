document.addEventListener('DOMContentLoaded', () => {
  const addSecretForm = document.getElementById('addSecretForm');
  const secretsList = document.getElementById('secretsList');

  // Load and display saved secrets
  loadSecrets();

  // Handle form submission
  addSecretForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const serviceName = document.getElementById('serviceName').value.trim();
    let secretKey = document.getElementById('secretKey').value.trim();

    if (!['Okta', 'Microsoft'].includes(serviceName)) {
        alert('Service Name[' + serviceName + '] is not supported');
        return;
    }
    secretKey.replace(/\s/g, '').toUpperCase()
    if (!/^[A-Z2-7]+=*$/.test(secretKey)) {
        alert('Invalid TOTP secret');
        return;
    }

    // Save the secret
    const secrets = await getSecrets();
    secrets[serviceName] = secretKey;
    await chrome.storage.sync.set({ secrets });

    // Clear form and refresh list
    addSecretForm.reset();
    loadSecrets();
  });

  async function loadSecrets() {
    const secrets = await getSecrets();
    secretsList.innerHTML = '';

    Object.entries(secrets).forEach(([service, secret]) => {
      const secretItem = document.createElement('div');
      secretItem.className = 'secret-item';
      
      const serviceSpan = document.createElement('span');
      serviceSpan.textContent = service;
      
      const deleteButton = document.createElement('button');
      deleteButton.textContent = 'Delete';
      deleteButton.onclick = async () => {
        delete secrets[service];
        await chrome.storage.sync.set({ secrets });
        loadSecrets();
      };

      secretItem.appendChild(serviceSpan);
      secretItem.appendChild(deleteButton);
      secretsList.appendChild(secretItem);
    });
  }

  async function getSecrets() {
    const result = await chrome.storage.sync.get('secrets');
    return result.secrets || {};
  }
}); 