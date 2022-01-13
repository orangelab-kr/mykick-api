import { HttpException, HttpStatus } from '@nestjs/common';

function $(opcode: number, statusCode: number, message?: string) {
  return (details: { [key: string]: any } = {}) =>
    new HttpException({ opcode, message, ...details }, statusCode);
}

export const Opcode = {
  Success: $(0, HttpStatus.OK, 'Success'),
  InvalidError: $(1, HttpStatus.INTERNAL_SERVER_ERROR, 'InvalidError'),
  ValidateFailed: $(2, HttpStatus.BAD_REQUEST, 'ValidateFailed'),
  ExistsPricingName: $(3, HttpStatus.CONFLICT, 'ExistsPricingName'),
  CannotFindPricing: $(4, HttpStatus.NOT_FOUND, 'CannotFindPricing'),
  ExistsAddonName: $(5, HttpStatus.CONFLICT, 'ExistsAddonName'),
  CannotFindAddon: $(6, HttpStatus.NOT_FOUND, 'CannotFindAddon'),
  ExistsUserPhoneNo: $(7, HttpStatus.CONFLICT, 'ExistsUserPhoneNo'),
  CannotFindUser: $(8, HttpStatus.NOT_FOUND, 'CannotFindUser'),
  PhoneDaliyLimit: $(9, HttpStatus.TOO_MANY_REQUESTS, 'PhoneDaliyLimit'),
  InvalidVerifyCode: $(9, HttpStatus.NOT_FOUND, 'InvalidVerifyCode'),
  InvalidPhone: $(10, HttpStatus.NOT_FOUND, 'InvalidPhone'),
  InvalidSession: $(10, HttpStatus.NOT_FOUND, 'InvalidSession'),
};
