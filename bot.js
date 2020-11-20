'use strict';

const Discord = require('discord.js');
const client = new Discord.Client();

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
  client.channels.get('766236790930669568').send('BOT TEST');
});
 
 
client.on('message', message => {
  var prefix = '!'
  var msg = message.content;

  if (msg === prefix + 'test') {
      message.channel.send('TEST' );
  }

  console.log(msg);
});


const fetchTimeout = require('fetch-timeout');
const { paddedFullWidth, errorWrap } = require('./utils.js');

if (Discord.version.startsWith('12.')) {
  
  Discord.RichEmbed = Discord.MessageEmbed;
  Discord.TextChannel.prototype.fetchMessage = function(snowflake) { 
    return this.messages.fetch.apply(this.messages,[snowflake]);
    
  }
  Object.defineProperty(Discord.User.prototype,'displayAvatarURL',{
    'get': function() {
      return this.avatarURL();
    }
  })
  
}

const LOG_LEVELS = {
  'ERROR': 3,
  'INFO': 2,
  'DEBUG': 1,
  'SPAM': 0
}

const BOT_CONFIG = {
  'apiRequestMethod': 'sequential',
  'messageCacheMaxSize': 50,
  'messageCacheLifetime': 0,
  'messageSweepInterval': 0,
  'fetchAllMembers': false,
  'disableEveryone': true,
  'sync': false,
  'restWsBridgeTimeout': 5000, 
  'restTimeOffset': 300,
  'disabledEvents': [
    'CHANNEL_PINS_UPDATE',
    'TYPING_START'
  ],
  'ws': {
    'large_threshold': 100,
    'compress': true
  }
}

const USER_AGENT = `Roofstad bot ${require('./package.json').version} , Node ${process.version} (${process.platform}${process.arch})`;

