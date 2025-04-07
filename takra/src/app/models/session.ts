export interface Session {
    room: string;
    date: string;
    timeStart: string;
    timeEnd: string;
    linkMeet: string;
    type?: string;
  }
  
  export interface Event {
    title: string;
    description: string;
    type?: string;
    date: string;
    durationInHours: number;
    sessions: Session[];
  }
  