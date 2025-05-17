import { system } from "../System";
import { Hardware } from "./Hardware";
import { InterruptController } from "./InterruptController";
import { Console } from "./Console";

import { ClockListener } from "./imp/ClockListener";
import { MMU } from "./MMU"
import { Ascii } from "./Ascii";


export class Cpu extends Hardware implements ClockListener {

    //debugging flags
    private clockDebug: boolean = false;
    private statusDebug: boolean = false;
    private stepDebug: boolean = false;


    private MMU: MMU
    private cpuClockCount: number;
    private IC: InterruptController;
    private console: Console;
    private ascii: Ascii;



    private accumulator: number = 0x00;
    private x_reg: number = 0x00;
    private y_reg: number = 0x00;
    private inst_reg: number = 0x00;
    private program_counter: number = 0x00;
    private z_flag: boolean = false;
    private step: number = 0;
    private tempValue: number;
    private LOB: number;
    private HOB: number;


    constructor(mmu: MMU, ic: InterruptController, ascii: Ascii, console: Console) {
        super(0, "CPU");
        this.cpuClockCount = 0;
        this.MMU = mmu;
        this.IC = ic;
        this.console = console;
        this.ascii = ascii;

    }

    public pulse() {
        this.cpuClockCount++;
        if (this.clockDebug == true) {
            console.log("received clock pulse - CPU Clock Count: " + this.cpuClockCount);
        }
        if (this.statusDebug) {
            console.log(this.status());

        }
        this.pipeline();
    }

    /**
     * Functions needed
     * 
     * fetch
     *  -occurs on all instructions
     *  -
     * decode1
     * decode2
     * execute1
     * execute2
     * writeback
     * interrupt
     * 
     * two step cycles (decode and execute) might be condensed into one function
     *
     * we can execute these functions based on the step
     * skip over steps based on the instruction if needed
     */

    private pipeline(): void {
        switch (this.step) {
            case (0):
                //Fetch is always required
                this.fetch()
                break;
            case (1):
                //do stuff
                this.decode1();
                break;
            case (2):
                //do stuff
                this.decode2();
                break;
            case (3):
                //do stuff
                this.execute1();
                break;
            case (4):
                //do stuff
                this.execute2()
                break;
            case (5):
                //do stuff
                this.writeBack();
                break;
            case (6):
                //do stuff
                //interrupt check
                this.interruptCheck();
                break;
        }
    }

    private fetch(): void {
        if (!this.MMU) throw new Error("MMU is undefined in CPU");
        this.inst_reg = this.MMU.readImmediate(this.program_counter);
        this.program_counter++;
        this.step++; //this will take us to decode1
    }

