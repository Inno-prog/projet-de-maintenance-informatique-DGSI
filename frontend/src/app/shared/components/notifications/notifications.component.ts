import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService, Notification } from '../../../core/services/notification.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="notifications-container">
      <div class="notifications-header">
        <h3>Notifications</h3>
        <span class="badge" *ngIf="unreadCount > 0">{{ unreadCount }}</span>
      </div>
      
      <div class="notifications-list" *ngIf="notifications.length > 0; else noNotifications">
        <div *ngFor="let notification of notifications" 
             class="notification-item" 
             [class]="getNotificationClass(notification)"
             (click)="marquerCommeLu(notification)">
          
          <div class="notification-icon">
            <i [class]="getIconClass(notification.type)"></i>
          </div>
          
          <div class="notification-content">
            <h4>{{ notification.titre }}</h4>
            <p>{{ notification.message }}</p>
            <span class="notification-date">{{ formatDate(notification.dateCreation) }}</span>
          </div>
          
          <div class="notification-status" *ngIf="!notification.lu">
            <span class="unread-dot"></span>
          </div>
        </div>
      </div>
      
      <ng-template #noNotifications>
        <div class="no-notifications">
          <p>Aucune notification</p>
        </div>
      </ng-template>
    </div>
  `,
  styles: [`
    .notifications-container {
      max-width: 400px;
      background: white;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      overflow: hidden;
    }

    .notifications-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem;
      background: #f8fafc;
      border-bottom: 1px solid #e2e8f0;
    }

    .badge {
      background: #ef4444;
      color: white;
      padding: 0.25rem 0.5rem;
      border-radius: 12px;
      font-size: 0.75rem;
      font-weight: 600;
    }

    .notification-item {
      display: flex;
      align-items: flex-start;
      padding: 1rem;
      border-bottom: 1px solid #f1f5f9;
      cursor: pointer;
      transition: background-color 0.2s;
    }

    .notification-item:hover {
      background: #f8fafc;
    }

    .notification-item.unread {
      background: #fef7f0;
      border-left: 4px solid #f59e0b;
    }

    .notification-icon i {
      font-size: 1.25rem;
      margin-right: 0.75rem;
    }

    .notification-content {
      flex: 1;
    }

    .notification-content h4 {
      margin: 0 0 0.5rem 0;
      font-size: 0.9rem;
      font-weight: 600;
    }

    .notification-content p {
      margin: 0 0 0.5rem 0;
      font-size: 0.85rem;
      color: #64748b;
    }

    .notification-date {
      font-size: 0.75rem;
      color: #94a3b8;
    }

    .unread-dot {
      width: 8px;
      height: 8px;
      background: #1e293b;
      border-radius: 50%;
    }

    .no-notifications {
      padding: 2rem;
      text-align: center;
      color: #94a3b8;
    }
  `]
})
export class NotificationsComponent implements OnInit {
  notifications: Notification[] = [];
  unreadCount = 0;

  constructor(
    private notificationService: NotificationService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadNotifications();
  }

  loadNotifications(): void {
    const user = this.authService.getCurrentUser();
    if (user?.username) {
      this.notificationService.getNotifications(user.username).subscribe({
        next: (notifications) => {
          this.notifications = notifications;
          this.unreadCount = notifications.filter(n => !n.lu).length;
        }
      });
    }
  }

  marquerCommeLu(notification: Notification): void {
    if (!notification.lu) {
      this.notificationService.marquerCommeLu(notification.id).subscribe({
        next: () => {
          notification.lu = true;
          this.unreadCount--;
        }
      });
    }
  }

  getNotificationClass(notification: Notification): string {
    return notification.lu ? 'read' : 'unread';
  }

  getIconClass(type: string): string {
    const icons = {
      'INFO': 'fas fa-info-circle',
      'WARNING': 'fas fa-exclamation-triangle',
      'SUCCESS': 'fas fa-check-circle',
      'ERROR': 'fas fa-times-circle'
    };
    return icons[type as keyof typeof icons] || 'fas fa-bell';
  }

  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'À l\'instant';
    if (diffMins < 60) return `Il y a ${diffMins} min`;
    
    return date.toLocaleDateString('fr-FR');
  }
}