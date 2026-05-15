export type ApiMeta = {
  requestId: string;
};

export type ApiSuccess<TData> = {
  ok: true;
  data: TData;
  meta: ApiMeta;
};

export type ApiFailure = {
  ok: false;
  error: {
    code: string;
    message: string;
  };
  meta: ApiMeta;
};

export const ok = <TData>(input: { data: TData; requestId: string }): ApiSuccess<TData> => ({
  ok: true,
  data: input.data,
  meta: {
    requestId: input.requestId
  }
});

export const fail = (input: {
  code: string;
  message: string;
  requestId: string;
}): ApiFailure => ({
  ok: false,
  error: {
    code: input.code,
    message: input.message
  },
  meta: {
    requestId: input.requestId
  }
});
