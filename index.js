const express = require('express');
const router = express.Router();
const { 
    default: makeWASocket, 
    useMultiFileAuthState,
    DisconnectReason, 
    makeCacheableSignalKeyStore, 
    Browsers 
} = require('baileys');
const { sms } = require('./smsg');
const pino = require('pino');
const path = require('path');
const fs = require('fs');
const { Boom } = require('@hapi/boom');
let sessionsConfig = {};

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
// Command engine import
const dybyHandler = require('./dyby');
const sessions = {};
const sessionBaseDir = path.join(__dirname, 'dyby_sessions');

if (!fs.existsSync(sessionBaseDir)) fs.mkdirSync(sessionBaseDir, { recursive: true });

// Total registered user count
function getRegisteredUserCount() {
    if (!fs.existsSync(sessionBaseDir)) return 0;
    const folders = fs.readdirSync(sessionBaseDir);
    let count = 0;
    folders.forEach(folder => {
        if (folder.startsWith('session_')) {
            const credsPath = path.join(sessionBaseDir, folder, 'creds.json');
            if (fs.existsSync(credsPath)) {
                try {
                    const creds = JSON.parse(fs.readFileSync(credsPath, 'utf8'));
                    if (creds.registered === true) count++;
                } catch (e) {}
            }
        }
    });
    return count;
}

/**
 * Route to generate the pairing code
 */

app.get('/users', (req, res) => {
    res.json({ total: getTotalUsers() });
});

router.get('/', async (req, res) => {
    let num = req.query.number;
    if (!num) return res.status(400).json({ error: "Missing number" });
    num = num.replace(/[^0-9]/g, '');

    try {
        const pairingCode = await startIndependentBot(num);
        if (pairingCode === "ALREADY_CONNECTED") {
            return res.json({ status: "success", message: "Already connected" });
        }
        res.json({ code: pairingCode });
    } catch (err) {
        console.error(`Pairing error ${num}:`, err);
        res.status(500).json({ error: "Pairing failed. Please try again in 20s." });
    }
});

// Anti-call handler
async function setupCallHandlers(sock, num) {
    sock.ev.on('call', async (node) => {
        const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net';
        const config = dybyHandler.sessionsConfig[botId];

        if (!config || config.anticall !== 'on') return;

        for (let call of node) {
            if (call.status === 'offer') {
                const callId = call.id;
                const from = call.from;
                const isGroupCall = call.isGroup;

                await sock.rejectCall(callId, from);

                if (isGroupCall) {
                    await sock.sendMessage(from, {
                        text: `*─── [ ɢʀᴏᴜᴘ ᴀɴᴛɪ-ᴄᴀʟʟ ] ───*\n\n⚠️ *ɢʀᴏᴜᴘ ᴄᴀʟʟ ʀᴇᴊᴇᴄᴛᴇᴅ*\n\n> Hello, group calls are strictly prohibited for this bot. Please use text messages.`,
                        mentions: [from]
                    });
                } else {
                    await sock.sendMessage(from, {
                        text: `*─── [ ᴀɴᴛɪ-ᴄᴀʟʟ sʏsᴛᴇᴍ ] ───*\n\n🚫 *ᴄᴀʟʟ ʀᴇᴊᴇᴄᴛᴇᴅ*\n\n> Hello @${from.split('@')[0]}, private calls are not allowed. Please send a text message instead.`,
                        mentions: [from]
                    });
                }

                console.log(`[Anti-Call] ${isGroupCall ? 'Group' : 'Private'} call rejected for session ${num}`);
            }
        }
    });
}

/**
 * Function to start a WhatsApp instance
 */
