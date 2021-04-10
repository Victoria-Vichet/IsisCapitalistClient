import { Component, Input } from '@angular/core';
import { RestserviceService } from './restservice.service';
import { World, Product, Pallier } from './world';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatBadge } from '@angular/material/badge';

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

  constructor(private service: RestserviceService, private snackBar: MatSnackBar) {
    this.server = service.getServer();
    this.username = localStorage.getItem('username');

    if (this.username == null || this.username === ''){
      this.username = 'UnicornPowerFlower' + Math.floor(Math.random() * 10000);
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

    console.log(this.world);
  }

  onUsernameChanged(): void {
    localStorage.setItem('username', this.username);
    this.service.setUser(this.username);
    window.location.reload();
  }

  //@Input()
  onProductionDone(p: Product): void {
    this.world.money += p.revenu;
    this.world.score += p.revenu;
    this.badgeUpgrades();
  }

  onBuy(n: Number): void {
    this.world.money -= Number(n);
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
      this.popMessage('Vous avez engagé ' + m.name);
    }
  }

  popMessage(message: string): void {
    this.snackBar.open(message, '', {duration: 5000});
  }

  badgeUpgrades(): void {
    for (const manager of this.world.managers.pallier) {
      if (manager.seuil <= this.world.money) {
        this.badgeManagers++;
      }
    }
  }


}

