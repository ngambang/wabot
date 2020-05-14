let RiveScript = require("rivescript");
const express  = require('express')

const app = express()
const port = 8000
app.listen(port, () => console.log(`Aplikasi berjalan di http://localhost:${port}`))

app.use(express.json());
var bot = new RiveScript({utf8: true});
bot.unicodePunctuation = new RegExp(/[~]/)
bot.loadFile([
  "database/hi.rive",
  "database/cari_wiki.rive",
  "database/cmd.rive"
]).then(loading_done).catch(loading_error);

function loading_done() {
  console.log("Database chat sudah siap");

  bot.sortReplies();
  let username = "local-user";
 
  app.post('/api-chat', async (req, res) => {

        data_dikirim = req.body;
        text = (data_dikirim['text'])?data_dikirim['text']:"";
        kirimChat = await bot.reply(username, text).then(function(reply) {

            return reply;
            
        });

        
        res.send(kirimChat);

  })
  
}
 
function loading_error(error, filename, lineno) {
  console.log("Error when loading files: " + error);
}