exports.start = function(SETUP) {
  const URL_SERVER = SETUP.URL_SERVER;

  const URL_PLAYERS = new URL('/players.json',SETUP.URL_SERVER).toString();
  const URL_INFO = new URL('/info.json',SETUP.URL_SERVER).toString();
  const MAX_PLAYERS = 256;
  const TICK_MAX = 1 << 9; 
  const FETCH_TIMEOUT = 900;
  const FETCH_OPS = {
    'cache': 'no-cache',
    'method': 'GET',
    'headers': { 'User-Agent': USER_AGENT }
  };

  const LOG_LEVEL = SETUP.LOG_LEVEL !== undefined ? parseInt(SETUP.LOG_LEVEL) : LOG_LEVELS.INFO;
  const BOT_TOKEN = SETUP.BOT_TOKEN;
  const CHANNEL_ID = SETUP.CHANNEL_ID;
  const MESSAGE_ID = SETUP.MESSAGE_ID;
  const SUGGESTION_CHANNEL = SETUP.SUGGESTION_CHANNEL;
  const BUG_CHANNEL = SETUP.BUG_CHANNEL;
  const BUG_LOG_CHANNEL = SETUP.BUG_LOG_CHANNEL;
  const LOG_CHANNEL = SETUP.LOG_CHANNEL;
  const STREAM_URL = SETUP.STREAM_URL;
  const STREAM_CHANNEL = SETUP.STREAM_CHANNEL;
  const UPDATE_TIME = 2500; 

  var TICK_N = 0;
  var MESSAGE;
  var LAST_COUNT;
  var STATUS;

  var STREAM_DISPATCHER = undefined;

  var loop_callbacks = []; 

  const log = function(level,message) {
    if (level >= LOG_LEVEL) console.log(`${new Date().toLocaleString()} :${level}: ${message}`);
  };

  const getPlayers = function() {
    return new Promise((resolve,reject) => {
      fetchTimeout(URL_PLAYERS,FETCH_OPS,FETCH_TIMEOUT).then((res) => {
        res.json().then((players) => {
          resolve(players);
        }).catch(reject);
      }).catch(reject);
    })
  };

  const getVars = function() {
    return new Promise((resolve,reject) => {
      fetchTimeout(URL_INFO,FETCH_OPS,FETCH_TIMEOUT).then((res) => {
        res.json().then((info) => {
          resolve(info.vars);
        }).catch(reject);
      }).catch(reject);
    });
  };

  const bot = new Discord.Client(BOT_CONFIG);

  const sendOrUpdate = function(embed) {
    if (MESSAGE !== undefined) {
      MESSAGE.edit(embed).then(() => {
        log(LOG_LEVELS.DEBUG,'Update success');
      }).catch(() => {
        log(LOG_LEVELS.ERROR,'Update failed');
      })
    } else {
      let channel = bot.channels.get(CHANNEL_ID);
      if (channel !== undefined) {
        channel.fetchMessage(MESSAGE_ID).then((message) => {
          MESSAGE = message;
          message.edit(embed).then(() => {
            log(LOG_LEVELS.SPAM,'Update success');
          }).catch(() => {
            log(LOG_LEVELS.ERROR,'Update failed');
          });
		  
        }).catch(() => {
          channel.send(embed).then((message) => {
            MESSAGE = message;
            log(LOG_LEVELS.INFO,`Sent message (${message.id})`);
          }).catch(console.error);
        })
      } else {
        log(LOG_LEVELS.ERROR,'Update channel not set');
      }
    }
  };
          
  const client = new Discord.Client();

    client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
    });
 
    client.on('message', msg => {
    if (msg.content == 'ping') {
    msg.reply('Pong!');
    msg.channel.reply("pong");
    }
    console.log(msg.content);
  });
 
  const UpdateEmbed = function() {

    let dot = TICK_N % 2 === 0 ? 'x' : 'Roleplay';   /// kendinize göre düzenleyin
    let embed = new Discord.RichEmbed()
    .setAuthor("x Roleplay Sunucu Durumu", "https://media.discordapp.net/attachments/761338135195025418/772210604789596160/a_81cdad2d2a5c410fc56fb5594433a885.png")
    .setColor(0x2894C2)
    .setFooter(TICK_N % 2 === 0 ? '⚪ x Roleplay' : '⚫ x Roleplay')
    .addField('\n\u200b\nSunucu Durumu Nedir?','Sunucu durumu aşağıdaki gibidir.',false)
    if (STATUS !== undefined)
    {
      embed.addField(':warning: Actuele server status:',`${STATUS}\n\u200b\n`);
      embed.setColor(0xff5d00)
    }
    return embed;
  };
  
  const aktif = function() {

    let dot = TICK_N % 2 === 0 ? 'x' : 'Roleplay';  /// kendinize göre düzenleyin
    let embed = new Discord.RichEmbed()
    .setAuthor("Sunucu Aktif!", "https://media.discordapp.net/attachments/761338135195025418/772210604789596160/a_81cdad2d2a5c410fc56fb5594433a885.png")
    .setColor(0x2894C2)
    .setFooter(TICK_N % 2 === 0 ? '⚪ x Roleplay' : '⚫ x Roleplay')
	.setImage('https://cdn.discordapp.com/attachments/733322301013098507/736014485008941087/aktif.gif')
    .addField('\n\u200b\n:white_check_mark: Sunucu aktiftir... :white_check_mark:','Giriş yapabilirsiniz. ' ,false)
    return embed;
  };
  
  const bakim = function() {

    let dot = TICK_N % 2 === 0 ? 'x' : 'Roleplay';  /// kendinize göre düzenleyin
    let embed = new Discord.RichEmbed()
    .setAuthor("Sunucu Bakımda!", "https://media.discordapp.net/attachments/761338135195025418/772210604789596160/a_81cdad2d2a5c410fc56fb5594433a885.png")
    .setColor(0x2894C2)
    .setFooter(TICK_N % 2 === 0 ? '⚪ x Roleplay' : '⚫ x Roleplay')
	.setImage('https://cdn.discordapp.com/attachments/733322301013098507/736014485008941087/aktif.gif')
    .setTimestamp(new Date())
    .addField('\n\u200b\n:hammer_pick: Sunucu bakımdadır... :hammer_pick:','Aktif olduğunda bu kanaldan duyurulacaktır. ' ,false)
    return embed;
  };
  
   const res = function() {

    let dot = TICK_N % 2 === 0 ? 'x' : 'Roleplay';  /// kendinize göre düzenleyin
    let embed = new Discord.RichEmbed()
    .setAuthor("Sunucuya Restart Atılmıştır!", "https://media.discordapp.net/attachments/761338135195025418/772210604789596160/a_81cdad2d2a5c410fc56fb5594433a885.png")
    .setColor(0x2894C2)
    .setFooter(TICK_N % 2 === 0 ? '⚪ x Roleplay' : '⚫ x Roleplay')
	.setImage('https://cdn.discordapp.com/attachments/733322301013098507/736014485008941087/aktif.gif')
    .setTimestamp(new Date())
    .addField('\n\u200b\n:wrench: Sunucu restart sürecindedir. :wrench:','Aktif olduğunda bu kanaldan duyurulacaktır. ' ,false)
    return embed;
  };

  const offline = function() {
    log(LOG_LEVELS.SPAM,Array.from(arguments));
    if (LAST_COUNT !== null) log(LOG_LEVELS.INFO,`Server offline ${URL_SERVER} (${URL_PLAYERS} ${URL_INFO})`);
    let embed = UpdateEmbed()
    .setColor(0xff0000)
    .addField('Server Status',':x: Kapalı',true)
    .addField('Oyuncu','?\n\u200b\n',true);
    sendOrUpdate(embed);
    LAST_COUNT = null;
  };

  const updateMessage = function() {
    getVars().then((vars) => {
      getPlayers().then((players) => {
        if (players.length !== LAST_COUNT) log(LOG_LEVELS.INFO,`${players.length} players`);
        let queue = vars[	'Queue'];
        let embed = UpdateEmbed()
        .addField('Sunucu Durumu',':white_check_mark: Aktif',true)
        .addField('Online Oyuncu',`${players.length}/${MAX_PLAYERS}\n\u200b\n`,true);
        
        if (players.length > 0) {
         
        }
        sendOrUpdate(embed);
        LAST_COUNT = players.length;
      }).catch(offline);
    }).catch(offline);
    TICK_N++;
    if (TICK_N >= TICK_MAX) {
      TICK_N = 0;
    }
    for (var i=0;i<loop_callbacks.length;i++) {
      let callback = loop_callbacks.pop(0);
      callback();
    }
  };

  bot.on('ready',() => {
    log(LOG_LEVELS.INFO,'Started...');
    bot.user.setActivity('Dupe yapanları', { type: 'WATCHING' });   /// oyun etkinliği
    bot.generateInvite(['ADMINISTRATOR']).then((link) => {
      log(LOG_LEVELS.INFO,`Invite URL - ${link}`);
    }).catch(null);
   
  });
 

