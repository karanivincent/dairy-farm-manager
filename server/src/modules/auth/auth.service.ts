import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import { User } from '../users/entities/user.entity';
import {
  LoginDto,
  RegisterDto,
  RefreshTokenDto,
  ForgotPasswordDto,
  ResetPasswordDto,
} from './dto';
import { JwtPayload, AuthResponse } from './interfaces/jwt-payload.interface';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async validateUser(emailOrUsername: string, password: string): Promise<User | null> {
    console.log('ValidateUser called with:', { emailOrUsername });
    
    // Check if input is email or username
    const isEmail = emailOrUsername.includes('@');
    console.log('Is email:', isEmail);
    
    const user = isEmail
      ? await this.usersService.findByEmail(emailOrUsername)
      : await this.usersService.findByUsername(emailOrUsername);

    console.log('User found:', !!user);
    
    if (!user) {
      console.log('User not found');
      return null;
    }

    console.log('Validating password...');
    const isPasswordValid = await user.validatePassword(password);
    console.log('Password valid:', isPasswordValid);
    
    if (!isPasswordValid) {
      return null;
    }

    if (!user.isActive) {
      console.log('User is inactive');
      throw new UnauthorizedException('Account is inactive');
    }

    return user;
  }

  async login(loginDto: LoginDto): Promise<AuthResponse> {
    console.log('Login attempt with:', { emailOrUsername: loginDto.emailOrUsername });
    
    const user = await this.validateUser(loginDto.emailOrUsername, loginDto.password);
    
    if (!user) {
      console.log('Login failed: Invalid credentials');
      throw new UnauthorizedException('Invalid credentials');
    }

    console.log('Login successful for user:', user.email);
    
    // Update last login
    await this.usersService.updateLastLogin(user.id);

    return this.generateTokens(user);
  }

  async register(registerDto: RegisterDto): Promise<AuthResponse> {
    try {
      const user = await this.usersService.create(registerDto);
      return this.generateTokens(user);
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new BadRequestException('Registration failed');
    }
  }

  async refreshToken(refreshTokenDto: RefreshTokenDto): Promise<AuthResponse> {
    try {
      // Verify refresh token
      const payload = await this.jwtService.verifyAsync(refreshTokenDto.refreshToken, {
        secret: this.configService.get<string>('jwt.refreshSecret'),
      });

      // Find user by refresh token
      const user = await this.usersService.findByRefreshToken(refreshTokenDto.refreshToken);
      
      if (!user || user.id !== payload.sub) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      if (!user.isActive) {
        throw new UnauthorizedException('Account is inactive');
      }

      return this.generateTokens(user);
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async logout(userId: number): Promise<void> {
    await this.usersService.setRefreshToken(userId, null);
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto): Promise<{ message: string }> {
    const user = await this.usersService.findByEmail(forgotPasswordDto.email);
    
    if (!user) {
      // Don't reveal if email exists
      return { message: 'If the email exists, a reset link has been sent' };
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date();
    resetTokenExpiry.setHours(resetTokenExpiry.getHours() + 1); // 1 hour expiry

    // Save token to user (in real app, would hash this)
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = resetTokenExpiry;
    await this.usersService.update(user.id, {
      // Note: In a real implementation, you'd need to handle these fields in the update method
    });

    // TODO: Send email with reset link
    // In a real application, you would send an email here
    console.log(`Reset token for ${user.email}: ${resetToken}`);

    return { message: 'If the email exists, a reset link has been sent' };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto): Promise<{ message: string }> {
    const user = await this.usersService.findAll().then(users =>
      users.find(u => u.resetPasswordToken === resetPasswordDto.token)
    );

    if (!user || !user.resetPasswordExpires || user.resetPasswordExpires < new Date()) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    // Update password
    await this.usersService.updatePassword(user.id, resetPasswordDto.newPassword);

    // Clear reset token
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await this.usersService.update(user.id, {});

    return { message: 'Password has been reset successfully' };
  }

  async getProfile(userId: number): Promise<User> {
    return this.usersService.findById(userId);
  }

  private async generateTokens(user: User): Promise<AuthResponse> {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('jwt.refreshSecret'),
        expiresIn: this.configService.get<string>('jwt.refreshExpiresIn'),
      }),
    ]);

    // Save refresh token to database
    await this.usersService.setRefreshToken(user.id, refreshToken);

    return {
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
      accessToken,
      refreshToken,
    };
  }
}