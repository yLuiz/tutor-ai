function parseBotResponse(raw) {
  const cleaned = raw
    .replace(/```json\s*/i, '')
    .replace(/```$/, '')       
    .trim();                   

  return JSON.parse(cleaned);
}

module.exports = { parseBotResponse };