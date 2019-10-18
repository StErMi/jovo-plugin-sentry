# Installation

```sh
$ npm install jovo-plugin-sentry --save
```

In your Jovo project:

```javascript
// src/app.ts
import { SentryErrorPlugin } from 'jovo-plugin-sentry';


app.use(
	// other plugins, platforms, etc.
	new  SentryErrorPlugin()
);
```

# Customize
NOTE: The *dsn* is a **required** parameter


You can use the `config.ts` file to add the changes in the following format:

```javascript
const config = {
    plugin: {
        SentryErrorPlugin: {
            dsn: '<YOUR_DSN_HERE>'
        }
    }
};

export = config;
```

# License

Apache-2.0