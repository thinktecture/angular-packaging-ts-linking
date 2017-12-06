import { Provider } from '@angular/core';
import { SampleService } from './sample.service';

export * from './sample.service';

export const SERVICES: Provider[] = [
  SampleService,
];
