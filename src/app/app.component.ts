import { Component } from '@angular/core';
import { RestserviceService } from './restservice.service';
import { World, Product, Pallier } from './world';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'IsisCapitalistClient';
  world: World = new World();
  server: string;
  user: string;
  qtMulti: string;

  constructor(private service: RestserviceService) {
    this.server = service.getServer();
    this.user = service.getUser();
    service.getWorld().then(
      world => {
        this.world = world;
      });
  }

  onProductionDone(p: Product): void {
    this.world.money += p.revenu;
    this.world.score += p.revenu;
  }

  clicMultipli(): void{
    switch (this.qtMulti){
      case '1' : {
        this.qtMulti = '10';
        break;
      }
      case '10': {
        this.qtMulti = '100';
        break;
      }
      case '100': {
        this.qtMulti = 'Max';
        break;
      }
      case 'Max': { // = max
        this.qtMulti = '1';
        break;
      }
      default : {
        this.qtMulti = '1';
        break;
      }
    }
  }
}
