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

  constructor(private service: RestserviceService) {
    this.server = service.getServer();
    this.user = service.getUser();
    service.getWorld().then(
      world => {
        this.world = world;
      });
  }

  // tslint:disable-next-line:typedef
  onProductionDone(p: Product) {
    this.world.money += p.revenu;
    this.world.score += p.revenu;
  }

}
