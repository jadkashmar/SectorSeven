import zlib from 'zlib';

const fakeData = JSON.stringify({ Position: [{ Entries: { "1": { X: 100, Y: 200 } } }] });
const compressed = zlib.deflateRawSync(fakeData);
const encoded = compressed.toString('base64');

console.log('Fake encoded payload:', encoded);

function decompressPositionZ(base64String) {
  const buffer = Buffer.from(base64String, 'base64');
  const decompressed = zlib.inflateRawSync(buffer);
  return JSON.parse(decompressed.toString());
}

const result = decompressPositionZ(encoded);
console.log('Decompressed result:', result);