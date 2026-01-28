
const { SPORTS_DICTIONARY } = require('./src/utils/sportsDictionaryMaster.js');

const platforms = ['healthConnect', 'fitbit', 'garmin', 'apple', 'googleFit', 'samsung', 'huawei', 'xiaomi'];

platforms.forEach(platform => {
    const ids = {};
    console.log(`\n--- Checking ${platform} ---`);

    for (const [key, data] of Object.entries(SPORTS_DICTIONARY)) {
        const id = data[platform];
        if (id !== null && id !== undefined && id !== '--') {
            if (ids[id]) {
                ids[id].push(key);
            } else {
                ids[id] = [key];
            }
        }
    }

    let found = false;
    for (const [id, keys] of Object.entries(ids)) {
        if (keys.length > 1) {
            console.log(`⚠️ ID Collision: "${id}" is used by [${keys.join(', ')}]`);
            found = true;
        }
    }
    if (!found) console.log('✅ No collisions found.');
});
