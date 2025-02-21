import { Component, Inject, Input } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef,
} from '@angular/material/dialog';
import { User } from '../../services/user.service';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { DatePipe, CommonModule } from '@angular/common';
import { EditUserComponent } from '../edit-user/edit-user.component';
import { DeleteUserComponent } from '../delete-user/delete-user.component';
import { UserService } from '../../services/user.service';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-personal-information',
  imports: [MatDialogModule, MatButtonModule, MatIconModule, CommonModule],
  templateUrl: './personal-information.component.html',
  styleUrls: ['./personal-information.component.scss'],
  providers: [DatePipe],
  standalone: true,
})
export class PersonalInformationComponent {
  @Input() user: User;

  constructor(
    @Inject(MAT_DIALOG_DATA) public injectedUser: User,
    public datePipe: DatePipe,
    private userService: UserService,
    private _dialog: MatDialog,
    private _dialogRef: MatDialogRef<PersonalInformationComponent>,
    private changeDetectorRef: ChangeDetectorRef
  ) {
    this.user = injectedUser;
  }

  openEditUserForm() {
    const dialogRef = this._dialog.open(EditUserComponent, {
      data: { user: this.user },
    });

    dialogRef.afterClosed().subscribe((updatedUser: User | undefined) => {
      if (updatedUser) {
        this.userService.updateUser(updatedUser).subscribe(() => {
          this.user = updatedUser;
          console.log('User updated:', this.user);

          this.changeDetectorRef.markForCheck();
        });
      }
    });
  }

  openDeleteDialog(user: User): void {
    const dialogRef = this._dialog.open(DeleteUserComponent, {
      data: user,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.userService.deleteUser(user.email);
        console.log('User deleted from the list');
        this._dialogRef.close(true);
      }
    });
  }
}
