// tslint:disable:variable-name
import {
  Component,
  Input,
  forwardRef,
  Output,
  EventEmitter,
} from '@angular/core';
import {
  ControlValueAccessor,
  NG_VALUE_ACCESSOR,
  NgModel,
} from '@angular/forms';

const noop = (_?: any) => {};

@Component({
  selector: 'hydro-input-text',
  templateUrl: './input-text.component.html',
  styleUrls: ['./input-text.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      // tslint:disable-next-line:no-forward-ref
      useExisting: forwardRef(() => InputTextComponent),
      multi: true,
    },
  ],
})
export class InputTextComponent implements ControlValueAccessor {
  get value(): any {
    return this._value;
  }

  set value(value: any) {
    if (value !== this._value) {
      this._value = value;
      this.onChange(value);
    }
  }

  @Input() public inputClass: string = '';
  @Input() public label: string;
  @Input() public postfix: string = '';
  @Input() public name: string;
  @Input() public iconName: string;
  @Input() public iconClass: string;
  @Input() public formErrors: string;
  @Input() public wrapClassName: string = '';
  @Input() public disabled: string;
  @Input() public readonly: string;
  /**
   * true show icon next to input
   * false show icon over on input
   **/
  @Input() public iconAsSibling: boolean;
  @Input() public placeholder: string;
  @Input() public errors: any;
  /** left of right */
  @Input() public iconDirection: string;
  @Output() iconClick = new EventEmitter<NgModel>();
  protected _value: any;
  protected onChange: (_: any) => void = noop;
  protected onTouched: () => void = noop;

  public iconClickHandle(model: NgModel) {
    this.iconClick.emit(model);
  }

  public writeValue(value: any) {
    if (value !== this._value) {
      this._value = value;
    }
  }

  public registerOnChange(fn: (_: any) => void) {
    this.onChange = fn;
  }

  public registerOnTouched(fn: () => void) {
    this.onTouched = fn;
  }

  public hasErrors(input: NgModel): boolean {
    return input.touched && this.errors != null;
  }
}
