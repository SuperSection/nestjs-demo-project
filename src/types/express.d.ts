import { JwtPayload } from 'jsonwebtoken';

declare global {
  namespace Express {
    interface User extends JwtPayload {
      email?: string;
    }

    interface Request {
      user?: User;
    }
  }
}
