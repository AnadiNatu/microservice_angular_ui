import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
    name : 'customCurrency'
})
export class CustomCurrencyPipe implements PipeTransform{

    transform(
        value: number, 
        currencyCode : string = 'USD',
        symbol : string = '$'
    ) : string{

        if(value == null || isNaN(value)){
            return `${symbol}0.00 ${currencyCode}`;
        }

        const fixedValue = value.toFixed(2);

        const formattedValue = fixedValue.replace(/\d(?=(\d{3})+\.)/g, '$&,');

        return `${symbol}${formattedValue}`;
    
    }
}