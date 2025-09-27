import { Telegraf } from "telegraf";
import { message } from 'telegraf/filters';
import { PrismaClient } from './generated/prisma';


const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN!);

bot.start((ctx) => {

    ctx.reply(`Welcome tot the SinghXBot. Here is your public key ${publicKey}`)
});

bot.launch();