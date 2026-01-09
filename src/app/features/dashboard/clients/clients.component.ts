import { Component, OnInit, signal } from '@angular/core';
import { ClientService } from '../../../core/services/client.service';
import { ClientRequest, ClientResponse } from '../../../core/models/client.model';

@Component({
  selector: 'app-clients',
  standalone: false,
  templateUrl: './clients.component.html',
  styleUrls: ['./clients.component.css']
})
export class ClientsComponent implements OnInit {
  clients = signal<ClientResponse[]>([]);
  loading = signal<boolean>(false);
  showModal = signal<boolean>(false);
  isEditMode = signal<boolean>(false);
  selectedClientId = signal<number | null>(null);
  
  clientForm = signal<ClientRequest>({
    name: '',
    email: '',
    password: '',
    phoneNumber: '',
    address: '',
    active: true
  });

  errorMessage = signal<string>('');
  validationErrors = signal<{[key: string]: string}>({});
  
  notification = signal<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  constructor(private clientService: ClientService) {}

  ngOnInit(): void {
    this.loadClients();
  }

  loadClients(): void {
    this.loading.set(true);
    this.clientService.getAllClients().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.clients.set(response.data);
        }
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading clients:', error);
        this.loading.set(false);
      }
    });
  }

  openCreateModal(): void {
    this.isEditMode.set(false);
    this.selectedClientId.set(null);
    this.clientForm.set({
      name: '',
      email: '',
      password: '',
      phoneNumber: '',
      address: '',
      active: true
    });
    this.errorMessage.set('');
    this.validationErrors.set({});
    this.showModal.set(true);
  }

  openEditModal(client: ClientResponse): void {
    this.isEditMode.set(true);
    this.selectedClientId.set(client.id);
    
    this.clientService.getClientById(client.id).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.clientForm.set({
            name: response.data.name,
            email: response.data.email,
            password: '', // Don't populate password for security
            phoneNumber: response.data.phoneNumber,
            address: response.data.address,
            active: response.data.active
          });
          this.errorMessage.set('');
          this.validationErrors.set({});
          this.showModal.set(true);
        }
      },
      error: (error) => {
        console.error('Error loading client:', error);
        this.showNotification('error', 'Failed to load client details');
      }
    });
  }

  closeModal(): void {
    this.showModal.set(false);
  }

  saveClient(): void {
    this.errorMessage.set('');
    this.validationErrors.set({});
    this.loading.set(true);

    const clientData = this.clientForm();

    if (this.isEditMode() && this.selectedClientId()) {
      this.clientService.updateClient(this.selectedClientId()!, clientData).subscribe({
        next: (response) => {
          if (response.success) {
            this.showNotification('success', 'Client updated successfully!');
            this.closeModal();
            this.loadClients();
          }
        },
        error: (error) => {
          console.error('Error updating client:', error);
          this.loading.set(false);
          this.handleError(error);
        }
      });
    } else {
      this.clientService.createClient(clientData).subscribe({
        next: (response) => {
          if (response.success) {
            this.showNotification('success', 'Client created successfully!');
            this.closeModal();
            this.loadClients();
          }
        },
        error: (error) => {
          console.error('Error creating client:', error);
          this.loading.set(false);
          this.handleError(error);
        }
      });
    }
  }

  deleteClient(id: number): void {
    if (!confirm('Are you sure you want to delete this client?')) {
      return;
    }

    this.loading.set(true);
    this.clientService.deleteClient(id).subscribe({
      next: (response) => {
        this.showNotification('success', 'Client deleted successfully!');
        this.loadClients();
      },
      error: (error) => {
        console.error('Error deleting client:', error);
        this.loading.set(false);
        this.showNotification('error', error.error?.message || 'Failed to delete client');
      }
    });
  }

  updateFormField(field: keyof ClientRequest, value: any): void {
    this.clientForm.update(form => ({
      ...form,
      [field]: value
    }));
  }

  showNotification(type: 'success' | 'error', message: string): void {
    this.notification.set({ type, message });
    setTimeout(() => {
      this.notification.set(null);
    }, 3000);
  }

  handleError(error: any): void {
    console.log('Full error object:', error);
    console.log('Error.error.data:', error.error?.data);
    
    if (error.error?.data && typeof error.error.data === 'object') {
      const data = error.error.data;
      const errors: {[key: string]: string} = {};
      
      Object.keys(data).forEach((field) => {
        if (typeof data[field] === 'string') {
          errors[field] = data[field];
        }
      });
      
      if (Object.keys(errors).length > 0) {
        this.validationErrors.set(errors);
        this.errorMessage.set(error.error.message || 'Validation failed');
      } else {
        this.errorMessage.set(error.error?.message || 'An error occurred. Please try again.');
      }
    } else if (error.error?.message) {
      this.errorMessage.set(error.error.message);
    } else {
      this.errorMessage.set('An error occurred. Please try again.');
    }
  }
}
