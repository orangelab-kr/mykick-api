import { HttpException, HttpStatus } from '@nestjs/common';

export function $(opcode: number, statusCode: number, message?: string) {
  return (details: { [key: string]: any } = {}) =>
    new HttpException({ opcode, message, ...details }, statusCode);
}

export const Opcode = {
  Success: $(0, HttpStatus.OK, 'Success'),
  InvalidError: $(
    1,
    HttpStatus.INTERNAL_SERVER_ERROR,
    '알 수 없는 내부 오류가 발생하였습니다.',
  ),
  ValidateFailed: $(
    2,
    HttpStatus.BAD_REQUEST,
    '모든 정보를 올바르게 입력해주세요.',
  ),
  RequiredAccessKey: $(3, HttpStatus.FORBIDDEN, '액세스토큰이 필요합니다.'),
  ExistsPricingName: $(
    4,
    HttpStatus.CONFLICT,
    '이미 사용중인 가격표 이름입니다.',
  ),
  CannotFindPricing: $(5, HttpStatus.NOT_FOUND, '가격표를 찾을 수 없습니다.'),
  ExistsAddonName: $(
    6,
    HttpStatus.CONFLICT,
    '이미 존재하는 추가상품 이름입니다.',
  ),
  CannotFindAddon: $(7, HttpStatus.NOT_FOUND, '추가상품을 찾을 수 없습니다.'),
  ExistsUserPhoneNo: $(8, HttpStatus.CONFLICT, '이미 사용중인 전화번호입니다.'),
  CannotFindUser: $(9, HttpStatus.NOT_FOUND, '사용자를 찾을 수 없습니다.'),
  InvalidPhone: $(10, HttpStatus.NOT_FOUND, '전화번호를 다시 인증해야합니다.'),
  InvalidSession: $(10, HttpStatus.UNAUTHORIZED, '로그인이 필요합니다.'),
  CannotFindCard: $(11, HttpStatus.NOT_FOUND, '카드를 찾을 수 없습니다.'),
  CannotGetCheckout: $(
    12,
    HttpStatus.BAD_REQUEST,
    '토스 페이와 연동하는 과정에 오류가 발생하였습니다.',
  ),
  ExistsCardName: $(
    13,
    HttpStatus.BAD_REQUEST,
    '이미 존재하는 카드 이름입니다.',
  ),
  PaymentFailed: $(14, HttpStatus.PAYMENT_REQUIRED, '결제를 실패하였습니다.'),
  CantChangeRentStatus: $(
    15,
    HttpStatus.BAD_REQUEST,
    '렌트 상태를 변경할 수 없습니다.',
  ),
  NoKickboardInRent: $(
    16,
    HttpStatus.NOT_FOUND,
    '해당 렌트에는 킥보드가 배정되지 않았습니다.',
  ),
  CannotFindRent: $(17, HttpStatus.NOT_FOUND, '렌트를 찾을 수 없습니다.'),
  CannotActivateRent: $(
    18,
    HttpStatus.BAD_REQUEST,
    '렌트를 활성화할 수 없습니다.',
  ),
  InvalidQrcode: $(19, HttpStatus.NOT_FOUND, '잘못된 QR코드입니다.'),
  MustBeShipped: $(20, HttpStatus.BAD_REQUEST, '배송 후 활성화할 수 있습니다.'),
  InvalidVerifyCode: $(21, HttpStatus.NOT_FOUND, '잘못된 인증번호입니다.'),
  PhoneDaliyLimit: $(
    22,
    HttpStatus.TOO_MANY_REQUESTS,
    '1일 문자 요청 한도를 초과하였습니다.',
  ),
  CannotRegisterCard: $(
    23,
    HttpStatus.BAD_REQUEST,
    '카드를 등록할 수 없습니다.',
  ),
  RentHasSuspended: $(
    24,
    HttpStatus.FORBIDDEN,
    '마이킥은 현재 일시정지 상태입니다.',
  ),
  RentHasRemainingMonthsYet: $(
    25,
    HttpStatus.BAD_REQUEST,
    '아직 계약 기간이 남아있습니다.',
  ),
  CannotFindPayment: $(
    26,
    HttpStatus.NOT_FOUND,
    '결제 내역을 찾을 수 없습니다.',
  ),
  CannotFindProvider: $(27, HttpStatus.NOT_FOUND, '제공자를 찾을 수 없습니다.'),
  ExistsProviderName: $(
    27,
    HttpStatus.CONFLICT,
    '이미 사용중인 제공자 이름입니다.',
  ),
  AlreadyAssignmentKickboard: $(
    28,
    HttpStatus.CONFLICT,
    '이미 배정된 킥보드입니다.',
  ),
};
