import { PluginConfig, Plugin, BaseApp, HandleRequest } from 'jovo-core';
import * as Sentry from '@sentry/node';
import _merge = require('lodash.merge');

export interface Config extends PluginConfig {
    dsn: string,
}

export class SentryErrorPlugin implements Plugin {

    // default config
    config: Config = {
        dsn: ''
    };

    constructor(config?: Config) {
        if (config) {
            this.config = _merge(this.config, config);
        }
    }

    /**
     * Hooks up plugin to the "fail" middleware
     * @param app 
     */
    install(app: BaseApp) {
        if( !this.config.dsn ) throw new Error(`Couldn't initialize Raven, missing dsn parameter`);

        Sentry.init({
            dsn: this.config.dsn
        });

        // errors
        app.middleware('fail')!.use(this.error.bind(this));
    }

    uninstall(app: BaseApp){

    }
    /**
     * Will be called every time an error occurs
     * @param handleRequest contains current app?, host?, jovo? and error? instance
     */
    error(handleRequest: HandleRequest): void {
        if (!handleRequest.jovo) {
            return;
        }

        const log = this.createErrorLog(handleRequest);

        
        if( log ) {
            Sentry.configureScope(scope => {
                scope.setTag('locale', log.locale);
                scope.setTag('platform', log.platform);
                if( log.intent ) scope.setTag('intent', log.intent);
                scope.setTag('state', log.state);
                
                scope.setExtra('request', log.request);
                scope.setExtra('session', log.session);
                
                scope.setUser({ id: log.userId });
            });
            Sentry.captureException(handleRequest.error);
        }
    }

    /**
     * Creates log, which will be added to the .pug file
     * @param handleRequest contains current app?, host?, jovo? and error? instance
     */
    createErrorLog(handleRequest: HandleRequest) {
        if (!handleRequest.jovo) {
            return null;
        }
        const data = {
            error: handleRequest.error!,
            session: handleRequest.jovo.getSessionAttributes(),
            request: handleRequest.jovo.$request!,
            stackTrace: handleRequest.error!.stack,
            userId: handleRequest.jovo.$user!.getId(),
            timestamp: handleRequest.jovo.$request!.getTimestamp(),
            locale: handleRequest.jovo.$request!.getLocale(),
            platform: handleRequest.jovo.constructor.name,
            state: handleRequest.jovo.getState() ? handleRequest.jovo.getState() : '-',
            intent: handleRequest.jovo.$request!.getIntentName()
        }
        return data;
    }
}