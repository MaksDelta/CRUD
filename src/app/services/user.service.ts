import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';

export interface User {
  firstName: string;
  lastName: string;
  createdAt: string;
  email: string;
  tags: string[];
  description: string;
}

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private jsonUrl = 'assets/users.json';
  private usersSubject = new BehaviorSubject<User[]>([]);

  users$ = this.usersSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadInitialUsers();
  }

  private loadInitialUsers(): void {
    this.http.get<User[]>(this.jsonUrl).subscribe((users) => {
      this.usersSubject.next(users);
    });
  }

  getUsers(): Observable<User[]> {
    return this.usersSubject.asObservable();
  }

  addUser(newUser: User): Observable<User> {
    return this.http.post<User>(this.jsonUrl, newUser);
  }

  userAdded(newUser: User): void {
    const currentUsers = this.usersSubject.value;
    this.usersSubject.next([...currentUsers, newUser]);
  }

  updateUser(updatedUser: User): Observable<User> {
    const updatedUsers = this.usersSubject.value.map((user) =>
      user.email === updatedUser.email ? updatedUser : user
    );
    this.usersSubject.next(updatedUsers);
    return this.http.put<User>(this.jsonUrl, updatedUser);
  }

  deleteUser(userEmail: string): void {
    const currentUsers = this.usersSubject.value;
    const updatedUsers = currentUsers.filter(
      (user) => user.email !== userEmail
    );
    this.usersSubject.next(updatedUsers);
  }
}
