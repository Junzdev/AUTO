module.exports.config = {
  name: 'ai',
  version: '1.0.1', 
//add more config
};

module.exports.run = async function ({ api, event, args }) {
  const { threadID, messageID, senderID } = event;
  const prompt = args.join(" ");
  const axios = require("axios");
  try {
    const info = await api.getUserInfo(senderID);
    const name = info[senderID].name;
    const r = await axios.post("https://jnai.onrender.com/ai/v2", {
      prompt,
      apikey: "jnKey-43p6mGCLjq",
      name,
      id: senderID
    });
    const { av, result } = r.data;
    const message = result.replace(/!🐥/g, this.config.name);
    if (av) {
    let image = [];
     if (Array.isArray(av)) {
        image = await Promise.all(av.map(async (url) => {
          const re = await axios.get(url, { responseType: 'stream' });
          re.data.path = `${Date.now()}-${url.split('/').pop()}`;
          return re.data;
        }));
      } else {
     const re = await axios.get(av, { responseType: 'stream' });
        image = [re.data];
      }
      api.sendMessage({ body: message, attachment: image,
mentions: [{id: senderID, tag: name}]}, threadID, messageID);
    } else {
      api.sendMessage({ body: message,
mentions: [{id: senderID, tag: name}]}, threadID, messageID);
    }
  } catch (error) {
    console.error("Error in AI module:", error);
    api.sendMessage("something went wrong", threadID);
  }
};
