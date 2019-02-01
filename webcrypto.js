const UTF8 = {
  encode: d => new TextEncoder('utf-8').encode(d),
  decode: e => new TextDecoder('utf-8').decode(e)
};

const encrypt = () => {
  let workerEncrypt = new Worker('worker-encrypt.js');
  const dataObject = {
    decryptedMessage: UTF8.encode(document.getElementById('decrypted').value),
    passwordAsBytes: UTF8.encode(prompt('Enter your password:'))
  };
  workerEncrypt.postMessage(dataObject, [dataObject.decryptedMessage.buffer]);
  workerEncrypt.onmessage = event => {
    document.getElementById('encrypted').value = UTF8.decode(event.data.encryptedMessage);
    document.getElementById('decrypted').value = '';
  };
};

const decrypt = () => {
  let workerDecrypt = new Worker('worker-decrypt.js');
  const dataObject = {
    encryptedMessage: UTF8.encode(document.getElementById('encrypted').value),
    passwordAsBytes: UTF8.encode(prompt('Enter your password:'))
  };
  workerDecrypt.postMessage(dataObject, [dataObject.encryptedMessage.buffer]);
  workerDecrypt.onmessage = event => {
    document.getElementById('decrypted').value = UTF8.decode(event.data.decryptedMessage);
    document.getElementById('encrypted').value = '';
  };
};
