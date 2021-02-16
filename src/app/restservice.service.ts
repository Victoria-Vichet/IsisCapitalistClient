import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { World, Pallier, Product } from './world';

@Injectable({
  providedIn: 'root'
})
export class RestserviceService {
  private server = 'http://localhost:4040/';
  #user = '';

  constructor(private http: HttpClient) { }

  getUser(): string {
    return this.#user;
  }

  set user(value: string) {
    this.#user = value;
  }


  getServer(): string {
    return this.server;
  }

  private handleError(error: any): Promise<any> {
    console.error('An error occurred', error);
    return Promise.reject(error.message || error);
  }
  getWorld(): Promise<World> {
    return this.http.get(this.server + 'minioncapitalist/generic/world')
      .toPromise().catch(this.handleError);
  }
}
