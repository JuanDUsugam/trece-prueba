import { BadRequestException, CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";

import { Observable } from "rxjs";
import { Users } from "@prisma/client";


import { PrismaService } from "src/prisma/prisma.service";
import { META_ROLES } from "../decorators/role-protected.decorator";



@Injectable()
export class UserRoleGuard implements CanActivate{

    constructor(
        private readonly prismaService: PrismaService,

        private readonly reflector: Reflector
      ) {}

    canActivate(
        context: ExecutionContext
    ): boolean | Promise<boolean> | Observable<boolean> {

        const validRoles: number[] = this.reflector.get( META_ROLES , context.getHandler() )

        if ( !validRoles ) return true;
        if ( validRoles.length === 0 ) return true;

        const req = context.switchToHttp().getRequest();
        const user = req.user as Users;
       

        if ( !user ) 
            throw new BadRequestException('User not found');
          
        if (validRoles.includes(user.roleId)) {
          return true;
        }
          
          throw new ForbiddenException(
            `User ${ user.name } need a valid role: [${ validRoles }]`
          );
    }
    
}