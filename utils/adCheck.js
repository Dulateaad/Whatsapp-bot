function isAd(text) {
  const adWords = ["продам", "скидка", "акция", "подписывайся", "реклама", "ссылка", "цена", "пиши в лс", "telegram.me", "insta", "инстаграм", "whatsapp"];
  const lowered = text.toLowerCase();
  return adWords.some(word => lowered.includes(word));
}

module.exports = { isAd };
