const mqtt = require('mqtt')
const client  = mqtt.connect('mqtt://tnt-iot.maratona.dev:30573', { 
    username: 'maratoners',
    password: 'ndsjknvkdnvjsbvj'
});

let count = 0;
let indexes = [];
const startTime = new Date();

const fs = require('fs');
const path = require('path');

client.on('connect', function () {
  client.subscribe('tnt', function (err) {
    if(err)
        console.log(err);
    console.log("estou conectado");
  })
});
 
client.on('message', function (topic, message) {
  const receivedTime = new Date();

  console.log("Recebido...", receivedTime);

  const data = JSON.parse(message.toString());

  indexes = JSON.parse(fs.readFileSync(path.join(__dirname, "rows.json")));

  if(!indexes.includes(data["row"])){
      count += 1;
      indexes.push(data["row"]);

      console.log("Indexado: ", message.toString());

      fs.appendFileSync(path.join(__dirname, "dataset.csv"), 
  `${data["Tempo"]},${data["Estação"]},${data["LAT"]},${data["LONG"]},${data["Movimentação"]},${data["Original_473"]},${data["Original_269"]},${data["Zero"]},${data["Maçã-Verde"]},${data["Tangerina"]},${data["Citrus"]},${data["Açaí-Guaraná"]},${data["Pêssego"]},${data["TARGET"]}\n`);

    console.log("duração: milisegundos ", (new Date().getTime() - receivedTime.getTime()));
    console.log("Adicionados até agora: ", count);
    console.log("duração total: ", (-1*(startTime.getTime() - new Date().getTime()))/60000);
  }

  fs.writeFileSync(path.join(__dirname, "rows.json"), JSON.stringify(indexes));
  
});