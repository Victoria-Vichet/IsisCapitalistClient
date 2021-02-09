import {Component, Input, OnInit} from '@angular/core';
import {Product, World} from '../world';
import { RestserviceService } from '../restservice.service';

@Component({
  selector: 'app-product',
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.css']
})
export class ProductComponent implements OnInit {

  server: string;
  world: World;
  product: Product;
  progressBarValue: number;
  lastupdate: number;

  @Input()
  set prod(value: Product) {
    this.product = value;
  }

  constructor(private service: RestserviceService) {
    this.server = service.getServer();
    service.getWorld().then(
      world => {
        this.world = world;
      });
    this.progressBarValue = 0;
  }

  ngOnInit(): void {
    setInterval(() => { this.calcScore(); }, 100);
  }

  startFabrication(): void{
  }

  calcScore(): void{
    this.lastupdate = Date.now();
    if ((this.product.timeleft - 100) > 0){
      this.product.timeleft -= 100;
    }else{
      this.world.money += this.product.revenu;
      this.progressBarValue = 0;
    }
  }
}
