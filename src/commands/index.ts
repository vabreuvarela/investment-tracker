export class RegisterCommand {
  constructor(
    public email: string,
    public password: string
  ) {}
}

export class LoginCommand {
  constructor(
    public email: string,
    public password: string
  ) {}
}

export class LogoutCommand {
  constructor(
    public userId: string
  ) {}
}

export class RefreshTokenCommand {
  constructor(
    public userId: string,
    public email: string
  ) {}
}

export class UpdateUserCommand {
  constructor(
    public userId: string,
    public email?: string,
    public password?: string
  ) {}
}

export class DeleteUserCommand {
  constructor(
    public userId: string
  ) {}
}
