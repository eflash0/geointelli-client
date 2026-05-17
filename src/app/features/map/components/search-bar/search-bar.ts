import { Component, EventEmitter, OnDestroy, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, filter } from 'rxjs/operators';
import { SearchMode, SearchQuery } from '../../../../models/search-query';
import { AddressService } from '../../../../core/services/address.service';

@Component({
  selector: 'app-search-bar',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './search-bar.html',
  styleUrl: './search-bar.css'
})
export class SearchBar implements OnDestroy {
  @Output() search = new EventEmitter<SearchQuery>();

  mode: SearchMode = 'folio';
  value = '';
  suggestions: string[] = [];
  showSuggestions = false;

  private input$ = new Subject<string>();
  private sub: Subscription;

  constructor(private addressService: AddressService) {
    this.sub = this.input$.pipe(
      debounceTime(350),               // wait 350ms after user stops typing
      distinctUntilChanged(),          // ignore if same value
      filter(v => v.trim().length >= 3 && this.mode === 'address'), // min 3 chars, address mode only
      switchMap(v => this.addressService.suggest(v)) // cancel previous request
    ).subscribe({
      next: (results) => {
        this.suggestions = results;
        this.showSuggestions = results.length > 0;
      },
      error: () => {
        this.suggestions = [];
        this.showSuggestions = false;
      }
    });
  }

  onInput(): void {
    if (this.mode === 'folio') {
      this.suggestions = [];
      this.showSuggestions = false;
      return;
    }
    this.input$.next(this.value);
  }

  selectSuggestion(suggestion: string): void {
    this.value = suggestion;
    this.showSuggestions = false;
    this.suggestions = [];
    this.submit();
  }

  submit(): void {
    if (!this.value.trim()) return;
    this.showSuggestions = false;
    this.search.emit({ mode: this.mode, value: this.value.trim() });
  }

  clear(): void {
    this.value = '';
    this.suggestions = [];
    this.showSuggestions = false;
  }

  switchMode(mode: SearchMode): void {
    this.mode = mode;
    this.clear();
  }

  get placeholder(): string {
    return this.mode === 'folio'
      ? 'Enter folio number…'
      : 'Start typing an address…';
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }
}