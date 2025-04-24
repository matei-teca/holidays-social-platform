// client/src/crypto/keys.js
import sodium from "libsodium-wrappers";

// Once at app startup:
await sodium.ready;

// Try to load existing keys from IndexedDB/localStorage
let keyPair = JSON.parse(localStorage.getItem("keyPair"));
if (!keyPair) {
  const kp = sodium.crypto_box_keypair();
  keyPair = {
    publicKey:  sodium.to_base64(kp.publicKey),
    privateKey: sodium.to_base64(kp.privateKey),
  };
  localStorage.setItem("keyPair", JSON.stringify(keyPair));
}

export const { publicKey, privateKey } = keyPair;
