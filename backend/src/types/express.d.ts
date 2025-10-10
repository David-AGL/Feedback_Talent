import { JwtPayload } from "jsonwebtoken";

declare global {
  namespace Express {
    export interface Request {
      user?: {
        id: string;
        role: string;
      };
    }
  }
}
