import { Component, Input, Inject } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { User } from '../../services/user.service';

@Component({
  selector: 'app-delete-user',
  standalone: true,
  imports: [MatToolbarModule, MatButtonModule],
  templateUrl: './delete-user.component.html',
  styleUrls: ['./delete-user.component.scss'],
})
export class DeleteUserComponent {
  constructor(
    private dialogRef: MatDialogRef<DeleteUserComponent>,
    @Inject(MAT_DIALOG_DATA) public user: User
  ) {}

  onCancel(): void {
    this.dialogRef.close();
  }

  onDelete(): void {
    console.log('User deleted:', this.user);
    this.dialogRef.close(true);
  }
}
