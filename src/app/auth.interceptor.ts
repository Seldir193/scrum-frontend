import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Hol das Token aus dem localStorage
    const accessToken = localStorage.getItem('access_token');

    console.log('Access Token:', accessToken);

    // Füge das Token in die Anfrage ein, falls vorhanden
    if (accessToken) {
      req = req.clone({
        setHeaders: {
          Authorization: `Bearer ${accessToken}`
        }
      });
    }

    // Fahre mit der Anfrage fort
    return next.handle(req);
  }
}