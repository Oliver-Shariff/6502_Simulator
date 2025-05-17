import {Hardware} from "./Hardware";
import {Memory} from "./Memory";
import { ClockListener } from "./imp/ClockListener";

export class MMU extends Hardware implements ClockListener{

    private memory: Memory;

    constructor(memory: Memory){
        super(0,"MMU");
        this.memory = memory;
    }

    public pulse(): void{
        this.log("Received clock pulse");
    }

    public setAddress(address: number): void{
        this.memory.setMAR(address);
    }

    public setAddressLE(lowByte: number, highByte: number): void{
        const address = (highByte <<8) | lowByte; //shift high byte left by 1 byte and combine with low byte
        this.setAddress(address);
    }
    public read(): void {
        this.memory.read();
    }

    public dataFromLE(lowByte: number, highByte: number): number{
        this.setAddressLE(lowByte,highByte);
        this.read();
        return this.getData();
    }

    public write(): void {
        this.memory.write();
    }
    public getData(): number{
        return this.memory.getMDR()
    }
    public setData(data: number): void{
        this.memory.setMDR(data);
    }
    public readImmediate(address: number): number{
        this.setAddress(address); //update MAR
        this.read(); //update MDR
        return this.getData();
    }

    public writeImmediate(address: number, data: number): void{
        this.setAddress(address); //update MAR
        this.setData(data); //update MDR
        this.write(); //use MAR and MDR to update memory
    }
    public loadStaticProgram(): void{
        const program = [0xA9,0x0D,0xA9,0x1D,0xA9,0x2D,0xA9,0x3F,0xA9,0xFF,0x00]//hard code static program
        for(let i = 0; i < program.length;i++){
            this.writeImmediate(i,program[i]); //index = address
        }
        console.log(`[HW - ${this.name} id: ${this.id} - ${Date.now()}]: Program loaded sucessfully`);
    }
    public loadProgram(program:number[]){
    for(let i = 0; i < program.length;i++){
            this.writeImmediate(i,program[i]); //index = address
        }
        console.log(`[HW - ${this.name} id: ${this.id} - ${Date.now()}]: Program loaded sucessfully`);
        
    }
    public memoryDump(start: number, end: number) {
        console.log(`[HW - ${this.name} id: ${this.id} - ${Date.now()}]: Memory Dump: Debug`);
        console.log(`[HW - ${this.name} id: ${this.id} - ${Date.now()}]: ------------------`);
        for (let i = start; i <= end; i++) {
            this.memory.displayMemory(i);
        }
        console.log(`[HW - ${this.name} id: ${this.id} - ${Date.now()}]: ------------------`);
        console.log(`[HW - ${this.name} id: ${this.id} - ${Date.now()}]: Memory Dump: Complete`);
    }
}