import { Component, EventEmitter, Output, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { User } from '../../services/user.service';

@Component({
  selector: 'app-search-bar',
  templateUrl: './search-bar.component.html',
  styleUrls: ['./search-bar.component.scss'],
  standalone: true,
  imports: [FormsModule, CommonModule],
})
export class SearchBarComponent {
  @Input() users: User[] = [];
  @Output() filteredUsers = new EventEmitter<User[]>();

  searchQuery: string = '';
  paginatedUsers: User[] = [];
  pageSize = 10;
  pageIndex = 0;

  onSearchChange(): void {
    console.log('Search Query:', this.searchQuery);
    this.filterUsers();
  }

  filterUsers(): void {
    if (!this.users || this.users.length === 0) {
      console.warn('User list is empty!');
      return;
    }

    const filteredUsers = this.users.filter((user) =>
      [user.firstName, user.lastName, user.email].some((field) =>
        field?.toLowerCase().includes(this.searchQuery.toLowerCase())
      )
    );

    console.log('Filtered Users:', filteredUsers);
    this.paginateUsers(filteredUsers);
  }

  paginateUsers(filteredUsers: User[]): void {
    const start = this.pageIndex * this.pageSize;
    const end = start + this.pageSize;
    this.paginatedUsers = filteredUsers.slice(start, end);
    this.filteredUsers.emit(this.paginatedUsers);
  }

  onPageChange(event: any): void {
    this.pageSize = event.pageSize;
    this.pageIndex = event.pageIndex;
    this.filterUsers();
  }
}
