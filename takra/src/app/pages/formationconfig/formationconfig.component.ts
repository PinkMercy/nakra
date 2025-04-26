
import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { SessionService } from '../../services/session/session.service';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzTableModule } from 'ng-zorro-antd/table';
import { CommonModule } from '@angular/common';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { ButtonModule } from 'primeng/button';
import { NzModalModule }      from 'ng-zorro-antd/modal';
import { NzFormModule }       from 'ng-zorro-antd/form';
import { NzInputModule }      from 'ng-zorro-antd/input';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzSelectModule } from 'ng-zorro-antd/select';
// Removed NzOptionModule as it is not found in ng-zorro-antd/core/option
export interface Session {
  room: string;
  date: string;
  timeStart: string;
  timeEnd: string;
  linkMeet: string;
  type: string;
}

export interface Event {
  id: number;
  title: string;
  description: string;
  date: string;
  duration: number ;
  sessions: Session[];
}
@Component({
  selector: 'app-formationconfig',
  imports: [NzTableModule,
     ReactiveFormsModule,
    CommonModule,
    NzModalModule,
    NzFormModule,
    NzInputModule,
    NzDatePickerModule,
    NzButtonModule,
    NzIconModule,
    NzDividerModule,
    NzSelectModule,
    // Removed NzOptionModule from imports
    ],
  templateUrl: './formationconfig.component.html',
  styleUrl: './formationconfig.component.scss'
})
export class FormationconfigComponent implements OnInit {
  events: any[] = [];
  modalForm!: FormGroup;
  editingId: number | null = null;
  constructor(private fb: FormBuilder,
    private sessionService: SessionService,
    private modal: NzModalService) {}

  ngOnInit(): void {
    this.loadEvents();
    this.buildForm();
  }
  private buildForm() {
    this.modalForm = this.fb.group({
      title:           [null, [Validators.required]],
      description:     [null, [Validators.required]],
      type:            [null, [Validators.required]],
      date:            [null, [Validators.required]],
      durationInHours: [null, [Validators.required, Validators.min(1)]],
      formateurEmail:  [null, [Validators.required, Validators.email]],
      sessions: this.fb.array([])
    });
  }
  get sessions(): FormArray {
    return this.modalForm.get('sessions') as FormArray;
  }
  addSession(data?: any) {
    this.sessions.push(
      this.fb.group({
        room:      [data?.room      || null, Validators.required],
        date:      [data?.date      || null, Validators.required],
        timeStart: [data?.timeStart || null, Validators.required],
        timeEnd:   [data?.timeEnd   || null, Validators.required],
        linkMeet:  [data?.linkMeet  || null, Validators.required],
        type:      [data?.type      || null, Validators.required]
      })
    );
  }
  removeSession(i: number) {
    this.sessions.removeAt(i);
  }
  
  loadEvents() {
    this.sessionService.getEvents().subscribe(data => this.events = data);
  }

  @ViewChild('modalFormTemplate', { static: true }) modalFormTemplate!: TemplateRef<any>;

  openModal(isEdit = false, event?: any) {
    this.editingId = isEdit ? event.id : null;
    this.sessions.clear();

    if (isEdit && event.sessions) {
      // populate existing sessions + form
      event.sessions.forEach((s: any) => this.addSession(s));
      this.modalForm.patchValue({
        title:           event.title,
        description:     event.description,
        type:            event.type,
        date:            event.date,
        durationInHours: event.durationInHours,
        formateurEmail:  event.formateurEmail
      });
    } else {
      // new training: clear + seed one session form
      this.modalForm.reset();
      this.addSession();
    }

    this.modal.create({
      nzTitle:   isEdit ? 'Modifier Formation' : 'Ajouter Formation',
      nzContent: this.modalFormTemplate,
      nzOnOk:    () => this.submit(),
      nzOnCancel:() => this.modalForm.reset()
    });
  }

  submit() {
    if (this.modalForm.invalid) return;
    const payload = this.modalForm.value;

    if (this.editingId) {
      this.sessionService.updateEvent(this.editingId, payload)
        .subscribe(() => this.loadEvents());
    } else {
      this.sessionService.addEvent(payload)
        .subscribe(() => this.loadEvents());
    }

    this.modalForm.reset();
  }
}
