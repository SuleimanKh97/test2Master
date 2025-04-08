import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';



@NgModule({
  declarations: [],
  imports: [
    CommonModule
  ]
})
export class UserModule { }
// user.model.ts
export interface User {
  username: string;
  email: string;
  role: string;
  createdAt: Date;
}
