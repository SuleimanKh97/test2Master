import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminBlogPostFormComponent } from './admin-blog-post-form.component';

describe('AdminBlogPostFormComponent', () => {
  let component: AdminBlogPostFormComponent;
  let fixture: ComponentFixture<AdminBlogPostFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AdminBlogPostFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminBlogPostFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
