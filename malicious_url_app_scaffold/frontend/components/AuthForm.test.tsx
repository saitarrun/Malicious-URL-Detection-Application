import { render, screen, fireEvent } from '@testing-library/react';
import AuthForm from './AuthForm';
import { AuthContext } from '../context/AuthContext';

const mockLogin = jest.fn();
const mockRegister = jest.fn();

jest.mock('next/router', () => ({
  useRouter() {
    return {
      push: jest.fn(),
    };
  },
}));

const renderWithAuthContext = (component: React.ReactElement, isRegister = false) => {
  return render(
    <AuthContext.Provider value={{ login: mockLogin, register: mockRegister, user: null }}>
      {component}
    </AuthContext.Provider>
  );
};

describe('AuthForm', () => {
  it('should render login form by default', () => {
    renderWithAuthContext(<AuthForm />);
    expect(screen.getByText('Welcome back')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('username')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Log in' })).toBeInTheDocument();
  });

  it('should render register form when isRegister is true', () => {
    renderWithAuthContext(<AuthForm isRegister />);
    expect(screen.getByText('Create account')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('username')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sign up' })).toBeInTheDocument();
  });

  it('should call login function on form submission', async () => {
    renderWithAuthContext(<AuthForm />);
    fireEvent.change(screen.getByPlaceholderText('username'), { target: { value: 'testuser' } });
    fireEvent.change(screen.getByPlaceholderText('password'), { target: { value: 'password' } });
    fireEvent.click(screen.getByRole('button', { name: 'Log in' }));
    expect(mockLogin).toHaveBeenCalledWith('testuser', 'password');
  });

  it('should call register function on form submission when isRegister is true', async () => {
    renderWithAuthContext(<AuthForm isRegister />);
    fireEvent.change(screen.getByPlaceholderText('username'), { target: { value: 'testuser' } });
    fireEvent.change(screen.getByPlaceholderText('password'), { target: { value: 'password' } });
    fireEvent.click(screen.getByRole('button', { name: 'Sign up' }));
    expect(mockRegister).toHaveBeenCalledWith('testuser', 'password');
  });
});
