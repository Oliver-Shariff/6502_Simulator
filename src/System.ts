// import statements for hardware
import { Cpu } from "./hardware/Cpu";
import { Hardware } from "./hardware/Hardware";
import { Memory } from "./hardware/Memory";
import { Clock } from "./hardware/Clock";
import { MMU } from "./hardware/MMU";
import { Ascii } from "./hardware/Ascii";
import { InterruptController } from "./hardware/InterruptController";
import { Keyboard } from "./hardware/Keyboard";
import { Console } from "./hardware/Console";

/*
    Constants
 */
// Initialization Parameters for Hardware
// Clock cycle interval
const CLOCK_INTERVAL = 100;               // This is in ms (milliseconds) so 1000 = 1 second, 100 = 1/10 second
// A setting of 100 is equivalent to 10hz, 1 would be 1,000hz or 1khz,
// .001 would be 1,000,000 or 1mhz. Obviously you will want to keep this
// small, I recommend a setting of 100, if you want to slow things down
// make it larger.


export class System extends Hardware {

    private _CPU: Cpu = null;
    public running: boolean = false;
    private _Memory;
    private _Clock: Clock;
    private _MMU: MMU;
    private _ASCII: Ascii;
    private _IC: InterruptController;
    private _Keyboard: Keyboard;
    private _CON: Console;


    constructor() {
        super(0, "System");

        this._Memory = new Memory();
        this._Clock = new Clock(CLOCK_INTERVAL);
        this._MMU = new MMU(this._Memory);
        this._ASCII = new Ascii();
        this._IC = new InterruptController();
        this._CON = new Console(this._MMU, this._ASCII, this._IC)
        this._CPU = new Cpu(this._MMU, this._IC, this._ASCII, this._CON);

        this._Keyboard = new Keyboard(this._IC)
        this._IC.addDevice(this._Keyboard);
        this._IC.addDevice(this._CON);

        /*
        Start the system (Analogous to pressing the power button and having voltages flow through the components)
        When power is applied to the system clock, it begins sending pulses to all clock observing hardware
        components so they can act on each clock cycle.
         */

        this._Clock.registerListener(this._CPU);
        this._Clock.registerListener(this._Memory);
        this._Clock.registerListener(this._IC);
        this._Clock.registerListener(this._ASCII);

        this.startSystem();

    }

    public startSystem(): boolean {
        this._CPU.debug = true;
        this._CON.debug = true;

        this.log("Created");
        this._CPU.log('Created')
        //initalize memory with all zeros
        for (let i = 0; i < 0x10000; i++) {
            this._Memory.memArr[i] = 0x00;
        }
        const testProgram = [
            0xA9, 0x00, 0x8D, 0x40, 0x00, 0xA9, 0x01, 0x6D, 0x40, 0x00, 0x8D, 0x40, 0x00, 0xA8,
            0xA2, 0x01, 0xFF, 0xD0, 0xF4, 0x00];

        this._MMU.loadProgram(testProgram);
        this._MMU.memoryDump(0, 10);

        this._Clock.startClock();
        return true;
    }

    public stopSystem(): boolean {
        this.log("System stopped");
        this._Clock.stopClock();
        this.running = false

        return true;

    }
}

export let system: System = new System();