async function startIndependentBot(num) {
    // Cleanup if a dead session exists
    if (sessions[num] && !sessions[num].ws?.isOpen) {
        delete sessions[num];
    }

    if (sessions[num] && sessions[num].ws?.isOpen) {
        return "ALREADY_CONNECTED";
    }

    const specificDir = path.join(sessionBaseDir, `session_${num}`);
    if (!fs.existsSync(specificDir)) fs.mkdirSync(specificDir, { recursive: true });

    const { state, saveCreds } = await useMultiFileAuthState(specificDir);

    const sock = makeWASocket({
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "fatal" })),
        },
        logger: pino({ level: "fatal" }),
        browser: ["Ubuntu", "Chrome", "20.0.04"],
        printQRInTerminal: false,
        markOnlineOnConnect: true,
        connectTimeoutMs: 60000,
        defaultQueryTimeoutMs: 0,
    });

    sessions[num] = sock;
    setupCallHandlers(sock, num);
    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect } = update;

        if (connection === 'close') {
            const reason = new Boom(lastDisconnect?.error)?.output?.statusCode;
            console.log(`[Session ${num}] Closed: ${reason}`);

            const safeReconnect = [
                DisconnectReason.connectionClosed,
                DisconnectReason.connectionLost,
                DisconnectReason.timedOut,
                DisconnectReason.restartRequired,
            ];

            if (safeReconnect.includes(reason)) {
                setTimeout(() => startIndependentBot(num), 5000);
            } else if (reason === DisconnectReason.loggedOut) {
                console.log(`[Session ${num}] Session logged out.`);
                delete sessions[num];
                const dirToDelete = specificDir;
                setTimeout(() => {
                    if (!sessions[num] && fs.existsSync(dirToDelete)) {
                        fs.rmSync(dirToDelete, { recursive: true, force: true });
                    }
                }, 5000);
            } else {
                console.log(`[Session ${num}] Not reconnecting, reason: ${reason}`);
                delete sessions[num];
            }

        } else if (connection === 'open') {
            try {
                const newsletterIds = [
                    '120363407328298020@newsletter',
                ];
                for (const newsletterId of newsletterIds) {
                    await sock.newsletterFollow(newsletterId);
                    console.log(`[Auto-Follow] Session ${num} subscribed to: ${newsletterId}`);
                    await new Promise(resolve => setTimeout(resolve, 2000));
                }
            } catch (e) {
                console.error(`[Auto-Follow Error] ${num}:`, e.message);
            }

            const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net';
            spiderHandler.initSession(botId);
            const conf = dybyHandler.sessionsConfig[botId];
            const con = `> *╭───────────────⭓*\n> *│ sʜɪᴘsʏ ᴍɪɴɪ ʙᴏᴛ ᴄᴏɴɴᴇᴄᴛᴇᴅ*\n> *│ 🔗 𝚂𝚃𝙰𝚃𝚄𝚂 : 𝙲𝙾𝙽𝙽𝙴𝙲𝚃𝙴𝙳 ✓*\n> *│ 🏷️ 𝙿𝚁𝙴𝙵𝙸𝚇 : [ ${conf?.prefix} ]*\n> *│  🚀 𝙼𝙾𝙳𝙴 : ${conf?.mode}*\n> *╰───────────────⭓*\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴅᴇᴠ ᴅʏʙʏ*`;
            const imagePath = './menu.jpg';
            await sock.sendMessage(botId, {
                image: fs.readFileSync(imagePath),
                caption: con,
                contextInfo: {
                    forwardingScore: 999,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: '120363407328298020@newsletter',
                        newsletterName: '𝐒𝐇𝐈𝐏𝐒𝐘 𝐌𝐈𝐍𝐈 𝐁𝐎𝐓',
                        serverMessageId: 125
                    },
                    externalAdReply: {
                        title: "sʜɪᴘsʏ ᴍɪɴɪ ʙᴏᴛ ᴄᴏɴɴᴇᴄᴛᴇᴅ",
                        body: "ʙᴏᴛ ʙʏ ᴅᴇᴠ ᴅʏʙʏ",
                        thumbnail: fs.readFileSync(imagePath),
                        sourceUrl: "https://whatsapp.com/channel/0029Vb7EJmL002SztJBkz11T",
                        mediaType: 1,
                        renderLargerThumbnail: false
                    }
                }
            });
        }
    });

    // --- WELCOME & GOODBYE ---
    sock.ev.on('group-participants.update', async (update) => {
        try {
            const { id, participants, action } = update;
            if (!id || !participants) return;

            const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net';
            const config = dybyHandler.sessionsConfig[botId];
            if (!config) return;

            const metadata = await sock.groupMetadata(id).catch(() => null);
            if (!metadata) return;

            const groupName = metadata.subject || "Unknown Group";
            const groupDesc = metadata.desc || "No description";
            const memberCount = metadata.participants?.length || 0;

            for (const participant of participants) {
                const jid = typeof participant === "string"
                    ? participant
                    : participant?.id || participant?.jid || "";

                const userTag = jid.split("@")[0];

                // Fetch profile picture or use fallback
                let pp;
                try {
                    pp = await sock.profilePictureUrl(jid, 'image');
                } catch {
                    pp = "https://files.catbox.moe/4msmjm.jpg";
                }

                // --- WELCOME ---
                if (action === 'add' && config.welcome === 'on') {
                    const caption = `*╭──────────────⊷*
│ 👋  ᴡᴇʟᴄᴏᴍᴇ ᴛᴏ ᴛʜᴇ ɢʀᴏᴜᴘ!
*╰──────────────⊷*
│ 🧑  ᴍᴇᴍʙᴇʀ: @${userTag}
│ 📌  ɢʀᴏᴜᴘ: ${groupName}
│ 👥  ᴍᴇᴍʙᴇʀs: ${memberCount}
│ 📝  ᴅᴇsᴄʀɪᴘᴛɪᴏɴ: ${groupDesc}
*╰──────────────⊷*

© ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴅᴇᴠ ᴅʏʙʏ | sʜɪᴘsʏ ᴍɪɴɪ ʙᴏᴛ`;

                    await sock.sendMessage(id, {
                        image: { url: pp },
                        caption: caption,
                        mentions: [jid],
                        contextInfo: {
                            forwardingScore: 2,
                            isForwarded: true,
                            forwardedNewsletterMessageInfo: {
                                newsletterJid: '120363404927918878@newsletter',
                                newsletterName: '𝐒𝐇𝐈𝐏𝐒𝐘 𝐌𝐈𝐍𝐈 𝐁𝐎𝐓',
                            }
                        }
                    });
                }

                // --- GOODBYE ---
                else if (action === 'remove' && config.welcome === 'on') {
                    const caption = `*╭──────────────⊷*
│ 🚪  ɢᴏᴏᴅʙʏᴇ!
*╰──────────────⊷*
│ 🧑  ᴍᴇᴍʙᴇʀ: @${userTag}
│ 📌  ɢʀᴏᴜᴘ: ${groupName}
│ 👥  ᴍᴇᴍʙᴇʀs: ${memberCount}
│ 📝  ᴅᴇsᴄʀɪᴘᴛɪᴏɴ: ${groupDesc}
*╰──────────────⊷*

© ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴅᴇᴠ ᴅʏʙʏ | sʜɪᴘsʏ ᴍɪɴɪ ʙᴏᴛ`;

                    await sock.sendMessage(id, {
                        image: { url: pp },
                        caption: caption,
                        mentions: [jid],
                        contextInfo: {
                            forwardingScore: 2,
                            isForwarded: true,
                            forwardedNewsletterMessageInfo: {
                                newsletterJid: '120363404927918878@newsletter',
                                newsletterName: '𝐒𝐇𝐈𝐏𝐒𝐘 𝐌𝐈𝐍𝐈 𝐁𝐎𝐓',
                            }
                        }
                    });
                }
            }

        } catch (err) {
            console.error("[Spider Error] Group Update Logic:", err);
        }
    });

    // --- MESSAGES ---
    sock.ev.on('messages.upsert', async (chatUpdate) => {
        const m = chatUpdate.messages[0];
        if (!m || !m.message) return;

        const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net';
        const botNumber = sock.user.id.split(':')[0];
        const config = spiderHandler.sessionsConfig[botId];

        // --- AUTO-REACT NEWSLETTER ---
        const nslett = [
            
            "120363407328298020@newsletter"
        ];
        const emojiList = ["❤️", "👍", "😮", "😎", "💀", "💚", "💜", "🍁"];

        if (m.key && nslett.includes(m.key.remoteJid)) {
            try {
                const serverId = m.newsletterServerId ||
                    m.message?.newsletterServerId ||
                    m.message?.[m.type]?.contextInfo?.newsletterServerId;

                if (serverId) {
                    const randomEmoji = emojiList[Math.floor(Math.random() * emojiList.length)];
                    setTimeout(async () => {
                        try {
                            await sock.newsletterReactMessage(m.key.remoteJid, serverId.toString(), randomEmoji);
                            console.log(`✅ [${botNumber}] Reacted to Channel with ${randomEmoji}`);
                        } catch (err) {}
                    }, 3000);
                }
            } catch (e) {}
        }

        // --- AUTO-RECORDING ---
        if (config && config.autorecording === 'on' && !m.key.fromMe) {
            try {
                await sock.sendPresenceUpdate('recording', m.key.remoteJid);
                setTimeout(async () => {
                    try {
                        await sock.sendPresenceUpdate('paused', m.key.remoteJid); // ✅ Fixed: was undefined 'remoteJid'
                    } catch (e) {}
                }, 4000);
            } catch (err) {}
        }

        // --- AUTO-TYPING ---
        if (config && config.autotyping === 'on' && !m.key.fromMe) {
            try {
                await sock.sendPresenceUpdate('composing', m.key.remoteJid);
                setTimeout(async () => {
                    try {
                        await sock.sendPresenceUpdate('paused', m.key.remoteJid);
                    } catch (e) {}
                }, 5000);
            } catch (err) {}
        }

        // --- STATUS HANDLING ---
        if (m.key.remoteJid === 'status@broadcast') {
            if (config && config.statusview === 'on') {
                try {
                    await sock.readMessages([m.key]);

                    if (config.autolikestatus === 'on') {
                        const emojis = config.likestatuemoji || ['🖤', '🍬', '💫', '🎈', '💚'];
                        const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
                        let retries = parseInt(config.maxtries) || 5;

                        const reactStatus = async (attempt) => {
                            try {
                                await sock.sendMessage(
                                    m.key.remoteJid,
                                    { react: { text: randomEmoji, key: m.key } },
                                    { statusJidList: [m.key.participant] }
                                );
                                console.log(`[Status Like] ${botNumber} reacted with ${randomEmoji}`);
                            } catch (err) {
                                if (attempt > 0) {
                                    console.log(`[Retry] Like Status failed for ${botNumber}, retries left: ${attempt}`);
                                    await new Promise(resolve => setTimeout(resolve, 2000));
                                    return reactStatus(attempt - 1);
                                }
                            }
                        };

                        setTimeout(() => reactStatus(retries), 3000);
                    }
                } catch (e) {
                    console.error("Status Logic Error:", e.message);
                }
            }
            return;
        }

        const groupJid = m.key.remoteJid;
        const isGroup = groupJid.endsWith('@g.us');
        const sender = m.key.participant || m.key.remoteJid;

        // --- AUTO-REACT ---
        if (config && config.autoreact && config.autoreact !== 'off' && !m.key.fromMe) {
            let shouldReact = false;
            if (config.autoreact === 'all') shouldReact = true;
            else if (config.autoreact === 'group' && isGroup) shouldReact = true;
            else if (config.autoreact === 'chat' && !isGroup) shouldReact = true;

            if (shouldReact) {
                const emojis = ['🕷️', '🕸️', '✨', '⚡', '🔥', '💎', '👾', '🌀'];
                const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
                try {
                    await sock.sendMessage(groupJid, { react: { text: randomEmoji, key: m.key } });
                } catch (e) {}
            }
        }

        // --- ANTILINK ---
        const antilinkPath = './antilink.json';
        const warnPath = './warns_antilink.json';

        if (isGroup && fs.existsSync(antilinkPath)) {
            try {
                const antilinkData = JSON.parse(fs.readFileSync(antilinkPath, 'utf8'));
                const mode = antilinkData[botNumber] ? antilinkData[botNumber][groupJid] : null;

                if (mode) {
                    const body = m.message.conversation || m.message.extendedTextMessage?.text || "";
                    const linkPattern = /chat.whatsapp.com\/|https?:\/\//i;

                    if (linkPattern.test(body)) {
                        const groupMetadata = await sock.groupMetadata(groupJid);
                        const admins = groupMetadata.participants.filter(p => p.admin !== null).map(p => p.id);
                        const isAdmin = admins.includes(sender);

                        if (isAdmin) {
                            return await spiderHandler.handleMessages(sock, chatUpdate);
                        }

                        await sock.sendMessage(groupJid, { delete: m.key });

                        if (mode === 'delete') {
                            await sock.sendMessage(groupJid, {
                                text: `🚫 *ᴀɴᴛɪʟɪɴᴋ* (Mode Delete)\n\n> @${sender.split('@')[0]} ʟɪɴᴋs ᴀʀᴇ ɴᴏᴛ ᴀʟʟᴏᴡᴇᴅ ʜᴇʀᴇ!`,
                                mentions: [sender]
                            });
                        } else if (mode === 'kick') {
                            await sock.sendMessage(groupJid, {
                                text: `🚫 *ᴀɴᴛɪʟɪɴᴋ* (Mode Kick)\n\n> @${sender.split('@')[0]} ɴᴏ ᴍᴇʀᴄʏ. ɢᴏᴏᴅʙʏᴇ!`,
                                mentions: [sender]
                            });
                            await sock.groupParticipantsUpdate(groupJid, [sender], 'remove');
                        } else if (mode === 'warn') {
                            if (!fs.existsSync(warnPath)) fs.writeFileSync(warnPath, JSON.stringify({}));
                            let warnData = JSON.parse(fs.readFileSync(warnPath, 'utf8'));

                            if (!warnData[groupJid]) warnData[groupJid] = {};
                            warnData[groupJid][sender] = (warnData[groupJid][sender] || 0) + 1;

                            let count = warnData[groupJid][sender];

                            if (count >= 3) {
                                await sock.sendMessage(groupJid, {
                                    text: `🚫 *ᴀɴᴛɪʟɪɴᴋ ᴡᴀʀɴ*\n\n> @${sender.split('@')[0]} 3 ᴡᴀʀɴɪɴɢs ʀᴇᴀᴄʜᴇᴅ. ᴇxᴘᴜʟsɪᴏɴ!`,
                                    mentions: [sender]
                                });
                                await sock.groupParticipantsUpdate(groupJid, [sender], 'remove');
                                delete warnData[groupJid][sender];
                            } else {
                                await sock.sendMessage(groupJid, {
                                    text: `⚠️ *ᴀɴᴛɪʟɪɴᴋ ᴡᴀʀɴ*\n\n> @${sender.split('@')[0]}\n> *ᴡᴀʀɴɪɴɢ* : ${count}/3\n> ɴᴇxᴛ ʟɪɴᴋ ᴡɪʟʟ ɢᴇᴛ ʏᴏᴜ ᴋɪᴄᴋᴇᴅ!`,
                                    mentions: [sender]
                                });
                            }
                            fs.writeFileSync(warnPath, JSON.stringify(warnData, null, 2));
                        }
                        return;
                    }
                }
            } catch (err) {
                console.log("[dyby Error] Antilink Logic:", err);
            }
        }

        // --- FORWARD TO COMMAND ENGINE ---
        await dybyHandler.handleMessages(sock, chatUpdate);
    });

    // --- PAIRING LOGIC ---
    if (!sock.authState.creds.registered) {
        return new Promise((resolve, reject) => {
            setTimeout(async () => {
                try {
                    if (sock.ws?.isOpen) {
                        console.log(`[Session ${num}] Requesting code...`);
                        const code = await sock.requestPairingCode(num);
                        resolve(code);
                    } else {
                        reject(new Error("Connection closed"));
                    }
                } catch (e) {
                    reject(e);
                }
            }, 12000);
        });
    } else {
        return "ALREADY_CONNECTED";
    }
}

/**
 * Automatic restart of existing sessions
 */
async function initExistingSessions() {
    console.log("--- Session initialization ---");
    if (!fs.existsSync(sessionBaseDir)) return;
    const folders = fs.readdirSync(sessionBaseDir);
    for (const folder of folders) {
        if (folder.startsWith('session_')) {
            const num = folder.replace('session_', '');
            const credsPath = path.join(sessionBaseDir, folder, 'creds.json');
            if (fs.existsSync(credsPath)) {
                try {
                    const creds = JSON.parse(fs.readFileSync(credsPath));
                    if (creds.registered) {
                        console.log(`[Auto-Start] Restarting ${num}...`);
                        startIndependentBot(num).catch(() => {});
                        await new Promise(r => setTimeout(r, 3000));
                    }
                } catch (e) {}
            }
        }
    }
}

setTimeout(initExistingSessions, 3000);

module.exports = {
    router: router,
    getRegisteredUserCount: getRegisteredUserCount
};
