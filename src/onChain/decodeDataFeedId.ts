function decodeDataFeedId(dataFeedId: string): string {
  const hex = dataFeedId.slice(2);
  return Buffer.from(hex, "hex").toString("utf8").replace(/\0/g, "");
}

export { decodeDataFeedId };
