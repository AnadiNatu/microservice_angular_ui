import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-health',
  template: `
    <div class="mb-4">
      <h2 class="fw-bold">System Health</h2>
      <p class="text-muted">Real-time monitoring of microservices architecture</p>
    </div>

    <div class="row g-4">
      @for (service of services; track service.name) {
        <div class="col-md-6 col-lg-4">
          <div class="card p-4 h-100">
            <div class="d-flex justify-content-between align-items-start mb-3">
              <div>
                <h5 class="fw-bold mb-1">{{ service.name }}</h5>
                <span class="text-muted smaller">v{{ service.version }}</span>
              </div>
              <span [class]="'badge ' + (service.status === 'UP' ? 'bg-success' : 'bg-danger')">
                {{ service.status }}
              </span>
            </div>
            
            <div class="mb-3">
              <div class="d-flex justify-content-between small mb-1">
                <span>CPU Usage</span>
                <span>{{ service.cpu }}%</span>
              </div>
              <div class="progress" style="height: 6px;">
                <div class="progress-bar bg-primary" [style.width.%]="service.cpu"></div>
              </div>
            </div>

            <div class="mb-3">
              <div class="d-flex justify-content-between small mb-1">
                <span>Memory</span>
                <span>{{ service.memory }}MB</span>
              </div>
              <div class="progress" style="height: 6px;">
                <div class="progress-bar bg-info" [style.width.%]="(service.memory / 1024) * 100"></div>
              </div>
            </div>

            <div class="mt-auto pt-3 border-top d-flex justify-content-between align-items-center">
              <span class="smaller text-muted"><i class="bi bi-clock me-1"></i> Uptime: {{ service.uptime }}</span>
              <button class="btn btn-sm btn-light"><i class="bi bi-arrow-clockwise"></i></button>
            </div>
          </div>
        </div>
      }
    </div>

    <div class="card mt-4 p-4">
      <h5 class="fw-bold mb-4">System Logs</h5>
      <div class="bg-dark text-white p-3 rounded font-monospace smaller" style="height: 200px; overflow-y: auto;">
        @for (log of logs; track log.time) {
          <div class="mb-1">
            <span class="text-success">[{{ log.time | date:'HH:mm:ss' }}]</span>
            <span [class]="log.level === 'ERROR' ? 'text-danger' : 'text-info'"> {{ log.level }} </span>
            <span>{{ log.message }}</span>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .smaller { font-size: 0.75rem; }
  `]
})
export class HealthComponent implements OnInit {
  services = [
    { name: 'Auth Service', version: '1.2.0', status: 'UP', cpu: 15, memory: 256, uptime: '12d 4h' },
    { name: 'Product Service', version: '2.0.1', status: 'UP', cpu: 24, memory: 512, uptime: '8d 12h' },
    { name: 'Order Service', version: '1.5.4', status: 'UP', cpu: 45, memory: 768, uptime: '4d 2h' },
    { name: 'Payment Gateway', version: '1.0.0', status: 'UP', cpu: 8, memory: 128, uptime: '24d 1h' },
    { name: 'Notification Service', version: '1.1.2', status: 'DOWN', cpu: 0, memory: 0, uptime: '0h' }
  ];

  logs = [
    { time: new Date(), level: 'INFO', message: 'Auth Service started successfully' },
    { time: new Date(Date.now() - 5000), level: 'INFO', message: 'Product cache refreshed' },
    { time: new Date(Date.now() - 15000), level: 'ERROR', message: 'Notification Service connection timeout' },
    { time: new Date(Date.now() - 30000), level: 'WARN', message: 'High memory usage on Order Service' },
    { time: new Date(Date.now() - 45000), level: 'INFO', message: 'Database migration completed' }
  ];

  ngOnInit() {}
}
