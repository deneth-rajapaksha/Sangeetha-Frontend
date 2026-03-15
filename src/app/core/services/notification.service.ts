import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
    providedIn: 'root'
})
export class NotificationService {
    constructor(private snackbar: MatSnackBar) { }

    success(message: string) {
        this.snackbar.open(message, 'Close', {
            duration: 5000,
            panelClass: ['notification-success'],
            verticalPosition: 'top'
        });
    }

    error(message: string) {
        this.snackbar.open(message, 'Close', {
            duration: 5000,
            panelClass: ['notification-error'],
            verticalPosition: 'top'
        });
    }
}
