import { Storage } from '@core/data/storage';
import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateOccurenceDto, UpdateOccurenceDto } from '../dtos/occurrenceDTO';
import { IOccurrencesRepository } from '../repositories/occurences-repository.abstract';

@Injectable()
export class OccurencesService {
  constructor(
    private readonly occurrencesRepository: IOccurrencesRepository,
    private readonly storage: Storage,
  ) {}

  async create(data: CreateOccurenceDto) {
    const { files } = data;
    let fileNames: string[] = [];
    if (files.length > 0) {
      const filesOptions = await Promise.all(
        files.map(async (file) => {
          return await this.storage.uploadFile(file.filename, {
            folderName: data.userId,
          });
        }),
      );

      fileNames = filesOptions.map((file) => file.fileName);
    }

    const newOccurence = await this.occurrencesRepository.create({
      ...data,
      files: fileNames,
    });

    return newOccurence;
  }

  async findAll() {
    const occurrences = await this.occurrencesRepository.findAll();
    const parsedOccurrences = await Promise.all(
      occurrences.map(async (occurrence) => {
        const parsedFiles = await Promise.all(
          occurrence.files.map(async (file) => {
            const filePath = await this.storage.getFileUrl(file);
            return {
              filename: file,
              filePath,
            };
          }),
        );

        return {
          ...occurrence,
          files: parsedFiles,
        };
      }),
    );

    return parsedOccurrences;
  }

  async findOne(id: string) {
    const occurrence = await this.occurrencesRepository.findById(id);

    const parsedFiles = await Promise.all(
      occurrence.files.map(async (file) => {
        const filePath = await this.storage.getFileUrl(file);
        return {
          filename: file,
          filePath,
        };
      }),
    );

    return {
      ...occurrence,
      files: parsedFiles,
    };
  }

  async update(id: string, data: UpdateOccurenceDto) {
    const hasOccurrence = await this.occurrencesRepository.findById(id);

    if (!hasOccurrence) {
      throw new NotFoundException('Ocorrência não encontrada');
    }

    const updatedOccurrence = await this.occurrencesRepository.update(id, data);
    return updatedOccurrence;
  }

  async remove(id: string) {
    const hasOccurrence = await this.occurrencesRepository.findById(id);
    if (!hasOccurrence) {
      throw new NotFoundException('Ocorrência não encontrada');
    }

    return await this.occurrencesRepository.delete(id);
  }
}
