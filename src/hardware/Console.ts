import { Hardware } from "./Hardware";
import { Ascii } from "./Ascii";
import { Interrupt } from "./imp/Interrupt";
import { InterruptController } from "./InterruptController";
import { MMU } from "./MMU";

/**
 * Console needs to give an interrupt to IC
 * output constant
 * output strings
 */

export class Console extends Hardware implements Interrupt{

    public inputBuffer: any[] = [];
    public IRQ: number;
    public priority: number;
    public name: string;
    
    private controller: InterruptController;
    private MMU: MMU
    private ascii: Ascii;
    private newString: Array<String> = [];
    private offset = 0

    constructor(MMU: MMU, ascii: Ascii, controller: InterruptController){
        super(0,"CON");
        this.MMU = MMU;
        this.ascii = ascii;
        this.IRQ = 2;
        this.priority = 1;
        this.name = "console";
        this.controller = controller;
    }

    public printReg(output: number): void{
        this.log(super.hexLog(output,2));
    }

    public printBuffer(): void{
        let output = this.inputBuffer.shift();

        if( typeof output === "number"){
            this.printReg(output);
        }
        else{
            this.log(output);
        }
    }

    public takeOutput(output: number | string){
        this.inputBuffer.push(output);
        this.controller.getInterrupt(this);
    }

    public printString(startingAdd: number): boolean {
    let output = "";
    let offset = 0;

    while (true) {
        let nextChar = this.MMU.readImmediate(startingAdd + offset);
        if (nextChar === 0x00) break;
        output += this.ascii.decode(nextChar);
        offset++;
    }

    this.takeOutput(output);
    return true;
}


}
