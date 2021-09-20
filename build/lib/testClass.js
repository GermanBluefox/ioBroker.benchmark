"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TestUtils = void 0;
const promisify_child_process_1 = require("promisify-child-process");
class TestUtils {
    constructor(adapter) {
        this.adapter = adapter;
    }
    /**
     * Adds the desired number of instances in secondaryMode
     */
    async addInstances(nInstances, host) {
        for (let i = 1; i <= nInstances; i++) {
            await (0, promisify_child_process_1.exec)(`iobroker add benchmark ${i} --enabled false${host ? ` --host ${host}` : ''}`);
            // enable instance in secondaryMode
            const instObj = { common: { enabled: true }, native: { secondaryMode: true } };
            await this.adapter.extendForeignObjectAsync(`system.adapter.benchmark.${i}`, instObj);
            // give controller some time to actually start the instance
            await this.wait(500);
        }
    }
    /**
     * Removes the desired number of instances
     */
    async removeInstances(nInstances) {
        for (let i = 1; i <= nInstances; i++) {
            await (0, promisify_child_process_1.exec)(`iobroker del benchmark.${i}`);
        }
    }
    /**
     * Add Objects at given instance
     *
     * @param n - number of objects to be added
     * @param instanceNumber - number of the benchmark instance to add objects at
     */
    async addObjects(n, instanceNumber) {
        if (this.adapter.namespace === `benchmark.${instanceNumber}`) {
            // set objects locally
            for (let i = 0; i < n; i++) {
                await this.adapter.setObjectAsync(`test.${i}`, {
                    'type': 'state',
                    'common': {
                        name: i.toString(),
                        read: true,
                        write: true,
                        role: 'state',
                        type: 'number'
                    },
                    native: {}
                });
            }
        }
        else {
            await this.adapter.sendToAsync(`benchmark.${instanceNumber}`, 'objects', { cmd: 'set', n: n });
        }
    }
    /**
     * Add States at given instance
     *
     * @param n - number of states to be added
     * @param instanceNumber - number of the benchmark instance to add states at
     */
    async addStates(n, instanceNumber) {
        if (this.adapter.namespace === `benchmark.${instanceNumber}`) {
            for (let i = 0; i < n; i++) {
                await this.adapter.setStateAsync(`test.${i}`, i, true);
            }
        }
        else {
            await this.adapter.sendToAsync(`benchmark.${instanceNumber}`, 'states', { cmd: 'set', n: n });
        }
    }
    /**
     * Delete staes at given instance
     *
     * @param n - number of states to be deleted
     * @param instanceNumber - number of the benchmark instance to delete states from
     */
    async delStates(n, instanceNumber) {
        if (this.adapter.namespace === `benchmark.${instanceNumber}`) {
            // local
            for (let i = 0; i < n; i++) {
                await this.adapter.delStateAsync(`test.${i}`);
            }
        }
        else {
            await this.adapter.sendToAsync(`benchmark.${instanceNumber}`, 'states', { cmd: 'del', n: n });
        }
    }
    /**
     * Delete objects at given instance
     *
     * @param n - number of objects to be deleted
     * @param instanceNumber - number of the benchmark instance to delete objects from
     */
    async delObjects(n, instanceNumber) {
        if (this.adapter.namespace === `benchmark.${instanceNumber}`) {
            // local
            for (let i = 0; i < n; i++) {
                await this.adapter.delObjectAsync(`test.${i}`);
            }
        }
        else {
            await this.adapter.sendToAsync(`benchmark.${instanceNumber}`, 'objects', { cmd: 'del', n: n });
        }
    }
    /**
     * Start measuring a foreign instance to (eventLoopLag, ram, cpu)
     *
     * @param instanceNumber - number of the benchmark instance to add states at
     */
    async startMeasuringForeignInstance(instanceNumber) {
        await this.adapter.sendToAsync(`benchmark.${instanceNumber}`, 'startMeasuring', {});
    }
    /**
     * Stop measuring a foreign instance to (eventLoopLag, ram, cpu)
     *
     * @param instanceNumber - number of the benchmark instance to add states at
     */
    async stopMeasuringForeignInstance(instanceNumber) {
        await this.adapter.sendToAsync(`benchmark.${instanceNumber}`, 'stopMeasuring', {});
    }
    /**
     * Time to wait in ms
     */
    async wait(ms) {
        return new Promise(resolve => {
            setTimeout(() => {
                resolve();
            }, ms);
        });
    }
}
exports.TestUtils = TestUtils;
//# sourceMappingURL=testClass.js.map