export interface Session {
  id?: number;
  room: string;
  date: string;
  timeStart: string;
  timeEnd: string;
  linkMeet: string;
  type?: string;
}

export interface Event {
  id?: number;
  title: string;
  description: string;
  type?: string;
  date: string;
  formateur?: { firstname: string; lastname: string };
  durationInHours: number;
  sessions: Session[];
}
