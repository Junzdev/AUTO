const axios = require("axios");
module.exports.config = { name: 'ai', version: '1.0.1' };

module.exports.run = async ({ api, event, args }) => {
  const { threadID, messageID, senderID: id } = event;
  const prompt = args.join(" ");
  try {
   const { [id]: { name } } = await api.getUserInfo(id);
    const { data: { av, result } } = await axios.post("https://jn-ai.onrender.com/ai", {
  prompt, apikey: "jnKey-43p6mGCLjq", name, id
  });
 const attachments = av ? Array.isArray(av) ? await Promise.all(av.map(async url => {
      const { data } = await axios.get(url, { responseType: 'stream' });
  data.path = `${Date.now()}-${url.split('/').pop()}`;
    return data;
 })) : [{ data: (await axios.get(av, { responseType: 'stream' })).data, path: `${Date.now()}.png` }] : [];
 api.sendMessage({ body: result.replace(/{pn}/g, "ai"), attachment: attachments }, threadID, messageID);
  } catch (error) {
  console.error(error.message);
 api.sendMessage(error.message, threadID);
  }
};
