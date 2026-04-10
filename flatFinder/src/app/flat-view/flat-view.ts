import { Component, OnInit, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { ActivatedRoute } from '@angular/router';
import { FirebaseService } from '../services/firebase.service';

@Component({
  selector: 'app-flat-view',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatButtonModule, MatDialogModule],
  templateUrl: './flat-view.html',
  styleUrls: ['./flat-view.css'],
})
export class FlatView implements OnInit {
  flat: Flat | null = null;
  currentUserId: string | null = null;
  editMode = false;
  loading = false;
  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private dialog: MatDialog,
    private firebaseService: FirebaseService,
    private route: ActivatedRoute
  ) {
    this.form = this.fb.group({
      name: ['', Validators.required],
      address: ['', Validators.required],
      city: ['', Validators.required],
      rent: [0, [Validators.required, Validators.min(0)]],
      areaSize: [0, [Validators.required, Validators.min(0)]],
      hasAC: [false],
      yearBuilt: [new Date().getFullYear(), [Validators.required, Validators.min(1800), Validators.max(new Date().getFullYear())]],
      dateAvailable: ['', Validators.required]
    });
  }

  async ngOnInit() {
    await this.loadCurrentUser();
    await this.loadFlat();
  }

  private async loadCurrentUser() {
    try {
      const userData = await this.firebaseService.getCurrentUserData();
      this.currentUserId = userData ? userData.uid : null;
    } catch (error) {
      console.error('Erro ao carregar usuário:', error);
    }
  }

  private async loadFlat() {
    this.loading = true;
    try {
      const flatId = this.route.snapshot.queryParams['id'];

      if (flatId) {
        const flatData = await this.firebaseService.getFlatById(flatId);
        this.flat = flatData as Flat;
      } else {
        // Se não há ID, mostrar dados de exemplo ou redirecionar
        this.flat = {
          id: 'sample',
          name: 'Imóvel de Exemplo',
          address: 'Rua Exemplo, 123',
          city: 'Cidade Exemplo',
          rent: 1500,
          areaSize: 75,
          hasAC: true,
          yearBuilt: 2020,
          dateAvailable: new Date().toISOString(),
          ownerId: 'sample-owner'
        };
      }
    } catch (error) {
      console.error('Erro ao carregar imóvel:', error);
    } finally {
      this.loading = false;
    }
  }

  get isOwner(): boolean {
    return !!(this.flat && this.currentUserId && this.flat.ownerId === this.currentUserId);
  }

  startEdit(): void {
    if (!this.flat) return;

    const dialogRef = this.dialog.open(FlatDetailsComponent, {
      width: '600px',
      data: { flat: this.flat },
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(async result => {
      if (result && this.flat) {
        try {
          await this.firebaseService.updateFlat(this.flat.id, result);
          this.flat = { ...this.flat, ...result };
          console.log('Flat updated successfully');
        } catch (error) {
          console.error('Erro ao atualizar imóvel:', error);
        }
      }
    });
  }

  sendMessage(): void {
    if (!this.flat?.ownerId) return;

    const dialogRef = this.dialog.open(SendMessageDialogComponent, {
      width: '500px',
      data: { ownerId: this.flat.ownerId },
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log('Message sent successfully');
      }
    });
  }
}

export interface Flat {
  id: string;
  name: string;
  address: string;
  city: string;
  rent: number;
  areaSize: number;
  hasAC: boolean;
  yearBuilt: number;
  dateAvailable: string; // ISO date string
  ownerId?: string;
}

@Component({
  selector: 'app-flat-details',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatCheckboxModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  templateUrl: './flat-details.html',
  styleUrls: ['./flat-details.css']
})
export class FlatDetailsComponent {
  flat: Flat;
  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<FlatDetailsComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { flat: Flat }
  ) {
    this.flat = data.flat;
    this.form = this.fb.group({
      name: [this.flat.name, Validators.required],
      address: [this.flat.address, Validators.required],
      city: [this.flat.city, Validators.required],
      rent: [this.flat.rent, [Validators.required, Validators.min(0)]],
      areaSize: [this.flat.areaSize, [Validators.required, Validators.min(0)]],
      hasAC: [this.flat.hasAC],
      yearBuilt: [this.flat.yearBuilt, [Validators.min(1800), Validators.max(new Date().getFullYear())]],
      dateAvailable: [this.flat.dateAvailable ? new Date(this.flat.dateAvailable) : '', Validators.required]
    });
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const updated: Flat = {
      ...this.flat,
      ...this.form.value,
      dateAvailable: new Date(this.form.value.dateAvailable).toISOString()
    };

    this.dialogRef.close(updated);
  }

  cancel(): void {
    this.dialogRef.close();
  }
}

@Component({
  selector: 'app-send-message-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule
  ],
  template: `
    <h2 mat-dialog-title>Enviar Mensagem</h2>
    <mat-dialog-content>
      <form [formGroup]="messageForm">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Mensagem</mat-label>
          <textarea matInput
                    formControlName="message"
                    rows="4"
                    placeholder="Digite sua mensagem para o proprietário..."></textarea>
          <mat-error *ngIf="messageForm.get('message')?.invalid && messageForm.get('message')?.touched">
            Mensagem é obrigatória
          </mat-error>
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="cancel()">Cancelar</button>
      <button mat-raised-button color="primary" (click)="send()" [disabled]="messageForm.invalid || sending">
        {{ sending ? 'Enviando...' : 'Enviar' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .full-width {
      width: 100%;
    }
    mat-dialog-content {
      min-width: 400px;
    }
  `]
})
export class SendMessageDialogComponent {
  messageForm: FormGroup;
  sending = false;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<SendMessageDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { ownerId: string },
    private firebaseService: FirebaseService
  ) {
    this.messageForm = this.fb.group({
      message: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  async send(): Promise<void> {
    if (this.messageForm.invalid) {
      this.messageForm.markAllAsTouched();
      return;
    }

    this.sending = true;
    try {
      const success = await this.firebaseService.sendMessage(
        this.data.ownerId,
        this.messageForm.value.message
      );

      if (success) {
        this.dialogRef.close(true);
      } else {
        console.error('Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      this.sending = false;
    }
  }

  cancel(): void {
    this.dialogRef.close();
  }
}