import { System } from "../System";
import { Hardware } from "./Hardware";
import { ClockListener } from "./imp/ClockListener";

export class Clock extends Hardware {

    debug: boolean = false;

    //keep track of clock listeners
    //store them
    //start when system starts

    private listeners: ClockListener[] = [];
    private setIntervalId: NodeJS.Timeout | null = null;
    private clockInterval: number;

    constructor(clockInterval: number) {
        super(0, "Clock");
        this.clockInterval = clockInterval;
    }

    public registerListener(listener: ClockListener) {
        this.listeners.push(listener);
    }

    public startClock() {
        if (this.setIntervalId == null) {
            this.setIntervalId = setInterval(() => {
                this.pulseAll();
            }, this.clockInterval);
        }
    }

    public stopClock(): void {
        if (this.setIntervalId !== null) {
            clearInterval(this.setIntervalId);
            this.setIntervalId = null;
            this.log("Clock stoped.");
        }
    }

    private pulseAll() {
        if (this.debug) {
            console.log("Clock pulse sent");
        }
        this.listeners.forEach(listener => {
            //console.log("Pulsing:", (listener as any).name ?? "[unknown]");
            listener.pulse();
        });
    }


}