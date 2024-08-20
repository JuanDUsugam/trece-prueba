import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Roles } from '@prisma/client';

@Injectable()
export class RolesService {

  constructor(
    private readonly prisma: PrismaService, 
  ){}
  async create(createRoleDto: CreateRoleDto) {

    try {
      return await this.prisma.roles.create({
        data: createRoleDto,
      });
    }catch(error){
      this.handleDBErrors(error);
    }
    
  }

  async findAll() {
    return await this.prisma.roles.findMany();
  }

  async findOne(term: string) {

    let role: Roles;

    if( !isNaN(+term) ){
      role = await this.prisma.roles.findUnique({ where: { id: +term } });
    }
    else{
      role = await this.prisma.roles.findFirst({
        where: { description: term },
      });
    }

    if (!role) {
      throw new NotFoundException(`Role with description "${term}" not found`);
    }

    return role;
  }

  async update(id: string, updateRoleDto: UpdateRoleDto) {
    
    let role = await this.findOne(id);

    if (!role) 
      throw new NotFoundException(`Role with description "${id}" not found`);

    try {
      return await this.prisma.roles.update({
        where: { id : role.id },
        data: updateRoleDto,
      });
    } catch(error){
      this.handleDBErrors(error);
    }
  }

  async remove(id: string) {
    let role = await this.findOne(id);
    await this.prisma.roles.delete({
      where: { id: role.id },
    });
  }

  private handleDBErrors( error: any ): never {


    if ( error.code === 'P2002' ) 
      throw new BadRequestException( error.detail );

    console.log(error)

    throw new InternalServerErrorException('Please check server logs');

  }
}
