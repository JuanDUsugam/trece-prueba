import { IsBoolean, IsOptional, IsString, MinLength } from "class-validator";



export class CreateRoleDto {

    @IsString()
    @MinLength(2)
    description: string;

    @IsBoolean()
    @IsOptional()
    status?: boolean;


}
