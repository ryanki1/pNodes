import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { en_US, provideNzI18n } from 'ng-zorro-antd/i18n';
import { registerLocaleData } from '@angular/common';
import en from '@angular/common/locales/en';

import { routes } from './app.routes';
import { provideNzIcons } from 'ng-zorro-antd/icon';
import { ReloadOutline } from '@ant-design/icons-angular/icons'
import { provideEchartsCore} from 'ngx-echarts';
import * as echarts from 'echarts/core';
import { BarChart, LineChart, BarSeriesOption, LineSeriesOption }  from 'echarts/charts';
import { GridComponent } from 'echarts/components';
import { SVGRenderer } from 'echarts/renderers';
echarts.use([BarChart, GridComponent, SVGRenderer]);

registerLocaleData(en);

const icons = [ReloadOutline];

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(),
    provideAnimations(),
    provideNzI18n(en_US),
    provideNzIcons(icons),
    provideEchartsCore({ echarts })
  ]
};
