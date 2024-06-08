const axios = require("axios");
module.exports.config = { name: 'ai', version: '1.0.1' };
module.exports.run = async ({ api, event, args }) => {
  const { threadID, messageID, senderID: id } = event;
  const prompt = args.join(" ");
  try {
    const { [id]: { name } } = await api.getUserInfo(id);
    const { data: { av, result } } = await axios.post("https://jn-ai.onrender.com/ai", { prompt, apikey: "jnKey-43p6mGCLjq", name, id });
    const r = Array.isArray(result) ? JSON.stringify(result, null, 2) : result.replace(/{pn}/g, prompt);
    const o = { body: r, mentions: [{ id, tag: name }] };
    if (av) o.attachment = Array.isArray(av) ? await Promise.all(av.map(async (i) => (await axios.get(i, { responseType: 'stream' })).data)) : (await axios.get(av, { responseType: 'stream' })).data;
    api.sendMessage(o, threadID, messageID);
  } catch (error) {
    console.error(error.message);
    api.sendMessage(error.message, threadID);
  }
};
