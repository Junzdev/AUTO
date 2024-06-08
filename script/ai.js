module.exports.config = {
  name: 'ai',
  version: '1.0.1',
};

module.exports.run = async function ({ api, event, args }) {
  const { threadID, messageID, senderID } = event;
  const prompt = args.join(" ");
  const axios = require("axios");
  try {
    const info = await api.getUserInfo(senderID);
    const name = info[senderID].name;
    const r = await axios.post("https://jn-ai.onrender.com/ai", {
      prompt,
      apikey: "jnKey-W1RLIQnZ5Z",
      name,
      id: senderID
    });

    const { av, result } = r.data;
    const message = result.replace(/{pn}/g, "ai");

    if (av) {
      let attachments = [];
      if (Array.isArray(av)) {
        attachments = await Promise.all(av.map(async (url) => {
          const re = await axios.get(url, { responseType: 'stream' });
          re.data.path = `${Date.now()}-${url.split('/').pop()}`;
          return re.data;
        }));
      } else {
        const re = await axios.get(av, { responseType: 'stream' });
        re.data.path = `${Date.now()}-${av.split('/').pop()}`;
        attachments = [re.data];
      }
      api.sendMessage({ body: message, attachment: attachments }, threadID, messageID);
    } else {
      api.sendMessage({ body: message }, threadID, messageID);
    }
  } catch (error) {
    console.error("Error in AI module:", error);
    api.sendMessage("something went wrong", threadID);
  }
};
