import { Routes } from '@angular/router';
import { ChatComponent } from './pages/chat/chat.component';
import { LayoutComponent } from './pages/layout/layout.component';
import { SettingsComponent } from './pages/settings/settings.component';
import { UsersComponent } from './pages/users/users.component';
import { LoginComponent } from './pages/login/login.component';
import { LoginFormComponent } from './components/forms/login-form/login-form.component';
import { UserRegisterComponent } from './pages/login/user-register/user-register.component';
import { loginGuard } from './guards/login.guard';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
    {
        path: 'login',
        component: LoginComponent,
        children: [
            {
                path: '',
                component: LoginFormComponent
            },
            {
                path: 'register',
                component: UserRegisterComponent
            }
        ],
        canActivate: [loginGuard]
    },
    {
        path: '',
        component: LayoutComponent,
        children: [
            {
                path: 'chat',
                component: ChatComponent,
            },
            {
                path: 'settings',
                component: SettingsComponent,
            },
            {
                path: 'users',
                component: UsersComponent,
            },
            {
                path: '**',
                redirectTo: 'chat',
                pathMatch: 'full'
            }
        ],
        canActivateChild: [authGuard]
    }
];
