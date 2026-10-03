const { MongoMemoryServer } = require('mongodb-memory-server');
const net = require('net');
const path = require('path');
const fs = require('fs');

let mongod = null;

const isPortInUse = (port) => {
  return new Promise((resolve) => {
    const server = net.createServer()
      .once('error', (err) => {
        if (err.code === 'EADDRINUSE') {
          resolve(true);
        } else {
          resolve(false);
        }
      })
      .once('listening', () => {
        server.close();
        resolve(false);
      })
      .listen(port);
  });
};

const startMemoryServer = async () => {
  try {
    const port = 27017;
    const inUse = await isPortInUse(port);
    
    if (inUse) {
      console.log(`📡 Port ${port} is already in use. Assuming a MongoDB server is already running.`);
      return null;
    }

    const dbPath = path.join(__dirname, 'data', 'db');
    if (!fs.existsSync(dbPath)) {
      fs.mkdirSync(dbPath, { recursive: true });
    }

    console.log(`🚀 Starting persistent MongoDB server on port ${port}...`);
    mongod = await MongoMemoryServer.create({
      instance: {
        port: port,
        dbName: 'motorbike_researcher',
        dbPath: dbPath,
        storageEngine: 'wiredTiger'
      }
    });

    const uri = mongod.getUri();
    console.log(`✅ In-memory MongoDB server started: ${uri}`);
    return mongod;
  } catch (err) {
    console.error('❌ Error starting in-memory MongoDB:', err.message);
    return null;
  }
};

const stopMemoryServer = async () => {
  if (mongod) {
    await mongod.stop();
    console.log('🛑 In-memory MongoDB server stopped.');
  }
};

module.exports = {
  start: startMemoryServer,
  stop: stopMemoryServer
};
