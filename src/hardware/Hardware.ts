export class Hardware {

    public id: number;
    public name: string;
    public debug: boolean = true;

    constructor (id: number, name:string){
        this.id = id;
        this.name = name;
    }

    public log(message: string): void{
        if(this.debug){
            console.log(`[HW - ${this.name} id: ${this.id} - ${Date.now()}]: ${message}`);
        }
    }
    public hexLog(num: number, len: number){

        let formatHex = num.toString(16).toUpperCase().padStart(len,'0');

        
        return formatHex;
    }


}
