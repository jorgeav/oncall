import { Faro } from '@grafana/faro-core';
import { initializeFaro, getWebInstrumentations } from '@grafana/faro-web-sdk';
import { TracingInstrumentation, getDefaultOTELInstrumentations } from '@grafana/faro-web-tracing';

import plugin from '../../package.json'; // eslint-disable-line

class FaroHelper {
  faro: Faro;

  initializeFaro() {
    const { faro: faroConfig } = plugin as any;

    if (!faroConfig.enabled || this.faro) {
      return;
    }

    try {
      this.faro = initializeFaro({
        url: faroConfig.url,
        apiKey: faroConfig.apiKey,
        isolate: true,
        instrumentations: [
          ...getWebInstrumentations({
            captureConsole: true,
          }),
          new TracingInstrumentation({
            instrumentations: [...getDefaultOTELInstrumentations([/^((?!\/{0,1}a\/grafana\-oncall\-app\\).)*$/])],
          }),
        ],
        session: (window as any).__PRELOADED_STATE__?.faro?.session,
        app: {
          name: 'Grafana OnCall',
          version: plugin?.version,
        },
      });

      this.faro.api.pushLog(['Faro was initialized for Grafana OnCall']);
    } catch (ex) {}
  }
}

export default new FaroHelper();
