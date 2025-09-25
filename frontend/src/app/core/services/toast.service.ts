import { Injectable } from '@angular/core';
import { ToastComponent, Toast } from '../../shared/components/toast/toast.component';

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private toastComponent?: ToastComponent;

  setComponent(component: ToastComponent): void {
    this.toastComponent = component;
  }

  show(toast: Omit<Toast, 'id'>): void {
    if (this.toastComponent) {
      this.toastComponent.addToast(toast);
    }
  }
}