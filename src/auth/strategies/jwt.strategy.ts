import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";


import { ExtractJwt, Strategy } from "passport-jwt";
import { PrismaService } from "src/prisma/prisma.service";


@Injectable()
export class JwtStrategy extends PassportStrategy( Strategy ){

    constructor(
        private readonly prismaService: PrismaService,

        configService: ConfigService,
    ){
        super({
             secretOrKey: configService.get('JWT_SECRET'),
             jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        });
    }

    async validate(payload: any): Promise<any> {
        const { id } = payload;

        const user = await this.prismaService.users.findUnique({
            where: {
                id,
            },
        });

        if ( !user ) 
            throw new UnauthorizedException('Token not valid')
            
        if ( !user.status ) 
            throw new UnauthorizedException('User is inactive, talk with an admin');
        

        return user;
    }
}