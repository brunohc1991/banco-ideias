import { PayloadTooLargeException } from '@nestjs/common';
import { firstValueFrom, of, throwError } from 'rxjs';
import { AudioUploadErrorInterceptor } from './audio-upload-error.interceptor';

const interceptor = new AudioUploadErrorInterceptor();

describe('AudioUploadErrorInterceptor', () => {
  it('converte o erro de tamanho do upload em ai.audio.too_large', async () => {
    const handler = { handle: () => throwError(() => new PayloadTooLargeException()) };

    await expect(firstValueFrom(interceptor.intercept({} as never, handler))).rejects.toMatchObject({
      statusCode: 422,
      message: 'ai.audio.too_large',
    });
  });

  it('repassa outros erros e respostas', async () => {
    const boom = new Error('boom');

    await expect(
      firstValueFrom(interceptor.intercept({} as never, { handle: () => throwError(() => boom) })),
    ).rejects.toBe(boom);
    await expect(
      firstValueFrom(interceptor.intercept({} as never, { handle: () => of('ok') })),
    ).resolves.toBe('ok');
  });
});
