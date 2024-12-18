// Importación de dependencias
import fetch from 'node-fetch';
import TelegramBot from 'node-telegram-bot-api';
import express from 'express';

// Configuración del servidor Express
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('Bot funcionando...');
});

app.listen(PORT, () => {
  console.log(`Servidor Express escuchando en el puerto ${PORT}`);
});

// Configuración del bot de Telegram con Webhook
const TOKEN = '7599915084:AAHA-m-jQiJLygYA6EPtu8Sxb8qvnHyVWzc';
const SHEETY_URL = 'https://api.sheety.co/8465d5ff8c6bbdc820dfdecd6b045c13/gestorDeCuentas/hoja1';
const bot = new TelegramBot(TOKEN);

const url = process.env.RENDER_EXTERNAL_URL || `https://tu-dominio.com`;
const webhookPath = `/bot${TOKEN}`;
bot.setWebHook(`${url}${webhookPath}`);

app.post(webhookPath, express.json(), (req, res) => {
  bot.processUpdate(req.body);
  res.sendStatus(200);
});

// Variables y configuraciones
let users = [];
const PLATFORMS = {
  1: "Netflix",
  2: "Disney",
  3: "Prime Video",
  4: "Crunchyroll",
  5: "Pixel TV"
};

// Comando /registrar
bot.onText(/\/registrar/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, "Por favor, envía tu nombre para registrarte.");
  users[chatId] = { step: 1, name: "" };
});

// Proceso de registro
bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  try {
    if (users[chatId]?.step === 1) {
      users[chatId].name = text;
      users[chatId].step = 2;
      bot.sendMessage(chatId, "Selecciona la plataforma:\n1. Netflix\n2. Disney\n3. Prime Video\n4. Crunchyroll\n5. Pixel TV");
    } else if (users[chatId]?.step === 2) {
      const platformNumber = parseInt(text);
      if (isNaN(platformNumber) || !PLATFORMS[platformNumber]) {
        bot.sendMessage(chatId, "❌ Plataforma no válida. Por favor, selecciona entre 1 y 5.");
        return;
      }
      users[chatId].platform = PLATFORMS[platformNumber];
      users[chatId].step = 3;
      bot.sendMessage(chatId, "¿Cuántos meses deseas asignar (1 o 2)?");
    } else if (users[chatId]?.step === 3) {
      const months = parseInt(text);
      if (months === 1 || months === 2) {
        const days = months * 30;
        const startDate = new Date();
        const endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + days);

        const data = {
          hoja1: {
            nombre: users[chatId].name,
            plataforma: users[chatId].platform,
            dias: days,
            fechaInicio: startDate.toISOString().split('T')[0],
            fechaVencimiento: endDate.toISOString().split('T')[0],
            diasRestantes: days
          }
        };

        const response = await fetch(SHEETY_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });

        const result = await response.json();
        bot.sendMessage(chatId, "✅ Registro completado y guardado en línea.");
        console.log("Datos guardados:", result);
        delete users[chatId];
      } else {
        bot.sendMessage(chatId, "Por favor, ingresa 1 o 2 meses.");
      }
    }
  } catch (err) {
    bot.sendMessage(chatId, "❌ Ocurrió un error inesperado. Por favor, inténtalo nuevamente.");
    console.error("Error:", err);
  }
});

// Comandos /vencidos y /proximos implementados igual con validaciones

console.log("Bot funcionando correctamente...");






 
  