    private decode1(): void {
        switch (this.inst_reg) {
            /**
            * enumerate every instruction
            * these can be organized futher in blocks, case statements allow fall through
            * Scenarios
            *   -put a constant somewhere
            *   - work with mem (need to deal with LOB and HOB)
            *   - skip and jump to execute
            */
            case (0x8A): { }
            case (0x98): { }
            case (0xAA): { }
            case (0xA8): { }
            case (0xEA): { 
                this.step = 3;
                break;
            }
            case (0x00): {
                //jump to execute
                this.program_counter++;
                this.step = 3;
                break;
            }

            case (0xA9): { }
            case (0xA2): { }
            case (0xA0): { }
            case (0xD0): {
                this.tempValue = this.MMU.readImmediate(this.program_counter);
                this.program_counter++;
                this.step = 3;
                break
            }

            case (0xAD): { }
            case (0x8D): { }
            case (0x6D): { }
            case (0xAE): { }
            case (0xAC): { }
            case (0xEC): { }
            case (0xEE): {
                //program counter holds pointer to low order byte
                //increment counter and step, pass to decode2, then access high order byte
                //execute needs both of these combined to ask MMU for contents at LE address
                //I can hold the low order byte in CPU then pass both to MMU.setAddressLE()
                //or create a field in MMU to hold Low order and high order
                //Which is conceptually correct?
                //research says CPU should hold it
                this.LOB = this.MMU.readImmediate(this.program_counter);
                this.program_counter++;
                this.step++;
                break;
            }

            // handle this later
            case (0xFF): {
                if (this.x_reg === 0x03) {
                    this.LOB = this.MMU.readImmediate(this.program_counter);
                    this.program_counter++
                    this.step++
                    break;
                }
                else { //xreg = 1 | 2
                    this.step = 3;
                    break;
                }

            }
            default: {

                this.log(`Error: instruction ${this.inst_reg} is invalid for decode1`);
                this.step = 6;
                break;
            }
        }
    }
    private decode2(): void {
        switch (this.inst_reg) {

            case (0xAD): { }
            case (0x8D): { }
            case (0x6D): { }
            case (0xAE): { }
            case (0xAC): { }
            case (0xEC): { }
            case (0xEE): {
                this.HOB = this.MMU.readImmediate(this.program_counter);
                this.program_counter++;
                this.step++;
                break;

            }

            case (0xFF): {
                //x reg = 3 
                this.HOB = this.MMU.readImmediate(this.program_counter);
                this.program_counter++
                this.step++
                break;

            }
            default: {

                this.log(`Error: instruction ${this.inst_reg} is invalid for decode2`);
                this.step = 6;
                break;
            }
        }


    }
    private execute1(): void {
        switch (this.inst_reg) {
            /**
             * main questions:
             *  -Do we need write back?
             *  -Do we need execute2 (can instr be completed in 1 step)?
             */

            case (0x8A): {
                this.accumulator = this.x_reg
                this.step = 6;
                break;
            }
            case (0x98): {
                this.accumulator = this.y_reg;
                this.step = 6;
                break;
            }
            case (0xAA): {
                this.x_reg = this.accumulator;
                this.step = 6;
                break;
            }
            case (0xA8): {
                this.y_reg = this.accumulator;
                this.step = 6;
                break;

            }
            case (0xEA): {
                this.step = 6;
                break;
            }
            case (0x00): {
                system.stopSystem();
                break;
            }
            case (0xA9): {
                this.accumulator = this.tempValue;
                this.step = 6;
                break;
            }
            case (0xA2): {
                this.x_reg = this.tempValue;
                this.step = 6;
                break;
            }
            case (0xA0): {
                this.y_reg = this.tempValue;
                this.step = 6;
                break;
            }
            case (0xD0): {
                if (!this.z_flag) {
                    const offset = this.tempValue & 0xFF;
                    // signed 8-bit value
                    const signedOffset = offset < 0x80 ? offset : offset - 0x100;
                    this.program_counter += signedOffset;
                }
                this.step = 6;
                break;
            }

            case (0xAD): {
                this.accumulator = this.MMU.dataFromLE(this.LOB, this.HOB);
                this.step = 6;
                break;
            }
            case (0x8D): {
                this.step = 5;
                break;
            }
            case (0x6D): {
                this.tempValue = this.MMU.dataFromLE(this.LOB, this.HOB);
                this.step++;
                break;
            }
            case (0xAE): {
                this.x_reg = this.tempValue;
                this.step = 6;
                break;
            }
            case (0xAC): {
                this.y_reg = this.MMU.dataFromLE(this.LOB, this.HOB);
                this.step = 6;
                break;
            }
            case (0xEC): {
                this.tempValue = this.MMU.dataFromLE(this.LOB, this.HOB);
                this.step++;
                break;
            }
            case (0xEE): {
                this.accumulator = this.MMU.dataFromLE(this.LOB, this.HOB);
                this.step++;
                break;
            }
            case (0xFF): {
                if (this.x_reg === 0x01) {
                    //output integer in y_reg
                    this.console.takeOutput(this.y_reg);
                    this.step = 6;
                }
                else if (this.x_reg === 0x02) {
                    //output the null terminate string stored at address in y_reg
                    this.HOB = this.program_counter >> 8;
                    this.step++;
                }
                else if (this.x_reg == 0x03) {
                    //Print the null terminated string from the address in the operand
                    if (this.console.printString((this.HOB << 8) | this.LOB)) {
                        this.step = 6;
                    }
                }
                else{
                    this.log("SYS call unhandled");
                    this.step = 6;
                }

                break;
            }

            default: {

                this.log(`Error: instruction ${this.inst_reg} is invalid for execute1`);
                console.log("IC type:", this.IC?.constructor.name);
                console.log("IC keys:", Object.keys(this.IC || {}));
                this.step = 6;
                break;
            }
        }
    }

    private execute2(): void {
        switch (this.inst_reg) {
            case (0x6D): {
                this.accumulator += this.tempValue;
                //handle overflow here
                this.step = 6;
                break;
            }
            case (0xEC): {
                if (this.tempValue == this.MMU.dataFromLE(this.LOB, this.HOB)) {
                    this.z_flag = true;
                }
                else {
                    this.z_flag = false;
                }
                this.step = 6;
                break;
            }
            case (0xEE): {
                this.accumulator++;
                this.step++;
                break;
            }
            case (0xFF): { //x_reg = 2
                this.LOB = this.program_counter >> 8;
                if (this.console.printString((this.HOB << 8) | this.LOB)) {
                    this.step = 6;
                }
                break;
            }

            default: {
                this.log(`Error: instruction ${this.inst_reg} is invalid for execute2`);
                this.step = 6;
                break;
            }
        }
    }
    private writeBack(): void {
        this.MMU.setAddressLE(this.LOB, this.HOB);
        this.MMU.setData(this.accumulator);
        this.MMU.write();
        this.step++;

    }
    private interruptCheck(): void {
        let interrupt = this.IC.interruptCheck();

        if (interrupt) {
            if (interrupt.name == "Keyboard") {
                // keys pressed go into buffer
                // shift() return top item of buffer
                let key = interrupt.outputBuffer.shift();
                // do something with this key?
            }
            else if (interrupt.name === "console") {
                this.console.printBuffer();
            }

        }
        this.step = 0;
    }

    private status(): string {
        return "CPU Status PC: " + super.hexLog(this.program_counter, 4) +
            " IR: " + super.hexLog(this.inst_reg, 2) + " Acc: " + super.hexLog(this.accumulator, 2) +
            " xReg: " + super.hexLog(this.x_reg, 2) + " yReg: " + super.hexLog(this.y_reg, 2) +
            " zFlag: " + (this.z_flag) + " Step: " + this.step;
    }

}
