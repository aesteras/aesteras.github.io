const ITERATIONS = 250000;
const SALT_LENGTH = 32;
const IV_LENGTH = 12;

const UTF8 = {
  encode: d => new TextEncoder('utf-8').encode(d),
  decode: e => new TextDecoder('utf-8').decode(e)
};

const encrypt = async (dataAsBytes, passwordAsBytes) => {
  const salt = self.crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
  const iv = self.crypto.getRandomValues(new Uint8Array(IV_LENGTH));
  const passwordKey = await self.crypto.subtle.importKey(
    'raw',
    passwordAsBytes,
    'PBKDF2',
    false,
    ['deriveKey']
  );
  const aesKey = await self.crypto.subtle.deriveKey({
      name: 'PBKDF2',
      salt,
      iterations: ITERATIONS,
      hash: {name: 'SHA-256'}
    }, passwordKey, {name: 'AES-GCM', length: 256}, false, ['encrypt']);
  const encryptedContent = await self.crypto.subtle.encrypt({
      name: 'AES-GCM',
      iv
    }, aesKey, dataAsBytes);
  const encryptedBytes = new Uint8Array(encryptedContent);
  const encryptedObject = JSON.stringify({
    'sl': btoa(salt),
    'it': ITERATIONS,
    'iv': btoa(iv),
    'ed': btoa(encryptedBytes)
  });
  const dataObject = {
    encryptedMessage: UTF8.encode(encryptedObject)
  };
  postMessage(dataObject, [dataObject.encryptedMessage.buffer]);
}

self.onmessage = async event => {
  await encrypt(event.data.decryptedMessage, event.data.passwordAsBytes);
  self.close();
};
