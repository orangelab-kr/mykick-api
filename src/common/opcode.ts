import { HttpException, HttpStatus } from '@nestjs/common';

function $(opcode: number, statusCode: number, message?: string) {
  return (details: { [key: string]: any } = {}) =>
    new HttpException({ opcode, message, ...details }, statusCode);
}

export const Opcode = {
  Success: $(0, HttpStatus.OK, 'Success'),
  ValidateFailed: $(1, HttpStatus.BAD_REQUEST, 'ValidateFailed'),
  ExistsPricingName: $(2, HttpStatus.CONFLICT, 'ExistsPricingName'),
  CannotFindPricing: $(3, HttpStatus.NOT_FOUND, 'CannotFindPricing'),
};
