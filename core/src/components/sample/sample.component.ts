import { Component, OnInit } from '@angular/core';
import { SampleService } from '../../services';

@Component({
  selector: 'core-sample',
  templateUrl: './sample.component.html',
  styleUrls: ['./sample.component.scss'],
})
export class SampleComponent implements OnInit {
  name = 'Sample Component';
  serviceSaid: string;

  constructor(private readonly sampleService: SampleService) {
  }

  ngOnInit(): void {
    this.serviceSaid = this.sampleService.getSomeStuff();
  }
}
