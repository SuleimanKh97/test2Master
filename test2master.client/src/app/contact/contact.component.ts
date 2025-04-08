import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';


@Component({
  selector: 'app-contact',
  standalone: false,
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.css'
})
export class ContactComponent {
  contactForm = {
    name: '',
    email: '',
    phone: '',
    message: ''
  };

  formSubmitted = false;

  submitForm(): void {
    // In a real application, this would send the form data to a backend API
    console.log('Form submitted:', this.contactForm);
    this.formSubmitted = true;

    // Reset form after submission
    setTimeout(() => {
      this.contactForm = {
        name: '',
        email: '',
        phone: '',
        message: ''
      };
      this.formSubmitted = false;
    }, 3000);
  }
}
