import { Component, OnInit, Input } from '@angular/core';
import { ImageHelperService } from '@core/services/image-helper.service';
import { getFiledNameByTensorDataType } from '@shared/utils/field-name-by-tensor-data-type';
import { fromSnakeToCamel } from '@shared/utils/from-snake-to-camel';

@Component({
  selector: 'hs-tensor-image-list',
  templateUrl: './tensor-image-list.component.html',
  styleUrls: ['./tensor-image-list.component.scss'],
})
export class TensorImageListComponent implements OnInit {
  imagesCount: number;
  imageWidth: number;
  imageHeight: number;
  imagePixelsArray: number[][];

  readonly elementsForRGBA = 4;

  constructor(private imageHelper: ImageHelperService) {}

  @Input()
  set tensorProto(tensorProto) {
    let dim;
    try {
      dim = tensorProto.tensorShape.dim;
      const [imagesCount, imageWidth, imageHeight] = dim;
      this.imagesCount = imagesCount.size;
      this.imageWidth = imageWidth.size;
      this.imageHeight = imageHeight.size;

      const pixels = this.getValue(tensorProto);
      let arrayOfRGBAPixels;

      try {
        arrayOfRGBAPixels = this.imageHelper.transformToRGBA({
          pixels,
          imageWidth: this.imageWidth,
          imageHeight: this.imageHeight,
          batchSize: this.imagesCount,
        });
        try {
          const RGBAPixels =
            this.imageWidth * this.imageHeight * this.elementsForRGBA;
          this.imagePixelsArray = this.partitionArrayBySize(
            arrayOfRGBAPixels,
            RGBAPixels
          );
        } catch (error) {
          throw Error('Cant split data');
        }
      } catch (err) {
        console.dir(err);
      }
    } catch (error) {
      throw Error('Did not found dim property in tensorShape');
    }
  }

  ngOnInit(): void {}

  private getValue(tensorProto): any {
    const field = fromSnakeToCamel(
      getFiledNameByTensorDataType(tensorProto.dtype)
    );
    const data = tensorProto[field];
    return data;
  }

  private partitionArrayBySize(arr, size): number[][] {
    let offset = 0;
    const arrLength = arr.length;
    const res = [];

    while (offset < arrLength) {
      res.push(arr.slice(offset, offset + size));
      offset += size;
    }

    return res;
  }
}
