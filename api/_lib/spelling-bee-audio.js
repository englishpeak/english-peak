// Remove the standard MP3 tags that can contain the target word in plain text.
// Retain just enough input to recognize split headers and the optional footer.
export async function* stripMp3Tags(source) {
  let header = Buffer.alloc(0);
  let footer = Buffer.alloc(0);
  let skip = 0;

  for await (const bytes of source) {
    let chunk = Buffer.from(bytes);
    if (header) {
      chunk = Buffer.concat([header, chunk]);
      if (chunk.length < 10) {
        header = chunk;
        continue;
      }
      if (chunk.toString('ascii', 0, 3) === 'ID3') {
        const size = chunk.readUInt32BE(6);
        if (size & 0x80808080) throw new Error('Invalid MP3 tag');
        skip = 10 + ((size >>> 24) * 0x200000 + (size >>> 16 & 127) * 0x4000 +
          (size >>> 8 & 127) * 0x80 + (size & 127));
        if (chunk[3] === 4 && (chunk[5] & 0x10)) skip += 10;
      }
      header = null;
    }
    if (skip >= chunk.length) {
      skip -= chunk.length;
      continue;
    }
    chunk = Buffer.concat([footer, chunk.subarray(skip)]);
    skip = 0;
    // ID3v1 is 128 bytes, optionally preceded by a 227-byte enhanced tag.
    const cutoff = Math.max(0, chunk.length - 355);
    if (cutoff) yield chunk.subarray(0, cutoff);
    footer = chunk.subarray(cutoff);
  }

  const tagStart = footer.length - 128;
  if (tagStart >= 0 && footer.toString('ascii', tagStart, tagStart + 3) === 'TAG') {
    const enhancedStart = tagStart - 227;
    footer = footer.subarray(0, enhancedStart >= 0 &&
      footer.toString('ascii', enhancedStart, enhancedStart + 4) === 'TAG+' ? enhancedStart : tagStart);
  }
  if (footer.length) yield footer;
}
