import { async, ComponentFixture, TestBed } from "@angular/core/testing";
import { RouterTestingModule } from "@angular/router/testing";
import { List } from "immutable";
import { APAnalysis } from "src/app/electron/models/analysis";
import { AnalysisProcessingType } from "src/app/electron/models/analysisHelper";
import { WizardService } from "src/app/electron/services/wizard/wizard.service";
import { SharedModule } from "../../shared/shared.module";
import { ConfirmationComponent } from "./confirmation.component";

describe("ConfirmationComponent", () => {
  let component: ConfirmationComponent;
  let fixture: ComponentFixture<ConfirmationComponent>;
  let wizard: WizardService;
  let analysis: APAnalysis;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ConfirmationComponent],
      imports: [SharedModule, RouterTestingModule]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfirmationComponent);
    component = fixture.componentInstance;
    wizard = TestBed.get(WizardService);

    analysis = new APAnalysis(
      AnalysisProcessingType.audio2csv,
      "Basic Analysis",
      "Description",
      {
        template: APAnalysis.apConfigDirectory + "/Towsey.Acoustic.yml",
        changes: {}
      },
      {}
    );
  });

  it("should create", () => {
    spyOn(wizard, "getAnalyses").and.callFake(() => List([analysis]).toArray());
    fixture.detectChanges();

    expect(component).toBeTruthy();
  });

  it("should have header", () => {
    spyOn(wizard, "getAnalyses").and.callFake(() => List([analysis]).toArray());
    fixture.detectChanges();

    const header = fixture.nativeElement.querySelector("h1.display-4");
    expect(header).toBeTruthy();
    expect(header.innerText).toContain("Run Analysis");
  });
});
