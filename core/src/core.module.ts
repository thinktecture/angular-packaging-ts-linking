import { ModuleWithProviders, NgModule } from '@angular/core';
import { COMPONENTS } from './components';
import { SERVICES } from './services';

export * from './components/index';
export * from './services/index';

@NgModule({
  declarations: [...COMPONENTS],
  exports: [...COMPONENTS],
})
export class CoreModule {
  static forRoot = (): ModuleWithProviders => ({
    ngModule: CoreModule,
    providers: [...SERVICES],
  });
}
