import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from "@angular/platform-browser";

import { FooterComponent } from './footer.component';

describe('FooterComponent', () => {
  let component: FooterComponent;
  let fixture: ComponentFixture<FooterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FooterComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FooterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have the correct footer links', () => {
    const linkTitles = ['Copyright', 'Disclaimer', 'Privacy'];
    const dELis = fixture.debugElement.queryAll(By.css('li'));

    for(let i = 0; i<dELis.length; i++)
    {
      expect(dELis[i].nativeElement.textContent).toContain(linkTitles[i]);
    }
  });

  it('should have the correct CRICOS code', () => {
    const cricosProviderCode = 'CRICOS Provider Code: 00113B';
    const paragraphs = fixture.debugElement.queryAll(By.css('p'));

      expect(paragraphs[0].nativeElement.textContent).toContain(cricosProviderCode);
  });

  it('should have the correct acknowledgment', () => {
    const acknowledgeTraditionalOwners = 'We acknowledge the traditional owners of the lands on which Deakin University stands and we pay our respect.';
    const paragraphs = fixture.debugElement.queryAll(By.css('p'));

    expect(paragraphs[1].nativeElement.textContent).toContain(acknowledgeTraditionalOwners);
  });

  it('should have the correct copyright & year', () => {
    const currentYear = new Date().getFullYear();
    const copyrightAndYear = `Copyright ${currentYear} Deakin University.`;
    const paragraphs = fixture.debugElement.queryAll(By.css('p'));

    expect(paragraphs[2].nativeElement.textContent).toContain(copyrightAndYear);
  });

});
