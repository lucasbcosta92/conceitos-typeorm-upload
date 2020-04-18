import { getCustomRepository, getRepository } from 'typeorm';

import Transaction from '../models/Transaction';
import AppError from '../errors/AppError';
import Category from '../models/Category';

import TransactionsRepository from '../repositories/TransactionsRepository';

interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
  }: Request): Promise<Transaction> {
    const categoryRepository = getRepository(Category);
    const transactionsRepository = getCustomRepository(TransactionsRepository);

    const { total } = await transactionsRepository.getBalance();

    if (type === 'outcome' && total < value) {
      throw new AppError('Insufficient cash balance');
    }

    const categoryExists = await categoryRepository.findOne({
      where: { title: category },
    });

    if (!categoryExists) {
      const newCategory = categoryRepository.create({
        title: category,
      });
      await categoryRepository.save(newCategory);
    }

    const categoryTransaction = await categoryRepository.findOne({
      where: { title: category },
    });

    if (categoryTransaction === undefined) {
      throw new AppError('Internal error');
    }

    const transaction = transactionsRepository.create({
      title,
      value,
      type,
      category_id: categoryTransaction.id,
    });

    await transactionsRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
