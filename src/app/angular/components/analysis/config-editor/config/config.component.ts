import { Component, Input } from "@angular/core";

@Component({
  selector: "app-config",
  template: `
    <div *ngFor="let option of config" class="form-group row">
      <!-- Input form -->
      <ng-container *ngIf="!option.hasChildren; else children">
        <label
          [for]="option.label"
          class="col-sm-6 col-md-4 col-lg-3 col-form-label"
        >
          {{ option.label }}
        </label>
        <div class="col-sm-6 col-md-8 col-lg-9">
          <input
            class="form-control"
            [id]="option.label"
            [type]="option.type"
            [value]="getValue(option)"
            [(ngModel)]="option.value"
          />
        </div>
      </ng-container>

      <!-- Title with inputs -->
      <ng-template #children>
        <label class="col-12">{{ option.label }}</label>

        <div class="pl-5 col-12">
          <app-config [config]="getChildConfig(option.value)"></app-config>
        </div>
      </ng-template>
    </div>
  `
})
export class ConfigComponent {
  @Input() config: Config[];

  constructor() {}

  public getValue(config: Config): string {
    return config.value.toString();
  }

  public getChildConfig(value: string | number | Config[]): Config[] {
    if (value instanceof Array) {
      return value;
    } else {
      return null;
    }
  }
}

export interface Config {
  label: string;
  type?: "text" | "number";
  value: string | Config[];
  hasChildren: boolean;
}
