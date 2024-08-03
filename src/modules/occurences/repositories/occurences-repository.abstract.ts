import { Occurrence } from '@prisma/client';
import { CreateOccurenceDto, UpdateOccurenceDto } from '../dtos/occurrenceDTO';

export abstract class IOccurrencesRepository {
  abstract create(data: CreateOccurenceDto): Promise<Occurrence>;
  abstract update(id: string, data: UpdateOccurenceDto): Promise<Occurrence>;
  abstract findAll(): Promise<Occurrence[]>;
  abstract findById(id: string): Promise<Occurrence | null>;
  abstract delete(id: string): Promise<void>;
}
