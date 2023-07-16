import Packet from '#jagex2/io/Packet.js';
import fs from 'fs';
import { ConfigType } from "#lostcity/cache/ConfigType.js";

export default class LocType extends ConfigType {
    static configNames: Map<string, number> = new Map();

    static configs: LocType[] = [];

    static load(dir: string) {
        LocType.configNames = new Map();
        LocType.configs = [];

        if (!fs.existsSync(`${dir}/loc.dat`)) {
            console.log('Warning: No loc.dat found.');
            return;
        }

        let dat = Packet.load(`${dir}/loc.dat`);
        let count = dat.g2();

        for (let id = 0; id < count; id++) {
            let config = new LocType(id);
            config.active = -1; // so we can infer if active should be automatically determined based on loc shape/ops available
            config.decodeType(dat);

            if (config.active === -1) {
                config.active = (config.shapes.length > 0 && config.shapes[0] === 10) ? 1 : 0;

                if (config.ops.length > 0) {
                    config.active = 1;
                }
            }

            LocType.configs[id] = config;

            if (config.debugname) {
                LocType.configNames.set(config.debugname, id);
            }
        }
    }

    static get(id: number) {
        return LocType.configs[id] ?? new LocType(id);
    }

    static getId(name: string) {
        return LocType.configNames.get(name);
    }

    static getByName(name: string) {
        let id = this.getId(name);
        if (id === undefined || id === -1) {
            return null;
        }

        return this.get(id);
    }

    // ----
    models: number[] = [];
    shapes: number[] = [];
    name: string | null = null;
    desc: string | null = null;
    recol_s: number[] = [];
    recol_d: number[] = [];
    width = 1;
    length = 1;
    blockwalk = true;
    blockrange = true;
    active = 0; // not -1 here just in case an new LocType is created, we want to default to "false"
    hillskew = false;
    sharelight = false;
    occlude = false;
    anim = -1;
    hasalpha = false;
    walloff = 16;
    ambient = 0;
    contrast = 0;
    ops: string[] = [];
    mapfunction = -1;
    mapscene = -1;
    mirror = false;
    shadow = true;
    resizex = 128;
    resizey = 128;
    resizez = 128;
    forceapproach = 0;
    xoff = 0;
    yoff = 0;
    zoff = 0;
    forcedecor = false;

    // server-side
    category = -1;
    params = new Map();
    
    decode(opcode: number, packet: Packet) {
        if (opcode === 1) {
            let count = packet.g1();

            for (let i = 0; i < count; i++) {
                this.models[i] = packet.g2();
                this.shapes[i] = packet.g1();
            }
        } else if (opcode === 2) {
            this.name = packet.gjstr();
        } else if (opcode === 3) {
            this.desc = packet.gjstr();
        } else if (opcode === 14) {
            this.width = packet.g1();
        } else if (opcode === 15) {
            this.length = packet.g1();
        } else if (opcode === 17) {
            this.blockwalk = false;
        } else if (opcode === 18) {
            this.blockrange = false;
        } else if (opcode === 19) {
            this.active = packet.g1();
        } else if (opcode === 21) {
            this.hillskew = true;
        } else if (opcode === 22) {
            this.sharelight = true;
        } else if (opcode === 23) {
            this.occlude = true;
        } else if (opcode === 24) {
            this.anim = packet.g2();

            if (this.anim == 65535) {
                this.anim = -1;
            }
        } else if (opcode === 25) {
            this.hasalpha = true;
        } else if (opcode === 28) {
            this.walloff = packet.g1();
        } else if (opcode === 29) {
            this.ambient = packet.g1s();
        } else if (opcode === 39) {
            this.contrast = packet.g1s();
        } else if (opcode >= 30 && opcode < 35) {
            this.ops[opcode - 30] = packet.gjstr();
        } else if (opcode === 40) {
            let count = packet.g1();

            for (let i = 0; i < count; i++) {
                this.recol_s[i] = packet.g2();
                this.recol_d[i] = packet.g2();
            }
        } else if (opcode === 60) {
            this.mapfunction = packet.g2();
        } else if (opcode === 62) {
            this.mirror = true;
        } else if (opcode === 64) {
            this.shadow = false;
        } else if (opcode === 65) {
            this.resizex = packet.g2();
        } else if (opcode === 66) {
            this.resizey = packet.g2();
        } else if (opcode === 67) {
            this.resizez = packet.g2();
        } else if (opcode === 68) {
            this.mapscene = packet.g2();
        } else if (opcode === 69) {
            this.forceapproach = packet.g1();
        } else if (opcode === 70) {
            this.xoff = packet.g2s();
        } else if (opcode === 71) {
            this.yoff = packet.g2s();
        } else if (opcode === 72) {
            this.zoff = packet.g2s();
        } else if (opcode === 73) {
            this.forcedecor = true;
        } else if (opcode === 200) {
            this.category = packet.g2();
        } else if (opcode === 249) {
            let count = packet.g1();

            for (let i = 0; i < count; i++) {
                let key = packet.g3();
                let isString = packet.gbool();

                if (isString) {
                    this.params.set(key, packet.gjstr());
                } else {
                    this.params.set(key, packet.g4s());
                }
            }
        } else if (opcode === 250) {
            this.debugname = packet.gjstr();
        } else {
            console.error(`Unrecognized loc config code: ${opcode}`);
        }
    }
}