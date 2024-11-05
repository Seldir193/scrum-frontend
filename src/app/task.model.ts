export interface Contact {
    id?: number;
    name: string;
    email: string;
    phone_number: string;
  }

 export interface BaseTask {
    id: number;
    text: string;
    delayed: boolean;
    user: number;
    description?: string;
    contacts: Contact[];
    status?: string;
    priority?: 'urgent' | 'medium' | 'low'; 
    dueDate?:string | Date |null ; 
    category?: string;
    showPopupMenu?: boolean;
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
    priority?: 'urgent' | 'medium' | 'low';
    dueDate?: Date |null ;
    category?: string;
  }

  export interface ContactDialogData {
    id?: number;
    name: string;
    email: string;
    phone_number: string;
  }