import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {Product} from '../world';
import { RestserviceService } from '../restservice.service';

@Component({
  selector: 'app-product',
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.css']
})
export class ProductComponent implements OnInit {

  server: string;
  product: Product;
  progressBarValue: number;
  lastupdate: number;
  qtMulti: string;
  money: number;
  price: number;
  progressBar: any;
  quantiteMax: number;

  @Input()
  set prod(value: Product) {
    this.product = value;
    this.price = this.product.cout;
    if (this.product && this.product.timeleft > 0) {
      this.lastupdate = Date.now();
      this.progressBar.set((this.product.vitesse - this.product.timeleft) / this.product.vitesse);
      this.progressBar.animate(1, { duration: this.product.timeleft });
    }
  }

  @Input()
  set qtmulti(value: string){
    this.qtMulti = value;
    if (this.qtMulti && this.product) { this.calcMaxCanBuy(); }
  }

  @Input()
  set moneyWorld(value: number){
    this.money = value;
    this.calcMaxCanBuy();
  }

  @Output()
  notifyProduction: EventEmitter<Product> = new EventEmitter<Product>();

  @Output()
  notifyPurchase: EventEmitter<number> = new EventEmitter<number>();

  constructor(private service: RestserviceService) {
    this.server = service.getServer();
    this.progressBarValue = 0;
  }

  ngOnInit(): void {
    setInterval(() => { this.calcScore(); }, 100);
    this.progressBarValue = 0;
  }

  startFabrication(): void{
    this.product.timeleft = this.product.vitesse;
    this.lastupdate = Date.now();
  }

  calcScore(): void{
    if (!(this.product.timeleft !== 0)){
      if (this.product.timeleft > (Date.now() - this.lastupdate)){
        this.product.timeleft -= Date.now() - this.lastupdate;
        this.progressBarValue = ((this.product.vitesse - this.product.timeleft) / this.product.vitesse * 100);
      }else{
        this.product.timeleft = 0;
        this.notifyProduction.emit(this.product);
        this.progressBarValue = 0;
      }
    }
  }

  calcMaxCanBuy(): void{
    // tslint:disable-next-line:max-line-length
    this.quantiteMax = (Math.log(1 - ((this.money * (1 - this.product.croissance)) / this.product.cout))) / (Math.log(this.product.croissance));
    if (this.quantiteMax > 0) {
      this.quantiteMax = Math.floor(this.quantiteMax);
      this.qtMulti = String(this.quantiteMax);
    } else {
      this.qtMulti = 'Non';
    }
  }

  buyProduct(): void{
    let coutTotal = 0;
    switch (this.qtmulti) {
      case '1':
        coutTotal = this.product.cout;
        this.product.cout = this.product.croissance * this.product.cout;
        this.product.quantite += 1;
        break;
      case 'x10':
        coutTotal = this.product.cout * ((1 - (this.product.croissance ** 10)) / (1  - this.product.croissance));
        this.product.cout = (this.product.croissance ** 10) * this.product.cout;
        this.product.quantite += 10;
        this.price = coutTotal;
        break;
      case 'x100':
        coutTotal = this.product.cout * ((1 - (Math.pow(this.product.croissance, 100)) ) / (1  - this.product.croissance));
        this.product.cout = (this.product.croissance ** 100) * this.product.cout;
        this.product.quantite += 100;
        this.price = coutTotal;
        break;
      case 'max':
        coutTotal = this.product.cout * ((1 - Math.pow(this.product.croissance, this.quantiteMax)) / (1  - this.product.croissance));
        this.product.cout = (this.product.croissance ** this.quantiteMax) * this.product.cout;
        this.product.quantite += this.quantiteMax;
        this.price = coutTotal;
        break;
    }
    console.log('total: ' + coutTotal);
    this.notifyPurchase.emit(coutTotal);
    this.service.putProduct(this.product);
  }
}
