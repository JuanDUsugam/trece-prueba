import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Datos a insertar
  const rolesData = [
    { description: 'Super Admin'},
    { description: 'Genérico'},
  ];

  const usersData = [
    { name: 'Super Admin', username: 'Admin', email: 'admin@gmail.com', password: 'SuperAdmin1#', roleId:1}, 
  ];

  // Crear varios registros en la tabla `Role`
  const rolesCount = await prisma.roles.count();
  if( rolesCount === 0 ){
    const roles = await prisma.roles.createMany({
        data: rolesData,
        skipDuplicates: true, // Evita errores si ya existe un registro con el mismo valor único
      });
    
      console.log(`Se crearon ${roles.count} roles.`);

      const usersCount = await prisma.users.count();
      if( usersCount === 0 ){
        const users = await prisma.users.createMany({
            data: usersData,
            skipDuplicates: true, // Evita errores si ya existe un registro con el mismo valor único
          });
      
          console.log(`Se crearon ${users.count} roles.`);
      }else{
        console.log(`La tabla usuarios ya tiene registros.`);
      }
  }else{
    console.log(`La tabla roles ya tiene registros.`);
  }

  
  
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
