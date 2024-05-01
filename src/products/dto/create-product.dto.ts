import { Type } from "class-transformer"
import { IsNumber, IsPositive, IsString, Min, MinLength } from "class-validator"

export class CreateProductDto {
  @IsString()
  @MinLength(1)
  public name: string

  @IsNumber({
    maxDecimalPlaces: 2
  })
  @Min(0)
  @Type(() => Number)
  public price: number
}
