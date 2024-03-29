import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {Pallier, Product} from '../world';
import { RestserviceService } from '../restservice.service';
import {MatSnackBar} from '@angular/material/snack-bar';

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
  pallierAPasser: number;

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
    if (this.money && this.product) { this.calcMaxCanBuy(); }
  }

  @Output()
  notifyProduction: EventEmitter<Product> = new EventEmitter<Product>();

  @Output()
  notifyPurchase: EventEmitter<number> = new EventEmitter<number>();

  constructor(private service: RestserviceService,  private snackBar: MatSnackBar) {
    this.server = service.getServer();
    this.progressBarValue = 0;
  }

  ngOnInit(): void {
    setInterval(() => { this.calcScore(); }, 100);
    this.progressBarValue = 0;
    this.pallierAPasser = this.product.palliers.pallier[0].seuil;
  }

  startFabrication(): void{
    if (this.product.timeleft === 0 && this.product.quantite > 0){
      this.product.timeleft = this.product.vitesse;
      this.lastupdate = Date.now();
    }
  }


  calcScore(): void {
    if (this.product.managerUnlocked && this.product.timeleft === 0) {
      this.startFabrication();
    }
    if (this.product.timeleft !== 0){
      if (this.product.timeleft > (Date.now() - this.lastupdate)){
        this.product.timeleft -= Date.now() - this.lastupdate;
        this.progressBarValue = ((this.product.vitesse - this.product.timeleft) / this.product.vitesse * 100);
      }else{
        this.product.timeleft = 0;
        this.notifyProduction.emit(this.product);
        this.progressBarValue = 0;
        this.service.putProduct(this.product);
      }
    }
  }

  // retourne la quantité maximale que l'on peut achete
  calcMaxCanBuy(): number{
    // tslint:disable-next-line:max-line-length
    this.quantiteMax = Math.floor(Math.log(1 - ((this.money * (1 - this.product.croissance)) / this.product.cout))) / (Math.log(this.product.croissance));
    this.quantiteMax = Math.trunc(this.quantiteMax);
    return this.quantiteMax;

    if (this.quantiteMax > 0) {
      this.quantiteMax = Math.floor(this.quantiteMax);
      // this.qtMulti = String(this.quantiteMax);
    } else {
      // this.qtMulti = 'Non';
    }
  }

  buyProduct(): void{
    let coutTotal = 0;
    let coutProduit = 0;
    let qtProduit = this.product.quantite;
    this.calcMaxCanBuy();
    switch (this.qtMulti) {
      // switch (this._qtmulti) {
        case '1':
          coutTotal = this.product.cout;
          coutProduit = this.product.croissance * this.product.cout;
          qtProduit += 1;
          break;
        case '10':
          coutTotal = this.product.cout * ((1 - (this.product.croissance ** 10)) / (1  - this.product.croissance));
          coutProduit = (this.product.croissance ** 10) * this.product.cout;
          qtProduit += 10;
          break;
        case '100':
          coutTotal = this.product.cout * ((1 - (Math.pow(this.product.croissance, 100)) ) / (1  - this.product.croissance));
          coutProduit = (this.product.croissance ** 100) * this.product.cout;
          qtProduit += 100;
          break;
        case 'Max':
          coutTotal = this.product.cout * ((1 - Math.pow(this.product.croissance, this.quantiteMax)) / (1  - this.product.croissance));
          coutProduit = (this.product.croissance ** this.quantiteMax) * this.product.cout;
          qtProduit += this.quantiteMax;
          break;
      }
    if (this.money > coutTotal){
        this.notifyPurchase.emit(coutTotal);
        this.product.cout = Math.round((coutProduit * (10 ** 2))) / (10 ** 2);
        this.product.quantite = qtProduit;
        this.price = coutTotal;

        
        //update pour chaque value l'image et le pallier
        this.product.palliers.pallier.forEach(value => {
          if (!value.unlocked && this.product.quantite > value.seuil) {
            let p = this.product.palliers.pallier.indexOf(value);
            this.product.palliers.pallier[p].unlocked = true;
            if(this.product.palliers.pallier[p+1]){
              this.pallierAPasser = this.product.palliers.pallier[p+1].seuil;
            } else {
              this.pallierAPasser = 123 ;
            }
            this.calcUpgrade(value);
            this.product.name = this.product.palliers.pallier[this.product.palliers.pallier.indexOf(value)].name;
            this.product.logo = this.product.palliers.pallier[this.product.palliers.pallier.indexOf(value)].logo;
            this.popMessage('Nouveau seuil atteint !');
          }
        });
        this.service.putProduct(this.product);
      }else{
        console.log('pas assez dargent');
      }
  }

  calcUpgrade(pallier: Pallier): void {
    switch (pallier.typeratio) {
      case 'gain':
        this.product.revenu = this.product.revenu * pallier.ratio;
        break;
      case 'vitesse':
        this.product.vitesse = this.product.vitesse / pallier.ratio;
        break;
    }
  }

  popMessage(message: string): void {
    this.snackBar.open(message, '', {duration: 5000});
  }
}
