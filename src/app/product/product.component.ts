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

  @Input()
  set prod(value: Product) {
    this.product = value;
  }

  @Output()
  notifyProduction: EventEmitter<Product> = new EventEmitter<Product>();

  constructor(private service: RestserviceService) {
    this.server = service.getServer();
    this.progressBarValue = 0;
  }

  ngOnInit(): void {
    setInterval(() => { this.calcScore(); }, 100);
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
}
