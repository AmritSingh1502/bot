import { Telegraf, Markup } from "telegraf";
// import { message } from 'telegraf/filters';
import { PrismaClient } from './generated/prisma';
import { Keypair,Connection } from "@solana/web3.js";
import { getBalanceMessage } from './solana'
import { use } from "react";

const connection = new Connection(process.env.RPC_URL!);

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
        const { empty, message } = await getBalanceMessage(existingUser.publicKey.toString());

        ctx.reply(`Welcome tot the SinghXBot. Here is your public key ${publicKey}.
            ${empty ? "Your wallet is empty please fund it to trade on SOL" : message}`,{
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
        ctx.reply(`Welcome tot the SinghXBot. Here is your public key ${publicKey}.Put some SOL in me::::.`,{
            ...DEFAULT_KEYBOARD 
        })

    }
    
});

bot.action("public_key", async ctx => {
    const existingUser = await prismaClient.users.findFirst({
        where: {
            tgUserId: ctx.chat?.id.toString()
        }
    })
    if(!existingUser){
        return ctx.reply("User not found!!!",{...DEFAULT_KEYBOARD});
    }
    const { empty, message } = await getBalanceMessage(existingUser.publicKey.toString());

    return ctx.reply(
        `Your Public key is ${existingUser?.publicKey}. ${empty ? "Fund your wallet to trade" : message}`,{
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