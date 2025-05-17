export interface Interrupt {
    IRQ: number;
    priority: number;
    name: string;
    inputBuffer?: Array<any>;
    outputBuffer?: Array<any>;
}