const { get, post } = require("axios");
module.exports.config = {
  name: '',
  version: '1.0.1',
  // add nyo pa ibang config
};

module.exports.run = async function ({ api, event, args }) {
  const { threadID, messageID, senderID } = event;
  const prompt = args.join(" ");
  try {
    const info = await api.getUserInfo(senderID);
    const name = info[senderID].name;
    const ress = await get("https://jn-apis.onrender.com/api/gpt", {
params: {
      prompt,
      name,
      id: senderID
}
    });
    const { av, result } = ress.data;
 const res = Array.isArray(result) ? JSON.stringify(result, null, 2) : result.replace(/!🐥/g, "?");
 if (av) {
   let image = [];
  if (Array.isArray(av)) {
image = await Promise.all(av.map(async (url) => {
    const re = await get(url, { responseType: 'stream' });
 re.data.path = `${Date.now()}-${url.split('/').pop()}`;
     return re.data;
     }));
      } else {
  const re = await get(av, { responseType: 'stream' });
 image = [re.data];
      }
  api.sendMessage({
   body: res,
 attachment: image,
 mentions: [{ id: senderID, tag: name }]
      }, threadID, messageID);
    } else {
   api.sendMessage({
  body: res,
   mentions: [{ id: senderID, tag: name }]
 }, threadID, messageID);
 }
  } catch (error) {
    api.sendMessage(error.message, threadID, messageID);
  }
};
