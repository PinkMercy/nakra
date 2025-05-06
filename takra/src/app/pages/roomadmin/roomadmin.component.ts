import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzMessageModule, NzMessageService } from 'ng-zorro-antd/message';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { RoomService } from '../../services/room.service';

interface Room {
  id: number;
  name: string;
  capacity: number;
}

@Component({
  selector: 'app-roomadmin',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NzTableModule,
    NzDividerModule,
    NzButtonModule,
    NzModalModule,
    NzFormModule,
    NzInputModule,
    NzInputNumberModule,
    NzMessageModule,
    NzPopconfirmModule,
    NzIconModule
  ],
  templateUrl: './roomadmin.component.html',
  styleUrl: './roomadmin.component.scss'
})
export class RoomadminComponent implements OnInit {
  rooms: Room[] = [];
  isAddModalVisible = false;
  isLoading = false;
  roomForm!: FormGroup;

  constructor(
    private roomService: RoomService,
    private fb: FormBuilder,
    private message: NzMessageService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadRooms();
  }

  initForm(): void {
    this.roomForm = this.fb.group({
      name: [null, [Validators.required]],
      capacity: [30, [Validators.required, Validators.min(1)]]
    });
  }

  loadRooms(): void {
    this.isLoading = true;
    this.roomService.getRooms().subscribe({
      next: (data) => {
        this.rooms = data;
        this.isLoading = false;
      },
      error: (error) => {
        this.message.error('Erreur lors du chargement des salles');
        console.error('Error loading rooms:', error);
        this.isLoading = false;
      }
    });
  }

  showAddModal(): void {
    this.resetForm();
    this.isAddModalVisible = true;
  }

  handleCancel(): void {
    this.isAddModalVisible = false;
  }

  resetForm(): void {
    this.roomForm.reset();
    this.roomForm.patchValue({
      capacity: 30
    });
  }

  submitForm(): void {
    if (this.roomForm.valid) {
      const room = this.roomForm.value;
      this.isLoading = true;
      
      this.roomService.addRoom(room).subscribe({
        next: (response) => {
          this.message.success('Salle ajoutée avec succès');
          this.isAddModalVisible = false;
          this.loadRooms();
        },
        error: (error) => {
          this.message.error('Erreur lors de l\'ajout de la salle');
          console.error('Error adding room:', error);
          this.isLoading = false;
        }
      });
    } else {
      Object.values(this.roomForm.controls).forEach(control => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
    }
  }

  deleteRoom(id: number): void {
    this.isLoading = true;
    this.roomService.deleteRoom(id).subscribe({
      next: () => {
        this.message.success('Salle supprimée avec succès');
        this.loadRooms();
      },
      error: (error) => {
        this.message.error('Erreur lors de la suppression de la salle');
        console.error('Error deleting room:', error);
        this.isLoading = false;
      }
    });
  }
}