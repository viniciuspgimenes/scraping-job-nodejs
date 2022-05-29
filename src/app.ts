import axios from 'axios';
import cheerio from 'cheerio';
import Cheerio = cheerio.Cheerio;

const AxiosInstance = axios.create();

interface CryptoExtraction {
    extractedAt: number;
    value: number;
}

interface Crypto {
    id: number;
    name: string;
    shortName: string;
}

interface CryptoResponse {
    data: Crypto[]
}

const apiUrl = 'http://localhost:8000';

async function getAllCryptos(): Promise<CryptoResponse> {
    return AxiosInstance.get(`${apiUrl}/api/cryptos/`)
}

async function scrapeCryptoPage(crypto: Crypto): Promise<CryptoExtraction> {
    const url = `https://br.investing.com/crypto/${crypto.name.toLowerCase().replace(' ', '-')}`;
    console.log('url', url);
    const response = await AxiosInstance.get(url);
    const html = response.data;
    const $ = cheerio.load(html);
    const cryptoExtraction: CryptoExtraction = {} as CryptoExtraction;
    const cryptoData: Cheerio = $('.top.bold.inlineblock');
    const cryptoValue = cryptoData.find('#last_last').text();
    cryptoExtraction.value = Number(cryptoValue.replace('.', '').replace(',', '.'));
    cryptoExtraction.extractedAt = Date.now();
    return cryptoExtraction;
}

async function updateCryptoValue(crypto: Crypto, cryptoExtraction: CryptoExtraction) {
    AxiosInstance.post(`${apiUrl}/api/cryptos/${crypto.id}/variations`,
        {
            "value": cryptoExtraction.value,
            "extractedAt": cryptoExtraction.extractedAt
        })
        .then(() => console.log(`${crypto.name}: updated`))
        .catch(() => console.error(`${crypto.name}: error on update`));
}

setInterval(() => {
    getAllCryptos()
        .then(({ data }) => data.forEach(crypto =>
            scrapeCryptoPage(crypto)
                .then(cryptoExtraction =>
                    updateCryptoValue(crypto, cryptoExtraction).then())
                .catch(console.error)));
}, 1500);