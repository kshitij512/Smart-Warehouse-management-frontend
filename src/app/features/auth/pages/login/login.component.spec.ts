import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoginComponent } from './login.component';
import { provideMockStore, MockStore } from '@ngrx/store/testing';
import * as AuthActions from '../../../../store/auth/auth.actions';

describe('LoginComponent', () => {

  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let store: MockStore;

  beforeEach(async () => {

    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [provideMockStore()]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    store = TestBed.inject(MockStore);

    fixture.detectChanges();
  });

  it('should dispatch login action on submit', () => {

    const dispatchSpy = spyOn(store, 'dispatch');

    component.form.setValue({
      email: 'admin@test.com',
      password: '1234'
    });

    component.submit();

    expect(dispatchSpy).toHaveBeenCalledWith(
      AuthActions.login({
        email: 'admin@test.com',
        password: '1234'
      })
    );
  });

});