//BURASI MESAJ KOMUTLARI YERİ

  bot.on('message', msg => {
    if (msg.content == 'ping') {
    msg.reply('Pong!');
 
    }
    if (msg.content == 'sa') {
      msg.reply('Aleyküm Selam.');
      
      }
	if (msg.content == 'SA') {
      msg.reply('Aleyküm Selam.');
      
      }
	if (msg.content == 'Sa') {
      msg.reply('Aleyküm Selam.');
      
      }
	if (msg.content == 's.a.') {
      msg.reply('Aleyküm Selam.');
      
      } 
    if (msg.content == 'günaydın') {
      msg.reply('Günaydın.');
      
      }  
    if (msg.content == 'günaydın') {
      msg.reply('Günaydın.');
      
      }  
    if (msg.content == 'iyi geceler') {
      msg.reply('iyi Geceler.');
      
      }  
    if (msg.content == 'İyi geceler') {
      msg.reply('iyi Geceler.');
      
      }  	  
	if (msg.content == '.bakım') {
		
	    var yetki = 0;
        if(msg.member.roles.some(r=>["*","Founder","CO-Founder","🏁","Senior Developer","🔱 Director","🚨 Administrator","Discord Staff","."].includes(r.name)) ) {   /// discord permlerinize göre ayarlayın
          
		
		msg.channel.send(bakim());
		  
        } else {
          msg.reply("Bu komutu kullanmaya iznin yok. xBOT");
        }
         
        
        }

    if (msg.content == '.restart') {
		
	    var yetki = 0;
        if(msg.member.roles.some(r=>["Founder","CO-Founder","🏁","Senior Developer","🔱 Director","🚨 Administrator","Discord Staff","."].includes(r.name)) ) {
          
		
		msg.channel.send(res());
		  
        } else {
          msg.reply("Bu komutu kullanmaya iznin yok. xBOT");
        }
         
        
        }
		
	if (msg.content == '.aktif') {
		
	    var yetki = 0;
        if(msg.member.roles.some(r=>["Founder","CO-Founder","🏁","Senior Developer","🔱 Director","🚨 Administrator","Discord Staff","."].includes(r.name)) ) {
          
		
		msg.channel.send(aktif());
		  
        } else {
          msg.reply("Bu komutu kullanmaya iznin yok. xBOT");
        }
         
        
        }
       
	  
      if (msg.content == '.durum') { 

        var yetki = 0;
        if(msg.member.roles.some(r=>["Founder","CO-Founder","🏁","Senior Developer","🔱 Director","🚨 Administrator","Discord Staff","."].includes(r.name)) ) {
         
          yetki = 1;
        } else {
          yetki = 0;
          msg.reply("Bu komutu kullanmaya iznin yok. xBOT");
        }
      if(yetki == 1){
        getVars().then((vars) => {
          getPlayers().then((players) => {
            if (players.length !== LAST_COUNT) log(LOG_LEVELS.INFO,`${players.length} players`);
            let queue = vars[	'Queue'];
            msg.channel.send(UpdateEmbed().addField('Sunucu Durumu',':white_check_mark: Aktif',true).addField('Online Oyuncu',`${players.length}/${MAX_PLAYERS}\n\u200b\n`,true));
     
            if (players.length > 0) {
             
    
            }
            sendOrUpdate(embed);
            LAST_COUNT = players.length;
          }).catch(offline);
        }).catch(offline);
        TICK_N++;
        if (TICK_N >= TICK_MAX) {
          TICK_N = 0;
        }
        for (var i=0;i<loop_callbacks.length;i++) {
          let callback = loop_callbacks.pop(0);
          callback();
        }
      }}
  });

 

  

  function checkLoop() {
    return new Promise((resolve,reject) => {
      var resolved = false;
      let id = loop_callbacks.push(() => {
        if (!resolved) {
          resolved = true;
          resolve(true);
        } else {
          log(LOG_LEVELS.ERROR,'Loop callback called after timeout');
          reject(null);
        }
      })
      setTimeout(() => {
        if (!resolved) {
          resolved = true;
          resolve(false);
        }
      },3000);
    })
  }

  bot.on('debug',(info) => {
    log(LOG_LEVELS.SPAM,info);
  })

  bot.on('error',(error,shard) => {
    log(LOG_LEVELS.ERROR,error);
  })

  bot.on('warn',(info) => {
    log(LOG_LEVELS.DEBUG,info);
  })

  bot.on('disconnect',(devent,shard) => {
    log(LOG_LEVELS.INFO,'Disconnected');
    checkLoop().then((running) => {
      log(LOG_LEVELS.INFO,`Loop still running: ${running}`);
    }).catch(console.error);
  })

  bot.on('reconnecting',(shard) => {
    log(LOG_LEVELS.INFO,'Reconnecting');
    checkLoop().then((running) => {
      log(LOG_LEVELS.INFO,`Loop still running: ${running}`);
    }).catch(console.error);
  })

  bot.on('resume',(replayed,shard) => {
    log(LOG_LEVELS.INFO,`Resuming (${replayed} events replayed)`);
    checkLoop().then((running) => {
      log(LOG_LEVELS.INFO,`Loop still running: ${running}`);
    }).catch(console.error);
  })

  bot.on('rateLimit',(info) => {
    log(LOG_LEVELS.INFO,`Rate limit hit ${info.timeDifference ? info.timeDifference : info.timeout ? info.timeout : 'Unknown timeout '}ms (${info.path} / ${info.requestLimit ? info.requestLimit : info.limit ? info.limit : 'Unkown limit'})`);
    if (info.path.startsWith(`/channels/${CHANNEL_ID}/messages/${MESSAGE_ID ? MESSAGE_ID : MESSAGE ? MESSAGE.id : ''}`)) bot.emit('restart');
    checkLoop().then((running) => {
      log(LOG_LEVELS.DEBUG,`Loop still running: ${running}`);
    }).catch(console.error);
  })
  
  bot.on('message', async function (msg) {
    if (msg.channel.id === '586631869928308743') {
        await msg.react(bot.emojis.get('587057796936368128'));
        await msg.react(bot.emojis.get('595353996626231326'));
    }
});

  bot.on('message',(message) => {
    if (!message.author.bot) {
      if (message.member) {
        if (message.member.hasPermission('ADMINISTRATOR')) {
          if (message.content.startsWith('+status ')) {
            let status = message.content.substr(7).trim();
            let embed =  new Discord.RichEmbed()
            .setAuthor(message.member.nickname ? message.member.nickname : message.author.tag,message.author.displayAvatarURL)
            .setColor(0x2894C2)
            .setTitle('Updated status message')
            .setTimestamp(new Date());
            if (status === 'clear') {
              STATUS = undefined;
              embed.setDescription('Cleared status message');
            } else {
              STATUS = status;
              embed.setDescription(`New message:\n\`\`\`${STATUS}\`\`\``);
            }
            bot.channels.get(LOG_CHANNEL).send(embed);
            return log(LOG_LEVELS.INFO,`${message.author.username} updated status`);
          }
        }
        if (message.channel.id === SUGGESTION_CHANNEL) {
          let embed = new Discord.RichEmbed()
          .setAuthor(message.member.nickname ? message.member.nickname : message.author.tag,message.author.displayAvatarURL)
          .setColor(0x2894C2)
          .setTitle('Suggestie')
          .setDescription(message.content)
          .setTimestamp(new Date());
          message.channel.send(embed).then((message) => {
            const sent = message;
            sent.react('👍').then(() => {
              sent.react('👎').then(() => {
                log(LOG_LEVELS.SPAM,'Completed suggestion message');
              }).catch(console.error);
            }).catch(console.error);
          }).catch(console.error);
          return message.delete();
        }
        if (message.channel.id === BUG_CHANNEL) {
          let embedUser = new Discord.RichEmbed()
          .setAuthor(message.member.nickname ? message.member.nickname : message.author.tag,message.author.displayAvatarURL)
          .setColor(0x2894C2)
          .setTitle('Bug Report')
          .setDescription('Je bericht is succesvol gestuurd naar het staff-team!')
          .setTimestamp(new Date());
          let embedStaff = new Discord.RichEmbed()
          .setAuthor(message.member.nickname ? message.member.nickname : message.author.tag,message.author.displayAvatarURL)
          .setColor(0x2894C2)
          .setTitle('Bug Report')
          .setDescription(message.content)
          .setTimestamp(new Date());
          message.channel.send(embedUser).then(null).catch(console.error);
          bot.channels.get(BUG_LOG_CHANNEL).send(embedStaff).then(null).catch(console.error);
          return message.delete();
        }
      }
    }
  });

  bot.login(BOT_TOKEN).then(null).catch(() => {
    log(LOG_LEVELS.ERROR,'Unable to login check your login token');
    console.error(e);
    process.exit(1);
  });

  return bot;
}
