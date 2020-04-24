const UTF8 = {
  encode: d => new TextEncoder('utf-8').encode(d),
  decode: e => new TextDecoder('utf-8').decode(e)
};

const decrypt = async (encryptedPackage, passwordAsBytes) => {
  const encryptedObject = JSON.parse(UTF8.decode(encryptedPackage));
  const salt = Uint8Array.from(JSON.parse('[' + atob(encryptedObject.sl) + ']'));
  const iterations = encryptedObject.it;
  const iv = Uint8Array.from(JSON.parse('[' + atob(encryptedObject.iv) + ']'));
  const encryptedBytes = Uint8Array.from(JSON.parse('[' + atob(encryptedObject.ed) + ']'));
  const passwordKey = await self.crypto.subtle.importKey('raw', passwordAsBytes, 'PBKDF2', false, ['deriveKey']);
  const aesKey = await self.crypto.subtle.deriveKey({
    name: 'PBKDF2',
    salt,
    iterations: iterations,
    hash: { name: 'SHA-256' }
  }, passwordKey, { name: 'AES-GCM', length: 256 }, false, ['decrypt']);
  const decryptedContent = await self.crypto.subtle.decrypt({
    name: 'AES-GCM',
    iv
  }, aesKey, encryptedBytes);
  const decryptedBytes = new Uint8Array(decryptedContent);
  const dataObject = {
    decryptedMessage: decryptedBytes
  };
  postMessage(dataObject, [dataObject.decryptedMessage.buffer]);
};

self.onmessage = async event => {
  await decrypt(event.data.encryptedMessage, event.data.passwordAsBytes);
  self.close();
};
