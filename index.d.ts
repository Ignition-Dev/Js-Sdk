import { Socket } from 'socket.io-client';

interface Config {
  key: string;
  url?: string;
  encryptionKey?: string;
}

declare class Ignition {
  #socket: Socket;
  #encryptionKey: string | undefined;
  groupId: string | undefined;
  url: string | undefined;

  constructor(config: Config);
  
  subscribe(groupId: string): Promise<void>;
  unsubscribe(groupId: string): Promise<void>;
  encrypt(message: any): string;
  decrypt(message: string): any;
  emit(eventName: string, groupId: string, message: any): Promise<void>;
  on(eventName: string, callback: (data: any) => void): Promise<void>;
  off(eventName: string, callback?: (data: any) => void): Promise<void>;
  publish(groupId: string, eventName: string, message: any): Promise<void>;
}

export { Ignition };