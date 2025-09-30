import { User, LoginRequest, RegisterRequest, AuthResponse, ProfileUpdateRequest } from './user.model';

describe('User Interface', () => {
  it('should create a valid User object', () => {
    const user: User = {
      _id: 'user1',
      name: 'John Doe',
      email: 'john@example.com',
      role: 'customer',
      profilePhoto: 'https://example.com/photo.jpg',
      createdAt: new Date('2025-01-01'),
      updatedAt: new Date('2025-01-01')
    };

    expect(user._id).toBe('user1');
    expect(user.name).toBe('John Doe');
    expect(user.email).toBe('john@example.com');
    expect(user.role).toBe('customer');
    expect(user.profilePhoto).toBe('https://example.com/photo.jpg');
    expect(user.createdAt).toBeInstanceOf(Date);
    expect(user.updatedAt).toBeInstanceOf(Date);
  });

  it('should create User without optional profilePhoto', () => {
    const user: User = {
      _id: 'user2',
      name: 'Jane Doe',
      email: 'jane@example.com',
      role: 'agent',
      createdAt: new Date('2025-01-01'),
      updatedAt: new Date('2025-01-01')
    };

    expect(user._id).toBe('user2');
    expect(user.name).toBe('Jane Doe');
    expect(user.email).toBe('jane@example.com');
    expect(user.role).toBe('agent');
    expect(user.profilePhoto).toBeUndefined();
  });

  it('should handle different roles', () => {
    const roles: User['role'][] = ['customer', 'agent', 'admin'];
    
    roles.forEach(role => {
      const user: User = {
        _id: 'user1',
        name: 'Test User',
        email: 'test@example.com',
        role,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      expect(user.role).toBe(role);
    });
  });
});

describe('LoginRequest Interface', () => {
  it('should create a valid LoginRequest object', () => {
    const loginRequest: LoginRequest = {
      email: 'user@example.com',
      password: 'password123'
    };

    expect(loginRequest.email).toBe('user@example.com');
    expect(loginRequest.password).toBe('password123');
  });
});

describe('RegisterRequest Interface', () => {
  it('should create a valid RegisterRequest object', () => {
    const registerRequest: RegisterRequest = {
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
      role: 'customer'
    };

    expect(registerRequest.name).toBe('John Doe');
    expect(registerRequest.email).toBe('john@example.com');
    expect(registerRequest.password).toBe('password123');
    expect(registerRequest.role).toBe('customer');
  });

  it('should handle different roles', () => {
    const roles: RegisterRequest['role'][] = ['customer', 'agent'];
    
    roles.forEach(role => {
      const registerRequest: RegisterRequest = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        role
      };

      expect(registerRequest.role).toBe(role);
    });
  });
});

describe('AuthResponse Interface', () => {
  it('should create a valid AuthResponse object', () => {
    const user: User = {
      _id: 'user1',
      name: 'John Doe',
      email: 'john@example.com',
      role: 'customer',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const authResponse: AuthResponse = {
      token: 'jwt-token-123',
      user
    };

    expect(authResponse.token).toBe('jwt-token-123');
    expect(authResponse.user).toBe(user);
    expect(authResponse.user._id).toBe('user1');
    expect(authResponse.user.name).toBe('John Doe');
    expect(authResponse.user.email).toBe('john@example.com');
    expect(authResponse.user.role).toBe('customer');
  });
});

describe('ProfileUpdateRequest Interface', () => {
  it('should create a valid ProfileUpdateRequest object with all fields', () => {
    const profileUpdate: ProfileUpdateRequest = {
      name: 'Updated Name',
      email: 'updated@example.com',
      profilePhoto: 'https://example.com/new-photo.jpg'
    };

    expect(profileUpdate.name).toBe('Updated Name');
    expect(profileUpdate.email).toBe('updated@example.com');
    expect(profileUpdate.profilePhoto).toBe('https://example.com/new-photo.jpg');
  });

  it('should create ProfileUpdateRequest with partial fields', () => {
    const profileUpdate: ProfileUpdateRequest = {
      name: 'Updated Name'
    };

    expect(profileUpdate.name).toBe('Updated Name');
    expect(profileUpdate.email).toBeUndefined();
    expect(profileUpdate.profilePhoto).toBeUndefined();
  });

  it('should create empty ProfileUpdateRequest', () => {
    const profileUpdate: ProfileUpdateRequest = {};

    expect(profileUpdate.name).toBeUndefined();
    expect(profileUpdate.email).toBeUndefined();
    expect(profileUpdate.profilePhoto).toBeUndefined();
  });
});





