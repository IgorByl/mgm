import {
  ConflictException,
  Injectable,
  NotFoundException
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Model, Types } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import {
  OutboxEvent,
  OutboxEventDocument,
  OutboxEventType
} from '../schemas/outbox.schema';
import { CreateUserDto } from '../dtos/create-user.dto';
import { ListUsersDto } from '../dtos/list-users.dto';
import { UpdateUserDto } from '../dtos/update-user.dto';
import { User, UserDocument } from '../schemas/user.schema';
import { ListUsersResponse, UserResponse } from '../types/user.types';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(OutboxEvent.name)
    private readonly outboxModel: Model<OutboxEventDocument>
  ) {}

  async createUser(dto: CreateUserDto): Promise<UserResponse> {
    const session = await this.userModel.db.startSession();

    try {
      let response: UserResponse | null = null;

      await session.withTransaction(async () => {
        const created = await this.userModel.create([dto], { session });
        response = this.convertToResponse(created[0]);
        await this.insertOutboxEvent(session, 'UserCreated', response);
      });

      if (!response) {
        throw new Error('Failed to create user');
      }

      return response;
    } catch (err: unknown) {
      if (this.isDuplicateKeyError(err)) {
        throw new ConflictException('Email already exists');
      }

      throw err;
    } finally {
      await session.endSession();
    }
  }

  async listUsers(query: ListUsersDto): Promise<ListUsersResponse> {
    const limit = query.limit!;
    const filter: Record<string, unknown> = {};

    if (query.after) {
      filter._id = { $gt: new Types.ObjectId(query.after) };
    }

    const users = await this.userModel
      .find(filter)
      .sort({ _id: 1 })
      .limit(limit + 1)
      .exec();

    const hasNext = users.length > limit;
    const items = hasNext ? users.slice(0, limit) : users;
    const nextCursor = hasNext
      ? items[items.length - 1]._id.toString()
      : undefined;

    return {
      items: items.map((user) => this.convertToResponse(user)),
      nextCursor
    };
  }

  async getUser(id: string): Promise<UserResponse> {
    const user = await this.userModel.findById(id).exec();

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.convertToResponse(user);
  }

  async updateUser(id: string, dto: UpdateUserDto): Promise<UserResponse> {
    const session = await this.userModel.db.startSession();

    try {
      let response: UserResponse | null = null;

      await session.withTransaction(async () => {
        const user = await this.userModel
          .findByIdAndUpdate(id, dto, {
            new: true,
            runValidators: true,
            session
          })
          .exec();

        if (!user) {
          throw new NotFoundException('User not found');
        }

        response = this.convertToResponse(user);
        await this.insertOutboxEvent(session, 'UserUpdated', response);
      });

      if (!response) {
        throw new Error('Failed to update user');
      }

      return response;
    } catch (err: unknown) {
      if (this.isDuplicateKeyError(err)) {
        throw new ConflictException('Email already exists');
      }

      throw err;
    } finally {
      await session.endSession();
    }
  }

  async deleteUser(id: string): Promise<UserResponse> {
    const session = await this.userModel.db.startSession();

    try {
      let response: UserResponse | null = null;

      await session.withTransaction(async () => {
        const user = await this.userModel
          .findByIdAndDelete(id, { session })
          .exec();

        if (!user) {
          throw new NotFoundException('User not found');
        }

        response = this.convertToResponse(user);

        await this.insertOutboxEvent(session, 'UserDeleted', response);
      });
      if (!response) {
        throw new Error('Failed to delete user');
      }

      return response;
    } finally {
      await session.endSession();
    }
  }

  private async insertOutboxEvent(
    session: ClientSession,
    eventType: OutboxEventType,
    payload: UserResponse
  ): Promise<void> {
    await this.outboxModel.create(
      [
        {
          eventId: uuidv4(),
          eventType,
          aggregateId: payload.id,
          payload,
          status: 'pending',
          retryCount: 0,
          createdAt: new Date()
        }
      ],
      { session }
    );
  }

  private convertToResponse(user: UserDocument): UserResponse {
    return {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      createdAt: user.createdAt
        ? user.createdAt.toISOString()
        : new Date().toISOString()
    };
  }

  private isDuplicateKeyError(err: unknown): boolean {
    if (!err || typeof err !== 'object') {
      return false;
    }
    const code = (err as { code?: number }).code;
    return code === 11000;
  }
}
