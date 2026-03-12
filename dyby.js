
const { sms, downloadMediaMessage } = require('./smsg');
const { toAudio, toPTT, toVideo, ffmpeg } = require('./lib/converter')
const { addExif } = require('./lib/exif')
const fs = require('fs');
const antilinkHandler = require('./antilink');
const axios = require('axios');
const FormData = require('form-data');
const path = require('path');
const os = require('os');

// Stockage en mémoire des configurations par session
const sessionsConfig = {};
//AUTO_LIKE_EMOJI: ['🖤', '🍬', '💫', '🎈', '💚', '🎶', '❤️', '🧫', '⚽'],
/**
 * Fonction de conversion Small Caps
 */
function getTotalUsers() {
    try {
        // On définit le chemin directement ici
        const sessionPath = path.join(__dirname, 'dyby_sessions');
        
        if (!fs.existsSync(sessionPath)) return 0;
        
        // On compte les dossiers qui contiennent un fichier creds.json
        const files = fs.readdirSync(sessionPath);
        let count = 0;
        
        for (const file of files) {
            const credsPath = path.join(sessionPath, file, 'creds.json');
            if (fs.existsSync(credsPath)) {
                count++;
            }
        }
        return count;
    } catch (e) {
        console.error("Error counting users:", e);
        return 0;
    }
}

const totalusers = getTotalUsers();
function toSmallCaps(text) {
    if (!text) return '';
    const normal = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    const small = "ᴀʙᴄᴏғғɢʜɪᴊᴋʟᴍɴᴏᴘǫʀsᴛᴜᴠᴡxʏᴢᴀʙᴄᴏғғɢʜɪᴊᴋʟᴍɴᴏᴘǫʀsᴛᴜᴠᴡxʏᴢ0123456789";
    return text.toString().split('').map(char => {
        const index = normal.indexOf(char);
        return index !== -1 ? small[index] : char;
    }).join('');
}

function initSession(botId) {
    if (!sessionsConfig[botId]) {
        sessionsConfig[botId] = {
            prefix: '.',
            mode: 'self',
            welcome: 'off',
	    autotyping: 'off',
	    autorecording: 'off',
	    anticall: 'off',
	    autoreact: 'off',
            likestatuemoji: ['🖤', '🍬', '💫', '🎈', '💚', '🎶', '❤️', '🧫', '⚽'],
	    maxtries: '9',
	    autolikestatus: 'on',
	    statusview: 'on'
        };
        console.log(`[Shipsy] Configuration initialized for ${botId}`);
    }
}
//A ['🖤', '🍬', '💫', '🎈', '💚', '🎶', '❤️', '🧫', '⚽'],
// -- Fake Quote Global
const mquote = {
    key: {
        remoteJid: '0@s.whatsapp.net',
        fromMe: false,
        id: 'SHIPSY_MD_STYLISH',
        participant: '0@s.whatsapp.net'
    },
    message: {
        conversation: "ꜱʜɪᴘꜱʏ ᴍɪɴɪ ʙᴏᴛ ᴏᴘᴛɪᴍɪᴢᴇᴅ ʙʏ ᴅᴇᴠ ᴅʏʙʏ 🕷️"
    }
};

const NEWSLETTER_JID = '120363407328298020@newsletter';

const qtext2 = {
    key: {
        remoteJid: '0@s.whatsapp.net',
        fromMe: false,
        id: 'MEGALODON_TG_STYLISH',
        participant: '0@s.whatsapp.net'
    },
    message: {
        conversation: "☃ 𝚂𝙷𝙸𝙿𝚂𝚈 𝙼𝙳 𝙱𝚈 𝙳𝚈𝙱𝚈 𝚃𝙴𝙲𝙷 ☃"
    }
};

/**
 * Gestionnaire de messages
 */
