export function assertion(expr, errorMessage, chatId, client) {
    if(!expr){
        client.sendText(chatId,errorMessage)
    }
}