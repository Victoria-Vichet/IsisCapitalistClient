import {Component, Input, QueryList, ViewChildren} from '@angular/core';
import { RestserviceService } from './restservice.service';
import { World, Product, Pallier } from './world';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatBadge } from '@angular/material/badge';
import {ProductComponent} from './product/product.component';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'MinionCapitalist';
  world: World = new World();
  server: string;
  user: string;
  qtMulti: string;
  showManagers: boolean;
  badgeManagers: number;
  username = '';
  showUnlocks: boolean;
  badgeUnlocks: number;
  badgeUpgrade: number;
  showUpgrade: boolean;

  @ViewChildren(ProductComponent) productsComponent: QueryList<ProductComponent>;
  // this.productsComponent.forEach(p => p.calcUpgrade(tu));
  // trouver comment utiliser ce productComponent

  constructor(private service: RestserviceService, private snackBar: MatSnackBar) {
    this.server = service.getServer();
    this.username = localStorage.getItem('username');

    if (this.username == null || this.username === ''){
      this.username = 'Unicorn' + Math.floor(Math.random() * 10000);
      localStorage.setItem('username', this.username);
    }

    this.showManagers = false;
    this.badgeManagers = 0;
    this.qtMulti = '1';

    this.user = this.username;
    service.setUser(this.username);

    service.getWorld().then(
      world => {
        this.world = world;
      });
  }

  onUsernameChanged(): void {
    localStorage.setItem('username', this.username);
    this.service.setUser(this.username);
    window.location.reload();
  }

  onProductionDone(p: Product): void {
    this.world.money += p.revenu;
    this.world.score += p.revenu;
    this.badgeManagersNew();
    this.badgeUpgradeNew();
  }

  onBuy(n: number): void {
    this.world.money -= n;
  }


  clicMultipli(): void {
    switch (this.qtMulti) {
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

  hireManager(m: Pallier): void {
    if ((this.world.money >= m.seuil) && (this.world.products.product[m.idcible].quantite > 0)) {
      this.world.money -= m.seuil;
      m.unlocked = true;
      this.world.products.product[m.idcible].managerUnlocked = true;
      this.service.putManager(m);
      this.popMessage('Vous avez engagé ' + m.name);
    }
  }

  popMessage(message: string): void {
    this.snackBar.open(message, '', {duration: 5000});
  }

  badgeManagersNew(): void {
    this.badgeManagers = 0;
    for (const manager of this.world.managers.pallier) {
      if (manager.seuil <= this.world.money) {
        this.badgeManagers++;
      }
    }
  }

  badgeUpgradeNew(): void {
    this.badgeUpgrade = 0;
    for (const manager of this.world.managers.pallier) {
      if (manager.seuil <= this.world.money) {
        this.badgeUpgrade++;
      }
    }
  }

  buyUpgrade(p: Pallier): void{
    if (this.world.money >= p.seuil) {
      this.world.money -= p.seuil;
      p.unlocked = true;
      if (p.idcible === 0) {
        this.productsComponent.forEach(produit => produit.calcUpgrade(p));
      }
      else {
        this.productsComponent.forEach(produit => {
          if (p.idcible === produit.product.id) {
            produit.calcUpgrade(p);
          }
        });
      }
      this.service.putUpgrade(p);
      this.popMessage('Vous avez un nouvel avantage ' + p.name);
    }
  }
}

