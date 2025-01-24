import {
  ChangeDetectionStrategy,
  Component,
  signal,
  inject,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  FormControl,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { merge } from 'rxjs';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import {
  MatChipEditedEvent,
  MatChipInputEvent,
  MatChipsModule,
} from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatDialogRef } from '@angular/material/dialog';
import { UserService, User } from '../../services/user.service';
import { CommonModule } from '@angular/common';

interface Tag {
  name: string;
}

@Component({
  selector: 'app-add-user',
  imports: [
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    ReactiveFormsModule,
    MatChipsModule,
    MatIconModule,
    MatSelectModule,
    CommonModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './add-user.component.html',
  styleUrls: ['./add-user.component.scss'],
  standalone: true,
})
export class AddUserComponent {
  readonly email = new FormControl('', [Validators.required, Validators.email]);
  readonly firstNameControl = new FormControl('', [Validators.required]);
  readonly lastNameControl = new FormControl('', [Validators.required]);

  currentLength: number = 0;
  firstName: string = '';
  lastName: string = '';
  description: string = '';
  tagsArray: string[] = [];

  errorMessage = signal('');

  constructor(
    private _dialogRef: MatDialogRef<AddUserComponent>,
    private userService: UserService
  ) {
    merge(this.email.statusChanges, this.email.valueChanges)
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.updateErrorMessage());
  }

  updateErrorMessage() {
    if (this.email.hasError('required')) {
      this.errorMessage.set('You must enter a value');
    } else if (this.email.hasError('email')) {
      this.errorMessage.set('Not a valid email');
    } else {
      this.errorMessage.set('');
    }
  }

  readonly addOnBlur = true;
  readonly separatorKeysCodes = [ENTER, COMMA] as const;
  readonly tags = signal<Tag[]>([
    { name: 'Angular' },
    { name: 'React' },
    { name: 'Front-end' },
  ]);
  readonly announcer = inject(LiveAnnouncer);

  add(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();

    if (value) {
      this.tags.update((tags) => [...tags, { name: value }]);
    }

    event.chipInput!.clear();
  }

  remove(tag: Tag): void {
    this.tags.update((tags) => {
      const index = tags.indexOf(tag);
      if (index < 0) {
        return tags;
      }

      tags.splice(index, 1);
      this.announcer.announce(`Removed ${tag.name}`);
      return [...tags];
    });
  }

  edit(tag: Tag, event: MatChipEditedEvent) {
    const value = event.value.trim();

    if (!value) {
      this.remove(tag);
      return;
    }

    this.tags.update((tags) => {
      const index = tags.indexOf(tag);
      if (index >= 0) {
        tags[index].name = value;
        return [...tags];
      }
      return tags;
    });
  }

  onFirstNameChange(): void {
    if (this.firstName.length > 100) {
      this.firstName = this.firstName.slice(0, 100);
    }

    if (this.firstNameControl?.hasError('required')) {
      console.log('First name is required');
    }
  }

  onLastNameChange(): void {
    if (this.lastName.length > 100) {
      this.lastName = this.lastName.slice(0, 100);
    }

    if (this.lastNameControl?.hasError('required')) {
      console.log('Last name is required');
    }
  }

  onDescriptionChange(): void {
    if (this.description.length > 1000) {
      this.description = this.description.slice(0, 1000);
    }
  }

  closeDialog(): void {
    this._dialogRef.close();
  }

  createUser(): void {
    const newUser: User = {
      firstName: this.firstName,
      lastName: this.lastName,
      createdAt: new Date().toISOString(),
      email: this.email.value!,
      tags: this.tagsArray,
      description: this.description,
    };

    this.userService.addUser(newUser).subscribe({
      next: () => {
        console.log('User added successfully');
        this._dialogRef.close(newUser);
        this.userService.userAdded(newUser);
      },
      error: (err) => console.error('Error adding user:', err),
    });
  }
}
