import { IsString, IsOptional, IsNumber, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class USDANutrientDto {
  @IsNumber()
  nutrientId: number;

  @IsString()
  nutrientName: string;

  @IsString()
  nutrientNumber: string;

  @IsString()
  unitName: string;

  @IsOptional()
  @IsNumber()
  value?: number;

  @IsOptional()
  @IsString()
  derivationCode?: string;

  @IsOptional()
  @IsString()
  derivationDescription?: string;
}

export class USDAFoodPortionDto {
  @IsNumber()
  id: number;

  @IsNumber()
  amount: number;

  @IsString()
  measureUnit: string;

  @IsOptional()
  @IsString()
  modifier?: string;

  @IsNumber()
  gramWeight: number;

  @IsOptional()
  @IsNumber()
  sequenceNumber?: number;
}

export class USDAFoodAttributeDto {
  @IsNumber()
  id: number;

  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  value?: string;
}

export class USDAFoodDto {
  @IsNumber()
  fdcId: number;

  @IsString()
  description: string;

  @IsString()
  dataType: string;

  @IsOptional()
  @IsString()
  gtinUpc?: string;

  @IsOptional()
  @IsString()
  publishedDate?: string;

  @IsOptional()
  @IsString()
  brandOwner?: string;

  @IsOptional()
  @IsString()
  brandName?: string;

  @IsOptional()
  @IsString()
  subbrandName?: string;

  @IsOptional()
  @IsString()
  ingredients?: string;

  @IsOptional()
  @IsString()
  marketCountry?: string;

  @IsOptional()
  @IsString()
  foodCategory?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => USDANutrientDto)
  foodNutrients?: USDANutrientDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => USDAFoodPortionDto)
  foodPortions?: USDAFoodPortionDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => USDAFoodAttributeDto)
  foodAttributes?: USDAFoodAttributeDto[];
}

export class USDASearchResultDto {
  @IsString()
  query: string;

  @IsNumber()
  totalHits: number;

  @IsNumber()
  currentPage: number;

  @IsNumber()
  totalPages: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => USDAFoodDto)
  foods: USDAFoodDto[];
}

export class USDASearchCriteriaDto {
  @IsString()
  query: string;

  @IsOptional()
  @IsString()
  dataType?: string; // 'Foundation', 'SR Legacy', 'Survey (FNDDS)', 'Branded'

  @IsOptional()
  @IsNumber()
  pageSize?: number; // 1-200, default 50

  @IsOptional()
  @IsNumber()
  pageNumber?: number; // default 1

  @IsOptional()
  @IsString()
  sortBy?: string; // 'dataType.keyword', 'lowercaseDescription.keyword', 'fdcId', 'publishedDate'

  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc'; // default 'asc'

  @IsOptional()
  @IsString()
  brandOwner?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tradeChannel?: string[];

  @IsOptional()
  @IsString()
  startDate?: string; // YYYY-MM-DD

  @IsOptional()
  @IsString()
  endDate?: string; // YYYY-MM-DD
}
