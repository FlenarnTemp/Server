import fs from 'fs';

import Packet from '#jagex2/io/Packet.js';

export const CrcBuffer: Packet = new Packet(new Uint8Array(4 * 9));
export let CrcTable: number[] = [];
export let CrcBuffer32: number = 0;

function makeCrc(path: string) {
    if (!fs.existsSync(path)) {
        return;
    }

    const packet = Packet.load(path);
    const crc = Packet.getcrc(packet.data, 0, packet.data.length);
    CrcTable.push(crc);
    CrcBuffer.p4(crc);
}

export function makeCrcs() {
    CrcTable = [];

    CrcBuffer.pos = 0;
    CrcBuffer.p4(0);
    makeCrc('data/pack/client/title');
    makeCrc('data/pack/client/config');
    makeCrc('data/pack/client/interface');
    makeCrc('data/pack/client/media');
    makeCrc('data/pack/client/models');
    makeCrc('data/pack/client/textures');
    makeCrc('data/pack/client/wordenc');
    makeCrc('data/pack/client/sounds');

    CrcBuffer32 = Packet.getcrc(CrcBuffer.data, 0, CrcBuffer.data.length);
}

async function makeCrcAsync(path: string) {
    if (!(await fetch(path)).ok) {
        return;
    }

    const packet = await Packet.loadAsync(path);
    const crc = Packet.getcrc(packet.data, 0, packet.data.length);
    CrcTable.push(crc);
    CrcBuffer.p4(crc);
}

export async function makeCrcsAsync() {
    CrcTable = [];

    CrcBuffer.pos = 0;
    CrcBuffer.p4(0);
    await makeCrcAsync('data/pack/client/title');
    await makeCrcAsync('data/pack/client/config');
    await makeCrcAsync('data/pack/client/interface');
    await makeCrcAsync('data/pack/client/media');
    await makeCrcAsync('data/pack/client/models');
    await makeCrcAsync('data/pack/client/textures');
    await makeCrcAsync('data/pack/client/wordenc');
    await makeCrcAsync('data/pack/client/sounds');

    CrcBuffer32 = Packet.getcrc(CrcBuffer.data, 0, CrcBuffer.data.length);
}

if (typeof self === 'undefined') {
    if (fs.existsSync('data/pack/client/')) {
        makeCrcs();
    }
} else {
    if ((await fetch('data/pack/client')).ok) {
        await makeCrcsAsync();
    }
}
