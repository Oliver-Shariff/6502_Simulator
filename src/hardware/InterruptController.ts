import { Hardware } from "./Hardware";
import { ClockListener } from "./imp/ClockListener";
import { Interrupt } from "./imp/Interrupt";

export class InterruptController extends Hardware implements ClockListener {

    /***
     * track all hardware that can generate interrupts
     * track all interrupts
     * on pulse, give highest priority interrupt ot CPU
     * --implement this on keyboard
     * 
     * 
     */

    private devices: Array<Hardware> = [];
    private interruptQueue: Array<Interrupt> = [];

    constructor() {
        super(0, "IC");
    }

    public pulse(): void {

    }

    public addDevice(device: Hardware): void {
        this.devices.push(device);
    }

    public getDevices(): Array<Hardware> {
        return this.devices;
    }

    public interruptCheck(): Interrupt | void {
        this.sortInterrupts();
        if (this.interruptQueue.length == 0) {
            return;
        }
        return this.interruptQueue.shift();
    }

    public getInterrupt(instance: Interrupt): void {
        this.interruptQueue.push(instance);
        this.sortInterrupts();
    }

    public sortInterrupts(): void {
        this.interruptQueue.sort((a: Interrupt, b: Interrupt) => a.priority - b.priority);
    }


}