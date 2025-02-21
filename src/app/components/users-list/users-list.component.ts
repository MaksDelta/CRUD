import { Component, OnInit, Input } from '@angular/core';
import {
  MatPaginatorModule,
  MatPaginatorIntl,
} from '@angular/material/paginator';
import { Subject } from 'rxjs';
import { CommonModule } from '@angular/common';
import { UserService, User } from '../../services/user.service';
import { UserInfoComponent } from '../user-info/user-info.component';
import { FormsModule } from '@angular/forms';

export class MyCustomPaginatorIntl implements MatPaginatorIntl {
  changes = new Subject<void>();

  firstPageLabel = $localize`First page`;
  itemsPerPageLabel = $localize`Items per page:`;
  lastPageLabel = $localize`Last page`;

  nextPageLabel = $localize`Next page`;
  previousPageLabel = $localize`Previous page`;

  getRangeLabel(page: number, pageSize: number, length: number): string {
    if (length === 0) {
      return $localize`Page 1 of 1`;
    }
    const amountPages = Math.ceil(length / pageSize);
    return $localize`Page ${page + 1} of ${amountPages}`;
  }
}

@Component({
  selector: 'app-users-list',
  standalone: true,
  imports: [MatPaginatorModule, UserInfoComponent, CommonModule, FormsModule],
  templateUrl: './users-list.component.html',
  styleUrls: ['./users-list.component.scss'],
  providers: [{ provide: MatPaginatorIntl, useClass: MyCustomPaginatorIntl }],
})
export class UsersListComponent implements OnInit {
  @Input() index!: number;
  @Input() users: User[] = [];
  paginatedUsers: User[] = [];
  filteredUsers: User[] = [];
  searchTerm: string = '';
  pageSize = 10;
  pageIndex = 0;

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.userService.users$.subscribe((data) => {
      this.users = data;
      this.filterUsers();
    });
  }

  addUserToList(newUser: User): void {
    this.users.push(newUser);
    this.filterUsers();
  }

  onPageChange(event: any): void {
    this.pageSize = event.pageSize;
    this.pageIndex = event.pageIndex;
    this.updatePaginatedUsers();
  }

  filterUsers(): void {
    if (this.searchTerm) {
      this.filteredUsers = this.users.filter(
        (user) =>
          user.firstName
            .toLowerCase()
            .startsWith(this.searchTerm.toLowerCase()) ||
          user.lastName.toLowerCase().startsWith(this.searchTerm.toLowerCase())
      );
    } else {
      this.filteredUsers = this.users;
    }
    this.updatePaginatedUsers();
  }

  updatePaginatedUsers(): void {
    const start = this.pageIndex * this.pageSize;
    const end = start + this.pageSize;
    this.paginatedUsers = this.filteredUsers.slice(start, end);
  }
}
