import { Component, OnInit} from '@angular/core';
import { FormsModule } from '@angular/forms';

import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzTableModule } from 'ng-zorro-antd/table';
import { UserService } from '../../services/user.service';
import { User } from '../../models/user'; // Adjust the path if necessary


@Component({
  selector: 'app-adminusers',
  imports: [FormsModule, NzButtonModule, NzInputModule, NzPopconfirmModule, NzTableModule],
  templateUrl: './adminusers.component.html',
  styleUrl: './adminusers.component.scss'
})
export class AdminusersComponent implements OnInit {
  listOfData: User[] = [];

  editId: number | null = null;

  constructor(private userService: UserService) {}

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

  deleteRow(id: number): void {
    this.listOfData = this.listOfData.filter(user => user.id !== id);
  }
}

