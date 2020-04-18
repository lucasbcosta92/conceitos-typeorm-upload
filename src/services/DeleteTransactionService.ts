import { getCustomRepository } from 'typeorm';

import TransactionsRepository from '../repositories/TransactionsRepository';

import AppError from '../errors/AppError';

interface Request {
  id: string;
}

class DeleteTransactionService {
  public async execute({ id }: Request): Promise<void> {
    const transactionsRepository = getCustomRepository(TransactionsRepository);

    const findTransaction = await transactionsRepository.findOne({
      where: { id },
    });

    if (!findTransaction) {
      throw new AppError('Transaction does not existe');
    }

    await transactionsRepository.delete(id);
  }
}

export default DeleteTransactionService;
