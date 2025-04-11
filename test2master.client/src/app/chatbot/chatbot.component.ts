import { Component, OnInit, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // Import FormsModule for ngModel
import { ChatbotService } from '../Services/chatbot/chatbot.service';
import { GeminiResponse } from '../Interfaces/chatbot.interface';

// Interface for chat messages
interface ChatMessage {
  sender: 'user' | 'bot';
  text: string;
  timestamp: Date;
}

@Component({
  selector: 'app-chatbot',
  standalone: true, // Make it standalone
  imports: [
    CommonModule,
    FormsModule // Add FormsModule to imports
  ],
  templateUrl: './chatbot.component.html',
  styleUrls: ['./chatbot.component.css'] // Corrected from styleUrl
})
export class ChatbotComponent implements OnInit, AfterViewChecked {
  @ViewChild('messageContainer') private messageContainer!: ElementRef;

  messages: ChatMessage[] = [];
  userInput: string = '';
  isLoading: boolean = false;
  errorMessage: string | null = null;

  constructor(private chatbotService: ChatbotService) { }

  ngOnInit(): void {
    // Optional: Add an initial greeting message from the bot
    this.messages.push({
      sender: 'bot',
      text: 'مرحباً! كيف يمكنني مساعدتك اليوم؟',
      timestamp: new Date()
    });
  }

  ngAfterViewChecked(): void {
    this.scrollToBottom();
  }

  sendMessage(): void {
    const trimmedInput = this.userInput.trim();
    if (!trimmedInput || this.isLoading) {
      return;
    }

    // Add user message to display
    this.messages.push({
      sender: 'user',
      text: trimmedInput,
      timestamp: new Date()
    });

    this.isLoading = true;
    this.errorMessage = null;
    const currentInput = trimmedInput; // Store the input before clearing
    this.userInput = ''; // Clear input field immediately

    this.chatbotService.generateContent(currentInput).subscribe({
      next: (response: GeminiResponse) => {
        let botReply = 'عذرًا، لم أتمكن من معالجة الرد.'; // Default reply
        try {
          // Extract the text from the first candidate's first part
          if (response.candidates && response.candidates.length > 0 &&
            response.candidates[0].content && response.candidates[0].content.parts &&
            response.candidates[0].content.parts.length > 0) {
            botReply = response.candidates[0].content.parts[0].text;
          } else {
            console.warn('Could not find valid text part in Gemini response:', response);
          }
        } catch (e) {
          console.error('Error extracting text from response:', e, response);
        }

        this.messages.push({
          sender: 'bot',
          text: botReply,
          timestamp: new Date()
        });
        this.isLoading = false;
        this.scrollToBottom(); // Scroll after adding bot message
      },
      error: (err) => {
        console.error('Error from ChatbotService:', err);
        this.errorMessage = err.message || 'حدث خطأ غير متوقع.';
        this.isLoading = false;
        // Optional: Add back the user's input if sending failed
        // this.userInput = currentInput;
      }
    });
  }

  // Function to scroll the message container to the bottom
  private scrollToBottom(): void {
    try {
      if (this.messageContainer) {
        this.messageContainer.nativeElement.scrollTop = this.messageContainer.nativeElement.scrollHeight;
      }
    } catch (err) {
      console.error('Could not scroll to bottom:', err);
    }
  }

}
