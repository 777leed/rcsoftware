export function initializeIndexedDB(dbName, dbVersion, objectStoreName, initCallback) {
    const request = indexedDB.open(dbName, dbVersion);

    request.onupgradeneeded = (event) => {
        const db = event.target.result;
        db.createObjectStore(objectStoreName, { keyPath: 'id' });
    };

    request.onsuccess = (event) => {
        const db = event.target.result;
        console.log('Database opened successfully');
        if (initCallback) {
            initCallback(db);
        }
    };

    request.onerror = (event) => {
        console.error('Error opening database:', event.target.error);
    };
}


