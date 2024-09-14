export interface Contact {

    id?: number;
    name: string;
    email: string;
    phoneNumber: string;
   
  }
  
  export interface BaseTask {
    id: number;
    text: string;
    delayed: boolean;
    user: number;
    description?: string;
    contacts: Contact[];
    status?: string;
  }
  
  export interface Todo extends BaseTask {
    // Spezifische Felder für Todo, falls notwendig
  }
  
  export interface TodayTask extends BaseTask {
    // Spezifische Felder für TodayTask, falls notwendig
  }
  
  export interface InProgress extends BaseTask {
    // Spezifische Felder für InProgress, falls notwendig
  }
  
  export interface Done extends BaseTask {
    // Spezifische Felder für Done, falls notwendig
  }
  

  export interface TaskDialogData {
    id?: number;                // Optional, da die ID erst nach dem Speichern generiert wird
    name: string;               // Der Name des Tasks (Pflichtfeld)
    description?: string;       // Optionale Beschreibung des Tasks
    contacts: Contact[];
    selectedContacts: Contact[];
  }

  export interface ContactDialogData {
    name: string;
    email: string;
    phoneNumber: string;
  }