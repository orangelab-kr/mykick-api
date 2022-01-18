import { Transform } from 'class-transformer';

export const TransferArray = () =>
  Transform(({ value }) => {
    if (value === '') return;
    if (Array.isArray(value)) return value;
    return [value];
  });
