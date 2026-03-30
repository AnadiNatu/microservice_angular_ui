import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'customCurrency'
})
export class CustomCurrencyPipe implements PipeTransform {
  transform(value: number, currencyCode: string = 'USD', symbol: string = '$'): string {
    if (value == null) return '';
    
    const formattedValue = value.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
    return `${symbol}${formattedValue} ${currencyCode}`;
  }
}
