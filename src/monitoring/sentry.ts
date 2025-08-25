import * as Sentry from "sentry-expo";
import Constants from "expo-constants";

Sentry.init({
    dsn: Constants.expoConfig?.extra?.sentryDsn ?? "",
    enableInExpoDevelopment: true,
    debug: false,
});

export { Sentry };