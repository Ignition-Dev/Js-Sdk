import { Socket } from 'socket.io-client';

declare class Ignition {
  #apiKey: string;
  #socket: Socket;
  #state: boolean;
  #groupId: string | undefined;
  #url: string | undefined;

  constructor(key: string, url?: string);
  subscribe(groupId: string): Promise<void>;
  emit(eventName: string, groupId: string, message: any): Promise<void>;
  on(eventName: string, callback: (data: any) => void): Promise<void>;
  publish(groupId: string, eventName: string, message: any): Promise<void>;
}

export { Ignition };