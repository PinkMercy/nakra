import { Component, OnInit} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzTableModule } from 'ng-zorro-antd/table';
import { UserService } from '../../services/user/user.service';
import { User } from '../../models/user';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { NzSelectModule } from 'ng-zorro-antd/select'; // ADDED: Import for dropdown
import { NzNotificationService } from 'ng-zorro-antd/notification'; // ADDED: Import for notifications

@Component({
  selector: 'app-adminusers',
  imports: [FormsModule,
     NzButtonModule,
     NzInputModule,
     NzPopconfirmModule,
     NzTableModule,
     CommonModule,
     NzModalModule,
     NzButtonModule,
     ReactiveFormsModule,
     NzSelectModule], // ADDED: Added NzSelectModule to imports
  templateUrl: './adminusers.component.html',
  styleUrl: './adminusers.component.scss'
})
export class AdminusersComponent implements OnInit {
  listOfData: User[] = [];
  editId: number | null = null;
  isEditModalVisible = false;
  isAddMode = false;
  userForm: FormGroup;

  // ADDED: Define role options for the dropdown
  roleOptions = [
    { label: 'USER', value: 'USER' },
    { label: 'ADMIN', value: 'ADMIN' }
  ];

  constructor(private userService: UserService, private fb: FormBuilder, private notification: NzNotificationService) { // ADDED: Inject notification service
    // Create the form group with validators.
    this.userForm = this.fb.group({
      id: [null],
      firstname: ['', [Validators.required, Validators.minLength(2)]],
      lastname: ['', [Validators.required, Validators.maxLength(50)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      role: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.fetchUsers();
  }

  fetchUsers(): void {
    this.userService.getUsers().subscribe({
      next: (users) => {
        this.listOfData = users;
      },
      error: (err) => {
        console.error('Failed to fetch users:', err);
      }
    });
  }

  startEdit(id: number): void {
    this.editId = id;
  }

  stopEdit(): void {
    this.editId = null;
  }

  deleteRow(id: number): void {
    this.userService.deleteUser(id).subscribe({
      next: () => {
        this.fetchUsers();
        this.listOfData = this.listOfData.filter(user => user.id !== id);
        // ADDED: Success notification for delete
        this.notification.success('Succès', 'Utilisateur supprimé avec succès!', 
          { nzPlacement: 'top' });
      },
      error: (err) => {
        this.fetchUsers();
        console.error('Failed to delete user:', err);
        
      }
    });
  }

  openEditModal(user: User): void {
    this.isAddMode = false;
    // Patch the form with the selected user's data.
    this.userForm.patchValue(user);
    this.isEditModalVisible = true;
  }

  openAddModal(): void {
    this.isAddMode = true;
    // Reset the form so that the fields are empty.
    this.userForm.reset();
    this.isEditModalVisible = true;
  }

  closeEditModal(): void {
    this.isEditModalVisible = false;
  }

  confirmModal(): void {
    // Mark all fields as touched to trigger validation messages.
    this.userForm.markAllAsTouched();
    if (this.userForm.invalid) {
      return;
    }

    if (this.isAddMode) {
      const newUser: User = {
        id: this.listOfData.length + 1, 
        firstname: this.userForm.value.firstname,// For demo purposes only; ideally, the backend generates the ID.
        lastname: this.userForm.value.lastname,
        email: this.userForm.value.email,
        password: this.userForm.value.password,
        role: this.userForm.value.role
      };
      this.userService.addUser(newUser).subscribe({
        next: () => {
          this.fetchUsers();
          this.closeEditModal();
          // ADDED: Success notification for add
          this.notification.success('Succès', 'Utilisateur ajouté avec succès!', 
            { nzPlacement: 'top' });
        },
        error: (err) => {
          console.error('Failed to add user:', err);
          // ADDED: Error notification for add
          this.notification.error('Erreur', 'Échec de l\'ajout de l\'utilisateur!', 
            { nzPlacement: 'top' });
        }
      });
    } else {
      // For editing, we assume the user already has an ID.
      const updatedUser: Partial<User> = {
        firstname: this.userForm.value.firstname,
        lastname: this.userForm.value.lastname,
        email: this.userForm.value.email,
        password: this.userForm.value.password,
        role: this.userForm.value.role
      };
      if (!this.userForm.value.id) { return; }
      this.userService.updateUser(this.userForm.value.id, updatedUser).subscribe({
        next: () => {
          this.fetchUsers();
          this.closeEditModal();
          // ADDED: Success notification for update
          this.notification.success('Succès', 'Utilisateur modifié avec succès!', 
            { nzPlacement: 'top' });
        },
        error: (err) => {
          console.error('Failed to update user:', err);
          // ADDED: Error notification for update
          this.notification.error('Erreur', 'Échec de la modification de l\'utilisateur!', 
            { nzPlacement: 'top' });
        }
      });
    }
  }
}