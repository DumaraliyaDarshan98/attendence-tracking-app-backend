import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Session, SessionDocument } from '../models/session.model';

@Injectable()
export class SessionsService {
  constructor(
    @InjectModel(Session.name) private sessionModel: Model<SessionDocument>,
  ) {}

  async createSession(
    userId: string,
    token: string,
    deviceInfo?: string,
    ipAddress?: string,
  ): Promise<SessionDocument> {
    const session = new this.sessionModel({
      userId: new Types.ObjectId(userId),
      token,
      deviceInfo,
      ipAddress,
      isActive: true,
      lastActivity: new Date(),
    });
    return session.save();
  }

  async findActiveSessionByUser(userId: string): Promise<SessionDocument | null> {
    return this.sessionModel
      .findOne({
        userId: new Types.ObjectId(userId),
        isActive: true,
      })
      .exec();
  }

  async findSessionByToken(token: string): Promise<SessionDocument | null> {
    return this.sessionModel
      .findOne({
        token,
        isActive: true,
      })
      .exec();
  }

  async invalidateSession(token: string): Promise<void> {
    await this.sessionModel
      .updateOne(
        { token },
        { isActive: false },
      )
      .exec();
  }

  async invalidateAllUserSessions(userId: string): Promise<void> {
    await this.sessionModel
      .updateMany(
        { userId: new Types.ObjectId(userId), isActive: true },
        { isActive: false },
      )
      .exec();
  }

  async updateLastActivity(token: string): Promise<void> {
    await this.sessionModel
      .updateOne(
        { token },
        { lastActivity: new Date() },
      )
      .exec();
  }

  async getAllUserSessions(userId: string): Promise<SessionDocument[]> {
    return this.sessionModel
      .find({
        userId: new Types.ObjectId(userId),
      })
      .sort({ createdAt: -1 })
      .exec();
  }
}

