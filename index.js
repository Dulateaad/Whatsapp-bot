const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const fs = require('fs');
const dayjs = require('dayjs');

const { extractTextFromImage } = require('./utils/ocr');
const { isAd } = require('./utils/adCheck');

const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  }
});

let paidUsers = [];

function loadPaidUsers() {
  try {
    const data = fs.readFileSync('paidUsers.json', 'utf8');
    paidUsers = JSON.parse(data);
  } catch (err) {
    console.error("Error loading paid users:", err);
    paidUsers = [];
  }
}

function isUserPaid(number) {
  const user = paidUsers.find(u => number.includes(u.number));
  return user && dayjs().isBefore(dayjs(user.expires));
}

client.on('qr', qr => {
  qrcode.generate(qr, { small: true });
  console.log("QR-код для авторизации:");
});

client.on('ready', () => {
  console.log('Бот запущен!');
  loadPaidUsers();
});

client.on('message_create', async msg => {
  if (!msg.fromMe) {
    const number = msg.author || msg.from;

    let textContent = msg.body || '';
    let hasAd = false;

    // Проверка текста
    if (isAd(textContent)) {
      hasAd = true;
    }

    // Проверка фото
    if (msg.hasMedia) {
      const media = await msg.downloadMedia();
      if (media && media.mimetype.includes('image')) {
        const buffer = Buffer.from(media.data, 'base64');
        const extractedText = await extractTextFromImage(buffer);
        if (isAd(extractedText)) {
          hasAd = true;
        }
      }
    }

    // Удаление и предупреждение
    if (hasAd && !isUserPaid(number)) {
      try {
        await msg.delete(true);
        await msg.reply("⚠️ Реклама запрещена. Вы не оплатили размещение. Свяжитесь с админом.");
        console.log(`Удалено рекламное сообщение от ${number}`);
      } catch (err) {
        console.error("Ошибка удаления:", err);
      }
    }
  }
});

client.initialize();
