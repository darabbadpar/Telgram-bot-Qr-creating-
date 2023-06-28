
const botToken = 'your bot token';
const TelegramBot = require('node-telegram-bot-api');
const QRCode = require('qrcode');
const fs = require('fs');

// Replace 'YOUR_TELEGRAM_BOT_TOKEN' with your actual bot token
const bot = new TelegramBot(botToken, { polling: true });

// Handle incoming messages
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(
        chatId,
        'Send me a text and I will generate a QR code for you! You can also specify the shape by sending a shape command (e.g., /circle, /triangle, /square).'
    );
});

bot.onText(/\/(circle|triangle|square)/, (msg, match) => {
    const chatId = msg.chat.id;
    const shape = match[1].toLowerCase();
    const text = msg.text.replace('/' + shape, '').trim();

    // Generate QR code with specified shape and random color
    const options = {
        color: {
            dark: getRandomColor(),
            light: getRandomColor()
        },
        errorCorrectionLevel: 'H',
        type: shape
    };

    generateQRCode(chatId, text, options);
});

bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;

    // Generate QR code with default shape (square) and random color
    const options = {
        color: {
            dark: getRandomColor(),
            light: getRandomColor()
        },
        errorCorrectionLevel: 'H'
    };

    generateQRCode(chatId, text, options);
});

// Helper function to generate QR code
function generateQRCode(chatId, text, options) {
    options = options || {};

    QRCode.toFile('qrcode.jpg', text, options, (err) => {
        if (err) {
            bot.sendMessage(chatId, 'An error occurred while generating the QR code.');
            return;
        }

        // Send the QR code image
        bot.sendPhoto(chatId, 'qrcode.jpg')
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

// Helper function to generate a random color in hexadecimal format
function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}
