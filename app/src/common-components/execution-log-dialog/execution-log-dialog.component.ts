import { DIALOG_DATA } from '@angular/cdk/dialog';
import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Inject,
  OnInit,
  Renderer2,
} from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { saveAs } from 'file-saver';
import { RunhistoriesService } from 'src/app/shared/services/runhistories.service';

@Component({
  selector: 'app-execution-log-dialog',
  templateUrl: './execution-log-dialog.component.html',
  styleUrls: ['./execution-log-dialog.component.scss'],
})
export class ExecutionLogDialogComponent implements OnInit, AfterViewInit {
  integrationId: any;
  runId: any;
  log: any;
  searchTerm = '';
  highlightedLog: SafeHtml = '';
  searchResults: number[] = [];
  currentResultIndex = 0;

  constructor(
    @Inject(DIALOG_DATA) public data: any,
    private runHistoriesService: RunhistoriesService,
    private sanitizer: DomSanitizer,
    private renderer: Renderer2,
    private elementRef: ElementRef,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    this.integrationId =
      this.data?.integrationId?._id || this.data?.integrationId;
    this.runId = this.data?.runId;
    this.getLogs();
  }

  ngAfterViewInit() {
    this.applyHighlightStyles();
    this.scrollToResult(0);
  }

  getLogs() {
    const params = {
      integrationId: this.integrationId,
      runId: this.runId,
    };

    if (this.integrationId && this.runId) {
      this.runHistoriesService.getLogFile(params).subscribe((res) => {
        if (res && res.body) {
          const uint8Array = new Uint8Array(res.body.data);
          const blob = new Blob([uint8Array], {
            type: `text/log;charset=utf-8`,
          });
          const reader = new FileReader();

          reader.onloadend = () => {
            const content = (reader.result as string) || '';

            this.log = content;
            this.onSearchInputChange();
          };
          reader.readAsText(blob);
        }
      });
    }
  }

  onSearchInputChange() {
    this.searchResults = this.findSearchResults(this.log, this.searchTerm);
    this.currentResultIndex = 0;
    this.updateHighlightedLog();
    this.applyHighlightStyles();
  }

  private findSearchResults(content: string, searchTerm: string): number[] {
    const results: number[] = [];

    if (searchTerm) {
      const regex = new RegExp(searchTerm, 'gi');
      let match;

      while ((match = regex.exec(content)) !== null) {
        results.push(match.index);
      }
    }

    return results;
  }

  private applyHighlightStyles() {
    const style = this.renderer.createElement('style');
    const css = `
      .highlight {
        background-color: yellow;
        font-weight: bold;
      }
      .current-result {
        border: 2px solid red;
        box-shadow: 0 0 10px red;
      }
    `;

    this.renderer.appendChild(style, this.renderer.createText(css));
    this.renderer.appendChild(this.elementRef.nativeElement, style);
  }

  scrollToResult(index: number) {
    const resultContainer = this.elementRef.nativeElement.querySelector(
      `.result-${index}`,
    );

    if (resultContainer) {
      resultContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  onSearchInputKeyPress(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.currentResultIndex =
        (this.currentResultIndex + 1) % this.searchResults.length;
      this.updateHighlightedLog();
      this.scrollToResult(this.currentResultIndex);
    }
  }

  private updateHighlightedLog() {
    if (this.searchResults.length > 0) {
      const result = this.searchResults[this.currentResultIndex];
      const match = this.log.substring(result, result + this.searchTerm.length);

      this.highlightedLog = this.sanitizer.bypassSecurityTrustHtml(
        this.highlightMatch(this.log, match, result),
      );
      this.cdr.detectChanges();
    } else {
      this.highlightedLog = this.sanitizer.bypassSecurityTrustHtml(this.log);
    }
  }

  private highlightMatch(
    content: string,
    match: string,
    index: number,
  ): string {
    return this.currentResultIndex > 0
      ? content.substring(0, index) +
          content
            .substring(index)
            .replace(
              match,
              `<span class="highlight result-${this.currentResultIndex}">${match}</span>`,
            )
      : content.replace(
          match,
          `<span class="highlight result-${this.currentResultIndex}">${match}</span>`,
        );
  }

  downloadFile() {
    const params = {
      integrationId: this.integrationId,
      runId: this.runId,
    };

    if (this.integrationId && this.runId) {
      this.runHistoriesService.getLogFile(params).subscribe((res) => {
        if (res && res.body) {
          const uint8Array = new Uint8Array(res.body.data);
          const blob = new Blob([uint8Array], {
            type: `text/log;charset=utf-8`,
          });

          saveAs(blob, `RCX-FX_${this.integrationId}_${this.runId}.log`);
        }
      });
    }
  }
}
