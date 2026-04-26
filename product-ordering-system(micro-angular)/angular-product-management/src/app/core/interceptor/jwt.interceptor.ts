import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { StorageService } from "../services/storage.service";
import { AuthService } from "../services/auth.service";
import { Router } from "@angular/router";
import { catchError, filter, switchMap, take} from "rxjs";
import { Observable, throwError, BehaviorSubject } from 'rxjs';


@Injectable()
export class JwtInterceptor implements HttpInterceptor{

    private isRefreshing = false;
    private refreshSubject = new BehaviorSubject<string | null>(null);

    constructor(
        private storage : StorageService,
        private auth : AuthService,
        private router : Router
    ){}

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        if(this.isPublicEndpoint(req.url)){
            return next.handle(req);
        }

        const token = this.storage.getToken();
        const authReq = token ? this.addToken(req , token) : req;

        return next.handle(authReq).pipe(
            catchError((err : HttpErrorResponse) => {
                if(err.status === 401){
                    return this.handle401(authReq , next);
                }

                if(err.status === 403){
                              console.error('[Interceptor] 403 Forbidden – insufficient role');
                }

                return throwError(() => err);
            })
        );
    }

    // Helpers
    private addToken(req : HttpRequest<any> , token : string): HttpRequest<any>{
        return req.clone({
            setHeaders : {Authorization : `Bearer ${token}`}
        });
    }

    private handle401(req : HttpRequest<any> , next : HttpHandler) : Observable<HttpEvent<any>>{

        if(this.isRefreshing){
            return this.refreshSubject.pipe(
                filter(t => t !== null),
                take(1),
                switchMap(t => next.handle(this.addToken(req , t!)))
            );
        }
    

    this.isRefreshing = true;
    this.refreshSubject.next(null);

    return this.auth.refreshToken().pipe(
        switchMap(res => {
            this.isRefreshing = false;
            this.refreshSubject.next(res.token);
            return next.handle(this.addToken(req , res.token));
        }),
        catchError(err => {
            this.isRefreshing = false;
            this.auth.logout();
            return throwError(() => err);
        })
    );
    }

    private isPublicEndpoint(url : string) : boolean {
        const publicPaths = [
            '/api/auth/login',
      '/api/auth/register',
      '/api/auth/refresh',
      '/api/auth/validate',
      '/api/auth/health',
      '/api/otp/',
      '/api/password/',
      '/api/auth/phone/',
      '/api/oauth2/',
      '/oauth2/',
      '/login/oauth2/',
      '/api/en1/test/public',
      '/api/en2/test/public',
      '/api/en2/user/',
      '/api/en2/sync',
      '/api/users/sync',
      '/api/orders/product/',
      '/api/orders/user/',
        ];

            return publicPaths.some(p => url.includes(p));

    }
}