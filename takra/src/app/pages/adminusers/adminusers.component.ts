import { Component, OnInit} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzTableModule } from 'ng-zorro-antd/table';
import { UserService } from '../../services/user.service';
import { User } from '../../models/user'; // Adjust the path if necessary
import { NzModalModule } from 'ng-zorro-antd/modal';

@Component({
  selector: 'app-adminusers',
  imports: [FormsModule, NzButtonModule, NzInputModule, NzPopconfirmModule, NzTableModule,CommonModule,NzModalModule,NzButtonModule],
  templateUrl: './adminusers.component.html',
  styleUrl: './adminusers.component.scss'
})
export class AdminusersComponent implements OnInit {
  listOfData: User[] = [];

  editId: number | null = null;
  isEditModalVisible = false;
  editedUser: Partial<User> = {};

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.fetchUsers();
  }

  fetchUsers(): void {
  this.userService.getUsers().subscribe({
    next: (users) => {
      this.listOfData = users;
      console.log('Fetched users:', this.listOfData);
    },
    error: (err) => {
      console.error('Failed to fetch users:', err);
      // Handle error (e.g., show notification)
    }
  });
}

  startEdit(id: number): void {
    this.editId = id;
  }

  stopEdit(): void {
    this.editId = null;
  }

  // deleteRow(id: number): void {
  //   this.listOfData = this.listOfData.filter(user => user.id !== id);
  // }
  deleteRow(id: number): void {
    // Call delete API from the service
    this.userService.deleteUser(id).subscribe({
      next: () => {
        // Remove the deleted user from the list in the UI
        this.listOfData = this.listOfData.filter(user => user.id !== id);
      },
      error: (err) => {
        console.error('Failed to delete user:', err);
        // Optionally, notify the user about the error
      }
    });
  }
  openEditModal(user: User): void {
    this.editedUser = { ...user };
    this.isEditModalVisible = true;
  }
  closeEditModal(): void {
    this.isEditModalVisible = false;
  }
  updateUser(): void {
    if (!this.editedUser.id) { return; }
    this.userService.updateUser(this.editedUser.id, this.editedUser).subscribe({
      next: () => {
        this.fetchUsers();
        this.closeEditModal();
      },
      error: (err) => console.error('Failed to update user:', err)
    });
  }
}

