import { BadRequestException, Injectable, 
  InternalServerErrorException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { CreateUserDto, LoginUserDto } from './dto';
import { PrismaService } from 'src/prisma/prisma.service';

import * as bcrypt from 'bcrypt';
import { JwtPayload } from './interfaces';
import { Users } from "@prisma/client";
import { UpdateUserDto } from './dto/update-user.dto';
import { RegisterUserDto } from './dto/register-user.dto';
 

@Injectable()
export class AuthService {

  constructor(
    private readonly prismaService: PrismaService,

    private readonly jwtService: JwtService,
  ){}
  async create(createUserDto: CreateUserDto) {
    
    try{
      const { password, ...userData } = createUserDto;
      const data = {
        ...userData,
        password: bcrypt.hashSync( password, 10 )
      }
      const user =  await this.prismaService.users.create({
        data: data,
      });

      delete user.password;
      return {
        ...user,
        token: this.getJwtToken({ id: user.id })
      };
    }catch( error ){
      this.handleDBErrors( error );
    }

  }

  async register(registerUserDto: RegisterUserDto) {
    
    try{
      const { password, ...userData } = registerUserDto;
      const data = {
        ...userData,
        password: bcrypt.hashSync( password, 10 ),
        roleId: 2
      }
      const user =  await this.prismaService.users.create({
        data: data,
      });

      delete user.password;
      return {
        ...user,
        token: this.getJwtToken({ id: user.id })
      };
    }catch( error ){
      this.handleDBErrors( error );
    }

  }

  async login(loginUserDto: LoginUserDto) {
    const { password, email } = loginUserDto;
    const user = await this.prismaService.users.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        password: true,
      },
    });

    if ( !user ) 
      throw new UnauthorizedException('Credentials are not valid (email)');

    if ( !bcrypt.compareSync( password, user.password ) )
      throw new UnauthorizedException('Credentials are not valid (password)');

    
    return {
      ...user,
      token: this.getJwtToken({ id: user.id })
    };
  }

  async findAll() {
    return await this.prismaService.users.findMany();
  }

  async findOne(term: string) {
    let user : Users;
    if( !isNaN(+term) ){
      user = await this.prismaService.users.findUnique({
        where: { id: +term }
      })
    }else{
      user = await this.prismaService.users.findFirst({
        where: { 
          OR: [
            { email: term },
            { username: term },
          ]
         }
      });
    }

    

    if ( !user ) 
      throw new NotFoundException(`Product with ${ term } not found`);
    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    
    let user = await this.findOne(id);

    if (updateUserDto.password) {
      updateUserDto.password = bcrypt.hashSync(updateUserDto.password, 10);
    }

    const userToUpdate = await this.prismaService.users.update({
      where: { id: user.id},
      data: updateUserDto,
    });

    return userToUpdate;
  }

  async remove(id: string) {
    const user = await this.findOne(id);
    await this.prismaService.users.delete({
      where: {
        id: user.id,
      },
    });
  }

  private getJwtToken( payload: JwtPayload ) {

    const token = this.jwtService.sign( payload );
    return token;

  }

  private handleDBErrors( error: any ): never {


    if ( error.code === 'P2002' ) 
      throw new BadRequestException( error.detail );

    console.log(error)

    throw new InternalServerErrorException('Please check server logs');

  }

}
