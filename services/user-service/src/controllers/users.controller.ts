import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query
} from '@nestjs/common';
import { CreateUserDto } from '../dtos/create-user.dto';
import { ListUsersDto } from '../dtos/list-users.dto';
import { UpdateUserDto } from '../dtos/update-user.dto';
import { UserIdParamDto } from '../dtos/user-id-param.dto';
import { ListUsersResponse, UserResponse } from '../types/user.types';
import { UsersService } from '../services/users.service';

@Controller('user')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  createUser(@Body() dto: CreateUserDto): Promise<UserResponse> {
    return this.usersService.createUser(dto);
  }

  @Get()
  listUsers(@Query() query: ListUsersDto): Promise<ListUsersResponse> {
    return this.usersService.listUsers(query);
  }

  @Get(':id')
  getUser(@Param() params: UserIdParamDto): Promise<UserResponse> {
    return this.usersService.getUser(params.id);
  }

  @Patch(':id')
  updateUser(
    @Param() params: UserIdParamDto,
    @Body() dto: UpdateUserDto
  ): Promise<UserResponse> {
    return this.usersService.updateUser(params.id, dto);
  }

  @Delete(':id')
  deleteUser(@Param() params: UserIdParamDto): Promise<UserResponse> {
    return this.usersService.deleteUser(params.id);
  }
}
