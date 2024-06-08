const { get, post } = require("axios");

module.exports.config = {
  name: 'ai',
  version: '1.0.1',
};

module.exports.run = async function ({ api, event, args }) {
  const { threadID, messageID, senderID } = event;
  const prompt = args.join(" ");
  try {
    const info = await api.getUserInfo(senderID);
    const name = info[senderID].name;
    const { data } = await post("https://jn-ai.onrender.com/ai", {
      prompt,
      apikey: "jnKey-W1RLIQnZ5Z",
      name,
      id
    });
    const av = data.av;
    const result = Array.isArray(data.result) 
      ? JSON.stringify(data.result, null, 2) 
      : data.result.replace(/{pn}/g, this.config.name);
    
    let attachments = [];
    if (data.av) {
      if (Array.isArray(data.av)) {
        const imagePromises = av.map(async url => {
          const re = await get(url, { responseType: 'stream' });
          re.data.path = `${Date.now()}-${url.split('/').pop()}`;
          return re.data;
        });
        attachments = await Promise.all(imagePromises);
      } else {
        const imageRes = await get(av, { responseType: 'stream' });
        attachments = [imageRes.data];
      }
    }

    api.sendMessage({ body: result, attachment: attachments }, threadID, messageID);
  } catch (error) {
    console.error(error.message);
    api.sendMessage("Something went wrong", threadID);
  }
};
