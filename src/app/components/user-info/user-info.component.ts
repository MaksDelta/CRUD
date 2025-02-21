import { Component, Input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { DeleteUserComponent } from '../delete-user/delete-user.component';
import { CommonModule, DatePipe } from '@angular/common';
import { UserService, User } from '../../services/user.service';
import { PersonalInformationComponent } from '../personal-information/personal-information.component';

@Component({
  selector: 'app-user-info',
  imports: [
    MatButtonModule,
    MatDividerModule,
    MatIconModule,
    MatDialogModule,
    CommonModule,
  ],
  templateUrl: './user-info.component.html',
  styleUrls: ['./user-info.component.scss'],
  standalone: true,
  providers: [DatePipe],
})
export class UserInfoComponent {
  @Input() index!: number;
  @Input() user!: User;

  constructor(
    private _dialog: MatDialog,
    private userService: UserService,
    private datePipe: DatePipe
  ) {}

  getFormattedDate(createdAt: string): string {
    return this.datePipe.transform(createdAt, 'dd MMMM yyyy, HH:mm')!;
  }

  openPersonalInformation(user: User): void {
    const dialogRef = this._dialog.open(PersonalInformationComponent, {
      data: user,
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
      }
    });
  }
}
