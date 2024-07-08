import * as bcrypt from 'bcrypt';
import { SelectQueryBuilder } from 'typeorm';

export const hashUtils = {
  async hash(data: string) {
    const saltRounds = 10;
    const salt = await bcrypt.genSalt(saltRounds);
    return await bcrypt.hash(data, salt);
  },

  async compare(ref: string, hash: string) {
    return await bcrypt.compare(ref, hash);
  },
};

export async function applyPaginationAndFilters<T>(
  queryBuilder: SelectQueryBuilder<T>,
  paginationParams: PaginationParams,
  filterParams: FilterParams,
  entityAlias: string,
) {
  const { fromDate, toDate, ...filters } = filterParams;

  if (fromDate) {
    const fromDateObj = fromDate ? new Date(fromDate) : undefined;
    queryBuilder.andWhere(`${entityAlias}.createdAt >= :fromDate`, {
      fromDate: fromDateObj,
    });
  }

  if (toDate) {
    const toDateObj = toDate
      ? new Date(new Date(toDate).getTime() + 24 * 60 * 60 * 1000)
      : undefined;
    queryBuilder.andWhere(`${entityAlias}.createdAt <= :toDate`, {
      toDate: toDateObj.toISOString(),
    });
  }

  Object.keys(filters).forEach((key) => {
    const value = filters[key];

    if (value) {
      queryBuilder.andWhere(`${entityAlias}.${key} LIKE :${key}`, {
        [key]: `%${value}%`,
      });
    }
  });

  const totalCount = await queryBuilder.getCount();

  let { page, size } = paginationParams;

  size = size ?? 10;
  page = page && page > 0 ? page : 1;
  const data = await queryBuilder
    .skip((page - 1) * size)
    .take(size)
    .getMany();

  return {
    object: data,
    total: totalCount,
    size,
    page,
  };
}
