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
params: {
      prompt,
      apikey: "jnKey-W1RLIQnZ5Z", 
      name,
      id: senderID
}
    });
const av = r.data.av; 
    const result = r.data.result.replace(/{pn}/g, "ai");
    let attachments = [];
    if (av) {
      if (Array.isArray(av)) {
   const image = av.map(async url => {
          const re = await axios.get(url, { responseType: 'stream' });
   re.data.path = `${Date.now()}-${url.split('/').pop()}`; 
   return re.data;
        });
        attachments = await Promise.all(image);
      } else {
        const imageRes = await axios.get(av, { responseType: 'stream' });
       imageRes.data.path = `${Date.now()}.png`;
        attachments = [imageRes.data]; 
      }
    }   
    api.sendMessage({ body: result, attachment: attachments }, threadID, messageID);
  } catch (error) {
    console.error("Error in AI module:", error); 
    api.sendMessage("something went wrong", threadID); 
  }
};