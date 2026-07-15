import { Pipe, PipeTransform } from '@angular/core';
import { LanguageService } from '../core/language.service';

@Pipe({ name: 'translate', standalone: true, pure: false })
export class TranslatePipe implements PipeTransform {
  constructor(private language: LanguageService) {}
  transform(value: string): string { return this.language.translate(value); }
}
