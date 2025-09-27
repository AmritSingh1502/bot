import { Telegraf, Markup } from "telegraf";
// import { message } from 'telegraf/filters';
import { PrismaClient } from './generated/prisma';
import { Keypair } from "@solana/web3.js";

const prismaClient = new PrismaClient();

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN!);

const DEFAULT_KEYBOARD = Markup.inlineKeyboard([
    Markup.button.callback("show public key","public_key"),
    Markup.button.callback("show private key","private_key"),
])

bot.start(async (ctx) => {
    const existingUser = await prismaClient.users.findFirst({
        where: {
            tgUserId : ctx.from?.id.toString()
        }
    })
    if(existingUser){
        const publicKey  = existingUser.publicKey;

        ctx.reply(`Welcome tot the SinghXBot. Here is your public key ${publicKey}.`,{
            ...DEFAULT_KEYBOARD
        })
    }else {
         const keypair = Keypair.generate();
         await prismaClient.users.create({
            data : {
                    tgUserId : ctx.chat.id.toString(),
                    publicKey: keypair.publicKey.toBase58(),
                    privateKey: keypair.secretKey.toBase64()
            }
            
         })
         const publicKey  = keypair.publicKey.toString();
        ctx.reply(`Welcome tot the SinghXBot. Here is your public key ${publicKey}.Put some SOL in me::::`,{
            ...DEFAULT_KEYBOARD 
        })

    }
    
});

bot.action("public_key", async ctx => {
    const user = await prismaClient.users.findFirst({
        where: {
            tgUserId: ctx.chat?.id.toString()
        }
    })
    return ctx.reply(
        `Your Public key is ${user?.publicKey}`,{
            ...DEFAULT_KEYBOARD
        }
    );
});


bot.action("private_key", async ctx => {
    const user = await prismaClient.users.findFirst({
        where: {
            tgUserId: ctx.chat?.id.toString()
        }
    })
    return ctx.reply(
        `Your Private key is ${user?.privateKey}`,{
            ...DEFAULT_KEYBOARD
        }
    );
});

bot.launch();