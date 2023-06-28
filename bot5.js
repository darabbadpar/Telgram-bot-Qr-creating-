const TelegramBot = require('node-telegram-bot-api');
const QRCode = require('qrcode');
const fs = require('fs');
const botToken = 'bot token';
// Replace 'YOUR_TELEGRAM_BOT_TOKEN' with your actual bot token
const bot = new TelegramBot(botToken, { polling: true });

// Handle incoming messages
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, 'Send me a text, image, or file and I will generate a QR code for it!');
});

bot.onText(/\/qrtext (.+)/, (msg, match) => {
    const chatId = msg.chat.id;
    const text = match[1];

    // Generate QR code for the provided text
    generateQRCode(chatId, text);
});

bot.on('photo', (msg) => {
    const chatId = msg.chat.id;

    // Retrieve the photo file ID
    const fileId = msg.photo[0].file_id;

    // Get the photo file by ID
    bot.getFile(fileId).then((fileInfo) => {
        const fileUrl = `https://api.telegram.org/file/bot${bot.token}/${fileInfo.file_path}`;

        // Generate QR code for the photo
        generateQRCode(chatId, fileUrl);
    }).catch((error) => {
        console.log('Error retrieving photo:', error);
        bot.sendMessage(chatId, 'An error occurred while retrieving the photo.');
    });
});

bot.on('document', (msg) => {
    const chatId = msg.chat.id;

    // Retrieve the document file ID
    const fileId = msg.document.file_id;

    // Get the document file by ID
    bot.getFile(fileId).then((fileInfo) => {
        const fileUrl = `https://api.telegram.org/file/bot${bot.token}/${fileInfo.file_path}`;

        // Generate QR code for the document
        generateQRCode(chatId, fileUrl);
    }).catch((error) => {
        console.log('Error retrieving document:', error);
        bot.sendMessage(chatId, 'An error occurred while retrieving the document.');
    });
});

// Helper function to generate QR code
function generateQRCode(chatId, data) {
    QRCode.toFile('qrcode.jpg', data, (err) => {
        if (err) {
            bot.sendMessage(chatId, 'An error occurred while generating the QR code.');
            return;
        }

        // Read the generated QR code image
        const qrCodeImage = fs.readFileSync('qrcode.jpg');

        // Send the QR code image
        bot.sendPhoto(chatId, qrCodeImage)
            .then(() => {
                // Delete the temporary image file
                fs.unlinkSync('qrcode.jpg');
            })
            .catch((error) => {
                console.log('Error sending photo:', error);
                bot.sendMessage(chatId, 'An error occurred while sending the QR code.');
            });
    });
}
