const axios = require("axios");
module.exports.config = {
  name: 'ai',
  version: '1.0.1', 
};

module.exports.run = async function ({ api, event, args }) {
  const { threadID, messageID, senderID: id } = event;
  const prompt = args.join(" ");
  const axios = require("axios");
  try {
    const info = await api.getUserInfo(id);
    const name = info[id].name;
    const r = await axios.post("https://jn-ai.onrender.com/ai", {
     prompt,
      apikey: "jnKey-W1RLIQnZ5Z", 
      name,
      id
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
    console.error(error.message); 
    api.sendMessage("something went wrong", threadID); 
  }
};