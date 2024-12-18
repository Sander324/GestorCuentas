import fetch from 'node-fetch';
import TelegramBot from 'node-telegram-bot-api';

const TOKEN = '7599915084:AAHA-m-jQiJLygYA6EPtu8Sxb8qvnHyVWzc'; // Token del bot
const SHEETY_URL = 'https://api.sheety.co/8465d5ff8c6bbdc820dfdecd6b045c13/gestorDeCuentas/hoja1'; // URL de Sheety

const bot = new TelegramBot(TOKEN, { polling: true });

let users = []; // Para almacenar temporalmente los datos de usuarios durante el registro

// Mapa de plataformas
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

  if (users[chatId]?.step === 1) {
    users[chatId].name = text;
    users[chatId].step = 2;
    bot.sendMessage(chatId, "Selecciona la plataforma:\n1. Netflix\n2. Disney\n3. Prime Video\n4. Crunchyroll\n5. Pixel TV");
  } else if (users[chatId]?.step === 2) {
    const platformNumber = parseInt(text);
    if (PLATFORMS[platformNumber]) {
      users[chatId].platform = PLATFORMS[platformNumber]; // Guarda el nombre de la plataforma
      users[chatId].step = 3;
      bot.sendMessage(chatId, "¿Cuántos meses deseas asignar (1 o 2)?");
    } else {
      bot.sendMessage(chatId, "Por favor, selecciona una plataforma válida (1-5).");
    }
  } else if (users[chatId]?.step === 3) {
    const months = parseInt(text);
    if (months === 1 || months === 2) {
      const days = months * 30;
      const startDate = new Date();
      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + days);
      const daysRemaining = days;

      const data = {
        hoja1: {
          nombre: users[chatId].name,
          plataforma: users[chatId].platform,
          dias: days,
          fechaInicio: startDate.toISOString().split('T')[0],
          fechaVencimiento: endDate.toISOString().split('T')[0],
          diasRestantes: daysRemaining
        }
      };

      try {
        const response = await fetch(SHEETY_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });

        const result = await response.json();
        bot.sendMessage(chatId, "✅ Registro completado y guardado en línea.");
        console.log("Datos guardados:", result);
      } catch (err) {
        bot.sendMessage(chatId, "❌ Error al guardar los datos.");
        console.error("Error:", err);
      }

      delete users[chatId]; // Limpia el registro temporal
    } else {
      bot.sendMessage(chatId, "Por favor, ingresa 1 o 2 meses.");
    }
  }
});

// Comando /vencidos
bot.onText(/\/vencidos/, async (msg) => {
  const chatId = msg.chat.id;

  try {
    const response = await fetch(SHEETY_URL);
    const data = await response.json();

    const today = new Date();
    const vencidos = data.hoja1.filter((user) => {
      const vencimiento = new Date(user.fechaVencimiento);
      return vencimiento < today;
    });

    if (vencidos.length > 0) {
      let message = "📋 Usuarios vencidos:\n";
      vencidos.forEach((user) => {
        message += `- ${user.nombre} (${user.plataforma}) - Venció el: ${user.fechaVencimiento}\n`;
      });
      bot.sendMessage(chatId, message);
    } else {
      bot.sendMessage(chatId, "✅ No hay usuarios vencidos.");
    }
  } catch (err) {
    bot.sendMessage(chatId, "❌ Error al obtener los usuarios vencidos.");
    console.error("Error:", err);
  }
});

// Comando /proximos
bot.onText(/\/proximos/, async (msg) => {
  const chatId = msg.chat.id;

  try {
    const response = await fetch(SHEETY_URL);
    const data = await response.json();

    const today = new Date();
    const threeDaysFromNow = new Date(today);
    threeDaysFromNow.setDate(today.getDate() + 3);

    const proximos = data.hoja1.filter((user) => {
      const vencimiento = new Date(user.fechaVencimiento);
      return vencimiento >= today && vencimiento <= threeDaysFromNow;
    });

    if (proximos.length > 0) {
      let message = "⏳ Usuarios próximos a vencer:\n";
      proximos.forEach((user) => {
        message += `- ${user.nombre} (${user.plataforma}) - Vence el: ${user.fechaVencimiento}\n`;
      });
      bot.sendMessage(chatId, message);
    } else {
      bot.sendMessage(chatId, "✅ No hay usuarios próximos a vencer.");
    }
  } catch (err) {
    bot.sendMessage(chatId, "❌ Error al obtener los usuarios próximos a vencer.");
    console.error("Error:", err);
  }
const express = require('express');

const app = express();
const PORT = process.env.PORT || 3000; // Usa el puerto que Render asigna dinámicamente o 3000

app.get('/', (req, res) => {
  res.send('Bot funcionando...'); // Respuesta básica para Render
});

app.listen(PORT, () => {
  console.log(`Servidor Express escuchando en el puerto ${PORT}`);
});

// Lógica principal del bot aquí
console.log("Bot funcionando...");
 
  



