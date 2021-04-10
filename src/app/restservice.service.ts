import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import { World, Pallier, Product } from './world';

@Injectable({
  providedIn: 'root'
})
export class RestserviceService {
  private server = 'http://localhost:4040/';
  user = '';

  private setHeaders(user: string): HttpHeaders {
    const headers = new HttpHeaders({ 'X-User': user });
    return headers;
  }

  constructor(private http: HttpClient) { }

  getUser(): string {
    return this.user;
  }

  // tslint:disable-next-line:typedef
  setUser(value: string) {
    this.user = value;
    this.setHeaders(value);
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

  putProduct(product: Product): Promise<Product> {
    return this.http.put(this.server + 'minioncapitalist/generic/product', product, {
      headers: this.setHeaders(this.user)
    }).toPromise().catch(this.handleError);
  }
}

