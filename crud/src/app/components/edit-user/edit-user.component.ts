import {
  ChangeDetectionStrategy,
  Component,
  signal,
  inject,
  Inject,
  OnInit,
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
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { UserService, User } from '../../services/user.service';

interface Tag {
  name: string;
}

@Component({
  selector: 'app-edit-user',
  imports: [
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    ReactiveFormsModule,
    MatChipsModule,
    MatIconModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './edit-user.component.html',
  styleUrl: './edit-user.component.scss',
  standalone: true,
})
export class EditUserComponent implements OnInit {
  readonly email = new FormControl('', [Validators.required, Validators.email]);
  readonly firstNameControl = new FormControl('', [Validators.required]);
  readonly lastNameControl = new FormControl('', [Validators.required]);
  readonly descriptionControl = new FormControl('');

  user: User | null = null;

  currentLength: { firstName: number; lastName: number; email: number } = {
    firstName: 0,
    lastName: 0,
    email: 0,
  };

  firstName: string = '';
  lastName: string = '';
  description: string = '';

  errorMessage = signal('');

  constructor(
    private dialogRef: MatDialogRef<EditUserComponent>,
    private userService: UserService,
    @Inject(MAT_DIALOG_DATA) private data: { user: User }
  ) {
    merge(this.email.statusChanges, this.email.valueChanges)
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.updateErrorMessage());
  }

  ngOnInit(): void {
    this.user = this.data.user;
    if (this.user) {
      this.setFormData(this.user);
    } else {
      console.warn('No user data available');
    }
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
    this.currentLength.firstName = this.firstName.length;
  }

  onLastNameChange(): void {
    if (this.lastName.length > 100) {
      this.lastName = this.lastName.slice(0, 100);
    }
    this.currentLength.lastName = this.lastName.length;
  }

  onDescriptionChange(): void {
    if (this.description.length > 1000) {
      this.description = this.description.slice(0, 1000);
    }
  }

  setFormData(user: User): void {
    this.email.setValue(user.email);
    this.firstNameControl.setValue(user.firstName);
    this.lastNameControl.setValue(user.lastName);
    this.descriptionControl.setValue(user.description);
    this.tags.set(user.tags.map((tag) => ({ name: tag })));
    this.firstName = user.firstName;
    this.lastName = user.lastName;
    this.description = user.description;
    this.currentLength.firstName = user.firstName.length;
    this.currentLength.lastName = user.lastName.length;
    this.currentLength.email = user.email.length;
  }

  saveChanges(): void {
    if (
      this.firstNameControl.invalid ||
      this.lastNameControl.invalid ||
      this.email.invalid
    ) {
      return;
    }

    const updatedUser: User = {
      firstName: this.firstNameControl.value!,
      lastName: this.lastNameControl.value!,
      email: this.email.value!,
      description: this.descriptionControl.value!,
      tags: this.tags().map((tag) => tag.name),
      createdAt: this.user?.createdAt ?? '',
    };

    this.userService.updateUser(updatedUser).subscribe({
      next: (user) => {
        this.dialogRef.close(user);
      },
      error: (err) => {
        this.errorMessage.set('Error saving user');
        console.error(err);
      },
    });
  }

  closeDialog(): void {
    this.dialogRef.close();
  }
}
