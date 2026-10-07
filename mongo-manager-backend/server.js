const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// String de conexão padrão com seu MongoDB local
const MONGO_URI = 'mongodb://localhost:27017';
let client;

async function connectMongo() {
  if (!client) {
    client = new MongoClient(MONGO_URI);
    await client.connect();
    console.log(' Conectado ao MongoDB local!');
  }
  return client;
}

// Rota para listar bancos e coleções
app.get('/api/databases', async (req, res) => {
  try {
    const mongo = await connectMongo();
    const adminDb = mongo.db().admin();
    const { databases } = await adminDb.listDatabases();
    
    const result = [];
    for (const dbInfo of databases) {
      const db = mongo.db(dbInfo.name);
      const collections = await db.listCollections().toArray();
      result.push({
        name: dbInfo.name,
        collections: collections.map(c => ({ name: c.name }))
      });
    }
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Rota para buscar documentos de uma coleção
app.get('/api/data/:db/:collection', async (req, res) => {
  try {
    const { db, collection } = req.params;
    const mongo = await connectMongo();
    const docs = await mongo.db(db).collection(collection).find({}).limit(100).toArray();
    res.json(docs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Rota para inserir um documento
app.post('/api/data/:db/:collection', async (req, res) => {
  try {
    const { db, collection } = req.params;
    const mongo = await connectMongo();
    const result = await mongo.db(db).collection(collection).insertOne(req.body);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(3000, () => {
  console.log('Servidor intermediário rodando em http://localhost:3000');
});