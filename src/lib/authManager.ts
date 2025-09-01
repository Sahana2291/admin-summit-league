// src/lib/authManager.ts
export class AuthManager {
    private static instance: AuthManager;
    private inactivityTimer: NodeJS.Timeout | null = null;
    private sessionCheckInterval: NodeJS.Timeout | null = null;
    private broadcastChannel: BroadcastChannel | null = null;
    private isInitialized = false;

    // Configuration
    private readonly INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutes
    private readonly SESSION_CHECK_INTERVAL = 60 * 1000; // 1 minute
    private readonly SESSION_KEY = 'admin-session';
    private readonly BROADCAST_CHANNEL_NAME = 'admin-auth';

    // Events to track user activity
    private readonly ACTIVITY_EVENTS = [
        'mousedown',
        'mousemove',
        'keypress',
        'scroll',
        'touchstart',
        'click',
    ];

    private constructor() { }

    static getInstance(): AuthManager {
        if (!AuthManager.instance) {
            AuthManager.instance = new AuthManager();
        }
        return AuthManager.instance;
    }

    initialize(logoutCallback: () => void) {
        if (this.isInitialized) return;

        this.isInitialized = true;
        this.setupBroadcastChannel(logoutCallback);
        this.setupInactivityTimer(logoutCallback);
        this.setupSessionMonitoring(logoutCallback);
        this.setupBeforeUnloadHandler();
        this.setupVisibilityChangeHandler();
    }

    destroy() {
        this.clearInactivityTimer();
        this.clearSessionCheck();
        this.removeBroadcastChannel();
        this.removeActivityListeners();
        this.isInitialized = false;
    }

    // Broadcast Channel for cross-tab communication
    private setupBroadcastChannel(logoutCallback: () => void) {
        if (typeof BroadcastChannel !== 'undefined') {
            this.broadcastChannel = new BroadcastChannel(this.BROADCAST_CHANNEL_NAME);

            this.broadcastChannel.addEventListener('message', (event) => {
                switch (event.data.type) {
                    case 'LOGOUT':
                        this.clearInactivityTimer();
                        logoutCallback();
                        break;
                    case 'LOGIN':
                        // Only refresh if we don't have a valid session
                        if (!this.isSessionValid()) {
                            window.location.reload();
                        }
                        break;
                    case 'SESSION_EXPIRED':
                        this.clearInactivityTimer();
                        logoutCallback();
                        break;
                }
            });
        }
    }

    // Inactivity timer management
    private setupInactivityTimer(logoutCallback: () => void) {
        this.resetInactivityTimer(logoutCallback);
        this.addActivityListeners(() => this.resetInactivityTimer(logoutCallback));
    }

    private resetInactivityTimer(logoutCallback: () => void) {
        this.clearInactivityTimer();

        this.inactivityTimer = setTimeout(() => {
            this.broadcastLogout();
            logoutCallback();
        }, this.INACTIVITY_TIMEOUT);
    }

    private clearInactivityTimer() {
        if (this.inactivityTimer) {
            clearTimeout(this.inactivityTimer);
            this.inactivityTimer = null;
        }
    }

    private activityHandler = () => { };

    private addActivityListeners(resetCallback: () => void) {
        this.activityHandler = resetCallback;
        this.ACTIVITY_EVENTS.forEach(event => {
            document.addEventListener(event, this.activityHandler, { passive: true });
        });
    }

    private removeActivityListeners() {
        this.ACTIVITY_EVENTS.forEach(event => {
            document.removeEventListener(event, this.activityHandler, { passive: true });
        });
    }

    // Session monitoring (checks if session is valid)
    private setupSessionMonitoring(logoutCallback: () => void) {
        this.sessionCheckInterval = setInterval(() => {
            this.checkSessionValidity(logoutCallback);
        }, this.SESSION_CHECK_INTERVAL);
    }

    private clearSessionCheck() {
        if (this.sessionCheckInterval) {
            clearInterval(this.sessionCheckInterval);
            this.sessionCheckInterval = null;
        }
    }

    private checkSessionValidity(logoutCallback: () => void) {
        const sessionData = localStorage.getItem(this.SESSION_KEY);
        if (!sessionData) return;

        try {
            const session = JSON.parse(sessionData);
            const now = Date.now();

            // Check if session has expired
            if (session.expiresAt && now > session.expiresAt) {
                this.broadcastMessage({ type: 'SESSION_EXPIRED' });
                logoutCallback();
                return;
            }

            // Update last activity timestamp
            session.lastActivity = now;
            localStorage.setItem(this.SESSION_KEY, JSON.stringify(session));

        } catch (error) {
            console.error('Session validation error:', error);
            logoutCallback();
        }
    }

    // Browser close/refresh handling
    private setupBeforeUnloadHandler() {
        window.addEventListener('beforeunload', () => {
            this.updateSessionActivity();
        });
    }

    // Tab visibility change handling
    private setupVisibilityChangeHandler() {
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible') {
                // Tab became visible, check if we're still authenticated
                const sessionData = localStorage.getItem(this.SESSION_KEY);
                if (!sessionData) {
                    this.broadcastMessage({ type: 'SESSION_EXPIRED' });
                }
            }
        });
    }

    // Public methods for auth state management
    login(adminData: any) {
        const sessionData = {
            admin: adminData,
            loginTime: Date.now(),
            lastActivity: Date.now(),
            expiresAt: Date.now() + (24 * 60 * 60 * 1000), // 24 hours
        };

        localStorage.setItem(this.SESSION_KEY, JSON.stringify(sessionData));
        this.broadcastMessage({ type: 'LOGIN', data: adminData });
    }

    logout() {
        localStorage.removeItem(this.SESSION_KEY);
        this.broadcastLogout();
        this.destroy();
    }

    refreshSession(): boolean {
        const session = this.getSessionInfo();
        if (!session) return false;

        const now = Date.now();
        const timeUntilExpiry = session.expiresAt - now;
        const refreshThreshold = 2 * 60 * 60 * 1000; // 2 hours

        if (timeUntilExpiry < refreshThreshold) {
            // Extend session
            session.expiresAt = now + (24 * 60 * 60 * 1000);
            localStorage.setItem(this.SESSION_KEY, JSON.stringify(session));
            return true;
        }
        return false;
    }

    private broadcastLogout() {
        this.broadcastMessage({ type: 'LOGOUT' });
    }

    private broadcastMessage(message: any) {
        if (this.broadcastChannel) {
            this.broadcastChannel.postMessage(message);
        }
    }

    private updateSessionActivity() {
        const sessionData = localStorage.getItem(this.SESSION_KEY);
        if (!sessionData) return;

        try {
            const session = JSON.parse(sessionData);
            session.lastActivity = Date.now();
            localStorage.setItem(this.SESSION_KEY, JSON.stringify(session));
        } catch (error) {
            console.error('Error updating session activity:', error);
        }
    }

    private removeBroadcastChannel() {
        if (this.broadcastChannel) {
            this.broadcastChannel.close();
            this.broadcastChannel = null;
        }
    }

    // Get session info
    getSessionInfo() {
        const sessionData = localStorage.getItem(this.SESSION_KEY);
        if (!sessionData) return null;

        try {
            return JSON.parse(sessionData);
        } catch {
            return null;
        }
    }

    isSessionValid(): boolean {
        const session = this.getSessionInfo();
        if (!session) return false;

        const now = Date.now();
        return now < session.expiresAt;
    }
}