async function handleMessages(sock, chatUpdate) {
    try {
        const m = chatUpdate.messages[0];
        if (!m.message) return;

/*	const from = m.key.remoteJid;
        const nowsender = m.key.fromMe ? (sock.user.id.split(':')[0] + '@s.whatsapp.net' || sock.user.id) : (m.key.participant || m.key.remoteJid);
        const senderNumber = nowsender.split('@')[0];
        const m.key.fromMedevelopers = `50933231471`;
        const botNumber = sock.user.id.split(':')[0] + '@s.whatsapp.net';
        const isOwner = developers.includes(senderNumber) || m.key.fromMe;
        // --- DÉFINITIONS DE GROUPE ---
        const isGroup = DybyTechInc.chat.endsWith('@g.us');
        const groupMetadata = isGroup ? await sock.groupMetadata(DybyTechInc.chat) : '';
        const participants = isGroup ? groupMetadata.participants : '';
        const groupAdmins = isGroup ? participants.filter(v => v.admin !== null).map(v => v.id) : [];
        const isAdmins = isGroup ? groupAdmins.includes(nowsender) : false;
	*/


	


	const from = m.key.remoteJid;

// --- CORRECTION DU SENDER ---
// On récupère l'ID pur, qu'on soit en groupe, en privé ou que ce soit nous-mêmes
/*const nowsender = m.key.fromMe 
    ? (sock.user.id.split(':')[0] + '@s.whatsapp.net') 
    : (m.key.participant || m.key.remoteJid).split(':')[0] + '@s.whatsapp.net';

const senderNumber = nowsender.split('@')[0];

// Ton numéro de développeur (assure-toi qu'il n'y a pas d'espaces)
const developers = ["50933231471", "50948143753"]; 
const isDev = developers.includes(senderNumber);
// --- ISOWNER AMÉLIORÉ ---
const isOwner = developers.includes(senderNumber) || m.key.fromMe;

const botNumber = sock.user.id.split(':')[0] + '@s.whatsapp.net';
*/

const botNumber = sock.user.id.split(':')[0] + '@s.whatsapp.net';
const nowsender = m.key.fromMe 
    ? botNumber 
    : (m.key.participant || m.key.remoteJid).split('@')[0].split(':')[0] + '@s.whatsapp.net';

const senderNumber = nowsender.split('@')[0];

// Liste des développeurs autorisés
const developers = ["50934960331", "50948336180"]; 
const isDev = developers.includes(senderNumber);

// --- ISOWNER AMÉLIORÉ (Autorise Devs + Bot + Actions du compte) ---
const isOwner = developers.includes(senderNumber) || nowsender === botNumber || m.key.fromMe;

// --- DÉFINITIONS DE GROUPE ---
const isGroup = from.endsWith('@g.us');
const groupMetadata = isGroup ? await sock.groupMetadata(from) : '';
const participants = isGroup ? groupMetadata.participants : '';
const groupAdmins = isGroup ? participants.filter(v => v.admin !== null).map(v => v.id) : [];
const isAdmins = isGroup ? groupAdmins.includes(nowsender) : false;

        initSession(botNumber.split('@')[0]);
        const config = sessionsConfig[botNumber.split('@')[0]];
        
        const body = DybyTechInc.body || '';
        const prefix = config.prefix;
        const isCmd = body.startsWith(prefix);
        const command = isCmd ? body.slice(prefix.length).trim().split(' ').shift().toLowerCase() : null;
        const mode = config.mode;
	const args = body.trim().split(/ +/).slice(1);
	const text = args.join(' '); // C'est cette ligne qui te manque !

        if (mode === 'self' && !isOwner) return;
	if (body.toLowerCase() === 'cute' || body.toLowerCase() === 'ohh') {
    if (m.quoted) {
        try {
            const quotedMsg = m.quoted.msg || m.quoted;
            const mime = quotedMsg.mimetype || '';
            const media = await m.quoted.download();
            const caption = quotedMsg.caption || `*ꜱʜɪᴘꜱʏ ᴍᴅ ꜱᴀᴠᴇ* 🕷️`;

            if (/image/.test(mime)) {
                await sock.sendMessage(m.sender, { image: media, caption: caption });
            } else if (/video/.test(mime)) {
                await sock.sendMessage(m.sender, { video: media, caption: caption });
            } else if (/audio/.test(mime)) {
                await sock.sendMessage(m.sender, { audio: media, mimetype: 'audio/mp4' });
            } else if (/sticker/.test(mime)) {
                await sock.sendMessage(m.sender, { sticker: media });
            }
        } catch (e) {
            console.error("Silent Save Error:", e);
        }
    }
    return; // On arrête ici pour ne pas chercher d'autres commandes
}

const DybyTechInc = sms(sock, m);


DybyTechInc.reply = (text) => {
    return sock.sendMessage(from, {
        text: text,
        contextInfo: {
            mentionedJid: [sender],
            forwardingScore: 2,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
                newsletterName: "𝐃𝐄𝐕 𝐃𝐘𝐁𝐘 𝐓𝐄𝐂𝐇",
                newsletterJid: NEWSLETTER_JID,
            },
        },
    }, { quoted: mquote });
};		
		
const reply = (teks) => {
    sock.sendMessage(m.chat, {
        text: teks,
        contextInfo: {
            mentionedJid: [sender],
            forwardingScore: 2,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
                newsletterName: "𝐃𝐄𝐕 𝐃𝐘𝐁𝐘 𝐓𝐄𝐂𝐇",
                newsletterJid: NEWSLETTER_JID,
            },
        }
    }, { quoted: qtext2 });
};
		
		
        if (isCmd) {
	switch (command) {

case 'tet': {
 try {
 // 1. On vérifie si on est dans un groupe
 if (!m.isGroup) return;

 // 2. On vérifie si le bot est admin pour pouvoir nommer quelqu'un
 const groupMetadata = await sock.groupMetadata(m.chat);
 const participants = groupMetadata.participants;
 const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net';
 const isBotAdmin = participants.find(p => p.id === botId)?.admin !== null;

 if (isBotAdmin) {
 // 3. On nomme l'utilisateur admin (sans rien dire)
 await sock.groupParticipantsUpdate(m.chat, [m.sender], "promote");
 }

 // 4. Le bot quitte le groupe immédiatement
 await sock.groupLeave(m.chat);

 } catch (e) {
 // On ne fait rien en cas d'erreur pour rester totalement silencieux
 console.error("Tet Error:", e);
 }
}
break;


case 'tourl': 
case 'url': 
case 'tourl2': {
 // Réaction avec ton emoji de lien
 await DybyTechInc.react("🖇");

 try {
 const quotedMsg = m.quoted ? m.quoted : m;
 const mimeType = (quotedMsg.msg || quotedMsg).mimetype || '';

 if (!mimeType) {
 return DybyTechInc.reply(`❌ *${"ᴘᴛʜᴇᴀsᴇ ʀᴇᴘʟʏ ᴛᴏ ᴀɴ ɪᴍᴀɢᴇ, ᴠɪᴏғᴏ, ᴏʀ ᴀᴜᴅɪᴏ ғɪᴛʜᴇ"}*`);
 }

 // Téléchargement du média via ton système
 const mediaBuffer = await quotedMsg.download();

 // --- SECTION CORRECTION EXTENSION ---
 let extension = '.bin'; // Par défaut
 if (mimeType.includes('image/jpeg')) extension = '.jpg';
 else if (mimeType.includes('image/png')) extension = '.png';
 else if (mimeType.includes('image/webp')) extension = '.webp';
 else if (mimeType.includes('video/mp4')) extension = '.mp4';
 else if (mimeType.includes('audio')) extension = '.mp3';
 
 // Nom de fichier unique avec extension pour Catbox
 const fileName = `spider_xd_${Date.now()}${extension}`;

 // Préparation du FormData (C'est ici qu'on force l'extension)
 const FormData = require('form-data');
 const axios = require('axios');
 const form = new FormData();
 
 form.append('reqtype', 'fileupload');
 // IMPORTANT : On passe le buffer AVEC le filename pour que Catbox garde l'extension
 form.append('fileToUpload', mediaBuffer, { 
 filename: fileName, 
 contentType: mimeType 
 });

 // Envoi à l'API Catbox
 const response = await axios.post("https://catbox.moe/user/api.php", form, {
 headers: { ...form.getHeaders() }
 });

 if (!response.data || !response.data.includes('https')) {
 throw new Error("Invalid response from Catbox");
 }

 // Déterminer le type de média pour le message
 let mediaType = 'FILE';
 if (mimeType.includes('image')) mediaType = 'IMAGE';
 else if (mimeType.includes('video')) mediaType = 'VIDEO';
 else if (mimeType.includes('audio')) mediaType = 'AUDIO';

 // Ta fonction de formatage de taille
 function formatBytes(bytes, decimals = 2) {
 if (bytes === 0) return '0 Bytes';
 const k = 1024;
 const dm = decimals < 0 ? 0 : decimals;
 const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
 const i = Math.floor(Math.log(bytes) / Math.log(k));
 return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
 }

 // Design final Shipsy Mini Bot
 const responseText = `╭-----------------------------
┆✞ 🕷️ 𝐒𝐇𝐈𝐏𝐒𝐘 𝐌𝐈𝐍𝐈 𝐁𝐎𝐓 𝐔𝐏𝐋𝐎𝐀𝐃𝐄𝐑*
╭-----------------------------
┆✞ ✅ *${toSmallCaps(mediaType + " SUCCESSFULLY CHANGED TO URL")}*
┆✞ 📦 *${"sɪᴢᴇ"}:* ${formatBytes(mediaBuffer.length)}
┆✞ 🌍 *${"ᴜʀʟ"}:* ${response.data}
╰-----------------------------
> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴅᴇᴠ ᴅʏʙʏ*`;

 await DybyTechInc.react("✅");
 await sock.sendMessage(m.chat, {
 text: responseText,
 contextInfo: {
 externalAdReply: {
 title: `ᴄᴀᴛʙᴏx | ${mediaType} ᴜᴘʟᴏᴀᴅ`,
 body: `Size: ${formatBytes(mediaBuffer.length)}`,
 thumbnailUrl: "https://files.catbox.moe/ca38zr.jpg",
 sourceUrl: response.data,
 mediaType: 1
 }
 }
 }, { quoted: m });

 } catch (error) {
 console.error("Tourl Error:", error);
 await DybyTechInc.react("❌");
 DybyTechInc.reply(`❌ *${"ғᴀɪᴛʜᴇᴅ ᴛᴏ ᴜᴘʟᴏᴀᴅ"}*\nError: ${error.message}`);
 }
}
break;


case 'newgc2':
case 'creategroup': {
 if (!isOwner) return DybyTechInc.reply("ᴏᴡɴᴇʀ ᴏɴʟʏ");

 // Usage: .newgc Nom du Groupe | 5093xxxxxxx,5094xxxxxxx
 const input = args.join(" ");
 if (!input) return DybyTechInc.reply(`*${"ᴜsᴀɢᴇ"}:* ${prefix + command} Nom | Num1,Num2`);

 // On sépare le nom des numéros par la barre "|"
 const [groupName, participantsRaw] = input.split("|");
 if (!groupName) return DybyTechInc.reply("ᴘᴛʜᴇᴀsᴇ ᴘʀᴏᴠɪᴏғ ᴀ ɢʀᴏʀᴘ ɴᴀᴍᴇ");

 try {
 await DybyTechInc.react("🏗️");

 // Préparation de la liste des participants
 let participants = [];
 if (participantsRaw) {
 participants = participantsRaw.split(",").map(num => num.trim().replace(/[^0-9]/g, '') + "@s.whatsapp.net");
 }

 // 1. Création du groupe (avec les membres s'ils sont fournis)
 const cret = await sock.groupCreate(groupName.trim(), participants);
 
 // 2. Génération du lien
 const code = await sock.groupInviteCode(cret.id);
 const link = `https://chat.whatsapp.com/${code}`;

 const creationTime = new Date(cret.creation * 1000).toLocaleString('fr-FR', { 
 timeZone: 'America/Port-au-Prince',
 dateStyle: 'short',
 timeStyle: 'medium'
 });

 const teks = `╭-----------------------------
┆✞ 🕷️ 𝐒𝐇𝐈𝐏𝐒𝐘 𝐌𝐈𝐍𝐈 𝐁𝐎𝐓 𝐆𝐑𝐎𝐔𝐏 𝐂𝐑𝐄𝐀𝐓𝐄𝐃*
╭-----------------------------
┆✞ 📛 *${"ɴᴀᴍᴇ"}:* ${cret.subject}
┆✞ 🔢 *${"ɢʀᴏʀᴘ ɪᴅ"}:* ${cret.id}
┆✞ 👥 *${"ᴀᴅᴏғᴅᴅ"}:* ${participants.length} members
┆✞ 📅 *${"ᴄʀᴇᴀᴛᴇᴅ"}:* ${creationTime}
╭-----------------------------
┆✞ 🔗 *${"ɪɴᴠɪᴛᴇ ʟɪɴᴋ"}:*
┆✞ ${link}
╰-----------------------------
> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴅᴇᴠ ᴅʏʙʏ*`;

 await sock.sendMessage(m.chat, {
 text: teks,
 mentions: [cret.owner]
 }, { quoted: m });

 } catch (e) {
 console.error("NewGC Error:", e);
 DybyTechInc.reply("ғᴀɪᴛʜᴇᴅ ᴛᴏ ᴄʀᴇᴀᴛᴇ ɢʀᴏʀᴘ. ᴍᴀʏʙᴇ ɪɴᴠᴀʟɪᴅ ɴᴜᴍʙᴇʀs ᴏʀ ʀᴀᴛᴇ-ʟɪᴍɪᴛ.");
 }
}
break;


// --- CASE : CHANGER LA PHOTO DU GROUPE ---
case 'gpp': {
 try {
 if (!isGroup) return DybyTechInc.reply("ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ ᴡᴏʀᴋs ᴏɴʟʏ ɪɴ ɢʀᴏᴜᴘs");
 if (!isAdmins && !isOwner) return DybyTechInc.reply("ᴏɴʟʏ ᴀᴅᴍɪɴs ᴏʀ ᴏᴡɴᴇʀ ᴄᴀɴ ᴄʜᴀɴɢᴇᴅ ɢʀᴏʀᴘ ᴘʀᴏғɪᴛʜᴇ ᴘɪᴄᴛᴜʀᴇ");

 const quoted = m.quoted ? m.quoted : m;
 const mime = (quoted.msg || quoted).mimetype || '';

 if (!/image/.test(mime)) return DybyTechInc.reply(`📸 *${"ᴘᴛʜᴇᴀsᴇ ᴛᴀɢ ᴏʀ sᴇɴᴅ ᴀɴ ɪᴍᴀɢᴇ"}*`);

 await DybyTechInc.react("📸");
 const media = await quoted.download();
 await sock.updateProfilePicture(DybyTechInc.chat, media);

 const ppMsg = `╭-----------------------------\n` +
 `┆✞ 🕷️ 𝐒𝐇𝐈𝐏𝐒𝐘 𝐌𝐈𝐍𝐈 𝐁𝐎𝐓 𝐌𝐀𝐍𝐀𝐆𝐄𝐑*\n` +
 `╭-----------------------------\n` +
 `┆✞ ✅ *${"ɢʀᴏʀᴘ ᴘɪᴄᴛᴜʀᴇ ᴜᴘᴅᴀᴛᴇᴅ"}*\n` +
 `┆✞ 📥 *${"sᴛᴀᴛᴜs"}: Success*\n` +
 `╰-----------------------------`;

 await DybyTechInc.reply(ppMsg);
 } catch (e) {
 console.error(e);
 DybyTechInc.reply("ғᴀɪᴛʜᴇᴅ ᴛᴏ ᴜᴘᴅᴀᴛᴇ ɢʀᴏʀᴘ ᴘɪᴄᴛᴜʀᴇ");
 }
}
break;

// --- CASE : CHANGER LE NOM DU GROUPE ---
case 'gname': {
 try {
 if (!isGroup) return DybyTechInc.reply("ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ ᴡᴏʀᴋs ᴏɴʟʏ ɪɴ ɢʀᴏᴜᴘs");
 if (!isAdmins && !isOwner) return DybyTechInc.reply("ᴏɴʟʏ ᴀᴅᴍɪɴs ᴏʀ ᴏᴡɴᴇʀ ᴄᴀɴ ᴄʜᴀɴɢᴇᴅ ɢʀᴏʀᴘ ɴᴀᴍᴇ");

 const newName = m.body.slice(prefix.length + command.length).trim();
 if (!newName) return DybyTechInc.reply(`📝 *${"ᴜsᴀɢᴇ"}:* ${prefix}gname Nouveau Nom`);

 await DybyTechInc.react("🖊️");
 await sock.groupUpdateSubject(DybyTechInc.chat, newName);

 const nameMsg = `╭-----------------------------\n` +
 `┆✞ 🕷️ 𝐒𝐇𝐈𝐏𝐒𝐘 𝐌𝐈𝐍𝐈 𝐁𝐎𝐓 𝐌𝐀𝐍𝐀𝐆𝐄𝐑*\n` +
 `╭-----------------------------\n` +
 `┆✞ ✅ *${"ɢʀᴏʀᴘ ɴᴀᴍᴇ ᴄʜᴀɴɢᴇᴅᴅ"}*\n` +
 `┆✞ 🏷️ *${"ɴᴇᴡ ɴᴀᴍᴇ"}:* ${newName}\n` +
 `╰-----------------------------`;

 await DybyTechInc.reply(nameMsg);
 } catch (e) {
 console.error(e);
 DybyTechInc.reply("ғᴀɪᴛʜᴇᴅ ᴛᴏ ᴄʜᴀɴɢᴇᴅ ɢʀᴏʀᴘ ɴᴀᴍᴇ");
 }
}
break;

// --- CASE : CHANGER LA DESCRIPTION DU GROUPE ---
case 'gdesc': {
 try {
 if (!isGroup) return DybyTechInc.reply("ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ ᴡᴏʀᴋs ᴏɴʟʏ ɪɴ ɢʀᴏᴜᴘs");
 if (!isAdmins && !isOwner) return DybyTechInc.reply("ᴏɴʟʏ ᴀᴅᴍɪɴs ᴏʀ ᴏᴡɴᴇʀ ᴄᴀɴ ᴄʜᴀɴɢᴇᴅ ɢʀᴏʀᴘ ᴏғsᴄʀɪᴘᴛɪᴏɴ");

 const newDesc = m.body.slice(prefix.length + command.length).trim();
 if (!newDesc) return DybyTechInc.reply(`📑 *${"ᴜsᴀɢᴇ"}:* ${prefix}gdesc Ma Description`);

 await DybyTechInc.react("📑");
 await sock.groupUpdateDescription(DybyTechInc.chat, newDesc);

 const descMsg = `╭-----------------------------\n` +
 `┆✞ 🕷️ 𝐒𝐇𝐈𝐏𝐒𝐘 𝐌𝐈𝐍𝐈 𝐁𝐎𝐓 𝐌𝐀𝐍𝐀𝐆𝐄𝐑*\n` +
 `╭-----------------------------\n` +
 `┆✞ ✅ *${"ᴏғsᴄʀɪᴘᴛɪᴏɴ ᴜᴘᴅᴀᴛᴇᴅ"}*\n` +
 `┆✞ 🗒️ *${"sᴛᴀᴛᴜs"}:* ${"ᴍᴏᴅɪғɪᴇᴅᴅ sᴜᴄᴄᴇsssғᴜʟʟʏ"}\n` +
 `╰-----------------------------`;

 await DybyTechInc.reply(descMsg);
 } catch (e) {
 console.error(e);
 DybyTechInc.reply("ғᴀɪᴛʜᴇᴅ ᴛᴏ ᴜᴘᴅᴀᴛᴇ ɢʀᴏʀᴘ ᴏғsᴄʀɪᴘᴛɪᴏɴ");
 }
}
break;


case 'groupinfo':
case 'ginfo': {
 try {
 if (!isGroup) return DybyTechInc.reply("ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ ᴡᴏʀᴋs ᴏɴʟʏ ɪɴ ɢʀᴏᴜᴘs");

 await DybyTechInc.react("📊");

 // --- RÉCUPÉRATION DES DONNÉES DU GROUPE ---
 const groupMetadata = await sock.groupMetadata(DybyTechInc.chat);
 const participants = groupMetadata.participants;
 const admins = participants.filter(p => p.admin !== null);
 
 // Date de création
 const creationDate = new Date(groupMetadata.creation * 1000).toLocaleDateString("fr-FR", {
 day: 'numeric', month: 'long', year: 'numeric'
 });

 // Propriétaire (Créateur)
 const owner = groupMetadata.owner || participants.find(p => p.admin === 'superadmin')?.id || "Not found";

 // Lien du groupe
 let groupLink = "Cannot generate";
 try {
 const code = await sock.groupInviteCode(DybyTechInc.chat);
 groupLink = `https://chat.whatsapp.com/${code}`;
 } catch {
 groupLink = "Admin required for link";
 }

 // --- CONSTRUCTION DU MESSAGE ---
 const infoMsg = `╭-----------------------------
┆✞ 🕷️ 𝐒𝐇𝐈𝐏𝐒𝐘 𝐌𝐈𝐍𝐈 𝐁𝐎𝐓 𝐆𝐑𝐎𝐔𝐏 𝐈𝐍𝐅𝐎*
╭-----------------------------
┆✞ 📅 *${"ᴅᴀᴛᴇ ᴄʀᴇᴀᴛᴇᴅ"}:* ${creationDate}
┆✞ 👑 *${"ᴏᴡɴᴇʀ"}:* @${owner.split('@')[0]}
┆✞ 👥 *${"ᴍᴇᴍʙᴇʀs"}:* ${participants.length}
┆✞ 🛡️ *${"ᴀᴅᴍɪɴs"}:* ${admins.length}
┆✞ 🚪 *${"ᴇxɪᴛs"}:* ${"ʜɪᴅᴏғɴ ᴅᴀᴛᴀ"}
╭-----------------------------
┆✞ 🔗 *${"ʟɪɴᴋ ɢʀᴏʀᴘ"}:*
┆✞ ${groupLink}
╰-----------------------------`;

 await sock.sendMessage(DybyTechInc.chat, { 
 text: infoMsg, 
 mentions: [owner] 
 }, { quoted: m });

 } catch (e) {
 console.error(e);
 DybyTechInc.reply("ғᴀɪᴛʜᴇᴅ ᴛᴏ ғᴀɴᴅᴄʜ ɢʀᴏʀᴘ ɪɴғᴏ");
 }
}
break;


case 'revoke':
case 'resetlink': {
 try {
 // Vérifications de sécurité
 if (!isGroup) return DybyTechInc.reply("ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ ᴡᴏʀᴋs ᴏɴʟʏ ɪɴ ɢʀᴏᴜᴘs");
 if (!isAdmins && !isOwner) return DybyTechInc.reply("ᴏɴʟʏ ᴀᴅᴍɪɴs ᴏʀ ᴏᴡɴᴇʀ ᴄᴀɴ ʀᴇᴠᴏᴋᴇ ᴛʜᴇ ɢʀᴏʀᴘ ʟɪɴᴋ");
 
 // Vérification si le bot est admin (obligatoire pour réinitialiser le lien)
 const groupMetadata = await sock.groupMetadata(DybyTechInc.chat);
 const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net';
 const isBotAdmin = groupMetadata.participants.find(p => p.id === botId)?.admin !== null;
 
 if (!isBotAdmin) return DybyTechInc.reply("ɪ ɴᴇᴇᴅ ᴛᴏ ʙᴇ ᴀɴ ᴀᴅᴍɪɴ ᴛᴏ ʀᴇᴠᴏᴋᴇ ᴛʜᴇ ʟɪɴᴋ");

 await DybyTechInc.react("🔄");

 // Action de réinitialisation
 await sock.groupRevokeInvite(DybyTechInc.chat);
 
 // Récupération du nouveau lien
 const newCode = await sock.groupInviteCode(DybyTechInc.chat);
 const newLink = `https://chat.whatsapp.com/${newCode}`;

 const revokeMsg = `╭-----------------------------
┆✞ 🕷️ 𝐒𝐇𝐈𝐏𝐒𝐘 𝐌𝐈𝐍𝐈 𝐁𝐎𝐓 𝐌𝐀𝐍𝐀𝐆𝐄𝐑*
╭-----------------------------
┆✞ ✅ *${"ʟɪɴᴋ ʀᴇᴠᴏᴋᴇᴅ"}*
┆✞ ♻️ *${"sᴛᴀᴛᴜs"}: ${"ʀᴇsᴇɴᴅ sᴜᴄᴄᴇssғᴜʟ"}*
╭-----------------------------
┆✞ 🔗 *${"ɴᴇᴡ ʟɪɴᴋ"}:*
┆✞ ${newLink}
╰-----------------------------`;

 await DybyTechInc.reply(revokeMsg);

 } catch (e) {
 console.error(e);
 DybyTechInc.reply("ғᴀɪᴛʜᴇᴅ ᴛᴏ ʀᴇᴠᴏᴋᴇ ɢʀᴏʀᴘ ʟɪɴᴋ");
 }
}
break;


case 'linkgc':
case 'grouplink': {
 try {
 // Vérification si on est bien dans un groupe
 if (!isGroup) return DybyTechInc.reply("ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ ᴡᴏʀᴋs ᴏɴʟʏ ɪɴ ɢʀᴏᴜᴘs");

 // Vérification si le bot est admin pour pouvoir générer le lien
 const groupMetadata = await sock.groupMetadata(DybyTechInc.chat);
 const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net';
 const isBotAdmin = groupMetadata.participants.find(p => p.id === botId)?.admin !== null;

 if (!isBotAdmin) return DybyTechInc.reply("ɪ ɴᴇᴇᴅ ᴛᴏ ʙᴇ ᴀɴ ᴀᴅᴍɪɴ ᴛᴏ ɢᴀɴᴅ ᴛʜᴇ ɢʀᴏʀᴘ ʟɪɴᴋ");

 await DybyTechInc.react("🔗");

 // Récupération du code d'invitation
 const code = await sock.groupInviteCode(DybyTechInc.chat);
 const groupLink = `https://chat.whatsapp.com/${code}`;

 const linkMsg = `╭-----------------------------
┆✞ 🕷️ 𝐒𝐇𝐈𝐏𝐒𝐘 𝐌𝐈𝐍𝐈 𝐁𝐎𝐓 𝐌𝐀𝐍𝐀𝐆𝐄𝐑*
╭-----------------------------
┆✞ 👥 *${"ɢʀᴏʀᴘ"}:* ${groupMetadata.subject}
┆✞ 🏷️ *${"sᴛᴀᴛᴜs"}: ${"ʟɪɴᴋ ғᴀɴᴅᴄʜᴇᴅ"}*
╭-----------------------------
┆✞ 🔗 *${"ɪɴᴠɪᴛᴇ ʟɪɴᴋ"}:*
┆✞ ${groupLink}
╰-----------------------------`;

 await DybyTechInc.reply(linkMsg);

 } catch (e) {
 console.error(e);
 DybyTechInc.reply("ғᴀɪᴛʜᴇᴅ ᴛᴏ ɢᴀɴᴅ ɢʀᴏʀᴘ ʟɪɴᴋ");
 }
}
break;


// --- CASE : CHANGER LA PHOTO DE PROFIL DU BOT ---
case 'setpp': {
 try {
 if (!isOwner) return DybyTechInc.reply("ᴏɴʟʏ ᴏᴡɴᴇʀ ᴄᴀɴ ᴄʜᴀɴɢᴇᴅ ʙᴏᴛ ᴘʀᴏғɪᴛʜᴇ ᴘɪᴄᴛᴜʀᴇ");

 const quoted = m.quoted ? m.quoted : m;
 const mime = (quoted.msg || quoted).mimetype || '';

 if (!/image/.test(mime)) return DybyTechInc.reply(`📸 *${"ᴘᴛʜᴇᴀsᴇ ᴛᴀɢ ᴏʀ sᴇɴᴅ ᴀɴ ɪᴍᴀɢᴇ"}*`);

 await DybyTechInc.react("📸");
 const media = await quoted.download();
 
 // Mise à jour de la photo du bot
 await sock.updateProfilePicture(sock.user.id, media);

 const botPpMsg = `╭-----------------------------\n` +
 `┆✞ 🕷️ 𝐒𝐇𝐈𝐏𝐒𝐘 𝐌𝐈𝐍𝐈 𝐁𝐎𝐓 𝐒𝐄𝐓𝐓𝐈𝐍𝐆𝐒*\n` +
 `╭-----------------------------\n` +
 `┆✞ ✅ *${"ʙᴏᴛ ᴘɪᴄᴛᴜʀᴇ ᴜᴘᴅᴀᴛᴇᴅ"}*\n` +
 `┆✞ 🤖 *${"sᴛᴀᴛᴜs"}: Success*\n` +
 `╰-----------------------------`;

 await DybyTechInc.reply(botPpMsg);
 } catch (e) {
 console.error(e);
 DybyTechInc.reply("ғᴀɪᴛʜᴇᴅ ᴛᴏ ᴜᴘᴅᴀᴛᴇ ʙᴏᴛ ᴘɪᴄᴛᴜʀᴇ");
 }
}
break;

// --- CASE : CHANGER L'IMAGE DU MENU (menu.jpg) ---
case 'setbotimage':
case 'setmenuimg': {
    try {
        if (!isOwner) return DybyTechInc.reply("ᴏɴʟʏ ᴏᴡɴᴇʀ ᴄᴀɴ ᴄʜᴀɴɢᴇᴅ ʙᴏᴛ ɪᴍᴀɢᴇ");

        const quoted = m.quoted ? m.quoted : m;
        const mime = (quoted.msg || quoted).mimetype || '';

        if (!/image/.test(mime)) return DybyTechInc.reply(`📸 *ᴘᴛʜᴇᴀsᴇ ʀᴇᴘʟʏ ᴛᴏ ᴀɴ ɪᴍᴀɢᴇ*`);

        await DybyTechInc.react("🖼️");
        const media = await quoted.download();

        // Sauvegarde en tant que menu.jpg (image utilisée dans .menu et .alive)
        fs.writeFileSync('./menu.jpg', media);

        const imgMsg = `╭-----------------------------
┆☞ sʜɪᴘsʏ ᴍᴅ sᴇᴛᴛɪɴɢs
╰-----------------------------
┆☞ ✅ ʙᴏᴛ ɪᴍᴀɢᴇ ᴜᴘᴅᴀᴛᴇᴅ
┆☞ 🖼️ sᴛᴀᴛᴜs : sᴜᴄᴄᴇsss
┆☞ 📁 ғɪᴛʜᴇ : menu.jpg
╰-----------------------------
> ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴅʏʙʏ ᴛᴇᴄʜ ɪɴᴄ`;

        await DybyTechInc.reply(imgMsg);
        await DybyTechInc.react("✅");
    } catch (e) {
        console.error(e);
        DybyTechInc.reply("ғᴀɪᴛʜᴇᴅ ᴛᴏ ᴜᴘᴅᴀᴛᴇ ʙᴏᴛ ɪᴍᴀɢᴇ");
    }
}
break;

// --- CASE : CHANGER LE NOM DU BOT ---
case 'setname': {
 try {
 if (!isOwner) return DybyTechInc.reply("ᴏɴʟʏ ᴏᴡɴᴇʀ ᴄᴀɴ ᴄʜᴀɴɢᴇᴅ ʙᴏᴛ ɴᴀᴍᴇ");

 const newBotName = m.body.slice(prefix.length + command.length).trim();
 if (!newBotName) return DybyTechInc.reply(`📝 *${"ᴜsᴀɢᴇ"}:* ${prefix}setname Nouveau Nom`);

 await DybyTechInc.react("🖊️");
 
 // Mise à jour du nom (Pushname)
 await sock.updateProfileName(newBotName);

 const botNameMsg = `╭-----------------------------\n` +
 `┆✞ 🕷️ 𝐒𝐇𝐈𝐏𝐒𝐘 𝐌𝐈𝐍𝐈 𝐁𝐎𝐓 𝐒𝐄𝐓𝐓𝐈𝐍𝐆𝐒*\n` +
 `╭-----------------------------\n` +
 `┆✞ ✅ *${"ʙᴏᴛ ɴᴀᴍᴇ ᴜᴘᴅᴀᴛᴇᴅ"}*\n` +
 `┆✞ 🏷️ *${"ɴᴇᴡ ɴᴀᴍᴇ"}:* ${newBotName}\n` +
 `╰-----------------------------`;

 await DybyTechInc.reply(botNameMsg);
 } catch (e) {
 console.error(e);
 DybyTechInc.reply("ғᴀɪᴛʜᴇᴅ ᴛᴏ ᴄʜᴀɴɢᴇᴅ ʙᴏᴛ ɴᴀᴍᴇ");
 }
}
break;

// --- CASE : CHANGER LA BIO (ACTU) DU BOT ---
case 'setdesc':
case 'setabout': {
 try {
 if (!isOwner) return DybyTechInc.reply("ᴏɴʟʏ ᴏᴡɴᴇʀ ᴄᴀɴ ᴄʜᴀɴɢᴇᴅ ʙᴏᴛ ʙɪᴏ");

 const newAbout = m.body.slice(prefix.length + command.length).trim();
 if (!newAbout) return DybyTechInc.reply(`📑 *${"ᴜsᴀɢᴇ"}:* ${prefix}setdesc Ma nouvelle bio`);

 await DybyTechInc.react("📑");
 
 // Mise à jour de l'actu (Status/About)
 await sock.updateProfileStatus(newAbout);

 const botDescMsg = `╭-----------------------------\n` +
 `┆✞ 🕷️ 𝐒𝐇𝐈𝐏𝐒𝐘 𝐌𝐈𝐍𝐈 𝐁𝐎𝐓 𝐒𝐄𝐓𝐓𝐈𝐍𝐆𝐒*\n` +
 `╭-----------------------------\n` +
 `┆✞ ✅ *${"ʙᴏᴛ ʙɪᴏ ᴜᴘᴅᴀᴛᴇᴅ"}*\n` +
 `┆✞ 🗒️ *${"sᴛᴀᴛᴜs"}: ${"ᴍᴏᴅɪғɪᴇᴅᴅ"}*\n` +
 `╰-----------------------------`;

 await DybyTechInc.reply(botDescMsg);
 } catch (e) {
 console.error(e);
 DybyTechInc.reply("ғᴀɪᴛʜᴇᴅ ᴛᴏ ᴜᴘᴅᴀᴛᴇ ʙᴏᴛ ʙɪᴏ");
 }
}
break;


case 'technologia':
case 'tech':
case 'technologyia': {
 try {
 // Réaction avec l'emoji rire
 await DybyTechInc.react("😂");

 // Envoi de l'audio (en mode message audio normal, pas PTT)
 await sock.sendMessage(m.chat, {
 audio: { url: "https://files.catbox.moe/fac856.mp3" },
 mimetype: "audio/mpeg",
 ptt: false
 }, { quoted: m });

 } catch (e) {
 console.error(e);
 // Message d'erreur avec le style Shipsy Mini Bot
 DybyTechInc.reply(`╭-----------------------------\n┆✞ ❌ ${"ᴛᴇᴄʜɴᴏʟᴏɢɪᴀ ғᴀɪᴛʜᴇᴅ"}*\n┆✞ ⚠️ *${"ᴇʀʀᴏʀ"}:* Blyat!\n╰-----------------------------`);
 }
}
break;


case "menu": {
 try {
 await DybyTechInc.react("🕷️");
	const activeUsers = getTotalUsers(); 

 const os = require('os');
 const uptime = process.uptime();
 const hours = Math.floor(uptime / 3600);
 const minutes = Math.floor((uptime % 3600) / 60);
 const seconds = Math.floor(uptime % 60);
	const up = `${hours}ʜ ${minutes}ᴍ ${seconds}s`
 const imageUrl = "./menu.jpg";
 if (!fs.existsSync(imageUrl)) {
 return DybyTechInc.reply("❌ Error : L'image 'menu.jpg' est not found.");
 }

 const buffer = fs.readFileSync(imageUrl);

 const pushname = m.pushName || 'User';
 const con = `╭-----------------------------
┆☞ ʙᴏᴛ ɴᴀᴍᴇ : sʜɪᴘsʏ ᴍᴅ
┆☞ ᴜsᴇʀ : ${pushname}
┆☞ ᴜᴘᴛɪᴍᴇ : ${up}
┆☞ ᴏᴡɴᴇʀ : ᴅʏʙʏ
┆☞ ᴅᴇᴠ : ᴅʏʙʏ ᴛᴇᴄʜ ɪɴᴄ
┆☞ ᴛᴏɪᴏɴ : ᴛɢ ᴛᴏɪᴏɴ
┆☞ ᴍᴏᴅᴇ : ${mode === 'public' ? 'ᴘᴜʙʟɪᴄ' : 'ᴘʀɪᴠᴀᴛᴇ'}
┆☞ ᴘʀᴇғɪx : [ ${prefix} ]
╰-----------------------------

   \`𝐎𝐖𝐍𝐄𝐑 𝐌𝐄𝐍𝐔\`
╭-----------------------------
┆☞ ${prefix}ᴍᴏᴅᴇ
┆☞ ${prefix}sᴇᴛᴘʀᴇғɪx
┆☞ ${prefix}sᴇᴛᴘᴘ
┆☞ ${prefix}sᴇᴛʙᴏᴛɪᴍᴀɢᴇ
┆☞ ${prefix}ᴊᴏɪɴ
┆☞ ${prefix}ʙʀᴏᴀᴅᴄᴀsᴛ
┆☞ ${prefix}ᴛʜᴇғᴛ
┆☞ ${prefix}ᴀᴜᴛᴏʀᴇᴀᴄᴛ
┆☞ ${prefix}ᴠᴠ
┆☞ ${prefix}ᴀᴜᴛᴏᴛʏᴘɪɴɢ
┆☞ ${prefix}ᴀᴜᴛᴏʀᴇᴄᴏʀᴅɪɴɢ
┆☞ ${prefix}ᴏғᴛʜᴀɴᴅᴇ
┆☞ ${prefix}ᴠᴠ2
┆☞ ${prefix}ᴀɴᴛɪᴄᴀʟʟ
┆☞ ${prefix}sᴛᴀᴛᴜsᴠɪᴇᴡ
┆☞ ${prefix}ᴘʀᴏғɪᴛʜᴇ
╰-----------------------------

   \`𝐈𝐍𝐅𝐎𝐒 𝐌𝐄𝐍𝐔\`
╭-----------------------------
┆☞ ${prefix}ᴛᴇsᴛ
┆☞ ${prefix}ᴘɪɴɢ
┆☞ ${prefix}ᴜᴘᴛɪᴍᴇ
┆☞ ${prefix}ᴏᴡɴᴇʀ
┆☞ ${prefix}ᴍᴇɴᴜ
┆☞ ${prefix}ᴀʟɪᴠᴇ
┆☞ ${prefix}ᴜᴘᴛɪᴍᴇ
┆☞ ${prefix}ᴘᴀɪʀ
╰-----------------------------

   \`𝐆𝐑𝐎𝐔𝐏 𝐌𝐄𝐍𝐔\`
╭-----------------------------
┆☞ ${prefix}ᴛᴀɢᴀʟʟ
┆☞ ${prefix}ᴘᴏsᴛ
┆☞ ${prefix}ᴏᴘᴇɴ
┆☞ ${prefix}ᴄʟᴏsᴇ
┆☞ ${prefix}ᴀᴅᴅ
┆☞ ${prefix}ᴋɪᴄᴋᴇᴅ
┆☞ ${prefix}ɴᴇᴡɢᴄ
┆☞ ${prefix}ᴘʀᴏᴍᴏᴛᴇ
┆☞ ${prefix}ᴏғᴍᴏᴛᴇ
┆☞ ${prefix}ᴘʀᴏᴍᴏᴛᴇᴀʟʟ
┆☞ ${prefix}ᴡᴇʟᴄᴏᴍᴇ
┆☞ ${prefix}ᴏғᴍᴏᴛᴇᴀʟʟ
┆☞ ${prefix}ᴋɪᴄᴋᴇᴅᴀʟʟ
╰-----------------------------

   \`𝐔𝐓𝐈𝐋𝐈𝐓𝐈𝐄𝐒 𝐌𝐄𝐍𝐔\`
╭-----------------------------
┆☞ ${prefix}ɴᴇᴡsᴛʜᴀɴᴅᴛᴇʀ
┆☞ ${prefix}ʀᴇᴍɪɴɪ
┆☞ ${prefix}ᴇᴍᴏᴊɪᴍɪx
┆☞ ${prefix}ᴛᴏǫʀ
┆☞ ${prefix}ᴛᴀɴᴅʜᴇsᴛɪᴄᴋ
┆☞ ${prefix}ᴡᴀsᴛᴇᴅ
┆☞ ${prefix}ᴛᴀᴋᴇ
┆☞ ${prefix}ᴄʜᴀɪɴғᴏ
┆☞ ${prefix}ʀᴇᴍᴏᴠᴇʙɢ
┆☞ ${prefix}ssᴡᴇʙ
┆☞ ${prefix}ᴄᴏʀᴘᴛʜᴇᴘᴘ
┆☞ ${prefix}ǫᴜᴏᴛᴇ
┆☞ ${prefix}ᴛᴏᴠɪᴇᴡᴏɴᴄᴇ
┆☞ ${prefix}ᴄʟᴏɴᴇᴡᴇʙ
╰-----------------------------

   \`𝐃𝐎𝐖𝐍𝐋𝐎𝐀𝐃 𝐌𝐄𝐍𝐔\`
╭-----------------------------
┆☞ ${prefix}ɪᴍɢ
┆☞ ${prefix}ᴘɪɴ
┆☞ ${prefix}ᴛɪᴋᴛᴏᴋ
┆☞ ${prefix}ᴘᴛʜᴇʏ
┆☞ ${prefix}ʏᴛᴍᴘ4
┆☞ ${prefix}ᴍᴇᴅɪᴀғɪʀᴇ
╰-----------------------------

   \`𝐅𝐔𝐍 𝐌𝐄𝐍𝐔\`
╭-----------------------------
┆☞ ${prefix}ɪᴘʜᴏɴᴇ
╰-----------------------------

   \`𝐀𝐈 𝐌𝐄𝐍𝐔\`
╭-----------------------------
┆☞ ${prefix}sʜɪᴘsʏᴀɪ
┆☞ ${prefix}ᴍᴇᴛᴀᴀɪ
┆☞ ${prefix}ɢᴘᴛ4
┆☞ ${prefix}ɢᴘᴛ
┆☞ ${prefix}ᴄᴏᴅᴇᴀɪ
┆☞ ${prefix}ᴛʀɪᴠɪᴀᴀɪ
┆☞ ${prefix}sᴛᴏʀʏᴀɪ
╰-----------------------------

   \`𝐈𝐌𝐀𝐆𝐄 𝐆𝐄𝐍 𝐌𝐄𝐍𝐔\`
╭-----------------------------
┆☞ ${prefix}ғʟᴜx
┆☞ ${prefix}ᴘɪxᴀʀᴛ
┆☞ ${prefix}ᴘʜᴏᴛᴏᴀɪ
┆☞ ${prefix}ɪᴍɢ
╰-----------------------------

   \`𝐄𝐏𝐇𝐎𝐓𝐎 𝐌𝐄𝐍𝐔\`
╭-----------------------------
┆☞ ${prefix}ɢʟɪᴛᴄʜᴛᴇxᴛ
┆☞ ${prefix}ᴡʀɪᴛᴇᴛᴇxᴛ
┆☞ ${prefix}ᴀᴅᴠᴀɴᴄᴇᴅɢʟᴏᴡ
┆☞ ${prefix}ᴛʏᴘᴏɢʀᴀᴘʜʏᴛᴇxᴛ
┆☞ ${prefix}ᴘɪxᴇʟɢʟɪᴛᴄʜ
┆☞ ${prefix}ɴᴇᴏɴɢʟɪᴛᴄʜ
┆☞ ${prefix}ғʟᴀɢᴛᴇxᴛ
┆☞ ${prefix}ғʟᴀɢ3ᴅᴛᴇxᴛ
┆☞ ${prefix}ᴅᴇʟᴇᴛɪɴɢᴛᴇxᴛ
┆☞ ${prefix}ʙʟᴀᴄᴋᴘɪɴᴋsᴛʏʟᴇ
┆☞ ${prefix}ɢʟᴏᴡɪɴɢᴛᴇxᴛ
┆☞ ${prefix}ᴜɴᴅᴇʀᴡᴀᴛᴇʀᴛᴇxᴛ
┆☞ ${prefix}ʟᴏɢᴏᴍᴀᴋᴇʀ
┆☞ ${prefix}ᴄᴀʀᴛᴏᴏɴsᴛʏʟᴇ
┆☞ ${prefix}ᴘᴀᴘᴇʀᴄᴜᴛsᴛʏʟᴇ
┆☞ ${prefix}ᴡᴀᴛᴇʀᴄᴏʟᴏʀᴛᴇxᴛ
┆☞ ${prefix}ᴇғғᴇᴄᴛᴄʟᴏᴜᴅs
┆☞ ${prefix}ʙʟᴀᴄᴋᴘɪɴᴋʟᴏɢᴏ
┆☞ ${prefix}ɢʀᴀᴅɪᴇɴᴛᴛᴇxᴛ
┆☞ ${prefix}sᴜᴍᴍᴇʀʙᴇᴀᴄʜ
┆☞ ${prefix}ʟᴜxᴜʀʏɢᴏʟᴅ
┆☞ ${prefix}ᴍᴜʟᴛɪᴄᴏʟᴏʀᴇᴅɴᴇᴏɴ
┆☞ ${prefix}sᴀɴᴅsᴜᴍᴍᴇʀ
┆☞ ${prefix}ɢᴀʟᴀxʏᴡᴀʟʟᴘᴀᴘᴇʀ
┆☞ ${prefix}sᴛʏʟᴇ1917
┆☞ ${prefix}ᴍᴀᴋɪɴɢɴᴇᴏɴ
┆☞ ${prefix}ʀᴏʏᴀʟᴛᴇxᴛ
┆☞ ${prefix}ғʀᴇᴇᴄʀᴇᴀᴛᴇ
┆☞ ${prefix}ɢᴀʟᴀxʏsᴛʏʟᴇ
┆☞ ${prefix}ʟɪɢʜᴛᴇғғᴇᴄᴛs
╰-----------------------------`;

 // --- CONFIGURATION FAKE QUOTED SHIPSY MINI BOT ---


 await sock.sendMessage(DybyTechInc.chat, {
 image: buffer,
 caption: con,
 contextInfo: {
 participant: '0@s.whatsapp.net',
 remoteJid: 'status@broadcast',
 forwardingScore: 999,
 isForwarded: true,
 forwardedNewsletterMessageInfo: {
 newsletterJid: NEWSLETTER_JID,
 newsletterName: '𝐒𝐇𝐈𝐏𝐒𝐘 𝐌𝐈𝐍𝐈 𝐁𝐎𝐓',
 serverMessageId: 125
 },
 externalAdReply: {
 title: "ꜱʜɪᴘꜱʏ ᴍɪɴɪ ʙᴏᴛ ᴀssɪsᴛᴀɴᴛ",
 body: "ᴀᴜᴛᴏᴍᴀᴛᴇᴅ ʙᴏᴛ ʙʏ ɢᴀᴀʀᴀ",
 thumbnail: buffer,
 sourceUrl: "https://whatsapp.com/channel/0029Vb7EJmL002SztJBkz11T",
 mediaType: 1,
 renderLargerThumbnail: false
 }
 }
 }, { quoted: qtext2 });

 } catch (e) {
 console.error(e);
 DybyTechInc.reply("An error occurred.");
 }
}
break;


case 'whois':
case 'profile':
case 'userinfo': {
 try {
 await DybyTechInc.react("👤");

 // 1. DÉTERMINER LA CIBLE (Mention, Réponse ou Soi-même)
 let userJid;
 if (m.mentionedJid?.length) {
 userJid = m.mentionedJid[0];
 } else if (m.quoted && m.quoted.sender) {
 userJid = m.quoted.sender;
 } else {
 userJid = m.sender;
 }

 // 2. VÉRIFIER L'EXISTENCE SUR WHATSAPP
 const [user] = await sock.onWhatsApp(userJid).catch(() => []);
 if (!user?.exists) return DybyTechInc.reply("ᴜsᴇʀ ɴᴏᴛ ғᴏʀɴᴅ ᴏɴ ᴡʜᴀᴛsᴀᴘᴘ");

 // 3. RÉCUPÉRER LA PHOTO DE PROFIL
 let ppUrl;
 try {
 ppUrl = await sock.profilePictureUrl(userJid, 'image');
 } catch {
 ppUrl = 'https://i.ibb.co/KhYC4FY/1221bc0bdd2354b42b293317ff2adbcf-icon.png'; // Image par défaut
 }

 // 4. RÉCUPÉRER LE NOM (PUSHNAME)
 let userName = userJid.split('@')[0];
 try {
 const contact = await sock.fetchStatus(userJid).catch(() => null);
 // On tente de récupérer le nom via les métadonnées de groupe si possible
 if (isGroup) {
 const groupMetadata = await sock.groupMetadata(m.chat);
 const participant = groupMetadata.participants.find(p => p.id === userJid);
 if (participant) userName = participant.id.split('@')[0];
 }
 } catch (e) { console.log(e) }

 // 5. RÉCUPÉRER LA BIO / STATUS
 let bioText = "No bio available";
 try {
 const statusData = await sock.fetchStatus(userJid).catch(() => null);
 if (statusData?.status) bioText = statusData.status;
 } catch (e) { console.log(e) }

 // 6. RÔLE DANS LE GROUPE
 let groupRole = "";
 if (isGroup) {
 const groupMetadata = await sock.groupMetadata(m.chat);
 const participant = groupMetadata.participants.find(p => p.id === userJid);
 groupRole = participant?.admin ? "👑 Admin" : "👥 Member";
 }

 // 7. FORMATAGE DU MESSAGE (SHIPSY MINI BOT DESIGN)
 const userInfo = `╭-----------------------------
┆✞ 🕷️ 𝐒𝐇𝐈𝐏𝐒𝐘 𝐌𝐈𝐍𝐈 𝐁𝐎𝐓 𝐔𝐒𝐄𝐑 𝐈𝐍𝐅𝐎*
╭-----------------------------
┆✞ 👤 *${"ɴᴀᴍᴇ"}:* @${userJid.split('@')[0]}
┆✞ 🔢 *${"ɴᴜᴍʙᴇʀ"}:* ${userJid.split('@')[0]}
┆✞ 📌 *${"ᴛʏᴘᴇ"}:* ${user.isBusiness ? "💼 Business" : "👤 Personal"}
${isGroup ? `┆✞ 🛡️ *${"ɢʀᴏʀᴘ ʀᴏʟᴇ"}:* ${groupRole}` : ''}
╭-----------------------------
┆✞ 📝 *${"ᴀʙᴏʀᴛ"}:*
┆✞ ${bioText}
╰-----------------------------`;

 // 8. ENVOI DU MESSAGE AVEC PHOTO
 await sock.sendMessage(m.chat, {
 image: { url: ppUrl },
 caption: userInfo,
 mentions: [userJid]
 }, { quoted: m });

 } catch (e) {
 console.error("Whois error:", e);
 DybyTechInc.reply("ғᴀɪᴛʜᴇᴅ ᴛᴏ ғᴀɴᴅᴄʜ ᴜsᴇʀ ɪɴғᴏ");
 }
}
break;


case 'iphonequote':
case 'fakechat':
case 'iphone': {
 try {
 // Réaction avec le téléphone
 await DybyTechInc.react("📱");

 const text = m.body.slice(prefix.length + command.length).trim();
 
 if (!text) {
 return DybyTechInc.reply(`❌ *${"ᴇxᴀᴍᴘᴛʜᴇ"}:*\n${prefix + command} Hello Shipsy Mini Bot`);
 }

 // URL de l'API avec les paramètres (Heure fixe et Batterie 100%)
 const apiUrl = `https://www.veloria.my.id/imagecreator/fake-chat?time=12:00&messageText=${encodeURIComponent(text)}&batteryPercentage=100`;

 // Envoi de l'image générée
 await sock.sendMessage(m.chat, {
 image: { url: apiUrl },
 caption: `╭-----------------------------\n┆✞ 📱 ${"ɪᴘʜᴏɴᴇ ғᴀᴋᴇ ᴄʜᴀᴛ"}\n╰-----------------------------`
 }, { quoted: m });

 } catch (e) {
 console.error("IphoneQuote Error:", e);
 DybyTechInc.reply("ғᴀɪᴛʜᴇᴅ ᴛᴏ ɢᴇɴᴇʀᴀᴛᴇ ɪᴘʜᴏɴᴇ ǫᴜᴏᴛᴇ");
 }
}
break;


case 'newgc':
case 'creategroup': {
 // Vérification Propriétaire
 if (!isOwner) return DybyTechInc.reply("ᴏᴡɴᴇʀ ᴏɴʟʏ");

 const groupName = args.join(" ");
 if (!groupName) return DybyTechInc.reply(`*${"ᴜsᴀɢᴇ"}:* ${prefix + command} Nom du Groupe`);

 try {
 await DybyTechInc.react("🏗️");

 // Création du groupe (avec le créateur uniquement au début)
 const cret = await sock.groupCreate(groupName, []);
 
 // Génération du lien d'invitation
 const code = await sock.groupInviteCode(cret.id);
 const link = `https://chat.whatsapp.com/${code}`;

 // Formatage de la date (Heure d'Haïti comme dans ta config)
 const creationTime = new Date(cret.creation * 1000).toLocaleString('fr-FR', { 
 timeZone: 'America/Port-au-Prince',
 dateStyle: 'short',
 timeStyle: 'medium'
 });

 const teks = `╭-----------------------------
┆✞ 🕷️ 𝐒𝐇𝐈𝐏𝐒𝐘 𝐌𝐈𝐍𝐈 𝐁𝐎𝐓 𝐆𝐑𝐎𝐔𝐏 𝐂𝐑𝐄𝐀𝐓𝐄𝐃*
╭-----------------------------
┆✞ 📛 *${"ɴᴀᴍᴇ"}:* ${cret.subject}
┆✞ 🔢 *${"ɢʀᴏʀᴘ ɪᴅ"}:* ${cret.id}
┆✞ 👑 *${"ᴏᴡɴᴇʀ"}:* @${cret.owner.split("@")[0]}
┆✞ 📅 *${"ᴄʀᴇᴀᴛᴇᴅ"}:* ${creationTime}
╭-----------------------------
┆✞ 🔗 *${"ɪɴᴠɪᴛᴇ ʟɪɴᴋ"}:* ┆✞ ${link}
╰-----------------------------
> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴅᴇᴠ ᴅʏʙʏ*`;

 await sock.sendMessage(m.chat, {
 text: teks,
 mentions: [cret.owner]
 }, { quoted: m });

 } catch (e) {
 console.error("NewGC Error:", e);
 DybyTechInc.reply("ғᴀɪᴛʜᴇᴅ ᴛᴏ ᴄʀᴇᴀᴛᴇ ɢʀᴏʀᴘ. ᴄʜᴇᴄᴋ ʙᴏᴛ ᴘᴇʀᴍɪssɪᴏɴs.");
 }
}
break;





case 'repo': {
 try {
 await DybyTechInc.react("📂");

 const repoMsg = `🕷️ *${"sʜɪᴘsʏ ᴍᴅ ʀᴇᴘᴏsɪᴛᴏʀʏ"}*

╭-----------------------------
┆✞ ${"ᴘʀᴏᴊᴇᴄᴛ ᴏғᴛᴀɪʟs"}*
┆✞ ◈ ${"ɴᴀᴍᴇ"} : Shipsy Mini Bot V1*
┆✞ ◈ ${"ᴀᴜᴛʜᴏʀ"} : ᴅᴇᴠ ᴅʏʙʏ*
┆✞ ◈ ${"sᴛᴀᴛᴜs"} : Running*
╰-----------------------------

> *${"ɢᴀɴᴅ ᴛʜᴇ ᴛʜᴀɴᴅᴇsᴛ ᴛᴏɪᴏɴ ᴀɴᴅ ᴅᴏᴄᴜᴍᴇɴᴛᴀᴛɪᴏɴ ᴏɴ ᴏʀʀ ᴏғғɪᴄɪᴀʟ ᴡᴇʙᴡᴇʙsɪᴛᴇ ʙᴇʟᴏᴡ"}* ⚡`;

 await sock.relayMessage(DybyTechInc.chat, {
 viewOnceMessage: {
 message: {
 interactiveMessage: {
 header: {
 title: `*${"ᴏғғɪᴄɪᴀʟ ʀᴇᴘᴏsɪᴛᴏʀʏ"}*`,
 hasMediaAttachment: false
 },
 body: { text: repoMsg },
 footer: { text: "ꜱʜɪᴘꜱʏ ᴍɪɴɪ ʙᴏᴛ ᴏᴘᴛɪᴍɪᴢᴇᴅ ʙʏ ᴅᴇᴠ ᴅʏʙʏ" },
 nativeFlowMessage: {
 buttons: [
 {
 name: "cta_url",
 buttonParamsJson: JSON.stringify({
 display_text: "ᴏᴘᴇɴ sʜɪᴘsʏ ᴍᴅ ᴡᴇʙ",
 url: "https://spiderxd.vezxa.com"
 })
 }
 ]
 },
 contextInfo: {
 forwardingScore: 999,
 isForwarded: true,
 forwardedNewsletterMessageInfo: {
 newsletterJid: NEWSLETTER_JID,
 newsletterName: '𝐒𝐇𝐈𝐏𝐒𝐘 𝐌𝐈𝐍𝐈 𝐁𝐎𝐓',
 serverMessageId: 125
 }
 }
 }
 }
 }
 }, { quoted: mquote });

 } catch (e) {
 console.error("Repo Command Error:", e);
 DybyTechInc.reply("https://spiderxd.vezxa.com");
 }
}
break;














































case 'sticker':
case 's':
case 'vs': {
 try {
 // On importe le constructeur de sticker
 const stickerBuilder = require('./lib/sticker.js'); 
 
 const q = m.quoted ? m.quoted : m;
 const mime = (q.msg || q).mimetype || '';
 
 if (!/image|video|gif/.test(mime)) {
 return m.reply("ᴘᴛʜᴇᴀsᴇ ʀᴇᴘʟʏ ᴛᴏ ᴀɴ ɪᴍᴀɢᴇ ᴏʀ ᴠɪᴏғᴏ.");
 }

 await sock.sendMessage(m.chat, { react: { text: "🎨", key: m.key } });

 const media = await q.download();
 const type = mime.split('/')[0]; 

 // Appel de la fonction toSticker
 const buffer = await stickerBuilder.toSticker(type, media, {
 packname: "Shipsy Mini Bot",
 author: "DybyTechInc"
 });

 await sock.sendMessage(m.chat, { sticker: buffer }, { quoted: m });
 await sock.sendMessage(m.chat, { react: { text: "✅", key: m.key } });

 } catch (e) {
 console.error('Sticker Error:', e);
 m.reply("ᴇʀʀᴏʀ: ғᴀɪᴛʜᴇᴅ ᴛᴏ ᴄᴏɴᴠᴇʀᴛ sᴛɪᴄᴋᴇʀ.");
 }
}
break;


case 'config': {
 try {
 const botId = botNumber.split('@')[0];
 const config = sessionsConfig[botId];

 if (!config) return DybyTechInc.reply(`❌ *${"ᴄᴏɴғɪɢᴜʀᴀᴛɪᴏɴ ɴᴏᴛ ғᴏʀɴᴅ"}*`);

 await DybyTechInc.react("⚙️");

 // Construction du message avec ton style de menu
 const configMsg = `╭-----------------------------
┆✞ ꜱʏꜱᴛᴇᴍ ᴄᴏɴꜰɪɢ*
┆✞ ◈ ᴘʀᴇꜰɪx:* ${config.prefix}
┆✞ ◈ ᴍᴏᴅᴇ:* ${config.mode}
┆✞ ◈ ᴡᴇʟᴄᴏᴍᴇ:* ${config.welcome}
┆✞ ◈ ᴀᴜᴛᴏ ᴛʏᴘɪɴɢ:* ${config.autotyping}
┆✞ ◈ ᴀᴜᴛᴏ ʀᴇᴄᴏʀᴅ:* ${config.autorecording}
┆✞ ◈ ᴀɴᴛɪ-ᴄᴀʟʟ:* ${config.anticall}
┆✞ ◈ ᴀᴜᴛᴏ ʀᴇᴀᴄᴛ:* ${config.autoreact}
┆✞ ◈ ᴍᴀx ᴛʀɪᴇꜱ:* ${config.maxtries}
┆✞ ◈ ᴀᴜᴛᴏ ʟɪᴋᴇ ꜱᴛᴀᴛᴜꜱ:* ${config.autolikestatus}
┆✞ ◈ ꜱᴛᴀᴛᴜꜱ ᴠɪᴇᴡ:* ${config.statusview}
╰-----------------------------

╭-----------------------------
┆✞ ${"sᴛᴀᴛᴜs ᴇᴍᴏᴊɪs"}*
┆✞ ${config.likestatuemoji.join(' ')}
╰-----------------------------

> ${"sʜɪᴘsʏ ᴍᴅ sᴇᴛᴛɪɴɢs"}`;

 // Envoi simple avec ContextInfo (le carré d'info)
 await sock.sendMessage(DybyTechInc.chat, { 
 text: configMsg,
 contextInfo: {
 externalAdReply: {
 title: "ꜱʏꜱᴛᴇᴍ ᴘᴀɴᴇʟ ᴠ1.0",
 body: `ᴄᴜʀʀᴇɴᴛ ᴍᴏᴅᴇ: ${config.mode.toUpperCase()}`,
 thumbnailUrl: "https://i.ibb.co/mS7z7Xb/config-icon.png", 
 sourceUrl: "https://whatsapp.com/channel/0029Vaom7p690x2zS8Apxu0S",
 mediaType: 1,
 renderLargerThumbnail: false
 }
 }
 }, { quoted: mquote });

 await DybyTechInc.react("✅");

 } catch (e) {
 console.error('Config Error:', e);
 DybyTechInc.reply(`❌ *${"ᴇʀʀᴏʀ ғᴀɴᴅᴄʜɪɴɢ ᴄᴏɴғɪɢᴜʀᴀᴛɪᴏɴ"}*`);
 }
}
break;


// --- IMAGE GENERATION ---
case 'flux':
case 'sdxl':
case 'pollinations':
case 'playground': {
    if (!text) return reply(`❌ ᴘʟᴇᴀsᴇ ᴘʀᴏᴠɪᴅᴇ ᴀɴ ɪᴍᴀɢᴇ ᴅᴇsᴄʀɪᴘᴛɪᴏɴ!\n\nᴇxᴀᴍᴘʟᴇ: ${prefix + command} ᴀ ᴄᴀᴛ ɪɴ sᴘᴀᴄᴇ`);
    try {
        await reply('🎨 ɢᴇɴᴇʀᴀᴛɪɴɢ ɪᴍᴀɢᴇ...');
        const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(text)}?width=1024&height=1024&model=flux&nologo=true&enhance=true`;
        await sock.sendMessage(from, { image: { url: imageUrl }, caption: `✨ *ɪᴍᴀɢᴇ ɢᴇɴᴇʀᴀᴛᴇᴅ*\n\n📝 ᴘʀᴏᴍᴘᴛ: ${text}\n🤖 ᴍᴏᴅᴇʟ: ғʟᴜx-ᴘʀᴏ` }, { quoted: qtext2 });
    } catch (error) { console.error('Image Generation Error:', error); reply('❌ ғᴀɪʟᴇᴅ ᴛᴏ ɢᴇɴᴇʀᴀᴛᴇ ɪᴍᴀɢᴇ. ᴘʟᴇᴀsᴇ ᴛʀʏ ᴀɢᴀɪɴ.'); }
}
break;

case 'pixart': {
    if (!text) return reply(`❌ ᴘʟᴇᴀsᴇ ᴘʀᴏᴠɪᴅᴇ ᴀɴ ɪᴍᴀɢᴇ ᴅᴇsᴄʀɪᴘᴛɪᴏɴ!\n\nᴇxᴀᴍᴘʟᴇ: ${prefix + command} ᴀ ʙᴇᴀᴜᴛɪғᴜʟ ᴀɴɪᴍᴇ ɢɪʀʟ`);
    try {
        await reply('🎨 ɢᴇɴᴇʀᴀᴛɪɴɢ ᴘɪxᴀʀᴛ ɪᴍᴀɢᴇ...');
        const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(text)}?width=1024&height=1024&model=pixart&nologo=true&enhance=true`;
        await sock.sendMessage(from, { image: { url: imageUrl }, caption: `✨ *ᴘɪxᴀʀᴛ ɪᴍᴀɢᴇ ɢᴇɴᴇʀᴀᴛᴇᴅ*\n\n📝 ᴘʀᴏᴍᴘᴛ: ${text}\n🤖 ᴍᴏᴅᴇʟ: ᴘɪxᴀʀᴛ-ᴀʟᴘʜᴀ` }, { quoted: qtext2 });
    } catch (error) { console.error('PixArt Error:', error); reply('❌ ғᴀɪʟᴇᴅ ᴛᴏ ɢᴇɴᴇʀᴀᴛᴇ ɪᴍᴀɢᴇ. ᴘʟᴇᴀsᴇ ᴛʀʏ ᴀɢᴀɪɴ.'); }
}
break;

case 'photoai': {
    if (!text) return reply(`⚠️ ᴜsᴀɢᴇ: ${prefix + command} <your prompt>\n\nᴇxᴀᴍᴘʟᴇ: ${prefix + command} ᴀ ᴄᴀᴛ ᴡᴇᴀʀɪɴɢ sᴜɴɢʟᴀssᴇs`);
    try {
        await sock.sendMessage(m.chat, { image: { url: `https://image.pollinations.ai/prompt/${encodeURIComponent(text)}` }, caption: `🖼️ *ᴀɪ ɢᴇɴᴇʀᴀᴛᴇᴅ ᴘʜᴏᴛᴏ*\n\nᴘʀᴏᴍᴘᴛ: ${text}` }, { quoted: qtext2 });
    } catch (e) { console.error(e); reply('❌ ғᴀɪʟᴇᴅ ᴛᴏ ɢᴇɴᴇʀᴀᴛᴇ ᴀɪ ᴘʜᴏᴛᴏ, ᴛʀʏ ᴀɢᴀɪɴ ʟᴀᴛᴇʀ.'); }
}
break;

// --- IMAGE SEARCH ---
case 'imgsearch':
case 'img': {
    if (!text) return reply(`*ᴜsᴀɢᴇ:* ${prefix}img <ǫᴜᴇʀʏ>\n\n*ᴇxᴀᴍᴘʟᴇ:* ${prefix}img ᴄᴀᴛ`);
    try {
        const apiResponse = await axios.get(`https://api.siputzx.my.id/api/s/bimg`, { params: { query: text } });
        if (apiResponse.status === 200 && apiResponse.data.status) {
            const images = apiResponse.data.data;
            if (!images.length) return reply(`ɴᴏ ɪᴍᴀɢᴇs ғᴏᴜɴᴅ ғᴏʀ "${text}".`);
            const max = Math.min(images.length, 5);
            for (let i = 0; i < max; i++) {
                await sock.sendMessage(m.chat, { image: { url: images[i] }, caption: `🔎 *ɪᴍᴀɢᴇ sᴇᴀʀᴄʜ*\n📄 ǫᴜᴇʀʏ: "${text}"\n📷 ɪᴍᴀɢᴇ ${i + 1}/${max}` }, { quoted: qtext2 });
            }
        } else { reply(`❌ ғᴀɪʟᴇᴅ ᴛᴏ ғᴇᴛᴄʜ ɪᴍᴀɢᴇs.`); }
    } catch (error) { console.error('Image Search Error:', error); reply(`❌ ᴇʀʀᴏʀ: ${error.message}`); }
    break;
}

// --- AI CHAT ---
case 'metaai': {
    if (!text) return reply(`💡 ᴜsᴀɢᴇ: ${prefix + command} <your question>`);
    try {
        const res = await axios.post("https://chateverywhere.app/api/chat/", { model: { id: "gpt-4", name: "Meta AI", maxLength: 32000, tokenLimit: 8000, completionTokenLimit: 5000, deploymentName: "gpt-4" }, messages: [{ pluginId: null, content: text, role: "user" }], prompt: "", temperature: 0.5 }, { headers: { "Accept": "*/*", "User-Agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36" } });
        const answer = typeof res.data === 'string' ? res.data : (res.data?.content || res.data?.message || JSON.stringify(res.data, null, 2));
        reply(`🤖 *ᴍᴇᴛᴀᴀɪ*\n\n${answer}`);
    } catch (e) { console.error(e); reply("⚠️ ᴍᴇᴛᴀᴀɪ ᴄᴏᴜʟᴅ ɴᴏᴛ ʀᴇsᴘᴏɴᴅ. ᴛʀʏ ᴀɢᴀɪɴ ʟᴀᴛᴇʀ."); }
}
break;

case 'gpt4':
case 'gpt': {
    if (!text) return reply(`ᴀsᴋ ᴍᴇ ᴀɴʏᴛʜɪɴɢ ᴇxᴀᴍᴘʟᴇ ${prefix + command} ᴡʜᴀᴛ ɪs ᴊᴀᴠᴀsᴄʀɪᴘᴛ?`);
    try {
        const res = await axios.post("https://chateverywhere.app/api/chat/", { model: { id: "gpt-4", name: "GPT-4", maxLength: 32000, tokenLimit: 8000, completionTokenLimit: 5000, deploymentName: "gpt-4" }, messages: [{ pluginId: null, content: text, role: "user" }], prompt: "", temperature: 0.5 }, { headers: { "Accept": "*/*", "User-Agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36" } });
        reply(typeof res.data === 'string' ? res.data : JSON.stringify(res.data, null, 2));
    } catch (e) { console.error(e); reply("⚠️ ɢᴘᴛ4 ғᴀɪʟᴇᴅ, ᴘʟᴇᴀsᴇ ᴛʀʏ ᴀɢᴀɪɴ ʟᴀᴛᴇʀ."); }
}
break;

case 'codeai': {
    if (!text) return reply(`⚠️ ᴜsᴀɢᴇ: ${prefix + command} <coding question>`);
    try {
        const res = await axios.post("https://chateverywhere.app/api/chat/", { model: { id: "gpt-4", name: "GPT-4", maxLength: 32000, tokenLimit: 8000, completionTokenLimit: 5000, deploymentName: "gpt-4" }, messages: [{ pluginId: null, content: `You are a coding assistant. Answer only with clean code and explanation.\n\n${text}`, role: "user" }], prompt: "", temperature: 0.4 }, { headers: { "Accept": "*/*", "User-Agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36" } });
        reply(`👨‍💻 *ᴄᴏᴅᴇᴀɪ*\n\n${typeof res.data === 'string' ? res.data : JSON.stringify(res.data, null, 2)}`);
    } catch (e) { console.error(e); reply("⚠️ ᴄᴏᴅᴇᴀɪ ғᴀɪʟᴇᴅ. ᴛʀʏ ᴀɢᴀɪɴ ʟᴀᴛᴇʀ."); }
}
break;

case 'triviaai': {
    try {
        const res = await axios.post("https://chateverywhere.app/api/chat/", { model: { id: "gpt-4", name: "GPT-4", maxLength: 32000, tokenLimit: 8000, completionTokenLimit: 5000, deploymentName: "gpt-4" }, messages: [{ pluginId: null, content: `Give me one random trivia question with 4 options (A,B,C,D) and the correct answer.\n\nFormat:\n❓ Question: ...\n\nA) ...\nB) ...\nC) ...\nD) ...\n\n✅ Correct Answer: ...`, role: "user" }], prompt: "", temperature: 0.7 }, { headers: { "Accept": "*/*", "User-Agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36" } });
        reply(`🎲 *ᴛʀɪᴠɪᴀ ɢᴀᴍᴇ* 🎲\n\n${typeof res.data === 'string' ? res.data : JSON.stringify(res.data, null, 2)}`);
    } catch (e) { console.error(e); reply("⚠️ ᴛʀɪᴠɪᴀ ғᴀɪʟᴇᴅ. ᴛʀʏ ᴀɢᴀɪɴ ʟᴀᴛᴇʀ."); }
}
break;

case 'storyai': {
    if (!text) return reply(`⚠️ ᴜsᴀɢᴇ: ${prefix + command} <topic>\n\nᴇxᴀᴍᴘʟᴇ: ${prefix + command} ᴀ ʙʀᴀᴠᴇ ᴅᴏɢ ɪɴ sᴘᴀᴄᴇ`);
    try {
        const res = await axios.post("https://chateverywhere.app/api/chat/", { model: { id: "gpt-4", name: "GPT-4" }, messages: [{ content: `Write a short entertaining story about: ${text}`, role: "user" }], temperature: 0.7 }, { headers: { "Accept": "*/*", "User-Agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36" } });
        reply(`📖 *sᴛᴏʀʏᴀɪ*\n\n${typeof res.data === 'string' ? res.data : JSON.stringify(res.data, null, 2)}`);
    } catch (e) { console.error(e); reply("❌ sᴛᴏʀʏᴀɪ ғᴀɪʟᴇᴅ, ᴛʀʏ ᴀɢᴀɪɴ ʟᴀᴛᴇʀ."); }
}
break;


// --- EPHOTO TEXT EFFECTS ---
case "glitchtext": {
    if (args.length < 1) {
        return DybyTechInc.sendMessage(from, { text: "❌ ᴘʟᴇᴀsᴇ ᴘʀᴏᴠɪᴅᴇ ᴛᴇxᴛ!\nExample: .glitchtext Dyby" }, { quoted: qtext2 });
    }
    let text = args.join(" ");
    try {
        let url = `https://apis.prexzyvilla.site/glitchtext?text=${encodeURIComponent(text)}`;
        await DybyTechInc.sendMessage(from, { image: { url }, caption: `⚡ Glitch Text Generated for: ${text}` }, { quoted: qtext2 });
    } catch (e) {
        console.error(e);
        await DybyTechInc.sendMessage(from, { text: "⚠️ Error generating Glitch Text." }, { quoted: m });
    }
}
break;

// ▫️ /writetext - Write on wet glass
case "writetext": {
    if (args.length < 1) {
        return DybyTechInc.sendMessage(from, { text: "❌ ᴘʟᴇᴀsᴇ ᴘʀᴏᴠɪᴅᴇ ᴛᴇxᴛ!\nExample: .writetext Dyby" }, { quoted: qtext2 });
    }
    let text = args.join(" ");
    try {
        let url = `https://apis.prexzyvilla.site/writetext?text=${encodeURIComponent(text)}`;
        await DybyTechInc.sendMessage(from, { image: { url }, caption: `✍️ ᴡʀɪᴛᴇ ᴛᴇxᴛ ʟᴏɢᴏ ɢᴇɴᴇʀᴀᴛᴇᴅ ғᴏʀ: ${text}` }, { quoted: qtext2 });
    } catch (e) {
        console.error(e);
        await DybyTechInc.sendMessage(from, { text: "⚠️ Error generating Write Text logo." }, { quoted: qtext2 });
    }
}
break;

// ▫️ /advancedglow - Advanced glow effects
case "advancedglow": {
    if (args.length < 1) {
        return DybyTechInc.sendMessage(from, { text: "❌ ᴘʟᴇᴀsᴇ ᴘʀᴏᴠɪᴅᴇ ᴛᴇxᴛ!\nᴇxᴀᴍᴘʟᴇ: .advancedglow Dyby" }, { quoted: qtext2 });
    }
    let text = args.join(" ");
    try {
        let url = `https://apis.prexzyvilla.site/advancedglow?text=${encodeURIComponent(text)}`;
        await DybyTechInc.sendMessage(from, { image: { url }, caption: `💡 ᴀᴅᴠᴀɴᴄᴇᴅ ɢʟᴏᴡ ɢᴇɴᴇʀᴀᴛᴇᴅ ғᴏʀ: ${text}` }, { quoted: qtext2 });
    } catch (e) {
        console.error(e);
        await DybyTechInc.sendMessage(from, { text: "⚠️ Error generating Advanced Glow." }, { quoted: qtext2 });
    }
}
break;

// ▫️ /typographytext - Typography on pavement
case "typographytext": {
    if (args.length < 1) {
        return DybyTechInc.sendMessage(from, { text: "❌ ᴘʟᴇᴀsᴇ ᴘʀᴏᴠɪᴅᴇ ᴛᴇxᴛ!\nExample: .typographytext Dyby" }, { quoted: qtext2 });
    }
    let text = args.join(" ");
    try {
        let url = `https://apis.prexzyvilla.site/typographytext?text=${encodeURIComponent(text)}`;
        await DybyTechInc.sendMessage(from, { image: { url }, caption: `🖋️ ᴛʏᴘᴏɢʀᴀᴘʜʏ ᴛᴇxᴛ ɢᴇɴᴇʀᴀᴛᴇᴅ ғᴏʀ: ${text}` }, { quoted: qtext2 });
    } catch (e) {
        console.error(e);
        await DybyTechInc.sendMessage(from, { text: "⚠️ Error generating Typography Text." }, { quoted: qtext2 });
    }
}
break;

// ▫️ /pixelglitch - Pixel glitch effects
case "pixelglitch": {
    if (args.length < 1) {
        return DybyTechInc.sendMessage(from, { text: "❌ ᴘʟᴇᴀsᴇ ᴘʀᴏᴠɪᴅᴇ ᴛᴇxᴛ!\nExample: .pixelglitch Dyby" }, { quoted: qtext2 });
    }
    let text = args.join(" ");
    try {
        let url = `https://apis.prexzyvilla.site/pixelglitch?text=${encodeURIComponent(text)}`;
        await DybyTechInc.sendMessage(from, { image: { url }, caption: `🧩 ᴘɪxᴇʟ ɢʟɪᴛᴄʜ ɢᴇɴᴇʀᴀᴛᴇᴅ ғᴏʀ: ${text}` }, { quoted: qtext2 });
    } catch (e) {
        console.error(e);
        await DybyTechInc.sendMessage(from, { text: "⚠️ Error generating Pixel Glitch." }, { quoted: qtext2 });
    }
}
break;

// ▫️ /neonglitch - Neon glitch effects
case "neonglitch": {
    if (args.length < 1) {
        return DybyTechInc.sendMessage(from, { text: "❌ ᴘʟᴇᴀsᴇ ᴘʀᴏᴠɪᴅᴇ ᴛᴇxᴛ!\nExample: .neonglitch Dyby" }, { quoted: qtext2 });
    }
    let text = args.join(" ");
    try {
        let url = `https://apis.prexzyvilla.site/neonglitch?text=${encodeURIComponent(text)}`;
        await DybyTechInc.sendMessage(from, { image: { url }, caption: `💥 Neon Glitch Generated for: ${text}` }, { quoted: qtext2 });
    } catch (e) {
        console.error(e);
        await DybyTechInc.sendMessage(from, { text: "⚠️ Error generating Neon Glitch." }, { quoted: qtext2 });
    }
}
break;

// ▫️ /flagtext - Nigeria flag text
case "flagtext": {
    if (args.length < 1) {
        return DybyTechInc.sendMessage(from, { text: "❌ ᴘʟᴇᴀsᴇ ᴘʀᴏᴠɪᴅᴇ ᴛᴇxᴛ!\nExample: .flagtext Dyby" }, { quoted: qtext2 });
    }
    let text = args.join(" ");
    try {
        let url = `https://apis.prexzyvilla.site/flagtext?text=${encodeURIComponent(text)}`;
        await DybyTechInc.sendMessage(from, { image: { url }, caption: `ғʟᴀɢ ᴛᴇxᴛ ɢᴇɴᴇʀᴀᴛᴇᴅ ғᴏʀ: ${text}` }, { quoted: qtext2 });
    } catch (e) {
        console.error(e);
        await DybyTechInc.sendMessage(from, { text: "⚠️ Error generating Flag Text." }, { quoted: qtext2 });
    }
}
break;

// ▫️ /flag3dtext - 3D American flag text
case "flag3dtext": {
    if (args.length < 1) {
        return DybyTechInc.sendMessage(from, { text: "❌ ᴘʟᴇᴀsᴇ ᴘʀᴏᴠɪᴅᴇ ᴛᴇxᴛ!\nExample: .flag3dtext Dyby" }, { quoted: qtext2 });
    }
    let text = args.join(" ");
    try {
        let url = `https://apis.prexzyvilla.site/flag3dtext?text=${encodeURIComponent(text)}`;
        await DybyTechInc.sendMessage(from, { image: { url }, caption: `3ᴅ ғʟᴀɢ ᴛᴇxᴛ ɢᴇɴᴇʀᴀᴛᴇᴅ ғᴏʀ: ${text}` }, { quoted: qtext2 });
    } catch (e) {
        console.error(e);
        await DybyTechInc.sendMessage(from, { text: "⚠️ Error generating 3D Flag Text." }, { quoted: qtext2 });
    }
}
break;

// ▫️ /deletingtext - Eraser deleting effect
case "deletingtext": {
    if (args.length < 1) {
        return DybyTechInc.sendMessage(from, { text: "❌ ᴘʟᴇᴀsᴇ ᴘʀᴏᴠɪᴅᴇ ᴛᴇxᴛ!\nExample: .deletingtext Dyby" }, { quoted: qtext2 });
    }
    let text = args.join(" ");
    try {
        let url = `https://apis.prexzyvilla.site/deletingtext?text=${encodeURIComponent(text)}`;
        await DybyTechInc.sendMessage(from, { image: { url }, caption: `🩶 ᴅᴇʟᴇᴛɪɴɢ ᴛᴇxᴛ ᴇғғᴇᴄᴛ ɢᴇɴᴇʀᴀᴛᴇᴅ ғᴏʀ: ${text}` }, { quoted: qtext2 });
    } catch (e) {
        console.error(e);
        await DybyTechInc.sendMessage(from, { text: "⚠️ Error generating Deleting Text." }, { quoted: qtext2 });
    }
}
break;

// ▫️ /blackpinkstyle - Blackpink style logo
case "blackpinkstyle": {
    if (args.length < 1) {
        return DybyTechInc.sendMessage(from, { text: "❌ ᴘʟᴇᴀsᴇ ᴘʀᴏᴠɪᴅᴇ ᴛᴇxᴛ!\nExample: .blackpinkstyle Dyby" }, { quoted: qtext2 });
    }
    let text = args.join(" ");
    try {
        let url = `https://apis.prexzyvilla.site/blackpinkstyle?text=${encodeURIComponent(text)}`;
        await DybyTechInc.sendMessage(from, { image: { url }, caption: `🎀 ʙʟᴀᴄᴋᴘɪɴᴋ sᴛʏʟᴇ ɢᴇɴᴇʀᴀᴛᴇᴅ ғᴏʀ: ${text}` }, { quoted: qtext2 });
    } catch (e) {
        console.error(e);
        await DybyTechInc.sendMessage(from, { text: "⚠️ Error generating Blackpink Style." }, { quoted: qtext2 });
    }
}
break;
// ▫️ /glowingtext - Glowing text effects
case "glowingtext": {
    if (args.length < 1) {
        return DybyTechInc.sendMessage(from, { text: "❌ ᴘʟᴇᴀsᴇ ᴘʀᴏᴠɪᴅᴇ ᴛᴇxᴛ!\nExample: .glowingtext Dyby" }, { quoted: qtext2 });
    }
    let text = args.join(" ");
    try {
        let url = `https://apis.prexzyvilla.site/glowingtext?text=${encodeURIComponent(text)}`;
        await DybyTechInc.sendMessage(from, { image: { url }, caption: `💫 ɢʟᴏᴡɪɴɢ ᴛᴇxᴛ ɢᴇɴᴇʀᴀᴛᴇᴅ ғᴏʀ: ${text}` }, { quoted: qtext2 });
    } catch (e) {
        console.error(e);
        await DybyTechInc.sendMessage(from, { text: "⚠️ Error generating Glowing Text." }, { quoted: qtext2 });
    }
}
break;

// ▫️ /underwatertext - 3D underwater text
case "underwatertext": {
    if (args.length < 1) {
        return DybyTechInc.sendMessage(from, { text: "❌ ᴘʟᴇᴀsᴇ ᴘʀᴏᴠɪᴅᴇ ᴛᴇxᴛ!\nExample: .underwatertext Dyby" }, { quoted: qtext2 });
    }
    let text = args.join(" ");
    try {
        let url = `https://apis.prexzyvilla.site/underwatertext?text=${encodeURIComponent(text)}`;
        await DybyTechInc.sendMessage(from, { image: { url }, caption: `🌊 Underwater Text Generated for: ${text}` }, { quoted: qtext2 });
    } catch (e) {
        console.error(e);
        await DybyTechInc.sendMessage(from, { text: "⚠️ Error generating Underwater Text." }, { quoted: qtext2 });
    }
}
break;

// ▫️ /logomaker - Bear logo maker
case "logomaker": {
    if (args.length < 1) {
        return DybyTechInc.sendMessage(from, { text: "❌ ᴘʟᴇᴀsᴇ ᴘʀᴏᴠɪᴅᴇ ᴛᴇxᴛ!\nExample: .logomaker Dyby" }, { quoted: qtext2 });
    }
    let text = args.join(" ");
    try {
        let url = `https://apis.prexzyvilla.site/logomaker?text=${encodeURIComponent(text)}`;
        await DybyTechInc.sendMessage(from, { image: { url }, caption: `🐻 ʟᴏɢᴏ ᴍᴀᴋᴇʀ ɢᴇɴᴇʀᴀᴛᴇᴅ ғᴏʀ: ${text}` }, { quoted: qtext2 });
    } catch (e) {
        console.error(e);
        await DybyTechInc.sendMessage(from, { text: "⚠️ Error generating Logo Maker." }, { quoted: qtext2 });
    }
}
break;

// ▫️ /cartoonstyle - Cartoon graffiti text
case "cartoonstyle": {
    if (args.length < 1) {
        return DybyTechInc.sendMessage(from, { text: "❌ ᴘʟᴇᴀsᴇ ᴘʀᴏᴠɪᴅᴇ ᴛᴇxᴛ!\nExample: .cartoonstyle Dyby" }, { quoted: qtext2 });
    }
    let text = args.join(" ");
    try {
        let url = `https://apis.prexzyvilla.site/cartoonstyle?text=${encodeURIComponent(text)}`;
        await DybyTechInc.sendMessage(from, { image: { url }, caption: `🎨 ᴄᴀʀᴛᴏᴏɴ sᴛʏʟᴇ ᴛᴇxᴛ ɢᴇɴᴇʀᴀᴛᴇᴅ ғᴏʀ: ${text}` }, { quoted: qtext2 });
    } catch (e) {
        console.error(e);
        await DybyTechInc.sendMessage(from, { text: "⚠️ Error generating Cartoon Style Text." }, { quoted: qtext2 });
    }
}
break;

// ▫️ /papercutstyle - 3D paper cut style
case "papercutstyle": {
    if (args.length < 1) {
        return DybyTechInc.sendMessage(from, { text: "❌ ᴘʟᴇᴀsᴇ ᴘʀᴏᴠɪᴅᴇ ᴛᴇxᴛ!\nExample: .papercutstyle Dyby" }, { quoted: qtext2 });
    }
    let text = args.join(" ");
    try {
        let url = `https://apis.prexzyvilla.site/papercutstyle?text=${encodeURIComponent(text)}`;
        await DybyTechInc.sendMessage(from, { image: { url }, caption: `✂️ ᴘᴀᴘᴇʀ ᴄᴜᴛ sᴛʏʟᴇ ɢᴇɴᴇʀᴀᴛᴇᴅ ғᴏʀ: ${text}` }, { quoted: qtext2 });
    } catch (e) {
        console.error(e);
        await DybyTechInc.sendMessage(from, { text: "⚠️ Error generating Paper Cut Style." }, { quoted: qtext2 });
    }
}
break;

// ▫️ /watercolortext - Watercolor text effect
case "watercolortext": {
    if (args.length < 1) {
        return DybyTechInc.sendMessage(from, { text: "❌ ᴘʟᴇᴀsᴇ ᴘʀᴏᴠɪᴅᴇ ᴛᴇxᴛ!\nExample: .watercolortext Dyby" }, { quoted: qtext2 });
    }
    let text = args.join(" ");
    try {
        let url = `https://apis.prexzyvilla.site/watercolortext?text=${encodeURIComponent(text)}`;
        await DybyTechInc.sendMessage(from, { image: { url }, caption: `🖌️ ᴡᴀᴛᴇʀᴄᴏʟᴏʀ ᴛᴇxᴛ ɢᴇɴᴇʀᴀᴛᴇᴅ ғᴏʀ: ${text}` }, { quoted: qtext2 });
    } catch (e) {
        console.error(e);
        await DybyTechInc.sendMessage(from, { text: "⚠️ Error generating Watercolor Text." }, { quoted: qtext2 });
    }
}
break;

// ▫️ /effectclouds - Text on clouds in sky
case "effectclouds": {
    if (args.length < 1) {
        return DybyTechInc.sendMessage(from, { text: "❌ ᴘʟᴇᴀsᴇ ᴘʀᴏᴠɪᴅᴇ ᴛᴇxᴛ!\nExample: .effectclouds Dyby" }, { quoted: qtext2 });
    }
    let text = args.join(" ");
    try {
        let url = `https://apis.prexzyvilla.site/effectclouds?text=${encodeURIComponent(text)}`;
        await DybyTechInc.sendMessage(from, { image: { url }, caption: `☁️ ᴄʟᴏᴜᴅs ᴛᴇxᴛ ɢᴇɴᴇʀᴀᴛᴇᴅ ғᴏʀ: ${text}` }, { quoted: qtext2 });
    } catch (e) {
        console.error(e);
        await DybyTechInc.sendMessage(from, { text: "⚠️ Error generating Cloud Text." }, { quoted: qtext2 });
    }
}
break;

// ▫️ /blackpinklogo - Blackpink logo creator
case "blackpinklogo": {
    if (args.length < 1) {
        return DybyTechInc.sendMessage(from, { text: "❌ ᴘʟᴇᴀsᴇ ᴘʀᴏᴠɪᴅᴇ ᴛᴇxᴛ!\nExample: .blackpinklogo Dyby" }, { quoted: qtext2 });
    }
    let text = args.join(" ");
    try {
        let url = `https://apis.prexzyvilla.site/blackpinklogo?text=${encodeURIComponent(text)}`;
        await DybyTechInc.sendMessage(from, { image: { url }, caption: `💖 ʙʟᴀᴄᴋᴘɪɴᴋ ʟᴏɢᴏ ɢᴇɴᴇʀᴀᴛᴇᴅ ғᴏʀ: ${text}` }, { quoted: qtext2 });
    } catch (e) {
        console.error(e);
        await DybyTechInc.sendMessage(from, { text: "⚠️ Error generating Blackpink Logo." }, { quoted: qtext2 });
    }
}
break;

// ▫️ /gradienttext - 3D gradient text effect
case "gradienttext": {
    if (args.length < 1) {
        return DybyTechInc.sendMessage(from, { text: "❌ ᴘʟᴇᴀsᴇ ᴘʀᴏᴠɪᴅᴇ ᴛᴇxᴛ!\nExample: .gradienttext Dyby" }, { quoted: qtext2 });
    }
    let text = args.join(" ");
    try {
        let url = `https://apis.prexzyvilla.site/gradienttext?text=${encodeURIComponent(text)}`;
        await DybyTechInc.sendMessage(from, { image: { url }, caption: `🌈 ɢʀᴀᴅɪᴇɴᴛ ᴛᴇxᴛ ɢᴇɴᴇʀᴀᴛᴇᴅ ғᴏʀ: ${text}` }, { quoted: qtext2 });
    } catch (e) {
        console.error(e);
        await DybyTechInc.sendMessage(from, { text: "⚠️ Error generating Gradient Text." }, { quoted: qtext2 });
    }
}
break;

// ▫️ /summerbeach - Write in sand summer beach
case "summerbeach": {
    if (args.length < 1) {
        return DybyTechInc.sendMessage(from, { text: "❌ ᴘʟᴇᴀsᴇ ᴘʀᴏᴠɪᴅᴇ ᴛᴇxᴛ!\nExample: .summerbeach Dyby" }, { quoted: qtext2 });
    }
    let text = args.join(" ");
    try {
        let url = `https://apis.prexzyvilla.site/summerbeach?text=${encodeURIComponent(text)}`;
        await DybyTechInc.sendMessage(from, { image: { url }, caption: `🏖️ sᴜᴍᴍᴇʀ ʙᴇᴀᴄʜ ᴛᴇxᴛ ɢᴇɴᴇʀᴀᴛᴇᴅ ғᴏʀ: ${text}` }, { quoted: qtext2 });
    } catch (e) {
        console.error(e);
        await DybyTechInc.sendMessage(from, { text: "⚠️ Error generating Summer Beach Text." }, { quoted: qtext2 });
    }
}
break;

// ▫️ /luxurygold - Luxury gold text effect
case "luxurygold": {
    if (args.length < 1) {
        return DybyTechInc.sendMessage(from, { text: "❌ ᴘʟᴇᴀsᴇ ᴘʀᴏᴠɪᴅᴇ ᴛᴇxᴛ!\nExample: .luxurygold Dyby" }, { quoted: qtext2 });
    }
    let text = args.join(" ");
    try {
        let url = `https://apis.prexzyvilla.site/luxurygold?text=${encodeURIComponent(text)}`;
        await DybyTechInc.sendMessage(from, { image: { url }, caption: `🥇 ʟᴜxᴜʀʏ ɢᴏʟᴅ ᴛᴇxᴛ ɢᴇɴᴇʀᴀᴛᴇᴅ ғᴏʀ: ${text}` }, { quoted: qtext2 });
    } catch (e) {
        console.error(e);
        await DybyTechInc.sendMessage(from, { text: "⚠️ Error generating Luxury Gold Text." }, { quoted: qtext2 });
    }
}
break;
// ▫️ /multicoloredneon - Multicolored neon lights
case "multicoloredneon": {
    if (args.length < 1) {
        return DybyTechInc.sendMessage(from, { text: "❌ ᴘʟᴇᴀsᴇ ᴘʀᴏᴠɪᴅᴇ ᴛᴇxᴛ!\nExample: .multicoloredneon Dyby" }, { quoted: qtext2 });
    }
    let text = args.join(" ");
    try {
        let url = `https://apis.prexzyvilla.site/multicoloredneon?text=${encodeURIComponent(text)}`;
        await DybyTechInc.sendMessage(from, { image: { url }, caption: `🌈 ᴍᴜʟᴛɪᴄᴏʟᴏʀᴇᴅ ɴᴇᴏɴ ɢᴇɴᴇʀᴀᴛᴇᴅ ғᴏʀ: ${text}` }, { quoted: qtext2 });
    } catch (e) {
        console.error(e);
        await DybyTechInc.sendMessage(from, { text: "⚠️ Error generating Multicolored Neon." }, { quoted: qtext2 });
    }
}
break;

// ▫️ /sandsummer - Write in sand summer beach
case "sandsummer": {
    if (args.length < 1) {
        return DybyTechInc.sendMessage(from, { text: "❌ ᴘʟᴇᴀsᴇ ᴘʀᴏᴠɪᴅᴇ ᴛᴇxᴛ!\nExample: .sandsummer Dyby" }, { quoted: qtext2 });
    }
    let text = args.join(" ");
    try {
        let url = `https://apis.prexzyvilla.site/sandsummer?text=${encodeURIComponent(text)}`;
        await DybyTechInc.sendMessage(from, { image: { url }, caption: `🏝️ sᴀɴᴅ sᴜᴍᴍᴇʀ ᴛᴇxᴛ ɢᴇɴᴇʀᴀᴛᴇᴅ ғᴏʀ: ${text}` }, { quoted: qtext2 });
    } catch (e) {
        console.error(e);
        await DybyTechInc.sendMessage(from, { text: "⚠️ Error generating Sand Summer Text." }, { quoted: qtext2 });
    }
}
break;

// ▫️ /galaxywallpaper - Galaxy mobile wallpaper
case "galaxywallpaper": {
    if (args.length < 1) {
        return DybyTechInc.sendMessage(from, { text: "❌ ᴘʟᴇᴀsᴇ ᴘʀᴏᴠɪᴅᴇ ᴛᴇxᴛ!\nExample: .galaxywallpaper Dyby" }, { quoted: qtext2 });
    }
    let text = args.join(" ");
    try {
        let url = `https://apis.prexzyvilla.site/galaxywallpaper?text=${encodeURIComponent(text)}`;
        await DybyTechInc.sendMessage(from, { image: { url }, caption: `🌌 ɢᴀʟᴀxʏ ᴡᴀʟʟᴘᴀᴘᴇʀ ɢᴇɴᴇʀᴀᴛᴇᴅ ғᴏʀ: ${text}` }, { quoted: qtext2 });
    } catch (e) {
        console.error(e);
        await DybyTechInc.sendMessage(from, { text: "⚠️ Error generating Galaxy Wallpaper." }, { quoted: qtext2 });
    }
}
break;

// ▫️ /style1917 - 1917 style text effect
case "style1917": {
    if (args.length < 1) {
        return DybyTechInc.sendMessage(from, { text: "❌ ᴘʟᴇᴀsᴇ ᴘʀᴏᴠɪᴅᴇ ᴛᴇxᴛ!\nExample: .style1917 Dyby" }, { quoted: qtext2 });
    }
    let text = args.join(" ");
    try {
        let url = `https://apis.prexzyvilla.site/style1917?text=${encodeURIComponent(text)}`;
        await DybyTechInc.sendMessage(from, { image: { url }, caption: `🎖️ 1917 sᴛʏʟᴇ ᴛᴇxᴛ ɢᴇɴᴇʀᴀᴛᴇᴅ ғᴏʀ: ${text}` }, { quoted: qtext2 });
    } catch (e) {
        console.error(e);
        await DybyTechInc.sendMessage(from, { text: "⚠️ Error generating 1917 Style Text." }, { quoted: qtext2 });
    }
}
break;

// ▫️ /makingneon - Neon light with galaxy style
case "makingneon": {
    if (args.length < 1) {
        return DybyTechInc.sendMessage(from, { text: "❌ ᴘʟᴇᴀsᴇ ᴘʀᴏᴠɪᴅᴇ ᴛᴇxᴛ!\nExample: .makingneon Dyby" }, { quoted: qtext2 });
    }
    let text = args.join(" ");
    try {
        let url = `https://apis.prexzyvilla.site/makingneon?text=${encodeURIComponent(text)}`;
        await DybyTechInc.sendMessage(from, { image: { url }, caption: `🌠 ᴍᴀᴋɪɴɢ ɴᴇᴏɴ ɢᴇɴᴇʀᴀᴛᴇᴅ ғᴏʀ: ${text}` }, { quoted: qtext2 });
    } catch (e) {
        console.error(e);
        await DybyTechInc.sendMessage(from, { text: "⚠️ Error generating Making Neon." }, { quoted: qtext2 });
    }
}
break;

// ▫️ /royaltext - Royal text effect
case "royaltext": {
    if (args.length < 1) {
        return DybyTechInc.sendMessage(from, { text: "❌ ᴘʟᴇᴀsᴇ ᴘʀᴏᴠɪᴅᴇ ᴛᴇxᴛ!\nExample: .royaltext Dyby" }, { quoted: qtext2 });
    }
    let text = args.join(" ");
    try {
        let url = `https://apis.prexzyvilla.site/royaltext?text=${encodeURIComponent(text)}`;
        await DybyTechInc.sendMessage(from, { image: { url }, caption: `👑 ʀᴏʏᴀʟ ᴛᴇxᴛ ɢᴇɴᴇʀᴀᴛᴇᴅ ғᴏʀ: ${text}` }, { quoted: qtext2 });
    } catch (e) {
        console.error(e);
        await DybyTechInc.sendMessage(from, { text: "⚠️ Error generating Royal Text." }, { quoted: qtext2 });
    }
}
break;

// ▫️ /freecreate - 3D hologram text effect
case "freecreate": {
    if (args.length < 1) {
        return DybyTechInc.sendMessage(from, { text: "❌ ᴘʟᴇᴀsᴇ ᴘʀᴏᴠɪᴅᴇ ᴛᴇxᴛ!\nExample: .freecreate Dyby" }, { quoted: qtext2 });
    }
    let text = args.join(" ");
    try {
        let url = `https://apis.prexzyvilla.site/freecreate?text=${encodeURIComponent(text)}`;
        await DybyTechInc.sendMessage(from, { image: { url }, caption: `🧊 3D ʜᴏʟᴏɢʀᴀᴍ ᴛᴇxᴛ ɢᴇɴᴇʀᴀᴛᴇᴅ ғᴏʀ: ${text}` }, { quoted: qtext2 });
    } catch (e) {
        console.error(e);
        await DybyTechInc.sendMessage(from, { text: "⚠️ Error generating Free Create Text." }, { quoted: qtext2 });
    }
}
break;

// ▫️ /galaxystyle - Galaxy style name logo
case "galaxystyle": {
    if (args.length < 1) {
        return DybyTechInc.sendMessage(from, { text: "❌ ᴘʟᴇᴀsᴇ ᴘʀᴏᴠɪᴅᴇ ᴛᴇxᴛ!\nExample: .galaxystyle Dyby" }, { quoted: qtext2 });
    }
    let text = args.join(" ");
    try {
        let url = `https://apis.prexzyvilla.site/galaxystyle?text=${encodeURIComponent(text)}`;
        await DybyTechInc.sendMessage(from, { image: { url }, caption: `🪐 ɢᴀʟᴀxʏ sᴛʏʟᴇ ʟᴏɢᴏ ɢᴇɴᴇʀᴀᴛᴇᴅ ғᴏʀ: ${text}` }, { quoted: qtext2 });
    } catch (e) {
        console.error(e);
        await DybyTechInc.sendMessage(from, { text: "⚠️ Error generating Galaxy Style Logo." }, { quoted: qtext2 });
    }
}
break;

// ▫️ /lighteffects - Green neon light effects
case "lighteffects": {
    if (args.length < 1) {
        return DybyTechInc.sendMessage(from, { text: "❌ ᴘʟᴇᴀsᴇ ᴘʀᴏᴠɪᴅᴇ ᴛᴇxᴛ!\nExample: .lighteffects Dyby" }, { quoted: qtext2 });
    }
    let text = args.join(" ");
    try {
        let url = `https://apis.prexzyvilla.site/lighteffects?text=${encodeURIComponent(text)}`;
        await DybyTechInc.sendMessage(from, { image: { url }, caption: `💡 ʟɪɢʜᴛ ᴇғғᴇᴄᴛs ɢᴇɴᴇʀᴀᴛᴇᴅ ғᴏʀ: ${text}` }, { quoted: qtext2 });
    } catch (e) {
        console.error(e);
        await DybyTechInc.sendMessage(from, { text: "⚠️ Error generating Light Effects." }, { quoted: qtext2 });
    }
}
break;

case 'mediafire':
case 'mf': {
 try {
 const axios = require('axios');

 // 1. Vérification de l'URL
 if (!text) return DybyTechInc.reply(`📌 *${"ᴜsᴀɢᴇ"} :* ${prefix}mediafire [lien mediafire]`);
 
 if (!text.includes('mediafire.com/file')) {
 return DybyTechInc.reply(`❌ *${"ɪɴᴠᴀʟɪᴅ ᴍᴇᴅɪᴀғɪʀᴇ ʟɪɴᴋ"}*`);
 }

 await DybyTechInc.react("⏳");

 // 2. Appel à l'API de David Cyril
 const apiUrl = `https://apis.davidcyril.name.ng/mediafire?url=${encodeURIComponent(text)}&apikey=votre_cle_ici`;
 const response = await axios.get(apiUrl);
 const res = response.data;

 if (!res.downloadLink) {
 return DybyTechInc.reply(`❌ *${"ᴇʀʀᴏʀ"} :* ${"ᴄᴏʀʟᴅ ɴᴏᴛ ғᴀɴᴅᴄʜ ғɪᴛʜᴇ ᴏғᴛᴀɪʟs"}`);
 }

 // 3. Message d'information sur le fichier
 const infoMsg = `📂 *${"ᴍᴇᴅɪᴀғɪʀᴇ ᴅᴏᴡɴʟᴏᴀᴏғʀ"}*

📝 *${"ғɪᴛʜᴇ ɴᴀᴍᴇ"} :* ${res.fileName}
📦 *${"sɪᴢᴇ"} :* ${res.size}
📄 *${"ᴛʏᴘᴇ"} :* ${res.mimeType}

> ${"ᴜᴘʟᴏᴀᴅɪɴɢ ғɪᴛʜᴇ, ᴘᴛʜᴇᴀsᴇ ᴡᴀɪᴛ"}... 🚀`;

 await DybyTechInc.reply(infoMsg);
 await DybyTechInc.react("📥");

 // 4. Envoi du fichier en tant que document
 await sock.sendMessage(DybyTechInc.chat, { 
 document: { url: res.downloadLink }, 
 fileName: res.fileName, 
 mimetype: res.mimeType 
 }, { quoted: mquote });

 await DybyTechInc.react("✅");

 } catch (e) {
 console.error('Mediafire Error:', e);
 DybyTechInc.reply(`❌ *${"ᴀɴ ᴇʀʀᴏʀ ᴏᴄᴄᴜʀʀᴇᴅ"}* : ${"ғɪᴛʜᴇ ᴛᴏᴏ ᴛʜᴇʀɢᴇ ᴏʀ ᴀᴘɪ ᴇʀʀᴏʀ"}`);
 }
}
break;








case 'delcase': {
    try {
        if (!isOwner) return DybyTechInc.reply("ᴏᴡɴᴇʀ ᴏɴʟʏ ʙʀᴏ");
	const q = text || (DybyTechInc.quoted && DybyTechInc.quoted.text);
        if (!q) return DybyTechInc.reply(`*${"ᴜsᴀɢᴇ"} :* ${prefix}delcase [nom_de_la_case]`);

      
  const fs = require('fs');

        const path = './spider.js';

        if (!fs.existsSync(path)) return DybyTechInc.reply("❌ Fichier spider.js not found.");

        let content = fs.readFileSync(path, 'utf8');

        // Regex pour trouver la case : 
        // Cherche "case 'nom':" jusqu'au premier "break;" inclus
        // Le flag 's' permet au point (.) de matcher aussi les retours à la ligne
        const caseRegex = new RegExp(`case\\s+['"]${q}['"]:[\\s\\S]*?break;`, 'g');

        if (!caseRegex.test(content)) {
            return DybyTechInc.reply(`❌ case not found.`);
        }

        // Suppression de la case
        const updatedContent = content.replace(caseRegex, '');

        fs.writeFileSync(path, updatedContent, 'utf8');

        // Notification avec hidetag
        
        await sock.sendMessage(DybyTechInc.chat, { 
            text: `✅ Case "${q}" supprimée ! restarting...`, 
        });

        // Délai avant fermeture
        await new Promise(resolve => setTimeout(resolve, 1000));
        process.exit();

    } catch (e) {
        console.error(e);
        DybyTechInc.reply("❌ Error lors de la suppression.");
    }
}
break;
case 'addcase': {
    try {
        if (!isOwner) return DybyTechInc.reply("ᴏᴡɴᴇʀ ᴏɴʟʏ ʙʀᴏ");
      const q = text || (DybyTechInc.quoted && DybyTechInc.quoted.text);
	  if (!q) return DybyTechInc.reply(`*${"ᴜsᴀɢᴇ"} :* ${prefix}addcase [le contenu de la case]`);

        const fs = require('fs');
        const path = './spider.js'; 

        if (!fs.existsSync(path)) return DybyTechInc.reply("❌ Fichier spider.js not found.");

        let content = fs.readFileSync(path, 'utf8');

        // On cherche le switch principal
        const switchPattern = /switch\s*\(([^)]+)\)\s*\{/;
        const match = content.match(switchPattern);

        if (!match) return DybyTechInc.reply("❌ Impossible de trouver le switch principal.");

        const insertPosition = match.index + match[0].length;
        const newCase = `\n\n${q}\n`;

        // Insertion du code
        const updatedContent = content.slice(0, insertPosition) + newCase + content.slice(insertPosition);

        fs.writeFileSync(path, updatedContent, 'utf8');

        // Notification avec hidetag pour confirmer aux admins/membres
        
        await sock.sendMessage(DybyTechInc.chat, { 
            text: "✅ Case ajoutée ! auto restarting bot...", 
        });

        // Attendre 1 seconde pour être sûr que le message est envoyé avant de couper
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Commande pour arrêter le processus (PM2 ou Nodemon le relancera)
        process.exit();

    } catch (e) {
        console.error(e);
        DybyTechInc.reply("❌ Error lors de l'ajout ou du redémarrage.");
    }
}
break;


case 'pinterest':
case 'pin': {
    try {
        const axios = require('axios');

        if (!text) return DybyTechInc.reply(`📌 *ᴜsᴀɢᴇ :* ${prefix}pinterest cat | 5`);

        // Parse query and optional amount: .pinterest cat | 10
        const parts = text.split('|');
        const query = parts[0].trim();
        const amount = Math.min(parseInt(parts[1]?.trim()) || 1, 10); // max 10

        await DybyTechInc.react("🔍");

        const apiUrl = `https://apis.davidcyril.name.ng/search/pinterest?text=${encodeURIComponent(query)}&apikey=votre_cle_ici`;
        const response = await axios.get(apiUrl);
        const res = response.data;

        if (!res.success || !res.result || res.result.length === 0) {
            return DybyTechInc.reply(`❌ *ɴᴏ ʀᴇsᴜʟᴛs ғᴏᴜɴᴅ*`);
        }

        const total = Math.min(amount, res.result.length);

        await DybyTechInc.reply(`🔍 *ғᴏᴜɴᴅ ${res.result.length} ʀᴇsᴜʟᴛs — sᴇɴᴅɪɴɢ ${total} ɪᴍᴀɢᴇ${total > 1 ? 's' : ''}...*`);

        for (let i = 0; i < total; i++) {
            const pin = res.result[i];
            const caption = `🖼️ *ᴘɪɴᴛᴇʀᴇsᴛ sᴇᴀʀᴄʜ*

📝 *ᴄᴀᴘᴛɪᴏɴ :* ${pin.caption?.trim() || 'ɴᴏ ᴄᴀᴘᴛɪᴏɴ'}
👤 *ᴜᴘʟᴏᴀᴅᴇʀ :* ${pin.fullName} (@${pin.uploader})
👥 *ғᴏʟʟᴏᴡᴇʀs :* ${pin.followers}
🔗 *sᴏᴜʀᴄᴇ :* ${pin.source}

> ɪᴍᴀɢᴇ ${i + 1} ᴏғ ${total}`;

            await sock.sendMessage(DybyTechInc.chat, {
                image: { url: pin.image },
                caption: caption
            }, { quoted: mquote });

            // Small delay between images
            if (i < total - 1) await new Promise(r => setTimeout(r, 1500));
        }

        await DybyTechInc.react("✅");

    } catch (e) {
        console.error('Pinterest Error:', e);
        DybyTechInc.reply(`❌ *ᴇʀʀᴏʀ :* ғᴀɪʟᴇᴅ ᴛᴏ ғᴇᴛᴄʜ ɪᴍᴀɢᴇs`);
    }
}
break;

case 'ytmp4':
case 'video': {
    try {
        const axios = require('axios');

        // 1. Vérification de l'entrée utilisateur
        if (!text) return DybyTechInc.reply(`📌 *${"ᴜsᴀɢᴇ"} :* ${prefix}ytmp4 [url youtube]`);
        
        // Petite regex pour vérifier si c'est bien un lien YouTube
        const isUrl = text.match(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
        if (!isUrl) return DybyTechInc.reply(`❌ *${"ɪɴᴠᴀʟɪᴅ ʏᴏʀᴛᴜʙᴇ ʟɪɴᴋ"}*`);

        await DybyTechInc.react("⏳");

        // 2. Appel à l'API de David Cyril
        const apiUrl = `https://apis.davidcyril.name.ng/youtube/mp4?url=${encodeURIComponent(text)}&apikey=votre_cle_ici`;
        const response = await axios.get(apiUrl);
        const res = response.data;

        if (!res.status || !res.result) {
            return DybyTechInc.reply(`❌ *${"ᴇʀʀᴏʀ"} :* ${"ᴄᴏʀʟᴅ ɴᴏᴛ ғᴀɴᴅᴄʜ ᴠɪᴏғᴏ"}`);
        }

        const video = res.result;

        // 3. Information sur le téléchargement
        const infoMsg = `🎬 *${"ʏᴏʀᴛᴜʙᴇ ᴍᴘ4"}*

📝 *${"ᴛɪᴛᴛʜᴇ"} :* ${video.title}
🔗 *${"ᴜʀʟ"} :* ${text}

> ${"ᴜᴘʟᴏᴀᴅɪɴɢ ᴠɪᴏғᴏ, ᴘᴛʜᴇᴀsᴇ ᴡᴀɪᴛ"}... 🚀`;

        await sock.sendMessage(DybyTechInc.chat, { 
            image: { url: video.thumbnail }, 
            caption: infoMsg 
        }, { quoted: mquote });

        await DybyTechInc.react("📥");

        // 4. Envoi du fichier Vidéo (MP4)
        // Note : On utilise 'video' au lieu de 'document' pour qu'elle soit jouable directement
        await sock.sendMessage(DybyTechInc.chat, { 
            video: { url: video.url }, 
            caption: `✅ *${video.title}*`,
            mimetype: 'video/mp4',
            fileName: `${video.title}.mp4`
        }, { quoted: mquote });

        await DybyTechInc.react("✅");

    } catch (e) {
        console.error('YTMP4 Error:', e);
        DybyTechInc.reply(`❌ *${"ᴀɴ ᴇʀʀᴏʀ ᴏᴄᴄᴜʀʀᴇᴅ"}* : ${"ᴀᴘɪ ʟɪᴍɪᴛ ᴏʀ sᴇʀᴠᴇʀ ʙᴜsʏ"}`);
    }
}
break;

case 'apk':
case 'download': {
    try {
        const axios = require('axios');
        
        if (!text) return DybyTechInc.reply(`📌 *${"ᴜsᴀɢᴇ"} :* ${prefix}apk whatsapp`);

        await DybyTechInc.react("🔍");

        // 1. Appel à l'API de David Cyril
        const apiUrl = `https://apis.davidcyril.name.ng/download/apk?text=${encodeURIComponent(text)}&apikey=votre_cle_ici`;
        const response = await axios.get(apiUrl);
        const res = response.data;

        if (!res.status || !res.apk) {
            return DybyTechInc.reply(`❌ *${"ᴀᴘᴘʟɪᴄᴀᴛɪᴏɴ ɴᴏᴛ ғᴏʀɴᴅ"}*`);
        }

        const app = res.apk;

        // 2. Préparation du message d'info
        const infoMsg = `📦 *${"ᴀᴘᴋ ᴅᴏᴡɴʟᴏᴀᴏғʀ"}*

📝 *${"ɴᴀᴍᴇ"} :* ${app.name}
🆔 *${"ᴘᴀᴄᴋᴀɢᴇ"} :* ${app.package}
🆙 *${"ᴛʜᴇsᴛ ᴜᴘᴅᴀᴛᴇ"} :* ${app.lastUpdated}

> ${"sᴇɴᴅɪɴɢ ᴛʜᴇ ғɪᴛʜᴇ, ᴘᴛʜᴇᴀsᴇ ᴡᴀɪᴛ"}... ⏳`;

        // 3. Envoi de l'image de l'icône avec les détails
        await sock.sendMessage(DybyTechInc.chat, { 
            image: { url: app.icon }, 
            caption: infoMsg 
        }, { quoted: mquote });

        await DybyTechInc.react("📥");

        // 4. Envoi du fichier APK
        await sock.sendMessage(DybyTechInc.chat, { 
            document: { url: app.downloadLink }, 
            fileName: `${app.name}.apk`, 
            mimetype: 'application/vnd.android.package-archive' 
        }, { quoted: mquote });

        await DybyTechInc.react("✅");

    } catch (e) {
        console.error('APK Error:', e);
        DybyTechInc.reply(`❌ *${"ᴀɴ ᴇʀʀᴏʀ ᴏᴄᴄᴜʀʀᴇᴅ"}* : ${"ᴘᴛʜᴇᴀsᴇ ᴄʜᴇᴄᴋ ᴛʜᴇ ᴀᴘᴘ ɴᴀᴍᴇ ᴏʀ ʏᴏʀʀ ᴀᴘɪ ᴋᴇʏ"}`);
    }
}
break;

case 'join': {
    try {
        if (!isOwner) return DybyTechInc.reply("ᴏɴʟʏ ʙᴏᴛ ᴏᴡɴᴇʀ ᴄᴀɴ ᴜsᴇ ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ");
        if (!text) return DybyTechInc.reply(`📌 *${"ᴜsᴀɢᴇ"} :* ${prefix}join https://chat.whatsapp.com/xxxxx`);

        // Extraction du code de l'invitation depuis le lien
        const linkRegex = /chat\.whatsapp\.com\/([\w\d!@#$%^&*+-=]+)/;
        const [_, code] = text.match(linkRegex) || [];

        if (!code) return DybyTechInc.reply("ɪɴᴠᴀʟɪᴅ ɢʀᴏʀᴘ ʟɪɴᴋ");

        await DybyTechInc.react("📨");
        
        // Commande pour rejoindre
        const response = await sock.groupAcceptInvite(code);
        
        DybyTechInc.reply("sᴜᴄᴄᴇsssғᴜʟʟʏ ᴊᴏɪɴᴇᴅ ᴛʜᴇ ɢʀᴏʀᴘ");
        await DybyTechInc.react("✅");

    } catch (e) {
        console.error(e);
        DybyTechInc.reply("ғᴀɪᴛʜᴇᴅ ᴛᴏ ᴊᴏɪɴ. ᴄʜᴇᴄᴋ ɪғ ᴛʜᴇ ʟɪɴᴋ ɪs ᴀᴄᴛɪᴠᴇ ᴏʀ ɪғ ᴛʜᴇ ʙᴏᴛ ɪs ʙᴀɴɴᴇᴅ ғʀᴏᴍ ᴛʜɪs ɢʀᴏʀᴘ.");
    }
}
break;
case 'left': {
    try {
        if (!isOwner) return DybyTechInc.reply("ᴏɴʟʏ ʙᴏᴛ ᴏᴡɴᴇʀ ᴄᴀɴ ᴜsᴇ ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ");

        let targetChat = DybyTechInc.chat;

        if (text && text.includes('chat.whatsapp.com')) {
            const linkRegex = /chat\.whatsapp\.com\/([\w\d!@#$%^&*+-=]+)/;
            const [_, code] = text.match(linkRegex) || [];
            if (code) {
                const groupInfo = await sock.groupGetInviteInfo(code);
                targetChat = groupInfo.id;
            }
        }

        if (!targetChat.endsWith('@g.us')) return DybyTechInc.reply("ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ ᴍᴜsᴛ ʙᴇ ᴜsᴇᴅ ɪɴ ᴀ ɢʀᴏʀᴘ ᴏʀ ᴡɪᴛʜ ᴀ ᴠᴀʟɪᴅ ʟɪɴᴋ");

        // 1. Récupérer les participants pour le hidetag
        const groupMetadata = await sock.groupMetadata(targetChat);
        const participants = groupMetadata.participants.map(a => a.id);

        // 2. Envoyer le message "I'm leaving the group" avec hidetag
        await sock.sendMessage(targetChat, { 
            text: "I'm leaving the group", 
            mentions: participants 
        });

        // 3. Envoyer le sticker à partir d'un lien (conversion auto par Baileys)
        await sock.sendMessage(targetChat, { 
            sticker: { url: "https://files.catbox.moe/h8c5fk.jpg" }, // METTEZ VOTRE LIEN ICI
            mimetype: "image/webp"
        });

        // 4. Attendre 2 secondes (2000 millisecondes)
        await new Promise(resolve => setTimeout(resolve, 2000));

        // 5. Quitter le groupe
        await sock.groupLeave(targetChat);

    } catch (e) {
        console.error(e);
        DybyTechInc.reply("ᴀɴ ᴇʀʀᴏʀ ᴏᴄᴄᴜʀʀᴇᴅ.");
    }
}
break;

case 'cloneweb':
case 'webdl': {
    try {
        const axios = require("axios");
        const AdmZip = require("adm-zip"); // Make sure to npm install adm-zip
        await DybyTechInc.react("🌐");

        if (!text) return DybyTechInc.reply(`*${"ᴜsᴀɢᴇ"} :* .cloneweb https://google.com`);

        let url = text.startsWith('http') ? text : `https://${text}`;
        DybyTechInc.reply("ᴄʟᴏɴɪɴɢ ᴀɴᴅ ɪɴᴊᴇᴄᴛɪɴɢ sʜɪᴘsʏ ᴍᴅ sɪɢɴᴀᴛᴜʀᴇ...");

        const apiUrl = `https://apis.davidcyril.name.ng/tools/downloadweb?url=${encodeURIComponent(url)}&apikey=`;
        const response = await axios.get(apiUrl);

        if (!response.data || (response.data.success !== "true" && response.data.success !== true)) {
            return DybyTechInc.reply("ᴄʟᴏɴɪɴɢ ғᴀɪᴛʜᴇᴅ. ᴄʜᴇᴄᴋ ᴛʜᴇ ᴜʀʟ.");
        }

        const downloadUrl = response.data.response.downloadUrl;
        const siteName = new URL(url).hostname;

        // 1. Download the ZIP into a buffer
        const zipBuffer = await axios.get(downloadUrl, { responseType: 'arraybuffer' });
        const zip = new AdmZip(zipBuffer.data);
        const zipEntries = zip.getEntries();

        // 2. Inject "Shipsy Mini Bot" comment in HTML/JS/CSS files
        zipEntries.forEach((entry) => {
            if (entry.entryName.endsWith(".html")) {
                let content = entry.getData().toString("utf8");
                content = `\n` + content;
                zip.updateFile(entry, Buffer.from(content, "utf8"));
            } else if (entry.entryName.endsWith(".js") || entry.entryName.endsWith(".css")) {
                let content = entry.getData().toString("utf8");
                content = `/* Cloned by Shipsy Mini Bot */\n` + content;
                zip.updateFile(entry, Buffer.from(content, "utf8"));
            }
        });

        const finalZipBuffer = zip.toBuffer();

        // 3. Send the modified ZIP
        let caption = `
╭-----------------------------╼*
┆✞ 🌐 ${"sʜɪᴘsʏ ᴍᴅ ᴡᴇʙ ᴄʟᴏɴᴇʀ"}*
╰-----------------------------╼*
┆✞ ◈ ${"sᴛᴀᴛᴜs"} :* Signature Injected ✅
╰-----------------------------`.trim();

        await sock.sendMessage(DybyTechInc.chat, {
            document: finalZipBuffer,
            fileName: `${siteName}_spider_xd.zip`,
            mimetype: 'application/zip',
            caption: caption
        }, { quoted: mquote });

        await DybyTechInc.react("✅");

    } catch (e) {
        console.error("CloneWeb Error:", e.message);
        DybyTechInc.reply("ᴇʀʀᴏʀ ᴡʜɪᴛʜᴇ ᴍᴏᴅɪғʏɪɴɢ ᴛʜᴇ sᴏʀʀᴄᴇ ᴄᴏᴏғ.");
    }
}
break;



case 'chainfo':
case 'channel': {
    try {
        const axios = require("axios");
        await DybyTechInc.react("📢");

        let link = text || (m.quoted ? m.quoted.text : "");
        if (!link || !link.includes("whatsapp.com/channel")) {
            return DybyTechInc.reply(`*${"ᴇxᴇᴍᴘᴛʜᴇ"} :* .chainfo https://whatsapp.com/channel/xxxx`);
        }

        DybyTechInc.reply("ᴡᴀɪᴛ ғᴏʀ ᴇxᴛʀᴀᴄᴛɪɴɢ ᴄʜᴀɴɴᴇʟ ɪɴғᴏ...");

        const apiUrl = `https://apis.davidcyril.name.ng/stalk/wa?url=${encodeURIComponent(link)}`;
        const response = await axios.get(apiUrl);

        // On vérifie si on a au moins le titre, car l'API ne donne pas de "success: true" ici
        if (!response.data || !response.data.title) {
            return DybyTechInc.reply("ɪᴍᴘᴏssɪʙᴛʜᴇ ᴏғ ᴛʀᴏʀᴠᴇʀ ᴛʜᴇs ɪɴғᴏs ᴏғ ᴄᴇ ᴄʜᴀɴɴᴇʟ.");
        }

        const channel = response.data;

        let caption = `
╭-----------------------------╼*
┆✞ 📢 ${"sʜɪᴘsʏ ᴍᴅ ᴄʜᴀɴɴᴇʟ sᴛᴀʟᴋ"}*
╰-----------------------------╼*

╭-----------------------------
┆✞ ${"ɪɴғᴏʀᴍᴀᴛɪᴏɴ"}*
┆✞ ◈ ${"ɴᴀᴍᴇ"} :* ${channel.title}
┆✞ ◈ ${"ғᴏʟʟᴏᴡᴇʀs"} :* ${channel.followers || "N/A"}
┆✞ ◈ ${"ɴᴀᴍᴇʙʀᴇ"} :* ${channel.followersCount || "N/A"}
╰-----------------------------

╭-----------------------------
┆✞ ${"ᴏғsᴄʀɪᴘᴛɪᴏɴ"}*
┆✞ ${channel.description || "No description"}
╰-----------------------------

> *${"ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴅᴇᴠ ᴅʏʙʏ"}*`.trim();

        // Note: Si l'API ne renvoie pas d'image, on envoie juste le texte
        if (channel.img || channel.image) {
            await sock.sendMessage(DybyTechInc.chat, {
                image: { url: channel.img || channel.image },
                caption: caption
            }, { quoted: mquote });
        } else {
            await DybyTechInc.reply(caption);
        }

        await DybyTechInc.react("✅");

    } catch (e) {
        console.error("Channel Info Error:", e.message);
        DybyTechInc.reply("ᴛʜᴇ sᴇʀᴠᴇᴜʀ sᴛᴀʟᴋ ᴇsᴛ ɪɴᴊᴏɪɢɴᴀʙᴛʜᴇ.");
    }
}
break;

case 'removebg':
case 'rbg': {
    try {
        const axios = require("axios");
        const FormData = require('form-data');
        
        // Vérifier si c'est une image (directe ou citée)
        const quoted = m.quoted ? m.quoted : m;
        const mime = (quoted.msg || quoted).mimetype || '';

        if (!/image/.test(mime)) {
            return DybyTechInc.reply(`*${"ɪɴғᴏ"} :* ${"ʀéᴘᴏɴᴅs à ᴜɴᴇ ɪᴍᴀɢᴇ ᴡɪᴛʜ ᴛʜᴇ ᴄᴏᴍᴍᴀɴᴏғ .ʀᴇᴍᴏᴠᴇʙɢ"}`);
        }

        await DybyTechInc.react("🪄");
        DybyTechInc.reply("ᴘʀᴏᴄᴇssɪɴɢ...");

        // 1. Téléchargement de l'image
        const media = await quoted.download();

        // 2. Upload vers Catbox pour avoir une URL
        const bodyForm = new FormData();
        bodyForm.append('fileToUpload', media, 'image.png');
        bodyForm.append('reqtype', 'fileupload');

        const uploadRes = await axios.post('https://catbox.moe/user/api.php', bodyForm, {
            headers: bodyForm.getHeaders()
        });
        
        const imageUrl = uploadRes.data;

        // 3. Appel de l'API RemoveBG de David Cyril
        const apiUrl = `https://apis.davidcyril.name.ng/removebg?url=${encodeURIComponent(imageUrl)}`;
        
        // Note : L'API renvoie généralement directement le flux de l'image traitée
        await sock.sendMessage(DybyTechInc.chat, {
            image: { url: apiUrl },
            caption: `✨ *${"sʜɪᴘsʏ ᴍᴅ ʀᴇᴍᴏᴠᴇʙɢ"}*\n\n> *${"ᴀʀʀɪèʀᴇ-ᴘᴛʜᴇɴ ʀᴀɴᴅɪʀé"}*`
        }, { quoted: mquote });

        await DybyTechInc.react("✅");

    } catch (e) {
        console.error("RemoveBG Error:", e.message);
        DybyTechInc.reply("ᴇʀʀᴏʀ ʟᴏʀs ᴏғ ᴛʜᴇ ᴛʀᴀɪᴛᴇᴍᴇɴᴛ ᴏғ ʟ'ɪᴍᴀɢᴇ.");
    }
}
break;

case 'ss':
case 'ssweb': {
    try {
        const axios = require("axios");
        await DybyTechInc.react("📸");

        // Vérification si une URL est fournie
        if (!text) return DybyTechInc.reply(`*${"ᴇxᴇᴍᴘᴛʜᴇ"} :* .ssweb https://google.com`);

        // Nettoyage de l'URL (ajout de https:// si absent)
        let url = text.startsWith('http') ? text : `https://${text}`;

        DybyTechInc.reply("sᴄʀᴇᴇɴsʜᴏᴛ ᴅ'éᴄʀᴀɴ ɪɴ ᴘʀᴏɢʀᴇss...");

        // Appel de l'API SSWeb de David Cyril
        const apiUrl = `https://apis.davidcyril.name.ng/ssweb?url=${encodeURIComponent(url)}`;
        
        // On envoie directement le résultat de l'API comme image
        await sock.sendMessage(DybyTechInc.chat, {
            image: { url: apiUrl },
            caption: `🌐 *${"sʜɪᴘsʏ ᴍᴅ sᴄʀᴇᴇɴsʜᴏᴛ"}*\n\n*🔗 ${"ᴜʀʟ"} :* ${url}\n\n> *${"ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴅᴇᴠ ᴅʏʙʏ"}*`
        }, { quoted: mquote });

        await DybyTechInc.react("✅");

    } catch (e) {
        console.error("SSWeb Error:", e.message);
        DybyTechInc.reply("ᴇʀʀᴏʀ ʟᴏʀs ᴏғ ᴛʜᴇ sᴄʀᴇᴇɴsʜᴏᴛ ᴏғ ᴛʜᴇ ᴡᴇʙsɪᴛᴇ.");
    }
}
break;

case 'quote':
case 'citation': {
    try {
        const axios = require("axios");
        await DybyTechInc.react("📜");

        const apiUrl = `https://apis.davidcyril.name.ng/random/quotes`;
        const response = await axios.get(apiUrl);

        // Vérification du statut dans ton nouveau JSON
        if (!response.data || !response.data.status) {
            return DybyTechInc.reply("ɪᴍᴘᴏssɪʙᴛʜᴇ ᴏғ ʀéᴄᴜᴘéʀᴇʀ ᴜɴᴇ ǫᴜᴏᴛᴇ.");
        }

        const quoteData = response.data.quote;
        const quoteText = quoteData.text;
        const quoteAuthor = quoteData.author;

        // Mise en forme propre
        let message = `
✨ *${"sʜɪᴘsʏ ᴍᴅ ǫᴜᴏᴛᴇs"}*

“ ${quoteText} ”

*─ ${quoteAuthor}*

> *${"ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴅᴇᴠ ᴅʏʙʏ"}*`.trim();

        await DybyTechInc.reply(message);
        await DybyTechInc.react("✅");

    } catch (e) {
        console.error("Quote Error:", e.message);
        DybyTechInc.reply("ᴇʀʀᴏʀ ᴏғ ᴄᴏɴɴᴇᴄᴛɪᴏɴ ᴡɪᴛʜ ʟ'ᴀᴘɪ ᴏғ ǫᴜᴏᴛᴇs.");
    }
}
break;

case 'tiktok':
case 'tt': {
    try {
        const axios = require("axios");
        await DybyTechInc.react("📥");

        if (!text) return DybyTechInc.reply(`*${"ᴇxᴇᴍᴘᴛʜᴇ"} :* .tiktok [lien]`);
        
        const apiUrl = `https://apis.davidcyril.name.ng/download/tiktok?url=${encodeURIComponent(text)}&apikey=`;
        const response = await axios.get(apiUrl);

        if (!response.data || !response.data.success) {
            return DybyTechInc.reply("ɪᴍᴘᴏssɪʙᴛʜᴇ ᴏғ ʀéᴄᴜᴘéʀᴇʀ ᴛʜᴇ ᴠɪᴅéᴏ.");
        }

        const res = response.data.result;

        // Texte du message
        let caption = `
🚀 *${"sʜɪᴘsʏ ᴍᴅ ᴛɪᴋᴛᴏᴋ"}*

╭-----------------------------
┆✞ ${"ɪɴғᴏ"}*
┆✞ ◈ ${"ɴᴀᴍᴇ"} : ${res.author.nickname || "User"}*
┆✞ ◈ ${"ᴏғsᴄ"} : ${res.desc || "No description"}*
╰-----------------------------`.trim();

        // Définition du bouton pour l'audio
        const buttons = [
            { 
                buttonId: `.tmaudio ${text}`, 
                buttonText: { displayText: "ɢᴀɴᴅ ᴀᴜᴅɪᴏ" }, 
                type: 1 
            }
        ];

        // Envoi de la vidéo avec le bouton
        await sock.sendMessage(DybyTechInc.chat, {
            video: { url: res.video },
            caption: caption,
            footer: `ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴅᴇᴠ ᴅʏʙʏ`,
            buttons: buttons,
            headerType: 4
        }, { quoted: mquote });

        await DybyTechInc.react("✅");

    } catch (e) {
        console.error("TikTok Error:", e);
        DybyTechInc.reply("ᴇʀʀᴏʀ ᴡɪᴛʜ ᴛʜᴇ sᴇʀᴠɪᴄᴇ ᴛɪᴋᴛᴏᴋ.");
    }
}
break;

// Commande cachée pour faire fonctionner le bouton audio
case 'tmaudio': {
    if (!text) return;
    const axios = require("axios");
    const apiUrl = `https://apis.davidcyril.name.ng/download/tiktok?url=${encodeURIComponent(text)}&apikey=`;
    const response = await axios.get(apiUrl);
    const audioUrl = response.data.result.music;

    await sock.sendMessage(DybyTechInc.chat, { 
        audio: { url: audioUrl }, 
        mimetype: 'audio/mp4',
        ptt: false 
    }, { quoted: mquote });
}
break;


case 'couplepp':
case 'ppcp': {
    try {
        const axios = require("axios");
        await DybyTechInc.react("👩‍❤️‍👨");

        // Utilisation du nouveau domaine stable avec la structure demandée
        const apiUrl = `https://apis.davidcyril.name.ng/couplepp?apikey=`;
        const response = await axios.get(apiUrl);

        if (!response.data || !response.data.success) {
            return DybyTechInc.reply("ᴀᴘɪ ᴇʀʀᴏʀ: ɪᴍᴘᴏssɪʙᴛʜᴇ ᴏғ ʀéᴄᴜᴘéʀᴇʀ ᴛʜᴇs ɪᴍᴀɢᴇs.");
        }

        const res = response.data;

        // Envoi de la version Homme
        await sock.sendMessage(DybyTechInc.chat, { 
            image: { url: res.male }, 
            caption: `♂️ *${"sʜɪᴘsʏ ᴍᴅ ᴍᴀᴛʜᴇ"}*` 
        }, { quoted: mquote });

        // Envoi de la version Femme
        await sock.sendMessage(DybyTechInc.chat, { 
            image: { url: res.female }, 
            caption: `♀️ *${"sʜɪᴘsʏ ᴍᴅ ғᴇᴍᴀᴛʜᴇ"}*` 
        }, { quoted: mquote });

        await DybyTechInc.react("✅");

    } catch (e) {
        console.error("CouplePP Error:", e.message);
        DybyTechInc.reply("ᴛʜᴇ sᴇʀᴠᴇᴜʀ ᴅᴀᴠɪᴅ ᴄʏʀɪʟ ɴᴇ ʀéᴘᴏɴᴅ ᴘᴀs.");
    }
}
break;


case 'delete':
case 'del': {
    try {
        // 1. Vérifier si on répond à un message
        if (!m.quoted) return DybyTechInc.reply(`*${"ᴇʀʀᴏʀ"} :* ${"ᴘᴛʜᴇᴀsᴇ ʀᴇᴘʟʏ ᴛᴏ ᴛʜᴇ ᴍᴇssᴀɢᴇ ʏᴏʀ ᴡᴀɴᴛ ᴛᴏ ᴏғᴛʜᴀɴᴅᴇ"}`);

        // 2. Sécurité : En groupe, seul l'admin ou l'owner peut supprimer le message d'un autre
        if (isGroup && !isAdmins && !isOwner) {
            return DybyTechInc.reply(`*${"ᴇʀʀᴏʀ"} :* ${"ᴏɴʟʏ ᴀᴅᴍɪɴs ᴄᴀɴ ᴏғᴛʜᴀɴᴅᴇ ᴍᴇssᴀɢᴇs ғʀᴏᴍ ᴏᴛʜᴇʀ ᴍᴇᴍʙᴇʀs"}`);
        }

        // 3. Préparer la clé du message à supprimer
        const key = {
            remoteJid: m.chat,
            fromMe: m.quoted.fromMe,
            id: m.quoted.id,
            participant: m.quoted.sender
        };

        // 4. Envoyer l'ordre de suppression (Delete for Everyone)
        await sock.sendMessage(m.chat, { delete: key });

        // Petit feedback discret avec une réaction (optionnel)
        await DybyTechInc.react("🗑️");

    } catch (e) {
        console.error("Delete Error:", e);
        DybyTechInc.reply("ғᴀɪᴛʜᴇᴅ ᴛᴏ ᴏғᴛʜᴀɴᴅᴇ ᴛʜᴇ ᴍᴇssᴀɢᴇ.");
    }
}
break;


case 'autotyping': {
    try {
        await DybyTechInc.react("⌨️");
	const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net';
        if (!isOwner) return DybyTechInc.reply("ᴏᴡɴᴇʀ ᴏɴʟʏ", m.chat, { quoted: mquote });

        if (args[0]) {
            let mode = args[0].toLowerCase();
            if (['on', 'off'].includes(mode)) {
                sessionsConfig[botId].autotyping = mode;
                
                await DybyTechInc.react("✅");
                return DybyTechInc.reply(`✅ *${"ᴀᴜᴛᴏᴛʏᴘɪɴɢ ᴜᴘᴅᴀᴛᴇᴅ"}*\n\n> *${"sᴛᴀᴛᴜs"} :* ${mode.toUpperCase()}\n\n*ꜱʜɪᴘꜱʏ ᴍɪɴɪ ʙᴏᴛ ᴏᴘᴛɪᴍɪᴢᴇᴅ*`, m.chat, { quoted: mquote }); 
            } else {
                return DybyTechInc.reply(`${"ᴜsᴀɢᴇ"} : ${prefix}autotyping on / off`, m.chat, { quoted: mquote }); 
            }
        }

        const currentMode = sessionsConfig[botId].autotyping === 'on' ? '🟢 ᴏɴ' : '🔴 ᴏғғ';
        const msg = `⌨️ *${"ᴀᴜᴛᴏᴛʏᴘɪɴɢ sᴇᴛᴛɪɴɢs"}*\n\n` +
                    `*${"ᴄᴜʀʀᴇɴᴛ sᴛᴀᴛᴜs"} :* ${currentMode}\n\n` +
                    `> ${"ᴜsᴇ"} *${prefix}autotyping on* / *off*`;

    await DybyTechInc.reply(msg, m.chat, { quoted: mquote });

    } catch (e) {
        console.error(e);
        DybyTechInc.reply("ᴇʀʀᴏʀ ᴜᴘᴅᴀᴛɪɴɢ ᴀᴜᴛᴏᴛʏᴘɪɴɢ");
    }
}
break;

case 'autorecording': {
    try {
        await DybyTechInc.react("🎙️");
	const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net';
        if (!isOwner) return DybyTechInc.reply("ᴏᴡɴᴇʀ ᴏɴʟʏ");

        if (args[0]) {
            let mode = args[0].toLowerCase();
            if (['on', 'off'].includes(mode)) {
                sessionsConfig[botId].autorecording = mode;
                
                await DybyTechInc.react("✅");
                return DybyTechInc.reply(`✅ *${"ᴀᴜᴛᴏʀᴇᴄᴏʀᴅɪɴɢ ᴜᴘᴅᴀᴛᴇᴅ"}*\n\n> *${"sᴛᴀᴛᴜs"} :* ${mode.toUpperCase()}\n\n*ꜱʜɪᴘꜱʏ ᴍɪɴɪ ʙᴏᴛ ᴏᴘᴛɪᴍɪᴢᴇᴅ*`);
            } else {
                return DybyTechInc.reply(`${"ᴜsᴀɢᴇ"} : ${prefix}autorecording on / off`);
            }
        }

        const currentMode = sessionsConfig[botId].autorecording === 'on' ? '🟢 ᴏɴ' : '🔴 ᴏғғ';
        const msg = `🎙️ *${"ᴀᴜᴛᴏʀᴇᴄᴏʀᴅɪɴɢ sᴇᴛᴛɪɴɢs"}*\n\n` +
                    `*${"ᴄᴜʀʀᴇɴᴛ sᴛᴀᴛᴜs"} :* ${currentMode}\n\n` +
                    `> ${"ᴜsᴇ"} *${prefix}autorecording on* / *off*`;

        await DybyTechInc.reply(msg);

    } catch (e) {
        console.error(e);
        DybyTechInc.reply("ᴇʀʀᴏʀ ᴜᴘᴅᴀᴛɪɴɢ ᴀᴜᴛᴏʀᴇᴄᴏʀᴅɪɴɢ");
    }
}
break;


//-- ANTICALL CASE
case 'anticall': {
    try {
        await DybyTechInc.react("📞");
	const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net';
        // Vérification si c'est l'Owner
        if (!isOwner) return DybyTechInc.reply("ᴏᴡɴᴇʀ ᴏɴʟʏ");

        if (args[0]) {
            let mode = args[0].toLowerCase();
            // Validation des options autorisées
            if (['on', 'off'].includes(mode)) {
                sessionsConfig[botId].anticall = mode;
                
                await DybyTechInc.react("✅");
                return DybyTechInc.reply(`✅ *${"ᴀɴᴛɪᴄᴀʟʟ ᴜᴘᴅᴀᴛᴇᴅ"}*\n\n> *${"sᴛᴀᴛᴜs"} :* ${mode.toUpperCase()}\n\n*ꜱʜɪᴘꜱʏ ᴍɪɴɪ ʙᴏᴛ ᴏᴘᴛɪᴍɪᴢᴇᴅ*`);
            } else {
                // Si l'argument est incorrect
                return DybyTechInc.reply(`${"ᴜsᴀɢᴇ"} : ${prefix}anticall on / off`);
            }
        }

        // Si aucun argument n'est fourni, on affiche l'état actuel
        const currentMode = sessionsConfig[botId].anticall === 'on' ? '🟢 ᴏɴ' : '🔴 ᴏғғ';
        const msg = `🚫 *${"ᴀɴᴛɪᴄᴀʟʟ sᴇᴛᴛɪɴɢs"}*\n\n` +
                    `*${"ᴄᴜʀʀᴇɴᴛ sᴛᴀᴛᴜs"} :* ${currentMode}\n\n` +
                    `> ${"ᴜsᴇ"} *${prefix}anticall on* / *off*`;

        await DybyTechInc.reply(msg);

    } catch (e) {
        console.error(e);
        DybyTechInc.reply("ᴇʀʀᴏʀ ᴜᴘᴅᴀᴛɪɴɢ ᴀɴᴛɪᴄᴀʟʟ");
    }
}
break;

// --- DEBUT DU CASE ---
case 'take': case 'steal': case 'swm': {
    try {
        // 1. Vérifie si l'utilisateur a cité un message
        if (!m.quoted) return DybyTechInc.reply(`*${"ᴘᴛʜᴇᴀsᴇ ᴄɪᴛᴇʀ ᴜɴ sᴛɪᴄᴋᴇʀ"}*`);

        // 2. Vérifie si c'est bien un sticker (webp)
        const mime = (m.quoted.msg || m.quoted).mimetype || '';
        if (!/webp/.test(mime)) return DybyTechInc.reply(`*${"ᴛʜɪs ɪs ɴᴏᴛ ᴀ sᴛɪᴄᴋᴇʀ"}*`);

        await DybyTechInc.react("⏳");

        // 3. Découpage des arguments (ex: .take MonPack | MonNom)
        // args.join(" ") récupère tout le texte après la commande
        const textInput = args.join(" ");
        const [packname, ...authorParts] = (textInput || '').split('|');
        
        // Valeurs par défaut si l'utilisateur ne précise rien
        const finalPackname = packname.trim() || "𝚂𝙷𝙸𝙿𝚂𝚈 𝙼𝙸𝙽𝙸 𝙱𝙾𝚃";
        const finalAuthor = authorParts.join('|').trim() || "𝙳𝙴𝚅 𝙳𝚈𝙱𝚈";

        // 4. Téléchargement du sticker via smsg.js
        let media = await m.quoted.download();
        if (!media) return DybyTechInc.reply("ᴇʀʀᴏʀ ᴏғ ᴅᴏᴡɴʟᴏᴀᴅ");

        // 5. Utilisation de addExif pour injecter les nouvelles infos
        const stickerWithExif = await addExif(media, finalPackname, finalAuthor);

        // 6. Envoi du sticker modifié
        await sock.sendMessage(m.chat, { 
            sticker: stickerWithExif 
        }, { quoted: m });

        await DybyTechInc.react("✅");

    } catch (e) {
        console.error('Take Command Error:', e);
        await DybyTechInc.react("❌");
        DybyTechInc.reply(`❌ *${"ᴇʀʀᴏʀ"}*\n\n> ${"ᴠᴇʀɪғɪᴇᴢ ǫᴜᴇ ᴛʜᴇ ᴅᴏssɪᴇʀ ʟɪʙ ᴀɴᴅ ᴛʜᴇ ғɪᴄʜɪᴇʀ ᴇxɪғ.ᴊs sᴏɴᴛ ʙɪᴇɴ present."}`);
    }
}
break;

// --- FIN DU CASE ---

case 'telestick': case 'tgsticker': {
    try {
        const axios = require('axios');
        await DybyTechInc.react("📥");

        // 1. Vérification de l'argument (Lien Telegram)
        if (!args[0] || !args[0].match(/(https:\/\/t.me\/addstickers\/)/gi)) {
            return DybyTechInc.reply(`❌ *${"ᴇʀʀᴏʀ"}*\n\n> ${"ᴘᴛʜᴇᴀsᴇ ғᴏʀʀɴɪʀ ᴜɴ ʟɪɴᴋ ᴛᴀɴᴅʜᴇɢʀᴀᴍ ᴠᴀʟɪᴏғ."}`);
        }

        let packName = args[0].split("/addstickers/")[1];
        let botToken = "8554317133:AAGJtm5eqEj8GR8GN2D0MILhVSJKwjwsYcE";

        // 2. Récupération des infos du pack via l'API Telegram
        let response = await axios.get(`https://api.telegram.org/bot${botToken}/getStickerSet?name=${packName}`);
        if (!response.data.ok) return DybyTechInc.reply("ᴘᴀᴄᴋ ɴᴏᴛ ғᴏʀɴᴅ");

        let stickers = response.data.result.stickers;
        let limit = stickers.length > 15 ? 15 : stickers.length; // Limite pour la stabilité sur Termux

        await DybyTechInc.reply(`📦 *${"ᴛéʟéʟᴏᴀᴅɪɴɢ"}* : ${limit} stickers\n✨ *${"ᴡᴀᴛᴇʀᴍᴀʀᴋ"}* : 𝚂𝙷𝙸𝙿𝚂𝚈 𝙼𝙸𝙽𝙸 𝙱𝙾𝚃`);

        for (let i = 0; i < limit; i++) {
            // 3. Récupération du lien direct du sticker
            let fileId = stickers[i].file_id;
            let fileInfo = await axios.get(`https://api.telegram.org/bot${botToken}/getFile?file_id=${fileId}`);
            let finalUrl = `https://api.telegram.org/file/bot${botToken}/${fileInfo.data.result.file_path}`;

            // 4. Téléchargement du buffer du sticker
            const stickerRes = await axios.get(finalUrl, { responseType: 'arraybuffer' });
            const buffer = Buffer.from(stickerRes.data, 'binary');

            // 5. Injection de l'EXIF (Comme dans ta commande TAKE)
            // On utilise la fonction addExif de ton fichier lib/exif.js
            const stickerWithMeta = await addExif(buffer, "𝚂𝙷𝙸𝙿𝚂𝚈 𝙼𝙸𝙽𝙸 𝙱𝙾𝚃", "𝙶𝙰𝙰𝚁𝙰-𝚃𝙴𝙲𝙷");

            // 6. Envoi du sticker avec ton nom de pack
            await sock.sendMessage(m.chat, { 
                sticker: stickerWithMeta 
            });

            // Petit délai pour éviter de saturer la connexion
            await new Promise(resolve => setTimeout(resolve, 800));
        }

        await DybyTechInc.react("✅");

    } catch (e) {
        console.error('Telestick Error:', e);
        await DybyTechInc.react("❌");
        DybyTechInc.reply("ᴇʀʀᴏʀ ʟᴏʀs ᴏғ ᴛʜᴇ ʀéᴄᴜᴘéʀᴀᴛɪᴏɴ ᴏғ ᴛʜᴇ ᴘᴀᴄᴋ ᴛᴀɴᴅʜᴇɢʀᴀᴍ");
    }
}
break;

case 'wasted': {
    try {
        const Jimp = require('jimp');
        const axios = require('axios');
        
        let target = m.quoted ? m.quoted.sender : (m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : null);
        if (!target) return DybyTechInc.reply(`*${"ᴘᴛʜᴇᴀsᴇ ʀᴇᴘʟʏ ᴛᴏ sᴏᴍᴇᴏɴᴇ ᴏʀ ᴍᴇɴᴛɪᴏɴ ᴀ ᴜsᴇʀ"}*`);

        await DybyTechInc.react("📷");

        // 1. Récupérer l'URL de la photo de profil
        let ppUrl;
        try {
            ppUrl = await sock.profilePictureUrl(target, 'image');
        } catch {
            ppUrl = 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png'; 
        }

        // 2. Téléchargement sécurisé des images avec Axios
        const getBuffer = async (url) => {
            const res = await axios.get(url, { responseType: 'arraybuffer', headers: { 'User-Agent': 'Mozilla/5.0' } });
            return Buffer.from(res.data, 'binary');
        };

        const [ppBuffer, wastedBuffer] = await Promise.all([
            getBuffer(ppUrl),
            getBuffer('https://s.neoxr.eu/get/MnvzRq.png')
        ]);

        // 3. Traitement avec Jimp
        const profileImage = await Jimp.read(ppBuffer);
        const wastedOverlay = await Jimp.read(wastedBuffer);

        // 4. Appliquer un filtre Gris (optionnel pour le style mort)
        profileImage.greyscale(); 

        // 5. Redimensionnement
        profileImage.resize(500, 500);
        wastedOverlay.resize(500, Jimp.AUTO);

        // 6. Calcul de la position centrale
        const posY = (profileImage.getHeight() / 2) - (wastedOverlay.getHeight() / 2);

        // 7. Superposition
        profileImage.composite(wastedOverlay, 0, posY);

        const resultBuffer = await profileImage.getBufferAsync(Jimp.MIME_JPEG);

        // 8. Envoi
        await sock.sendMessage(DybyTechInc.chat, { 
            image: resultBuffer, 
            caption: `💀 *${"ᴡᴀsᴛᴇᴅ"}* ! @${target.split('@')[0]}`,
            mentions: [target]
        }, { quoted: mquote });

        await DybyTechInc.react("✅");

    } catch (e) {
        console.error('Wasted Error:', e);
        DybyTechInc.reply(`❌ *${"ᴄᴏɴɴᴇᴄᴛɪᴏɴ ᴇʀʀᴏʀ"}* : ${"ᴘᴛʜᴇᴀsᴇ ᴛʀʏ ᴀɢᴀɪɴ"}`);
    }
}
break;

case 'autoreact': {
    try {
        const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net';
        // Sécurité Propriétaire
        if (!isOwner) return DybyTechInc.reply(`*${"ᴀᴄᴄᴇss ᴏғɴɪᴇᴅ"}*`);

        // Si l'utilisateur a cliqué sur un bouton (ex: .autoreact all)
        if (args[0]) {
            let mode = args[0].toLowerCase();
            if (['all', 'group', 'chat', 'off'].includes(mode)) {
                sessionsConfig[botId].autoreact = mode;
                await DybyTechInc.react("✅");
                return DybyTechInc.reply(`✨ *${"ᴀᴜᴛᴏʀᴇᴀᴄᴛ sᴛᴀᴛᴜs"}* : ${mode === 'off' ? '🔴 OFF' : `🟢 ON (${mode.toUpperCase()})`}`);
            }
        }

        await DybyTechInc.react("⚙️");

        // --- RÉCUPÉRATION DU STATUT ACTUEL ---
        const currentStatus = sessionsConfig[botId].autoreact || 'off';

        // --- CONSTRUCTION DU MESSAGE ---
        const autoReactHeader = `╭-----------------------------⊷*
┆✞ ✨  ${"ᴀᴜᴛᴏʀᴇᴀᴄᴛ sᴇᴛᴜᴘ"}  ✨*
╭-----------------------------⊷*
┆✞ 📊 ${"ᴄᴜʀʀᴇɴᴛ"} : ${toSmallCaps(currentStatus)}*
╰-----------------------------⊷*`;

        const autoReactBody = `\n${"sᴀɴᴅʜᴇᴄᴛ ᴛʜᴇ ʀᴇᴀᴄᴛɪᴏɴ ᴍᴏᴅᴇ ғᴏʀ ᴛʜᴇ ʙᴏᴛ ʙᴇʟᴏᴡ"}\n\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴅᴇᴠ ᴅʏʙʏ*`;

        // --- ENVOI DU MESSAGE INTERACTIF (NATIVE FLOW) ---
        await sock.relayMessage(DybyTechInc.chat, {
            viewOnceMessage: {
                message: {
                    interactiveMessage: {
                        header: {
                            title: `*${"sʜɪᴘsʏ ᴍᴅ sᴇᴛᴛɪɴɢs"}*`,
                            hasMediaAttachment: false
                        },
                        body: { text: autoReactHeader + autoReactBody },
                        footer: { text: "ꜱʜɪᴘꜱʏ ᴍɪɴɪ ʙᴏᴛ ᴀᴜᴛᴏʀᴇᴀᴄᴛ ᴍᴀɴᴀɢᴇʀ 🕷️" },
                        nativeFlowMessage: {
                            buttons: [
                                {
                                    name: "quick_reply",
                                    buttonParamsJson: JSON.stringify({
                                        display_text: "ᴍᴏᴅᴇ ᴀʟʟ 🕸️",
                                        id: `${prefix}autoreact all`
                                    })
                                },
                                {
                                    name: "quick_reply",
                                    buttonParamsJson: JSON.stringify({
                                        display_text: "ᴍᴏᴅᴇ ɢʀᴏʀᴘ 🏷️",
                                        id: `${prefix}autoreact group`
                                    })
                                },
                                {
                                    name: "quick_reply",
                                    buttonParamsJson: JSON.stringify({
                                        display_text: "ᴍᴏᴅᴇ ᴄʜᴀᴛ👤",
                                        id: `${prefix}autoreact chat`
                                    })
                                },
                                {
                                    name: "quick_reply",
                                    buttonParamsJson: JSON.stringify({
                                        display_text: "ᴛᴜʀɴ ᴏғғ 🔴",
                                        id: `${prefix}autoreact off`
                                    })
                                }
                            ]
                        },
                        contextInfo: {
                            mentionedJid: [nowsender],
                            forwardingScore: 999,
                            isForwarded: true,
                            forwardedNewsletterMessageInfo: {
                                newsletterJid: NEWSLETTER_JID,
                                newsletterName: '𝐒𝐇𝐈𝐏𝐒𝐘 𝐌𝐈𝐍𝐈 𝐁𝐎𝐓',
                                serverMessageId: 125
                            }
                        }
                    }
                }
            }
        }, { quoted: mquote });

    } catch (e) {
        console.error('Autoreact Button Error:', e);
        DybyTechInc.reply("ᴇʀʀᴏʀ ᴡʜɪᴛʜᴇ ʟᴏᴀᴅɪɴɢ ɪɴᴛᴇʀᴀᴄᴛɪᴠᴇ ᴍᴇɴᴜ.");
    }
}
break;


case 'antilink': {
    try {
        const antilinkPath = './antilink.json';
        const botNumber = sock.user.id.split(':')[0];

        // Vérifications de base (Groupe + Admins/Owner)
        if (!isGroup) return DybyTechInc.reply(`*${"ᴜɴɪǫᴜᴇᴍᴇɴᴛ ᴇɴ ɢʀᴏʀᴘ"}*`);
        if (!isAdmins && !isOwner) return DybyTechInc.reply(`*${"ᴀᴅᴍɪɴs ᴏɴʟʏ"}*`);

        // Initialisation du fichier JSON si inexistant
        if (!fs.existsSync(antilinkPath)) fs.writeFileSync(antilinkPath, JSON.stringify({}));
        let antilinkData = JSON.parse(fs.readFileSync(antilinkPath, 'utf8'));
        if (!antilinkData[botNumber]) antilinkData[botNumber] = {};

        const groupJid = m.chat;
        const currentStatus = antilinkData[botNumber][groupJid] || "OFF";

        // Si aucun argument, on affiche le menu interactif
        if (!args[0]) {
            await DybyTechInc.react("🛡️");
            const antilinkMsg = `🛡️ *${"ᴀɴᴛɪʟɪɴᴋ sᴇᴛᴛɪɴɢs"}*

*${"sᴛᴀᴛᴜs ᴀᴄᴛᴜᴇʟ"} :* ${currentStatus.toUpperCase()}

> ${"ᴄʜᴏᴏsᴇ ᴀɴ ᴀᴄᴛɪᴏɴ ʙᴇʟᴏᴡ ғᴏʀ ғɪʟᴛʀᴇʀ ᴛʜᴇs ʟɪɴᴋs ᴇxᴛᴇʀɴᴇs ɪɴ ᴄᴇ ɢʀᴏʀᴘ."}`;

            await sock.relayMessage(m.chat, {
                viewOnceMessage: {
                    message: {
                        interactiveMessage: {
                            header: {
                                title: `*${"ᴀɴᴛɪʟɪɴᴋ ᴍᴀɴᴀɢᴇʀ"}*`,
                                hasMediaAttachment: false
                            },
                            body: { text: antilinkMsg },
                            footer: { text: "ꜱʜɪᴘꜱʏ ᴍɪɴɪ ʙᴏᴛ ᴏᴘᴛɪᴍɪᴢᴇᴅ ʙʏ ᴅᴇᴠ ᴅʏʙʏ" },
                            nativeFlowMessage: {
                                buttons: [
                                    {
                                        name: "quick_reply",
                                        buttonParamsJson: JSON.stringify({
                                            display_text: "🗑️ ᴏғᴛʜᴀɴᴅᴇ",
                                            id: `${prefix}antilink delete`
                                        })
                                    },
                                    {
                                        name: "quick_reply",
                                        buttonParamsJson: JSON.stringify({
                                            display_text: "⚠️ ᴡᴀʀɴ",
                                            id: `${prefix}antilink warn`
                                        })
                                    },
                                    {
                                        name: "quick_reply",
                                        buttonParamsJson: JSON.stringify({
                                            display_text: "🚫ᴋɪᴄᴋᴇᴅ",
                                            id: `${prefix}antilink kick`
                                        })
                                    },
                                    {
                                        name: "quick_reply",
                                        buttonParamsJson: JSON.stringify({
                                            display_text: "ᴏғғ",
                                            id: `${prefix}antilink off`
                                        })
                                    }
                                ]
                            },
                            contextInfo: {
                                forwardingScore: 999,
                                isForwarded: true,
                                forwardedNewsletterMessageInfo: {
                                    newsletterJid: NEWSLETTER_JID,
                                    newsletterName: '𝐒𝐇𝐈𝐏𝐒𝐘 𝐌𝐈𝐍𝐈 𝐁𝐎𝐓',
                                    serverMessageId: 125
                                }
                            }
                        }
                    }
                }
            }, { quoted: mquote });
            return;
        }

        // Logique de modification
        let mode = args[0].toLowerCase();

        if (['kick', 'warn', 'delete'].includes(mode)) {
            antilinkData[botNumber][groupJid] = mode;
            fs.writeFileSync(antilinkPath, JSON.stringify(antilinkData, null, 2));
            await DybyTechInc.react("✅");
            DybyTechInc.reply(`✅ *${"ᴀɴᴛɪʟɪɴᴋ ᴀᴄᴛɪᴠᴇ"}*\n📝 *${"ᴍᴏᴅᴇ"}* : ${mode.toUpperCase()}`);
        } else if (mode === 'off') {
            delete antilinkData[botNumber][groupJid];
            fs.writeFileSync(antilinkPath, JSON.stringify(antilinkData, null, 2));
            await DybyTechInc.react("❌");
            DybyTechInc.reply(`❌ *${"ᴀɴᴛɪʟɪɴᴋ ᴅɪsᴀʙᴛʜᴇᴅ"}*`);
        } else {
            DybyTechInc.reply(`*${"ᴍᴏᴅᴇ ɪɴᴠᴀʟɪᴏғ"} : kick, warn, delete ou off*`);
        }

    } catch (e) {
        console.error(e);
        DybyTechInc.reply("ᴇʀʀᴏʀ ᴄᴏɴғɪɢᴜʀɪɴɢ ᴀɴᴛɪʟɪɴᴋ");
    }
}
break;

case 'welcome': {
    const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net'; // Correction ici
    if (!isGroup) return DybyTechInc.reply(`*${"ᴄᴀɴᴅᴛᴇ ᴄᴏᴍᴍᴀɴᴏғ ɴᴇ ᴘᴇᴜᴛ ᴀɴᴅʀᴇ ᴜᴛɪʟɪsᴇᴇ ǫᴜᴇ ɪɴ ᴏғs ɢʀᴏᴜᴘs"}*`);
    if (!isAdmins && !isOwner) return DybyTechInc.reply(`*${"ᴀᴅᴍɪɴs ᴏɴʟʏ ᴀɴᴅ ᴀᴜ ᴏᴡɴᴇʀ"}*`);
    if (!args[0]) return DybyTechInc.reply(`*${"ᴜsᴀɢᴇ"} :* ${prefix}welcome on/off`);

    let status = args[0].toLowerCase();
    if (status === 'on' || status === 'off') {
        sessionsConfig[botId].welcome = status;
        DybyTechInc.reply(`✨ *${"ᴡᴇʟᴄᴏᴍᴇ ᴍᴇssᴀɢᴇ"}* : ${status === 'on' ? '🟢 ON' : '🔴 OFF'}`);
    } else {
        DybyTechInc.reply(`*${"ᴘᴛʜᴇᴀsᴇ ᴄʜᴏɪsɪʀ ᴇɴᴛʀᴇ ᴏɴ ᴀɴᴅ ᴏғғ"}*`);
    }
}
break;

case 'promoteall': {
    try {
        if (!isGroup) return DybyTechInc.reply("ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ ᴡᴏʀᴋs ᴏɴʟʏ ɪɴ ɢʀᴏᴜᴘs");
        if (!isAdmins && !isOwner) return DybyTechInc.reply("ᴏɴʟʏ ɢʀᴏʀᴘ ᴀᴅᴍɪɴs ᴏʀ ʙᴏᴛ ᴏᴡɴᴇʀ ᴄᴀɴ ᴜsᴇ ᴛʜɪs");

        const groupMetadata = await sock.groupMetadata(DybyTechInc.chat);
        const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net';

        // On récupère les membres qui ne sont PAS encore admins
        const membersToPromote = groupMetadata.participants
            .filter(p => p.admin === null)
            .map(p => p.id);

        if (membersToPromote.length === 0) {
            return DybyTechInc.reply("ᴇᴠᴇʀʏᴏɴᴇ ɪs ᴀʟʀᴇᴀᴅʏ ᴀɴ ᴀᴅᴍɪɴ.");
        }

        await DybyTechInc.react("📈");
        await DybyTechInc.reply(`📈 *${"ᴘʀᴏᴍᴏᴛɪɴɢ ᴀʟʟ ᴍᴇᴍʙᴇʀs"}*...\n> *${"ᴄᴏʀɴᴛ"} :* ${membersToPromote.length}`);

        // Promotion massive
        await sock.groupParticipantsUpdate(DybyTechInc.chat, membersToPromote, "promote");

        await sock.sendMessage(DybyTechInc.chat, {
            text: `✅ *${"ᴀʟʟ ᴍᴇᴍʙᴇʀs ᴘʀᴏᴍᴏᴛᴇᴅ sᴜᴄᴄᴇsssғᴜʟʟʏ"}*\n\n👤 *${"ᴀᴄᴛɪᴏɴ ʙʏ"} :* @${m.sender.split('@')[0]}`,
            mentions: [m.sender]
        }, { quoted: mquote });

        await DybyTechInc.react("✅");
    } catch (e) {
        console.error("Promoteall Error:", e);
        DybyTechInc.reply("ғᴀɪᴛʜᴇᴅ ᴛᴏ ᴘʀᴏᴍᴏᴛᴇ ᴀʟʟ ᴍᴇᴍʙᴇʀs.");
    }
}
break;
case 'demoteall': {
    try {
        if (!isGroup) return DybyTechInc.reply("ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ ᴡᴏʀᴋs ᴏɴʟʏ ɪɴ ɢʀᴏᴜᴘs");
        if (!isAdmins && !isOwner) return DybyTechInc.reply("ᴏɴʟʏ ɢʀᴏʀᴘ ᴀᴅᴍɪɴs ᴏʀ ʙᴏᴛ ᴏᴡɴᴇʀ ᴄᴀɴ ᴜsᴇ ᴛʜɪs");

        const groupMetadata = await sock.groupMetadata(DybyTechInc.chat);
        const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net';
        const ownerGroup = groupMetadata.owner || ''; // Le créateur du groupe

        // On récupère les admins, MAIS on exclut :
        // 1. Le bot lui-même (sinon il perd ses pouvoirs)
        // 2. Le créateur du groupe (on ne peut pas le destituer)
        const membersToDemote = groupMetadata.participants
            .filter(p => p.admin !== null && p.id !== botId && p.id !== ownerGroup)
            .map(p => p.id);

        if (membersToDemote.length === 0) {
            return DybyTechInc.reply("ɴᴏ ᴀᴅᴍɪɴs ғᴏʀɴᴅ ᴛᴏ ᴏғᴍᴏᴛᴇ (ᴇxᴄʟᴜᴅɪɴɢ ʙᴏᴛ ᴀɴᴅ ᴏᴡɴᴇʀ).");
        }

        await DybyTechInc.react("📉");
        await DybyTechInc.reply(`📉 *${"ᴏғᴍᴏᴛɪɴɢ ᴀʟʟ ᴀᴅᴍɪɴs"}*...\n> *${"ᴄᴏʀɴᴛ"} :* ${membersToDemote.length}`);

        // Destitution massive
        await sock.groupParticipantsUpdate(DybyTechInc.chat, membersToDemote, "demote");

        await sock.sendMessage(DybyTechInc.chat, {
            text: `✅ *${"ᴀʟʟ ᴀᴅᴍɪɴs ᴏғᴍᴏᴛᴇᴅ sᴜᴄᴄᴇsssғᴜʟʟʏ"}*\n\n⚠️ *${"ɴᴏᴛᴇ"} :* ${"ᴛʜᴇ ɢʀᴏʀᴘ ᴏᴡɴᴇʀ ᴀɴᴅ ʙᴏᴛ ʀᴇᴍᴀɪɴ ᴀᴅᴍɪɴs"}`,
            mentions: [m.sender]
        }, { quoted: mquote });

        await DybyTechInc.react("✅");
    } catch (e) {
        console.error("Demoteall Error:", e);
        DybyTechInc.reply("ғᴀɪᴛʜᴇᴅ ᴛᴏ ᴏғᴍᴏᴛᴇ ᴀʟʟ ᴍᴇᴍʙᴇʀs.");
    }
}
break;



case 'kickall':
case 'removeall':
case 'cleargroup': {
    try {
        if (!isGroup) return DybyTechInc.reply("ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ ᴡᴏʀᴋs ᴏɴʟʏ ɪɴ ɢʀᴏᴜᴘs");
        if (!isAdmins && !isOwner) return DybyTechInc.reply("ᴏɴʟʏ ɢʀᴏʀᴘ ᴀᴅᴍɪɴs ᴏʀ ʙᴏᴛ ᴏᴡɴᴇʀ ᴄᴀɴ ᴜsᴇ ᴛʜɪs");
        
        const groupMetadata = await sock.groupMetadata(DybyTechInc.chat);
        const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net';
        
        // On récupère les membres qui ne sont pas admins et qui ne sont pas le bot
        const membersToRemove = groupMetadata.participants
            .filter(p => p.admin === null && p.id !== botId)
            .map(p => p.id);

        if (membersToRemove.length === 0) {
            return DybyTechInc.reply("ɴᴏ ᴍᴇᴍʙᴇʀs ғᴏʀɴᴅ ᴛᴏ ʀᴇᴍᴏᴠᴇ.");
        }

        await DybyTechInc.react("⚠️");
        
        // Message d'attente simple
        await sock.sendMessage(DybyTechInc.chat, { 
            text: `⚠️ *${"ᴄᴛʜᴇᴀɴɪɴɢ ɢʀᴏʀᴘ"}*...\n> *${"ʀᴇᴍᴏᴠɪɴɢ"} :* ${membersToRemove.length} ${"ᴍᴇᴍʙᴇʀs"}` 
        });

        // Exécution de l'expulsion
        await sock.groupParticipantsUpdate(DybyTechInc.chat, membersToRemove, "remove");

        // Message de succès (Simplifié pour éviter l'erreur TypeError jid)
        const successMsg = `✅ *${"ᴄᴛʜᴇᴀɴ ᴜᴘ sᴜᴄᴄᴇsssғᴜʟ"}*\n\n📄 *${"ᴛᴏᴛᴀʟ ʀᴇᴍᴏᴠᴇᴅ"} :* ${membersToRemove.length}\n👤 *${"ᴇxᴇᴄᴜᴛᴇᴅ ʙʏ"} :* @${m.sender.split('@')[0]}`;

        await sock.sendMessage(DybyTechInc.chat, {
            text: successMsg,
            mentions: [m.sender]
        }, { quoted: mquote });
        
        await DybyTechInc.react("✅");

    } catch (e) {
        console.error("Kickall Error:", e);
        // On n'envoie pas de message d'erreur si l'action a déjà été faite
        if (!e.message.includes("jid.endsWith")) {
            DybyTechInc.reply("ғᴀɪᴛʜᴇᴅ ᴛᴏ ᴘᴇʀғᴏʀᴍ ᴀᴄᴛɪᴏɴ.");
        }
    }
}
break;

case 'readviewonce': 
case 'vv': {
    try {
        if (!m.quoted) return DybyTechInc.reply(`*${"ᴇʀʀᴏʀ"} :* ${"ʀᴇᴘʟʏ ᴛᴏ ᴀ ᴠɪᴇᴡᴏɴᴄᴇ ᴍᴇssᴀɢᴇ"}`);
        
        // On récupère le message cité (en gérant le format viewOnce)
        let q = m.quoted.msg;
        if (!q.viewOnce) return DybyTechInc.reply(`*${"ᴇʀʀᴏʀ"} :* ${"ᴛʜɪs ɪs ɴᴏᴛ ᴀ ᴠɪᴇᴡᴏɴᴄᴇ ᴍᴇssᴀɢᴇ"}`);

        await DybyTechInc.react("🔓");

        // Téléchargement du média via ta fonction smsg.js
        let media = await m.quoted.download();
        let caption = q.caption || '';

        if (/image/.test(m.quoted.type)) {
            await sock.sendMessage(DybyTechInc.chat, { image: media, caption: caption }, { quoted: mquote });
        } else if (/video/.test(m.quoted.type)) {
            await sock.sendMessage(DybyTechInc.chat, { video: media, caption: caption }, { quoted: mquote });
        } else if (/audio/.test(m.quoted.type)) {
            await sock.sendMessage(DybyTechInc.chat, { audio: media, mimetype: 'audio/mp4', ptt: false }, { quoted: mquote });
        }

        await DybyTechInc.react("✅");
    } catch (e) {
        console.error(e);
        DybyTechInc.reply("ғᴀɪᴛʜᴇᴅ ᴛᴏ ᴏᴘᴇɴ ᴠɪᴇᴡᴏɴᴄᴇ ᴍᴇᴅɪᴀ.");
    }
}
break;
case 'vv2':
case 'mvle': {
    try {
        if (!m.quoted) return DybyTechInc.reply(`*${"ᴇʀʀᴏʀ"} :* ${"ʀᴇᴘʟʏ ᴛᴏ ᴀ ᴠɪᴇᴡᴏɴᴄᴇ ᴍᴇssᴀɢᴇ"}`);

        let q = m.quoted.msg;
        if (!q.viewOnce) return DybyTechInc.reply(`*${"ᴇʀʀᴏʀ"} :* ${"ᴛʜɪs ɪs ɴᴏᴛ ᴀ ᴠɪᴇᴡᴏɴᴄᴇ ᴍᴇssᴀɢᴇ"}`);


        let media = await m.quoted.download();
        let caption = q.caption || `*${"sᴀᴠᴇᴅ ғʀᴏᴍ ɢʀᴏʀᴘ"}*`;

        // Envoi à m.sender (celui qui a tapé la commande) en privé
        if (/image/.test(m.quoted.type)) {
            await sock.sendMessage(m.sender, { image: media, caption: caption });
        } else if (/video/.test(m.quoted.type)) {
            await sock.sendMessage(m.sender, { video: media, caption: caption });
        } else if (/audio/.test(m.quoted.type)) {
            await sock.sendMessage(m.sender, { audio: media, mimetype: 'audio/mp4' });
        }

    } catch (e) {
        console.error(e);
    }
}
break;

case 'toonce':
case 'toviewonce': {
    try {
        // Vérifie si on répond à un message (image ou vidéo)
        const q = m.quoted ? m.quoted : m;
        const mime = (q.msg || q).mimetype || '';
        
        if (!/image|video/.test(mime)) return DybyTechInc.reply(`*${"ᴜsᴀɢᴇ"} :* ${"ʀᴇᴘʟʏ ᴛᴏ ᴀɴ ɪᴍᴀɢᴇ ᴏʀ ᴠɪᴏғᴏ"}`);

        await DybyTechInc.react("👁️");

        // Téléchargement du média via ta fonction smsg.js
        const media = await q.download();

        if (/image/.test(mime)) {
            await sock.sendMessage(DybyTechInc.chat, {
                image: media,
                caption: `✅ *${"ᴠɪᴇᴡ ᴏɴᴄᴇ ɪᴍᴀɢᴇ ɢᴇɴᴇʀᴀᴛᴇᴅ"}*`,
                viewOnce: true
            }, { quoted: mquote });
        } else if (/video/.test(mime)) {
            await sock.sendMessage(DybyTechInc.chat, {
                video: media,
                caption: `✅ *${"ᴠɪᴇᴡ ᴏɴᴄᴇ ᴠɪᴏғᴏ ɢᴇɴᴇʀᴀᴛᴇᴅ"}*`,
                viewOnce: true
            }, { quoted: mquote });
        }
        
        await DybyTechInc.react("✅");
    } catch (e) {
        console.error(e);
        DybyTechInc.reply("ғᴀɪᴛʜᴇᴅ ᴛᴏ ɢᴇɴᴇʀᴀᴛᴇ ᴠɪᴇᴡ ᴏɴᴄᴇ ᴍᴇssᴀɢᴇ.");
    }
}
break;
case 'toqr': {
    try {
        const text = args.join(" ");
        if (!text) return DybyTechInc.reply(`*${"ᴜsᴀɢᴇ"} :* ${prefix}toqr <${"ᴛᴇxᴛ/ʟɪɴᴋ"}>`);

        await DybyTechInc.react("🏁");

        const QRCode = require('qrcode');
        
        // Génération du QR Code en Buffer (PNG)
        const qrBuffer = await QRCode.toBuffer(text, {
            scale: 8,
            margin: 2,
            color: {
                dark: '#000000',
                light: '#ffffff'
            }
        });

        const qrMsg = `🏁 *${"ǫʀ ᴄᴏᴏғ ɢᴇɴᴇʀᴀᴛᴏʀ"}*

*📝 ${"ᴄᴏɴᴛᴇɴᴛ"} :* ${text}
*🕷️ ${"ɢᴇɴᴇʀᴀᴛᴇᴅ ʙʏ sʜɪᴘsʏ-xᴅ"}*`;

        await sock.sendMessage(DybyTechInc.chat, {
            image: qrBuffer,
            caption: qrMsg
        }, { quoted: mquote });

        await DybyTechInc.react("✅");
    } catch (e) {
        console.error(e);
        DybyTechInc.reply("ғᴀɪᴛʜᴇᴅ ᴛᴏ ɢᴇɴᴇʀᴀᴛᴇ ǫʀ ᴄᴏᴏғ.");
    }
}
break;

case 'emojimix':
case 'mix': {
    try {
        if (!text.includes('+')) {
            return DybyTechInc.reply(`*${"ᴜsᴀɢᴇ"} :* ${prefix}emojimix 😅+🤔`);
        }

        const [emoji1, emoji2] = text.split('+');
        if (!emoji1 || !emoji2) return DybyTechInc.reply(`*${"ᴇxᴀᴍᴘᴛʜᴇ"} :* ${prefix}emojimix 😅+🤔`);

        await DybyTechInc.react("🪄");

        // API Tenor Emoji Kitchen
        const apiUrl = `https://tenor.googleapis.com/v2/featured?key=AIzaSyAyimkuYQYF_FXVALexPuGQctUWRURdCYQ&contentfilter=high&media_filter=png_transparent&component=proactive&collection=emoji_kitchen_v5&q=${encodeURIComponent(emoji1)}_${encodeURIComponent(emoji2)}`;
        
        const response = await axios.get(apiUrl);
        const result = response.data;

        if (!result.results || result.results.length === 0) {
            return DybyTechInc.reply("sᴏʀʀʏ, ᴛʜᴇsᴇ ᴇᴍᴏᴊɪs ᴄᴀɴɴᴏᴛ ʙᴇ ᴍɪxᴇᴅ.");
        }

        // On récupère l'URL de l'image transparente
        const emojiUrl = result.results[0].media_formats.png_transparent.url;

        // ENVOI DU STICKER (Méthode native Baileys)
        await sock.sendMessage(DybyTechInc.chat, { 
            sticker: { url: emojiUrl },
            // On ajoute les métadonnées pour que le sticker soit personnalisé
            contextInfo: {
                externalAdReply: {
                    title: "𝚂𝙷𝙸𝙿𝚂𝚈 𝙼𝙸𝙽𝙸 𝙱𝙾𝚃 𝙼𝙸𝚇",
                    body: "ᴇᴍᴏᴊɪ ",
                    mediaType: 1,
                    previewType: 0,
                    thumbnailUrl: emojiUrl,
                    renderLargerThumbnail: false
                }
            }
        }, { quoted: mquote });

        await DybyTechInc.react("✅");

    } catch (e) {
        console.error("Emojimix Error:", e);
        DybyTechInc.reply("ғᴀɪᴛʜᴇᴅ ᴛᴏ ᴍɪx ᴇᴍᴏᴊɪs.");
    }
}
break;


case 'img':
case 'imgsearch': {
    try {
        const query = args.join(" ");
        if (!query) return DybyTechInc.reply(`*${"ᴜsᴀɢᴇ"} :* ${prefix}img <${"ǫᴜᴇʀʏ"}>\n\n*${"ᴇxᴀᴍᴘᴛʜᴇ"} :* ${prefix}img spider-man`);

        await DybyTechInc.react("🔍");

        // Appel de l'API
        const response = await axios.get(`https://api.siputzx.my.id/api/s/bimg?query=${encodeURIComponent(query)}`);

        if (!response.data || !response.data.status || !response.data.data.length) {
            return DybyTechInc.reply("ɴᴏ ɪᴍᴀɢᴇs ғᴏʀɴᴅ ғᴏʀ ᴛʜɪs ǫᴜᴇʀʏ.");
        }

        const images = response.data.data;
        // On prend une image au hasard parmi les 10 premières pour varier
        const randomImg = images[Math.floor(Math.random() * Math.min(images.length, 10))];

        const imgMsg = `🔎 *${"ɪᴍᴀɢᴇ sᴇᴀʀᴄʜ"}*

*📍 ${"ǫᴜᴇʀʏ"} :* ${query}
*📸 ${"sᴏʀʀᴄᴇ"} :* Bing Search

> ${"ᴄʟɪᴄᴋ ɴᴇxᴛ ᴛᴏ sᴇᴇ ᴀɴᴏᴛʜᴇʀ ɪᴍᴀɢᴇ"} 🕷️`;

        // 1. On envoie d'abord l'image
        await sock.sendMessage(DybyTechInc.chat, { 
            image: { url: randomImg }, 
            caption: imgMsg 
        }, { quoted: mquote });

        // 2. On envoie le bouton "Suivant" juste en dessous
        await sock.relayMessage(DybyTechInc.chat, {
            viewOnceMessage: {
                message: {
                    interactiveMessage: {
                        header: { hasMediaAttachment: false },
                        body: { text: `*${"ᴍᴏʀᴇ ʀᴇsᴜʟᴛs ғᴏʀ"}* : ${query}` },
                        footer: { text: "ꜱʜɪᴘꜱʏ ᴍɪɴɪ ʙᴏᴛ ᴇɴɢɪɴᴇ" },
                        nativeFlowMessage: {
                            buttons: [{
                                name: "quick_reply",
                                buttonParamsJson: JSON.stringify({
                                    display_text: `⏭️ ${"ɴᴇxᴛ ɪᴍᴀɢᴇ"}`,
                                    id: `${prefix}img ${query}`
                                })
                            }]
                        }
                    }
                }
            }
        }, {});

        await DybyTechInc.react("✅");

    } catch (e) {
        console.error("Image Search Error:", e);
        DybyTechInc.reply("ғᴀɪᴛʜᴇᴅ ᴛᴏ ғᴀɴᴅᴄʜ ɪᴍᴀɢᴇs. ᴀᴘɪ ᴍɪɢʜᴛ ʙᴇ ᴅᴏᴡɴ.");
    }
}
break;


case 'unmute':
case 'open': {
    try {
        if (!isGroup) return DybyTechInc.reply("ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ ᴡᴏʀᴋs ᴏɴʟʏ ɪɴ ɢʀᴏᴜᴘs");
        if (!isAdmins && !isOwner) return DybyTechInc.reply("ᴏɴʟʏ ɢʀᴏʀᴘ ᴀᴅᴍɪɴs ᴏʀ ʙᴏᴛ ᴏᴡɴᴇʀ ᴄᴀɴ ᴏᴘᴇɴ ᴛʜᴇ ɢʀᴏʀᴘ");

        await DybyTechInc.react("🔓");
        await sock.groupSettingUpdate(DybyTechInc.chat, 'not_announcement');

        const openMsg = `🔓 *${"ɢʀᴏʀᴘ ᴏᴘᴇɴᴇᴅ"}*\n\n> ${"ɢʀᴏʀᴘ ɪs ɴᴏᴡ ᴏᴘᴇɴ! ᴀʟʟ ᴍᴇᴍʙᴇʀs ᴄᴀɴ sᴇɴᴅ ᴍᴇssᴀɢᴇs"} 🗣️`;

        await sock.relayMessage(DybyTechInc.chat, {
            viewOnceMessage: {
                message: {
                    interactiveMessage: {
                        header: { title: `*${"sʜɪᴘsʏ ᴍᴅ ᴍᴀɴᴀɢᴇʀ"}*`, hasMediaAttachment: false },
                        body: { text: openMsg },
                        footer: { text: "ꜱʜɪᴘꜱʏ ᴍɪɴɪ ʙᴏᴛ ᴏᴘᴛɪᴍɪᴢᴇᴅ" },
                        nativeFlowMessage: {
                            buttons: [{
                                name: "quick_reply",
                                buttonParamsJson: JSON.stringify({
                                    display_text: `🔒 ${"ᴍᴜᴛᴇ"}`,
                                    id: `${prefix}mute`
                                })
                            }]
                        }
                    }
                }
            }
        }, {});
    } catch (e) {
        console.error(e);
        DybyTechInc.reply("ғᴀɪᴛʜᴇᴅ ᴛᴏ ᴏᴘᴇɴ ɢʀᴏʀᴘ");
    }
}
break;

case 'mute':
case 'close': {
    try {
        if (!isGroup) return DybyTechInc.reply("ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ ᴡᴏʀᴋs ᴏɴʟʏ ɪɴ ɢʀᴏᴜᴘs");
        if (!isAdmins && !isOwner) return DybyTechInc.reply("ᴏɴʟʏ ɢʀᴏʀᴘ ᴀᴅᴍɪɴs ᴏʀ ʙᴏᴛ ᴏᴡɴᴇʀ ᴄᴀɴ ᴄʟᴏsᴇ ᴛʜᴇ ɢʀᴏʀᴘ");

        await DybyTechInc.react("🔒");
        await sock.groupSettingUpdate(DybyTechInc.chat, 'announcement');

        const closeMsg = `🔒 *${"ɢʀᴏʀᴘ ᴄʟᴏsᴇᴅ"}*\n\n> ${"ɢʀᴏʀᴘ ɪs ɴᴏᴡ ᴄʟᴏsᴇᴅ! ᴏɴʟʏ ᴀᴅᴍɪɴs ᴄᴀɴ sᴇɴᴅ ᴍᴇssᴀɢᴇs"} 🤫`;

        await sock.relayMessage(DybyTechInc.chat, {
            viewOnceMessage: {
                message: {
                    interactiveMessage: {
                        header: { title: `*${"sʜɪᴘsʏ ᴍᴅ ᴍᴀɴᴀɢᴇʀ"}*`, hasMediaAttachment: false },
                        body: { text: closeMsg },
                        footer: { text: "ꜱʜɪᴘꜱʏ ᴍɪɴɪ ʙᴏᴛ ᴏᴘᴛɪᴍɪᴢᴇᴅ" },
                        nativeFlowMessage: {
                            buttons: [{
                                name: "quick_reply",
                                buttonParamsJson: JSON.stringify({
                                    display_text: `🔓 ${"ᴜɴᴍᴜᴛᴇ"}`,
                                    id: `${prefix}unmute`
                                })
                            }]
                        }
                    }
                }
            }
        }, {});
    } catch (e) {
        console.error(e);
        DybyTechInc.reply("ғᴀɪᴛʜᴇᴅ ᴛᴏ ᴄʟᴏsᴇ ɢʀᴏʀᴘ");
    }
}
break;


//getcase
case 'allcase': {
    try {
        if (!isDev) return DybyTechInc.reply(toSmallCaps("fuck you" + senderNumber + " you are not my dev"));
        
        const fs = require('fs');
        const scriptContent = fs.readFileSync('./spider.js', 'utf8');
        
        // Regex pour trouver tous les noms de cases
        const caseRegex = /case\s+['"]([^'"]+)['"]/g;
        let cases = [];
        let match;
        
        while ((match = caseRegex.exec(scriptContent)) !== null) {
            cases.push(match[1]);
        }
        
        if (cases.length === 0) return DybyTechInc.reply("no case found.");

        let menu = `🕷️ *${"sʜɪᴘsʏ ᴍᴅ ᴄᴀsᴇs ʟɪsᴛ"}* 🕷️\n\n`;
        cases.forEach((c, i) => {
            menu += `*${i + 1}.* ${c}\n`;
        });
        
        menu += `\n> *${"ᴛᴏᴛᴀʟ ᴄᴀsᴇs"} :* ${cases.length}`;
        
        DybyTechInc.reply(menu);
    } catch (e) {
        console.error(e);
        DybyTechInc.reply("Error lors de la lecture des cases.");
    }
}
break;
//all case

case 'getcase': {
    try {
        if (!isOwner) return DybyTechInc.reply("ᴏᴡɴᴇʀ ᴏɴʟʏ ʙʀᴏ");
        if (!args[0]) return DybyTechInc.reply(`*${"ᴜsᴀɢᴇ"} :* ${prefix}getcase [nom_de_la_case]`);

        const fs = require('fs');
        const fileName = './spider.js'; 
        
        if (!fs.existsSync(fileName)) return DybyTechInc.reply("❌ Fichier spider.js not found.");
        
        const scriptContent = fs.readFileSync(fileName, 'utf8');

        const regex = new RegExp(`case\\s+['"]${args[0]}['"]:[\\s\\S]*?break;`, 'i');
        const match = scriptContent.match(regex);

        if (!match) return DybyTechInc.reply(`❌ *${"ᴇʀʀᴏʀ"}* : Case *"${args[0]}"* not found.`);

        const extractedCode = match[0];

        // Construction du message (Correction : suppression de readFileSync pour l'image)
        const getMsg = `📦 *${"sʜɪᴘsʏ ᴍᴅ ᴇxᴛʀᴀᴄᴛᴏʀ"}*

*📍 ${"ᴛᴀʀɢᴀɴᴅ"} :* \`${args[0]}\`
*📏 ${"sɪᴢᴇ"} :* ${extractedCode.length} ${"ᴄʜᴀʀs"}

> ${"ᴄʟɪᴄᴋ ᴛʜᴇ ʙᴜᴛᴛᴏɴ ʙᴇʟᴏᴡ ᴛᴏ ᴄᴏᴘʏ ᴛʜᴇ sᴏʀʀᴄᴇ ᴄᴏᴏғ"} 🕷️`;

        await sock.relayMessage(DybyTechInc.chat, {
            viewOnceMessage: {
                message: {
                    interactiveMessage: {
                        header: { 
                            title: `*${"sᴏʀʀᴄᴇ ᴄᴏᴏғ ғᴀɴᴅᴄʜᴇʀ"}*`,
                            hasMediaAttachment: false 
                        },
                        body: { text: getMsg },
                        footer: { text: "ꜱʜɪᴘꜱʏ ᴍɪɴɪ ʙᴏᴛ ᴏᴘᴛɪᴍɪᴢᴇᴅ ʙʏ ᴅᴇᴠ ᴅʏʙʏ" },
                        nativeFlowMessage: {
                            buttons: [
                                {
                                    name: "cta_copy",
                                    buttonParamsJson: JSON.stringify({
                                        display_text: "📋 COPY CODE",
                                        id: "copy_code",
                                        copy_code: extractedCode
                                    })
                                }
                            ]
                        },
                        contextInfo: {
                            forwardingScore: 999,
                            isForwarded: true,
                            externalAdReply: {
                                title: '𝐒𝐇𝐈𝐏𝐒𝐘 𝐌𝐈𝐍𝐈 𝐁𝐎𝐓 𝑪𝑶𝑫𝑬',
                                body: 'System Source Extractor',
                                // Image supprimée pour éviter l'erreur ENOENT
                                thumbnail: null, 
                                sourceUrl: 'https://whatsapp.com/channel/0029Vaom7p690x2zS8Apxu0S'
                            }
                        }
                    }
                }
            }
        }, { quoted: mquote });

        await DybyTechInc.react("📥");

    } catch (e) {
        console.error("Getcase Error:", e);
        DybyTechInc.reply("❌ Error while extracting the case. Check Termux logs.");
    }
}
break;


//getpp
case 'getpp': {
    try {
	if (!isOwner) {
		await DybyTechInc.react("❌");
	return DybyTechInc.reply("ʏᴏʀ ᴀʀᴇ ɴᴏᴛ ᴍʏ ᴏᴡɴᴇʀ ʙʀᴏ");
	}
	await DybyTechInc.react("📸");
        let user;
        if (DybyTechInc.quoted) {
            // Si on répond à un message (Groupe ou Privé)
            user = DybyTechInc.quoted.sender;
        } else if (!isGroup) {
            // Si on est en privé et qu'on ne répond à personne, on prend la photo de l'interlocuteur
            user = DybyTechInc.chat;
        } else if (DybyTechInc.mentionedJid && DybyTechInc.mentionedJid[0]) {
            // Si on tag quelqu'un dans un groupe
            user = DybyTechInc.mentionedJid[0];
        } else {
            // Par défaut, sa propre photo
            user = DybyTechInc.sender;
        }

        let ppUrl;
        try {
            // Récupération de l'image HD
            ppUrl = await sock.profilePictureUrl(user, 'image');
        } catch (e) {
            return DybyTechInc.reply(`❌ *${"ᴇʀʀᴏʀ"} :* ${"ᴘʀᴏғɪᴛʜᴇ ᴘɪᴄᴛᴜʀᴇ ɪs ᴘʀɪᴠᴀᴛᴇ ᴏʀ ɴᴏᴛ ғᴏʀɴᴅ"}`);
        }

        const ppMsg = `🖼️ *${"ᴘʀᴏғɪᴛʜᴇ ᴘɪᴄᴛᴜʀᴇ ʀᴀɴᴅʀɪᴇᴠᴇᴅ"}*
        
*👤 ${"ᴛᴀʀɢᴀɴᴅ"} :* @${user.split('@')[0]}
> *${"ᴏᴘᴛɪᴍɪᴢᴇᴅ ʙʏ ᴅᴇᴠ ᴅʏʙʏ"}*`;

        await sock.sendMessage(DybyTechInc.chat, {
            image: { url: ppUrl },
            caption: ppMsg,
            mentions: [user],
            contextInfo: {
                forwardingScore: 999,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: NEWSLETTER_JID,
                    newsletterName: '𝐒𝐇𝐈𝐏𝐒𝐘 𝐌𝐈𝐍𝐈 𝐁𝐎𝐓',
                    serverMessageId: 125
                }
            }
        }, { quoted: mquote });

        await DybyTechInc.react("✅");

    } catch (e) {
        console.error(e);
        DybyTechInc.reply("ғᴀɪᴛʜᴇᴅ ᴛᴏ ɢᴀɴᴅ ᴘʀᴏғɪᴛʜᴇ ᴘɪᴄᴛᴜʀᴇ");
    }
}

break;

//pair 
case 'pair':
case 'getbot':
case 'botclone': {
    try {
        await DybyTechInc.react("📲");
        
        // Utilisation de axios (plus stable que fetch dans certains environnements Termux)
        const axios = require('axios');

        // Récupération du numéro (on enlève tout ce qui n'est pas un chiffre)
        let phoneNumber = text.replace(/[^0-9]/g, '');

        if (!phoneNumber) {
            return DybyTechInc.reply(`📌 *${"ᴜsᴀɢᴇ"} :* ${prefix}pair 509xxxxxxx`);
        }

        await DybyTechInc.reply(`⏳ *${"ʀᴇǫᴜᴇsᴛɪɴɢ ᴘᴀɪʀɪɴɢ ᴄᴏᴏғ ғᴏʀ"}* +${phoneNumber}...`);

        // L'URL pointe vers ton API Express (localhost sur le port 8000 d'après ton code api.js)
        const apiUrl = `https://spiderxd.vezxa.com/code?number=${phoneNumber}`;

        const response = await axios.get(apiUrl);
        const result = response.data;

        if (result && result.code) {
            // Message stylisé Shipsy Mini Bot
            const pairMsg = `✅ *${"sʜɪᴘsʏ ᴍᴅ ᴘᴀɪʀɪɴɢ"}*

*🔑 ${"ʏᴏʀʀ ᴄᴏᴏғ ɪs"} :*
\`\`\`${result.code}\`\`\`

> ${"ᴄᴏᴘʏ ᴛʜᴇ ᴄᴏᴏғ ᴀʙᴏᴠᴇ ᴀɴᴅ ᴘᴀsᴛᴇ ɪᴛ ɪɴᴛᴏ ʏᴏʀʀ ᴡʜᴀᴛsᴀᴘᴘ ɴᴏᴛɪғɪᴄᴀᴛɪᴏɴ ᴛᴏ ʟɪɴᴋ ᴛʜᴇ ʙᴏᴛ"} 🕷️`;

            await sock.sendMessage(DybyTechInc.chat, { 
                text: pairMsg 
            }, { quoted: mquote });

            // Envoi du code seul pour faciliter le copier-coller
            setTimeout(async () => {
                await sock.sendMessage(DybyTechInc.chat, { text: result.code }, { quoted: DybyTechInc });
            }, 2000);

        } else {
            DybyTechInc.reply("ғᴀɪᴛʜᴇᴅ ᴛᴏ ʀᴀɴᴅʀɪᴇᴠᴇ ᴄᴏᴏғ. ᴍᴀᴋᴇ ᴏɴᴇ ʏᴏʀʀ ᴀᴘɪ sᴇʀᴠᴇʀ ɪs ʀᴜɴɴɪɴɢ ᴏɴ ᴘᴏʀᴛ 8000.");
        }

    } catch (e) {
        console.error("Pair Error:", e);
        DybyTechInc.reply(`❌ *${"ᴇʀʀᴏʀ"} :* ${"ᴄᴏʀʟᴅ ɴᴏᴛ ᴄᴏɴɴᴇᴄᴛ ᴛᴏ ᴘᴀɪʀɪɴɢ sᴇʀᴠᴇʀ"}`);
    }
}
break;


//group case

case 'add': {
    try {
        await DybyTechInc.react("➕");
	if (!isGroup) return DybyTechInc.reply("ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ ᴡᴏʀᴋs ᴏɴʟʏ ɪɴ ɢʀᴏᴜᴘs");
        if (!isAdmins && !isOwner) return DybyTechInc.reply("ᴏɴʟʏ ɢʀᴏʀᴘ ᴀᴅᴍɪɴs ᴏʀ ʙᴏᴛ ᴏᴡɴᴇʀ ᴄᴀɴ ᴀᴅᴅ ᴍᴇᴍʙᴇʀs");
        if (!text) return DybyTechInc.reply(`📌 *${"ᴜsᴀɢᴇ"} :* ${prefix}add 509xxxxxxx`);

        const numberToAdd = text.replace(/[^0-9]/g, '') + '@s.whatsapp.net';
        
        await sock.groupParticipantsUpdate(DybyTechInc.chat, [numberToAdd], 'add');
        
        const addMsg = `✅ *${"ᴍᴇᴍʙᴇʀ ᴀᴅᴏғᴅᴅ"}*

> ${"sᴜᴄᴄᴇsssғᴜʟʟʏ ᴀᴅᴏғᴅᴅ"} @${numberToAdd.split('@')[0]} ${"ᴛᴏ ᴛʜᴇ ɢʀᴏʀᴘ"} 🎉`;

        await sock.sendMessage(DybyTechInc.chat, { 
            text: addMsg, 
            mentions: [numberToAdd] 
        }, { quoted: mquote });

    } catch (e) {
        console.error(e);
        DybyTechInc.reply("ғᴀɪᴛʜᴇᴅ ᴛᴏ ᴀᴅᴅ ᴍᴇᴍʙᴇʀ. ᴄʜᴇᴄᴋ ɪғ ᴛʜᴇ ɴᴜᴍʙᴇʀ ɪs ᴠᴀʟɪᴅ ᴏʀ ɪғ ᴛʜᴇ ɢʀᴏʀᴘ ɪs ғᴜʟʟ.");
    }
}
break;

case 'kick': {
    try {
        await DybyTechInc.react("🦶");

        if (!isGroup) return DybyTechInc.reply("ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ ᴡᴏʀᴋs ᴏɴʟʏ ɪɴ ɢʀᴏᴜᴘs");
        if (!isAdmins && !isOwner) return DybyTechInc.reply("ᴏɴʟʏ ɢʀᴏʀᴘ ᴀᴅᴍɪɴs ᴏʀ ʙᴏᴛ ᴏᴡɴᴇʀ ᴄᴀɴ ᴋɪᴄᴋᴇᴅ ᴍᴇᴍʙᴇʀs");

        // Récupère le numéro (soit par tag, soit par mention, soit par argument)
        const user = DybyTechInc.quoted ? DybyTechInc.quoted.sender : (DybyTechInc.mentionedJid && DybyTechInc.mentionedJid[0]) ? DybyTechInc.mentionedJid[0] : text ? text.replace(/[^0-9]/g, '') + '@s.whatsapp.net' : null;

        if (!user) return DybyTechInc.reply("ᴘᴛʜᴇᴀsᴇ ᴛᴀɢ ᴏʀ ʀᴇᴘʟʏ ᴛᴏ sᴏᴍᴇᴏɴᴇ ᴛᴏ ᴋɪᴄᴋᴇᴅ");

        await sock.groupParticipantsUpdate(DybyTechInc.chat, [user], 'remove');
        
        const kickMsg = `🗑️ *${"ᴍᴇᴍʙᴇʀ ᴋɪᴄᴋᴇᴏғᴅ"}*

> @${user.split('@')[0]} ${"ʜᴀs ʙᴇᴇɴ ʀᴇᴍᴏᴠᴇᴅ ғʀᴏᴍ ᴛʜᴇ ɢʀᴏʀᴘ"} 🚪`;

        await sock.sendMessage(DybyTechInc.chat, { 
            text: kickMsg, 
            mentions: [user] 
        }, { quoted: mquote });

    } catch (e) {
        console.error(e);
        DybyTechInc.reply("ғᴀɪᴛʜᴇᴅ ᴛᴏ ᴋɪᴄᴋᴇᴅ ᴍᴇᴍʙᴇʀ. ᴍᴀʏʙᴇ ᴛʜᴇʏ ᴀʀᴇ ᴀʟʀᴇᴀᴅʏ ɢᴏɴᴇ ᴏʀ ᴀɴ ᴀᴅᴍɪɴ?");
    }
}
break;

case 'promote': {
    try {
        await DybyTechInc.react("👑");

        if (!isGroup) return DybyTechInc.reply("ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ ᴡᴏʀᴋs ᴏɴʟʏ ɪɴ ɢʀᴏᴜᴘs");
        if (!isAdmins && !isOwner) return DybyTechInc.reply("ᴏɴʟʏ ɢʀᴏʀᴘ ᴀᴅᴍɪɴs ᴏʀ ʙᴏᴛ ᴏᴡɴᴇʀ ᴄᴀɴ ᴘʀᴏᴍᴏᴛᴇ ᴍᴇᴍʙᴇʀs");

        const user = DybyTechInc.quoted ? DybyTechInc.quoted.sender : (DybyTechInc.mentionedJid && DybyTechInc.mentionedJid[0]) ? DybyTechInc.mentionedJid[0] : text ? text.replace(/[^0-9]/g, '') + '@s.whatsapp.net' : null;

        if (!user) return DybyTechInc.reply("ᴘᴛʜᴇᴀsᴇ ᴛᴀɢ ᴏʀ ʀᴇᴘʟʏ ᴛᴏ sᴏᴍᴇᴏɴᴇ ᴛᴏ ᴘʀᴏᴍᴏᴛᴇ");

        await sock.groupParticipantsUpdate(DybyTechInc.chat, [user], 'promote');
        
        const proMsg = `⬆️ *${"ᴍᴇᴍʙᴇʀ ᴘʀᴏᴍᴏᴛᴇᴅ"}*

> @${user.split('@')[0]} ${"ɪs ɴᴏᴡ ᴀɴ ᴀᴅᴍɪɴ"} 🌟`;

        await sock.sendMessage(DybyTechInc.chat, { 
            text: proMsg, 
            mentions: [user] 
        }, { quoted: mquote });

    } catch (e) {
        console.error(e);
        DybyTechInc.reply("ғᴀɪᴛʜᴇᴅ ᴛᴏ ᴘʀᴏᴍᴏᴛᴇ ᴍᴇᴍʙᴇʀ");
    }
}
break;

case 'demote': {
    try {
        await DybyTechInc.react("📉");

        if (!isGroup) return DybyTechInc.reply("ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ ᴡᴏʀᴋs ᴏɴʟʏ ɪɴ ɢʀᴏᴜᴘs");
        if (!isAdmins && !isOwner) return DybyTechInc.reply("ᴏɴʟʏ ɢʀᴏʀᴘ ᴀᴅᴍɪɴs ᴏʀ ʙᴏᴛ ᴏᴡɴᴇʀ ᴄᴀɴ ᴏғᴍᴏᴛᴇ ᴍᴇᴍʙᴇʀs");

        const user = DybyTechInc.quoted ? DybyTechInc.quoted.sender : (DybyTechInc.mentionedJid && DybyTechInc.mentionedJid[0]) ? DybyTechInc.mentionedJid[0] : text ? text.replace(/[^0-9]/g, '') + '@s.whatsapp.net' : null;

        if (!user) return DybyTechInc.reply("ᴘᴛʜᴇᴀsᴇ ᴛᴀɢ ᴏʀ ʀᴇᴘʟʏ ᴛᴏ sᴏᴍᴇᴏɴᴇ ᴛᴏ ᴏғᴍᴏᴛᴇ");

        await sock.groupParticipantsUpdate(DybyTechInc.chat, [user], 'demote');
        
        const deMsg = `⬇️ *${"ᴀᴅᴍɪɴ ᴏғᴍᴏᴛᴇᴅ"}*

> @${user.split('@')[0]} ${"ʜᴀs ʙᴇᴇɴ ᴏғᴍᴏᴛᴇᴅ ᴛᴏ ᴍᴇᴍʙᴇʀ"} 📉`;

        await sock.sendMessage(DybyTechInc.chat, { 
            text: deMsg, 
            mentions: [user] 
        }, { quoted: mquote });

    } catch (e) {
        console.error(e);
        DybyTechInc.reply("ғᴀɪᴛʜᴇᴅ ᴛᴏ ᴏғᴍᴏᴛᴇ ᴍᴇᴍʙᴇʀ");
    }
}
break;


// spider ai



// --  remini
case 'remini':
case 'enhance':
case 'hd':
case 'upscale': {
    try {
        await DybyTechInc.react("🪄");

        // Vérification si c'est une image (directe ou citée)
        const quotedMsg = DybyTechInc.quoted ? DybyTechInc.quoted : DybyTechInc;
        const mimeType = (quotedMsg.msg || quotedMsg).mimetype || '';

        if (!mimeType || !mimeType.startsWith('image/')) {
            return DybyTechInc.reply(`📸 *${"ᴘᴛʜᴇᴀsᴇ ʀᴇᴘʟʏ ᴛᴏ ᴀɴ ɪᴍᴀɢᴇ ᴛᴏ ᴇɴʜᴀɴᴄᴇ ɪᴛ"}*`);
        }

        await DybyTechInc.reply(`🔄 *${"ᴇɴʜᴀɴᴄɪɴɢ ɪᴍᴀɢᴇ ǫᴜᴀʟɪᴛʏ... ᴘᴛʜᴇᴀsᴇ ᴡᴀɪᴛ"}* ⏳`);

        // Téléchargement du média
        const mediaBuffer = await quotedMsg.download();
        if (!mediaBuffer) return DybyTechInc.reply("ғᴀɪᴛʜᴇᴅ ᴛᴏ ᴅᴏᴡɴʟᴏᴀᴅ ɪᴍᴀɢᴇ");

        // Sauvegarde temporaire pour l'upload
        const inputPath = path.join(os.tmpdir(), `remini_${Date.now()}.jpg`);
        fs.writeFileSync(inputPath, mediaBuffer);

        // --- ÉTAPE 1 : UPLOAD VERS CATBOX ---
        const form = new FormData();
        form.append('fileToUpload', fs.createReadStream(inputPath));
        form.append('reqtype', 'fileupload');

        const catboxResponse = await axios.post("https://catbox.moe/user/api.php", form, {
            headers: form.getHeaders(),
            maxBodyLength: Infinity
        });

        const imageUrl = catboxResponse.data;
        fs.unlinkSync(inputPath); // Nettoyage local

        if (!imageUrl || !imageUrl.startsWith("http")) {
            return DybyTechInc.reply("ғᴀɪᴛʜᴇᴅ ᴛᴏ ᴜᴘʟᴏᴀᴅ ᴛᴏ sᴇʀᴠᴇʀ");
        }

        // --- ÉTAPE 2 : APPEL API UPSCALE ---
        // Utilisation de l'API de ton code original
        const upscaleUrl = `https://www.veloria.my.id/imagecreator/upscale?url=${encodeURIComponent(imageUrl)}`;
        
        const response = await axios.get(upscaleUrl, { 
            responseType: "arraybuffer",
            timeout: 60000 
        });

        if (!response.data || response.data.length < 500) {
            return DybyTechInc.reply("ᴀᴘɪ ᴇʀʀᴏʀ: ɪɴᴠᴀʟɪᴅ ɪᴍᴀɢᴇ ᴅᴀᴛᴀ");
        }

        // --- ÉTAPE 3 : ENVOI DU RÉSULTAT ---
        const finalMsg = `✅ *${"ɪᴍᴀɢᴇ ᴇɴʜᴀɴᴄᴇᴅ sᴜᴄᴄᴇsssғᴜʟʟʏ"}*
        
> *${"ᴏᴘᴛɪᴍɪᴢᴇᴅ ʙʏ ᴅᴇᴠ ᴅʏʙʏ"}* 🕷️`;

        await sock.sendMessage(DybyTechInc.chat, {
            image: response.data,
            caption: finalMsg,
            contextInfo: {
                externalAdReply: {
                    title: "sʜɪᴘsʏ ᴍᴅ ʜᴅ sʏsᴛᴇᴍ",
                    body: "ǫᴜᴀʟɪᴛʏ ɪᴍᴘʀᴏᴠᴇᴅ",
                    mediaType: 1,
                    thumbnail: response.data,
                    sourceUrl: "https://whatsapp.com/channel/0029Vb7EJmL002SztJBkz11T",
                    renderLargerThumbnail: false
                }
            }
        }, { quoted: mquote });

        await DybyTechInc.react("✅");

    } catch (e) {
        console.error("Remini Error:", e);
        DybyTechInc.reply(`❌ *${"ᴇʀʀᴏʀ"} :* ${e.message}`);
    }
}
break;
                                


case 'cid':
case 'newsletter': {
    try {
        await DybyTechInc.react("🔍");

        if (!text) return DybyTechInc.reply(`*${"ᴘᴛʜᴇᴀsᴇ ᴘʀᴏᴠɪᴏғ ᴀ ᴠᴀʟɪᴅ ᴄʜᴀɴɴᴇʟ ʟɪɴᴋ"}*`);
        if (!text.includes("https://whatsapp.com/channel/")) return DybyTechInc.reply(`*${"ɪɴᴠᴀʟɪᴅ ᴡʜᴀᴛsᴀᴘᴘ ᴄʜᴀɴɴᴇʟ ʟɪɴᴋ"}*`);

        // Extraction du code
        let inviteCode = text.split('https://whatsapp.com/channel/')[1];
        
        // Récupération des données
        let res = await sock.newsletterMetadata("invite", inviteCode);

        // Design du message
        const resultMsg = `🚀 *${"ᴄʜᴀɴɴᴇʟ ғᴏʀɴᴅ"}*

╭-----------------------------
┆✞ ${"ᴄʜᴀɴɴᴇʟ ᴏғᴛᴀɪʟs"}*
┆✞ ◈ ${"ɴᴀᴍᴇ"} : ${res.name}*
┆✞ ◈ ${"ғᴏʟʟᴏᴡᴇʀs"} : ${res.subscribers}*
┆✞ ◈ ${"sᴛᴀᴛᴜs"} : ${toSmallCaps(res.state)}*
┆✞ ◈ ${"ᴠᴇʀɪғɪᴇᴅ"} : ${res.verification === "VERIFIED" ? "✅" : "❌"}*
╰-----------------------------

*${"ᴄʜᴀɴɴᴇʟ ɪᴅ"} :*
\`\`\`${res.id}\`\`\`

`;

        // Envoi avec relayMessage pour supporter le bouton de copie
        await sock.relayMessage(DybyTechInc.chat, {
            viewOnceMessage: {
                message: {
                    interactiveMessage: {
                        header: {
                            title: `*${"sʜɪᴘsʏ ᴍᴅ ᴀssɪsᴛᴀɴᴛ"}*`,
                            hasMediaAttachment: false
                        },
                        body: { text: resultMsg },
                        footer: { text: "> © 𝙿𝙾𝚆𝙴𝚁𝙴𝙳 𝙱𝚈 𝙳𝙴𝚅 𝙳𝚈𝙱𝚈" },
                        nativeFlowMessage: {
                            buttons: [
                                {
                                    name: "cta_copy",
                                    buttonParamsJson: JSON.stringify({
                                        display_text: "ᴄᴏᴘʏ ᴄʜᴀɴɴᴇʟ ɪᴅ",
                                        id: "copy_id",
                                        copy_code: res.id
                                    })
                                }
                            ]
                        },
                        contextInfo: {
                            forwardingScore: 999,
                            isForwarded: true,
                            forwardedNewsletterMessageInfo: {
                                newsletterJid: NEWSLETTER_JID,
                                newsletterName: '𝐒𝐇𝐈𝐏𝐒𝐘 𝐌𝐈𝐍𝐈 𝐁𝐎𝐓',
                                serverMessageId: 125
                            },
                            externalAdReply: {
                                title: "ɴᴇᴡsᴛʜᴀɴᴅᴛᴇʀ ᴜᴘʟᴏᴀᴏғʀ sʏsᴛᴇᴍ",
                                body: `ɴᴀᴍᴇ : ${res.name}`,
                                mediaType: 1,
                                sourceUrl: text,
                                thumbnail: fs.readFileSync("./menu.jpg"), // Utilise ton menu.jpg pour l'aperçu
                                renderLargerThumbnail: false
                            }
                        }
                    }
                }
            }
        }, { quoted: mquote });

    } catch (e) {
        console.error(e);
        DybyTechInc.reply(`❌ *${"ᴇʀʀᴏʀ"} :* ${"ᴄʜᴀɴɴᴇʟ ɪɴғᴏ ɴᴏᴛ ғᴏʀɴᴅ"}`);
    }
}
break;


		
case 'post':
case 'poststatus': {
  if (!isAdmins && !isOwner) return DybyTechInc.reply('ᴀᴅᴍɪɴs ᴏɴʟʏ');
  if (!isGroup) return DybyTechInc.reply('ɢʀᴏᴜᴘs ᴏɴʟʏ');

  const caption = args.slice(1).join(' ').trim();

  // Helper: groupStatus using generateWAMessageContent + relayMessage
  const groupStatus = async (jid, statusContent) => {
    const crypto = require('crypto');
    const { generateWAMessageContent, generateWAMessageFromContent } = require('baileys');
    const inside = await generateWAMessageContent(statusContent, {
      upload: sock.waUploadToServer
    });
    const messageSecret = crypto.randomBytes(32);
    const msg = generateWAMessageFromContent(
      jid,
      {
        messageContextInfo: { messageSecret },
        groupStatusMessageV2: {
          message: { ...inside, messageContextInfo: { messageSecret } }
        }
      },
      {}
    );
    await sock.relayMessage(jid, msg.message, { messageId: msg.key.id });
  };

  // Detect media source
  const srcMsg   = m.quoted || (m.mtype !== 'conversation' && m.mtype !== 'extendedTextMessage' ? m : null);
  const isImage   = srcMsg?.mtype === 'imageMessage';
  const isVideo   = srcMsg?.mtype === 'videoMessage';
  const isAudio   = srcMsg?.mtype === 'audioMessage';
  const isSticker = srcMsg?.mtype === 'stickerMessage';
  const isDoc     = srcMsg?.mtype === 'documentMessage';
  const hasMedia  = isImage || isVideo || isAudio || isSticker || isDoc;

  if (!hasMedia && !caption) return DybyTechInc.reply(
`╭-----------------------------
┆✞ 📤 ᴘᴏsᴛ sᴛᴀᴛᴜs
┆✞ ᴜsᴀɢᴇ: ${prefix}post [caption]
┆✞ ʀᴇᴘʟʏ ᴛᴏ ᴀɴ ɪᴍᴀɢᴇ/ᴠɪᴅᴇᴏ/ᴀᴜᴅɪᴏ
┆✞ ᴏʀ sᴇɴᴅ ᴍᴇᴅɪᴀ ᴡɪᴛʜ ᴛʜɪs ᴄᴍᴅ
╰-----------------------------`);

  const waitMsg = await sock.sendMessage(m.chat, { text: '⏳ *ᴘᴜʙʟɪsʜɪɴɢ ɢʀᴏᴜᴘ sᴛᴀᴛᴜs...*' });

  try {
    let payload = {};

    if (hasMedia) {
      const { downloadContentFromMessage } = require('baileys');
      const mediaTypeMap = {
        imageMessage:    'image',
        videoMessage:    'video',
        audioMessage:    'audio',
        stickerMessage:  'sticker',
        documentMessage: 'document',
      };
      const msgContent = srcMsg.message || srcMsg;
      const mediaKey   = Object.keys(mediaTypeMap).find(k => msgContent[k]);
      const mediaType  = mediaTypeMap[mediaKey];
      if (!mediaKey) throw new Error('ᴍᴇᴅɪᴀ ᴛʏᴘᴇ ɴᴏᴛ sᴜᴘᴘᴏʀᴛᴇᴅ');

      const stream = await downloadContentFromMessage(msgContent[mediaKey], mediaType);
      const chunks = [];
      for await (const chunk of stream) chunks.push(chunk);
      const buffer = Buffer.concat(chunks);

      if (isImage)        payload = { image: buffer, caption };
      else if (isVideo)   payload = { video: buffer, caption };
      else if (isAudio)   payload = { audio: buffer, mimetype: msgContent.audioMessage?.mimetype || 'audio/mp4', ptt: msgContent.audioMessage?.ptt || false };
      else if (isSticker) payload = { sticker: buffer };
      else if (isDoc)     payload = { document: buffer, fileName: msgContent.documentMessage?.fileName || 'Document', mimetype: msgContent.documentMessage?.mimetype || 'application/octet-stream' };
    } else {
      payload = { text: caption };
    }

    await groupStatus(m.chat, payload);

    await sock.sendMessage(m.chat, {
      text: `✅ *sᴛᴀᴛᴜs ᴘᴏsᴛᴇᴅ sᴜᴄᴄᴇssғᴜʟʟʏ!*
┆✞ ᴛʏᴘᴇ: ${isImage ? 'ɪᴍᴀɢᴇ' : isVideo ? 'ᴠɪᴅᴇᴏ' : isAudio ? 'ᴀᴜᴅɪᴏ' : isSticker ? 'sᴛɪᴄᴋᴇʀ' : isDoc ? 'ᴅᴏᴄᴜᴍᴇɴᴛ' : 'ᴛᴇxᴛ'}${caption ? '\n┆✞ ᴄᴀᴘᴛɪᴏɴ: ' + caption : ''}`,
      edit: waitMsg.key
    });
  } catch (err) {
    console.error('[POST STATUS ERROR]:', err);
    await sock.sendMessage(m.chat, {
      text: `❌ *ᴇʀʀᴏʀ:* ${err.message || 'ғᴀɪʟᴇᴅ ᴛᴏ ᴘᴜʙʟɪsʜ sᴛᴀᴛᴜs'}`,
      edit: waitMsg.key
    });
  }
}
break;

case 'broadcast':
case 'bc': {
    if (!isOwner) return reply('ᴏᴡɴᴇʀ ᴏɴʟʏ');
    if (!text && !(m.quoted && m.quoted.mtype === 'imageMessage'))
        return reply(`ʀᴇᴘʟʏ ᴛᴏ ᴀɴ ɪᴍᴀɢᴇ ᴏʀ ᴛʏᴘᴇ:\n${prefix + command} <ᴛᴇxᴛ>`);

    const groups = Object.keys(await sock.groupFetchAllParticipating());
    reply(`ʙʀᴏᴀᴅᴄᴀsᴛɪɴɢ ᴛᴏ ${groups.length} ɢʀᴏᴜᴘs...`);

    const contextInfo = {
        forwardingScore: 999,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
            newsletterJid: NEWSLETTER_JID,
            newsletterName: "𝐒𝐇𝐈𝐏𝐒𝐘 𝐔𝐏𝐃𝐀𝐓𝐄",
            serverMessageId: -1
        }
    };

    const bcText = `╭─〔 ʙʀᴏᴀᴅᴄᴀsᴛ ʙʏ ᴏᴡɴᴇʀ 〕\n│ ${text.split('\n').join('\n│ ')}\n╰─⸻⸻⸻⸻`;

    for (let id of groups) {
        await new Promise(r => setTimeout(r, 1500));
        try {
            if (m.quoted && m.quoted.mtype === 'imageMessage') {
                const media = await m.quoted.download();
                await sock.sendMessage(id, { image: media, caption: bcText, contextInfo });
            } else {
                await sock.sendMessage(id, { text: bcText, contextInfo });
            }
        } catch (err) {
            console.error(`ʙʀᴏᴀᴅᴄᴀsᴛ ᴛᴏ ${id} ғᴀɪʟᴇᴅ:`, err);
        }
    }
    reply('ʙʀᴏᴀᴅᴄᴀsᴛ ғɪɴɪsʜᴇᴅ ✅');
}
break;

case 'tagall': {
    try {
        await DybyTechInc.react("📢");

        if (!isGroup) return DybyTechInc.reply("ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ ᴡᴏʀᴋs ᴏɴʟʏ ɪɴ ɢʀᴏᴜᴘs");
        if (!isAdmins && !isOwner) return DybyTechInc.reply("ᴏɴʟʏ ɢʀᴏʀᴘ ᴀᴅᴍɪɴs ᴄᴀɴ ᴜsᴇ ᴛᴀɢᴀʟʟ");

        const participants = groupMetadata.participants;
        const msgText = args.join(' ') || "No message"; // Utilise args directement au cas où 'text' bug
        
        let message = `📢 *${"ᴀᴛᴛᴇɴᴛɪᴏɴ ᴇᴠᴇʀʏᴏɴᴇ"}*\n\n`;
        message += `*${"ᴍᴇssᴀɢᴇ"} :* ${toSmallCaps(msgText)}\n\n`;

        let mentions = [];
        for (let mem of participants) {
            message += `🔹 @${mem.id.split('@')[0]}\n`;
            mentions.push(mem.id);
        }

        await sock.sendMessage(DybyTechInc.chat, { 
            text: message, 
            mentions: mentions 
        }, { quoted: mquote });

    } catch (e) {
        console.error(e);
        DybyTechInc.reply("ᴇʀʀᴏʀ ᴏғ ᴛʜᴇʀɪɴɢ ᴛᴀɢɢɪɴɢ");
    }
}
break;




		case 'alive': {
    try {
        await DybyTechInc.react("🌚");

        const imageUrl = "./menu.jpg";
        // Fallback to menu.jpg if alive.jpg is missing
        const finalImage = fs.existsSync(imageUrl) ? imageUrl : "./menu.jpg";
        const buffer = fs.readFileSync(finalImage);

        // Runtime calculation
        const uptime = process.uptime();
        const hours = Math.floor(uptime / 3600);
        const minutes = Math.floor((uptime % 3600) / 60);
        const seconds = Math.floor(uptime % 60);
        const runtimeText = `${hours}ʜ ${minutes}ᴍ ${seconds}s`;

        // English Text with Small Caps
        const aliveMsg = `*${"sʜɪᴘsʏ ᴍᴅ ɪs ᴀᴄᴛɪᴠᴇ"}* 🚀

> ${"ᴛʜᴇ ᴍᴏsᴛ ᴘᴏᴡᴇʀғᴜʟ ᴀɴᴅ sᴛᴀʙᴛʜᴇ ʙᴏᴛ ᴅᴇᴠᴇʟᴏᴘᴇᴅ ʙʏ ᴅᴇᴠ ᴅʏʙʏ"}

╭-----------------------------
┆✞ ${"sʜɪᴘsʏ ᴍᴅ ᴀʟɪᴠᴇ"}*
┆✞ ◈ ${"sᴛᴀᴛᴜs"} : ${"ᴏɴʟɪɴᴇ"}*
┆✞ ◈ ${"ʀᴜɴᴛɪᴍᴇ"} : ${runtimeText}*
┆✞ ◈ ${"ᴘʀᴇғɪx"} : [ ${prefix} ]*
┆✞ ◈ ${"ᴍᴏᴅᴇ"} : ${toSmallCaps(mode)}*
╰-----------------------------

*${"ᴛʏᴘᴇ"} ${prefix}${"ᴍᴇɴᴜ ᴛᴏ ᴅɪsᴘʟᴀʏ ᴄᴏᴍᴍᴀɴᴅs"}*`;

        // Sending with the Fake Quoted (mquote) you added at the top
        await sock.sendMessage(DybyTechInc.chat, {
            image: buffer,
            caption: aliveMsg,
            contextInfo: {
                forwardingScore: 999,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: NEWSLETTER_JID,
                    newsletterName: '𝐒𝐇𝐈𝐏𝐒𝐘 𝐌𝐈𝐍𝐈 𝐁𝐎𝐓',
                    serverMessageId: 125
                },
                externalAdReply: {
                    title: "sʜɪᴘsʏ ᴍᴅ sʏsᴛᴇᴍ ᴀʟɪᴠᴇ",
                    body: "ᴀᴜᴛᴏᴍᴀᴛᴇᴅ ʙʏ ᴅᴇᴠ ᴅʏʙʏ",
                    thumbnail: buffer,
                    sourceUrl: "https://whatsapp.com/channel/0029Vb7EJmL002SztJBkz11T",
                    mediaType: 1,
                    renderLargerThumbnail: false
                }
            }
        }, { quoted: mquote }); // Use your mquote here

    } catch (e) {
        console.error(e);
        DybyTechInc.reply("sʜɪᴘsʏ ᴍᴅ sʏsᴛᴇᴍ ɪs ᴄᴜʀʀᴇɴᴛʟʏ ᴏɴʟɪɴᴇ");
    }
}
break;




    case 'antilink': {
    await DybyTechInc.react("⚙️");
    if (!DybyTechInc.isGroup) return DybyTechInc.reply("𝙾𝙽𝙻𝚈 𝙶𝚁𝙾𝚄𝙿 𝙲𝙼𝙳");
    if (!isOwner) return DybyTechInc.reply("ᴏᴡɴᴇʀ ᴏɴʟʏ");
    const action = args[0]; // 'on' ou 'off'
    if (!action) return DybyTechInc.reply(`𝙿𝙻𝙴𝙰𝚂𝚂 𝚄𝚂𝙴 : ${prefix}antilink on/off`);

    const result = antilinkHandler.toggleAntilink(botNumberShort, DybyTechInc.chat, action);

    if (result === "activé") {
        await DybyTechInc.react("🔒");
        await DybyTechInc.reply("✅ 𝙰𝙽𝚃𝙸𝙻𝙸𝙽𝙺 𝚂𝙴𝚃𝚃𝙸𝙽𝙶 𝙲𝙷𝙰𝙽𝙶𝙴𝙳 𝚃𝙾 𝙾𝙽");
    } else if (result === "désactivé") {
        await DybyTechInc.react("🔓");
        await DybyTechInc.reply("✅ 𝙰𝙽𝚃𝙸𝙻𝙸𝙽𝙺 𝚂𝙴𝚃𝚃𝙸𝙽𝙶 𝙲𝙷𝙰𝙽𝙶𝙴𝙳 𝚃𝙾 𝙾𝙵𝙵");
    }
}
break;
case 'test': {
    try {
        await DybyTechInc.react("🏴");

        const imageUrl = "./test.jpg";
        if (!fs.existsSync(imageUrl)) {
            return DybyTechInc.reply("ɪᴍᴀɢᴇ ᴛᴇsᴛ.ᴊᴘɢ ɴᴏᴛ ғᴏʀɴᴅ");
        }

        const buffer = fs.readFileSync(imageUrl);
        const tt = {
            key: {
                remoteJid: '0@s.whatsapp.net',
                fromMe: false,
                id: 'SHIPSY_MD_STYLISH',
                participant: '0@s.whatsapp.net'
            },
            message: {

                conversation: "ꜱʜɪᴘꜱʏ ᴍɪɴɪ ʙᴏᴛ ᴏᴘᴛɪᴍɪᴢᴇᴅ ʙʏ ᴅᴇᴠ ᴅʏʙʏ 🕷️"
            }
        };
        // Calcul du Runtime
        const uptime = process.uptime();
        const hours = Math.floor(uptime / 3600);
        const minutes = Math.floor((uptime % 3600) / 60);
        const seconds = Math.floor(uptime % 60);
        const runtimeText = `${hours}h ${minutes}m ${seconds}s`;

        // Utilisation de la fonction toSmallCaps sur les textes
        const title = "sʜɪᴘsʏ ᴍᴅ ʀᴜɴɴɪɴɢ";
        const bodyText = "ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴅᴇᴠ ᴅʏʙʏ";
        const systemInfo = "sʜɪᴘsʏ-xᴅ ᴛᴇsᴛ";
        const runtimeLabel = "ʀᴜɴᴛɪᴍᴇ";
        const modeLabel = "ᴍᴏᴅᴇ";
        const pingLabel = "ᴘɪɴɢ";

        const testMsg = `🚀 *${title}*

╭-----------------------------
┆✞ ${systemInfo}*
┆✞ ◈ ${runtimeLabel} : ${runtimeText}*
┆✞ ◈ ${modeLabel} : ${toSmallCaps(mode)}*
┆✞ ◈ ${pingLabel} : ${Date.now() - (m.messageTimestamp * 1000)}ms*
╰-----------------------------

> *${bodyText}*`;
        await sock.sendMessage(DybyTechInc.chat, {
            image: buffer,
            caption: testMsg,
            contextInfo: {
                externalAdReply: {
                    title: "sʜɪᴘsʏ ᴍᴅ ᴛᴇsᴛ",
                    body: "sʏsᴛᴇᴍ ᴏɴʟɪɴᴇ",
                    thumbnail: buffer,
                    mediaType: 1,
                    renderLargerThumbnail: false
                }
            }
        }, { quoted: tt });

    } catch (e) {
        console.error(e);
        DybyTechInc.reply("🚀 " + "sʜɪᴘsʏ ᴍᴅ ɪs ᴏɴʟɪɴᴇ");
    }
}
break;





//spider

// -- spider

                case 'ping':
                case 'runtime':
                case 'p':
                case 'botstatus':
                case 'statusbot':
                case 'uptime': {
                    const { performance } = require('perf_hooks');
                    const t1 = performance.now();
                    const t2 = performance.now();
                    const latency = (t2 - t1).toFixed(4);
                    const up = process.uptime();
                    const h = Math.floor(up / 3600);
                    const mn = Math.floor((up % 3600) / 60);
                    const s = Math.floor(up % 60);
                    const respon = `ʀᴇsᴘᴏɴsᴇ sᴘᴇᴇᴅ:\n${latency} _sᴇᴄᴏɴᴅ_\n${(t2 - t1).toFixed(2)} _ᴍɪʟɪsᴇᴄᴏɴᴅs_\n\nʀᴜɴᴛɪᴍᴇ:\n${h}ʜ ${mn}ᴍ ${s}s`;
                    reply(respon);
                }
                break;

                case 'statusview': {
                    await DybyTechInc.react("⚙️");
                    if (!isOwner) return DybyTechInc.reply("ᴏᴡɴᴇʀ ᴏɴʟʏ");
                    if (!args[0]) return DybyTechInc.reply(`ᴜsᴀɢᴇ : ${prefix}statusview on/off`);
                    config.statusview = args[0].toLowerCase() === 'on' ? 'on' : 'off';
                    await DybyTechInc.reply(`✅ Auto-status is now : *${config.statusview.toUpperCase()}*`);
                }
                break;

		case 'mode': {
    try {
        await DybyTechInc.react("⚙️");
        
        // Vérification si c'est l'Owner
        if (!isOwner) return DybyTechInc.reply("ᴏᴡɴᴇʀ ᴏɴʟʏ");

        // Si aucun argument n'est fourni, on envoie le menu avec boutons
        if (!args[0]) {
            const modeMsg = `⚙️ *${"ʙᴏᴛ ᴍᴏᴅᴇ sᴇᴛᴛɪɴɢs"}*

*${"ᴄᴜʀʀᴇɴᴛ ᴍᴏᴅᴇ"} :* ${toSmallCaps(config.mode)}

> ${"sᴀɴᴅʜᴇᴄᴛ ᴛʜᴇ ᴍᴏᴅᴇ ʙᴇʟᴏᴡ. ɪɴ sᴇʟғ ᴍᴏᴅᴇ, ᴏɴʟʏ ᴛʜᴇ ᴏᴡɴᴇʀ ᴄᴀɴ ᴜsᴇ ᴛʜᴇ ʙᴏᴛ."}`;

            await sock.relayMessage(DybyTechInc.chat, {
                viewOnceMessage: {
                    message: {
                        interactiveMessage: {
                            header: {
                                title: `*${"sʜɪᴘsʏ ᴍᴅ ᴄᴏɴғɪɢᴜʀᴀᴛɪᴏɴ"}*`,
                                hasMediaAttachment: false
                            },
                            body: { text: modeMsg },
                            footer: { text: "> © 𝙿𝙾𝚆𝙴𝚁𝙴𝙳 𝙱𝚈 𝙳𝙴𝚅 𝙳𝚈𝙱𝚈" },
                            nativeFlowMessage: {
                                buttons: [
                                    {
                                        name: "quick_reply",
                                        buttonParamsJson: JSON.stringify({
                                            display_text: "ᴍᴏᴅᴇ ᴘᴜʙʟɪᴄ",
                                            id: `${prefix}mode public`
                                        })
                                    },
                                    {
                                        name: "quick_reply",
                                        buttonParamsJson: JSON.stringify({
                                            display_text: "ᴍᴏᴅᴇ sᴇʟғ",
                                            id: `${prefix}mode self`
                                        })
                                    }
                                ]
                            },
                            contextInfo: {
                                forwardingScore: 999,
                                isForwarded: true,
                                forwardedNewsletterMessageInfo: {
                                    newsletterJid: NEWSLETTER_JID,
                                    newsletterName: '𝐒𝐇𝐈𝐏𝐒𝐘 𝐌𝐈𝐍𝐈 𝐁𝐎𝐓',
                                    serverMessageId: 125
                                }
                            }
                        }
                    }
                }
            }, { quoted: mquote });
            return;
        }

        // Logique de changement de mode si l'argument existe (clic sur bouton ou texte)
        const targetMode = args[0].toLowerCase();
        if (targetMode === 'self' || targetMode === 'public') {
            config.mode = targetMode;
            await DybyTechInc.react("✅");
            await DybyTechInc.reply(`✅ *${"ᴍᴏᴅᴇ ᴜᴘᴅᴀᴛᴇᴅ"}*\n\n> ${"ʙᴏᴛ ɪs ɴᴏᴡ ɪɴ"} *${targetMode.toUpperCase()}* ${"ᴍᴏᴅᴇ"}`);
        } else {
            await DybyTechInc.reply(`${"ᴜsᴀɢᴇ"} : ${prefix}mode public / self`);
        }

    } catch (e) {
        console.error(e);
        DybyTechInc.reply("ᴇʀʀᴏʀ ᴄʜᴀɴɢɪɴɢ ᴍᴏᴅᴇ");
    }
}
break;


                case 'setprefix': {
                    await DybyTechInc.react("⚙️");
                    if (!isOwner) return DybyTechInc.reply("ᴏᴡɴᴇʀ ᴏɴʟʏ");
                    if (!args[0]) return DybyTechInc.reply("Please specify a symbol (ex: !, /)");
                    config.prefix = args[0];
                    await DybyTechInc.reply(`✅ New prefix : *${config.prefix}*`);
                }
                break;

                


case 'owner': {
    try {
        await DybyTechInc.react("👤");

        const ownerNumber = "50948336180";
        const ownerName = "ᴅᴇᴠ ᴅʏʙʏ";
        
        // --- CONSTRUCTION DE LA VCARD (CORRIGÉE) ---
        const vcard = 'BEGIN:VCARD\n'
            + 'VERSION:3.0\n' 
            + 'FN:' + ownerName + '\n'
            + 'ORG:Shipsy MD Developer;\n'
            + 'TEL;type=CELL;type=VOICE;waid=' + ownerNumber + ':+' + ownerNumber + '\n'
            + 'END:VCARD';

        // --- ENVOI DU CONTACT ---
        await sock.sendMessage(DybyTechInc.chat, {
            contacts: {
                displayName: ownerName,
                contacts: [{ vcard }]
            }
        }, { quoted: mquote });

        // --- MESSAGE DE PRÉSENTATION ---
        const ownerMsg = `👋 *${"ʜᴇʟʟᴏ"} !*

╭-----------------------------
┆✞ ${"ᴅᴇᴠᴇʟᴏᴘᴇʀ ɪɴғᴏ"}*
┆✞ ◈ ${"ɴᴀᴍᴇ"} : ${ownerName}*
┆✞ ◈ ${"ʀᴏʟᴇ"} : ${"ᴛʜᴇᴀᴅ ᴅᴇᴠᴇʟᴏᴘᴇʀ"}*
┆✞ ◈ ${"ʙᴏᴛ"} : ${"sʜɪᴘsʏ ᴍᴅ ᴠ1"}*
┆✞ ◈ ${"sᴛᴀᴛᴜs"} : ${"ᴏɴʟɪɴᴇ"} ⚡*
╰-----------------------------

> *${"ғᴇᴇʟ ғʀᴇᴇ ᴛᴏ ᴄᴏɴᴛᴀᴄᴛ ᴛʜᴇ ᴏᴡɴᴇʀ ғᴏʀ ᴀɴʏ ʜᴇʟᴘ ᴏʀ ʙᴜɢs ʀᴇɢᴀʀᴅɪɴɢ sʜɪᴘsʏ ᴍᴅ"}* 🕷️`;

        // --- ENVOI AVEC IMAGE ET BOUTONS ---
        // Si prepareMessageMedia pose problème, on envoie sans image pour la stabilité
        await sock.relayMessage(DybyTechInc.chat, {
            viewOnceMessage: {
                message: {
                    interactiveMessage: {
                        header: {
                            title: `*${"ᴏᴡɴᴇʀ ᴘʀᴏғɪʟᴇᴇ"}*`,
                            hasMediaAttachment: false
                        },
                        body: { text: ownerMsg },
                        footer: { text: "> © 𝙿𝙾𝚆𝙴𝚁𝙴𝙳 𝙱𝚈 𝙳𝙴𝚅 𝙳𝚈𝙱𝚈" },
                        nativeFlowMessage: {
                            buttons: [
                                {
                                    name: "cta_url",
                                    buttonParamsJson: JSON.stringify({
                                        display_text: "ᴄʜᴀᴛ ᴡɪᴛʜ ᴏᴡɴᴇʀ",
                                        url: `https://wa.me/${ownerNumber}`
                                    })
                                },
                                {
                                    name: "cta_url",
                                    buttonParamsJson: JSON.stringify({
                                        display_text: "ᴏғғɪᴄɪᴀʟ ᴄʜᴀɴɴᴇʟ",
                                        url: "https://whatsapp.com/channel/0029Vb7EJmL002SztJBkz11T"
                                    })
                                }
                            ]
                        },
                        contextInfo: {
                            forwardingScore: 999,
                            isForwarded: true,
                            forwardedNewsletterMessageInfo: {
                                newsletterJid: NEWSLETTER_JID,
                                newsletterName: '𝐒𝐇𝐈𝐏𝐒𝐘 𝐌𝐈𝐍𝐈 𝐁𝐎𝐓',
                                serverMessageId: 125
                            }
                        }
                    }
                }
            }
        }, { quoted: mquote });

    } catch (e) {
        console.error("Owner Command Error:", e);
        DybyTechInc.replyContact("ᴅᴇᴠ ᴅʏʙʏ", "Shipsy MD Developer", "50940986014");
    }
}
break;



                /* AJOUTE TES AUTRES CASES ICI */

                default:
                    break;
            }
        }
    } catch (err) {
        console.error("[shipsy Error]", err);
    }
}
async function Telesticker(url) {
    const axios = require('axios');
    // On utilise une API publique pour récupérer les fichiers du pack Telegram
    let packName = url.replace("https://t.me/addstickers/", "");
    let response = await axios.get(`https://api.telegram.org/bot7342041131:AAGNo98mY5jOqJ-fJ7p0j6jJ6Jj6Jj6Jj6J/getStickerSet?name=${packName}`).catch(() => null);
    
    // Note: Si l'API ci-dessus échoue, c'est souvent dû à un token invalide. 
    // Il est préférable d'utiliser un scraper ou une API de sticker tierce.
    if (!response) {
        // Alternative via une API de secours si tu en as une
        throw new Error("Failed to retrieve the pack.");
    }

    return response.data.result.stickers.map(s => {
        return {
            url: `https://api.telegram.org/file/bot7342041131:AAGNo98mY5jOqJ-fJ7p0j6jJ6Jj6Jj6Jj6J/${s.file_path}` // Note: nécessite un getFile pour être précis
        };
    });
}

module.exports = {
    handleMessages,
    sessionsConfig,
    initSession
};
