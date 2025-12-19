// Command input handling and history management

export class CommandHandler {
  private currentLine: string = "";
  private cursorPos: number = 0;
  private commandHistory: string[] = [];
  private historyIndex: number = -1;
  
  constructor() {}
  
  public getCurrentLine(): string {
    return this.currentLine;
  }
  
  public getCursorPos(): number {
    return this.cursorPos;
  }
  
  public insertChar(char: string): void {
    this.currentLine = 
      this.currentLine.slice(0, this.cursorPos) +
      char +
      this.currentLine.slice(this.cursorPos);
    this.cursorPos++;
  }
  
  public backspace(): boolean {
    if (this.cursorPos > 0) {
      this.currentLine = 
        this.currentLine.slice(0, this.cursorPos - 1) +
        this.currentLine.slice(this.cursorPos);
      this.cursorPos--;
      return true;
    }
    return false;
  }
  
  public submitCommand(): string {
    const line = this.currentLine;
    
    if (line.trim()) {
      this.commandHistory.push(line);
      this.historyIndex = this.commandHistory.length;
    }
    
    this.currentLine = "";
    this.cursorPos = 0;
    
    return line;
  }
  
  public cancel(): void {
    this.currentLine = "";
    this.cursorPos = 0;
  }
  
  public replaceCurrentLine(newLine: string): string {
    const oldLine = this.currentLine;
    this.currentLine = newLine;
    this.cursorPos = newLine.length;
    return oldLine;
  }
  
  public historyUp(): string | null {
    if (this.historyIndex > 0) {
      this.historyIndex--;
      const line = this.commandHistory[this.historyIndex];
      this.currentLine = line;
      this.cursorPos = line.length;
      return line;
    }
    return null;
  }
  
  public historyDown(): string | null {
    if (this.historyIndex < this.commandHistory.length - 1) {
      this.historyIndex++;
      const line = this.commandHistory[this.historyIndex];
      this.currentLine = line;
      this.cursorPos = line.length;
      return line;
    } else if (this.historyIndex < this.commandHistory.length) {
      this.historyIndex = this.commandHistory.length;
      this.currentLine = "";
      this.cursorPos = 0;
      return "";
    }
    return null;
  }
  
  public appendToLine(text: string): void {
    this.currentLine += text;
    this.cursorPos += text.length;
  }
  
  public getHistory(): string[] {
    return [...this.commandHistory];
  }
  
  public clearHistory(): void {
    this.commandHistory = [];
    this.historyIndex = -1;
  }
}

