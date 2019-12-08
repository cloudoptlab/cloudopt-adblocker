/**
 * This is the interface file of the adblock engine.
 * @property {string} name The name of the engin.
 * @property {boolean} start The startup function of the engine. The engine must start through the start function.
 *                           It cannot run when the file is loaded.
 * @property {boolean} refresh By refresh method, the engine automatically loads the latest settings.
 * @property {boolean} stop Used to stop the engine.
 */

export default interface IAdblockEngine {
    readonly name: string,
    start: () => boolean,
    refresh: () => Promise<boolean>,
    stop: () => boolean
}
