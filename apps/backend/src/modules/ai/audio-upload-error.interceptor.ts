import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  PayloadTooLargeException,
} from '@nestjs/common';
import { DomainError } from '@ideias/shared';
import { Observable, catchError, throwError } from 'rxjs';

// O limite de tamanho do upload vira o mesmo erro de domínio da validação do controller.
@Injectable()
export class AudioUploadErrorInterceptor implements NestInterceptor {
  intercept(_context: ExecutionContext, next: CallHandler): Observable<unknown> {
    return next.handle().pipe(
      catchError((error: unknown) =>
        throwError(() =>
          error instanceof PayloadTooLargeException
            ? new DomainError('ai.audio.too_large', 422)
            : error,
        ),
      ),
    );
  }
}
