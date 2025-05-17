import { Hardware } from "./Hardware";
import { ClockListener } from "./imp/ClockListener";


export class Memory extends Hardware implements ClockListener {

    private memArr: Array<number>
    private MAR: number;
    private MDR: number;

    private clockDebug: boolean = false;

    constructor() {
        super(0, "Memory");
        {
            this.memArr = new Array(0x10000)
            this.MAR = 0x0000;
            this.MDR = 0x00;
            console.log(`[HW - ${this.name} id: ${this.id} - ${Date.now()}]: Created - Addressable space : ${this.memArr.length}`);
        }
    }

    public displayMemory(address: number): void {
            console.log(`[HW - ${this.name} id: ${this.id} - ${Date.now()}] Addr ${this.hexLog(address, 4)}: |  ${this.hexLog(this.memArr[address], 2)}`)

    }

    public pulse() {
        if(this.clockDebug){

            console.log("MAR: " + this.MAR + " MDR: " + this.MDR);
        }
    }

    public getMAR(): number {
        return this.MAR;
    }

    public setMAR(address: number): void {
        if (address < 0 || address > 0xFFFF) {
            throw new Error(`address ${address} is out of range`);
        }
        this.MAR = address;
    }

    public getMDR(): number {
        return this.MDR;
    }

    public setMDR(data: number): void {
        if (data < 0x00 || data > 0xFF) {
            throw new Error(`data ${data} is and invalid byte`);
        }
        this.MDR = data;
    }
    public reset(): void {
        this.MAR = 0x0000;
        this.MDR = 0x00;
        for (let i = 0; i < 0x10000; i++) {
            this.memArr[i] = 0x00;
        }
    }
    //read memory location in MAR and update MDR
    public read(): void {
        this.MDR = this.memArr[this.MAR];
    }
    //assign memory location in MAR to MDR contents
    public write(): void {
        this.memArr[this.MAR] = this.MDR;
    }
}
