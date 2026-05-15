export class AppError extends Error {
  readonly code: string;
  readonly statusCode: number;

  constructor(input: { code: string; message: string; statusCode: number }) {
    super(input.message);
    this.name = "AppError";
    this.code = input.code;
    this.statusCode = input.statusCode;
  }
}
