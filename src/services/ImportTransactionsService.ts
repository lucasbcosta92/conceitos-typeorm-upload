import path from 'path';
import csv from 'csvtojson';
import fs from 'fs';

import AppError from '../errors/AppError';
import Transaction from '../models/Transaction';
import uploadConfig from '../config/upload';
import CreateTransactionService from './CreateTransactionService';

interface Request {
  transactionsFilename: string;
}

class ImportTransactionsService {
  async execute({ transactionsFilename }: Request): Promise<Transaction[]> {
    const transactions: Transaction[] = [];
    const createTransation = new CreateTransactionService();

    const csvFilePath = path.join(uploadConfig.directory, transactionsFilename);

    const csvFileExists = await fs.promises.stat(csvFilePath);

    if (!csvFileExists) {
      throw new AppError('File not Found');
    }

    const transactionsFile = await csv().fromFile(csvFilePath);

    for (const transaction of transactionsFile) {
      const lineCSV = await createTransation.execute(transaction);
      transactions.push(lineCSV);
    }

    await fs.promises.unlink(transactionsFilename);

    return transactions;
  }
}

export default ImportTransactionsService;
