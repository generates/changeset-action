declare function askCheckboxPlus(message: string, choices: Array<any>, format?: (arg: any) => any): Promise<Array<string>>;
declare function askQuestion(message: string): Promise<string>;
declare function askConfirm(message: string): Promise<boolean>;
declare function askList<Choice extends string>(message: string, choices: readonly Choice[]): Promise<Choice>;
export { askCheckboxPlus, askQuestion, askConfirm, askList };
