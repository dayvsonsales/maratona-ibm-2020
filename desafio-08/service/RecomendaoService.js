const SpeechToTextV1 = require('ibm-watson/speech-to-text/v1');
const NaturalLanguageUnderstandingV1 = require('ibm-watson/natural-language-understanding/v1');

const { IamAuthenticator } = require('ibm-watson/auth');

/**
 * Analisa críticas contidas em um arquivo de áudio ou em um texto e recomenda um carro da FCA dependendo das críticas.
 * 
 *
 * car String Nome do carro sobre o qual o comentário ou crítica é feito.
 * text String Texto contendo uma crítica ou comentário sobre um carro. (optional)
 * audio File Áudio em formato FLAC contendo uma crítica ou comentário sobre um carro. (optional)
 * returns Result
 **/
exports.apiRecommendPOST = function(car, text, audio) {
  return new Promise(async function(resolve, reject) {
   
    try {
      const cars = [ "TORO", "DUCATO", "FIORINO", "CRONOS", "FIAT 500", "MAREA", "LINEA", "ARGO", "RENEGADE"];

      let returnedText = text;
  
      if (audio) {
        const speechToText = new SpeechToTextV1({
          authenticator: new IamAuthenticator({
            apikey: '',
          }),
          serviceUrl: 'https://api.us-south.speech-to-text.watson.cloud.ibm.com'
        });
        
        const recognizeParams = {
          audio: audio.buffer,
          contentType: 'audio/flac',
          wordAlternativesThreshold: 0.9,
          model: 'pt-BR_BroadbandModel'
        };
  
        const data = await speechToText.recognize(recognizeParams);
        returnedText = JSON.stringify(data.result.results[0].alternatives[0].transcript, null, 2);
  
        console.log(returnedText);
      }
  
      const naturalLanguageUnderstanding = new NaturalLanguageUnderstandingV1({
        version: '2020-08-01',
        authenticator: new IamAuthenticator({
          apikey: '',
        }),
        serviceUrl: 'https://api.us-south.natural-language-understanding.watson.cloud.ibm.com',
      });
  
      const analyzeParams = {
        'text': returnedText,
        'features': {
          "entities": {
            "model": "",
            "sentiment": true,
            "mentions": true,
          },
        },
      };
  
      const data = await naturalLanguageUnderstanding.analyze(analyzeParams);
  
      const onlyNegative = data.result.entities.filter((entity) => entity.sentiment.score < 0);
  
      const entities = data.result.entities.map((entity) => {
        return {
          entity: entity.type,
          sentiment: entity.sentiment.score,
          mention: entity.mentions[0] ? entity.mentions[0].text : ""
        }
      });
  
      if (onlyNegative.length === 0) {
        resolve({
          recommendation: "",
          entities
        });
      } else {
        entities.sort((a, b) => a.sentiment - b.sentiment);
  
        let recommendedCars = cars.filter((value) => value.toLowerCase() !== car.toLowerCase());
  
        resolve({
          recommendation: recommendedCars[Math.floor(Math.random() * recommendedCars.length)],
          entities
        });
      }
    } catch(e) {
      resolve({
        recommendation: "",
        entities: []
      });
    }

  });
}