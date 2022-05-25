import axios from 'axios';
import cheerio from 'cheerio';
import Cheerio = cheerio.Cheerio;

const url = 'https://br.investing.com/crypto/dogecoin';
const AxiosInstance = axios.create();

interface Crypto {
    name: string;
    shortName: string;
    extractionTime: number;
    variation: string;
    value: number;
}

AxiosInstance.get(url)
    .then(response => {
        const html = response.data;
        const $ = cheerio.load(html);
        const crypto: Crypto = {} as Crypto;
        const cryptoData: Cheerio = $('.top.bold.inlineblock');
        const cryptoValue = cryptoData.find('#last_last').text();
        const parsedCryptoValue = Number(cryptoValue.replace(',', '.'));
        crypto.name = $('.float_lang_base_1.relativeAttr').text();
        crypto.value = parsedCryptoValue;
        crypto.extractionTime = Date.now();
        console.log(crypto);
    })
    .catch(console.error);