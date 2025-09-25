import { Injectable } from '@angular/core';
import { ConfirmationComponent, ConfirmationConfig } from '../../shared/components/confirmation/confirmation.component';

@Injectable({
  providedIn: 'root'
})
export class ConfirmationService {
  private confirmationComponent?: ConfirmationComponent;

  setComponent(component: ConfirmationComponent): void {
    this.confirmationComponent = component;
  }

  async show(config: ConfirmationConfig): Promise<boolean> {
    if (!this.confirmationComponent) {
      return false;
    }
    return this.confirmationComponent.show(config);
  }
}